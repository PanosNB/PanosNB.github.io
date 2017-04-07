// Disc golf game
// By Julie Isip & Yves Miao, Fall 2014
// CS 4735, UNB Fredericton
// Based off of: ColoredCube.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_MdlMatrix;\n' +
  'uniform mat4 u_NMdlMatrix;\n' +
  'uniform float u_NormalDirection;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec4 v_Normal;\n' +
  'varying vec4 zpos;\n'+
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_MdlMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '  v_Position = u_MdlMatrix * a_Position;\n' +
  '  v_Normal = u_NormalDirection * u_NMdlMatrix *a_Normal;\n' +
   //'  zpos = a_Position;\n' +
	
  '}\n';

// Fragment shader program
var FSHADER_SOURCE = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec4 v_Normal;\n' +
  'varying vec4 zpos;\n'+
  'uniform vec4 u_Ambient;\n' +
  'uniform vec4 u_Diffuse;\n' +
  'uniform vec4 u_Specular;\n' +
  'uniform vec4 u_LightLocation;\n' +
  'uniform vec4 u_Eye;\n' +
  'void main() {\n' +
  '  float nDotL = max(0.0, dot(normalize(v_Normal), normalize(u_LightLocation-v_Position)));\n' +
  '  float hDotL = max(0.0, dot(normalize(v_Normal), normalize(normalize(u_LightLocation-v_Position)+normalize(u_Eye-v_Position))));\n' +
  '  gl_FragColor = v_Color*u_Ambient + v_Color*u_Diffuse*nDotL + v_Color*u_Specular*pow(hDotL, 256.0);\n' +
  //'  gl_FragColor = v_Color *(sin(zpos*10000000.0*zpos.x*zpos.y*zpos.z)+1.0)/2.0;\n' +
  '}\n';
  
  // Vertex shader for single color drawing
var VSHADER_SOURCE2 =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_MdlMatrix;\n' +
  'uniform mat4 u_NMdlMatrix;\n' +
  'uniform float u_NormalDirection;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec4 v_Normal;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_MdlMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '  v_Position = u_MdlMatrix * a_Position;\n' +
  //'  v_Normal = u_NormalDirection * u_NMdlMatrix *a_Normal;\n' +
  //'  v_Normal = u_NormalDirection * u_NMdlMatrix *vec4(a_Position.x, 0.0, a_Position.z, 0.0);\n' +
  ' if (a_Normal == vec4(0.0,0.0,0.0,0.0)){ v_Normal = u_NormalDirection * u_NMdlMatrix *vec4(a_Position.x, a_Position.y, 0.0, 0.0);}  else {v_Normal = u_NormalDirection * u_NMdlMatrix *a_Normal;}' +
  
'}\n'; 

// Fragment shader for single color drawing
var FSHADER_SOURCE2 =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec4 v_Normal;\n' +
  'uniform vec4 u_Ambient;\n' +
  'uniform vec4 u_Diffuse;\n' +
  'uniform vec4 u_Specular;\n' +
  'uniform vec4 u_LightLocation;\n' +
  'uniform vec4 u_Eye;\n' +
  'void main() {\n' +
  '  float nDotL = max(0.0, dot(normalize(v_Normal), normalize(u_LightLocation-v_Position)));\n' +
  '  float hDotL = max(0.0, dot(normalize(v_Normal), normalize(normalize(u_LightLocation-v_Position)+normalize(u_Eye-v_Position))));\n' +
  '  gl_FragColor = v_Color*u_Ambient + v_Color*u_Diffuse*nDotL + v_Color*u_Specular*pow(hDotL, 256.0);\n' +
  //'  gl_FragColor = v_Color;\n'+
  
  '}\n';
  
// Rotation angle (degrees/second)
var ANGLE_STEP = 540.0;

var Xpos = 0;
var Zpos = 0;
var delta = 0.1;

var DiscX = 0.0;
var DiscY = 0.0;
var DiscZ = 0.0;
var positionDisc = [0.0,-1.0, 8.0];
var flipX = 1;
var flipY = 1;
var flipZ = 1;

var flip = 1.0;
var treeCollision = false;

var collision = 0;
var sampleFPS = 0;
var FPS = new Float32Array(127);
var i = 0;
var j = 0;
var FPSsum = 0;
var elapsed;

//var discAPosition = [0.0, 0.0, 0.0];
var newSpeed = [0.0, 0.0, 0.0];
var discSpeed = [0.0, 0.0, 0.0];
var throwing = false;

var BasketX = 0.0;
var BasketY = 0.0;
var BasketZ = 0.0;
var playa = true;
var playb = false;
var instruct = true;
var throwA = 1;
var holeID = 1;
var playerID = '';
var arrow = false;
var arrowAngle = [0.0, 0.0];
var arrowZ = 0.0;
var flipArrow = 1;
var collisionArrow = 0;
var currentArrowLength = arrowZ;
var arrowLength = 0.0;
var currentArrowAngle = [0.0, 0.0];
var lastArrowAngle = [0.0, 0.0];

var gravity = new Float32Array([0.0,-0.0001,0.0]);
var wind = [((Math.random()*2)-1)/200000, ((Math.random()*2)-1)/200000, ((Math.random()*2)-1)/200000];
//var wind = [0.0, 0.000000001, 0.0];

// new variable for players added

var PlayerA = true;
var PlayerB = false;
var ScoreA = 0.0;
var ScoreB = 0.0;

var player2pos=[0.0,-1.98,8.0];//for playerB position
var throwCountA = 1.0;
var throwCountB= 0.0;
var score = false;
var edge = false;
var winner = '';
var win = false;
var tie = false;
var changeWind = false;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  var hud = document.getElementById('hud');  

  if (!canvas || !hud) { 
    console.log('Failed to get HTML elements');
    return false; 
  } 

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  // Get the rendering context for 2DCG
  var ctx = hud.getContext('2d');
  if (!gl || !ctx) {
    console.log('Failed to get rendering context');
    return;
  }
  
  // Initialize shaders
  var cubeProg = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  var cylProg = createProgram(gl, VSHADER_SOURCE2, FSHADER_SOURCE2);
  if (!cubeProg || !cylProg) {
    console.log('Failed to intialize shaders.');
    return;
  } 
/*
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  } */

  // Set the clear color and enable the depth test
  gl.clearColor(0.5, 0.8, 1.0,1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable (gl.BLEND);
  // Set blending function
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

/*
  // Get the storage location of u_ProjMatrix
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ProjMatrix) {
    console.log('Failed to get the storage location of u_ProjMatrix');
    return;
  } */

  // creating connection points for cubeProg
  cubeProg.a_Position = gl.getAttribLocation(cubeProg, 'a_Position');
  cubeProg.a_Color = gl.getAttribLocation(cubeProg, 'a_Color');
  cubeProg.a_Normal = gl.getAttribLocation(cubeProg, 'a_Normal');
  cubeProg.u_MvpMatrix = gl.getUniformLocation(cubeProg, 'u_MvpMatrix');
  cubeProg.u_MdlMatrix = gl.getUniformLocation(cubeProg, 'u_MdlMatrix');
  cubeProg.u_NMdlMatrix = gl.getUniformLocation(cubeProg, 'u_NMdlMatrix');
  cubeProg.u_NormalDirection = gl.getUniformLocation(cubeProg, 'u_NormalDirection');
  cubeProg.u_Ambient = gl.getUniformLocation(cubeProg, 'u_Ambient');
  cubeProg.u_Diffuse = gl.getUniformLocation(cubeProg, 'u_Diffuse');
  cubeProg.u_Specular = gl.getUniformLocation(cubeProg, 'u_Specular');
  cubeProg.u_LightLocation = gl.getUniformLocation(cubeProg, 'u_LightLocation');
  cubeProg.u_Eye = gl.getUniformLocation(cubeProg, 'u_Eye');
  
  // creating connection points for cylProg
  cylProg.a_Position = gl.getAttribLocation(cylProg, 'a_Position');
  cylProg.a_Color = gl.getAttribLocation(cylProg, 'a_Color');
  cylProg.a_Normal = gl.getAttribLocation(cylProg, 'a_Normal');
  cylProg.u_MvpMatrix = gl.getUniformLocation(cylProg, 'u_MvpMatrix');
  cylProg.u_MdlMatrix = gl.getUniformLocation(cylProg, 'u_MdlMatrix');
  cylProg.u_NMdlMatrix = gl.getUniformLocation(cylProg, 'u_NMdlMatrix');
  cylProg.u_NormalDirection = gl.getUniformLocation(cylProg, 'u_NormalDirection');
  cylProg.u_Ambient = gl.getUniformLocation(cylProg, 'u_Ambient');
  cylProg.u_Diffuse = gl.getUniformLocation(cylProg, 'u_Diffuse');
  cylProg.u_Specular = gl.getUniformLocation(cylProg, 'u_Specular');
  cylProg.u_LightLocation = gl.getUniformLocation(cylProg, 'u_LightLocation');
  cylProg.u_Eye = gl.getUniformLocation(cylProg, 'u_Eye');
  
  // Register the event handler
  var currentAngle = [0.0, 0.0]; // Current rotation angle ([x-axis, y-axis] degrees)
  currentArrowAngle = [0.0, 0.0];
  initEventHandlers(hud, currentAngle, currentArrowAngle, cylProg, gl);
  
  // Current rotation angle of the floating cube
  var currentCubeAngle = 0.0;
  

  //newSpeed = [currentArrowAngle[0]*windX, currentArrowAngle[1]*(windY + gravity[1]), arrowLength*windZ];
  var tick = function(){  // Start drawing
    currentCubeAngle = animate(currentCubeAngle);  // Update the rotation angle
    draw2D(ctx); // Draw 2D
    draw(gl, cubeProg, cylProg, currentAngle, currentCubeAngle,currentArrowAngle,gravity, newSpeed);
    requestAnimationFrame(tick, canvas); 
  };
  tick();
}


