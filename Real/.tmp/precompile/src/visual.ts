/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
module powerbi.extensibility.visual.chart774830980A704407B8EAE534A05D1ED8  {

    //Interface for TILES on Default LOAD
    interface Tile {
        col: number,
        head: string,
        id: string,
        value: number,

        //Below is the identity element to interact with other visuals
        identity:powerbi.visuals.ISelectionId
    }

    //Its Rendering form
    interface ViewModel {
        Tiles: Tile[]    //Stores a Tile type array
    }
    
    //Below interface is used to update values in runtime and also to make weighted connections
    interface Connection {
        Recruit:string,
        Develop:string,
        Launch:string,
        grow:string,
        value:number
    }

    //Below is a interface to store summarized value at the Column level to get ratio for Weighted lines
    interface Sum {
        Recruit:number;
        Develop:number;
        Launch:number;
        grow:number;
    }

    export class Visual implements IVisual {

        //Property declaration
        private host: IVisualHost;
        private Container: d3.Selection<SVGElement>;
        private row: d3.Selection<SVGElement>;
        private target;
        private Data: DataView;
        private newCol: d3.Selection<SVGAElement>;

        //Basically used to reset the visual and track Global calculation
        private Clicked:string;
        private clickedValue:number;
        private clickedColor:number;
        private clickCount:number;
        private ClickedNow:string;

        //Defining global connection instance
        //Establishing connection b/w unique identities
        // private ConnectionIdentity: Connection[];
        private ConnectionIdentityBackwards: Connection[];

        //Making a ViewValue to set values on the tiles that are not exactly on tthe place
        private ViewValue:Connection[];

        //For Interaction and Selection Changes
        private selectionManager : ISelectionManager;

        //For Summation of values to create weighted lines
        private Thickness : Sum;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.target = options.element;
            //creating an Container element
            this.Container = d3.select(this.target).append("div").classed('container-fluid', true);
            this.row = d3.select(".container-fluid").append("div").classed('row', true).attr("id", "row1");

            //Appending the values heading now
            this.row.append("div").classed("col-3", true).attr("id", "col-1").append("h5").text("Recruit").classed("head head1", true);
            this.row.append("div").classed("col-3", true).attr("id", "col-2").append("h5").text("Develop").classed("head head2", true);
            this.row.append("div").classed("col-3", true).attr("id", "col-3").append("h5").text("Launch").classed("head head3", true);
            this.row.append("div").classed("col-3", true).attr("id", "col-4").append("h5").text("Grow").classed("head head4", true);

            //Initialising Connection Identity
            // this.ConnectionIdentity = [];

            //Initialising backward Connection Identity
            this.ConnectionIdentityBackwards=[];

            //Initializing ViewValue
            this.ViewValue=[];

            //Initializing the selection Manager to filter next data points
            this.selectionManager= this.host.createSelectionManager();

            //Initializig the interface to calculate thickness of the lines
            this.Thickness={
                Recruit:0,
                Develop:0,
                Launch:0,
                grow:0
            }

            //Initializing clickcount to zero
            this.clickCount=0;
        }

