var width = 600,
    height = 600,
    root;

var force = d3.layout
  .force()
  .size([width, height])
  .on('tick', tick)

var svg = d3.select('#svg-wrap').append('svg')
  .attr('width', width)
  .attr('heigth', height)


function tick() {
  link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })

  node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
}