function draw(gl, cubeProg, cylProg, currentAngle, currentCubeAngle,currentArrowAngle,gravity, newSpeed)
{
  
  var EYEINIT = new Object();
  EYEINIT.elements = new Float32Array([
	0, 0, 8, 1,
	0, 0, 0, 1,
	0, 0, 0, 1,
	0, 0, 0, 0
  ]);
  
  var eyeM = new Matrix4();
  // Apply the camera transformations on eyeM
  eyeM.rotate(-currentAngle[0], 1.0, 0.0, 0.0);
  eyeM.rotate(-currentAngle[1], 0.0, 1.0, 0.0);
  
  eyeM.concat(EYEINIT);

  // Set the eye point and the viewing volume
  var EYE=new Float32Array([0, 0, 15]);
  
  var mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1, 100);
  // eye, gaze vector
  
  //change look base on Player
  if (PlayerA == true) {
	mvpMatrix.lookAt(EYE[0], EYE[1], EYE[2], positionDisc[0], positionDisc[1], positionDisc[2], 0, 1, 0); 
  }
  else if(PlayerB == true){
     mvpMatrix.lookAt(EYE[0], EYE[1], EYE[2], player2pos[0], player2pos[1], player2pos[2], 0, 1, 0); 
  }
  //mvpMatrix.lookAt(EYE[0]+DiscX, EYE[1]+DiscY, EYE[2]+DiscZ, 0, 0, 0, 0, 1, 0); //follow Disc
  
  mvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  mvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  //mvpMatrix.rotate(lastArrowAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis follow disc
  // mvpMatrix.rotate(lastArrowAngle[1], 0.0, 1.0, 0.0); // Rotation around x-axisfollow disc
  var EYE = new Float32Array([eyeM.elements[0], eyeM.elements[1], eyeM.elements[2]]);
  // Pass the model view projection matrix to u_MvpMatrix
  gl.useProgram(cubeProg);
  gl.uniformMatrix4fv(cubeProg.u_MvpMatrix, false, mvpMatrix.elements);
  gl.useProgram(cylProg);
  gl.uniformMatrix4fv(cylProg.u_MvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var mdlMatrix = new Matrix4();
  mdlMatrix.setIdentity();
  var mdlCylinder = new Matrix4();
  mdlCylinder.setIdentity();
  // set up light for programs
  setupLight(gl, cubeProg, EYE);
  setupLight(gl, cylProg, EYE);
  // draw the room
  drawRoom(gl, cubeProg, cylProg,mdlMatrix , currentAngle, currentCubeAngle,currentArrowAngle,gravity,mdlCylinder, newSpeed);

  // for gameplay element
  gameplay(gl,cylProg,mdlCylinder,currentCubeAngle,currentArrowAngle,gravity);
}

function initEventHandlers(hud, currentAngle, currentArrowAngle, program, gl) {
  var dragging = false;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse
  
  var sTestEventType='mousedown';
  
  function handleMouseEvent(e) {
    var ev = (e==null ? event:e);
    var clickType = 'LEFT';
    //code for vector
    	
	    var x = ev.clientX, y = ev.clientY;
	    // Start dragging if a moue is in <hud>
	    var rect = ev.target.getBoundingClientRect();
	    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
	      lastX = x; lastY = y;
	      dragging = true;
	      arrow = true;
		  }
	  
	hud.onmouseup = function(ev) {
	  dragging = false; arrow = false; throwing = true;
	  
	 
	  //arrowLength = currentArrowLength;
	  //lastArrowAngle = [currentArrowAngle[0], currentArrowAngle[1]];
	  
	  var r = currentArrowLength / 100.0;
	  
	  // spherical coordinates for the arrow
	  discSpeed = [r*Math.sin(currentArrowAngle[0])*Math.cos(currentArrowAngle[1]),
		      r*Math.sin(currentArrowAngle[0])*Math.sin(currentArrowAngle[1]),
		      r*Math.cos(currentArrowAngle[0])];
			  
	    currentArrowAngle[0] = 0.0;
	    currentArrowAngle[1] = 0.0;
	  }; // Mouse is released
	  
	hud.onmousemove = function(ev) { // Mouse is moved
	  var x = ev.clientX, y = ev.clientY;
	  if (dragging) {
	    var factor = 10/hud.height; // The rotation ratio
	    var dx = factor * (x - lastX);
	    var dy = factor * (y - lastY);
	    
	    // Changing arrow direction
	    currentArrowAngle[0] = currentArrowAngle[0] + dy;
	    currentArrowAngle[1] = currentArrowAngle[1] + dx;
	  }
	  lastX = x, lastY = y;
	};
	  
    if (ev.type!=sTestEventType) return true;
    if (ev.which) {
      if (ev.which==3) {
	clickType = 'RIGHT'; // right clicking
	
	  var x = ev.clientX, y = ev.clientY;
	  // Start dragging if a mouse is in <hud>
	  var rect = ev.target.getBoundingClientRect();
	  if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
	    lastX = x; lastY = y;
	    dragging = true;
	  arrow = false;
	  }
	  
	hud.onmouseup = function(ev) { dragging = false; }; // Mouse is released
	
	hud.onmousemove = function(ev) { // Mouse is moved
	  var x = ev.clientX, y = ev.clientY;
	  if (dragging) {
	    var factor = 100/hud.height; // The rotation ratio
	    var dx = factor * (x - lastX);
	    var dy = factor * (y - lastY);
	    // Limit x-axis rotation angle to -90 to 90 degrees
	    currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);// y
	    currentAngle[1] = currentAngle[1] + dx;//x
	  }
	  lastX = x, lastY = y;
	};
      }
      if (ev.which==2) clickType = 'MIDDLE';
    }
    else if (ev.button) {
      if (ev.button==2) clickType = 'RIGHT';
      if (ev.button==4) clickType = 'MIDDLE';
    }
    //alert(ev.type+ ': ' + clickType+ ' button!');
    return true;
  }
  hud.onmousedown = handleMouseEvent;
  
  document.onkeypress = function(ev) {
    var press = String.fromCharCode(ev.charCode);
	switch(press) {
	  case 'c':
	    instruct = !instruct;
		break;
	}
  };
}

