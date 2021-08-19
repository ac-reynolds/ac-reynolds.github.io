const EXTERNAL_HOST = "https://ac-reynolds.github.io/2CSnrOIn/GihaUtils/"
const TEST_WORLD_URL = EXTERNAL_HOST + "Data/TestWorld.json";
const VILLAGE_SVG_URL = EXTERNAL_HOST + "Assets/bs_house.svg";
const FOREST_SVG_URL = EXTERNAL_HOST + "Assets/bs_tree.svg";

const nodeColors = {"village": "#000000", "forest": "#FFFFFF"};
const nodeSize = 15;

function initializeNode(n) {
  n.attr("r", nodeSize);
  n.attr("cy", function(_, i) { return Math.floor(i / 5) * 100 + 50;});
  n.attr("cx", function(_, i) { return (i % 5) * 100 + 50; });
  n.style("fill", function(d, _) {console.log(d); return nodeColors[d.type]});
}

function initializeLink(l) {
}

function generateGraph() {

  var graph = d3.select("#graph");

  d3.json(TEST_WORLD_URL, function(data) {
    console.log(data);

    node = graph
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle");

    link = graph
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line");

    initializeNode(node);
    initializeLink(link);

    var simulation = d3.forceSimulation(data.nodes)
      .force("center", d3.forceCenter(256, 256))
      .on("end", ticked);

    function ticked() {
      console.log("ticking");
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
  
      node
           .attr("cx", function (d) { return d.x+6; })
           .attr("cy", function(d) { return d.y-6; });
    }
  });
}
