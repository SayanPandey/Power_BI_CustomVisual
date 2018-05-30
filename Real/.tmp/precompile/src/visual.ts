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


        constructor(options: VisualConstructorOptions) {
            this.host=options.host;
            //creating an Container element
            this.Container=d3.select(options.element).append("div").classed('container-fluid',true);
            this.row=d3.select(".container-fluid").append("div").classed('row',true);
            //Appending the values heading now
            this.row.append("div").classed("col-sm-3",true).attr("id","col-1").append("h5").text("Recruit").classed("head head1",true);
            this.row.append("div").classed("col-sm-3",true).attr("id","col-2").append("h5").text("Develop").classed("head head2",true);
            this.row.append("div").classed("col-sm-3",true).attr("id","col-3").append("h5").text("Launch").classed("head head3",true);
            this.row.append("div").classed("col-sm-3",true).attr("id","col-4").append("h5").text("Grow").classed("head head4",true);

        }

        public update(options: VisualUpdateOptions) {

            //Scanning json file
            

        }
    }
}