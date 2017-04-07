// UNB CS4735 Fall 2014 Project, Alex MacKenize & Terry Lockett(c) 2012 
// Space Shoot elite premium 2k18
//GLOBAL VARIABLEs
//webgl canvas 


var canvas;
var element;
var hud;
var gl;
var ctx;

//camera 
var INITIAL_EYE = [0.0, 0.0, 0]; //Initial position of the camera
var EYE;
var currentAngle = [0.0, 0.0, 0.0]; // Current eye rotation angle ([x-axis, y-axis] degrees)
var moveSpeed = 4;
var rotateSpeed = 2;
var worldSize = 30;
//light
var lightPosition = [10, 10, 20];
//time 
var lastTime;

//matrices 
var u_MvpMatrix;
var u_MdlMatrix;
var u_NMdlMatrix;
var mvpMatrix;
var mdlMatrix;
var cameraMatrix;

//object holder arrays
var asteroids;
var ships;
var spaceJunk;
var bullets;
var stars;

//input handler 
var keyboard;
//keyboard button vars
var wasShootPressed = false; // used to see if the shoot button was pressed last update.
var bulletSpeed = 12;	
//mouseMovementVars
mouseX = 0;
mouseY =0;
lastMouseX = 0;
lastMouseY = 0;
isMouseLocked = false;
isMousePressed = false;

//Audio
var audioTime = Date.now();


	
function main() {
	initApp();
	initTextures();
	
	var tick = function() { // Start drawing
		update()
		draw();
		requestAnimationFrame(tick, canvas);
	};
	tick();
	
} // end of main

function initApp(){
	
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');
	element = document.body;
	// hud = document.getElementById('hud');  
	if (!canvas ) {  console.log('Failed to get HTML elements');return false; } 
	
	//initialize input handlers.
	keyboard = new THREEx.KeyboardState();
	if(!keyboard){ console.log("failed to init keyboard handler"); return false; }
	initPointerLock();
	
	//init mouse click event handlers
	canvas.onmousedown = function(ev) {   // Mouse is pressed
		if(!isMousePressed && isMouseLocked){
			isMousePressed = true;
      document.getElementById('shootAudio').play();
			createBullet();
		}
	};
	
	canvas.onmouseup = function(ev) {  isMousePressed = false;  }; // Mouse is released
	
	// Get the rendering context for WebGL
	gl = getWebGLContext(canvas);
	// ctx = hud.getContext('2d');
	if (!gl ) { console.log('Failed to get the rendering context for WebGL'); return; }
	
	
	
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) { console.log('Failed to intialize shaders.'); return; }
	
	// Set the clear color and enable the depth test
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	
	
	// Get the storage location of u_MvpMatrix, u_MdlMatrix, u_NMdlMatrix
	u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	u_MdlMatrix = gl.getUniformLocation(gl.program, 'u_MdlMatrix');
	u_NMdlMatrix = gl.getUniformLocation(gl.program, 'u_NMdlMatrix');
	
	if (!u_MvpMatrix) { console.log('Failed to get the storage location of u_MvpMatrix'); return; }
	if (!u_MdlMatrix) { console.log('Failed to get the storage location of u_MdlMatrix'); return; }
	if (!u_NMdlMatrix) { console.log('Failed to get the storage location of u_NMdlMatrix'); return; }
	
	
	 // Set the eye point and the viewing volume
	EYE=new Float32Array(4); // initial eye position
	EYE[0] = INITIAL_EYE[0];
	EYE[1] = INITIAL_EYE[1];
	EYE[2] = INITIAL_EYE[2];
	EYE[3] = 1.0;
	
	//ang = 0.0;
	//elev = 0.0;
	//roll = 0.0;
	
	mvpMatrix = new Matrix4();
	mdlMatrix = new Matrix4();
	cameraMatrix = new Matrix4();
	
	lastTime = Date.now();
	
	console.log("initialized app successfully");
	
	initWorld();
	
	
	return true;
} // end of initApp()'



function initPointerLock(){
	canvas.onclick = function() {
		canvas.requestPointerLock();
	}

	canvas.requestPointerLock = canvas.requestPointerLock ||
           canvas.mozRequestPointerLock ||
           canvas.webkitRequestPointerLock;

	document.exitPointerLock = document.exitPointerLock ||
         document.mozExitPointerLock ||
         document.webkitExitPointerLock;
		//document.exitPointerLock();
	
	document.addEventListener('pointerlockchange', lockChangeAlert, false);
	document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
	document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

} // end of initPointer()

