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
        head?: string,
        id: string,
        value: number,
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

        //Defining global connection instance
        //Establishing connection b/w unique identities
        private ConnectIdentity: Connection[];
        private ConnectionIdentityBackwards: Connection[];

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
            this.ConnectIdentity = [];
            //Initialising backward Connection Identity
            this.ConnectionIdentityBackwards=[];
        }

        //Utility function to remove special characters / ID making function
        public removeSpl(x: string): string {
            x = x.replace(/[&\/\\#,+()$~%.'":*?<>{}\s]/g, '');
            return x;
        }
        //Utility function to create chart
        public createChart(col: number, head: string, value: number, id: string) {
            var color;
            var stroke
            switch (col) {
                case 1:
                    color = "white";
                    stroke = "orange";
                    break;
                case 2:
                    color = "white";
                    stroke = "#18a518";
                    break;
                case 3:
                    color = "white";
                    stroke = "#04D9DF";
                    break;
                case 4:
                    color = "white";
                    stroke = "#3300FF";
                    break;
                default:
                    color = "white";
                    stroke = "";
            }
            //This is the column used to recognise specific chart
            let newCol = d3.select("#col-" + col).append("div").classed("SVGcontainer grey inactive", true)
                .attr("id", id).attr("style", "padding:10px;");
            //making new chart
            let svg = newCol.append("svg")
                .attr("width", "80%")
                .attr("height", "130")
                .attr("xmlns", "http://www.w3.org/2000/svg");

            //Appending svG
            svg.append("rect").attr("rx", "10").attr("ry", "10")
                .attr("height", "90").attr("width", "100%")
                .attr("fill", color).attr("stroke", stroke).attr("stroke-width", "2.5");
            //appending text;
            svg.append("text").text(value)
                .attr("x", "95%").attr("y", "20%").attr("text-anchor", "end").attr("dy", "0.35em")
                .classed("label", true);
            //appending head text;
            svg.append("foreignObject")
                .attr("x", "10").attr("y", "10").attr("width", "68%").attr("height", "70%")
                .append("xhtml:div").text(head).classed("headTitle", true);

            //appending progress bars
            if (col != 2) {
                svg.append("foreignObject")
                    .attr("x", "10").attr("y", "60%").attr("width", "190").attr("height", "70").append("xhtml:div")
                    .classed("progress", true).append("div").classed("progress-bar progress-bar-selected", true)
                    .attr({ "aria-valuenow": "40", "aria-valuemin": "0", "aria-valuemax": "100", "style": "width:40%" });
                //Second Progress bar
                svg.append("foreignObject")
                    .attr("x", "10").attr("y", "80%").attr("width", "190").attr("height", "70").append("xhtml:div")
                    .classed("progress", true).append("div").classed("progress-bar progress-bar-success", true)
                    .attr({ "aria-valuenow": "40", "aria-valuemin": "0", "aria-valuemax": "100", "style": "width:40%" });
            }
        }

        //create line function()
        public createLine(id1: string, id2: string, lineId: string) {
            var row = d3.select("#row1").append("svg").attr("class", "connecting").append("path").attr({ "id": lineId, "fill": "transparent","class":"path"});
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
            var row = d3.select("#row1").append("svg").attr("class", "connecting").append("path").attr({ "id": lineId, "fill": "transparent","class":"path"});
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
            let Direction=dv[0].categorical.categories[4].values
            let Metric = dv[0].categorical.values[0].values
            
            //Clearing the connection array
            this.ConnectIdentity =[];
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
                    });
                }
                else{
                    //Pushing specific connection defining objects

                    if(Direction[i]=="Forward"){
                        //Pushing Forward Data
                        this.ConnectIdentity.push({
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
            //Searching for svg and increasing its length
            $("#"+id).find("rect").animate({
                "height":"130"
            },500);
            $("#"+id).find(".progress").slideDown(500);
            
            //Unbinding the mouse move
            $("#"+id).unbind("mouseenter").unbind("mouseleave");;
        }

        //Using DFS Algorithm in Directed Graph
        //Creating connection recursively
        public getConnection(id:string, col:number,pointer:string){

            if(pointer==null)
                return null; //Recursion ending case
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

            //Aceessing the connection list
            for(let i=0;i<this.ConnectIdentity.length;i++){
                if(id==this.ConnectIdentity[i][pointer]){
                    if(!document.getElementById(this.ConnectIdentity[i][pointer]+this.ConnectIdentity[i][forp]) && this.ConnectIdentity[i][forp]!="All"){

                        //Making Current tile active
                        $("#"+this.ConnectIdentity[i][forp]).removeClass("grey strong-grey inactive").addClass("active");
                        //Making it superactive except column 2
                        if(col!=2)
                            this.superActivate(this.ConnectIdentity[i][pointer]);

                        if(this.ConnectIdentity[i][forp]!=undefined)
                            this.createLine(this.ConnectIdentity[i][pointer],this.ConnectIdentity[i][forp],this.ConnectIdentity[i][pointer]+this.ConnectIdentity[i][forp]);
                        else
                            break; //possibly for 4th column recursion ending

                        //Calling recursion function
                        this.getConnection(this.ConnectIdentity[i][forp],col+1,forp);
                    }
                    else if(this.ConnectIdentity[i][forp]=="All" || col==1){
                       $("#"+this.ConnectIdentity[i][pointer]).removeClass("grey strong-grey inactive").find("text").text(this.ConnectIdentity[i].value);
                       $("#"+this.ConnectIdentity[i][pointer]);
                    }
                }
            }
        }

        //Using DFS Algorithm in Directed Graph
        //Creating connection Backwards recursively
        public getConnectionBackward(id:string, col:number,pointer:string){

            if(pointer==null)
                return null; //Recursion ending case
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

            //Aceessing the connection list
            for(let i=0;i<this.ConnectionIdentityBackwards.length;i++){
                if(id==this.ConnectionIdentityBackwards[i][pointer]){
                    if(!document.getElementById(this.ConnectionIdentityBackwards[i][pointer]+this.ConnectionIdentityBackwards[i][prevp]) && this.ConnectionIdentityBackwards[i][prevp]!="All"){

                        //Making Current tile active
                        $("#"+this.ConnectionIdentityBackwards[i][prevp]).removeClass("grey strong-grey inactive").addClass("active");
                        //Making it superactive except column 2
                        if(col!=2)
                            this.superActivate(this.ConnectionIdentityBackwards[i][pointer]);

                        if(this.ConnectIdentity[i][prevp]!=undefined)
                            this.createLineBackward(this.ConnectionIdentityBackwards[i][pointer],this.ConnectionIdentityBackwards[i][prevp],this.ConnectionIdentityBackwards[i][pointer]+this.ConnectionIdentityBackwards[i][prevp]);
                        else
                            break; //possibly for 1st column recursion ending

                        //Calling recursion function
                        this.getConnection(this.ConnectionIdentityBackwards[i][prevp],col-1,prevp);
                    }
                    else if(this.ConnectionIdentityBackwards[i][prevp]=="All" || col==1){
                       $("#"+this.ConnectionIdentityBackwards[i][pointer]).removeClass("grey strong-grey inactive").find("text").text(this.ConnectionIdentityBackwards[i].value);
                       $("#"+this.ConnectionIdentityBackwards[i][pointer]);
                    }
                }
            }
        }
       //Update function
        public update(options: VisualUpdateOptions) {
            
            //Removing elements
            $(".col-3").find('div').remove();
            $(".connecting").remove();

            //Getting Default inputs
            let Default = this.getViewModel(options);

            //Creating Default Rectangles
            for (let i = 0; i < Default.Tiles.length; i++) {
                this.createChart(<number>Default.Tiles[i].col, <string>Default.Tiles[i].head, <number>Default.Tiles[i].value, <string>Default.Tiles[i].id);
            }

            //Storing the context in a variable
            var Context=this;

            //Functions for events
            function activate(x: SVGElement) {
                //Removing lines
                $("#row1").find('path').parent().remove();
                //Block to disable other activation
                let group = $(".col-3").find(".SVGcontainer").addClass("strong-grey");
                group.find("rect").attr("fill", "white");
                group.find("text").attr("fill", "black");
                group.find("div").attr({ "style": "text-shadow:none" })

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
                    case 'col-3':
                        ColNum=3;
                        break;
                }
               // Context.getConnection(id,ColNum,'All');
                Context.getConnectionBackward(id,ColNum,'All');
            }

            //Viewport scrolling 
            var innerHeight = window.innerHeight;
            var rowHeight = $("#row1").height();
            if (rowHeight > innerHeight)
                $(this.target).css({ "overflow-y": "scroll" });


            //Setting event handlers
            $(".SVGcontainer").click(
                function (this): void {

                    //Block to make it active
                    $(this).removeClass("inactive grey").addClass("active").unbind("mouseleave");
                    //block to make $(this) to an active form
                    activate(this);

                })
            //Partial display
            $(".inactive").mouseenter(
                function (this): void {
                    $(this).removeClass("grey");
                });
            $(".inactive").mouseleave(
                function (this): void {
                    $(this).addClass("grey");
                });

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


