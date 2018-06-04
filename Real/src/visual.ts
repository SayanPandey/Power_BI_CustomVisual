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
module powerbi.extensibility.visual {

    export class Visual implements IVisual {

        //Property declaration
        private host: IVisualHost;
        private Container :d3.Selection<SVGElement>;
        private row :d3.Selection<SVGElement>;
        private barGroup : d3.Selection<SVGAElement>;
        private target;
        private Data:DataView;
        private newCol:d3.Selection<SVGAElement>;


        constructor(options: VisualConstructorOptions) {
            this.host=options.host;
            this.target = options.element;
            //creating an Container element
            this.Container=d3.select(this.target).append("div").classed('container-fluid',true);
            this.row=d3.select(".container-fluid").append("div").classed('row',true);
            
            //Appending the values heading now
            this.row.append("div").classed("col-3",true).attr("id","col-1").append("h5").text("Recruit").classed("head head1",true);
            this.row.append("div").classed("col-3",true).attr("id","col-2").append("h5").text("Develop").classed("head head2",true);
            this.row.append("div").classed("col-3",true).attr("id","col-3").append("h5").text("Launch").classed("head head3",true);
            this.row.append("div").classed("col-3",true).attr("id","col-4").append("h5").text("Grow").classed("head head4",true);
        }

        //Utility function to create chart
        public createChart(col : number,head : string, value : number, id : string){
            var color;
            var stroke
            switch(col){
                case 1:
                    color="white";
                    stroke="orange";
                    break;
                case 2:
                    color="white";
                    stroke="#18a518";
                    break;
                case 3:
                    color="white";
                    stroke="#04D9DF";
                    break;
                case 4:
                    color="white";
                    stroke="#3300FF";
                    break;
                default:
                    color="white";
                    stroke="";
            }
            //This is the column used to recognise specific chart
            let newCol = d3.select("#col-"+col).append("div").classed("SVGcontainer grey inactive",true)
                        .attr("id",id).attr("style","padding:10px;"); 
            //making new chart
            let svg = newCol.append("svg")
                        .attr("width","220")
                        .attr("height","130")
                        .attr("xmlns","http://www.w3.org/2000/svg");

            //Appending svG
            svg.append("rect").attr("rx","10").attr("ry","10")
                .attr("height","90").attr("width","220")
                .attr("fill",color).attr("stroke",stroke).attr("stroke-width","2.5");
            //appending text;
            svg.append("text").text(value)
                .attr("x","95%").attr("y","20%").attr("text-anchor","end").attr("dy","0.35em")
                .classed("label",true);
            //appending head text;
            svg.append("foreignObject")
            .attr("x","10").attr("y","10").attr("width","150").attr("height","70")
            .append("xhtml:div").text(head).classed("headTitle",true);

            //appending progress bars
            if(col!=2){
                svg.append("foreignObject")
                .attr("x","10").attr("y","60%").attr("width","190").attr("height","70").append("xhtml:div")
                .classed("progress",true).append("div").classed("progress-bar progress-bar-selected",true)
                .attr({"aria-valuenow":"40","aria-valuemin":"0","aria-valuemax":"100","style":"width:40%"});
                //Second Progress bar
                svg.append("foreignObject")
                .attr("x","10").attr("y","80%").attr("width","190").attr("height","70").append("xhtml:div")
                .classed("progress",true).append("div").classed("progress-bar progress-bar-success",true)
                .attr({"aria-valuenow":"40","aria-valuemin":"0","aria-valuemax":"100","style":"width:40%"});
            }
        }

        //create line function()
        public createLine(){
            // d3.select("#HomepageVisit").append("svg").attr({"id":"line","width":"5px","height":"5px"}).append("line")
            //     .attr("id","line");
            d3.select(this.target).append("svg").attr("id","connecting").append("path").attr("id","line");
            var line = $('#line');
            var div1 = $('#GuidedExperienceVisits');
            var div2 = $('#DevChat');

            var x1 = div1.offset().left + (div1.width()-20);
            var y1 = div1.offset().top + (div1.height()/2);
            var x2 = div2.offset().left+40;
            var y2 = div2.offset().top + (div2.height()/2);
            var c1x = div2.offset().left; var c2x=c1x;
            var c1y=(y1+y2)/2+50; var c2y=c1y-100;
            line.attr("d","M"+x1+","+y1+" C"+c1x+","+" "+c1y+" "+c2x+","+c2y+" "+x2+","+y2);
        }

        public update(options: VisualUpdateOptions) {
            //Removing elements
            $(".col-3").find('div').remove();
            let dv = options.dataViews;
            let COL = dv[0].categorical.values[0].values;
            let HD = dv[0].categorical.categories[0].values;
            let VL = dv[0].categorical.categories[1].values;
            let ID = dv[0].categorical.categories[2].values;
            
            for(let i=0;i<COL.length;i++){
                this.createChart(<number>COL[i],<string>HD[i],<number>VL[i],<string>ID[i]);
            }
            this.createLine();
            //Functions for events
            function activate(x: SVGElement){
                //Block to disable other activation
                let group = $(".col-3").find(".SVGcontainer").addClass("strong-grey");
                group.find("rect").attr("fill","white");
                group.find("text").attr("fill","black");
                group.find("div").attr({"style":"text-shadow:none"})

                //Block to ACTIVATE
                    $(x).removeClass("strong-grey");
                    let svG=$(x).find("svg");
                    let fill=svG.find("rect").attr("stroke");
                    svG.find("rect").attr("fill",fill);
                    svG.find("text").attr("fill","white").attr({"style":"text-shadow:black 0px 0px 3px"});
                    svG.find("div").attr({"style":"color:white;text-shadow:black 0px 0px 3px"});
                    
            }

            //Setting event handlers
            $(".SVGcontainer").click(
                function(this) : void{ 

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