function rightclick() {
    var rightclick;
    var e = window.event;
    if (e.which) rightclick = (e.which == 3);
    else if (e.button) rightclick = (e.button == 2);
    ; // true or false, you can trap right click here by if comparison
}

  var RED=new Float32Array([1, 0, 0]);
  var WHITE=new Float32Array([1, 1, 1]);
  var GRAY=new Float32Array([0.5, 0.5, 0.5]);
  var SILVER=new Float32Array([0.75, 0.75, 0.75]);
  var BLACK=new Float32Array([0.0, 0.0, 0.0]);
  var BShad = new Float32Array([0.4,0.4,0.4]) 
  var BLUE=new Float32Array([0.5, 0.8, 1.0]);
  var YELLOW=new Float32Array([1.0, 1.0, 0.0]);
  var GREEN=new Float32Array([0.0, 1.0, 0.0]);
  var BROWN=new Float32Array([0.9, 0.60, 0.45]);
  var DGREEN = new Float32Array([0.0, 0.5, 0.0]);
  var DBLUE=new Float32Array([0.0, 0.0, 1.0]);
  var CWHITE=new Float32Array([0.9, 0.9, 0.9]);
  
function getInverseTranspose(mat4){
	m = new Matrix4();
	m.setInverseOf(mat4);
	m.transpose();
	return m;
}

function drawRoom(gl, cubeProg, cylProg,  mdlMatrix, currentAngle, currentCubeAngle,currentArrowAngle,gravity,mdlCylinder, newSpeed){

  gl.useProgram(cubeProg);
  
  //Walls
  mdlMatrixChild=new Matrix4(mdlMatrix); 
  mdlMatrixChild.scale(3.0, 2.0, 10.0);
  gl.uniformMatrix4fv(cubeProg.u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(cubeProg.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cubeColors=[null, null, null, null, GREEN, null];
  drawCube(gl, cubeProg, cubeColors, -1);

  gl.disableVertexAttribArray(gl.getAttribLocation(cubeProg, 'a_Position'));
  gl.disableVertexAttribArray(gl.getAttribLocation(cubeProg, 'a_Color'));
  gl.disableVertexAttribArray(gl.getAttribLocation(cubeProg, 'a_Normal'));
  
  windMatrix=new Matrix4(mdlMatrix); 
  windMatrix.scale(1.0, 1.0, 1.0);
  
  // axis-angle representation: calculating rotation angle
  var wx = wind[0];
  var wy = wind[1];
  var wz = wind[2];
  var length1 = Math.sqrt((wx*wx)+(wy*wy)+(wz*wz));
  var wx = wx / length1;
  var wy = wy / length1;
  var wz = wz / length1;
  var windAngle = (Math.acos(wx))*(180/Math.PI);
  
  // calculating rotation axis
  var vf = new Float32Array(3);
  vf[0] = 0.0*wz - 0.0*wy;
  vf[1] = 0.0*wx - 1.0*wz;
  vf[2] = 1.0*wy - 0.0*wx;
  var length2 = Math.sqrt((vf[0]*vf[0])+(vf[1]*vf[1])+(vf[2]*vf[2]));
  vf[0] = vf[0] / length2;
  vf[1] = vf[1] / length2;
  vf[2] = vf[2] / length2;
  //console.log(windAngle);
  
  // rotating wind arrow
  windMatrix.rotate(windAngle, vf[0], vf[1], vf[2]);
  gl.uniformMatrix4fv(cubeProg.u_MdlMatrix, false, windMatrix.elements);
  gl.uniformMatrix4fv(cubeProg.u_NMdlMatrix, false, getInverseTranspose(windMatrix).elements);
  drawWind(gl, cubeProg, 1);
  
  drawPowerdisplay(gl, cubeProg);
  
 
  //Trees
  drawTree(gl, cylProg, mdlCylinder);
  mdlCylinder.translate(1.5,0.0,-1.0);
  drawTree(gl, cylProg, mdlCylinder);
  mdlCylinder.translate(-2.0,0.0,6.0);
  drawTree(gl, cylProg, mdlCylinder);
  
  mdlCylinder.translate(3.0,0.0,-3.0);
  drawTree(gl, cylProg, mdlCylinder);
  mdlCylinder.translate(-3.0,0.0,-4.0);
  /*drawTree2(gl, cylProg, mdlCylinder);
  mdlCylinder.translate(3.0,0.0,0.0);
  drawTree2(gl, cylProg, mdlCylinder);
  mdlCylinder.translate(-2.0,0.0,-3.0);
  drawTree2(gl, cylProg, mdlCylinder);
  */
   //Basket
 drawBasket(gl,cylProg, mdlCylinder)
  //Clouds
 drawClouds(gl,cylProg);
 drawClouds2(gl,cylProg);
 
 
 
 
 
} 

function drawBasket(gl,program, mdlCylinder){
  gl.useProgram(program);
  
  mdlBask=new Matrix4(); 	
  mdlBask.translate(0.0,-1.50,-0.5);
  mdlBask.rotate(90, -1.0, 0.0,0.0);
  mdlBask.scale(0.115, 0.115, 0.16);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlBask.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlBask).elements);
  cylinderColors=[SILVER,SILVER,SILVER,SILVER,SILVER,SILVER,SILVER,SILVER,SILVER];
  drawCylinder(gl,program,cylinderColors,1)
  
  
  mdlMatrixChild=new Matrix4(mdlBask); 	
  mdlMatrixChild.translate(0.0,0.0,-1.125);
  mdlMatrixChild.scale(0.1, 0.1, 2.0);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cylinderColors=[SILVER,SILVER,SILVER,SILVER,SILVER,SILVER,SILVER,SILVER,SILVER];
  drawCylinder(gl,program,cylinderColors,1)
  
  
  mdlMatrixChild=new Matrix4(mdlBask); 	
 
  mdlMatrixChild.translate(0.0,0.0,-3.05);
  mdlMatrixChild.scale(1.0, 1.0,0.05);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cylinderColors=[SILVER,SILVER,SILVER,SILVER,SILVER,SILVER,SILVER,SILVER,SILVER];
  drawCylinder(gl,program,cylinderColors,1)
  
  
}

function drawTree(gl, program, mdlCylinder){

  gl.useProgram(program);
  
   
  mdlMatrixChild=new Matrix4(mdlCylinder); 	
  mdlMatrixChild.translate(-0.7,-.50,-0.1);
  mdlMatrixChild.scale(0.4, 0.4, 0.05);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cylinderColors=[DGREEN, DGREEN, DGREEN, DGREEN, DGREEN, DGREEN, DGREEN,DGREEN, DGREEN];
  drawCylinder(gl,program,cylinderColors,1);


  mdlMatrixChild=new Matrix4(mdlCylinder); 	
  mdlMatrixChild.rotate(90, -1.0, 0.0,0.0);
  mdlMatrixChild.translate(-0.7,0.1,-1.35);
  mdlMatrixChild.scale(0.035, 0.035, 0.65);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cylinderColors=[BROWN,BROWN,BROWN,BROWN,BROWN,BROWN,BROWN,BROWN,BROWN];
  drawCylinder(gl,program,cylinderColors,1);
 
  
}

function drawLight(gl, mdlCylinder){

  mdlMatrixChild=new Matrix4(mdlCylinder); 
  mdlMatrixChild.translate(-3.0, 6.0, 1.0);
  mdlMatrixChild.scale(0.5, 0.5, 0.25);
  gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cylinderColorsColors=[YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, YELLOW,YELLOW,YELLOW,];
  drawCylinder(gl,cylinderColors, 1);
}

