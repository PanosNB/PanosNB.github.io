// 4DRotation by Sean MacPherson & Angela Hovey
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_ModelMatrix * a_Position;\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '	 gl_Position.w = gl_Position.w + 3.0;\n' +
  //'  gl_Position.y = -0.5;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Rotation angle (degrees/second)
var ANGLE_STEP = 45.0;

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

  var model = [0];	//model requested from key press
  var rot = [0];		//rotation requested from key press
  var mouseAngle = [0.0,0.0,0.0];
  
  initEventHandlers(canvas, model, rot, mouseAngle);
  
  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl, model);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  
  
  // Current rotation angle
  var currentAngle = 0.0;
  // Model matrix
  var modelMatrix = new Matrix4();
  
  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }

  // Set the eye point and the viewing volume
  var mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1, 100);
  //mvpMatrix.lookAt(3.5, 4, 7, 0, 0, 0, 0, 1, 0);
  
  //4D to 3D
  mvpMatrix.LookAt4D(0, 0, 10, 0,
					 0, 0, 0, 0, 
					 0, 1, 0, 0, 
					 0, 0, 0, -1);
  console.log(mvpMatrix.elements);

  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Start drawing
  var tick = function() {
  
	// Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl, model);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  } 
  
    currentAngle = animate(currentAngle);  // Update the rotation angle
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix, rot, mouseAngle);   // Draw the object
    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
  };
  tick();
}

function initVertexBuffers(gl, model) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  if (model[0] == "3"){
	var vertices = new Float32Array([   // Vertex coordinates
		//outer
		 1.0, 1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,1.0,  -1.0,-1.0, 1.0,1.0,   1.0,-1.0, 1.0,1.0,  // v0-v1-v2-v3 front
		 1.0,-1.0,-1.0,1.0,   1.0, 1.0,-1.0,1.0,  // -v4-v5 right
		-1.0, 1.0,-1.0,1.0,    // v6 
		-1.0,-1.0,-1.0,1.0,  // v7
	   
	  ]);
	  
	  var colors = new Float32Array([     // Colors
		1.0, 1.0, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
	  ]);

	  var indices = new Uint8Array([       // Indices of the vertices
		 0, 1, 2, 3,    // front
		 0, 3, 4, 5,   // right
		 0,1,6,5,    // up
		 6,7,2,7,  // left
		 4    // back
		 
		 
	  ]);
	  
	  // Create a buffer object
	  var indexBuffer = gl.createBuffer();
	  if (!indexBuffer) 
		return -1;

	  // Write the vertex coordinates and color to the buffer object
	  if (!initArrayBuffer(gl, vertices, 4, gl.FLOAT, 'a_Position'))
		return -1;

	  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
		return -1;

	  // Write the indices to the buffer object
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	  
	  return indices.length;
  }
  
   else if (model[0] == "4"){
   
		var wb=-1;
		var vertices = new Float32Array([   // Vertex coordinates
		//outer
		 1.0, 1.0, 1.0,1.0,  -1.0, 1.0, 1.0,1.0,  -1.0,-1.0, 1.0,1.0,   1.0,-1.0, 1.0,1.0,  // v0-v1-v2-v3 front
		 1.0,-1.0,-1.0,1.0,   1.0, 1.0,-1.0,1.0,  // -v4-v5 right
		-1.0, 1.0,-1.0,1.0,    // v6 
		-1.0,-1.0,-1.0,1.0,  // v7
		
		//inner
		 1.0, 1.0, 1.0, wb,  -1.0, 1.0, 1.0, wb,  -1.0,-1.0, 1.0, wb,   1.0,-1.0, 1.0, wb,  // v0-v1-v2-v3 front
		 1.0,-1.0,-1.0, wb,   1.0, 1.0,-1.0, wb,  // -v4-v5 right
		-1.0, 1.0,-1.0, wb,    // v6 
		-1.0,-1.0,-1.0, wb,  // v7
	   
	  ]);
	  
	  var colors = new Float32Array([     // Colors
		1.0, 1.0, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		1.0, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
		0.4, 0.4, 1.0,
	  ]);

	  var indices = new Uint8Array([       // Indices of the vertices
		 0, 1, 2, 3,    // front
		 0, 3, 4, 5,   // right
		 0,1,6,5,    // up
		 6,7,2,7,  // left
		 4,    // back
		 
		 12, 11, 3, 11, 10, 2, 10, 15, 7, 15, 
		 12, 13, 5, 13, 14, 6, 14, 15, 14,
		 9, 1, 9, 10, 15, 10, 11, 8, 9, 8, 
		 0, 8, 13
		 
	  ]);
	  
	  // Create a buffer object
	  var indexBuffer = gl.createBuffer();
	  if (!indexBuffer) 
		return -1;

	  // Write the vertex coordinates and color to the buffer object
	  if (!initArrayBuffer(gl, vertices, 4, gl.FLOAT, 'a_Position'))
		return -1;

	  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
		return -1;

	  // Write the indices to the buffer object
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
		
	  return indices.length;
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

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix, rot, mouseAngle) {

	modelMatrix.setRotate(mouseAngle[0], 1, 0, 0, 0, 0, 0);
	modelMatrix.setRotate(mouseAngle[1], 0, 1, 0, 0, 0, 0);
	

	if (rot == "a"){			//xy
		// Set the rotation matrix
		modelMatrix.setRotate(currentAngle, 0, 0, 1, 0, 0, 0); 
	}
	else if (rot == "s"){		//xz
		modelMatrix.setRotate(currentAngle, 0, 1, 0, 0, 0, 0);
	}
	else if (rot == "d"){		//xw
		modelMatrix.setRotate(currentAngle, 0, 0, 0, 1, 0, 0);
	}
	else if (rot == "f"){		//yz
		modelMatrix.setRotate(currentAngle, 1, 0, 0, 0, 0, 0);  
	}
	else if (rot == "g"){		//yw
		modelMatrix.setRotate(currentAngle, 0, 0, 0, 0, 1, 0);
	}
	else if (rot == "h"){		//zw
		modelMatrix.setRotate(currentAngle, 0, 0, 0, 0, 0, 1);
	}
	else if (rot=="x"){			//x axis
		modelMatrix.setRotate(currentAngle, 1, 0, 0, 0, 0, 0);  
	}
	else if (rot=="y"){			//y axis
		modelMatrix.setRotate(currentAngle, 0, 1, 0, 0, 0, 0); 
	}
	else if (rot=="z"){			//z axis
		modelMatrix.setRotate(currentAngle, 0, 0, 1, 0, 0, 0); 
	};

  // Set the rotation matrix
 // modelMatrix.setRotate(currentAngle, 0, 0, 1, 0, 0, 0); // Rotation angle, rotation axis (0, 0, 1)
 
  // Pass the rotation matrix to the vertex shader
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  gl.drawElements(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0);
}

// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function initEventHandlers(canvas, model, rot, mouseAngle){

//Dragging the models...
	var dragging = false;         // Dragging or not
	var lastX = -1, lastY = -1;   // Last position of the mouse

	canvas.onmousedown = function(ev) {   // Mouse is pressed
	var x = ev.clientX, y = ev.clientY;
	// Start dragging if a mouse is in <canvas>
		var rect = ev.target.getBoundingClientRect();
	if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
		lastX = x; lastY = y;
		dragging = true;
    }
  };

  canvas.onmouseup = function(ev) { dragging = false;  }; // Mouse is released
  
  canvas.onmousemove = function(ev) { // Mouse is moved
    var x = ev.clientX, y = ev.clientY;
    if (dragging) {
      var factor = 100/canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      mouseAngle[0] = Math.max(Math.min(mouseAngle[0] + dy, 90.0), -90.0);
      mouseAngle[1] = mouseAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };
 //end of new stuff 

	window.onkeypress = function(ev) { 
		var key = String.fromCharCode(ev.charCode);
		
		//key 1 - model
		if(key == "3" || key == "4"){
			model[0] = key;
		}
		//key 2 - rotation
		else{
			rot[0] = key;		
		};
	};

}	

Matrix4.prototype.setRotate = function(angle, x, y, z, ux, uy, uz) {
  var e, s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;

  angle = Math.PI * angle / 180;
  e = this.elements;

  s = Math.sin(angle);
  c = Math.cos(angle);

  if (0 !== x && 0 === y && 0 === z && 0 == ux && 0 == uy && 0 == uz) {
    // Rotation around X axis
    if (x < 0) {
      s = -s;
    }
    e[0] = 1;  e[4] = 0;  e[ 8] = 0;  e[12] = 0;
    e[1] = 0;  e[5] = c;  e[ 9] =-s;  e[13] = 0;
    e[2] = 0;  e[6] = s;  e[10] = c;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
  }
  else if (0 === x && 0 !== y && 0 === z && 0 == ux && 0 == uy && 0 == uz) {
    // Rotation around Y axis
    if (y < 0) {
      s = -s;
    }
    e[0] = c;  e[4] = 0;  e[ 8] = s;  e[12] = 0;
    e[1] = 0;  e[5] = 1;  e[ 9] = 0;  e[13] = 0;
    e[2] =-s;  e[6] = 0;  e[10] = c;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
  }
  else if (0 === x && 0 === y && 0 !== z && 0 == ux && 0 == uy && 0 == uz) {
    // Rotation around Z axis
    if (z < 0) {
      s = -s;
    }
    e[0] = c;  e[4] =-s;  e[ 8] = 0;  e[12] = 0;
    e[1] = s;  e[5] = c;  e[ 9] = 0;  e[13] = 0;
    e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
  }
  else if(0 === x && 0 === y && 0 == z && 0 !== ux && 0 == uy && 0 == uz) {
	if (ux < 0) {
      s = -s;
    }
	e[0] = c;  e[4] = 0;  e[ 8] = 0;  e[12] = s;
    e[1] = 0;  e[5] = 1;  e[ 9] = 0;  e[13] = 0;
    e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = 0;
    e[3] =-s;  e[7] = 0;  e[11] = 0;  e[15] = c;
  }
  else if(0 === x && 0 === y && 0 == z && 0 == ux && 0 !== uy && 0 == uz) {
	if (uy < 0) {
      s = -s;
    }
	e[0] = 1;  e[4] = 0;  e[ 8] = 0;  e[12] = 0;
    e[1] = 0;  e[5] = c;  e[ 9] = 0;  e[13] =-s;
    e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = 0;
    e[3] = 0;  e[7] = s;  e[11] = 0;  e[15] = c;
  }
  else if(0 === x && 0 === y && 0 == z && 0 == ux && 0 == uy && 0 !== uz) {
	if (uz < 0) {
      s = -s;
    }
	e[0] = 1;  e[4] = 0;  e[ 8] = 0;  e[12] = 0;
    e[1] = 0;  e[5] = 1;  e[ 9] = 0;  e[13] = 0;
    e[2] = 0;  e[6] = 0;  e[10] = c;  e[14] =-s;
    e[3] = 0;  e[7] = 0;  e[11] = s;  e[15] = c;
  }
  else {
    // Rotation around another axis
    len = Math.sqrt(x*x + y*y + z*z);
    if (len !== 1) {
      rlen = 1 / len;
      x *= rlen;
      y *= rlen;
      z *= rlen;
    }
    nc = 1 - c;
    xy = x * y;
    yz = y * z;
    zx = z * x;
    xs = x * s;
    ys = y * s;
    zs = z * s;

    e[ 0] = x*x*nc +  c;
    e[ 1] = xy *nc + zs;
    e[ 2] = zx *nc - ys;
    e[ 3] = 0;

    e[ 4] = xy *nc - zs;
    e[ 5] = y*y*nc +  c;
    e[ 6] = yz *nc + xs;
    e[ 7] = 0;

    e[ 8] = zx *nc + ys;
    e[ 9] = yz *nc - xs;
    e[10] = z*z*nc +  c;
    e[11] = 0;

    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;
  }

  return this;
};

