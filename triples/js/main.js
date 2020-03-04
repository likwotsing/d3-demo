var height = 600;
var width = 1200;
var color = (function() {
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return d => scale(d.group);  
}());
var totalData = {
  nodes: [],
  links: []
};

// d3.json('./mock/miserables.json').then(function(data) {
//   console.log('data', data)
//   var r = chart(data)
//   document.getElementById('main').appendChild(r)
// })

d3.dsv(",", "./mock/triples.csv", function(d) {
  return {
    source: d.head,
    target: d.tail,
    relation: d.relation,
    label: d.label
  }
}).then(function(res) {
  console.log('res', res);
  var nodes = [];
  var nodeArr = [];
  var links = [];
  var groups = new Set();
  var obj = {};
  res.forEach((c, i, a) => {
    obj = {}
    obj.source = c.source;
    obj.target = c.target;
    obj.relation = c.relation;
    obj.label = c.label;
    links.push(obj);
    // // groups
    // groups.add(c.relation);
    // nodes
    nodeArr.push(c.source)
    nodeArr.push(c.target)
  });
  // nodes去重
  nodeArr = unique(nodeArr)
  nodeArr.forEach((c, i, a) => {
    nodes.push({
      id: c
    })
  });
  totalData.nodes = nodes;
  totalData.links = links;
  // 过滤，只有第一个值
  var currentNodes = []
  var currentNodesName = []
  currentNodesName.push(totalData.nodes[1].id)
  var currentName = totalData.nodes[1].id
  var currentLinks = totalData.links.filter(c => {
    if (c.source === currentName) {
      currentNodesName.push(c.target)
      return c
    }
    if (c.target === currentName) {
      currentNodesName.push(c.source)
      return c
    }
  })
  currentNodesName = unique(currentNodesName)
  currentNodesName.forEach((c, i, a) => {
    currentNodes.push({
      id: c
    })
  });
  var r = chart({
    nodes: currentNodes,
    links: currentLinks
  })
  document.getElementById('main').appendChild(r)
});

function unique(arr) {
  return arr.filter((c, i, a) => {
    return a.indexOf(c, 0) === i;
  })
}

function drag(simulation) {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

function chart(data) {
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const link = svg.append("g")
                  .attr('fill', 'none')
                  .attr("stroke-width", 1.5)
                .selectAll('g')
                .data(links)
                .join("g")
  var mylink = link.append('line')
                  .attr("stroke-width", 1)
                  .attr('stroke', '#ccc')
  
  var mytext = link.append('text')
                  .attr("fill", "#409EFF")
                  .text(d => {
                    return d.label
                  })
                .clone(true).lower()
                  .attr("fill", "#409EFF")
                  .attr("stroke", "none")
                  .attr("stroke-width", 1);


  const node = svg.append("g")
                  .attr('fill', 'currentColor') 
                  .attr("stroke-linecap", "round")
                  .attr("stroke-linejoin", "round")
                .selectAll('g')
                .data(nodes)
                .join("g")
                  .call(drag(simulation))


  node.append('circle')
      .attr("r", 5)
      .attr("fill", color)
  
  node.append('text')
      .attr("x", 8)
      .attr("y", "0.31em")
      .text(d => d.id)
    .clone(true).lower()
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 3);

  simulation.on("tick", () => {
    mylink
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
    mytext
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => {
        return (d.source.y + d.target.y) / 2
      })
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  // invalidation.then(() => simulation.stop());

  return svg.node();
}