//disc function for PlayerB
function drawDisc2(gl, program, mdlCylinder, currentCubeAngle,currentArrowAngle, gravity, newSpeed){

  gl.useProgram(program);
  mdlDisc2 = new Matrix4();
  //mdlMatrixChild=new Matrix4();
  //mdlMatrixChild.translate(0.0,-1.25,4.0);
  mdlArrow2=new Matrix4(mdlDisc2);
  mdlArrow2.translate(0.0,.05,0.0);
  //discAPosition = [DiscX, DiscY, DiscZ];
  
if (PlayerB==true) {
  //code

  gameActionB(gl,program,mdlArrow2);

}
  mdlDisc2.translate(player2pos[0], player2pos[1], player2pos[2]);
  mdlDisc2.rotate(90, 1.0, 0.0,0.0);
  mdlDisc2.rotate(currentCubeAngle, 0.0, 0.0,1.0); //spin the disc
  mdlDisc2.scale(0.1, 0.1, 0.01);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlDisc2.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlDisc2).elements);
  cylinderColors=[RED,RED,RED,RED,RED,RED,RED,RED,RED];
  drawCylinder(gl, program, cylinderColors, 1);
		     
  
	var a =1.0;
	 
	mdlMatrixChildSh= new Matrix4();

	mdlMatrixChildSh.translate(player2pos[0],-2.0,player2pos[2]);
	mdlMatrixChildSh.scale(0.1,.001,0.1);
	mdlMatrixChildSh.rotate(90,1,0,0);
	mdlMatrixChildSh.rotate(currentCubeAngle, 0.0, 0.0,1.0);
	gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChildSh.elements);
	gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChildSh).elements);
	cylinderColors=[BShad,BShad,BShad,BShad,BShad,BShad,BShad,BShad,BShad];
	drawCylinder(gl,program,cylinderColors,1)	 
  
}


// disc function for PlayerA
function drawDisc(gl, program, mdlCylinder, currentCubeAngle,currentArrowAngle, gravity, newSpeed){

  gl.useProgram(program);
  mdlMatrixChild=new Matrix4();
  //mdlMatrixChild.translate(0.0,-1.25,4.0);
  mdlMatrixChild2=new Matrix4(mdlMatrixChild);
  mdlMatrixChild2.translate(0.0,.05,0.0);
  //discAPosition = [DiscX, DiscY, DiscZ];

  if (PlayerA == true) {
  gameAction(gl,program,mdlMatrixChild2);
  }
  

  mdlMatrixChild.translate(positionDisc[0], positionDisc[1], positionDisc[2]);
  mdlMatrixChild.rotate(90, 1.0, 0.0,0.0);
  mdlMatrixChild.rotate(currentCubeAngle, 0.0, 0.0,1.0); //spin the disc
  mdlMatrixChild.scale(0.1, 0.1, 0.01);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cylinderColors=[DBLUE,DBLUE,DBLUE,DBLUE,DBLUE,DBLUE,DBLUE,DBLUE,DBLUE];
  drawCylinder(gl, program, cylinderColors, 1);

 

 
mdlMatrixChildSh= new Matrix4();
 
mdlMatrixChildSh.translate(positionDisc[0]  ,-2.0,positionDisc[2] );
mdlMatrixChildSh.scale(0.1,.001,0.1);
mdlMatrixChildSh.rotate(90,1,0,0);
mdlMatrixChildSh.rotate(currentCubeAngle, 0.0, 0.0,1.0);
gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChildSh.elements);
gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChildSh).elements);
cylinderColors=[BShad,BShad,BShad,BShad,BShad,BShad,BShad,BShad,BShad];
drawCylinder(gl,program,cylinderColors,1)	 
  


}

