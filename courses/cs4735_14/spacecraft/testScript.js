// UNB CS4735 Fall 2014 Project, Alex MacKenize & Terry Lockett(c) 2012 


	
	
	//webgl canvas 
	var canvas;
	var hud;
	var gl;
	var ctx;
	//input handler 
	var keyboard;
	//camera 
	var INITIAL_EYE = [0.0, 0.0, 6.0]; //Initial position of the camera
	var eye;
	var currentAngle = [0.0, 0.0, 0.0]; // Current eye rotation angle ([x-axis, y-axis] degrees)
	//light
	var lightPosition = [1.2, 1.0, 0.0];
	//time 
	var lastTime;
	//matrices 
	var u_MvpMatrix;
	var u_MdlMatrix;
	var u_NMdlMatrix;
	var mvpMatrix;
  var mdlMatrix;
  var cameraMatrix;
	

	
	
function main(){
	
	//initialize the application.
	if (!initApp() ){
			
			return false;
	}

	
	
	
	//set up update loop
	var tick = function(){    
    
		
	  update();
		draw();
		window.requestAnimationFrame(tick, canvas);
  }
  tick();
	
}// end of main()


function initApp(){
	
	// Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  hud = document.getElementById('hud');  
	if (!canvas || !hud) {  console.log('Failed to get HTML elements');return false; } 
	
	//initialize input handlers.
  keyboard = new THREEx.KeyboardState();
	if(!keyboard){ console.log("failed to init keyboard handler"); return false; }
	
	// Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  ctx = hud.getContext('2d');
	if (!gl || !ctx) { console.log('Failed to get the rendering context for WebGL'); return; }
	
	
	
	// Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) { console.log('Failed to intialize shaders.'); return; }
	
	// Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
	
	
	
	// Get the storage location of u_MvpMatrix, u_MdlMatrix, u_NMdlMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	var u_MdlMatrix = gl.getUniformLocation(gl.program, 'u_MdlMatrix');
	var u_NMdlMatrix = gl.getUniformLocation(gl.program, 'u_NMdlMatrix');
	
  if (!u_MvpMatrix) { console.log('Failed to get the storage location of u_MvpMatrix'); return; }
  if (!u_MdlMatrix) { console.log('Failed to get the storage location of u_MdlMatrix'); return; }
  if (!u_NMdlMatrix) { console.log('Failed to get the storage location of u_NMdlMatrix'); return; }
	
	
	 // Set the eye point and the viewing volume
  eye=new Vector4(); // initial eye position
  eye.x = INITIAL_EYE[0];
  eye.y = INITIAL_EYE[1];
  eye.z = INITIAL_EYE[2];
  eye.w = 1.0;
	
	mvpMatrix = new Matrix4();
  mdlMatrix = new Matrix4();
  cameraMatrix = new Matrix4();
	
	lastTime = Date.now();
	
	console.log("initialized app successfully");
	
	return true;
} // end of initApp()'


function update(){
	var dt = getDeltaTime(); // time since last update();
  
	
	
} // end of update()


function getDeltaTime(){
		
    var currentTime = Date.now();
    var dt = currentTime - lastTime;
    lastTime = Date.now();
		
		return 1000/dt;
}



function getInput(){
	//TODO
	
}//end of getInput()


function draw(){

	mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(eye.x, eye.y, eye.z, 0, 0, 0, 0, 1, 0);
 
  // Calculate The model view projection matrix and pass it to u_MvpMatrix
  mvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  mvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  //mvpMatrix.rotate(currentAngle[2], 0.0, 0.0, 1.0); // Rotation around z-axis

	//calculate camera position
  cameraMatrix.setIdentity();
  cameraMatrix.lookAt(eye.x, eye.y, eye.z, 0, 0, 0, 0, 1, 0);
  cameraMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  cameraMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
	//cameraMatrix.rotate(currentAngle[2], 0.0, 0.0, 1.0); // Rotation around z-axis
	
	var newEye = multiplyMatrixVector(cameraMatrix, eye);

	// Pass the model view projection matrix to u_MvpMatrix
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	mdlMatrix.setIdentity();
	
	setupLight(newEye, lightPosition);
	
  
	cubeColors=[RED, RED, RED, RED, RED, RED];
  drawCube(cubeColors, 1);
	
 //draw2D(ctx, fps);
} // end of draw();




function setupLight(newEye ){
	
	// Get the storage location of u_Ambient, u_Diffuse, u_Specular, u_LightLocations, u_Eye
	var u_Ambient = gl.getUniformLocation(gl.program, 'u_Ambient');
	var u_Diffuse = gl.getUniformLocation(gl.program, 'u_Diffuse');
	var u_Specular = gl.getUniformLocation(gl.program, 'u_Specular');
	var u_LightLocation = gl.getUniformLocation(gl.program, 'u_LightLocation');
	var u_Eye = gl.getUniformLocation(gl.program, 'u_Eye');
	
	if (!u_Ambient) {console.log('Failed to get the storage location of u_Ambient');return;}
	if (!u_Diffuse) {console.log('Failed to get the storage location of u_Diffuse');return;}
	if (!u_Specular) {console.log('Failed to get the storage location of u_Specular');return;}
	if (!u_LightLocation) {console.log('Failed to get the storage location of u_LightLocation');return;}	
	if (!u_Eye) {console.log('Failed to get the storage location of u_Eye');return;}
	
	gl.uniform4f(u_Ambient, 0.2, 0.2, 0.2, 1.0);

	gl.uniform4f(u_Diffuse, 0.8, 0.8, 0.8, 1.0);
	
	gl.uniform4f(u_Specular, YELLOW[0], YELLOW[1], YELLOW[2], 1.0);
	
	gl.uniform4f(u_LightLocation, lightPosition[0], lightPosition[1], lightPosition[2], 1.0);
	
	gl.uniform4f(u_Eye, newEye[0], newEye[1], newEye[2], 1.0);
	
} // end of setupLight()(


/*
function drawCube(normalDirection){

	var indexBuffer = gl.createBuffer();
  if (!indexBuffer){ return -1; }

	// Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, cubeVertices, 3, gl.FLOAT, 'a_Position')){ return -1; }
  if (!initArrayBuffer(gl, cubeColors, 3, gl.FLOAT, 'a_Color')){ return -1; }
  if (!initArrayBuffer(gl, cubeNormals, 4, gl.FLOAT, 'a_Normal')){ return -1; }

	 // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
	
	// Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(gl.program, 'u_NormalDirection');
  if (!u_NormalDirection) { console.log('Failed to get the storage location of u_NormalDirection'); return; }
	
	 gl.uniform1f(u_NormalDirection, normalDirection);
	
	// Draw the cube
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_BYTE, 0);
	
} // end of drawCube();
*/







function drawCube(cubeColors, normalDirection) {
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
  var u_NormalDirection = gl.getUniformLocation(gl.program, 'u_NormalDirection');
  if (!u_NormalDirection) {
    console.log('Failed to get the storage location of u_NormalDirection');
    return;
  }
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
	
	
}











//helper functions
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
	
} // end of initArrayBuffer()

function multiplyMatrixVector(matrixT, vector){
  var newVector = new Float32Array(3);
  var matrix = matrixT.elements;
  for(var i=0;i<4;i++){
    newVector[i] = matrix[i*4]*vector.x
      + matrix[i*4 + 1]*vector.y
      + matrix[i*4 + 2]*vector.z
      + matrix[i*4 + 3]*1;
  }
  return newVector;
}

function getInverseTranspose(mat4){
	m = new Matrix4();
	m.setInverseOf(mat4);
	m.transpose();
	return m;
}






