function lockChangeAlert() {
	if(document.pointerLockElement===canvas||document.mozPointerLockElement===canvas||document.webkitPointerLockElement===canvas){
		if(!isMouseLocked){
			console.log('The pointer lock status is now locked');
			isMouseLocked = true;
			document.addEventListener("mousemove", mouseMovementLoop, false);
		}
	}else {
		if(isMouseLocked){
			console.log('The pointer lock status is now unlocked');  
			isMouseLocked = false;
			document.removeEventListener("mousemove", mouseMovementLoop, false);
		}
	}
}

function mouseMovementLoop(e) {
 
  var movementX = e.movementX ||
      e.mozMovementX          ||
      e.webkitMovementX       ||
      0;

  var movementY = e.movementY ||
      e.mozMovementY      ||
      e.webkitMovementY   ||
      0;

	mouseX += movementX;
	mouseY += movementY; 

  

  var animation = requestAnimationFrame(mouseMovementLoop);

  //tracker.innerHTML = "X position: " + x + ', Y position: ' + y;
}




function initTextures(){
	
	//ship1Texture = gl.createTexture();
	//ship1Texture.image = new Image();
	//ship1Texture.image.onload = function(){
	//handleLoadedTexture(ship1Texture);
	//}
	
	//ship1Texture.image.src = "./Models/SpaceShip1Diffuse.png";
	
} // end of initTextures()