function drawCube(gl, cubeProg, cubeColors, normalDirection) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  gl.useProgram(cubeProg);
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
  ]);
  
  var normals = new Float32Array([   // Normal coordinates
     0.0, 0.0, 1.0, 0.0,  0.0, 0.0, 1.0,0.0,  0.0,0.0, 1.0,0.0,   0.0,0.0, 1.0,0.0,  // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,0.0,   1.0,0.0, 0.0,0.0,   1.0,0.0,0.0,0.0,   1.0, 0.0,0.0,0.0,  // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,0.0,   0.0, 1.0,0.0,0.0,  0.0, 1.0,0.0,0.0,  0.0, 1.0, 0.0,0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,0.0,   -1.0,0.0, 0.0,0.0,   -1.0,0.0,0.0, 0.0,  -1.0, 0.0,0.0,0.0,  // v1-v6-v7-v2 left
    0.0, -1.0, 0.0,0.0,   0.0, -1.0,0.0,0.0,  0.0, -1.0,0.0,0.0,  0.0, -1.0, 0.0,0.0,  // v7-v4-v3-v2 down
     0.0, 0.0, -1.0,0.0,  0.0, 0.0, -1.0,0.0,  0.0,0.0, -1.0,0.0,   0.0,0.0, -1.0, 0.0  // v4-v7-v6-v5 back
  ]);

  /*var colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);*/
  
  var indicesTemp = [];
  var colors = new Float32Array(6*4*3);
  for(i=0; i<6; i++){
  
	var faceColor=cubeColors[i];
  
	if(null!=faceColor){
		indicesTemp.push(i*4);
		indicesTemp.push(i*4+1);
		indicesTemp.push(i*4+2);
		
		indicesTemp.push(i*4);
		indicesTemp.push(i*4+2);
		indicesTemp.push(i*4+3);
	} else {
		faceColor=BLACK;
	}
		
	for(j=0; j<4; j++){
		for(k=0; k<3; k++){
			colors[k+3*j+4*3*i]=faceColor[k];
		}		
	}
  }
  
  var indices = new Uint8Array(indicesTemp);

 /* var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);*/

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, cubeProg, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, cubeProg, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
	
  if (!initArrayBuffer(gl, cubeProg, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  gl.uniform1f(cubeProg.u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}

function initArrayBuffer(gl, program, data, num, type, attribute) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function setupLight(gl, program, eye){
  gl.useProgram(program);
  // Get the storage location of u_Ambient
  var u_Ambient = gl.getUniformLocation(program, 'u_Ambient');
  if (!u_Ambient) {
	  console.log('Failed to get the storage location of u_Ambient');
	  return;
  }
  
  // Get the storage location of u_Diffuse
  var u_Diffuse = gl.getUniformLocation(program, 'u_Diffuse');
  if (!u_Diffuse) {
	  console.log('Failed to get the storage location of u_Diffuse');
	  return;
  }
  
  // Get the storage location of u_Specular
  var u_Specular = gl.getUniformLocation(program, 'u_Specular');
  if (!u_Specular) {
	  console.log('Failed to get the storage location of u_Specular');
	  return;
  }
  
  // Get the storage location of u_LightLocation
  var u_LightLocation = gl.getUniformLocation(program, 'u_LightLocation');
  if (!u_LightLocation) {
	  console.log('Failed to get the storage location of u_LightLocation');
	  return;
  }
  
  // Get the storage location of u_Eye
  var u_Eye = gl.getUniformLocation(program, 'u_Eye');
  if (!u_Eye) {
	  console.log('Failed to get the storage location of u_Eye');
	  return;
  }
  
  gl.uniform4f(program.u_Ambient, 0.15, 0.15, 0.15, 1.0);

  gl.uniform4f(program.u_Diffuse, 1.0, 1.0, 1.0, 1.0);
  
  gl.uniform4f(program.u_Specular, 1.0, 1.0, 1.0, 1.0);
  
  gl.uniform4f(program.u_LightLocation,eye[0], eye[1], eye[2],1.0);
  
  gl.uniform4f(program.u_Eye, eye[0], eye[1], eye[2], 1.0);
}

function draw2D(ctx) {
  for (j = 0; j < FPS.length; j++) {
	FPSsum += FPS[j];
  }
  ctx.clearRect(0, 0, 900, 900); // Clear <hud>
  // Draw white letters
  ctx.font = '36px "Times New Roman"';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
  ctx.fillText('Disc Golf Game', 40, 60);
  ctx.fillText('Player: ', 40, 100);
  if (playerID == 'A') ctx.fillStyle = 'rgba(0, 0, 255, 1)';
  if (playerID == 'B') ctx.fillStyle = 'rgba(255, 0, 0, 1)';
  ctx.fillText(playerID, 150, 100);
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
  if (PlayerA==true) ctx.fillText('Throw: ' + throwCountA, 40, 140);
  if (PlayerB==true) ctx.fillText('Throw: ' + throwCountB, 40, 140);
  ctx.fillText('Power: ' + currentArrowLength.toFixed(2), 40, 180);
  //ctx.fillText('x: ' + currentArrowAngle[0], 40, 220);
  //ctx.fillText('z: ' + currentArrowAngle[1], 40, 260);
  ctx.font = '16px "Times New Roman"';
  ctx.fillText('x: ' + (currentArrowLength / 100.0)*Math.sin(currentArrowAngle[0])*Math.cos(currentArrowAngle[1]), 670, 570);
  //ctx.fillText('discSpeedy: ' + (currentArrowLength / 100.0)*Math.sin(currentArrowAngle[0])*Math.sin(currentArrowAngle[1]), 40, 340);
  ctx.fillText('z: ' + (currentArrowLength / 100.0)*Math.cos(currentArrowAngle[0]), 670, 590);
  ctx.font = '36px "Times New Roman"';
  ctx.fillText('Player A\'s score: ' + ScoreA, 40, 675);
  ctx.fillText( 'Player B\'s score: ' + ScoreB, 610, 675);  

  //currentArrowLength = 0;
  //ctx.fillText('Current power: ' + arrowLength.toFixed(1), 40, 220);
  //arrowLength = 0.0;
  //ctx.fillText('FPS: '+ FPSsum.toFixed(2), 40, 380);
  FPSsum = 0;
  
  ctx.fillText('Hole: ' + holeID, 660, 60);
  ctx.fillText('Par: 5', 660, 100);
  //ctx.fillText('Wind: ' + windX.toFixed(2)*10 + " " + windY.toFixed(2)*10 + " " + windZ.toFixed(2)*10, 660, 140);
  //ctx.fillText('Elapsed: ' + elapsed.toFixed(2), 660, 180);
  
  var posInst = 340;
  if (instruct == true) {
	ctx.font = '36px "Times New Roman"';
	ctx.fillText('Instructions: ', 40, posInst);
	ctx.font = '28px "Times New Roman"';
	ctx.fillText('Get the disc in the basket in the fewest throws!', 40, posInst + 1*40);
	ctx.fillText('Hold the right mouse button and drag to rotate the screen.', 40, posInst + 2*40);
	ctx.fillText('Hold the left mouse button to point the disc and change power.', 40, posInst + 3*40);
	ctx.fillText('Release to shoot. Be aware of the wind direction (blue arrow)!', 40, posInst + 4*40);
    ctx.font = '20px "Times New Roman"';
	}
  ctx.font = '23px "Times New Roman"';
  ctx.fillText('Press C to toggle instructions', 610, posInst + 7*40);
  
   var  stat = '' ;
   
ctx.fillText('Status:', 40, posInst + 7*40);
if(score == true) {stat = 'Scores';}
else if(edge == true){  stat = ' hits the boundary; try again!';}
else if(win == true){  stat = ' wins!';}
else {stat ='\'s turn';}
 if (playerID == 'A') ctx.fillStyle = 'rgba(0, 0, 255, 1)';
if (playerID == 'B') ctx.fillStyle = 'rgba(255, 0, 0, 1)';

var message = playerID + stat ;
if (tie == true) message = 'It\'s a tie!';
ctx.fillText('Player '+ message, 110, posInst + 7*40);
  
  }

// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  elapsed = now - g_last;
  sampleFPS = 1000/elapsed;
  g_last = now;
  
  FPS[i] = sampleFPS;
  i++;
  i = i % 128;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0; // in milliseconds
  return newAngle %= 360; // don't change this
}
  
function drawCylinder(gl,program,cylinderColors, normalDirection) {
  
  gl.useProgram(program);

  var vertices = new Float32Array([
    0.0, 0.0, 1.0, // top centre
	1.0, 0.0, 1.0,	  	0.70710678,0.707107,1.0,
	0.0,1.0,1.0, 		-0.70710678, 0.707107,1.0,  
    -1.0, 0.0, 1.0, 	-0.70710678,-0.70710678,1.0,
	0.0,-1.0,1.0,  		0.70710678,-0.70710678,1.0,
	
	0.0, 0.0, -1.0, // bottom centre
	1.0, 0.0, -1.0,  		0.70710678,0.707107,-1.0, 
	0.0,1.0,-1.0,  			-0.70710678, 0.707107,-1.0,
	-1.0, 0.0, -1.0, 		 -0.70710678,-0.70710678,-1.0, 
	0.0,-1.0,-1.0,  		0.70710678,-0.70710678,-1.0,
    
	  
	1.0, 0.0, 1.0,	  	0.70710678,0.707107,1.0,
	0.0,1.0,1.0, 		-0.70710678, 0.707107,1.0,  
    -1.0, 0.0, 1.0, 	-0.70710678,-0.70710678,1.0,
	0.0,-1.0,1.0,  		0.70710678,-0.70710678,1.0


	
	]);
	
  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    //
	 0, 3, 4,   0, 4, 5,
	 0, 5, 6,   0, 6, 7,
	 0, 7, 8,   0, 8, 1,
	 9,10,11,   9,11,12,
	 9,12,13,   9,13,14,
	 9,14,15,   9,15,16,
	 9,16,17,   9,17,10,
	 
	 18,10,19,  10,19,11,
	 19,11,20,   11,20,12,
	 20,12,21,	 12,21,13,
	 21,13,22,	13,22,14,
	 22,14,23,   14,23,15,
	 23,15,24,	15,24,16,
	 24,16,25,	16,25,17,
	 25,17,18,   17,18,10
	]);
