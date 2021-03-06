
var width = 800,
    height = 600;


var margin = {top: 20, right: 100, bottom: 110, left: 100},
			width = +map.attr("width") - margin.left - margin.right,
			height = +map.attr("height") - margin.top - margin.bottom;

var chart = d3.select("#chart").append("svg")
    .attr("width", width + margin.right)
    .attr("height", width + margin.bottom),
    g = chart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

var y = d3.scaleLinear()
    .rangeRound([width, 0]);

var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.csv("data/neigh_311.csv", function(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) {
    t += d[columns[i]] = +d[columns[i]];
    //console.log(d[columns[i]])
  }
  d.total = t;
  //console.log(d.total);
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  data.sort(function(u, v) { return v.total - u.total; });
  x.domain(data.map(function(d) { d.Name.split(' ').join('_'); }));
  y.domain([0, d3.max(data, function(d) { return +d.total; })]).nice();
  z.domain(keys)

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
    .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.Name.split(' ').join('_')); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth())
      .attr("class", function (d) { return d.data.Name.split(' ').join('_');})
      .on("mouseover", function(d) {
        //console.log(d)
        d3.selectAll("." + d.data.Name.split(' ').join('_')).classed("hover", true);
      })
      .on("mouseout", function(d){
        d3.selectAll("." + d.data.Name.split(' ').join('_')).classed("hover", false);
      });


  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");;;

  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Total 311 Calls");

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) {return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
});