function handleLoadedTexture(texture){
	gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initWorld(){
	asteroids = [];
	ships = [];
	spaceJunk = [];
	bullets = [];
	stars = [];
	
	asteroids.push( new Asteroid( [1,-1,0], [-2.5,0,0] , [0,0,0] , [.8,1,1]) );
	asteroids.push( new Asteroid( [-5,6,0], [0.3,-.1,0] , [0,45,20] , [1,.8,1]) );
	genAsteroids(6);
	genShips();
	genSatellites();
	genStars(); //ruins performance
	
	
	//ships.push( new Ship1( [15,0,0], [0,0,0] , [90,0,0], [1,1,1] ) );
	
	//ships.push( new Ship1( [-15,0,0], [0,0,0] , [90,0,0], [1,1,1] ) );
	//ships[ships.length-1].color = [.02,0.2,1.0];
	
	//asteroids.push( new Asteroid( [5,0,20],  [-.3,0,0] , [0,0,0], [1,1,1] ) );
	//bullets.push( new Bullet( [5,0,20],  [-.3,0,0] , [0,0,0], [1,1,1] ) );
	//ships[ships.length-1].color = [.02,0.8,0.2];
	
	//asteroids.push( new Asteroid( [-5,0,20],  [.3,0,0] , [0,0,0], [1,1,1] ) );
	//ships.push( new Ship1( [-0,0,20], [0,0,0] ,  [0,-90,0], [1,1,1] ) );
	//ships[ships.length-1].color = [1,1,0.1];
	
	//ships.push( new Ship1( [worldSize,worldSize,worldSize], [0,0,0] ,  [90,0,0], [1,1,1] ) );
	//ships[ships.length-1].color = [.1,1,1];
	
	//ships.push( new Ship1( [0,15,0], [0,0,0] ,  [90,0,0], [1,1,1] ) );
	//ships[ships.length-1].color = [1,1,1];
	
} // end of initWorld()

function genAsteroids(num){

	for(i=0; i< num; i++){
		asteroids.push(  new Asteroid (randVec(-worldSize, worldSize), randVec(-2,2), randVec(-360, 360), randVec(1, 1.5) ));
		
	}

}
function genSatellites(){
	spaceJunk.push( new Satellite ([-5,3,15], [2.5,0,0] ,  [0, 90,0], [0.3,0.3,0.3] ) );
	
	spaceJunk.push( new Satellite (randVec(-worldSize, worldSize), randVec(-2,2), randVec(-360, 360), [0.3,0.3,0.3] ));
	
	spaceJunk.push( new Satellite (randVec(-worldSize, worldSize), randVec(-2,2), randVec(-360, 360), [0.3,0.3,0.3] ));
}

function genShips(){
	
	ships.push( new Ship1( [7,0,15], [-1.5,0,0], [0,90,0], [.8,.8,.8] ) );
	ships[0].color=[.5,.5,1];
	
	ships.push( new Ship1( [2,0,-2], [1.5,1.5,0], [90,-90,90], [1,1,1] ) );
	ships[1].color=[.6,1,1];
	
	ships.push( new Ship1( [15,-10,7], [-1.75,0,1.75], [0,135,0], [1,1,1] ) );
	ships[2].color=[.6,1,1];
	
	ships.push( new Ship1( [16,-10,7], [0,1,0], [90,0,0], [1,1,1] ) );
	ships[2].color=[.6,1,1];
	
	
}

function genStars(){
	
	var plane = worldSize + 20;
	var numStars =20;
	
	
	bullets.push(new Bullet([-5,10,50], [0,0,0], [0,0,0], [4,4,4]));
	bullets[bullets.length-1].color = [2,2,0];
	//moon
	bullets.push(new Bullet([0,8,-48], [0,0,0], [0,0,0], [.5,.5,.5]));
	bullets[bullets.length-1].color = [1.5,1.5,1.5];
	
	//earth
	bullets.push(new Bullet([5,5,-48], [0,0,0], [0,0,0], [2,2,2]));
	bullets[bullets.length-1].color = [.5,.5,2];
	
	bullets.push(new Bullet([5.3,5,-46.5], [0,0,0], [0,0,0], [1,1,1]));
	bullets[bullets.length-1].color = [.5,2,.5];
	
	bullets.push(new Bullet([4.8,5.5,-46.5], [0,0,0], [0,0,0], [1,1,1]));
	bullets[bullets.length-1].color = [.5,2,.5];
	//Mars
	bullets.push(new Bullet([0,35,0], [0,0,0], [0,0,0], [1,1,1]));
	bullets[bullets.length-1].color = [2.5,0.5,0.0];
	//Uranus
	bullets.push(new Bullet([0,-40,0], [0,0,0], [0,0,0], [1,1,1]));
	bullets[bullets.length-1].color = [0.0,1.5,1.5];
	//-z face
	/*for(i=0; i< numStars; i++){
		var pos = [randNum(-plane,plane), randNum(-plane, plane), plane];
		var scale = randNum(1, 1);
		var color = randNum(1,3);
		stars.push(new Star(pos,[90,0,0],[scale,scale,.01],[color,color,color]));
		
	}
/*	//z face
	for(i=0; i< numStars; i++){
		var pos = [randNum(-plane,plane), randNum(-plane, plane), -plane];
		var scale = randNum(.05, .1);
		var color = randNum(1,3);
		stars.push(new Star(pos,[0,0,0],[scale,scale,.01],[color,color,color]));
		console.log("added star at: " + pos);
	}
	//-x face
	for(i=0; i< numStars; i++){
		var pos = [-plane, randNum(-plane, plane), randNum(-plane, plane)];
		var scale = randNum(.05, .1);
		var color = randNum(1,3);
		stars.push(new Star(pos,[0,0,0],[scale,scale,.01],[color,color,color]));
		console.log("added star at: " + pos);
	}
	//x face
	for(i=0; i< numStars; i++){
		var pos = [plane, randNum(-plane, plane), randNum(-plane, plane)];
		var scale = randNum(.05, .1);
		var color = randNum(1,3);
		stars.push(new Star(pos,[0,0,0],[scale,scale,.01],[color,color,color]));
		console.log("added star at: " + pos);
	}
	//y face
	for(i=0; i< numStars; i++){
		var pos = [randNum(-plane, plane), plane, randNum(-plane, plane)];
		var scale = randNum(.05, .1);
		var color = randNum(1,3);
		stars.push(new Star(pos,[0,0,0],[scale,scale,.01],[color,color,color]));
		console.log("added star at: " + pos);
	}
	//y face
	for(i=0; i< numStars; i++){
		var pos = [randNum(-plane, plane), -plane, randNum(-plane, plane)];
		var scale = randNum(.05, .1);
		var color = randNum(1,3);
		stars.push(new Star(pos,[0,0,0],[scale,scale,.01],[color,color,color]));
		console.log("added star at: " + pos);
	}
	*/
} // End of genStars()


function update(){
	var dt = getDeltaTime(); // time since last update();
  //draw scores
	document.getElementById('statsPanel').innerHTML = "Points: " + killCounter ;
                                                //+ " Ships Immobilized: " + shipsStunned;
  //loop world music
  document.getElementById('gameMusic').play();
  
  if(spawnVar == 4){
    genAsteroids(4);
    spawnVar = 0;
  }
	for(i=0; i<spaceJunk.length; i++){
		spaceJunk[i].rotation[0] = spaceJunk[i].rotation[0]+1;
		spaceJunk[i].rotation[1] = spaceJunk[i].rotation[1]+1;
		spaceJunk[i].rotation[2] = spaceJunk[i].rotation[2]+2;
	}

	//update player
	 updatePlayer(dt);
	
	if(currentAngle[0] > 360 || currentAngle[0] < -360)
		currentAngle[0] = currentAngle[0]%360;
	if(currentAngle[1] > 360 || currentAngle[1] < -360)
		currentAngle[1] = currentAngle[1]%360;
	if(currentAngle[2] > 360 || currentAngle[2] < -360)
		currentAngle[2] = currentAngle[2]%360;
	
	
	//update world
	for( i=0; i<asteroids.length; i++){
		asteroids[i].update(dt);
		if(asteroids[i].isDestroid){
			asteroids = removeArrayElement(asteroids,i);
		}
	}
	for( j=0; j<ships.length; j++){
		ships[j].update(dt);
	}
	for( k=0; k<bullets.length; k++){
		bullets[k].update(dt);
	}
	
	for ( k=0; k<bullets.length; k++){
		if(bullets[k].isDestroid){
			bullets = removeArrayElement(bullets, k);
		}
	}
	
	for ( q=0; q<ships.length; q++){
		if(ships[q].isDestroid){
			ships = removeArrayElement(ships, q);
			createShip();
		}
	}
	
	for(l=0; l<spaceJunk.length; l++){
		spaceJunk[l].update(dt);
		if(spaceJunk[l].isDestroid){
			spaceJunk = removeArrayElement(spaceJunk,l);
			spaceJunk.push( new Satellite (randVec(-worldSize, worldSize), randVec(-2,2), randVec(-360, 360), [0.3,0.3,0.3] ));
		}
	}
	
	
	
	//check collisions of objects.
	checkCollisions();
	
} // End of update()




function updatePlayer(dt){
	var matrix =  new Matrix4(); 
	matrix.setIdentity();
	matrix.rotate(currentAngle[0], 1,0,0);
	matrix.rotate(currentAngle[1], 0,1,0);
	matrix.rotate(currentAngle[2], 0,0,1);
	
	var initF  = new Float32Array([0,0,-1]); //initial Forward direction	
	var initR  = new Float32Array([1,0,0]);
	
	var fVec = multiplyMatrixVector(matrix, initF);
	var rVec = multiplyMatrixVector(matrix, initR);
	
	rotatePlayer(dt);
	
	// Player movement and rotation fun stuff.
	if(keyboard.pressed("W") ){	//move camera forward.
		EYE[0] +=  moveSpeed * dt * fVec[0] ;
		EYE[1] +=  moveSpeed * dt * fVec[1];
		EYE[2] +=  moveSpeed * dt * fVec[2] ;
	}
	if(keyboard.pressed("S") ){	//move camera backward.
		EYE[0] +=  -moveSpeed * dt * fVec[0] ;
		EYE[1] +=  -moveSpeed * dt * fVec[1];
		EYE[2] +=  -moveSpeed * dt * fVec[2] ;
	}
	if(keyboard.pressed("D") ){	//move camera forward.
		EYE[0] +=  moveSpeed * dt * rVec[0] ;
		EYE[1] +=  moveSpeed * dt * rVec[1];
		EYE[2] +=  moveSpeed * dt * rVec[2] ;
	}
	if(keyboard.pressed("A") ){	//move camera backward.
		EYE[0] +=  -moveSpeed * dt * rVec[0] ;
		EYE[1] +=  -moveSpeed * dt * rVec[1];
		EYE[2] +=  -moveSpeed * dt * rVec[2] ;
	}
	
	if(keyboard.pressed("M")){
		document.getElementById('superSecretEasterEggAudio').play();
	}
	
	if(currentAngle[0] > 360 || currentAngle[0] < -360)
		currentAngle[0] = currentAngle[0]%360;
	if(currentAngle[1] > 360 || currentAngle[1] < -360)
		currentAngle[1] = currentAngle[1]%360;
	if(currentAngle[2] > 360 || currentAngle[2] < -360)
		currentAngle[2] = currentAngle[2]%360;

	var limit = worldSize - 0.1;
	if(EYE[0] > limit)	EYE[0] = limit;
	if(EYE[0] < -limit)	EYE[0] = -limit;
	if(EYE[1] > limit)	EYE[1] = limit;
	if(EYE[1] < -limit)	EYE[1] = -limit;
	if(EYE[2] > limit)	EYE[2] = limit;
	if(EYE[2] < -limit)	EYE[2] = -limit;
		
	//shooting bullets stuff.
	if(keyboard.pressed("space")){
		if(!wasShootPressed ){
      document.getElementById('shootAudio').play();
			createBullet();
		}
		wasShootPressed = true;
	}
	else
		wasShootPressed = false;
		
		
} // end of updatePlayer()

function rotatePlayer(dt){
	var dx = mouseX - lastMouseX;
	var dy = mouseY - lastMouseY;
	
	if(dx != 0){
		currentAngle[1] += rotateSpeed *dt *dx;
	}
	
	if(dy != 0){
		currentAngle[0] += -rotateSpeed *dt *dy;
		if(currentAngle[0] > 90) currentAngle[0] = 90;
		if(currentAngle[0] < -90) currentAngle[0] = -90;
	}
		
	lastMouseX = mouseX;
	lastMouseY = mouseY;
} // end of rotatePlayer()







 function draw( ){
		
 
	// Set the eye point and the viewing volume
    //EYE=new Float32Array([0, 0, 6]);
    mvpMatrix = new Matrix4();
	mvpMatrix.setPerspective(30, 1, .01, 300);
	//mvpMatrix.lookAt(EYE[0], EYE[1], EYE[2], 0, 0, 0, 0, 1, 0);
	mvpMatrix.lookAt(0, 0, 0, 0, 0, 1, 0, 1, 0);
	// Pass the model view projection matrix to u_MvpMatrix
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	
	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
	
	//set the mdl matrix to camera location.
	mdlMatrix = new Matrix4();
	mdlMatrix.setIdentity();  
	mdlMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0);
	mdlMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0);
	//mdlMatrix.rotate(currentAngle[2], 0.0, 0.0, 1.0);
	mdlMatrix.translate(EYE[0],EYE[1],EYE[2]);
	
	//set up lights
	setupLight();
	
	//draw
	drawWorld();
		
		
 } // End of draw()(
	