/*
  var colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v3-v4-v5 right(green)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v5-v6-v1 up(red)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v1-v6-v7-v2 left
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v3-v4-v5 right(green)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v5-v6-v1 up(red)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v3-v4-v5 right(green)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v5-v6-v1 up(red)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,
  
  ]);
*/
var indicesTemp = [];

  var colors = new Float32Array(96);
  for(i=0; i<9; i++){
  var faceColor=cylinderColors[i];
	
		
	for(j=0; j<8; j++){
		for(k=0; k<3; k++){
			colors[k+3*j+4*3*i]=faceColor[k];
		}		
	}
  }


  var normals = new Float32Array([   // Normal coordinates
    0.0, 0.0, 1.0, 0.0,   0.0, 0.0, 1.0, 0.0,0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 1.0, 0.0,   0.0, 0.0, 1.0, 0.0,0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 1.0, 0.0,   0.0, 0.0, 1.0, 0.0,0.0, 0.0, 1.0, 0.0,

    0.0, 0.0, -1.0, 0.0,	0.0, 0.0, -1.0, 0.0,  0.0, 0.0, -1.0, 0.0,
    0.0, 0.0, -1.0, 0.0,	0.0, 0.0, -1.0, 0.0,  0.0, 0.0, -1.0, 0.0,
    0.0, 0.0, -1.0, 0.0,	0.0, 0.0, -1.0, 0.0,  0.0, 0.0, -1.0, 0.0,
 
    0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0
  /*1.0, 0.0, 0.0,0.0,	  	0.70710678,0.707107,0.0,0.0,
	0.0,1.0,0.0,0.0, 		-0.70710678, 0.707107,0.0,0.0,  
    -1.0, 0.0, 0.0,0.0, 	-0.70710678,-0.70710678,0.0,0.0,
	0.0,-1.0,0.0,0.0,  		0.70710678,-0.70710678,0.0,0.0*/
      
  ]);


  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, program, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, program, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
	
  if (!initArrayBuffer(gl, program, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  gl.uniform1f(program.u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}

function drawWind(gl, program, normalDirection) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  gl.useProgram(program);
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 0.5, 1.0,  -1.0, 0.5, 1.0,  -1.0,-0.5, 1.0,   1.0,-0.5, 1.0,  // v0-v1-v2-v3 front 0 1 2 3
     1.0, 0.5, 1.0,   1.0,-0.5, 1.0,   1.0,-0.5,-1.0,   1.0, 0.5,-1.0,  // v0-v3-v4-v5 right 4 5 6 7
     1.0, 0.5, 1.0,   1.0, 0.5,-1.0,  -1.0, 0.5,-1.0,  -1.0, 0.5, 1.0,  // v0-v5-v6-v1 up 8 9 10 11
    -1.0, 0.5, 1.0,  -1.0, 0.5,-1.0,  -1.0,-0.5,-1.0,  -1.0,-0.5, 1.0,  // v1-v6-v7-v2 left 12 13 14 15
    -1.0,-0.5,-1.0,   1.0,-0.5,-1.0,   1.0,-0.5, 1.0,  -1.0,-0.5, 1.0,  // v7-v4-v3-v2 down 16 17 18 19
     1.0,-0.5,0.999,  -1.0,-0.5,0.999,  -1.0, 0.5,0.999,   1.0, 0.5,0.999,  // v4-v7-v6-v5 back 20 21 22 23
	2.0, 0.0, 1.0,  2.0, 0.0,0.999, //24,25
	-1.0, 0.5,-1.0,  2.0, 0.0, 1.0,  2.0, 0.0,-1.0 //26,27,28
  ]);
  
  var normals = new Float32Array([   // Normal coordinates
     0.0, 0.0, 1.0, 0.0,  0.0, 0.0, 1.0,0.0,  0.0,0.0, 1.0,0.0,   0.0,0.0, 1.0,0.0,  // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,0.0,   1.0,0.0, 0.0,0.0,   1.0,0.0,0.0,0.0,   1.0, 0.0,0.0,0.0,  // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,0.0,   0.0, 1.0,0.0,0.0,  0.0, 1.0,0.0,0.0,  0.0, 1.0, 0.0,0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,0.0,   -1.0,0.0, 0.0,0.0,   -1.0,0.0,0.0, 0.0,  -1.0, 0.0,0.0,0.0,  // v1-v6-v7-v2 left
    0.0, -1.0, 0.0,0.0,   0.0, -1.0,0.0,0.0,  0.0, -1.0,0.0,0.0,  0.0, -1.0, 0.0,0.0,  // v7-v4-v3-v2 down
     0.0, 0.0, -1.0,0.0,  0.0, 0.0, -1.0,0.0,  0.0,0.0, -1.0,0.0,   0.0,0.0, -1.0, 0.0,  // v4-v7-v6-v5 back
	 0.0,0.0, 1.0,0.0,  0.0, 0.0, -1.0,0.0, 0.0, 0.0, -1.0,0.0,
	 -0.7071, 0.7071, 0.0,  -0.7071,-0.7071, 0.0
  ]);

  var colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,   // v4-v7-v6-v5 back
	0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,
	0.4, 0.4, 1.0,  0.4, 0.4, 1.0
  ]);
  
  /*var indicesTemp = [];
  var colors = new Float32Array(6*4*3);
  for(i=0; i<6; i++){
  
	var faceColor=cubeColors[i];
  
	if(null!=faceColor){
		indicesTemp.push(i*4);
		indicesTemp.push(i*4+1);
		indicesTemp.push(i*4+2);
		
		indicesTemp.push(i*4);
		indicesTemp.push(i*4+2);
		indicesTemp.push(i*4+3);
	} else {
		faceColor=BLACK;
	}
		
	for(j=0; j<4; j++){
		for(k=0; k<3; k++){
			colors[k+3*j+4*3*i]=faceColor[k];
		}		
	}
  } */
  
  //var indices = new Uint8Array(indicesTemp);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
   //  4, 5, 6,   4, 6, 7,    // right
   //  8, 9,10,   8,10,11,    // up
   // 12,13,14,  12,14,15,    // left
   // 16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23,    // back
	 0, 3,24,  20,23,25
	//26,22,27
  ]);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, program, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, program, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
	
  if (!initArrayBuffer(gl, program, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  gl.uniform1f(program.u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}

//Resets the game;
function gameReset(){
  
positionDisc = [0.0,-1.0, 8.0];
player2pos=[0.0,-1.98,8.0]
throwCountA = 0.0;
throwCountB = 0.0;
ScoreA = 0.0;
ScoreB = 0.0;
holeID = 1.0;
  
}




function drawPowerdisplay(gl, program)
{
  
  
  var mvpMatrix = new Matrix4();
  mvpMatrix.setOrtho(-2.0,2.0,-2.0,2.0,2.0,-2.0);
  // eye, gaze vector
 
  mvpMatrix.lookAt(0, 0, 1, 0, 0, 0, 0, 1, 0); //follow Disc

  gl.useProgram(program);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
 
 //powerbar
  mdlMatrixChild=new Matrix4(); 
  mdlMatrixChild.translate(-1.4,0.85,0.0);
  mdlMatrixChild.scale(arrowZ*4.0, 0.08, 0.0);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
    

  cubeColors=[BLUE, null, null, null, null, null];
  
 
  cubeColors=[RED, null, null, null, null, RED];
  
	if(arrow==true){  
	  drawCube(gl, program, cubeColors, 1);
	}



  

}


//PlayerA gamelogic
function gameAction(gl,program,mdlMatrixChild2){

if (treeCollision == true){
flip *= -1.0;
treeCollision = false;
}
   
    
    if ((positionDisc[0]> -1.1 &&positionDisc[0]<-0.3 &&   positionDisc[1] >-0.9&&  positionDisc[1] < -0.1 && positionDisc[2]>-0.15&& positionDisc[2]<0.05)) {
      
      treeCollision = true;
    }
     if ((positionDisc[0]> 0.4 &&positionDisc[0]<1.2 &&   positionDisc[1] >-0.9&&  positionDisc[1] < -0.1 && positionDisc[2]>-1.15 && positionDisc[2]<-1.05)) {
      
      treeCollision =true ;
    }
    
   if ((positionDisc[0]> -1.6 &&positionDisc[0]<-0.8 &&   positionDisc[1] >-0.9&&  positionDisc[1] < -0.1 && positionDisc[2]>4.85&& positionDisc[2]<4.95)) {
      
      treeCollision =true ;
    }
    
  if ((positionDisc[0]> 1.4 &&positionDisc[0]<2.2 &&   positionDisc[1] >-0.9&&  positionDisc[1] < -0.1 && positionDisc[2]>1.85 && positionDisc[2]<1.95)) {
      
       treeCollision =true ;
    }

  
  //Speed Calculation 
  var drag = [];
  var b = 0.01;
  
  for (i = 0; i < 3; i++) {
    drag[i] = -b*discSpeed[i];
  }
  
  for (i = 0; i < 3; i++) {
    positionDisc[i] += (elapsed * discSpeed[i]/10)*flip;
  }

  if (throwing == false) {
    for (i = 0; i < 3; i++) {
      discSpeed[i] = 0.0;
      
    }
  }
  else {
    for (i = 0; i < 3; i++) {
      discSpeed[i] += elapsed * (drag[i] + gravity[i] + wind[i])/10;
    }
  }
  
  
      // when disc touches the edges then the disc will reset to original position throw does not increment 
       if (positionDisc[0]> 2.0 || positionDisc[0] < -2.0 || positionDisc[1] > 2.0  ||positionDisc[2]>10||positionDisc[2]<-10) {
	positionDisc[2] = 8.0;
	positionDisc[1] = -1.20;
	positionDisc[0] = 0.0;
	wind = [0.0, 0.0, 0.0];
	throwing = false;
	edge = true;
	changeWind = true;
       
     }
       
      // disc stops
      if (positionDisc[1] < -2.0) {
	positionDisc[1] = -2.0;
	positionDisc[1]+=0.02; // set new height after it hits the ground
     
	wind = [0.0, 0.0, 0.0];
	PlayerA=false; // sets PlayerA false when it hits the ground switch turns with PlayerB
	PlayerB=true;  // sets PlayerB turn;
	
	throwing = false; 
	throwCountA +=1;
	player2pos[1]+=0.90; 
	score = false;
	edge = false;
	changeWind = true;
      }
    //update score when basket hit
      if ((positionDisc[1] >-2.0&&positionDisc[1]<=-1.3) && (positionDisc[2]>=-0.6&&positionDisc[2]<=-0.4) &&(positionDisc[0]<=0.1&&positionDisc[0]>=-0.1)) {
	
	    ScoreA+=1;
	    positionDisc[0]=0.0;
	    positionDisc[1]=-1.0;
	    positionDisc[2]= 8.0;
	    throwing =false;
	    wind=[0.0,0.0,0.0];
	    PlayerB=true;
	    PlayerA=false;
	    score =true;
    }
  

  
  // drawing the arrow
    if (arrow == true) {
    // bounds of the arrow
    if (arrowZ > 0.10) {
      flipArrow *= -1;
      collisionArrow = 1;
    }
    if (arrowZ < 0.0) {
      flipArrow *= -1;
      collisionArrow = 1;
    }
    
    // to change length of the arrow
    arrowZ += 0.005 * flipArrow;
    
    if (collisionArrow == 1) {
      collisionArrow = 0;
    }
    
    mdlMatrixChild2.translate(positionDisc[0],positionDisc[1] + 0.1,positionDisc[2]);
    // changing orientation of arrow
    mdlMatrixChild2.rotate(45.0, currentArrowAngle[0], currentArrowAngle[1], 0.0);
    // changing length of arrow
    mdlMatrixChild2.scale(0.025, 0.025, arrowZ*2.0);
    currentArrowLength = arrowZ*100;
    
    gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChild2.elements);
    gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild2).elements);
    cylinderColors=[DBLUE,DBLUE,DBLUE,DBLUE,DBLUE,DBLUE,DBLUE,DBLUE,DBLUE];
    drawCylinderArrow(gl, program, cylinderColors, 1);
  }
 
}




