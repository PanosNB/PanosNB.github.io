
function Asteroid(position, velocity, rotation, scale){

	this.position = position;
	this.velocity = velocity;
	this.rotation = rotation;
	this.scale = scale;
	this.radius = 1;
	
	this.isDestroid = false;
	
}// end of bullet()


Asteroid.prototype.update = function(dt) {
	
	if(this.velocity[0] != 0)	this.position[0] += this.velocity[0] * dt;
	if(this.velocity[1] != 0)	this.position[1] += this.velocity[1] * dt;
	if(this.velocity[2] != 0)	this.position[2] += this.velocity[2] * dt;
	
	if(this.position[0] < -worldSize && this.velocity[0] <0){
		this.velocity[0] = -this.velocity[0];
		this.rotation[1] = -this.rotation[1];
	}else if(this.position[0] > worldSize && this.velocity[0] >0){
		this.velocity[0] = -this.velocity[0];
		this.rotation[1] = -this.rotation[1];
	}
	
	if(this.position[1] < -worldSize && this.velocity[1] <0){
		this.velocity[1] = -this.velocity[1];
		this.rotation[0] = -this.rotation[0];
	}else if(this.position[1] > worldSize && this.velocity[1] >0){
		this.velocity[1] = -this.velocity[1];
		this.rotation[0] = -this.rotation[0];
	}
	
	if(this.position[2] < -worldSize && this.velocity[2] <0){
		this.velocity[2] = -this.velocity[2];
		this.rotation[1] = -this.rotation[1];
	}else if(this.position[2] > worldSize && this.velocity[2] >0){
		this.velocity[2] = -this.velocity[2];
		this.rotation[1] = -this.rotation[1];
	}
	
	
};


Asteroid.prototype.draw = function() {
	
	mdlMatrixChild=new Matrix4(mdlMatrix); 
	mdlMatrixChild.translate(this.position[0], this.position[1], this.position[2]);
	mdlMatrixChild.scale(this.scale[0], this.scale[1], this.scale[2]);
	mdlMatrixChild.rotate(this.rotation[0], 1.0, 0.0, 0.0);
	mdlMatrixChild.rotate(this.rotation[1], 0.0, 1.0, 0.0);
	mdlMatrixChild.rotate(this.rotation[2], 0.0, 0.0, 1.0);
	
  gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
	
	
	
	
	var normalDirection = 1;
	var indexBuffer = gl.createBuffer();
  if (!indexBuffer) return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer( asteroidVertices, 3, gl.FLOAT, 'a_Position')) return -1;
  if (!initArrayBuffer( asteroidColors, 3, gl.FLOAT, 'a_Color'))return -1;
  if (!initArrayBuffer( asteroidNormals, 4, gl.FLOAT, 'a_Normal'))return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, asteroidIndices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(gl.program, 'u_NormalDirection');
  if (!u_NormalDirection) {console.log('Failed to get the storage location of u_NormalDirection'); return;}
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, asteroidIndices.length, gl.UNSIGNED_BYTE, 0);
	
}



Asteroid.prototype.setVelocity = function(x,y,z){
	this.velocity = normalizeVec([x,y,z]);
}


Asteroid.prototype.setRotation = function(x,y,z){
	this.rotation.x = x;
	this.rotation.y = y;
	this.rotation.z = z;
	
}


Asteroid.prototype.getScaledRadius = function(){
	var x = Math.max(this.scale[0], this.scale[1]);
	
	return this.radius*x*1.5;
	
}