function drawWorld( ){

	//draw massive cube
	mdlMatrixChild=new Matrix4(mdlMatrix); 
  
	var ss = worldSize;
	mdlMatrixChild.scale(ss, ss, ss);
	gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
	gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
	//testing world boundry cube.
	//drawCube(-1);
	
	
	
	// draw asteroids
	for( i=0; i<asteroids.length; i++){
		asteroids[i].draw();
	}
	
	// draw ships
	for( j=0; j<ships.length; j++){
		ships[j].draw();
	}

	//draw bullets.
	for(k=0; k<bullets.length; k++){
		bullets[k].draw();
	}
	
	//draw stars	
	for(q=0; q< stars.length; q++){
		stars[q].draw();
	}
	
	//space Junk
	for(l=0; l<spaceJunk.length; l++){
		spaceJunk[l].draw();
	}
		
}



function setupLight(){
	  
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
	
	gl.uniform4f(u_Ambient, 0.4, 0.4, 0.4, 1.0);

	gl.uniform4f(u_Diffuse, 0.8, 0.8, 0.8, 1.0);
	
	gl.uniform4f(u_Specular, 0.8, 0.8, 0.8, 1.0);
	//gl.uniform4f(u_Specular, 256, 256, 256, 1.0);
	
	
	gl.uniform4f(u_LightLocation, lightPosition[0], lightPosition[1], lightPosition[2], 1.0);
	
	gl.uniform4f(u_Eye, EYE[0], EYE[1], EYE[2], 1.0);
}




