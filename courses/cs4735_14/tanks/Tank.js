// ColoredCube.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform mat4 m_Matrix;\n' +
  'uniform mat4 u_Direction;\n' +
  'attribute vec4 a_Normal;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec4 u_Normal;\n' +
  'void main() {\n' +
  '  u_Normal = normalize(vec4(vec3(u_Direction*u_NormalMatrix*a_Normal),0.0));\n' +
  '  v_Position = m_Matrix*a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '  gl_Position = u_MvpMatrix * m_Matrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'varying vec4 u_Normal;\n' +
  'varying vec4 v_Position;\n' +
  'uniform vec4 u_Ambient;\n' +
  'uniform vec4 u_Diffuse;\n' +
  'uniform vec4 u_Specular;\n' +
  'uniform vec4 u_LightLocation;\n' +
  'uniform vec4 u_Eye;\n' +
  'void main() {\n' +
  '  float nDotL = max(0.0, dot(normalize(u_Normal), normalize(u_LightLocation-v_Position)));\n' +
  '  float hDotL = max(0.0, dot(normalize(u_Normal), normalize(normalize(u_LightLocation-v_Position)+normalize(u_Eye-v_Position))));\n' +
  '  gl_FragColor = v_Color*u_Ambient + v_Color*u_Diffuse*nDotL + v_Color*u_Specular*pow(hDotL, 4.0);\n' +
  '}\n';

  
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  var ctx = hud.getContext('2d');
  if (!gl || !ctx) {
    console.log('Failed to get rendering context');
    return;
  }


  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 0.7);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }
  
  var m_Matrix = gl.getUniformLocation(gl.program, 'm_Matrix');
  if (!m_Matrix) {
    console.log('Failed to get the storage location of m_Matrix');
    return;
  }
  
  var u_Direction = gl.getUniformLocation(gl.program, 'u_Direction');
  if (!u_Direction) {
    console.log('Failed to get the storage location of u_Direction');
    return;
  }
  
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }
  
  var uDirection = new Matrix4();
  uDirection.setIdentity();

  // Set the eye point and the viewing volume
  var mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(-6, 2, 0, 0, 0, 0, 0, 1, 0);
  
  var mMatrix = new Matrix4();
  mMatrix.setIdentity();

  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(m_Matrix, false, mMatrix.elements);
  gl.uniformMatrix4fv(u_Direction, false, uDirection.elements);
  
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var currentAngle = [0.0,0.0];
  var pBodyAngle = [0.0,0.0];
  var pPosition = [0.0,0.0];
  var velocity = [0.1,0.0];
  var treePosition = [];
  var bullets = [];
  var enermyBullets = [];
  var enermies = [];
  var playerHP = [100];
  var gameOver = [false];
  var victory = [false];
  var FPS = 0.0;//frames per second
  var count = 0;
  var countI = 0;
  var firstSample = [];
  var FPSsum = 0.0;
  var countFirst = 0;
  var dltTime = 0;
  for(i=0;i<20;i=i+2){
	treePosition[i] = 9.9-19.8*Math.random();
	treePosition[i+1] = 9.9-19.8*Math.random();
  }
  for(i=0;i<2;i++){//generate enemy tanks
	var enermy = new Object();
	enermy.frameCount = [100];
	enermy.bullets = [];
	enermy.HP = 100;
	enermy.velocity = [0.0,-0.03];
	r1 = 9.6-8.6*Math.random();
	r2 = 9.6*Math.random();
	enermy.position = [r1,r2];
	enermy.headAngle = [0.0,0.0];
	enermy.bodyAngle = [0.0,0.0];
	enermy.bodyAngleVelocity = 10.0;
	enermy.headAngleVelocity = 10.0;
	enermies.push(enermy);
  }
  for(i=0;i<2;i++){//generate enemy tanks
	var enermy = new Object();
	enermy.frameCount = [100];
	enermy.bullets = [];
	enermy.HP = 100;
	enermy.velocity = [0.0,-0.03];
	r1 = -9.6+8.6*Math.random();
	r2 = 9.6*Math.random();
	enermy.position = [r1,r2];
	enermy.headAngle = [0.0,0.0];
	enermy.bodyAngle = [0.0,0.0];
	enermy.bodyAngleVelocity = 10.0;
	enermy.headAngleVelocity = 10.0;
	enermies.push(enermy);
  }
  for(i=0;i<2;i++){//generate enemy tanks
	var enermy = new Object();
	enermy.frameCount = [100];
	enermy.bullets = [];
	enermy.HP = 100;
	enermy.velocity = [0.0,-0.03];
	r2 = 9.6-8.6*Math.random();
	r1 = 9.6*Math.random();
	enermy.position = [r1,r2];
	enermy.headAngle = [0.0,0.0];
	enermy.bodyAngle = [0.0,0.0];
	enermy.bodyAngleVelocity = 10.0;
	enermy.headAngleVelocity = 10.0;
	enermies.push(enermy);
  }
  for(i=0;i<2;i++){//generate enemy tanks
	var enermy = new Object();
	enermy.frameCount = [100];
	enermy.bullets = [];
	enermy.HP = 100;
	enermy.velocity = [0.0,-0.03];
	r2 = -9.6+8.6*Math.random();
	r1 = 9.6*Math.random();
	enermy.position = [r1,r2];
	enermy.headAngle = [0.0,0.0];
	enermy.bodyAngle = [0.0,0.0];
	enermy.bodyAngleVelocity = 10.0;
	enermy.headAngleVelocity = 10.0;
	enermies.push(enermy);
  }
  
  initEventHandlers(canvas,hud, currentAngle,pBodyAngle, pPosition, velocity, bullets,gameOver,victory);
  
  var lastT = Date.now();
  var tick = function() {
  var nowT = Date.now();
	count++;
	if(count>99){
		count = 0;
		dltTime = (nowT - lastT)/1000;
		lastT = nowT;
		FPSsample = 100/dltTime;
		firstSample[countI] = FPSsample;
		countI ++;
		if(countI>127){
			FPSsum = FPSsum+FPSsample-firstSample[countFirst];
			countFirst++;
			FPS = FPSsum/128;
		}
		else{
			FPSsum += FPSsample;
			FPS = FPSsum/countI;
		}
	}
    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	if(enermies.length==0){
		victory[0] = true;
	}
	draw2D(ctx,playerHP,enermies,gameOver,victory,FPS);//game info
    draw(gl, currentAngle,pBodyAngle,pPosition,velocity, mMatrix, m_Matrix, u_Direction, uDirection,u_NormalMatrix, mvpMatrix,u_MvpMatrix,treePosition,bullets,enermies,playerHP,gameOver);   // Draw the triangle
  };
  tick();
}


