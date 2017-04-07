// ColoredCube.js (c) 2012 matsuda
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
  'varying float v_Reflectivity;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_MdlMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '  v_Position = u_MdlMatrix * a_Position;\n' +
  '  v_Normal = u_NormalDirection * u_NMdlMatrix *a_Normal;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec4 v_Normal;\n' +
  'uniform float u_Reflectivity;\n' +
  'uniform vec4 u_Ambient;\n' +
  'uniform vec4 u_Diffuse;\n' +
  'uniform vec4 u_Specular;\n' +
  'uniform vec4 u_LightLocation;\n' +
  'uniform vec4 u_Eye;\n' +
  'void main() {\n' +
  '  float nDotL = max(0.0, dot(normalize(v_Normal), normalize(u_LightLocation-v_Position)));\n' +
  '  float hDotL = max(0.0, dot(normalize(v_Normal), normalize(normalize(u_LightLocation-v_Position)+normalize(u_Eye-v_Position))));\n' +
  '  gl_FragColor = v_Color*u_Ambient + v_Color*u_Diffuse*nDotL + u_Reflectivity * v_Color*u_Specular*pow(hDotL, 16.0);\n' +
  '}\n';
  

var mapSize = 100; //define total number blocks here for mapSizeXmapSize map

//colors are 4 values with some having a reflectivity value
var RED=new Float32Array([1, 0, 0]);
var WHITE=new Float32Array([1, 1, 1]);
var GRAY=new Float32Array([0.5, 0.5, 0.5]);
var SILVER=new Float32Array([0.75, 0.75, 0.75]);
var BLACK=new Float32Array([0.0, 0.0, 0.0]);
var BLUE=new Float32Array([0.0, 0.0, 1.0,1.0,1.0]);
var YELLOW=new Float32Array([1.0,1.0,0.0]);
var GREEN=new Float32Array([0.0,1.0,0.0,1, .2]);
var SAND=new Float32Array([.90,.80,.76,1.0, .5]);
var MESA=new Float32Array([.98,.80,.76,1.0, .7]);
var SNOW=new Float32Array([1,1, .99,1.0, 1]);
var ICE=new Float32Array([.77, .98, .98, 1.0, 1]);
var cubeProg;
var pointProg;
var cubeVec = [0.0, 2.0, 0.0, .01, 0.0, .01];
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  var hud = document.getElementById('hud');  

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  var ctx = hud.getContext('2d');
  
  // Initialize shaders
  cubeProg = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  
  
  if (!gl || !ctx) {
    console.log('Failed to get rendering context');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(cubeProg, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }
  
    // Get the storage location of u_MdlMatrix
  var u_MdlMatrix = gl.getUniformLocation(cubeProg, 'u_MdlMatrix');
  if (!u_MdlMatrix) {
    console.log('Failed to get the storage location of u_MdlMatrix');
    return;
  }
  
    // Get the storage location of u_NMdlMatrix
  var u_NMdlMatrix = gl.getUniformLocation(cubeProg, 'u_NMdlMatrix');
  if (!u_NMdlMatrix) {
    console.log('Failed to get the storage location of u_NMdlMatrix');
    return;
  }
  
  var currentAngle = [0.0, 0.0]; // Current rotation angle ([x-axis, y-axis] degrees)
  var playerVec = [0.0, 0.0, 0.0];
  //cubeVec is xpos, ypos, zpos, angle, xrotation, yrotation, zrotation, originalxspeed, originalyspeed, originalzspeed
  initEventHandlers(hud, currentAngle,playerVec); //pass hud instead of canvas
  
  width = .15; //set width of blocks
  noise.seed(Math.random()); 
  var type = [];
  var simplex = [];
  var trees = [];
  for(x = -mapSize; x < mapSize; x += width)
	{
		var temp = [];
		var btemp = [];
		var ttemp = [];
		for(z = -mapSize; z < mapSize; z += width)
		{
		    var holder = noise.simplex3(x/10, z/10, 580);
			if(holder < -.9)
			{
				btemp.push(MESA);
				temp.push(noise.simplex2(x, z)/8 + .5 );
				ttemp.push(0);
			}
			else if(holder < -.4)
			{
				btemp.push(SAND);
				temp.push(noise.simplex2(x, z)/8);
				ttemp.push(0);
			}
			else if(holder < 0)
			{
				btemp.push(GREEN);
				temp.push(noise.simplex2(x, z)/8);
				if(Math.random() < .1)
				{
					ttemp.push(1);
				}
				else
				{
					ttemp.push(0);
				}
			}
			else if(holder < .5)
			{
				btemp.push(BLUE);
				temp.push(noise.simplex2(x, z)/32);
				ttemp.push(0);
			}
			else if(holder < .7)
			{
				btemp.push(ICE);
				temp.push(noise.simplex2(x, z)/32+.01);
				ttemp.push(0);
			}
			else if(holder <= 1)
			{
				btemp.push(SNOW);
				temp.push(noise.simplex2(x, z)/32+.02);
				ttemp.push(0);
			}
		}
		type.push(btemp);
		simplex.push(temp);
		trees.push(ttemp);
	}
	//console.log(type);
	//console.log(simplex);
  

  n = 0;
  track = 0;
  arr = [];
	var tick = function() { // Start drawing
	fps = 1000/animate();
	arr[track] = fps;
	//console.log(arr);
	track++;
	if(track >= 128)
	{
      track = 0;
	}
	if(n < 128)
	{
	  n++;
	} 
	
	//Define blend functions for alpha setup
	gl.blendEquation(gl.FUNC_ADD)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
	
	draw2D(ctx, arr, n); // Draw 2D
draw(gl, u_MvpMatrix, u_MdlMatrix, u_NMdlMatrix, currentAngle,playerVec, simplex, type, trees, width);
requestAnimationFrame(tick, canvas);
};
tick();
}

