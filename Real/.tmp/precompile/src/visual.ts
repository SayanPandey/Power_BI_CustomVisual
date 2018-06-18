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
    //Below interface is used to update values in runtime
    interface Connection {
        Recruit:string,
        Develop:string,
        Launch:string,
        grow:string,
        value:number
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
        private ConnectionIdentity: Connection[];
        private ConnectionIdentityBackwards: Connection[];

        //For Interaction and Selection Changes
        private selectionManager : ISelectionManager;

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
            this.ConnectionIdentity = [];
            //Initialising backward Connection Identity
            this.ConnectionIdentityBackwards=[];
            //Initializing the selection Manager to filter next data points
            this.selectionManager= this.host.createSelectionManager();

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
            var color;
            var stroke
            switch (Tile.col) {
                case 1:
                    color = "white";
                    stroke = "#F15C03";
                    break;
                case 2:
                    color = "white";
                    stroke = "#17A517";
                    break;
                case 3:
                    color = "white";
                    stroke = "#2BADE0";
                    break;
                case 4:
                    color = "white";
                    stroke = "#6634C6";
                    break;
                default:
                    color = "white";
                    stroke = "";
            }
            //Storing the context
            let Context=this;
            //This is the column used to recognise specific chart
            let newCol = d3.select("#col-" + Tile.col).append("div").classed("SVGcontainer inactive", true)
                .attr("id", Tile.id).attr("style", "padding:10px;")
                .on("click",function(){
                    Context.selectionManager.select(Tile.identity);
                    Context.Clicked=Tile.id;
                    Context.clickedValue=Tile.value;
                    Context.clickedColor=stroke;
                });

            //making new chart
            let block = newCol.append("div").classed("row row2",true)
                .style({
                    "border":"solid 2px "+stroke
                }); //The New Mockup design longs for perfect design that will be easy to achieve with divs than svg

            let leftSide=block.append("div").classed("col-8",true).style({
                "-webkit-box-shadow": "0px 0px 0px 1.5px"+stroke,
                "-moz-box-shadow":"0px 0px 0px 1.5px"+stroke,
                "box-shadow":"0px 0px 0px 1.5px"+stroke
                });
            let rightSide=block.append("div").classed("col-4",true).style({
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
            rightSide.html('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAF3SURBVEhLxZS/K0VxGIdPLq7B4Copg0xKSq6VRWFgMrKZKBlISZQ7XYtBNkalJAt3kFUpSqaLyGKw+QsM53jer0/3drpXne+JPPV07+d9z/ueb+f+CP6VKIoGwzBcxHWcJjeqlQ4WtLDoFC9xBefxCK9xXJf5w+ICC7YVK1AbwlscVckPBssszynGoD5G/1DRDwbf9LYGen14oegHg4/2nBVjUB+hf6zoB4MlHFCMQX0J1xT9YPCBk/UoxqC3gDuKfjBYxrxiDOobWFT0g8FhvFGsQK0LX7BDJX8Ytu9rv6KDvMojKiimgyVTeK7oIL9ju2I6WJDndCeKDmo/fr8TwcJmluzjpkoO8hXOKiaHoU7cwlcscoMmtRzU7MM7o37H65wdQK36cEEG7Y/nCZd536ZWXbimF3fxGSdVroXmHh5gVqVEcIButNNPqFTFmjTsl5ZRyQtm7U/pXrEKxRn8sDunlflPXlu18huKWYq5X7BBK/+CIPgCK5i7ktP1SeYAAAAASUVORK5CYII=">');
            rightSide.append("div").text(Tile.value);
            
            
            //Fixing a hidden input fields  to add up values of more than one path joining it
            d3.select("#"+Tile.id).append("input").attr({'type':'hidden','value':'0','class':'runtime'});

            //Fixing another hidden input fields  to store the default values
            d3.select("#"+Tile.id).append("input").attr({'type':'hidden','value':Tile.value,'class':'default'});
        }

        //create line function()
        public createLine(id1: string, id2: string, lineId: string) {

            //Finding the color of the line
            let color = $("#"+id1).find(".col-4").css("background-color");
            var row = d3.select("#row1").append("svg").attr("class", "connecting").append("path").attr({ "id": lineId, "fill": "transparent","class":"path","stroke":color});
            var line = $('#'+lineId);
            var div1 = $('#' + id1);
            var div2 = $('#' + id2);

            //Center for the first block
            var x1 = div1.offset().left + (div1.width() / 2);
            var y1 = div1.offset().top + (div1.height() / 2);

            //Line to of Second block
            var x2l = div2.offset().left;
            var x2 = div2.offset().left + (div1.width() / 2);
            var y2 = div2.offset().top + (div2.height() / 2);

            //First breakpoint horizontal
            var hor1 = div1.offset().left + (div1.width());

            //Creating curve from div1 to div 2
            var path = "M" + x1 + " " + y1; //selecting centroid of div1
            path += " H " + hor1;   //creating horizontal line to first break point
            path += "M" + hor1 + " " + y1;  //shifing the center to the end point
            path += " L " + x2l + " " + y2; //Line
            path += "M" + x2l + " " + y2    //Centershift
            path += " L " + x2 + " " + y2;  //Final lining

            line.attr("d", path);
        }

        //Create Backward line function
        public createLineBackward(id1: string, id2: string, lineId: string) {
            let color = $("#"+id1).find(".col-4").css("background-color");
            var row = d3.select("#row1").append("svg").attr("class", "connecting").append("path").attr({ "id": lineId, "fill": "transparent","class":"path","stroke":color}); 
            var line = $('#'+lineId);
            var div1 = $('#' + id1);
            var div2 = $('#' + id2);

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
            path += "M" + hor1 + " " + y1;  //shifing the center to the end point
            path += " L " + x2l + " " + y2; //Line
            path += "M" + x2l + " " + y2    //Centershift
            path += " L " + x2 + " " + y2;  //Final lining

            line.attr("d", path);
        }

        //Data inserting code
        private getViewModel(options: VisualUpdateOptions): ViewModel {
            //Fetching data
            let dv = options.dataViews;

            //Creating unique identities
            //Making a viewmodel instance
            var count: number = 0;
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
            this.ConnectionIdentity =[];
            this.ConnectionIdentityBackwards=[];
            //Inserting Default View
            for (let i = 0; i < Metric.length; i++) {
                let r = Recruit[i];
                let d = Develop[i];
                let l = Launch[i];
                let g = Grow[i];
                let num = Metric[i];
                let col = 0;
                let head = '';
                if (r == null || d == null || l == null || g == null) {
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

                    if(Direction[i]=="Forward"){
                        //Pushing Forward Data
                        this.ConnectionIdentity.push({
                            Recruit:this.removeSpl(<string>r),
                            Develop:this.removeSpl(<string>d),
                            Launch:this.removeSpl(<string>l),
                            grow:this.removeSpl(<string>g),
                            value:<number>num
                        });
                    }
                    else if(Direction[i]=="Backward"){
                        //Pushing Backward Data
                        this.ConnectionIdentityBackwards.push({
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
            $("#"+id).find(".progtitle").slideDown(500);
            let color=$("#"+id).find(".col-4").css("background-color");
            let progbar=d3.select("#"+id).select(".col-8").style({
                 "background-color":"white",
                 "color":"black"
             });

            //Now calculating the values of the progress bars

            //Looking for of selected value
            let vValue2=$("#"+id).find('.runtime').val();
            let Value2:number=parseInt(vValue2);
            let percent_ofSelected:number=(Value2/this.clickedValue)*100;

            //Looking for of total value
            let vValue=$("#"+id).find('.default').val();
            let Value:number=parseInt(vValue);
            let percent_Total:number=(Value/this.clickedValue)*100;
            
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
            let color=$(x).find(".col-4").css("background-color");
            d3.select(x).select(".col-8").style({
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
            deactTile.selectAll(".col-8").style({
                color:"Black",
                "background-color":"white"
            });
            
            //Fixing here defaults value
            for(let i=0;i<deactTile[0].length;i++){
                let vValue=$(deactTile[0][i]).find('.default').val();
                let Value:number=parseInt(vValue);
                $(deactTile[0][i]).find('.col-4').find('div').text(Value);
            }
        }
        //Utility Function to sum up values of ending column tiles in case of multiple connections
        public tileAggregate(id:string,value:number){
            let vValue=$("#"+id).find('.runtime').val();
            let Value:number=parseInt(vValue);
            value=value+Value;
            $("#"+id).find('.runtime').val(value);
            return value;
        }

        //Using DFS Algorithm in Directed Graph
        //Creating connection recursively using Dynamic Programming
        public getConnection(id:string,click:boolean, col:number,pointer:string,Filter:Connection[]){
            if(pointer==null)
                return null; //Recursion ending case

            //Getting a temporary filter to facilitate Dynamic Programming
            //This Temporary Filter will be used to splice off the  not required data points for a level of recursion
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
                for(let i=0;i<this.ConnectionIdentity.length;i++)
                    if(id==this.ConnectionIdentity[i][pointer] && (this.ConnectionIdentity[i][prevp]=="All" || col==1)){
                        Filter.push({
                            Recruit:this.ConnectionIdentity[i].Recruit,
                            Develop:this.ConnectionIdentity[i].Develop,
                            Launch:this.ConnectionIdentity[i].Launch,
                            grow:this.ConnectionIdentity[i].grow,
                            value:this.ConnectionIdentity[i].value
                        });
                    }
                    //Pushing a Shallow array
                    TempFilter=Filter.slice(0);
            }
            else{
                //Clearing out not mathing Data Points
                for(let i=0;i<TempFilter.length;i++){
                    if(id!=TempFilter[i][pointer]){
                        //Removing the Unmatched Identities
                        TempFilter.splice(i,1);
                        //Since clearing out resizes interface automatically so setting i yo i-1 guarantees that no data point will be overlooked 
                        i=i-1; 
                    }
                }
            }

            //Aceessing the connection list
            for(let i=0;i<Filter.length;i++){
                if(id==Filter[i][pointer]){

                    //Checking if a line exists or not // Id of line is in form Id(div1)+Id(div2)
                    if(Filter[i][forp]!=undefined && !document.getElementById(Filter[i][pointer]+Filter[i][forp]) && Filter[i][forp]!="All"){

                        //Making Current tile active
                        $("#"+Filter[i][pointer]).removeClass("grey strong-grey inactive").addClass("active");
                        //Making it superactive except clicked column
                       if(!click)
                            this.superActivate(Filter[i][pointer]);

                        click=false;    //Setting further clicks to false

                        if(Filter[i][forp]!=undefined){
                            this.createLine(Filter[i][pointer],Filter[i][forp],Filter[i][pointer]+Filter[i][forp]);
                            //Calling recursion function
                            this.getConnection(Filter[i][forp],click,col+1,forp,TempFilter);
                        }
                    }
                    else if(Filter[i][forp]=="All"|| Filter[i][forp]==undefined){
                        //get a temporary variable within the scope to store value
                       
                        let Quantity:number;
                        if(click==false){
                            //Getting the best known updated value
                            Quantity=<number>this.tileAggregate(Filter[i][pointer],Filter[i].value);
                        }
                        //Code below is to activate a end node
                        $("#"+Filter[i][pointer]).removeClass("grey strong-grey inactive").find(".col-4").text(Quantity);
                        if(Filter[i][forp]==undefined)
                                this.superActivate(Filter[i][pointer]);
                    }
                }
            }
        }

        // Using DFS Algorithm in Directed Graph
        // Creating connection Backwards recursively using Dynamic Programming
        public getConnectionBackward(id:string,click:boolean, col:number,pointer:string,Filter:Connection[]){

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
                       
                        let Quantity:number;
                        if(click==false){
                            //Getting the best known updated value
                            Quantity=<number>this.tileAggregate(Filter[i][pointer],Filter[i].value);
                        }
                        $("#"+Filter[i][pointer]).removeClass("grey strong-grey inactive").find(".col-4").find("div").text(Quantity);
                        if(Filter[i][prevp]==undefined)
                                this.superActivate(Filter[i][pointer]);
                    }
                }
            }
        }

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

                //Block to ACTIVATE
                $(x).removeClass("strong-grey");
                let id=$(x).attr("id");
                let col=$(x).parent().attr("id");
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

                //clearing the filter agin for backward Connections
                Filter=[];
                Context.getConnectionBackward(id,true,ColNum,'All',Filter);

                //Now refresing dimmed tiles
                //function call to deactivate all tiles
                Context.deactivateAll();

               //Putting the default value
               for (let i = 0; i < Default.Tiles.length; i++) {
                    if(Default.Tiles[i].col==ColNum && Default.Tiles[i].id==id){
                        $(x).find(".col-4").find("div").text(Default.Tiles[i].value);
                        Context.deActivate(x);
                        break;
                    }
                }
            }

            //Viewport scrolling 
            var innerHeight = window.innerHeight;
            var rowHeight = $("#row1").height();
            if (rowHeight > innerHeight)
                $(this.target).css({ "overflow-y": "scroll" });


            //Setting event handlers
            $(".SVGcontainer").click(
                function (this): void {
                    
                    //Checking the click and taking measures
                    let id=$(this).attr("id");
                    if(Context.clickCount==0){
                        Context.clickCount=1;
                        Context.ClickedNow=id;
                        //Block to make it active
                        $(this).removeClass("inactive").addClass("active");
                        //block to make $(this) to an active form
                        activate(this);
                    }
                    else if(Context.clickCount==1 && Context.ClickedNow==id){
                        Context.clickCount=0; 
                        Context.update(options);
                    }
                    else{
                        //Block to make it active
                        $(this).removeClass("inactive").addClass("active");
                        //block to make $(this) to an active form
                        activate(this);
                        Context.clickCount=0;
                    }
                })

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
