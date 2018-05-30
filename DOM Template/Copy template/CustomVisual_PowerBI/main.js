/*
*   
*   *Sayan Pandey EMPH 1972
*  
*/

//Container that holds all other elements of the chart
//It is a basic bootstrap,HTML,CSS template.
var Container = d3.select("body")
                .append("div")
                .classed("container",true);

//Appending the title row.
var rowTitle=Container.append("div")
        .classed("row",true)
        .attr("id","mainRow");

//Appending the values heading now
rowTitle.append("div").classed("col-md-3",true).attr("id","col-1").append("h5").text("Recruit").classed("head head1",true);
rowTitle.append("div").classed("col-md-3",true).attr("id","col-2").append("h5").text("Develop").classed("head head2",true);
rowTitle.append("div").classed("col-md-3",true).attr("id","col-3").append("h5").text("Launch").classed("head head3",true);
rowTitle.append("div").classed("col-md-3",true).attr("id","col-4").append("h5").text("Grow").classed("head head4",true);

//Cerating Utility functions
//Funtion to create head text and fixing chart in right place
function createChart(col,data,value,id){
    var newCol = d3.select("#col-"+col).classed("col-md-3 headTitle",true).append("div").text(data).attr("id",id);
    var color;
    var col=parseInt(col);
    switch(col){
        case 1:
            color="orange";
            stroke="#D48D00";
            break;
        case 2:
            color="#03CB12";
            stroke="#027600";
            break;
        case 3:
            color="#04D9DF";
            stroke="#00B3C1";
            break;
        case 4:
            color="rgb(50, 64, 255,0.6)";
            stroke="#0010ff";
            break;
        default:
            color="rgba(0,0,0,0)";
            stroke="";
    }
    //making new chart
    svg = newCol.append("svg")
                .attr("width","100")
                .attr("height","100");

    //Appending circle
    svg.append("circle")
        .attr("cx","50").attr("cy","50")
        .attr("r","30").attr("fill",color).attr("stroke",stroke).attr("stroke-width","3");

    //appending text;
    svg.append("text").text(value)
        .attr("x","50%").attr("y","50%").attr("text-anchor","middle").attr("dy","0.35em")
        .classed("label",true).attr("fill","white");

    //creating arch
    var group = svg.append('g')
        .attr("transform", "translate(50,50)");

    var radius = 42;
    var p = Math.PI * 2 *value/100;

    var arc = d3.arc()
        .innerRadius(radius - 8)
        .outerRadius(radius)
        .startAngle(Math.PI/2)
        .endAngle(p+Math.PI/2);

    group.append("path")
        .attr("d", arc)
        .attr("fill",stroke);
}

//Reading the json file to generate the graphs
d3.json("data.json",function(data){
    //Changing data type to suit manipulation
    data.forEach(function(d){
           d.col=+d.col;
           d.head=d.head;
           d.value=+d.value;
           d.id=d.id;
            //Creating head text 
            createChart(d.col, d.head,d.value,d.id);
        });
});
