var graphScale = d3.scale.pow().range([.5,100]);

function buildGraph()
{
	graphScale.domain([not_zero( demo.raw ),demo.raw[demo.raw.length-1]]);
	d3.select("#graph-inner").selectAll("div").remove();
	var g = d3.select("#graph-inner").selectAll("div")	
		.data( data.vote.keys );
	g.enter().append("div")
		.style("height",function(d){return graphScale( demo.obj[ d ] ) +"px";})
		.style("top",function(d){return (data.vote.obj[d] > 0 ? 100-graphScale(demo.obj[d]) : 100)+"px";})
		.style("left",function(d,i){return 100*i/demo.raw.length + "%";})
		.attr( "name", function( d ){ return d; } )
		.classed("romney",function(d){return data.vote.obj[d]<=0;})
		.classed("obama",function(d){return data.vote.obj[d]>0;})
		.on("mouseover",showGraphProbe)
		.on("mouseout",hideProbe);
	g.enter().append("div")
		.style("left",function(d,i){return 100*i/demo.raw.length + "%";})
		.style("height", "200px" )
		.style( "top", "0" )
		.on("mouseover",showGraphProbe)
		.on("mouseout",hideProbe);
}

function showGraphProbe(d)
{
	$("#probe").show()
		.html( 	"<p>Margin: "+Math.round(Math.abs(data.vote.obj[d])*10000)/100+"% " + (data.vote.obj[d] > 0 ? "Obama" : "Romney") + "<p>" +
				"<p>"+demo.name+": "+format(Math.round(Math.abs(demo.obj[d])*100)/100)+"</p>" )
		.css({left: d3.event.pageX + 200 > $(window).width() ? d3.event.pageX - $("#probe").width() - 10 : d3.event.pageX + 10, top: d3.event.pageY - $("#probe").height() - 10});
	var path = document.getElementById( d );
	if( path ) path.setAttribute( "class", path.getAttribute( "class" ) + " hover" );
//	var graph = document.getElementsByName( d )[ 0 ];
//	if( graph ) graph.setAttribute( "class", graph.getAttribute( "class" ) + " graph_highlight" );
}