function draw2D(ctx, fps, n) {
  ctx.clearRect(0, 0, 600, 600); // Clear <hud>
  // Draw white letters
  ctx.font = '18px "Times New Roman"';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
  var temp = 0;
  for(i = 0; i < n; i++)
  {
	temp += fps[i];
  }
  temp = temp / n;
  //console.log(n);
  ctx.fillText('FPS:' + temp, 20, 590); 
}

var last = Date.now(); // Last time that this function was called
function animate() {
  var now = Date.now();   // Calculate the elapsed time
  var elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  return elapsed;
}

function draw(gl, u_MvpMatrix, u_MdlMatrix, u_NMdlMatrix, currentAngle,playerVec, simplex, type, trees, width)
{
var EYE=new Float32Array([0, 0, 6.5 ]);
var CENTER=new Float32Array([0,0,0 ]);
  gl.useProgram(cubeProg);
	// Set the eye point and the viewing volume
  var mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(EYE[0], EYE[1], EYE[2], CENTER[0], CENTER[1], CENTER[2],0, 1, 0);
  mvpMatrix.translate(0,playerVec[1]-1,0);
  mvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  mvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  
  //console.log(mvpMatrix);
  
  var eyeMatrix = new Object();
  eyeMatrix.elements = new Float32Array([EYE[0],EYE[1],EYE[2],1,
							   0,0,0,1,
							   0,0,0,1,
							   0,0,0,0]);
  var tempMatrix = new Matrix4();
  tempMatrix.rotate(-currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  tempMatrix.rotate(-currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  tempMatrix.concat(eyeMatrix);
  EYE=new Float32Array([tempMatrix.elements[0], tempMatrix.elements[1], tempMatrix.elements[2]]);
  //console.log(EYE);

  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var mdlMatrix = new Matrix4();
  mdlMatrix.setIdentity();  
  
  
  //to set up light calc new sun position
  var time = animate();
  cubeVec[0] = time * cubeVec[3] + cubeVec[0];
  cubeVec[2] = time * cubeVec[5] + cubeVec[2];
  //console.log(cubeVec[0]);
  //console.log(cubeVec[2]);
  //calculate the offset for the player
  offset = [playerVec[0] +mapSize, playerVec[2]+ mapSize];
  setupLight(gl, EYE, [cubeVec[0] - (offset[0] - mapSize), cubeVec[1], cubeVec[2] - (offset[1] - mapSize)]);
  drawRoom(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, simplex, type, trees, width, offset);
}

function initEventHandlers(canvas, currentAngle,playerVec) {
  var dragging = false;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse

  canvas.onmousedown = function(ev) {   // Mouse is pressed
    var x = ev.clientX, y = ev.clientY;
    // Start dragging if a moue is in <canvas>
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };
  
  function doKeyDown(e) {

    
	var lrdelta = 1;
	var fbdelta = 1;
	var heightdelta = .2;
	var LR = 0; //array index for left right
	var FB = 2; //array index for forward backward
	//console.log("curr ang" +currentAngle[1]);
	
	//this code modifies what way forward is to follow the cameras perspective
	if(currentAngle[1] > 135 || currentAngle[1] < -135)
	{
		lrdelta = -1;
		fbdelta = -1;
	}
	else if(currentAngle[1] > 45)
	{
		LR = 2;
		FB = 0;
		fbdelta = -1;
	}
	else if(currentAngle[1] < -45)
	{
		LR = 2;
		FB = 0;
		lrdelta = -1;
		
	}
	
	//console.log( e.keyCode )
	switch (e.keyCode)
	{
		case 65:  //A
		var temp = playerVec[LR] - lrdelta;

		  playerVec[LR] = temp;
		break;
		
		case 68: //D
		var temp = playerVec[LR] + lrdelta;

		  playerVec[LR] = temp;
		break;
		
		case 83:  //S
		var temp = playerVec[FB] + fbdelta;

		  playerVec[FB] = temp;
		break;
		
		case 87:  //W
		var temp = playerVec[FB] - fbdelta;

		  playerVec[FB] = temp;
		break;
			
		case 32: //Spacebar
		var temp = playerVec[1] - heightdelta;
		playerVec[1] = temp;
		break;
		
		case 17: //control
		var temp = playerVec[1] + heightdelta;
		playerVec[1] = temp;
		
		
	}
}
  window.addEventListener("keydown", doKeyDown, true);

  canvas.onmouseup = function(ev) { dragging = false;  }; // Mouse is released

  canvas.onmousemove = function(ev) { // Mouse is moved
    var x = ev.clientX, y = ev.clientY;
    if (dragging) {
      var factor = 100/canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
      currentAngle[1] = Math.max(Math.min(currentAngle[1] + dx, 180.0), -180.0);
    }
    lastX = x, lastY = y;
  };
}

  
function getInverseTranspose(mat4){
	m = new Matrix4();
	m.setInverseOf(mat4);
	m.transpose();
	return m;
}

function drawRoom(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, simplex, type, trees, width, offset){

  childmdlMatrix = mdlMatrixChild=new Matrix4(mdlMatrix);
  childmdlMatrix.translate(0, -.25, 0);
  childmdlMatrix.scale(1,.01,1);
  gl.uniformMatrix4fv(u_MdlMatrix, false, childmdlMatrix.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(childmdlMatrix).elements);
  cubeColors = [WHITE, WHITE, BLUE, WHITE, WHITE, WHITE];
  drawCube(gl, cubeColors, -1);
  //Walls
  gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrix.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrix).elements);
  drawMap(gl, type, 1, simplex, width, offset, trees);
  
  childmdlMatrix = mdlMatrixChild=new Matrix4(mdlMatrix);
  childmdlMatrix.translate(cubeVec[0] - (offset[0] - mapSize), cubeVec[1], cubeVec[2] - (offset[1] - mapSize));
  childmdlMatrix.scale(.1,.1,.1);
  gl.uniformMatrix4fv(u_MdlMatrix, false, childmdlMatrix.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(childmdlMatrix).elements);
  cubeColors = [YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, YELLOW];
  drawCube(gl, cubeColors, -1);
  
  
  //Speed Cube
  //drawSpeedCube(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, c_mdlMatrix, cubeVec);
}


