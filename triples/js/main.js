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

var currentClickNode = null
var currentTotalData = {
  nodes: [],
  links: []
}
var firstFlag = true

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
  console.log('res', res)
  var nodes = [];
  var nodeArr = [];
  var links = [];
  var obj = {};
  res.forEach((c, i, a) => {
    obj = {}
    obj.source = c.source;
    obj.target = c.target;
    obj.relation = c.relation;
    obj.label = c.label;
    links.push(obj);
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
  var currentLinks = []
  currentLinks = totalData.links.filter(c => {
    if (!firstFlag && c.source === currentName) {
      currentNodesName.push(c.target)
      return c
    }
    if (!firstFlag && c.target === currentName) {
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
  console.log('currentLinks', currentLinks)
  currentClickNode = totalData.nodes[0]
  currentTotalData = {
    nodes: [totalData.nodes[0]],
    links: currentLinks
  }
  var r = chart(currentTotalData)
  // var r = chart(totalData)
  // document.getElementById('svg-wrap').appendChild(r)
});

/**
 * 先不考虑首次加载
 * @param {点击的当前节点名称} name 
 * @param {当前已经存在的node、link} total 
 */
function handleClick(name, total) {
  var result = []
  // 从totalData里遍历获取直接相关的links
  var links = []
  totalData.links.forEach((c, i, a) => {
    if (c.source === name || c.target === name) {
      links.push(c)
    }
  })
  console.log('links', links)
  // 和已经存在的合并，删除重复的
  var linkFlag = false
  var cLinks = currentTotalData.links
  links.forEach((c, i, a) => {
    linkFlag = false
    for(let j = 0; j < cLinks.length; j++) {
      if (cLinks[j].source === c.source && cLinks[j].target === c.target) {
        linkFlag = true
      }
    }
    if (!linkFlag) {
      currentTotalData.links.push(c)
    }
  })
  // 判断点击节点直接相关的links是否已经存在
  // 若全部存在，则提示没有新节点了，不重新渲染
  if (linkFlag) {
    alert(`和【${name}】相关的全部节点都已经显示了`)
    return
  }
  // 遍历currentTotalData.links里的节点,currentTotalData.links是合并后的
  var nodes = []
  currentTotalData.links.forEach((c, i, a) => {
    nodes.push(c.source)
    nodes.push(c.target)
  })
  console.log('nodes', nodes)
  // 先去重
  nodes = nodes.filter((c, i, a) => {
    return a.indexOf(c, 0) === i
  })
  console.log('nodes', nodes)
  // 再生成渲染的nodes
  currentTotalData.nodes = nodes.map(c => {
    return {
      id: c
    }
  })
  // currentTotalData = {
  //   nodes: [{
  //     id: '金蝉子'
  //   }, {
  //     id: '唐僧'
  //   }],
  //   links: [{
  //     source: '金蝉子',
  //     target: '唐僧',
  //     relation: 'past_lift',
  //     label: '前世'
  //   }]
  // }
  console.log('currentTotalData', currentTotalData)
  d3.select('svg').remove()
  chart(currentTotalData)
}

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

  // const svg = d3.create("svg")
  //     .attr("viewBox", [0, 0, width, height])
  
  var svg = d3.select('#svg-wrap').append('svg')
    .attr("viewBox", [0, 0, width, height])


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
                  .attr("fill", "none")
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
      .on('click', click)
  

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

function click(d) {
  console.log('d', d)
  console.log('currentClickNode', currentClickNode)
  console.log('currentTotalData', currentTotalData)
  console.log('totalData', totalData)
  // 根据当前点击节点，在totalData里找到所有直接有关的节点
  // 1. 根据links得到相关的点
  // 2.
  handleClick(d.id, currentTotalData)
  // d3.select('svg').remove()
  // chart(currentTotalData)
}