function drawCube(gl, colors, direction, u_Direction, uDirection) {
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
  
  var normals = new Float32Array([// normals
     0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
	 1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
	 0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
	-1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
	 0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
	 0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,
  ]);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
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
	
  if(!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) 
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  uDirection.setScale(direction,direction,direction);
  gl.uniformMatrix4fv(u_Direction, false, uDirection.elements);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}


function drawBullet(gl, bullet,colors, m_Matrix, mMatrix, u_Direction, uDirection, u_NormalMatrix){
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(bullet.position[0],bullet.position[1],bullet.position[2]);
	mMatrixChild.rotate(bullet.angle[0],0.0,1.0,0.0);
	mMatrixChild.scale(0.04,0.04,0.04);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
	bullet.position[0] += bullet.velocity[0]*Math.sin(Math.PI*(90.0+bullet.angle[0])/180);
	bullet.position[1] -= bullet.velocity[1];
	bullet.position[2] += bullet.velocity[0]*Math.cos(Math.PI*(90.0+bullet.angle[0])/180);
	var gravity = 0.016;//gravity working on bullets.
	bullet.velocity[1] += gravity;
}


function drawTrees(gl, position, m_Matrix, mMatrix, u_Direction, uDirection, u_NormalMatrix){
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(position[0],0.05,position[1]);
	drawTrunk(gl, m_Matrix, mMatrixChild, u_Direction, uDirection, u_NormalMatrix);
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(position[0],0.05,position[1]);
	drawLeaf(gl, m_Matrix, mMatrixChild, u_Direction, uDirection, u_NormalMatrix);
}


