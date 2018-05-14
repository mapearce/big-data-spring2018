	// CHOROPLETH MAP
	// set width and height of graphic
	var mapwidth = 800,
	mapheight = 500;

	var projection = d3.geoAlbers()
	.scale( 150000 )
	.rotate( [71.057,0] )
	.center( [0, 42.313] )
	.translate( [400, 300] );

	// d3 geopath for projection
	var path = d3.geoPath()
		.projection(projection);

	// create SVG elements in map HTML element
	var map = d3.select("#map").append("svg")
		.attr("width", mapwidth)
		.attr("height", mapheight);


	// var chart = d3.select("#chart").append("svg")
	// 	.attr("width", width)
	// 	.attr("height", height);

	// set color
	var x = d3.scaleLinear()
			.domain([0, 0.1, 0.2, 0.3, 0.4])
			.rangeRound([420, 480]);

	var color = d3.scaleThreshold()
			.domain([0, 0.1, 0.2, 0.3, 0.4])
			.range(d3.schemeBlues[5]);

	var g = map.append("g")
			.attr("class", "key")
			.attr("transform", "translate(0,40)");

	var tooltip = d3.select("body")
		.append("div")
			.style("position", "absolute")
			.style("font-family", "'Open Sans', sans-serif")
			.style("font-size", "12px")
			.style("z-index", "10")
			.style("background-color", "white")
			.style("padding", "5px")
			.style("opacity", "0.7")
			.style("visibility", "hidden");

	g.selectAll("rect")
		.data(color.range().map(function(d) {
				d = color.invertExtent(d);
				if (d[0] == null) d[0] = x.domain()[0];
				if (d[1] == null) d[1] = x.domain()[1];
				return d;
			}))
		.enter().append("rect")
			.attr("height", 8)
			.attr("x", function(d) { return x(d[0]); })
			.attr("width", function(d) { return x(d[1]) - x(d[0]); })
			.attr("fill", function(d) { return color(d[0]); });

		g.append("text")
				.attr("class", "caption")
				.attr("x", x.range()[0])
				.attr("y", -6)
				.attr("fill", "#000")
				.attr("text-anchor", "start")
				.attr("font-weight", "bold")
				.text("% of 311 Requests from Twitter");

		g.call(d3.axisBottom(x)
				.tickSize(13)
				.tickFormat(function(x, i) { return i ? x : x + "%"; })
				.tickValues(color.domain()))
			.select(".domain")
				.remove();

	d3.queue()
		.defer(d3.json, "data/boston_neigh.json") // Load Hoods
		.defer(d3.csv, "data/boston_311_totals.csv") // Load 311s
		.await(ready); // Run 'ready' when JSONs are loaded

	function ready(error, neigh, calls) {
		if (error) throw error;

		var calls_pct = {}; // Create empty object for holding dataset
		var neighById = {};

		calls.forEach(function(d) {
			// console.log((d.twit_count / d.tot_count) * 100)
			calls_pct[d.id] = +((d.twit_count / d.tot_count) * 100); // Create property for each ID, give it value from rate
			neighById[d.id] = d.Name.split(' ').join('_');
		});

		map.append("g")
				.attr("class", "neighborhoods")
			.selectAll("path")
				.data(topojson.feature(neigh, neigh.objects.boston_neigh).features) // Bind TopoJSON data elements
			.enter().append("path")
				.attr("d", path)
				.style("fill", function(d) {
					return color(calls_pct[d.properties.OBJECTID]); })
				.attr("class", function(d) { return neighById[d.properties.OBJECTID]; })
				//.style("stroke", "white")
				.on("mouseover", function(d){
					//console.log(d)
					d3.selectAll("." + neighById[d.properties.OBJECTID]).classed("hover", true);
					//return tooltip.style("visibility", "visible").text(d.properties.Name + ": " + calls_pct[d.properties.OBJECTID].toFixed(2) + "%");
				})
				//.on("mousemove", function(d){
					//d3.select(this).style("fill",function(d) { return color(calls_pct[d.properties.OBJECTID])});
					//d3.selectAll("." + neighById[d.properties])
					//return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").text(d.properties.Name + ": " + calls_pct[d.properties.OBJECTID].toFixed(2) + "%");})
				.on("mouseout", function(d){
					d3.select(this).style("fill", function(d) { return color(calls_pct[d.properties.OBJECTID])});
					d3.selectAll("." + neighById[d.properties.OBJECTID]).classed("hover",false)
					//return tooltip.style("visibility", "hidden");
				});

				var x = d3.scaleBand()
					.rangeRound([0, mapwidth])
					.paddingInner(0.05)
					.align(0.1);

				// set y scale
				var y = d3.scaleLinear()
					.rangeRound([mapheight, 0]);

					var z = d3.scaleOrdinal()
						.range(["#2166ac","#b2182b","#aaa"]);

					var keys = calls.columns.slice(1);
				}