function drawCube( normalDirection) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer( cubeVertices, 3, gl.FLOAT, 'a_Position')) return -1;
  if (!initArrayBuffer( cube_colors, 3, gl.FLOAT, 'a_Color'))return -1;
  if (!initArrayBuffer( cubeNormals, 4, gl.FLOAT, 'a_Normal'))return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(gl.program, 'u_NormalDirection');
  if (!u_NormalDirection) {console.log('Failed to get the storage location of u_NormalDirection'); return;}
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
	 
	 
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_BYTE, 0);
}

function drawScaledCube(normalDirection){
	
	var indexBuffer = gl.createBuffer();
  if (!indexBuffer) return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer( scaledCubeVertices, 3, gl.FLOAT, 'a_Position')) return -1;
  if (!initArrayBuffer( scaledCubeColors, 3, gl.FLOAT, 'a_Color'))return -1;
  if (!initArrayBuffer( scaledCubeNormals, 4, gl.FLOAT, 'a_Normal'))return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, scaledCubeIndices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(gl.program, 'u_NormalDirection');
  if (!u_NormalDirection) {console.log('Failed to get the storage location of u_NormalDirection'); return;}
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_BYTE, 0);
	
} // End of drawScaledCube()



function createBullet(  ){

	

	var matrix =  new Matrix4(); 
	matrix.setIdentity();
	matrix.rotate(currentAngle[0], 1,0,0);
	matrix.rotate(currentAngle[1], 0,1,0);
	matrix.rotate(currentAngle[2], 0,0,1);
	
	var initF  = new Float32Array([0,0,-1]); //initial Forward direction

	
	var fVec = multiplyMatrixVector(matrix, initF);
	fVec[0] = -fVec[0] * bulletSpeed;
	fVec[1] = -fVec[1] * bulletSpeed;
	fVec[2] = -fVec[2] * bulletSpeed;
	
	
	var rot = [currentAngle[0],-currentAngle[1],currentAngle[2]];
	
	
	var pos =  [0.0,0.0,0.0];
	pos[0] = -EYE[0];
	pos[1] = -EYE[1];
	pos[2] = -EYE[2];
	bullets.push( new Bullet(pos, fVec, currentAngle, [.4,.4,.4] ));
	
}