function drawLeaf(gl, m_Matrix, mMatrix, u_Direction, uDirection, u_NormalMatrix){
	var colors = new Float32Array([     // Colors
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  // v0-v1-v2-v3 front(blue)
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  // v0-v3-v4-v5 right(green)
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  // v0-v5-v6-v1 up(red)
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0   // v4-v7-v6-v5 back
  ]);
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(0.0,0.27,0.0);
	mMatrixChild.scale(0.4,0.07,0.4);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
	
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(0.0,0.41,0.0);
	mMatrixChild.scale(0.3,0.07,0.3);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
	
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(0.0,0.55,0.0);
	mMatrixChild.scale(0.2,0.07,0.2);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
}

function drawTrunk(gl, m_Matrix, mMatrix, u_Direction, uDirection, u_NormalMatrix){
	var colors = new Float32Array([     // Colors
    0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  // v0-v1-v2-v3 front(blue)
    0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  // v0-v3-v4-v5 right(green)
    0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  // v0-v5-v6-v1 up(red)
    0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  // v1-v6-v7-v2 left
    0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  // v7-v4-v3-v2 down
    0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8,  0.8, 0.8, 0.8   // v4-v7-v6-v5 back
  ]);
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.scale(0.08,0.2,0.08);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
}

function createPlayer(gl, m_Matrix, mMatrix,u_Direction, uDirection,u_NormalMatrix,currentAngle,pBodyAngle,pPosition){
	var colors = new Float32Array([     // Colors
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v0-v1-v2-v3 front(blue)
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v0-v3-v4-v5 right(green)
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v0-v5-v6-v1 up(red)
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v7-v4-v3-v2 down
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0   // v4-v7-v6-v5 back
  ]);
  drawTank(gl, colors, m_Matrix, mMatrix,u_Direction, uDirection,u_NormalMatrix,currentAngle,pBodyAngle,pPosition);
}

function createEnermy(gl, m_Matrix, mMatrix,u_Direction, uDirection,u_NormalMatrix,enermy){
	var colors = new Float32Array([     // Colors
    1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  // v0-v1-v2-v3 front(blue)
    1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  // v0-v3-v4-v5 right(green)
    1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  // v0-v5-v6-v1 up(red)
    1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  // v7-v4-v3-v2 down
    1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0   // v4-v7-v6-v5 back
  ]);
  if(enermy.frameCount[0]>180-120*Math.random()){//let the enemy move more smoothly
  if(Math.floor(3*Math.random())%3==0){			//
	enermy.bodyAngleVelocity = 0;				//
  }												//
  else if(Math.floor(3*Math.random())%3==1){	//
	enermy.bodyAngleVelocity = -10.0;			//
  }												//
  else{											//
	enermy.bodyAngleVelocity = 10.0;			//
  }												//
  if(Math.floor(3*Math.random())%3==0){			//
	enermy.headAngleVelocity = 0;				//
  }												//
  else if(Math.floor(3*Math.random())%3==1){	//
	enermy.headAngleVelocity = -10.0;			//
  }												//				enemy movement
  else{											//
	enermy.headAngleVelocity = 10.0;			//
  }												//
  if(Math.floor(3*Math.random())%3==0){			//
	enermy.velocity[0] = 0;						//
  }												//
  else if(Math.floor(3*Math.random())%3==1){	//
	enermy.velocity[0] = -0.3;					//
  }												//
  else{											//
	enermy.velocity[0] = 0.3;					//
  }												//
  enermy.frameCount[0] = 0;						//
  }												//
  enermy.frameCount[0]++;						//
  enermy.bodyAngle[0] += enermy.bodyAngleVelocity;
  enermy.headAngle[0] += enermy.headAngleVelocity;
  enermy.position[0] = Math.max(Math.min(enermy.position[0] + enermy.velocity[0]*Math.sin(Math.PI*(90.0+enermy.bodyAngle[0])/180),9.6),-9.6);
  enermy.position[1] = Math.max(Math.min(enermy.position[1] + enermy.velocity[0]*Math.cos(Math.PI*(90.0+enermy.bodyAngle[0])/180),9.6),-9.6);
  if(100*Math.random()>91){// the fluency of shooting by enemy
	var bullet = new Object();
	bullet.position = [enermy.position[0]+0.80*Math.sin(Math.PI*(90.0+enermy.headAngle[0])/180),0.29,enermy.position[1]+0.80*Math.cos(Math.PI*(90.0+enermy.headAngle[0])/180)];
	bullet.velocity = [1.0,0.0];
	bullet.angle = [enermy.headAngle[0],enermy.headAngle[1]];
	enermy.bullets.push(bullet);
	document.getElementById('audiotag1').play();
  }
  drawTank(gl, colors, m_Matrix, mMatrix,u_Direction, uDirection,u_NormalMatrix,enermy.headAngle,enermy.bodyAngle,enermy.position);
}

