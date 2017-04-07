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
  'uniform vec4 u_Ambient;\n' +
  'uniform vec4 u_Diffuse;\n' +
  'uniform vec4 u_Specular;\n' +
  'uniform vec4 u_LightLocation;\n' +
  'uniform vec4 u_Eye;\n' +
  'void main() {\n' +
  '  float nDotL = max(0.0, dot(normalize(v_Normal), normalize(u_LightLocation-v_Position)));\n' +
  '  float hDotL = max(0.0, dot(normalize(v_Normal), normalize(normalize(u_LightLocation-v_Position)+normalize(u_Eye-v_Position))));\n' +
  '  gl_FragColor = v_Color*u_Ambient + v_Color*u_Diffuse*nDotL + v_Color*u_Specular*pow(hDotL, 16.0);\n' +
  '}\n';
  
// depth map shader
var VSHADER_DEPTH =
  'attribute vec3 Vertex;\n' +
  'uniform mat4 ProjectionMatrix;\n' +
  'uniform mat4 ViewMatrix;\n' +
  'uniform mat4 ModelMatrix;\n' +
  'uniform vec3 ModelScale;\n' +
  'varying vec4 vPosition;\n' +
  'void main () {\n' +
  'vPosition = ViewMatrix * ModelMatrix * vec4(Vertex * ModelScale, 1.0);\n' +
  'gl_Position = ProjectionMatrix * vPosition;' +
  '}\n';
  
var FSHADER_DEPTH =

'#ifdef GL_ES\n' +
'	precision highp float;\n' +
'#endif\n' +

'const float Near = 1.0;\n' +
'const float Far = 30.0;\n' +
'const float LinearDepthConstant = 1.0 / (Far - Near);\n' +

'uniform int FilterType;\n' +

'varying vec4 vPosition;\n' +

'vec4 pack (float depth)\n' +
'{\n' +
'	const vec4 bias = vec4(1.0 / 255.0,\n' +
'				1.0 / 255.0,\n' +
'				1.0 / 255.0,\n' +
'				0.0);\n' +

'	float r = depth;\n' +
'	float g = fract(r * 255.0);\n' +
'	float b = fract(g * 255.0);\n' +
'	float a = fract(b * 255.0);\n' +
'	vec4 colour = vec4(r, g, b, a);\n' +
'	\n' +
'	return colour - (colour.yzww * bias);\n' +
'}\n' +

'void main ()\n' +
'{\n' +
'	float linearDepth = length(vPosition) * LinearDepthConstant;\n' +
'	{\n' +
'		gl_FragColor = pack(linearDepth);\n' +
'	}\n' +
'}\n';

var VSHADER_SHADOW =

'struct MaterialSource\n' +
'{\n' +
'	vec3 Ambient;\n' +
'	vec4 Diffuse;\n' +
'	vec3 Specular;\n' +
'	float Shininess;\n' +
'	vec2 TextureOffset;\n' +
'	vec2 TextureScale;\n' +
'};\n' +

'attribute vec3 Vertex;\n' +
'attribute vec2 Uv;\n' +
'attribute vec3 Normal;\n' +

'uniform mat4 ProjectionMatrix;\n' +
'uniform mat4 ViewMatrix;\n' +
'uniform mat4 ModelMatrix;\n' +
'uniform vec3 ModelScale;\n' +
'uniform mat4 LightSourceProjectionMatrix;\n' +
'uniform mat4 LightSourceViewMatrix;\n' +

'uniform int NumLight;\n' +
'uniform MaterialSource Material;\n' +

'const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);\n' +

'varying vec4 vWorldVertex;\n' +
'varying vec3 vWorldNormal;\n' +
'varying vec2 vUv;\n' +
'varying vec3 vViewVec;\n' +
'varying vec4 vPosition;\n' +