//PlayerB gamelogic
function gameActionB(gl,program,mdlArrow2){
  
  //tree Collision
   if (treeCollision == true){
   flip *= -1;
   treeCollision = false;
   }
    
    if ((player2pos[0]> -1.1 &&player2pos[0]<-0.3 &&   player2pos[1] >-0.9&&  player2pos[1] < -0.1 && player2pos[2]>-0.15&& player2pos[2]<0.05)) {
      
      treeCollision = true;
    }
     if ((player2pos[0]> 0.4 &&player2pos[0]<1.2 &&   player2pos[1] >-0.9&&  player2pos[1] < -0.1 && player2pos[2]>-1.15 && player2pos[2]<-1.05)) {
      
       treeCollision = true;
    }
    
   if ((player2pos[0]> -1.6 &&player2pos[0]<-0.8 &&   player2pos[1] >-0.9&&  player2pos[1] < -0.1 && player2pos[2]>4.85&& player2pos[2]<4.95)) {
      
   treeCollision = true;
    }
    
  if ((player2pos[0]> 1.4 &&player2pos[0]<2.2 &&   player2pos[1] >-0.9&&  player2pos[1] < -0.1 && player2pos[2]>1.85 && player2pos[2]<1.95)) {
      
     treeCollision = true;
    }

  
    //Speed Calculation 
  var drag = [];
  var b = 0.01;
  
  for (i = 0; i < 3; i++) {
    drag[i] = -b*discSpeed[i];
  }
  
  for (i = 0; i < 3; i++) {
  player2pos[i] += (elapsed * discSpeed[i]/10)*flip;
  }

  if (throwing == false) {
    for (i = 0; i < 3; i++) {
      discSpeed[i] = 0.0;
      
    }
  }
  else {
    for (i = 0; i < 3; i++) {
      discSpeed[i] += elapsed * (drag[i] + gravity[i] + wind[i])/10;
    }
  }
  
  
  
  
    // when disc touches the edges then the disc will reset to original position and throw does not count
if (player2pos[0]>= 2.0 || player2pos[0] <= -2.0 || player2pos[1] > 2.0||player2pos[2]>10||player2pos[2]<-10) {

    player2pos[2] = 8.0
    player2pos[0] = 0.0
    player2pos[1] = -1.20;
    //player2pos[1]+=1.0; // set new height after it hits the ground
    wind = [0.0, 0.0, 0.0];
    throwing = false;
    edge = true;
    changeWind = true;
}
  


  // disc stops
  if (player2pos[1] < -2.0) {
    player2pos[1]= -2.0; // set new height after it hits the ground
    player2pos[1]+=0.02; // set new height after it hits the ground
    
  
    wind = [0.0, 0.0, 0.0];
    PlayerB=false;  // sets PlayerA true when it hits the ground 
    PlayerA=true; // set PlayerB to false switch turns with PlayerA;
    throwing = false;
    throwCountB+=1.0;
   positionDisc[1]+=0.90;
   score = false;
   edge = false;
   changeWind = true;
   }
 
  
    // Score update   
    if ((player2pos[1] <= -1.3&& player2pos[1]>-2.0) && (player2pos[2]>=-0.6&&player2pos[2]<=-0.4) && (player2pos[0]<=0.1&&player2pos[0]>=-0.1)) {
	  ScoreB+=1;
	  player2pos[0]=0.0;
	  player2pos[1]=-1.0;
	  player2pos[2]= 6.0;
	  throwing =false;
	  wind=[0.0,0.0,0.0];
	  PlayerA=true;
	  PlayerB=false;
	  score = true;
    }
  // drawing the arrow
   if (arrow == true) {
     // bounds of the arrow
     if (arrowZ > 0.10) {
       flipArrow *= -1;
       collisionArrow = 1;
     }
     if (arrowZ < 0.0) {
       flipArrow *= -1;
       collisionArrow = 1;
     }
 // to change length of the arrow
     arrowZ += 0.005 * flipArrow;
     
     if (collisionArrow == 1) {
       collisionArrow = 0;
    }
    
    mdlArrow2.translate(player2pos[0],player2pos[1] + 0.1,player2pos[2]);
    // changing orientation of arrow
    mdlArrow2.rotate(45.0, currentArrowAngle[0], currentArrowAngle[1], 0.0);
    // changing length of arrow
    mdlArrow2.scale(0.025, 0.025, arrowZ*2.0);
    currentArrowLength = arrowZ*100;
    
    gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlArrow2.elements);
    gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlArrow2).elements);
    cylinderColors=[RED,RED,RED,RED,RED,RED,RED,RED,RED];
    drawCylinderArrow(gl, program, cylinderColors, 1);
 
 
  
  }
  
  
} 
  function drawClouds(gl,program){
    
    
  
  gl.useProgram(program);
  
  
  mdlCloud=new Matrix4(); 	
  mdlCloud.translate(1.0,1.80,-2.0);
  mdlCloud.scale(0.25, 0.25, 0.09);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
  cylinderColors=[CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE];
  drawCylinder(gl,program,cylinderColors,1)


  mdlCloudChild=new Matrix4(mdlCloud); 	
  mdlCloudChild.translate(1.50,0.0,0.0);
  mdlCloudChild.scale(1.25, 1.0,1.5);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloudChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloudChild).elements);
  cylinderColors=[CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE];
  drawCylinder(gl,program,cylinderColors,1)

  mdlCloudChild=new Matrix4(mdlCloud); 	
  mdlCloudChild.translate(1.25,0.7,1.50);

  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloudChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloudChild).elements);
  cylinderColors=[CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE];
  drawCylinder(gl,program,cylinderColors,1)


  // cloud 2
  mdlCloud.translate(-5.0,-2.0,6.0);
  mdlCloud.scale(1.0, 1.0, 1.50);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
  drawCylinder(gl,program,cylinderColors,1);
  
  mdlCloud.translate(1.3,0.0,0.0);
  mdlCloud.scale(0.8, 0.8, 1.0);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
  drawCylinder(gl,program,cylinderColors,1);
  
  mdlCloud.translate(-0.7,1.0,0.0);
  mdlCloud.scale(1.0, 1.0, 1.0);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
  drawCylinder(gl,program,cylinderColors,1);
  
  
    // cloud 1
  cylinderColors=[WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE];
  mdlCloud.translate(14.0,-1.0,-1.0);
 
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
  drawCylinder(gl,program,cylinderColors,1);

  mdlCloud.translate(-0.7,1.0,0.0);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
  drawCylinder(gl,program,cylinderColors,1);

  mdlCloud.translate(-0.7,-1.0,0.0);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
  drawCylinder(gl,program,cylinderColors,1);

  mdlCloud.translate(-0.7,1.0,0.0);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
  drawCylinder(gl,program,cylinderColors,1);

  mdlCloud.translate(-0.7,-1.0,0.0);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
  drawCylinder(gl,program,cylinderColors,1);
  

}