function drawTank(gl,colors, m_Matrix, mMatrix, u_Direction, uDirection,u_NormalMatrix,currentAngle,pBodyAngle,pPosition){
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(pPosition[0],0.0,pPosition[1]);
	mMatrixChild.rotate(pBodyAngle[0], 0.0, 1.0, 0.0);
	mMatrixChild.translate(-pPosition[0],0.0,-pPosition[1]);
	mMatrixChild.translate(pPosition[0],0.0,pPosition[1]);
	drawBody(gl,colors, m_Matrix, mMatrixChild, u_Direction, uDirection,u_NormalMatrix);
	
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(pPosition[0],0.0,pPosition[1]);
	mMatrixChild.rotate(currentAngle[0], 0.0, 1.0, 0.0);//head pointing towards where the camera pointing
	mMatrixChild.translate(-pPosition[0],0.0,-pPosition[1]);
	mMatrixChild.translate(pPosition[0],0.0,pPosition[1]);
	drawHead(gl,colors, m_Matrix, mMatrixChild, u_Direction, uDirection,u_NormalMatrix);
}


function drawBody(gl,colors, m_Matrix, mMatrixChild, u_Direction, uDirection,u_NormalMatrix){
	mMatrixChildC=new Matrix4(mMatrixChild);
	mMatrixChildC.scale(0.5,0.15,0.4);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChildC.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChildC).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
	
	mMatrixChildC=new Matrix4(mMatrixChild);
	mMatrixChildC.translate(-0.5,0.0,0.0);
	mMatrixChildC.scale(0.03,0.15,0.3);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChildC.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChildC).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
}

function drawHead(gl,colors, m_Matrix, mMatrixChild, u_Direction, uDirection,u_NormalMatrix){
	mMatrixChildC=new Matrix4(mMatrixChild);
	mMatrixChildC.translate(0.0,0.25,0.0);
	mMatrixChildC.scale(0.25,0.10,0.25);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChildC.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChildC).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
	
	mMatrixChildC=new Matrix4(mMatrixChild);
	mMatrixChildC.translate(0.50,0.26,0.0);
	mMatrixChildC.scale(0.25,0.03,0.05);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChildC.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChildC).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
	
	mMatrixChildC=new Matrix4(mMatrixChild);
	mMatrixChildC.translate(-0.10,0.35,0.10);
	mMatrixChildC.scale(0.1,0.04,0.1);
    gl.uniformMatrix4fv(m_Matrix, false, mMatrixChildC.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChildC).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
}