'void main ()\n' +
'{\n' +
'	vWorldVertex = ModelMatrix * vec4(Vertex * ModelScale, 1.0);\n' +
'	vec4 viewVertex = ViewMatrix * vWorldVertex;\n' +
'	gl_Position = ProjectionMatrix * viewVertex;\n' +
'	\n' +
'	vUv = Material.TextureOffset + (Uv * Material.TextureScale);\n' +
'	\n' +
'	vWorldNormal = normalize(mat3(ModelMatrix) * Normal);\n' +
'	\n' +
'	vViewVec = normalize(-viewVertex.xyz);\n' +
'	\n' +
'	vPosition = ScaleMatrix * LightSourceProjectionMatrix * LightSourceViewMatrix * vWorldVertex;\n' +
'}\n';

var FSHADER_SHADOW =

'#ifdef GL_ES\n' +
'	precision highp float;\n' +
'#endif\n' +

'const float Near = 1.0;\n' +
'const float Far = 30.0;\n' +
'const float LinearDepthConstant = 1.0 / (Far - Near);\n' +

'struct LightSource\n' +
'{\n' +
'	int Type;\n' +
'	vec3 Position;\n' +
'	vec3 Attenuation;\n' +
'	vec3 Direction;\n' +
'	vec3 Colour;\n' +
'	float OuterCutoff;\n' +
'	float InnerCutoff;\n' +
'	float Exponent;\n' +
'};\n' +

'struct MaterialSource\n' +
'{\n' +
'	vec3 Ambient;\n' +
'	vec4 Diffuse;\n' +
'	vec3 Specular;\n' +
'	float Shininess;\n' +
'	vec2 TextureOffset;\n' +
'	vec2 TextureScale;\n' +
'};\n' +


'uniform int NumLight;\n' +
'uniform LightSource Light[4];\n' +
'uniform MaterialSource Material;\n' +
'uniform sampler2D DepthMap;\n' +
'uniform int FilterType;\n' +

'varying vec4 vWorldVertex;\n' +
'varying vec3 vWorldNormal;\n' +
'varying vec2 vUv;\n' +
'varying vec3 vViewVec;\n' +
'varying vec4 vPosition;\n' +

'float unpack (vec4 colour)\n' +
'{\n' +
'	const vec4 bitShifts = vec4(1.0,\n' +
'					1.0 / 255.0,\n' +
'					1.0 / (255.0 * 255.0),\n' +
'					1.0 / (255.0 * 255.0 * 255.0));\n' +
'	return dot(colour, bitShifts);\n' +
'}\n' +

'float ChebychevInequality (vec2 moments, float t)\n' +
'{\n' +
'	if ( t <= moments.x )\n' +
'		return 1.0;\n' +
'	float variance = moments.y - (moments.x * moments.x);\n' +
'	variance = max(variance, 0.02);\n' +
'	\n' +
'	float d = t - moments.x;\n' +
'	return variance / (variance + d * d);\n' +
'}\n' +
'void main ()\n' +
'{\n' +
'	vec3 normal = normalize(vWorldNormal);\n' +

