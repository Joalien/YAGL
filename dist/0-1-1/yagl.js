var YAGL;
(function(YAGL){var Edge=function(){function Edge(eid,v1,v2){if(!isInt(eid))throw new Error("Edge: arg[0] must be an integer");if(!(v1 instanceof YAGL.Vertex&&v2 instanceof YAGL.Vertex||isInt(v1)&&isInt(v2)))throw new Error("Edge: second and third arguments must be both Vertices or integers");Object.defineProperty(this,"eid",{writable:false,value:eid});if(isInt(v1)){this.v1=new YAGL.Vertex(v1);this.v2=new YAGL.Vertex(v2)}else{this.v1=v1;this.v2=v2}this.v1.incrementDegree();this.v2.incrementDegree();this.mesh=
undefined}Edge.prototype.getEid=function(){return this.eid};Edge.prototype.getFirst=function(){return this.v1};Edge.prototype.getSecond=function(){return this.v2};Edge.prototype.getMesh=function(){return this.mesh};Edge.prototype.getAdjacentVertex=function(vid){if(vid==this.v1.vid)return this.v2.vid;else if(vid==this.v2.vid)return this.v1.vid;else return null};Edge.prototype.equals=function(e){if(!(e instanceof Edge))return false;if(e.eid==null)return false;if(this.eid=e.eid)return true};Edge.prototype.toString=
function(){var str="";for(prop in this){if(this.hasOwnProperty(prop)){prop_str=prop+": "+this[prop]+", ";str+=prop_str}str+="\t"}return str};Edge.prototype.setMesh=function(mesh){this.mesh=mesh};return Edge}();YAGL.Edge=Edge})(YAGL||(YAGL={}));var YAGL;
(function(YAGL){var Graph=function(){function Graph(scene,spec){this.vertices={};this.edges={};this.adjacencyList={};this.connectedComponents={};this.graphicsManager=new YAGL.GraphicsManager(this,scene,spec)}Graph.prototype.initialize=function(spec){this.graphicsManager.initialize(spec);this.vertices={};this.edges={};this.adjacencyList={};this.connectedComponents={}};Graph.prototype.addVertex=function(v,data){if(isInt(v))v=new YAGL.Vertex(v,data);if(v instanceof YAGL.Vertex==false)throw new Error("addVertex: argument not a Vertex");
if(this.getVertex(v.vid)!=null)return null;this.vertices[v.vid]=v;this.connectedComponents[v.vid]=0;this.graphicsManager.addVertexMesh(v);return v};Graph.prototype.addEdge=function(e,vid1,vid2){if(isInt(e)&&isInt(vid1)&&isInt(vid2))e=new YAGL.Edge(e,vid1,vid2);if(e instanceof YAGL.Edge==false)throw new Error("addEdge: argument not an Edge");if(this.getEdge(e.eid)!=null)return null;var v1=e.v1;var v2=e.v2;var u=this.getVertex(v1.vid);if(u===null)u=this.addVertex(v1);else e.v1=u;var v=this.getVertex(v2.vid);
if(v===null)v=this.addVertex(v2);else e.v2=v;if(this.adjacencyList[u.vid]===undefined){var obj=new Object;obj[e.eid]=v.vid;this.adjacencyList[u.vid]=obj}else{var obj=this.adjacencyList[u.vid];obj[e.eid]=v.vid;this.adjacencyList[u.vid]=obj}if(this.adjacencyList[v.vid]===undefined){obj=new Object;obj[e.eid]=u.vid;this.adjacencyList[v.vid]=obj}else{obj=this.adjacencyList[v.vid];obj[e.eid]=u.vid;this.adjacencyList[v.vid]=obj}if(!v.equals(u))this.unionComponents(u.vid,v.vid);this.edges[e.eid]=e;this.graphicsManager.addEdgeMesh(e);
return e};Graph.prototype.removeVertex=function(vid){var v=this.vertices[vid];if(v===undefined){console.log("removeVertex: vid does not exist ("+vid+")");return-1}var eid,e;for(eid in this.edges){e=this.edges[eid];if(v.equals(e.v1)||v.equals(e.v2))this.removeEdges(e.v1.vid,e.v2.vid)}delete this.connectedComponents[vid];delete this.vertices[vid];return 0};Graph.prototype.removeEdge=function(eid){if(eid==null)throw new Error("removeEdge: argument is null or undefined");var edge=this.edges[eid];if(edge==
null){console.log("removeEdge: eid does not exist ("+eid+")");return-1}var vid1=edge.v1.vid;vid1.decrementDegree();var vid2=edge.v2.vid;vid2.decrementDegree();delete this.adjacencyList[vid1][eid];delete this.adjacencyList[vid2][eid];delete this.edges[eid];var oldRootVid=this.findComponent(vid1);if(this.BFSearch(vid1,oldRootVid)==null){this.updateComponentLinks(vid1,oldRootVid);this.updateComponentLinks(oldRootVid,vid1);if(this.connectedComponents[vid1]===undefined)this.connectedComponents[vid1]=0}else if(this.BFSearch(vid2,
oldRootVid)==null){this.updateComponentLinks(vid2,oldRootVid);this.updateComponentLinks(oldRootVid,vid2);if(this.connectedComponents[vid2]===undefined)this.connectedComponents[vid2]=0}return 0};Graph.prototype.removeEdges=function(vid1,vid2){if(vid1==null||vid2==null)throw new Error("removeEdges:  arguments are null or undefined");var list=this.getEdges(vid1,vid2);var i;var count=0;for(i in list){this.removeEdge(list[i].eid);count++}return count};Graph.prototype.getVertex=function(vid){if(vid==null)throw new Error("getVertex: null or undefined argument");
if(this.vertices[vid]===undefined)return null;else return this.vertices[vid]};Graph.prototype.getAllVertices=function(){var vid,set=[];for(vid in this.vertices)set.push(this.vertices[vid]);return set};Graph.prototype.getEdge=function(eid){if(eid==null)throw new Error("getEdge: null or undefined argument");if(this.edges[eid]===undefined)return null;else return this.edges[eid]};Graph.prototype.getEdges=function(vid1,vid2){if(vid1==null||vid2==null){console.log("getEdges: args are null or undefined");
return null}var set=[];var e;for(eid in this.edges){e=this.edges[eid];if(vid1===e.v1.vid&&vid2===e.v2.vid||vid1===e.v2.vid&&vid2===e.v1.vid)set.push(e)}return set};Graph.prototype.getAllEdges=function(){var set=[];var eid;for(eid in this.edges)set.push(this.edges[eid]);return set};Graph.prototype.setAllVisitedFalse=function(){var vid;for(vid in this.vertices)this.vertices[vid].visited=false};Graph.prototype.isConnected=function(){var count=0;var vid;for(vid in this.connectedComponents)count++;if(count>
1)return false;else return true};Graph.prototype.findComponent=function(vid){var compVid=this.vertices[vid].component;if(compVid==vid)return vid;else return this.findComponent(compVid)};Graph.prototype.unionComponents=function(vid1,vid2){if(vid1==null||vid2==null)return;if(this.vertices[vid1]==undefined||this.vertices[vid2]==undefined)return;var root1vid=this.findComponent(vid1);var root2vid=this.findComponent(vid2);if(root1vid==root2vid)return;var rank1=this.connectedComponents[root1vid];var rank2=
this.connectedComponents[root2vid];if(rank1>rank2){this.vertices[root2vid].component=root1vid;this.connectedComponents[root2vid]=rank2++;delete this.connectedComponents[root2vid]}else{this.vertices[root1vid].component=root2vid;this.connectedComponents[root1vid]=rank1++;delete this.connectedComponents[root1vid]}return};Graph.prototype.updateComponentLinks=function(newRootVid,oldRootVid){if(newRootVid===null||oldRootVid===null)console.log("splitComponent: null vid");if(!this.adjacencyList.hasOwnProperty(newRootVid)||
!this.adjacencyList.hasOwnProperty(oldRootVid)){console.log("splitComponent: vid does not exist");return}this.vertices[newRootVid].component=newRootVid;var queue=[];queue.push(newRootVid);this.setAllVisitedFalse();this.vertices[newRootVid].setVisited(true);var curVid;while(queue.length!=0){curVid=queue.shift();var adjList=this.adjacencyList[curVid];var v;for(eid in adjList){v=this.vertices[this.edges[eid].getAdjacentVertex(curVid)];if(v.getVisited()===false){v.setVisited(true);v.component=curVid;
queue.push(v.vid)}}}return null};Graph.prototype.getConnectedVertices=function(head){var set=[],vid;for(vid in this.connectedComponents)if(this.findComponent(vid)==this.findComponent(head))set.push(vid);return set};Graph.prototype.BFSearch=function(startVid,stopVid){if(startVid==null||stopVid==null)throw new Error("BFSearch: null or undefined arguments");if(!this.adjacencyList.hasOwnProperty(startVid)){console.log("Search Failed: Invalid start vertex");return null}var queue=[];queue.push(startVid);
this.setAllVisitedFalse();this.vertices[startVid].setVisited(true);this.vertices[startVid].setParent(startVid);var curVid;while(queue.length!==0){curVid=queue.shift();if(curVid===stopVid)return curVid;var list=this.adjacencyList[curVid];var e,adjVid,v;for(eid in list){e=this.edges[eid];adjVid=e.getAdjacentVertex(curVid);v=this.vertices[adjVid];if(v.getVisited()===false){v.setVisited(true);v.setParent(curVid);queue.push(adjVid)}}}return null};Graph.prototype.getPath=function(vid1,vid2){if(this.BFSearch(vid1,
vid2)==null)return null;var path=[vid2];var parentVid=this.vertices[vid2].getParent();while(parentVid!=vid1){path.push(parentVid);parentVid=this.vertices[parentVid].getParent()}path.push(vid1);return path};function getMaxDegreeCentrality(){if(Object.keys(this.vertices).length==0)return 0;var max=this.vertices[0].getDegreeCentrality();for(vid in this.vertices){var dc=vid.getDegreeCentrality();if(dc>max)max=dc}return max}function getMaxClosenessCentrality(){if(Object.keys(this.vertices).length==0)return 0;
var max=this.vertices[0].getClosenessCentrality();for(vid in this.vertices){var dc=vid.getClosenessCentrality();if(dc>max)max=dc}return max}function setDegreeCentralityForEachVertex(){var numVertices=Object.keys(this.vertices).length;for(var vid in this.vertices)vid.setDegreeCentrality(vid.getDegree()/(numVertices-1))}function getDegreeCentrality(){var numerator=0;var denomiator=0;var degreeCentrality=0;var numVertices=Object.keys(this.vertices).length;setDegreeCentralityForEachVertex();var max=getMaxDegreeCentrality();
if(numVertices<=2){console.log("No degree centrality");return-1}for(var vid in this.vertices)numerator+=max-vid.getDegreeCentrality();denominator=(numVertices-2)*(numVertices-1);var degreeCentrality=(numerator/denominator).toFixed(2);console.log("Degree Centrality: "+degreeCentrality);return degreeCentrality}function setClosenessCentralityForEachVertex(){var numVertices=Object.keys(this.vertices).length;var paths={};var cc=0;for(var vid1 in this.vertices){var sumOfShortestPathLengths=0;for(var vid2 in this.vertices)if(vid1!=
vid2){var path=graph.getPath(vid1,vid2);sumOfShortestPathLengths+=path.length-1}vid1.setClosenessCentrality(1/sumOfPathLengths*(numVertices-1))}}function getClosenessCentrality(){if(graph.isConnected()==false){console.log("Cannot compute closeness centrality: not connected");return}var numerator=0;var denominator=0;var closenessCentrality=0;var numVertices=Object.keys(this.vertices).length;setClosenessCentralityForEachVertex();var max=this.getMaxClosenessCentrality();for(var vid in this.vertices)numerator+=
max-vid.getClosenessCentrality();denominator=(numVertices-2)*(numVertices-1)/(2*numVertices-3);closenessCentrality=numerator/denominator;console.log("Closeness centrality: "+closenessCentrality);return closenessCentrality}function getDensity(){var numVertices=Object.keys(this.vertices).length;var numEdges=Object.keys(this.edges).length;var maxEdges=numVertices*(numVertices-1)/2;var graphDensity=numEdges/maxEdges;console.log("Graph Density: "+graphDensity);return graphDensity}Graph.prototype.toString=
function(){var str="";for(vid1 in this.vertices){str+=vid1+":  ";for(eid in this.adjacencyList[vid1]){edge=this.edges[eid];vid2=edge.getAdjacentVertex(vid1);str+=vid2+" "}str+="\n"}return str};Graph.prototype.toHTMLString=function(){var str="";for(vid1 in this.vertices){str+=vid1+":  ";for(eid in this.adjacencyList[vid1]){edge=this.edges[eid];vid2=edge.getAdjacentVertex(vid1);str+=vid2+" "}str+="<br><br>";str+="Degree centrality: "+this.getDegreeCentrality()+"<br>";str+="Closeness centrality: "+this.getClosenessCentrality()+
"<br>";str+="Density: "+this.getDensity()+"<br>"}return str};return Graph}();YAGL.Graph=Graph})(YAGL||(YAGL={}));function isInt(x){var y=parseInt(x,10);return!isNaN(y)&&x==y&&x.toString()==y.toString()}
function downloadFile(url,type){return new Promise(function(resolve,reject){var request=new XMLHttpRequest;request.open("GET",url,true);request.responseType=type;request.onload=function(){if(this.status===200&&this.readyState==4)resolve(this);else reject(Error("File didn't load successfully; error code:"+this.statusText))};request.onerror=function(){reject(Error("There was a network error."))};request.send()})}
function getProperty(obj,path,defaultValue){if(obj==null||path==null)return defaultValue;var tokens=path.split(":");for(var i=0;i<tokens.length;i++)if(obj.hasOwnProperty(tokens[i]))obj=obj[tokens[i]];else return defaultValue;return obj}
function getVertexProperty(obj,vid,path,defaultValue){var vertices=getProperty(obj,"vertices",null);if(vertices==null)return defaultValue;var i,vertex;var len=vertices.length;for(i=0;i<len;i++){vertex=vertices[i];if(vertex.id==vid)return getProperty(vertex,path,defaultValue)}return null}
function getEdgeProperty(obj,eid,path,defaultValue){var edges=getProperty(obj,"edges",null);if(edges==null)return defaultValue;var i,edge;var len=edges.length;for(i=0;i<len;i++){edge=edges[i];if(edge.id==eid)return getProperty(edge,path,defaultValue)}return null}var YAGL;
(function(YAGL){var Vertex=function(vid){function Vertex(vid,data){if(!isInt(vid))throw new Error("Vertex: vid is not a number: "+String(vid));Object.defineProperty(this,"vid",{writable:false,value:vid});this.data=data;this.visited=false;this.component=this.vid;this.mesh=null;this.parent=null;this.degree=0;this.degreeCentrality=-1;this.closenessCentrality=-1}Vertex.prototype.getVid=function(){return this.vid};Vertex.prototype.getData=function(){return this.data};Vertex.prototype.getVisited=function(){return this.visited};
Vertex.prototype.getComponent=function(){return this.component};Vertex.prototype.getParent=function(){return this.parent};Vertex.prototype.getMesh=function(){return this.mesh};Vertex.prototype.getDegree=function(){return this.degree};Vertex.prototype.getDegreeCentrality=function(){return this.degreeCentrality};Vertex.prototype.getClosenessCentrality=function(){return this.closenessCentrality};Vertex.prototype.setParent=function(vid){if(vid===null){this.parent=null;return}if(!isInt(vid))throw new Error("setParent: argument is not an int");
this.parent=vid};Vertex.prototype.setVisited=function(visit){if(!(typeof visit=="boolean"))throw new Error("setVisited: attempting to set visited to a non-Boolean value");this.visited=visit};Vertex.prototype.setData=function(data){this.data=data};Vertex.prototype.setMesh=function(mesh){this.mesh=mesh};Vertex.prototype.incrementDegree=function(){this.degree++};Vertex.prototype.decrementDegree=function(){this.degree--};Vertex.prototype.setDegreeCentrality=function(centrality){this.degreeCentrality=
centrality};Vertex.prototype.setClosenessCentrality=function(centrality){this.closenessCentrality=centrality};Vertex.prototype.equals=function(v){if(!(v instanceof Vertex))return false;if(this.vid===v.vid)return true;else return false};Vertex.prototype.toString=function(){var str="vid:"+this["vid"]+"\n";for(prop in this)if(this.hasOwnProperty(prop)){prop_str=prop+": "+this[prop]+"\n";str+=prop_str}return str};return Vertex}();YAGL.Vertex=Vertex})(YAGL||(YAGL={}));var YAGL;
(function(YAGL){var GraphBuilder=function(){function GraphBuilder(scene,spec){this.scene=scene;this.slowBuild=true;this.vIndex=0;this.eIndex=0;this.spec=spec;this.graph=new YAGL.Graph(scene,spec)}GraphBuilder.prototype.initialize=function(spec){this.graph.initialize(spec);this.spec=spec;this.vIndex=0;this.eIndex=0};GraphBuilder.prototype.getGraph=function(){return this.graph};GraphBuilder.prototype.build=function(){if(this.spec!==null&&typeof this.spec==="object")this.buildFromJSONObj(this.spec)};
GraphBuilder.prototype.buildUsingJSONFile=function(url){downloadFile(url,"json",this).then(function(request){builder.buildUsingJSONObj(request.response)})["catch"](function(Error){console.log(Error)})};GraphBuilder.prototype.buildUsingJSONObj=function(spec){this.initialize(spec);var vertices=getProperty(spec,"vertices",null);var edges=getProperty(spec,"edges",null);this.addVertices(vertices,edges,this)};GraphBuilder.prototype.appendUsingJSONObj=function(obj){var vertices=getProperty(obj,"vertices",
null);var edges=getProperty(obj,"edges",null);this.vIndex=0;this.eIndex=0;this.addVertices(vertices,edges,this)};GraphBuilder.prototype.addVertices=function magic(vertices,edges,gb){if(vertices==null||gb.vIndex==vertices.length){gb.addEdges(edges,gb);return}var vertex,id,data,v;while(gb.vIndex<vertices.length){vertex=vertices[gb.vIndex];id=vertex.hasOwnProperty("id")?vertex.id:null;data=vertex.hasOwnProperty("data")?vertex.data:null;v=gb.graph.addVertex(id,data);gb.vIndex++;if(gb.slowBuild){setTimeout(magic,
400,vertices,edges,gb);return}}gb.addEdges(edges,gb)};GraphBuilder.prototype.addEdges=function magic2(edges,gb){if(edges==null||gb.eIndex==edges.length)return;var eid,vid1,vid2,e,path;while(gb.eIndex<edges.length){eid=edges[gb.eIndex].id;vid1=edges[gb.eIndex].v1;vid2=edges[gb.eIndex].v2;e=gb.graph.addEdge(eid,vid1,vid2);gb.eIndex++;if(gb.slowBuild){setTimeout(magic2,600,edges,gb);return}}};GraphBuilder.prototype.setSlowBuild=function(value){this.slowBuild=value};GraphBuilder.prototype.getSlowBuild=
function(){return this.slowBuild};return GraphBuilder}();YAGL.GraphBuilder=GraphBuilder})(YAGL||(YAGL={}));var YAGL;
(function(YAGL){var GraphicsManager=function(){function GraphicsManager(graph1,scene,spec){this.graph=graph1;graph=this.graph;this.scene=scene;this.assetsManager=new BABYLON.AssetsManager(scene);this.assetsManager.useDefaultLoadingScreen=false;this.initialize(spec)}GraphicsManager.prototype.initialize=function(spec){this.disposeAllMeshes();this.spec=spec;var layoutType=getProperty(spec,"layout",null);if(layoutType=="Force Directed")this.layoutManager=new YAGL.ForceDirectedLayout(this.graph,5,.9,10,
.9,.01);else this.layoutManager=null};GraphicsManager.prototype.addVertexMesh=function(v){this.assetsManager.reset();var vid=v.vid;v.mesh=BABYLON.Mesh.CreatePlane(String(vid),1,this.scene);v.mesh.visibility=false;var pos=getVertexProperty(this.spec,vid,"position",null);if(pos!==null)v.mesh.position=new BABYLON.Vector3(pos[0],pos[1],pos[2]);else if(this.layoutManager!=null)this.layoutManager.updateLayout();var meshName,rootUrl,sceneFilename;var meshInfo=getVertexProperty(this.spec,vid,"mesh",null);
if(meshInfo!==null){meshName=getProperty(meshInfo,"meshName",null);rootUrl=getProperty(meshInfo,"rootUrl",null);sceneFilename=getProperty(meshInfo,"sceneFilename",null)}else{meshName=getProperty(this.spec,"vertexMesh:meshName",null);rootUrl=getProperty(this.spec,"vertexMesh:rootUrl",null);sceneFilename=getProperty(this.spec,"vertexMesh:sceneFilename",null)}if(meshName==null||rootUrl==null||sceneFilename==null){var oldMesh=v.mesh;var pos=oldMesh.position;oldMesh.dispose();var newMesh=BABYLON.Mesh.CreateSphere("v"+
v.vid,32,2,this.scene,true,BABYLON.Mesh.DEFAULTSIDE);newMesh.position=pos;v.mesh=newMesh;return}var meshTask=this.assetsManager.addMeshTask(String(vid),meshName,rootUrl,sceneFilename);meshTask.onSuccess=function(task){var v=graph.getVertex(task.name);var oldMesh=v.mesh;var pos=oldMesh.position;oldMesh.dispose();var newMesh=task.loadedMeshes[0];newMesh.name="v"+task.name;newMesh.position=pos;v.mesh=newMesh};meshTask.onError=function(task){console.log("GraphicsManager: unable to load vertex mesh")};
this.assetsManager.load()};GraphicsManager.prototype.addEdgeMesh=function(e){var eid=e.eid;var path=[];path.push(e.v1.mesh.position);path.push(e.v2.mesh.position);e.mesh=this.createTube(eid,path)};GraphicsManager.prototype.createTube=function(eid,path){var radius=getProperty(this.spec,"edgeMesh:args:radius",.1);var tess=getProperty(this.spec,"edgeMesh:args:tesselation",32);var mesh=BABYLON.Mesh.CreateTube("e"+eid,path,radius,tess,null,BABYLON.Mesh.NO_CAP,this.scene,true,BABYLON.Mesh.FRONTSIDE);var visibility=
getProperty(this.spec,"edgeMesh:visibility",true);mesh.visibility=visibility;mesh.material=new BABYLON.StandardMaterial("mat",this.scene);var rgb=getProperty(this.spec,"edgeMesh:color",[1,1,1]);mesh.material.diffuseColor=new BABYLON.Color3(rgb[0],rgb[1],rgb[2]);return mesh};GraphicsManager.prototype.updateLayout=function(){if(this.layoutManager!=null)this.layoutManager.updateLayout()};GraphicsManager.prototype.disposeAllMeshes=function(){for(i in this.scene.meshes)this.scene.meshes[i].dispose();this.scene.meshes=
[]};return GraphicsManager}();YAGL.GraphicsManager=GraphicsManager})(YAGL||(YAGL={}));var YAGL;
(function(YAGL){var ForceDirectedLayout=function(){function ForceDirectedLayout(graph,size,stiffness,repulsion,damping,minEnergyThreshold){this.graph=graph;this.size=size==undefined?1:size;this.stiffness=stiffness;this.repulsion=repulsion;this.damping=damping;this.minEnergyThreshold=minEnergyThreshold||.01;this.nodePoints={};this.edgeSprings={}}ForceDirectedLayout.prototype.point=function(node){vid=node.getVid();if(!(vid in this.nodePoints)){var mass=1;this.nodePoints[vid]=new ForceDirectedLayout.Point(Vector.random(),
mass)}return this.nodePoints[vid]};ForceDirectedLayout.prototype.spring=function(e){if(!(e.getEid()in this.edgeSprings)){var length=1;var existingSpring=false;var edges=this.graph.getEdges(e.v1,e.v2);for(e in edges)if(existingSpring===false&&e.getEid()in this.edgeSprings)existingSpring=this.edgeSprings[e.getEid()];if(existingSpring!==false)return new ForceDirectedLayout.Spring(existingSpring.point1,existingSpring.point2,0,0,0);this.edgeSprings[e.eid]=new ForceDirectedLayout.Spring(this.point(e.getFirst()),
this.point(e.getSecond()),length,this.stiffness)}return this.edgeSprings[e.eid]};ForceDirectedLayout.prototype.eachNode=function(callback){var t=this;nodes=this.graph.vertices;for(vid in nodes)callback.call(t,nodes[vid],t.point(nodes[vid]))};ForceDirectedLayout.prototype.eachEdge=function(callback){var t=this;edges=this.graph.edges;for(eid in edges)callback.call(t,edges[eid],t.spring(edges[eid]))};ForceDirectedLayout.prototype.eachSpring=function(callback){var t=this;edges=this.graph.edges;for(eid in edges)callback.call(t,
t.spring(edges[eid]))};ForceDirectedLayout.prototype.applyCoulombsLaw=function(){this.eachNode(function(n1,point1){this.eachNode(function(n2,point2){if(point1!==point2){var d=point1.p.subtract(point2.p);var distance=d.magnitude()+.1;var direction=d.normalise();point1.applyForce(direction.multiply(this.repulsion).divide(distance*distance*.5));point2.applyForce(direction.multiply(this.repulsion).divide(distance*distance*-.5))}})})};ForceDirectedLayout.prototype.applyHookesLaw=function(){this.eachSpring(function(spring){var d=
spring.point2.p.subtract(spring.point1.p);var displacement=spring.length-d.magnitude();var direction=d.normalise();spring.point1.applyForce(direction.multiply(spring.k*displacement*-.5));spring.point2.applyForce(direction.multiply(spring.k*displacement*.5))})};ForceDirectedLayout.prototype.attractToCentre=function(){this.eachNode(function(node,point){var direction=point.p.multiply(-1);point.applyForce(direction.multiply(this.repulsion/50))})};ForceDirectedLayout.prototype.updateVelocity=function(timestep){this.eachNode(function(node,
point){point.v=point.v.add(point.a.multiply(timestep)).multiply(this.damping);point.a=new Vector(0,0,0)})};ForceDirectedLayout.prototype.updatePosition=function(timestep){this.eachNode(function(node,point){point.p=point.p.add(point.v.multiply(timestep));node.mesh.position=new BABYLON.Vector3(point.p.x,point.p.y,point.p.z);if(point.p.x==0&&point.p.y==0&&point.p.z==0)return;var eidList=this.graph.adjacencyList[node.vid];for(eid in eidList){var path=[];var pos1=this.graph.vertices[node.vid].mesh.position;
var pos2=this.graph.vertices[eidList[eid]].mesh.position;if(pos1==pos2)return;path.push(pos1);path.push(pos2);this.graph.edges[eid].mesh.freezeNormals();this.graph.edges[eid].mesh=BABYLON.Mesh.CreateTube(null,path,.1,null,null,null,null,null,null,this.graph.edges[eid].mesh)}})};ForceDirectedLayout.prototype.totalEnergy=function(timestep){var energy=0;this.eachNode(function(node,point){var speed=point.v.magnitude();energy+=.5*point.m*speed*speed});return energy};ForceDirectedLayout.prototype.stop=
function(){this._stop=true;this._started=false};ForceDirectedLayout.prototype.tick=function(timestep){this.applyCoulombsLaw();this.applyHookesLaw();this.attractToCentre();this.updateVelocity(timestep);this.updatePosition(timestep)};ForceDirectedLayout.prototype.updateLayout=function(){var t=this;if(this._started)return;t._started=true;t._stop=false;var run=true;var counter=0;while(run){t.tick(.03);if(t.totalEnergy()<t.minEnergyThreshold)run=false;counter++}t.stop()};var Vector=YAGL.Vector=function(x,
y,z){this.x=x;this.y=y;this.z=z};Vector.random=function(){return new Vector(10*(Math.random()-.5),10*(Math.random()-.5),10*(Math.random()-.5))};Vector.prototype.add=function(v2){return new Vector(this.x+v2.x,this.y+v2.y,this.z+v2.z)};Vector.prototype.subtract=function(v2){return new Vector(this.x-v2.x,this.y-v2.y,this.z-v2.z)};Vector.prototype.multiply=function(n){return new Vector(this.x*n,this.y*n,this.z*n)};Vector.prototype.divide=function(n){return new Vector(this.x/n||0,this.y/n||0,this.z/n||
0)};Vector.prototype.magnitude=function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)};Vector.prototype.normal=function(){return new Vector(-this.y,this.x,this.z)};Vector.prototype.normalise=function(){return this.divide(this.magnitude())};ForceDirectedLayout.Point=function(position,mass){this.p=position;this.m=mass;this.v=new Vector(0,0,0);this.a=new Vector(0,0,0)};ForceDirectedLayout.Point.prototype.applyForce=function(force){this.a=this.a.add(force.divide(this.m))};ForceDirectedLayout.Spring=
function(point1,point2,length,k){this.point1=point1;this.point2=point2;this.length=length;this.k=k};return ForceDirectedLayout}();YAGL.ForceDirectedLayout=ForceDirectedLayout})(YAGL||(YAGL={}));var YAGL;
(function(YAGL){var Layout=function(){function Layout(scene,graph,size){this.scene=scene;this.graph=graph;this.usedVectors={};this.lineList={};this.x=0;this.y=0;this.z=0;this.size=size==undefined?1:size}Layout.prototype.placeVertices=function(){var x=this.x;var y=this.y;var z=this.z;for(vid in this.graph.vertices){node=this.graph.vertices[vid];if(node.mesh==undefined){var size=this.size;console.log("x:  "+x+", y:  "+y+", z:  "+z);node.mesh=new BABYLON.Mesh.CreateSphere("test",10,size,this.scene,true,
BABYLON.Mesh.FRONTSIDE);node.mesh.position=new BABYLON.Vector3(x,y,z);this.usedVectors[vid]=[x,y,z];if(x<=y&&x<=z)x+=2*size;else if(y<=z)y+=2*size;else z+=2*size}}};Layout.prototype.placeLines=function(){var edges=this.graph.edges;this.removeLines();var lines;for(eid in edges){lines=[];var vid=edges[eid].getFirst().getVid();console.log("vid:  "+vid);lines.push(this.graph.vertices[vid].mesh.position);vid=edges[eid].getSecond().getVid();console.log("vid2:  "+vid);lines.push(this.graph.vertices[vid].mesh.position);
edges[eid].mesh=new BABYLON.Mesh.CreateLines(eid,lines,this.scene)}};Layout.prototype.removeLines=function(){var edges=this.graph.edges;for(eid in edges)if(edges[eid].mesh!==undefined)edges[eid].mesh.dispose()};return Layout}();YAGL.Layout=Layout})(YAGL||(YAGL={}));