function drawTerrain(gl, m_Matrix, mMatrix, u_Direction, uDirection,u_NormalMatrix){
	var colors = new Float32Array([     // Colors
    0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  // v0-v1-v2-v3 front(blue)
    0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  // v0-v3-v4-v5 right(green)
    0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  // v0-v5-v6-v1 up(red)
    0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  // v1-v6-v7-v2 left
    0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  // v7-v4-v3-v2 down
    0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0,  0.3, 0.3, 0.0   // v4-v7-v6-v5 back
  ]);
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(0.0,-2.15,0.0);
	mMatrixChild.scale(10.0,2.0,10.0);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,colors,1, u_Direction, uDirection);
	
	var rcolors = new Float32Array([     // Colors
    0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  // v0-v1-v2-v3 front(blue)
    0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  // v0-v3-v4-v5 right(green)
    0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  // v0-v5-v6-v1 up(red)
    0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0,  0.0, 0.0, 2.0  // v4-v7-v6-v5 back
  ]);
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(5.0,-0.15,5.0);
	mMatrixChild.scale(0.5,0.02,5.0);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,rcolors,1, u_Direction, uDirection);
	
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(5.0,1.70,9.75);
	mMatrixChild.scale(0.5,2.0,0.25);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,rcolors,1, u_Direction, uDirection);
	
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(3.5,-0.15,0.0);
	mMatrixChild.scale(2.0,0.02,0.5);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,rcolors,1, u_Direction, uDirection);
	
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(1.0,-0.15,0.0);
	mMatrixChild.scale(0.5,0.02,3.0);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,rcolors,1, u_Direction, uDirection);
	
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(-4.5,-0.15,3.0);
	mMatrixChild.scale(6.0,0.02,0.5);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,rcolors,1, u_Direction, uDirection);
	
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(-4.5,-0.15,3.0);
	mMatrixChild.scale(6.0,0.02,0.5);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,rcolors,1, u_Direction, uDirection);
	
	mMatrixChild=new Matrix4(mMatrix);
	mMatrixChild.translate(-10.25,-2.15,3.0);
	mMatrixChild.scale(0.25,2.0,0.5);
	gl.uniformMatrix4fv(m_Matrix, false, mMatrixChild.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, getInverseTranspose(mMatrixChild).elements);
	drawCube(gl,rcolors,1, u_Direction, uDirection);
}


