var data = {},	
	demo = {};
var map;
var opacity = [ .05, .1, .15, .2, .25, .35, .45, .55, .75 ];

$( document ).ready( function()
{
	$.getJSON( "data/margin.json", function( d )
	{
		data.vote = {};
		data.vote.obj = d;
		var sorted = get_sorted( d );
		data.vote.keys = sorted.keys;
		data.vote.raw = sorted.values;
		
		$.getJSON( "data/population.json", function( d )
		{
			demo.obj = d;
			sorted = get_sorted( d );
			demo.raw = sorted.values;
			demo.breaks = get_quant( demo.raw );
			demo.name = "Population";
			$("#y-axis").html("Population");
			setup_map();
			buildGraph();	
		});
	});
	
	$( ".box" ).click( function()
	{
		$( "#loader" ).show();
		var f = parseFloat( $( this ).attr( "name" ) );
		var n = $( this ).html().replace( "<br>", "" );
		console.log( n );
		$( ".box.on" ).removeClass( "on" );
		$( this ).append( $( "#triangle" ) ).addClass( "on" );
		$.getJSON( "data/" + $( this ).attr( "id" ) + ".json", function( d )
		{
			demo = {};
			demo.obj = d;
			demo.name = n;
			$("#y-axis").html(n);
			var sorted = get_sorted( d );
			demo.raw = sorted.values;
			demo.breaks = get_quant( demo.raw );
			d3.selectAll( "#counties path" ).style( "fill-opacity", function( d )
			{
				return getOpacity( demo, d.properties.FIPS, f );
			})
			buildGraph();
			$( "#loader" ).hide();
		});
	});
});

function setup_map()
{
	var path = d3.geo.path()
		.projection( d3.geo.albersUsa()
			.scale( 1300 )
			.translate( [ 460, 330 ] )
		);
	var svg = d3.select( "#body" )
		.append( "svg:svg" )
		.attr( "width", "960px" )
		.attr( "height", "610px" );
	var counties = svg.append( "svg:g" )
		.attr( "id", "counties" );
	
	var states = svg.append( "svg:g" )
		.attr( "id", "states" );
		
	d3.json( "data/counties.geojson", function( json )
	{
		counties.selectAll( "path" )
			.data( json.features )
			.enter()
			.append( "svg:path" )
			.attr( "class", function( d )
			{
				var p = getVote( data.vote, d.properties.FIPS );
				return p;
			})
			.attr( "id", function( d )
			{
				return d.properties.FIPS;
			})
			.style( "fill-opacity", function( d )
			{
				return getOpacity( demo, d.properties.FIPS, 0.95 );
			})
			.attr( "d", path )
			.on("mousemove",showProbe)
			.on("mouseout",hideProbe)
			.append( "svg:title" )
			
			$( "#loader" ).hide();
	});
	
	d3.json( "data/states.geojson", function( json )
	{
		states.selectAll("path")
			.data( json.features )
			.enter()
			.append( "svg:path" )
			.attr( "d", path );
	});
}

function getVote( data, id )
{
	var value = data.obj[ id ];
	if( !value ) return null;
	if( value > 0 )
	{
		return "obama";
	}
	else
	{
		return "romney";
	}
}

function getOpacity( data, fips )
{
	for( var i = 0; i < data.breaks.length; i++ )
	{
		if( data.obj[ fips ] <= data.breaks[ i ] )
		{
			return opacity[ i ];
		}
	}
}

function get_sorted( obj )
{
	var arr = [];
	for( var i in obj )
	{
		arr.push( {key: i, value: obj[ i ]} );
	}
	arr.sort( function( a, b ){ return ( a.value - b.value ); } )
	return { keys: arr.map(function(d){return d.key}), values: arr.map(function(d){return d.value}) };
}

function not_zero( arr )
{
	for( var i = 0; i < arr.length; i++ )
	{
		if( arr[ i ] > 0 )
		{
			return arr[ i ];
		}
	}
}

function get_quant( raw )
{
	var arr = [];
	var gap = raw.length / 10;
	for( var i = 1; i < 10; i++ )
	{
		arr.push( raw[ Math.round( gap * i ) ] );
	}
	return arr;
}

var format = d3.format(",");
function showProbe( d )
{
	$("#probe").show()
		.html( "<p>"+d.properties.NAME+ " " +(d.properties.LSAD || "")+"</p>" +
				"<p>Margin: "+Math.round(Math.abs(data.vote.obj[d.properties.FIPS])*10000)/100+"% " + (data.vote.obj[d.properties.FIPS] > 0 ? "Obama" : "Romney") + "<p>" +
				"<p>"+demo.name+": "+format(Math.round(Math.abs(demo.obj[d.properties.FIPS])*100)/100)+"</p>" )
		.css({left: d3.event.pageX + 200 > $(window).width() ? d3.event.pageX - $("#probe").width() - 10 : d3.event.pageX + 10, top: d3.event.pageY - $("#probe").height() - 10});
	$( "#graph-inner div[name='" + d.properties.FIPS + "']" ).addClass( "graph_highlight" );
}
function hideProbe( d )
{
	$("#probe").hide();
	$( ".graph_highlight" ).removeClass( "graph_highlight" );
	var path = document.getElementById( d );
	if( path ) path.setAttribute( "class", path.getAttribute( "class" ).replace( " hover", "" ) );
}