'	vec3 colour = Material.Ambient;\n' +
'	for (int i = 0; i < 4; ++i)\n' +
'	{\n' +
'		if ( i >= NumLight )\n' +
'			break;\n' +
'		\n' +
'		vec3 lightVec = normalize(Light[i].Position - vWorldVertex.xyz);\n' +
'		float l = dot(normal, lightVec);\n' +
'		if ( l > 0.0 )\n' +
'		{\n' +
'			float spotlight = 1.0;\n' +
'			if ( Light[i].Type == 1 )\n' +
'			{\n' +
'				spotlight = max(-dot(lightVec, Light[i].Direction), 0.0);\n' +
'				float spotlightFade = clamp((Light[i].OuterCutoff - spotlight) / (Light[i].OuterCutoff - Light[i].InnerCutoff), 0.0, 1.0);\n' +
'				spotlight = pow(spotlight * spotlightFade, Light[i].Exponent);\n' +
'			}\n' +
'			\n' +
'			// Calculate specular term\n' +
'			vec3 r = -normalize(reflect(lightVec, normal));\n' +
'			float s = pow(max(dot(r, vViewVec), 0.0), Material.Shininess);\n' +
'			\n' +
'			// Calculate attenuation factor\n' +
'			float d = distance(vWorldVertex.xyz, Light[i].Position);\n' +
'			float a = 1.0 / (Light[i].Attenuation.x + (Light[i].Attenuation.y * d) + (Light[i].Attenuation.z * d * d));\n' +
'			\n' +
'			// Add to colour\n' +
'			colour += ((Material.Diffuse.xyz * l) + (Material.Specular * s)) * Light[i].Colour * a * spotlight;\n' +
'		}\n' +
'	}\n' +
'	\n' +
'	vec3 depth = vPosition.xyz / vPosition.w;\n' +
'	depth.z = length(vWorldVertex.xyz - Light[0].Position) * LinearDepthConstant;\n' +
'	float shadow = 1.0;		\n' +
'		// Offset depth a bit\n' +
'		// This causes "Peter Panning", but solves "Shadow Acne"\n' +
'		depth.z *= 0.96;\n' +
'		\n' +
'		float shadowDepth = unpack(texture2D(DepthMap, depth.xy));\n' +
'		if ( depth.z > shadowDepth )\n' +
'			shadow = 0.5;\n' +
'	gl_FragColor = clamp(vec4(colour * shadow, Material.Diffuse.w), 0.0, 1.0);\n' +
'}\n';
var mapSize = 100;
var RED=new Float32Array([1, 0, 0]);
var WHITE=new Float32Array([1, 1, 1]);
var GRAY=new Float32Array([0.5, 0.5, 0.5]);
var SILVER=new Float32Array([0.75, 0.75, 0.75]);
var BLACK=new Float32Array([0.0, 0.0, 0.0]);
var BLUE=new Float32Array([0.0, 0.0, 1.0]);
var YELLOW=new Float32Array([1.0,1.0,0.0]);
var GREEN=new Float32Array([0.0,1.0,0.0]);
var SAND=new Float32Array([.90,.80,.76]);
var SNOW=new Float32Array([1,1, .99]);
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
  
  c_mdlMatrix = new Matrix4();
  c_mdlMatrix.translate(.5, .5, .5);
  c_mdlMatrix.scale(.1,.1,.1);
  width = .2;
  noise.seed(Math.random()); 
  var type = [];
  var simplex = [];
  for(x = -mapSize; x < mapSize; x += width)
	{
		var temp = [];
		var btemp = [];
		for(z = -mapSize; z < mapSize; z += width)
		{
		    var holder = noise.simplex3(x/10, z/10, 580);
			if(holder < -.5)
			{
				btemp.push(GREEN);
				temp.push(noise.simplex2(x, z)/4);
			}
			else if(holder < 0)
			{
				btemp.push(SAND);
				temp.push(noise.simplex2(x, z)/8 + .5 );
			}
			else if(holder < .5)
			{
				btemp.push(SNOW);
				temp.push(noise.simplex2(x, z)/16+.2);
			}
			else if(holder <= 1)
			{
				btemp.push(BLUE);
				temp.push(noise.simplex2(x, z)/32);
			}
		}
		type.push(btemp);
		simplex.push(temp);
	}
	console.log(type);
	console.log(simplex);
  

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
	draw2D(ctx, arr, n); // Draw 2D
draw(gl, u_MvpMatrix, u_MdlMatrix, u_NMdlMatrix, c_mdlMatrix, currentAngle,playerVec, simplex, type, width);
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