var viewProjMatrix = new Matrix4();
//the draw function
function draw(gl, currentAngle,pBodyAngle,pPosition,velocity, mMatrix, m_Matrix, u_Direction, uDirection,u_NormalMatrix,mvpMatrix,u_MvpMatrix,treePosition,bullets,enermies,playerHP,gameOver) {
  viewProjMatrix.set(mvpMatrix);//the following camera
  viewProjMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0);
  viewProjMatrix.translate(-pPosition[0],0.0,-pPosition[1]);
  gl.uniformMatrix4fv(u_MvpMatrix, false, viewProjMatrix.elements);
  
  var EYEINIT=new Object();
		EYEINIT.elements=new Float32Array([
		   -6, 2, 0, 1,
			0, 0, 0, 1,
			0, 0, 0, 1,
			0, 0, 0, 0
		]);
	var eyeTransformMatrix = new Matrix4(EYEINIT);
	eyeTransformMatrix.transpose();
	eyeTransformMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0);
	var EYE = new Float32Array([eyeTransformMatrix.elements[0],eyeTransformMatrix.elements[4],eyeTransformMatrix.elements[8]]);
  
  setupLight(gl,EYE);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if(!gameOver[0]){
	createPlayer(gl, m_Matrix, mMatrix, u_Direction, uDirection,u_NormalMatrix,currentAngle,pBodyAngle,pPosition);
  }
  drawTerrain(gl,m_Matrix, mMatrix, u_Direction, uDirection,u_NormalMatrix);
  
  var EBcolor = new Float32Array([     // Colors
    0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  // v0-v1-v2-v3 front(blue)
    0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  // v0-v3-v4-v5 right(green)
    0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  // v0-v5-v6-v1 up(red)
    0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0   // v4-v7-v6-v5 back
  ]);
  
  var collide = false;//in order to determine that no enemy tanks touches player tank
  for(i=0;i<enermies.length;i++){
	createEnermy(gl, m_Matrix, mMatrix, u_Direction, uDirection,u_NormalMatrix, enermies[i]);
	for(j=0;j<enermies[i].bullets.length;j++){//draw enemies' bullets
	drawBullet(gl, enermies[i].bullets[j],EBcolor, m_Matrix, mMatrix, u_Direction, uDirection, u_NormalMatrix);
  }
	for(j=enermies[i].bullets.length-1;j>=0;j--){//delete enemies' bullets which are out of stage.
	if(enermies[i].bullets[j].position[1]<-1.0){
		enermies[i].bullets.splice(j,1);
	}
  }
  if(detectTankCollision(enermies[i].position,pPosition)){//detect collision between player and enemies
		enermies[i].velocity[0] = -enermies[i].velocity[0];
		velocity[0] = -0.1;
		//alert(velocity[0]);
		collide = true;
	}
  }
  if(!collide){
		velocity[0] = 0.1;
  }
  
  for(i=0;i<enermies.length;i++)
  for(j=0;j<enermies.length;j++){//detect collision between enemies
	if(i!=j){
		if(detectTankCollision(enermies[i].position,enermies[j].position)){
			enermies[i].velocity[0] = -enermies[i].velocity[0];
			enermies[j].velocity[0] = -enermies[j].velocity[0];
		}
	}
  }
  
  var treeP = [];//to record the position of each tree
  for(i=0;i<20;i=i+2){//draw trees
    var position = [treePosition[i],treePosition[i+1]];
	if(treeP.length<11){
		treeP.push(position);
	}
	drawTrees(gl, position, m_Matrix, mMatrix, u_Direction, uDirection, u_NormalMatrix);
  }
  
  var PBcolor = new Float32Array([     // Colors
    0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  // v0-v1-v2-v3 front(blue)
    0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  // v0-v3-v4-v5 right(green)
    0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  // v0-v5-v6-v1 up(red)
    0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  // v1-v6-v7-v2 left
    0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  // v7-v4-v3-v2 down
    0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5   // v4-v7-v6-v5 back
  ]);
  for(i=0;i<bullets.length;i++){//draw player's bullets
	drawBullet(gl, bullets[i],PBcolor, m_Matrix, mMatrix, u_Direction, uDirection, u_NormalMatrix);
  }
  
  for(i=bullets.length-1;i>=0;i--){//delete the bullets that are out of stage
	if(bullets[i].position[1]<-1.0){
		bullets.splice(i,1);
	}
  }
  
  for(i=bullets.length-1;i>=0;i--)
  for(j=0;j<enermies.length;j++){//bullets collision with enemies
	if(detectBulletCollision(bullets[i].position,enermies[j].position)){
		enermies[j].HP -= 10;
		//alert(enermies[j].HP);
		bullets.splice(i,1);
	}
  }
  
  /*for(i=0;i<10;i++) //if I add collision detection between trees and enemy tanks, some of the enemy tanks will disappear, I did not figure out why.
  for(j=0;j<enermies.length;j++){//enermies' collision with trees
	if(detectTreeCollision(treeP[i],enermies[j].position)){
		enermies[j].velocity = -enermies[j].velocity;
	}
  }*/
  
  var notCollide = true;
  for(i=0;i<10;i++){//player's collision with trees
	if(detectTreeCollision(treeP[i],pPosition)){
		velocity[0] = -0.1;
		notCollide = false;
	}
  }
  if(notCollide&&!collide){
		velocity[0] = 0.1;
  }
  
  for(i=bullets.length-1;i>=0;i--)
  for(j=0;j<enermies.length;j++){//bullets collision with enemies
	if(detectBulletCollision(bullets[i].position,enermies[j].position)){
		enermies[j].HP -= 10;
		//alert(enermies[j].HP);
		bullets.splice(i,1);
	}
  }
  
  for(i=enermies.length-1;i>=0;i--){//delete enemies destroyed
	if(enermies[i].HP<0){
		enermies.splice(i,1);
	}
  }
  
  for(i=0;i<enermies.length;i++)
  for(j=enermies[i].bullets.length-1;j>=0;j--){//bullets collision with player
	if(detectBulletCollision(enermies[i].bullets[j].position,pPosition)){
		playerHP[0] -= 20;
		enermies[i].bullets.splice(j,1);
	}
  }
  if(playerHP[0]<=0){//game over
	gameOver[0] = true;
  }
}

