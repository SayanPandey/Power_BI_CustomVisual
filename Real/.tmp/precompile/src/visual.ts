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

    export class Visual implements IVisual {

        //Declare property
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

        public createChart(col : number,head : string, value : number, id : string){
            let newCol = d3.select("#col-"+col).append("div").attr("id",id); //This is the column used to recognise specific chart
            var color;
            var stroke
            switch(col){
                case 1:
                    color="white";
                    stroke="orange";
                    break;
                case 2:
                    color="white";
                    stroke="#027600";
                    break;
                case 3:
                    color="white";
                    stroke="#04D9DF";
                    break;
                case 4:
                    color="white";
                    stroke="rgb(50, 64, 255,0.6)";
                    break;
                default:
                    color="rgba(0,0,0,0)";
                    stroke="";
            }
            //making new chart
            let svg = newCol.append("svg")
                        .attr("width","250")
                        .attr("height","160")
                        .attr("xmlns","http://www.w3.org/2000/svg");

            //Appending Rectangle
            svg.append("rect").attr("rx","10").attr("ry","10")
                .attr("height","155").attr("width","250")
                .attr("fill",color).attr("stroke",stroke).attr("stroke-width","2.5");
            //appending text;
            svg.append("text").text(value)
                .attr("x","95%").attr("y","20%").attr("text-anchor","end").attr("dy","0.35em")
                .classed("label",true);
            //appending head text;
            svg.append("foreignObject")
            .attr("x","5").attr("y","10").attr("width","150").attr("height","70").append("xhtml:div").text(head).classed("headTitle",true);
        }

        public update(options: VisualUpdateOptions) {
            let dv = options.dataViews;
            let COL = dv[0].categorical.values[0].values;
            let HD = dv[0].categorical.categories[0].values;
            let VL = dv[0].categorical.categories[1].values;
            let ID = dv[0].categorical.categories[2].values;
            
            for(let i=0;i<COL.length;i++){
                this.createChart(<number>COL[i],<string>HD[i],<number>VL[i],<string>ID[i]);
            }
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