function draw(gl, u_MvpMatrix, u_MdlMatrix, u_NMdlMatrix, c_mdlMatrix, currentAngle,playerVec, simplex, type, width)
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
  tempMatrix.translate(playerVec[0],playerVec[1],playerVec[2]);
  tempMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  tempMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  tempMatrix.concat(eyeMatrix);
  EYE=new Float32Array([tempMatrix.elements[0], tempMatrix.elements[1], tempMatrix.elements[2]]);
  console.log(EYE);

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
  console.log(cubeVec[0]);
  console.log(cubeVec[2]);
  offset = [playerVec[0] +mapSize, playerVec[2]+ mapSize];
  setupLight(gl, EYE, [cubeVec[0] - (offset[0] - mapSize), cubeVec[1], cubeVec[2] - (offset[1] - mapSize)]);
  drawRoom(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, simplex, type, width, offset);
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

	var delta = 1;
	var heightdelta = .2;
	console.log( e.keyCode )
	switch (e.keyCode)
	{
		case 65:  //A
		var temp = playerVec[0] - delta;

		  playerVec[0] = temp;
		break;
		
		case 68: //D
		var temp = playerVec[0] + delta;

		  playerVec[0] = temp;
		break;
		
		case 83:  //S
		var temp = playerVec[2] + delta;

		  playerVec[2] = temp;
		break;
		
		case 87:  //W
		var temp = playerVec[2] - delta;

		  playerVec[2] = temp;
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
      currentAngle[1] = currentAngle[1] + dx;
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

function drawRoom(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, simplex, type, width, offset){

  //Walls
  drawMap(gl, type, 1, simplex, width, offset, u_MdlMatrix, u_NMdlMatrix,mdlMatrix);
  
  //Light Cube
  //mdlMatrix.translate(0,.2,0);
  //drawLight(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix);
  console.log(offset);
  mdlMatrix.translate(cubeVec[0] - (offset[0] - mapSize), cubeVec[1], cubeVec[2] - (offset[1] - mapSize));
  mdlMatrix.scale(.1,.1,.1);
  gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrix.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrix).elements);
  cubeColors = [YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, YELLOW];
  drawCube(gl, cubeColors, -1);
  //Speed Cube
  //drawSpeedCube(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, c_mdlMatrix, cubeVec);
}


function drawLight(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix){

  mdlMatrixChild=new Matrix4(mdlMatrix); 
  mdlMatrixChild.scale(0.02, 0.02, 0.02);
  gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cubeColors=[YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, YELLOW];
  drawCube(gl, cubeColors, -1);
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

function drawMap(gl, type, normalDirection, simplex, width, offset, u_MdlMatrix, u_NMdlMatrix, mdlMatrix) {
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
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
  ]);
  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;
  
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
  console.log(offset[0]);
  console.log(offset[1]);
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
			var CX = type[x+offset[0]][z+offset[1]][0];
			var CY = type[x+offset[0]][z+offset[1]][1];
			var CZ = type[x+offset[0]][z+offset[1]][2];
			var colors = new Float32Array([     // Colors
			
    CX, CY, CZ, CX, CY, CZ, CX, CY, CZ, CX, CY, CZ,  // v0-v1-v2-v3 front
    CX, CY, CZ, CX, CY, CZ, CX, CY, CZ, CX, CY, CZ,  // v0-v3-v4-v5 right
    CX, CY, CZ, CX, CY, CZ, CX, CY, CZ, CX, CY, CZ,  // v0-v5-v6-v1 up
    CX, CY, CZ, CX, CY, CZ, CX, CY, CZ, CX, CY, CZ,  // v1-v6-v7-v2 left
    CX, CY, CZ, CX, CY, CZ, CX, CY, CZ, CX, CY, CZ   // v4-v7-v6-v5 back
  ]);
		   if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
			return -1;
			var point = [x*width-1, simplex[x+offset[0]][z+offset[1]], z*width-1];         //x,y,z
			drawPiece(gl, point, mdlMatrix, u_MdlMatrix, u_NMdlMatrix);

   
		}
	}
}

function drawPiece(gl, point, mdlMatrix, u_MdlMatrix, u_NMdlMatrix)
{
			mdlMatrixChild=new Matrix4(mdlMatrix); 
			mdlMatrixChild.scale(width, point[1], width);
			mdlMatrixChild.translate(x, point[1], z);
			gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
			gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
			// Draw the cube
			gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_BYTE, 0);
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
	
	gl.uniform4f(u_Specular, 1.0, 1.0, 0.0, .8);
	
	gl.uniform4f(u_LightLocation, playerVec[0], playerVec[1]+.2, playerVec[2], 1.0);
	
	gl.uniform4f(u_Eye, eye[0], eye[1], eye[2], 1.0);
}