function draw2D(ctx,playerHP,enermies,gameOver,victory,FPS) {//draw game information
  ctx.clearRect(0, 0, 400, 400); // Clear <hud>
  if(gameOver[0]){
	ctx.font = '68px "Times New Roman"';
	ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
	ctx.fillText('GAME OVER!', 0, 200); 
  }
  
  else if(victory[0]){
	ctx.font = '80px "Times New Roman"';
	ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
	ctx.fillText('VICTORY!!', 0, 200); 
  }
  else{
	ctx.font = '18px "Times New Roman"';
	ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
	ctx.fillText('|  Your HP: '+ playerHP + '  |  Enermies left: ' + enermies.length + '  |', 40, 380); 
	ctx.font = '18px "Times New Roman"';
	ctx.fillText('+',196,60);
  }
  ctx.font = '18px "Times New Roman"';
  ctx.fillText('FPS: ' + Math.round(FPS*100)/100, 20, 30);
}

//detect collision of bullets and tanks
function detectBulletCollision(bulletPo,tankPo){
	var distance = Math.sqrt(Math.pow((bulletPo[0]-tankPo[0]),2)+Math.pow((bulletPo[2]-tankPo[1]),2));
	if(distance<0.5){
		return true;
	}
	else{
		return false;
	}
}

//detect collision between tanks
function detectTankCollision(tank1Po,tank2Po){
	var distance = Math.sqrt(Math.pow((tank1Po[0]-tank2Po[0]),2)+Math.pow((tank1Po[1]-tank2Po[1]),2));
	if(distance<0.9){
		return true;
	}
	else{
		return false;
	}
}