function drawCube(gl, cubeColors, normalDirection) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

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
  
  var BLACK=new Float32Array([0.0, 0.0, 0.0]);
  
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
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
	
  if (!initArrayBuffer(gl, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(cubeProg, 'u_NormalDirection');
  if (!u_NormalDirection) {
    console.log('Failed to get the storage location of u_NormalDirection');
    return;
  }
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}

function drawMap(gl, type, normalDirection, simplex, width, offset, trees) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  
  
  var normals = new Float32Array([   // Normal coordinates
     0.0, 0.0, 1.0, 0.0,  0.0, 0.0, 1.0,0.0,  0.0,0.0, 1.0,0.0,   0.0,0.0, 1.0,0.0,  // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,0.0,   1.0,0.0, 0.0,0.0,   1.0,0.0,0.0,0.0,   1.0, 0.0,0.0,0.0,  // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,0.0,   0.0, 1.0,0.0,0.0,  0.0, 1.0,0.0,0.0,  0.0, 1.0, 0.0,0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,0.0,   -1.0,0.0, 0.0,0.0,   -1.0,0.0,0.0, 0.0,  -1.0, 0.0,0.0,0.0,  // v1-v6-v7-v2 left
    //0.0, -1.0, 0.0,0.0,   0.0, -1.0,0.0,0.0,  0.0, -1.0,0.0,0.0,  0.0, -1.0, 0.0,0.0,  // v7-v4-v3-v2 down
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
  
  var BLACK=new Float32Array([0.0, 0.0, 0.0]);
 

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // back
  ]);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;
	
	
  if (!initArrayBuffer(gl, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(cubeProg, 'u_NormalDirection');
  if (!u_NormalDirection) {
    console.log('Failed to get the storage location of u_NormalDirection');
    return;
  }
  
  
  gl.uniform1f(u_NormalDirection, normalDirection);
  
  
  var u_Reflectivity = gl.getUniformLocation(cubeProg, 'u_Reflectivity');
  if (!u_Reflectivity) {
    console.log('Failed to get the storage location of u_Reflectivity');
    return;
  }
  //console.log(offset[0]);
  //console.log(offset[1]);
  gl.disable(gl.BLEND);
  for(x = 0; x < 2 / width; x++)
	{
		var actualX = x +offset[0];
		if(actualX < 0 || actualX > mapSize*2)
			continue;
		for(z = 0; z < 2 / width; z++)
		{
			//console.log(x);
			//console.log(z);
			
			actualZ = z +offset[1];
			if(actualZ < 0 || actualZ > mapSize*2)
				continue;
			if(type[actualX][actualZ][2] != 1.0)
			{
				var point = [x*width-1, simplex[actualX][actualZ], z*width-1];         //x,y,z
				var minHeight = Math.min(point[1], simplex[actualX-1][actualZ], simplex[actualX+1][actualZ],
										simplex[actualX][actualZ-1], simplex[actualX][actualZ+1]);
				if(type[actualX][actualZ][2] != 1.0 && (x == 0 || x > 2/width -2 || z == 0 || z > 2/width -2))
					minHeight = -.25
				else if((type[actualX][actualZ][2] != 1.0) && 
						(type[actualX-1][actualZ][2] == 1.0  
						|| type[actualX+1][actualZ][2] == 1.0
						|| type[actualX][actualZ-1][2] == 1.0
						|| type[actualX][actualZ+1][2] == 1.0))
					minHeight = -.25;
				var v0 = [point[0]+width,point[1],point[2]+width];
				var v1 = [point[0],point[1],point[2]+width];
				var v2 = [point[0],minHeight,point[2]+width];
				var v3 = [point[0]+width,minHeight,point[2]+width]
				var v4 = [point[0]+width,minHeight,point[2]];
				var v5 = [point[0]+width,point[1],point[2]];
				var v6 = [point[0],point[1],point[2]];
				var v7 = [point[0],minHeight,point[2]];
				var vertices = new Float32Array([   // Vertex coordinates
					v0[0],v0[1],v0[2],  v1[0],v1[1],v1[2],  v2[0],v2[1],v2[2],  v3[0],v3[1],v3[2],  // v0-v1-v2-v3 front
					v0[0],v0[1],v0[2],  v3[0],v3[1],v3[2],  v4[0],v4[1],v4[2],  v5[0],v5[1],v5[2],  // v0-v3-v4-v5 right
					v0[0],v0[1],v0[2],  v5[0],v5[1],v5[2],  v6[0],v6[1],v6[2],  v1[0],v1[1],v1[2],  // v0-v5-v6-v1 up
					v1[0],v1[1],v1[2],  v6[0],v6[1],v6[2],  v7[0],v7[1],v7[2],  v2[0],v2[1],v2[2],  // v1-v6-v7-v2 left
					v4[0],v4[1],v4[2],  v7[0],v7[1],v7[2],  v6[0],v6[1],v6[2],  v5[0],v5[1],v5[2]   // v4-v7-v6-v5 back
				]);
				var CX = type[actualX][actualZ][0];
				var CY = type[actualX][actualZ][1];
				var CZ = type[actualX][actualZ][2];
				var CA = type[actualX][actualZ][3];
				var CR = type[actualX][actualZ][4];
				var colors = new Float32Array([     // Colors
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA,  // v0-v1-v2-v3 front
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA,  // v0-v3-v4-v5 right
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA,  // v0-v5-v6-v1 up
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA,  // v1-v6-v7-v2 left
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA   // v4-v7-v6-v5 back
				]);
				if (!initArrayBuffer(gl, colors, 4, gl.FLOAT, 'a_Color'))
					return -1;
				// Write the vertex coordinates and color to the buffer object
				if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
					return -1;
					
				gl.uniform1f(u_Reflectivity, CR);


				

				gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
			}
		}
	}
	gl.enable(gl.BLEND);
	for(x = 0; x < 2 / width; x++)
	{
		var actualX = x +offset[0];
		if(actualX < 0 || actualX > mapSize*2)
			continue;
		for(z = 0; z < 2 / width; z++)
		{
			//console.log(x);
			//console.log(z);
			
			actualZ = z +offset[1];
			if(actualZ < 0 || actualZ > mapSize*2)
				continue;
			if(type[actualX][actualZ][2] == 1.0)
			{
				var point = [x*width-1, simplex[actualX][actualZ], z*width-1];         //x,y,z
				var minHeight = Math.min(point[1], simplex[actualX-1][actualZ], simplex[actualX+1][actualZ],
										simplex[actualX][actualZ-1], simplex[actualX][actualZ+1]);
				if(type[actualX][actualZ][2] != 1.0 && (x == 0 || x == 2/width -1 || z == 0 || z == 2/width -1))
					minHeight = -.25
				else if((type[actualX][actualZ][2] != 1.0) && 
						(type[actualX-1][actualZ][2] == 1.0  
						|| type[actualX+1][actualZ][2] == 1.0
						|| type[actualX][actualZ-1][2] == 1.0
						|| type[actualX][actualZ+1][2] == 1.0))
					minHeight = -.25;
				var v0 = [point[0]+width,point[1],point[2]+width];
				var v1 = [point[0],point[1],point[2]+width];
				var v2 = [point[0],minHeight,point[2]+width];
				var v3 = [point[0]+width,minHeight,point[2]+width]
				var v4 = [point[0]+width,minHeight,point[2]];
				var v5 = [point[0]+width,point[1],point[2]];
				var v6 = [point[0],point[1],point[2]];
				var v7 = [point[0],minHeight,point[2]];
				var vertices = new Float32Array([   // Vertex coordinates
					v0[0],v0[1],v0[2],  v1[0],v1[1],v1[2],  v2[0],v2[1],v2[2],  v3[0],v3[1],v3[2],  // v0-v1-v2-v3 front
					v0[0],v0[1],v0[2],  v3[0],v3[1],v3[2],  v4[0],v4[1],v4[2],  v5[0],v5[1],v5[2],  // v0-v3-v4-v5 right
					v0[0],v0[1],v0[2],  v5[0],v5[1],v5[2],  v6[0],v6[1],v6[2],  v1[0],v1[1],v1[2],  // v0-v5-v6-v1 up
					v1[0],v1[1],v1[2],  v6[0],v6[1],v6[2],  v7[0],v7[1],v7[2],  v2[0],v2[1],v2[2],  // v1-v6-v7-v2 left
					v4[0],v4[1],v4[2],  v7[0],v7[1],v7[2],  v6[0],v6[1],v6[2],  v5[0],v5[1],v5[2]   // v4-v7-v6-v5 back
				]);
				var CX = type[actualX][actualZ][0];
				var CY = type[actualX][actualZ][1];
				var CZ = type[actualX][actualZ][2];
				var CA = type[actualX][actualZ][3];
				var CR = type[actualX][actualZ][4];
				var colors = new Float32Array([     // Colors
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA,  // v0-v1-v2-v3 front
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA,  // v0-v3-v4-v5 right
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA,  // v0-v5-v6-v1 up
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA,  // v1-v6-v7-v2 left
					CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA, CX, CY, CZ, CA   // v4-v7-v6-v5 back
				]);
				if (!initArrayBuffer(gl, colors, 4, gl.FLOAT, 'a_Color'))
					return -1;
				// Write the vertex coordinates and color to the buffer object
				if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
					return -1;

				gl.uniform1f(u_Reflectivity, CR);
				

				gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
			}
		}
	}
	gl.disable(gl.BLEND);
	for(x = 0; x < 2 / width; x++)
	{
		var actualX = x +offset[0];
		if(actualX < 0 || actualX > mapSize*2)
			continue;
		for(z = 0; z < 2 / width; z++)
		{
			//console.log(x);
			//console.log(z);
			
			actualZ = z +offset[1];
			if(actualZ < 0 || actualZ > mapSize*2)
				continue;
			var point = [x*width-1, simplex[actualX][actualZ], z*width-1];         //x,y,z
			if(trees[actualX][actualZ] == 1)
				drawTree(gl, point, width, 1);
		}
	}
}

function drawTree(gl, point, width, normalDirection)
{
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var x = width/4;
  var z = width/4;
  var v0 = [point[0]+width-x,point[1]+.4,point[2]+width-z];
  var v1 = [point[0]+x,point[1]+.4,point[2]+width-z];
  var v2 = [point[0],point[1]+.2,point[2]+width];
  var v3 = [point[0]+width,point[1]+.2,point[2]+width]
  var v4 = [point[0]+width,point[1]+.2,point[2]];
  var v5 = [point[0]-x+width,point[1]+.4,point[2]+z];
  var v6 = [point[0]+x,point[1]+.4,point[2]+z];
  var v7 = [point[0],point[1]+.2,point[2]];
  var vertices = new Float32Array([   // Vertex coordinates
  v0[0],v0[1],v0[2],  v1[0],v1[1],v1[2],  v2[0],v2[1],v2[2],  v3[0],v3[1],v3[2],  // v0-v1-v2-v3 front
  v0[0],v0[1],v0[2],  v3[0],v3[1],v3[2],  v4[0],v4[1],v4[2],  v5[0],v5[1],v5[2],  // v0-v3-v4-v5 right
  v0[0],v0[1],v0[2],  v5[0],v5[1],v5[2],  v6[0],v6[1],v6[2],  v1[0],v1[1],v1[2],  // v0-v5-v6-v1 up
  v1[0],v1[1],v1[2],  v6[0],v6[1],v6[2],  v7[0],v7[1],v7[2],  v2[0],v2[1],v2[2],  // v1-v6-v7-v2 left
  v4[0],v4[1],v4[2],  v7[0],v7[1],v7[2],  v6[0],v6[1],v6[2],  v5[0],v5[1],v5[2]   // v4-v7-v6-v5 back
  ]);
  
  var normals = new Float32Array([   // Normal coordinates
     0.0, 0.0, 1.0, 0.0,  0.0, 0.0, 1.0,0.0,  0.0,0.0, 1.0,0.0,   0.0,0.0, 1.0,0.0,  // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,0.0,   1.0,0.0, 0.0,0.0,   1.0,0.0,0.0,0.0,   1.0, 0.0,0.0,0.0,  // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,0.0,   0.0, 1.0,0.0,0.0,  0.0, 1.0,0.0,0.0,  0.0, 1.0, 0.0,0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,0.0,   -1.0,0.0, 0.0,0.0,   -1.0,0.0,0.0, 0.0,  -1.0, 0.0,0.0,0.0,  // v1-v6-v7-v2 left
     0.0, 0.0, -1.0,0.0,  0.0, 0.0, -1.0,0.0,  0.0,0.0, -1.0,0.0,   0.0,0.0, -1.0, 0.0  // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([     // Colors
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v1-v2-v3 front(green)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v5-v6-v1 up(green)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v1-v6-v7-v2 left green
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4  // v4-v7-v6-v5 back green
  ]);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // back
  ]);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
	
  if (!initArrayBuffer(gl, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(cubeProg, 'u_NormalDirection');
  if (!u_NormalDirection) {
    console.log('Failed to get the storage location of u_NormalDirection');
    return;
  }
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
  
  
  //Draw the base of the tree
  
  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;
  v0 = [point[0]+width-x,point[1]+.2,point[2]+width-z];
  v1 = [point[0]+x,point[1]+.2,point[2]+width-z];
  v2 = [point[0]+x,point[1],point[2]+width-z];
  v3 = [point[0]+width-x,point[1],point[2]+width-z];
  v4 = [point[0]-x+width,point[1],point[2]+z];
  v5 = [point[0]-x+width,point[1]+.2,point[2]+z];
  v6 = [point[0]+x,point[1]+.2,point[2]+z];
  v7 = [point[0]+x,point[1],point[2]+z];
  vertices = new Float32Array([   // Vertex coordinates
  v0[0],v0[1],v0[2],  v1[0],v1[1],v1[2],  v2[0],v2[1],v2[2],  v3[0],v3[1],v3[2],  // v0-v1-v2-v3 front
  v0[0],v0[1],v0[2],  v3[0],v3[1],v3[2],  v4[0],v4[1],v4[2],  v5[0],v5[1],v5[2],  // v0-v3-v4-v5 right
  v0[0],v0[1],v0[2],  v5[0],v5[1],v5[2],  v6[0],v6[1],v6[2],  v1[0],v1[1],v1[2],  // v0-v5-v6-v1 up
  v1[0],v1[1],v1[2],  v6[0],v6[1],v6[2],  v7[0],v7[1],v7[2],  v2[0],v2[1],v2[2],  // v1-v6-v7-v2 left
  v4[0],v4[1],v4[2],  v7[0],v7[1],v7[2],  v6[0],v6[1],v6[2],  v5[0],v5[1],v5[2]   // v4-v7-v6-v5 back
  ]);
  colors = new Float32Array([     // Colors
    0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  // v0-v1-v2-v3 front(brown)
    0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  // v0-v3-v4-v5 right
	0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  // v0-v5-v6-v1 up
	0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  // v1-v6-v7-v2 left
	0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0,  0.7, 0.4, 0.0   // v4-v7-v6-v5 back
  ]);
  
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
   gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}
function initArrayBuffer(gl, data, num, type, attribute) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(cubeProg, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function setupLight(gl, eye, playerVec){
	  
	// Get the storage location of u_Ambient
	var u_Ambient = gl.getUniformLocation(cubeProg, 'u_Ambient');
	if (!u_Ambient) {
		console.log('Failed to get the storage location of u_Ambient');
		return;
	}
	
	// Get the storage location of u_Diffuse
	var u_Diffuse = gl.getUniformLocation(cubeProg, 'u_Diffuse');
	if (!u_Diffuse) {
		console.log('Failed to get the storage location of u_Diffuse');
		return;
	}
	
	// Get the storage location of u_Specular
	var u_Specular = gl.getUniformLocation(cubeProg, 'u_Specular');
	if (!u_Specular) {
		console.log('Failed to get the storage location of u_Specular');
		return;
	}
	
	// Get the storage location of u_LightLocation
	var u_LightLocation = gl.getUniformLocation(cubeProg, 'u_LightLocation');
	if (!u_LightLocation) {
		console.log('Failed to get the storage location of u_LightLocation');
		return;
	}
	
	// Get the storage location of u_Eye
	var u_Eye = gl.getUniformLocation(cubeProg, 'u_Eye');
	if (!u_Eye) {
		console.log('Failed to get the storage location of u_Eye');
		return;
	}
	
	gl.uniform4f(u_Ambient, 0.2, 0.2, 0.2, 1.0);

	gl.uniform4f(u_Diffuse, 0.8, 0.8, 0.8, 1.0);
	
	gl.uniform4f(u_Specular, 1.0, 1.0, 1.0, .8);
	
	gl.uniform4f(u_LightLocation, playerVec[0], playerVec[1]+.2, playerVec[2], 1.0);
	
	gl.uniform4f(u_Eye, eye[0], eye[1], eye[2], 1.0);
}
