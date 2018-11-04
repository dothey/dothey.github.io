/*
  TODO: make csv upload input
  TODO: add events for edge highlighting on node click
*/

  var i,
      s,
      o,
      csv_header,
      unique_category_counts,
      step = 0,
      arbitraryCsvFile="https://s3-us-west-2.amazonaws.com/s.cdpn.io/6337/hondiff.csv";


function createGraph(g){
  if (typeof s != "undefined"){
    s.graph.clear();
    s.refresh()
  }

      s = new sigma({
        graph: g,
        container: 'graph-container',
        type: 'webgl',
        settings: {
          labelThreshold: 5,
          animationsTime: 4000,
          skipErrors: true,
          //edgeColor:"rgb(255,0,0)",
          //drawEdges:false,
          minNodeSize:0,
          maxNodeSize:0,
           autoSettings: true,
    linLogMode: false,
    outboundAttractionDistribution: false,
    adjustSizes: true,
    edgeWeightInfluence: .1,
    scalingRatio: 1,
    strongGravityMode: false,
    gravity: 10,
    jitterTolerance: 2,
    barnesHutOptimize: true,
    barnesHutTheta: 1.2,
    speed: 10,
    outboundAttCompensation: 1,
    totalSwinging: 0,
    totalEffectiveTraction: 0,
    complexIntervals: 500,
    simpleIntervals: 1000,
          //batchEdgesDrawing:true,
//          webglEdgesBatchSize:1000
        }
      });
  //not sure how to give options to forceatlas2
/*  s.forceatlas2.options={
   
  };*/
  s.startForceAtlas2();
}

function generateColorMap(list){
  var cmap={};
  var len = list.length;
  for(var i=0;i<len;i++){
    cmap[list[i]] = "#"+(
      Math.floor(5000000+i*(10777215/len)).toString(16)+ '000000').substr(0,6);
  }
  return cmap;
  
}
function generateVertex(name,i,n,columnColorMap,cell_idx,row_idx){
if (name === "FALSE") {
return null    
} 

 return {
          id:  name,
          label: name,
          circular_x: 8 * Math.cos(2*Math.PI*i / 8 - Math.PI / 2),
          circular_y: 8 * Math.sin(2*Math.PI*i / 8 - Math.PI / 2),
          circular_size: 4,
          circular_color: columnColorMap[name.split(":")[0]],
          x: i,
          y: Math.floor(i/csv_header.length),
          size: 6,
          color: columnColorMap[name.split(":")[0]],
          grid_x: 10 + (cell_idx*100),
          grid_y: 10 +  (row_idx*10),//Math.floor(n * Math.cos(Math.PI*i / n - Math.PI / 2)),
          grid_size: 4,
          grid_color: columnColorMap[name.split(":")[0]]
        };
}


function csv2graph(body){
 
  var rows = body.split(/\r\n|\n/);
  
  var num_rows = rows.length;
  var vtx_cache={};
  var row,cells;
  num_rows = 40;
  var num_columns = 9;
  var byrow = rows.slice(0,num_rows);
  csv_header = byrow.shift();
  csv_header = csv_header.split(/\,/).slice(0,num_columns);
  var columnColorMap = generateColorMap(csv_header);
  var length = csv_header.length;
  var vtx_id = 0;
  var edge_id = 0;
  var g = { nodes: [], edges: []}
  // for every row
  for(var a in byrow){
    cells = byrow[a].split(/\,/).slice(0,num_columns);
    // for every cell
    for(var i in cells){
      cell_name_a = csv_header[i]+":"+cells[i];
      //is the vertex unique?
      if(typeof vtx_cache[cell_name_a] === "undefined"){
        o = generateVertex(cell_name_a, ++vtx_id, num_rows, columnColorMap, i,a );
        vtx_cache[cell_name_a] = i;
        // apply basic attributes
        g.nodes.push(o);
      }
      // n choose 2 cells in a row
      for(var j=length-1; j > i; j--){ 
        g.edges.push({
          id: 'e'+edge_id++,
          source: cell_name_a,
          target: csv_header[j]+":"+cells[j],
        });
      }   
    }
  }
  return g;
}

$('#circular').click(function(){
    s.stopForceAtlas2();
  sigma.plugins.animate(
    s,
    {
      x: 'circular_x',
      y: 'circular_y',
      size: 'circular_size',
      color: 'circular_color'
    }
  );
});
$('#grid').click(function(){
  s.stopForceAtlas2();
  sigma.plugins.animate(
    s,
    {
      x: 'grid_x',
      y: 'grid_y',
      size: 'grid_size',
      color: 'grid_color'
    }
  );
});
$('#start-force').click(function(){
  s.startForceAtlas2();
});
$('#stop-force').click(function(){
  s.stopForceAtlas2();
});
$('#clear').click(function(){
  s.graph.clear();
  s.refresh();
});


$.get(arbitraryCsvFile,function(body){
  createGraph(csv2graph(body));
});

function handleFileSelect(e) {
  if (e.target.files != undefined) {
    var reader = new FileReader();
    reader.onload = function(e) {
      createGraph(csv2graph(e.target.result));
    };
    reader.readAsText(e.target.files.item(0));
  }
 }


document.getElementById('file').addEventListener('change', handleFileSelect, false);