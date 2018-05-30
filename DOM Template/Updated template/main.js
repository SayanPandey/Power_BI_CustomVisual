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
    var newCol = d3.select("#col-"+col).append("div").attr("id",id); //This is the column used to recognise specific chart
    var color;
    var col=parseInt(col);
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
    svg = newCol.append("svg")
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
    .attr("x","5").attr("y","10").attr("width","150").attr("height","70").append("xhtml:div").text(data).classed("headTitle",true);
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