Matrix4.prototype.LookAt4D = function(eyeX, eyeY, eyeZ, eyeU, centerX, centerY, centerZ, centerU, upX, upY, upZ, upU, overX, overY, overZ, overU) {
	return this.concat(new Matrix4().setLookAt4D(eyeX, eyeY, eyeZ, eyeU, centerX, centerY, centerZ, centerU, upX, upY, upZ, upU, overX, overY, overZ, overU));
}

Matrix4.prototype.setLookAt4D = function(eyeX, eyeY, eyeZ, eyeU, centerX, centerY, centerZ, centerU, upX, upY, upZ, upU, overX, overY, overZ, overU) {
  var e, f, s, u, o;

  fx = centerX - eyeX;
  fy = centerY - eyeY;
  fz = centerZ - eyeZ;
  fu = centerU - eyeU;

  f = [fx, fy, fz, fu];
  // Normalize f.
  f = normalize(f);

  // Calculate cross product of f and up and over.
  s = Cross4(f, [upX, upY, upZ, upU], [overX, overY, overZ, overU]);
  s = normalize(s);
  // Normalize s.
  
  
  // Calculate cross product of s and f and over.
  u = Cross4(f, s, [overX, overY, overZ, overU]);
  u = normalize(u);
  
  // Calculate cross product of s and f and u.
  o = Cross4(f, s, u);
  
  // Set to this.
  e = this.elements;
  e[0] = s[0];
  e[1] = u[0];
  e[2] = -f[0];
  e[3] = o[0];

  e[4] = s[1];
  e[5] = u[1];
  e[6] = -f[1];
  e[7] = o[1];

  e[8] = s[2];
  e[9] = u[2];
  e[10] = -f[2];
  e[11] = o[2];

  e[12] = s[3];
  e[13] = u[3];
  e[14] = -f[3];
  e[15] = o[3];

  // Translate.
  return this.translate(-eyeX, -eyeY, -eyeZ);
};

 function Cross4(A, B, C) {
	var D = [];
	D[0] = Det3([A[1], A[2], A[3]],
				[B[1], B[2], B[3]],
				[C[1], C[2], C[3]]);
	D[1] =-Det3([A[0], A[2], A[3]],
				[B[0], B[2], B[3]],
				[C[0], C[2], C[3]]);
	D[2] = Det3([A[0], A[1], A[3]],
				[B[0], B[1], B[3]],
				[C[0], C[1], C[3]]);			
	D[3] =-Det3([A[0], A[1], A[2]],
				[B[0], B[1], B[2]],
				[C[0], C[1], C[2]]);
	return D;
 }
 
 function Det3(A, B, C) {
	return A[0] * (B[1] * C[2] - C[1] * B[2]) - A[1] * (B[0] * C[2] - B[2] * C[0]) + A[2] * (B[0] * C[1] - B[1] * C[0]);
 }
 
 function normalize(A){
	var length = Math.sqrt(A[0]*A[0] + A[1]*A[1] + A[2]*A[2] + A[3]*A[3]);
	A[0] = A[0]/length;
	A[1] = A[1]/length;
	A[2] = A[2]/length;
	A[3] = A[3]/length;
	return A;
 }