//detect collision between tank and tree
function detectTreeCollision(treePo,tankPo){
	var distance = Math.sqrt(Math.pow((treePo[0]-tankPo[0]),2)+Math.pow((treePo[1]-tankPo[1]),2));
	if(distance<0.6){
		return true;
	}
	else{
		return false;
	}
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
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

var last = Date.now();
function animate(angle, angleVelocity) {
  var now = Date.now();   // Calculate the elapsed time
  var elapsed = now - last;
  last = now;
  var newAngle = angle;
  // Update the current rotation angle (adjusted by the elapsed time)
  for(i=0;i<angle.length;i++){
     newAngle[i] = (angle[i] + (angleVelocity[i] * elapsed) / 1000.0) % 360;
  }
  return newAngle;
}

function getInverseTranspose(mat4){
	m = new Matrix4();
	m.setInverseOf(mat4);
	m.transpose();
	return m;
}

function setupLight(gl,EYE){
	  
	// Get the storage location of u_Ambient
	var u_Ambient = gl.getUniformLocation(gl.program, 'u_Ambient');
	if (!u_Ambient) {
		console.log('Failed to get the storage location of u_Ambient');
		return;
	}
	
	// Get the storage location of u_Diffuse
	var u_Diffuse = gl.getUniformLocation(gl.program, 'u_Diffuse');
	if (!u_Diffuse) {
		console.log('Failed to get the storage location of u_Diffuse');
		return;
	}
	
	// Get the storage location of u_Specular
	var u_Specular = gl.getUniformLocation(gl.program, 'u_Specular');
	if (!u_Specular) {
		console.log('Failed to get the storage location of u_Specular');
		return;
	}
	
	// Get the storage location of u_LightLocation
	var u_LightLocation = gl.getUniformLocation(gl.program, 'u_LightLocation');
	if (!u_LightLocation) {
		console.log('Failed to get the storage location of u_LightLocation');
		return;
	}
		
	
	// Get the storage location of u_Eye
	var u_Eye = gl.getUniformLocation(gl.program, 'u_Eye');
	if (!u_Eye) {
		console.log('Failed to get the storage location of u_Eye');
		return;
	}
	
	gl.uniform4f(u_Ambient, 0.3, 0.3, 0.3, 1.0);

	gl.uniform4f(u_Diffuse, 0.8, 0.8, 0.8, 1.0);
	
	gl.uniform4f(u_Specular, 0.4, 0.4, 0.4, 1.0);
	
	gl.uniform4f(u_LightLocation, 0, 6, 0, 1.0);
	
	gl.uniform4f(u_Eye, EYE[0], EYE[1], EYE[2], 1.0);
}

function initEventHandlers(canvas,hud, currentAngle,pBodyAngle, pPosition, velocity, bullets,gameOver,victory) {
  var dragging = true;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse
  //var keyPressing = false;         // Keyboard is being pressed or not

  hud.onmouseup = function(ev) {   // Mouse is released
    var x = ev.clientX, y = ev.clientY;
    // Start dragging if a moue is in <canvas>
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };

  hud.onmousedown = function(ev) { dragging = false;  }; // Mouse is pressed

  hud.onmousemove = function(ev) { // Mouse is moved
    var x = ev.clientX, y = ev.clientY;
    if (dragging) {
      var factor = 200/canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      //currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
	  currentAngle[0] = currentAngle[0] - dx;
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };
  
  var spaceReleased = true;//in case that the player keeps shooting all the time.
  window.addEventListener("keydown", onkeydown, false);
  onkeydown = function(ev){
  //alert(ev.keyCode);
	if(ev.keyCode == 83&&!gameOver[0]&&!victory[0]){
		//alert(ev.keyCode);
		pPosition[0] = Math.max(Math.min(pPosition[0] - velocity[0]*Math.sin(Math.PI*(90.0+pBodyAngle[0])/180),9.6),-9.6);
		pPosition[1] = Math.max(Math.min(pPosition[1] - velocity[0]*Math.cos(Math.PI*(90.0+pBodyAngle[0])/180),9.6),-9.6);
		//alert(pPosition[1]);
	}
	else if(ev.keyCode == 87&&!gameOver[0]&&!victory[0]){
		//alert(ev.keyCode);
		pPosition[0] = Math.max(Math.min(pPosition[0] + velocity[0]*Math.sin(Math.PI*(90.0+pBodyAngle[0])/180),9.6),-9.6);
		pPosition[1] = Math.max(Math.min(pPosition[1] + velocity[0]*Math.cos(Math.PI*(90.0+pBodyAngle[0])/180),9.6),-9.6);
		//alert(Math.PI);
	}
	else if(ev.keyCode == 68&&!gameOver[0]&&!victory[0]){
		//alert(ev.keyCode);
		pBodyAngle[0] = pBodyAngle[0]-10.0;
	}
	else if(ev.keyCode == 65&&!gameOver[0]&&!victory[0]){
		//alert(ev.keyCode);
		pBodyAngle[0] = pBodyAngle[0]+10.0;
	}
	else if(ev.keyCode == 32 && spaceReleased&&!gameOver[0]&&!victory[0]){
		document.getElementById('audiotag1').play();
		var bullet = new Object();
		bullet.position = [pPosition[0]+0.80*Math.sin(Math.PI*(90.0+currentAngle[0])/180),0.29,pPosition[1]+0.80*Math.cos(Math.PI*(90.0+currentAngle[0])/180)];
		bullet.velocity = [1.0,-0.02];
		bullet.angle = [currentAngle[0],currentAngle[1]];
		bullets.push(bullet);
		spaceReleased = false;
	}
  };
  
  //in order that the player shoot one bullet each press
  window.addEventListener("keyup", onkeyup, false);
  onkeyup = function(ev){
	if(ev.keyCode == 32&&!gameOver[0]&&!victory[0]){
		spaceReleased = true;
	}
  }
}