function createShip(){
	ships.push(  new Ship1 (randVec(-worldSize, worldSize), randVec(-2,2), randVec(-360, 360), randVec(.8, 1.2) ));
	ships[ships.length-1].color = randVec(0,2);	
}


//helper functions
function initArrayBuffer( data, num, type, attribute) {
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

function getDeltaTime(){
		
    var currentTime = Date.now();
    var dt = currentTime - lastTime;
    lastTime = Date.now();
		
		if(dt == 0)
			return 1/60;
		else
			return 1/dt;
}

function getInverseTranspose(mat4){
	m = new Matrix4();
	m.setInverseOf(mat4);
	m.transpose();
	return m;
}

function multiplyMatrixVector(matrixT, vector){
  var newVector = new Float32Array(3);
  var matrix = matrixT.elements;
  for(var i=0;i<4;i++){
    newVector[i] = matrix[i*4]*vector[0]
      + matrix[i*4 + 1]*vector[1]
      + matrix[i*4 + 2]*vector[2]
      + matrix[i*4 + 3]*1;
  }
  return newVector;
}

function normalizeVec(vector){
	var ax = vector[0];
	var ay = vector[1];
	var az = vector[2];
	
	var len = Math.sqrt( (ax*ax) + (ay*ay) + (az*az) );
	
	if(len == 0)
		return [0,0,1];
	
	var newVec = [(ax/len), (ay/len), (az/len)];
	return newVec;
	
}

function degToRad(deg){
	var rad = deg * (Math.PI /180);
	return rad;
}

function randVec(min, max){

	return [randNum(min, max), randNum(min,max), randNum(min,max) ];

}

function randNum(min, max){
	return Math.random() * (max - min) + min;
	
	return n;
	
}

function removeArrayElement(array, index){
	var newArray = [];
	
	for(i=0; i<index; i++){
		newArray.push(array[i]);
	}
	for(j=index+1; j<array.length; j++){
		newArray.push(array[j]);
	}
	
	return newArray;
}
