function drawClouds2(gl,program){
  gl.useProgram(program);
  
  mdlCloud=new Matrix4(); 	
  mdlCloud.translate(-2.0,1.80,-1.0);
  mdlCloud.scale(0.25, 0.25, 0.09);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloud.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloud).elements);
   cylinderColors=[CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE];
  drawCylinder(gl,program,cylinderColors,1)


  mdlCloudChild=new Matrix4(mdlCloud); 	
  mdlCloudChild.translate(1.50,0.0,0.0);
 
  mdlCloudChild.scale(1.25, 1.0,1.5);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloudChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloudChild).elements);
  cylinderColors=[CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE];
  drawCylinder(gl,program,cylinderColors,1)

  mdlCloudChild=new Matrix4(mdlCloud); 	
  mdlCloudChild.translate(1.25,0.7,1.50);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloudChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloudChild).elements);
  cylinderColors=[CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE];
  drawCylinder(gl,program,cylinderColors,1)
  mdlCloudChild=new Matrix4(mdlCloud); 	
  mdlCloudChild.translate(1.60,-1.0,1.50);
  mdlCloudChild.scale(2.50, 0.50,1.0);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlCloudChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlCloudChild).elements);
  cylinderColors=[CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE,CWHITE];
  drawCylinder(gl,program,cylinderColors,1)


}

 function gameplay(gl,cylProg,mdlCylinder,currentCubeAngle,currentArrowAngle,gravity){
  //First disc
  drawDisc(gl, cylProg, mdlCylinder,  currentCubeAngle, currentArrowAngle,gravity);
  
	
      //Plays sound every throw 
      if (throwing == true){document.getElementById('audiotag1').play();}
       
      //random wind every turn  
      if (changeWind == true){
       wind = [((Math.random()*2)-1)/200000, ((Math.random()*2)-1)/200000, ((Math.random()*2)-1)/200000];
       changeWind = false;
      }  

    //winner logic
    
    if(throwCountA==throwCountB&& ScoreA>ScoreB){winner = 'PlayerA'; win = true;}
    if(throwCountA==throwCountB&& ScoreB>ScoreA){winner = 'PlayerB'; win = true;}
    if(throwCountA==throwCountB&& ScoreB==ScoreA && ScoreA>=1&&ScoreB>=1){winner = 'PlayerB'; tie = true;}
      
 
  if(win == true){
  //gamereset();
  }
  
  //PlayerB disc drawn after PlayerA first throw
  if(throwCountA >1){
   throwCountB = 1.0;
  drawDisc2(gl, cylProg, mdlCylinder, currentCubeAngle,currentArrowAngle,gravity); 
  }
  
  //PlayerID display every turn
  if (PlayerA==true) {
    playerID = 'A'  
    }
  if (PlayerB==true) {
    playerID = 'B' 
    }
  }
 
 
 // Second tree no collision shorter trunk longer leaves
 function drawTree2(gl, program, mdlCylinder){

  gl.useProgram(program);
  mdlMatrixChild=new Matrix4(mdlCylinder); 	

  mdlMatrixChild.translate(-0.7,-.50,-0.1);
  mdlMatrixChild.scale(0.4, 1.0, 0.05);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cylinderColors=[DGREEN, DGREEN, DGREEN, DGREEN, DGREEN, DGREEN, DGREEN,DGREEN, DGREEN];
  drawCylinder(gl,program,cylinderColors,1)


  mdlMatrixChild=new Matrix4(mdlCylinder); 	
  mdlMatrixChild.rotate(90, -1.0, 0.0,0.0);
  mdlMatrixChild.translate(-0.7,0.1,-1.35);
  mdlMatrixChild.scale(0.035, 0.035, 0.65);
  gl.uniformMatrix4fv(program.u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(program.u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cylinderColors=[BROWN,BROWN,BROWN,BROWN,BROWN,BROWN,BROWN,BROWN,BROWN];
  drawCylinder(gl,program,cylinderColors,1)
  
}


function drawCylinderArrow(gl,program,cylinderColors, normalDirection) {
  
  gl.useProgram(program);

  var vertices = new Float32Array([
    0.0, 0.0, 1.0, // top centre
    1.0, 0.0, 1.0,	  	 0.70710678,0.707107,1.0,
    0.0,1.0,1.0, 		-0.70710678, 0.707107,1.0,  
   -1.0, 0.0, 1.0, 	        -0.70710678,-0.70710678,1.0,
    0.0,-1.0,1.0,  		 0.70710678,-0.70710678,1.0,
    
    0.0, 0.0, -1.0, // bottom centre
    1.0, 0.0, -1.0,  		 0.70710678,0.707107,-1.0, 
    0.0,1.0,-1.0,  		-0.70710678, 0.707107,-1.0,
   -1.0, 0.0, -1.0, 		-0.70710678,-0.70710678,-1.0, 
    0.0,-1.0,-1.0,  		 0.70710678,-0.70710678,-1.0,
    
    
    1.0, 0.0, 1.0,	  	 0.70710678,0.707107,1.0,
    0.0,1.0,1.0, 		-0.70710678, 0.707107,1.0,  
    -1.0, 0.0, 1.0, 	        -0.70710678,-0.70710678,1.0,
    0.0,-1.0,1.0,  		 0.70710678,-0.70710678,1.0,
    0.0, 0.0, -2.0


	
	]);
	
  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    //
	 0, 3, 4,   0, 4, 5,
	 0, 5, 6,   0, 6, 7,
	 0, 7, 8,   0, 8, 1,
	 9,10,11,   9,11,12,
	 9,12,13,   9,13,14,
	 9,14,15,   9,15,16,
	 9,16,17,   9,17,10,
	 
	 18,10,19,  10,19,11,
	 19,11,20,  11,20,12,
	 20,12,21,  12,21,13,
	 21,13,22,  13,22,14,
	 22,14,23,  14,23,15,
	 23,15,24,  15,24,16,
	 24,16,25,  16,25,17,
	 25,17,18,  17,18,10,
	 10,11,26,  11,12,26,
	 12,13,26,  13,14,26,
	 14,15,26,  15,16,26,
	 16,17,26,  17,10,26
	]);
/*
  var colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v3-v4-v5 right(green)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v5-v6-v1 up(red)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v1-v6-v7-v2 left
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v3-v4-v5 right(green)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v5-v6-v1 up(red)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v3-v4-v5 right(green)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v5-v6-v1 up(red)
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,
  
  ]);
*/
var indicesTemp = [];

  var colors = new Float32Array(99);
  for(i=0; i<9; i++){
  var faceColor=cylinderColors[i];
	
		
	for(j=0; j<8; j++){
		for(k=0; k<3; k++){
			colors[k+3*j+4*3*i]=faceColor[k];
		}		
	}
  }


  var normals = new Float32Array([   // Normal coordinates
    0.0, 0.0, 1.0, 0.0,   0.0, 0.0, 1.0, 0.0,0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 1.0, 0.0,   0.0, 0.0, 1.0, 0.0,0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 1.0, 0.0,   0.0, 0.0, 1.0, 0.0,0.0, 0.0, 1.0, 0.0,

    0.0, 0.0, -1.0, 0.0,	0.0, 0.0, -1.0, 0.0,  0.0, 0.0, -1.0, 0.0,
    0.0, 0.0, -1.0, 0.0,	0.0, 0.0, -1.0, 0.0,  0.0, 0.0, -1.0, 0.0,
    0.0, 0.0, -1.0, 0.0,	0.0, 0.0, -1.0, 0.0,  0.0, 0.0, -1.0, 0.0,
 
    0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0
  /*1.0, 0.0, 0.0,0.0,	  	0.70710678,0.707107,0.0,0.0,
	0.0,1.0,0.0,0.0, 		-0.70710678, 0.707107,0.0,0.0,  
    -1.0, 0.0, 0.0,0.0, 	-0.70710678,-0.70710678,0.0,0.0,
	0.0,-1.0,0.0,0.0,  		0.70710678,-0.70710678,0.0,0.0*/
      
  ]);


  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, program, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, program, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
	
  if (!initArrayBuffer(gl, program, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  gl.uniform1f(program.u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}