        //Utility function to remove special characters / ID making function
        public removeSpl(x: string): string {
            x = x.replace(/[&\/\\#,+()$~%.'":*?<>{}\s]/g, '');
            return x;
        }

        //Utility function to create chart
        public createChart(Tile:Tile) {
            //Defining special color scheme
            var color;
            var stroke
            switch (Tile.col) {
                case 1:
                    color = "white";
                    stroke = "#001B90";
                    break;
                case 2:
                    color = "white";
                    stroke = "#3E54A9";
                    break;
                case 3:
                    color = "white";
                    stroke = "#00508E";
                    break;
                case 4:
                    color = "white";
                    stroke = "#007AE0";
                    break;
                default:
                    color = "white";
                    stroke = "";
            }
            //Storing the context
            let Context=this;
            //This is the column used to recognise specific chart
            let newCol = d3.select("#col-" + Tile.col).append("div").classed("SVGcontainer inactive", true)
                .attr("id", Tile.id).attr("style", "padding:10px;");

            //making new chart
            let block = newCol.append("div").classed("row row2",true)
                .style({
                    "border":"solid 2px "+stroke
                }).on("click",function(){
                    Context.selectionManager.select(Tile.identity);
                    Context.Clicked=Tile.id;
                    Context.clickedValue=Tile.value;
                    Context.clickedColor=stroke;
                }); //The New Mockup design longs for perfect design that will be easy to achieve with divs than svg

            let leftSide=block.append("div").classed("col-7",true).style({
                "-webkit-box-shadow": "0px 0px 0px 1.5px"+stroke,
                "-moz-box-shadow":"0px 0px 0px 1.5px"+stroke,
                "box-shadow":"0px 0px 0px 1.5px"+stroke
                });
            let rightSide=block.append("div").classed("col-5",true).style({
                "-webkit-box-shadow": "0px 0px 0px 1.5px"+stroke,
                "-moz-box-shadow":"0px 0px 0px 1.5px"+stroke,
                "box-shadow":"0px 0px 0px 1.5px"+stroke
                })
            .style({
                "background-color":stroke,
                "color":color
            });
            leftSide.text(Tile.head).append('br');
            leftSide.append('br');
            //appending progress bars
            //1st Progress bar
            let ProgTitle1=leftSide.append("div").classed("progtitle",true).text("Of Selected");
            ProgTitle1.append("div").classed("metric",true).attr({
                style:"float:right"
            }).text("40%");
            ProgTitle1.append("div").classed("progress",true).append("div").classed("progress-bar ofselected",true).attr({
                role:"progressbar",
                'aria-valuenow':"40",
                'aria-valuemin':"0",
                'aria-valuemax':"100",
                style:"width:40%"
            });
            //ProgTitle1.append('br');
            //Second one
            let ProgTitle2=leftSide.append("div").classed("progtitle",true).text("Total Value");
            ProgTitle2.append("div").classed("metric",true).attr({
                style:"float:right"
            }).text("80%");
            ProgTitle2.append("div").classed("progress",true).append("div").classed("progress-bar total",true).attr({
                role:"progressbar",
                'aria-valuenow':"40",
                'aria-valuemin':"0",
                'aria-valuemax':"100",
                style:"width:80%; background-color:"+stroke
            });
            ProgTitle2.append('br');
            rightSide.html('<img src=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfiBhYHNiYzNO/HAAABiElEQVQ4y52TzUtUURiHnzs4juFGDQIXRmDUJsJNUEaMIQmiLSQwKDe18A/wDzCIVhItZiG0c1sQgtTCRRA2tXEjxTS7qFnYpkWUkPj1tMi595zxhkO/1ft73o/zHs698P+yaLFt7oArbrvtigMtfNnfR7hd1m2qblfKS9byOE4bajrltyJ+G6ADgLPRfv32MEofVUSSlA9mJ0wGc1Yd8Zuq+z5wNshMZA0F11J81a9B0aifD6M1C+G1u12w5rrzDkd7V7zvB2su2P23sgDgOBXK7FKkTGd0n076OGCXMhXHm9MXo5lDfg/clO8Ctwg4Y6wXTrp1GD91qiU7g9UI/PChJW+45LJznvCmH6N8lXSaasOLPvZn6vd84wWfBxVbBObAS762Vb8876fMhg0vvWeeVr2bmfAx3jOW+91fZz0zBR7xik0AvnAut6FIiR0ANnnSfItTjjnohvka8o6XPXn0N/pnQ7hSOzILk4if4RrDXOE0PSTs0KBBnWfJ2+NHdthrcmxZO/oD9O8Vy6xKvwMAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDYtMjJUMDc6NTQ6MzgrMDI6MDAf3EwXAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTA2LTIyVDA3OjU0OjM4KzAyOjAwboH0qwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=>');
            rightSide.append("div").text(this.getFormatted(Tile.value));

            //Appending the bookmark icon
            if(Tile.col!=1){
                block.append("span").classed("hidden",true).style({
                    position:'absolute',
                    top:'0px',
                    right:'1px',
                    'z-index':'500'
                }).html('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFsSURBVDhP1ZJPK0RRGMbvjEaIkYWdnZWUlAU2PoDiE9j6s/AJlNixsVGy0Cg7W5L1EKXZTcmfZGE3SysL6V6/59xnroUhmqZ46td7z/O85z33zpzo/yiO4wsY8rJ5aRhUWz40SZJe1iMwDEXbP5eGgYauut7AAZTgAS5hiYPaveVr0ZSjeQ4moAZr8hwrz+PpoDd4ghlHn0VzHw0n1IRaoYxSG/6meBvqk3jeprQ5SoU5ALdpS2i6tl///C3sdQifSe2CZwgiP4UeZdpUhHtnQaz3Qoh41tCa/Xnb8s9C84fKkNNpHYTnwbJYl7xPG6dhEjR0wbb8atqdivW+o/AJ3RjHaRTCR0rBWQHG8LIrBf3wql6J5x1K9ucFYeRhkzB204qjTHj1oUfueYFFx41Fw5Q3abAO6HSkTG82DrpSVzDo6HsxSPdxFg7hjnWZWgFd7GXIPt9bficG6o/L3lRqemgjtXLorpd/XlH0DnXrF5UJ4h+DAAAAAElFTkSuQmCC">');
                block.append("span").classed("visible",true).style({
                    position:'absolute',
                    top:'0px',
                    right:'1px',
                    'z-index':'500'
                }).html('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFGSURBVDhP7ZK/K4VxGMXf/Eq37mAxka5ylztZyI8/A9ksd7GZ/RVSshqUhSw2iwxik0VKFhExEtF9X5/zfA/lhiwGdU99+j7nnOf73u57b9bSP1Ge50OwUBRFj6MPkferg15H34ulMqzAC4w4Vl6DAVv5OXiERT60w/FnUU7ABQsF575j5UvOGjCvTA9hvnF+CNVYfhfBLDxrQWJeVc7Yyfya0shP4wLC7qU08nsYi4JhCnJ3Iex6lIj5zLHybcfKjx2H8HoFwyrGZZyH8HccJV+sMq9xLkP8EJwVaMSyhb/kGFSvhVG4TlUSPr52s6j0GnbTVhL+BCpeSSLogyPvhPCbUFOPbYNJ/EGUFn4LyvGQZtG3U+o/dpvWk/AP8GQbwp/DjK/+LPZLLNdhB/Q+9QDpCjaw0/D1/+834nI3dNm29KfKsjf/eNyL+3VsLQAAAABJRU5ErkJggg==">');
            }
            //Fixing a hidden input fields  to add up values of more than one path joining it
            d3.select("#"+Tile.id).append("input").attr({'type':'hidden','value':'0','class':'runtime'});

            //Fixing another hidden input fields  to store the default values
            d3.select("#"+Tile.id).append("input").attr({'type':'hidden','value':Tile.value,'class':'default'});
        }

        //create line function()
        // public createLine(id1: string, id2: string, lineId: string) {

        //     //Finding the color of the line
        //     let color = $("#"+id1).find(".col-4").css("background-color");
        //     var row = d3.select("#row1").append("svg").attr("class", "connecting").append("path").attr({ "id": lineId, "fill": "transparent","class":"path","stroke":color});
        //     var line = $('#'+lineId);
        //     var div1 = $('#' + id1);
        //     var div2 = $('#' + id2);

        //     //Center for the first block
        //     var x1 = div1.offset().left + (div1.width() / 2);
        //     var y1 = div1.offset().top + (div1.height() / 2);

        //     //Line to of Second block
        //     var x2l = div2.offset().left;
        //     var x2 = div2.offset().left + (div1.width() / 2);
        //     var y2 = div2.offset().top + (div2.height() / 2);

        //     //First breakpoint horizontal
        //     var hor1 = div1.offset().left + (div1.width());

        //     //Creating curve from div1 to div 2
        //     var path = "M" + x1 + " " + y1; //selecting centroid of div1
        //     path += " H " + hor1;   //creating horizontal line to first break point
        //     path += "M" + hor1 + " " + y1;  //shifing the center to the end point
        //     path += " L " + x2l + " " + y2; //Line
        //     path += "M" + x2l + " " + y2    //Centershift
        //     path += " L " + x2 + " " + y2;  //Final lining
        //     line.attr("d", path);
        // }

        //Create Backward line function
        public createLineBackward(id1: string, id2: string, lineId: string) {
            //Commenting major part of code due since lines are not required
            let color = $("#"+id1).find(".col-5").css("background-color");
            
            var row = d3.select("#row1").append("svg").attr("class", "connecting").append("path").attr({ "id": lineId,"fill": "none","class":"path","stroke":color,"stroke-width":"2"})
            var line = $('#'+lineId);
            var div1 = $('#' + id1).find(".row2");
            var div2 = $('#' + id2).find(".row2");

            //Making hover remove opacity
            $("#"+id1).find(".row").on( "mouseenter",function(){
                $("#"+lineId).parent().animate({
                    opacity:'1'
                },100)
            }).on( "mouseleave",function(){
                $("#"+lineId).parent().animate({
                    opacity:'0.06'
                },100)
            });

            //Show hide funtionality
           $("#"+id1).find(".hidden").click(function(){
               //To stop bubbling propagation
                event.stopPropagation();
                $("#"+id1).find(".row").unbind("mouseleave").unbind("mouseenter");
                $("#"+lineId).parent().css("opacity","1");
                $(this).hide();
                $(this).parent().find('.visible').show();
            })

            $("#"+id1).find(".visible").click(function(){
                //To stop bubbling propagation
                 event.stopPropagation();
                 $("#"+id1).find(".row").on( "mouseenter",function(){
                    $("#"+lineId).parent().animate({
                        opacity:'1'
                    },100)
                }).on( "mouseleave",function(){
                    $("#"+lineId).parent().animate({
                        opacity:'0.06'
                    },100)
                });
                $(this).hide();
                $(this).parent().find('.hidden').show();
             })


            //Center for the first block
            var x1 = div1.offset().left + (div1.width() / 2);
            var y1 = div1.offset().top + (div1.height() / 2);

            //Line to of Second block
            var x2l = div2.offset().left+(div2.width()) ;
            var x2 = div2.offset().left + (div1.width() / 2);
            var y2 = div2.offset().top + (div2.height() / 2);

            //First breakpoint horizontal
            var hor1 = div1.offset().left;

            //Creating curve from div1 to div 2
            var path = "M" + x1 + " " + y1; //selecting centroid of div1
            path += " H " + hor1;   //creating horizontal line to first break point
            //path += "M" + hor1 + " " + y1;  //shifing the center to the end point
            path += " L " + x2l + " " + y2; //Line
            //path += "M" + x2l + " " + y2    //Centershift
            path += " L " + x2 + " " + y2;  //Final lining

            line.attr("d", path);
        }

        //Data inserting code
        private getViewModel(options: VisualUpdateOptions): ViewModel {
            //Fetching data
            let dv = options.dataViews;

            //Creating unique identities
            //Making a viewmodel instance
           
            let DefaultTiles: ViewModel = {
                Tiles: []
            };

            //Default Void Check
            if (!dv
                || !dv[0]
                || !dv[0].categorical
                || !dv[0].categorical.categories
                || !dv[0].categorical.categories[0].source
                || !dv[0].categorical.values
                || !dv[0].metadata)
                return DefaultTiles;

            //Assigning Quick references
            let Recruit = dv[0].categorical.categories[0].values;
            let Develop = dv[0].categorical.categories[1].values;
            let Launch = dv[0].categorical.categories[2].values;
            let Grow = dv[0].categorical.categories[3].values;
            let Direction=dv[0].categorical.categories[4].values;
            let Metric = dv[0].categorical.values[0].values;
            //let Link= dv[0].categorical.categories[5].values;
            
            //Clearing the connection array
            // this.ConnectionIdentity =[];
            this.ConnectionIdentityBackwards=[];
            this.ViewValue=[]

            //Inserting Default View
            for (let i = 0; i < Metric.length; i++) {
                let r = Recruit[i];
                let d = Develop[i];
                let l = Launch[i];
                let g = Grow[i];
                let num = Metric[i];
                let col = 0;
                let head = '';
                if (r == null || d == null || l == null || g == null &&Direction[i]==null) {
                    if (r != null) { col = 1, head = <string>r }
                    else if (d != null) { col = 2; head = <string>d }
                    else if (l != null) { col = 3; head = <string>l }
                    else if (g != null) { col = 4; head = <string>g }

                    
                    //Assigning to the object
                    DefaultTiles.Tiles.push({
                        col: col,
                        head: <string>head,
                        id: this.removeSpl(<string>head),
                        value: <number>Metric[i],
                        identity:this.host.createSelectionIdBuilder()
                            .withCategory(dv[0].categorical.categories[col-1], i)
                            .withMeasure(head)
                            .createSelectionId()
                    });
                }
                else{
                    //Pushing specific connection defining objects

                    // if(Direction[i]=="Forward"){
                    //     //Pushing Forward Data
                    //     this.ConnectionIdentity.push({
                    //         Recruit:this.removeSpl(<string>r),
                    //         Develop:this.removeSpl(<string>d),
                    //         Launch:this.removeSpl(<string>l),
                    //         grow:this.removeSpl(<string>g),
                    //         value:<number>num
                    //     });
                    // }
                    // else
                    if(Direction[i]=="Backward"){
                        //Pushing Backward Data
                        this.ConnectionIdentityBackwards.push({
                            Recruit:this.removeSpl(<string>r),
                            Develop:this.removeSpl(<string>d),
                            Launch:this.removeSpl(<string>l),
                            grow:this.removeSpl(<string>g),
                            value:<number>num
                        });
                    }
                    else if(Direction[i]=="Node"){
                        //Pushing Backward Data that actually sets the
                        this.ViewValue.push({
                            Recruit:this.removeSpl(<string>r),
                            Develop:this.removeSpl(<string>d),
                            Launch:this.removeSpl(<string>l),
                            grow:this.removeSpl(<string>g),
                            value:<number>num
                        });
                    }
                    
                }
            }
            //Returning the view model
            return DefaultTiles;
        }

        //Super activation for Tiles having progressbars
        public superActivate(id : string){
            let x=$("#"+id);
            x.find(".progtitle").slideDown(500);
            let color=x.find(".col-5").css("background-color");
            let progbar=d3.select("#"+id).select(".col-7").style({
                 "background-color":"white",
                 "color":"black"
             });
             x.find('.col-5').find("div").animate({
                 'bottom':'10px'
             })

            //Now calculating the values of the progress bars

            //Looking for of selected value
            let vValue2=$("#"+id).find('.runtime').val();
            let Value2:number=parseInt(vValue2);
            let percent_ofSelected:number=(Value2/this.clickedValue)*100;
            
            //Looking for of total value
            let vValue=$("#"+id).find('.default').val();
            let Value:number=parseInt(vValue);
            let percent_Total:number=(Value2/Value)*100;
            
            //Fixing the size of the progress bar Ofselected
            progbar.select(".ofselected").style({
              width:percent_ofSelected+"%",
              "background-color":this.clickedColor
            });

            //Fixing the size of the progress bar Total
            progbar.select(".total").style({
              width:percent_Total+"%",
            });

            //making the change visible on the text
            let text=d3.select("#"+id).selectAll(".progtitle").select(".metric");
            
            //Value for ofSelected
            $(text[0][0]).text(percent_ofSelected.toFixed(2)+"%");
            //Value for Total
            $(text[0][1]).text(percent_Total.toFixed(2)+"%");
        }

        //Utility function to deactivate
        public deActivate(x:SVGElement){
            
            $(x).find(".progtitle").hide();
            let color=$(x).find(".col-5").css("background-color");
            d3.select(x).select(".col-7").style({
                "background-color":color,
                "color":"white"
            });
        }

        //Utility Function to deactivate all nodes
        public deactivateAll(){
            let deactTile=d3.selectAll(".inactive");
            deactTile.selectAll(".progtitle").style({
                display:"none"
            });
            deactTile.selectAll(".col-7").style({
                color:"Black",
                "background-color":"white"
            });
            
            //Fixing here defaults value
            for(let i=0;i<deactTile[0].length;i++){
                let vValue=$(deactTile[0][i]).find('.default').val();
                let Value:number=parseInt(vValue);
                $(deactTile[0][i]).find('.col-5').find('div').text(this.getFormatted(Value));
                $
            }
        }
        //Utility Function to sum up values of ending column tiles in case of multiple connections
        // public tileAggregate(id:string,value:number){
        //     let vValue=$("#"+id).find('.runtime').val();
        //     let Value:number=parseInt(vValue);
        //     value=value+Value;
        //     $("#"+id).find('.runtime').val(value);
        //     return value;
        // }

        //Utility function to get formatted value
        public getFormatted(Quantity:number):string{
            let value:string
            if(Quantity>=1000){
                value=(Quantity/1000).toFixed(1)+"K";
                return value;
            }
            else if(Quantity>=1000000){
                value=(Quantity/1000000).toFixed(1)+"M";
                return value;
            }
            else if(Quantity>=1000000000){
                value=(Quantity/1000000000).toFixed(1)+"B";
                return value;
            }
            else
                return ""+Quantity;
        }

        //Using DFS Algorithm in Directed Graph
        //Creating connection recursively using Dynamic Programming
        // public getConnection(id:string,click:boolean, col:number,pointer:string,Filter:Connection[]){
        //     if(pointer==null)
        //         return null; //Recursion ending case

        //     //Getting a temporary filter to facilitate Dynamic Programming
        //     //This Temporary Filter will be used to splice off the  not required data points for a level of recursion
        //     let TempFilter:Connection[];
        //     TempFilter=Filter.slice(0);
        //     let forp='All';
        //     let prevp='All';
        //     //Applying the specific pointer
        //     switch(col){
        //         case 1:
        //             pointer="Recruit";
        //             prevp=null;
        //             forp="Develop";
        //             break;
        //         case 2:
        //             pointer="Develop";
        //             prevp="Recruit";
        //             forp="Launch";
        //             break;
        //         case 3:
        //             pointer="Launch";
        //             prevp="Develop";
        //             forp="grow";
        //             break;
        //         case 4:
        //             pointer="grow";
        //             prevp="Launch";
        //             forp=null;
        //             break;
        //     }

        //     //Installing Filter
        //     //Getting the first connection
        //     if(click==true){
        //         //Pushing values in Filter First step of DP
        //         for(let i=0;i<this.ConnectionIdentity.length;i++)
        //             if(id==this.ConnectionIdentity[i][pointer] && (this.ConnectionIdentity[i][prevp]=="All" || col==1)){
        //                 Filter.push({
        //                     Recruit:this.ConnectionIdentity[i].Recruit,
        //                     Develop:this.ConnectionIdentity[i].Develop,
        //                     Launch:this.ConnectionIdentity[i].Launch,
        //                     grow:this.ConnectionIdentity[i].grow,
        //                     value:this.ConnectionIdentity[i].value
        //                 });
        //             }
        //             //Pushing a Shallow array
        //             TempFilter=Filter.slice(0);
        //     }
        //     else{
        //         //Clearing out not mathing Data Points
        //         for(let i=0;i<TempFilter.length;i++){
        //             if(id!=TempFilter[i][pointer]){
        //                 //Removing the Unmatched Identities
        //                 TempFilter.splice(i,1);
        //                 //Since clearing out resizes interface automatically so setting i yo i-1 guarantees that no data point will be overlooked 
        //                 i=i-1; 
        //             }
        //         }
        //     }

        //     //Aceessing the connection list
        //     for(let i=0;i<Filter.length;i++){
        //         if(id==Filter[i][pointer]){

        //             //Checking if a line exists or not // Id of line is in form Id(div1)+Id(div2)
        //             if(Filter[i][forp]!=undefined && !document.getElementById(Filter[i][pointer]+Filter[i][forp]) && Filter[i][forp]!="All"){

        //                 //Making Current tile active
        //                 $("#"+Filter[i][pointer]).removeClass("grey strong-grey inactive").addClass("active");
        //                 //Making it superactive except clicked column
        //                if(!click)
        //                     this.superActivate(Filter[i][pointer]);

        //                 click=false;    //Setting further clicks to false

        //                 if(Filter[i][forp]!=undefined){
        //                     this.createLine(Filter[i][pointer],Filter[i][forp],Filter[i][pointer]+Filter[i][forp]);
        //                     //Calling recursion function
        //                     this.getConnection(Filter[i][forp],click,col+1,forp,TempFilter);
        //                 }
        //             }
        //             else if(Filter[i][forp]=="All"|| Filter[i][forp]==undefined){
        //                 //get a temporary variable within the scope to store value
                       
        //                 let Quantity:number;
        //                 if(click==false){
        //                     //Getting the best known updated value
        //                     Quantity=<number>this.tileAggregate(Filter[i][pointer],Filter[i].value);
        //                 }
        //                 //Code below is to activate a end node
        //                 $("#"+Filter[i][pointer]).removeClass("grey strong-grey inactive").find(".col-4").text(Quantity);
        //                 if(Filter[i][forp]==undefined)
        //                         this.superActivate(Filter[i][pointer]);
        //             }
        //         }
        //     }
        // }


        // Using DFS Algorithm in Directed Graph
        // Creating connection Backwards recursively using Dynamic Programminh
        public getConnectionBackward(id:string,click:boolean, col:number,pointer:string,Filter:Connection[]):number{
    
            if(pointer==null)
                return null; //Recursion ending case
            
            //Getting a temporary filter to facilitate Dynamic Programming
            let TempFilter:Connection[];
            TempFilter=Filter.slice(0);
            let forp='All';
            let prevp='All';
            //Applying the specific pointer
            switch(col){
                case 1:
                    pointer="Recruit";
                    prevp=null;
                    forp="Develop";
                    break;
                case 2:
                    pointer="Develop";
                    prevp="Recruit";
                    forp="Launch";
                    break;
                case 3:
                    pointer="Launch";
                    prevp="Develop";
                    forp="grow";
                    break;
                case 4:
                    pointer="grow";
                    prevp="Launch";
                    forp=null;
                    break;
            }
            
            //Installing Filter
            //Getting the first connection
            if(click==true){
                //Pushing values in Filter First step of DP
                for(let i=0;i<this.ConnectionIdentityBackwards.length;i++)
                    if(id==this.ConnectionIdentityBackwards[i][pointer]  && (this.ConnectionIdentityBackwards[i][forp]=="All" || col==4)){
                        Filter.push({
                            Recruit:this.ConnectionIdentityBackwards[i].Recruit,
                            Develop:this.ConnectionIdentityBackwards[i].Develop,
                            Launch:this.ConnectionIdentityBackwards[i].Launch,
                            grow:this.ConnectionIdentityBackwards[i].grow,
                            value:this.ConnectionIdentityBackwards[i].value
                        });
                    }
                    //Pushing into a Shallow array
                    TempFilter=Filter.slice(0);
            }
            else{
                for(let i=0;i<TempFilter.length;i++){
                    if(id!=TempFilter[i][pointer]){
                        TempFilter.splice(i,1);
                        i=i-1;
                    }
                }
            }
            //Aceessing the connection list
            for(let i=0;i<Filter.length;i++){
                if(id==Filter[i][pointer]){

                    //Checking if a line exists or not // Id of line is in form Id(div1)+Id(div2)
                    if(Filter[i][prevp]!=undefined && !document.getElementById(Filter[i][pointer]+Filter[i][prevp]) && Filter[i][prevp]!="All"){

                        //Making Current tile active
                        $("#"+Filter[i][pointer]).removeClass("grey strong-grey inactive").addClass("active");
                        //Making it superactive except clicked column
                        if(this.Clicked!=Filter[i][pointer])
                            this.superActivate(Filter[i][pointer]);
                        click=false;    //Setting further clicks to false

                        if(Filter[i][prevp]!=undefined){
                            this.createLineBackward(Filter[i][pointer],Filter[i][prevp],Filter[i][pointer]+Filter[i][prevp]);
                            //Calling recursion function
                            this.getConnectionBackward(Filter[i][prevp],click,col-1,prevp,TempFilter);
                        }
                    }
                    else if(Filter[i][prevp]=="All"|| Filter[i][prevp]==undefined){
                        //get a temporary variable within the scope to store value
                       
                        // let Quantity:number;
                        // if(click==false){
                        //     //Getting the best known updated value
                        //     Quantity=<number>this.tileAggregate(Filter[i][pointer],Filter[i].value);
                        // }
                        $("#"+Filter[i][pointer]).removeClass("grey strong-grey inactive").find(".col-5");//.find("div").text(this.getFormatted(Quantity));

                        this.superActivate(Filter[i][pointer]);
                        this.Thickness[pointer]+=Filter[i].value;
                    }
                }
            }
        }

        //Function that will set the values Uncalculated in front end after the lines are being calculated
        public getTileValue(id:string,ColNum:number,ViewValueTemp:Connection[]){
            let pointer='All';
            ViewValueTemp=this.ViewValue;
            //Applying the specific pointer
            switch(ColNum){
                case 1:
                    break;
                case 2:
                    for(let i=0;i<ViewValueTemp.length;i++){
                        if(!(id==ViewValueTemp[i].Develop && ViewValueTemp[i].Launch=='All' && ViewValueTemp[i].grow=='All')){
                            ViewValueTemp.splice(i);              
                        }
                    };
                    pointer="Develop";
                    break;
                case 3:
                    for(let i=0;i<ViewValueTemp.length;i++){
                        if(!(id==ViewValueTemp[i].Launch && ViewValueTemp[i].grow=='All')){
                            ViewValueTemp.splice(i);              
                        }
                    }
                    pointer="Launch";
                    break;
                case 4:
                debugger;
                    for(let i=0;i<ViewValueTemp.length;i++){
                        if(id==ViewValueTemp[i].grow){
                            if(ViewValueTemp[i].Launch!='All'){
                                $("#"+ViewValueTemp[i].Launch).find('.col-5').find("div").text(this.getFormatted(ViewValueTemp[i].value)); 
                            }
                            else if(ViewValueTemp[i].Develop!='All'){
                                $("#"+ViewValueTemp[i].Develop).find('.col-5').text(this.getFormatted(ViewValueTemp[i].value)); 
                            } 
                            else if(ViewValueTemp[i].Recruit!='All'){
                                $("#"+ViewValueTemp[i].Recruit).find('.col-5').text(this.getFormatted(ViewValueTemp[i].value)); 
                            }                 
                        }
                    }
                    pointer="Grow";
                    break;
            }            
            console.log(ViewValueTemp);
        };

       //Update function
        public update(options: VisualUpdateOptions) {

            //Clearing selection manager
            this.selectionManager.clear();
            //clearing clickcount
            this.clickCount=0;
            //Removing elements
            $(".col-3").find('div').remove();
            $(".connecting").remove();

            //Getting Default inputs
            let Default = this.getViewModel(options);

            //Creating Default Rectangles
            for (let i = 0; i < Default.Tiles.length; i++) {
                this.createChart(Default.Tiles[i]);
            }

            //Storing the context in a variable
            var Context=this;

            //Functions for events
            function activate(x: SVGElement) {

                //Removing lines
                $("#row1").find('path').parent().remove();
                
                //Block to disable other activation
                $("#row1").find('.col-3').find(".SVGcontainer").addClass("strong-grey inactive");

                //Removing all Visible eyes
                $("#row1").find('.visible').hide();
                $("#row1").find('.hidden').show();
                $(".row").unbind("mouseenter").unbind("mouseleave");

                //Block to ACTIVATE
                $(x).parent().removeClass("strong-grey");
                let id=$(x).parent().attr("id");
                let col=$(x).parent().parent().attr("id");
                let ColNum:number;
                switch(col){
                    case 'col-1':
                        ColNum=1;
                        break;
                    case 'col-2':
                        ColNum=2;
                        break;
                    case 'col-3':
                        ColNum=3;
                        break;
                    case 'col-4':
                        ColNum=4;
                        break;
                }

                //Clearing 4th column hidden input fields
                $(".col-3").find('.runtime').val(0);

                //Creating and clearing the filter
                let Filter : Connection[];
                // Filter=[];
                // //Making Forward Connection
                // Context.getConnection(id,true,ColNum,'All',Filter);
                
                // Making a ViewValueTemp Filter to store most of the values and use DP to get some factual data
                let ViewValueTemp:Connection[];
                ViewValueTemp=[];
                
                //clearing the filter again for backward Connections
                Filter=[];

                //Clearing the Thickness interface instance values
                Context.Thickness={
                    Recruit:0,
                    Develop:0,
                    Launch:0,
                    grow:0
                };

                //Calling functions
                Context.getConnectionBackward(id,true,ColNum,'All',Filter);
                //Context.getTileValue(id,ColNum,ViewValueTemp);
    
                //Now refresing dimmed tiles
                //function call to deactivate all tiles
                Context.deactivateAll();

               //Putting the default value
               for (let i = 0; i < Default.Tiles.length; i++) {
                    if(Default.Tiles[i].col==ColNum && Default.Tiles[i].id==id){
                        $(x).parent().find(".col-5").find("div").text(Context.getFormatted(Default.Tiles[i].value));
                        Context.deActivate(x);
                        break;
                    }
                }
                console.log(Context.Thickness);
                //Activate function ends here
            }

            // //Viewport scrolling 
            // var innerHeight = window.innerHeight;
            // var rowHeight = $("#row1").height();
            // if (rowHeight > innerHeight)    
            //     $(this.target).css({ "overflow-y": "scroll" });


            //Setting event handlers
            $(".SVGcontainer").find(".row").click(
                function (this): void {

                    //Stop propagaion of the bubble
                    event.stopPropagation();

                    //Checking the click and taking measures
                    if(Context.clickCount==0){
                        Context.clickCount=1;
                        Context.ClickedNow=Context.Clicked;
                        //Block to make it active
                        let parent=$(this).parent().removeClass("inactive").addClass("active");
                        //block to make $(this) to an active form
                        activate(this);
                        
                    }
                    else if(Context.clickCount==1 && Context.ClickedNow==Context.Clicked){
                        Context.clickCount=0; 
                        Context.update(options);
                    }
                    else{
                        Context.clickCount=1;
                        Context.ClickedNow=Context.Clicked;
                        //Block to make it active
                        $(this).removeClass("inactive").addClass("active");
                        //block to make $(this) to an active form
                        activate(this);
                    }


                    //Assigning necessary attributes to animate
                    $("#row1").each(function() {

                        var sequence = $('path', this);
                        var iter, vector, length;
                    
                        for (iter = 0; iter < sequence.length; iter++) {
                        vector = sequence[iter];
                        length = vector.getTotalLength();
                        $(vector).attr('data-length', length).css({'stroke-dashoffset': length, 'stroke-dasharray': length});
                        }
                    });

                    var sequence = $("#row1").find('path');
                    for(let i=0;i<sequence.length;i++){
                    var vector = sequence.eq(i);
                    var length = parseInt(vector.attr('data-length'));

                        vector.animate({'stroke-dashoffset': 0}, {
                    
                            duration: 1.6*length,
                            easing: 'linear',
                        });
                    }
                    //Click function ends here
                });

            //Partial display
            // $(".inactive").mouseenter(
            //     function (this): void {
            //         $(this).removeClass("grey");
            //     });
            // $(".inactive").mouseleave(
            //     function (this): void {
            //         $(this).addClass("grey");
            //     });

        }

        // public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        //     const objectName: string = options.objectName;
        //     const objectEnumeration: VisualObjectInstance[] = [];
        //     switch(objectName) {
        //         default:
        //     }
        //     return objectEnumeration;
        // }
    }
}
