
function Bullet(position, velocity, rotation, scale){

	this.position = position;
	this.velocity = velocity;
	this.rotation = rotation;
	this.scale = scale;
	this.radius = 1;
	this.color = [2,2,2];
	
	this.isDestroid = false;
	
}// end of bullet()


Bullet.prototype.update = function(dt) {
	
	if(this.velocity[0] != 0)	this.position[0] += this.velocity[0] * dt;
	if(this.velocity[1] != 0)	this.position[1] += this.velocity[1] * dt;
	if(this.velocity[2] != 0)	this.position[2] += this.velocity[2] * dt;
	
	if(this.position[0] < -worldSize && this.velocity[0] <0){
		this.isDestroid = true;
	}else if(this.position[0] > worldSize && this.velocity[0] >0){
		this.isDestroid = true;
	}
	if(this.position[1] < -worldSize && this.velocity[1] <0){
		this.isDestroid = true;
	}else if(this.position[1] > worldSize && this.velocity[1] >0){
		this.isDestroid = true;
	}
	if(this.position[2] < -worldSize && this.velocity[2] <0){
		this.isDestroid = true;
	}else if(this.position[2] > worldSize && this.velocity[2] >0){
		this.isDestroid = true;
	}
	
	
};


Bullet.prototype.draw = function() {
	

	mdlMatrixChild=new Matrix4(mdlMatrix); 
  mdlMatrixChild.translate(this.position[0], this.position[1], this.position[2]);
	mdlMatrixChild.scale(this.scale[0], this.scale[1], this.scale[2]);
	mdlMatrixChild.rotate(this.rotation[0], 1.0, 0.0, 0.0);
	mdlMatrixChild.rotate(this.rotation[1], 0.0, 1.0, 0.0);
	mdlMatrixChild.rotate(this.rotation[2], 0.0, 0.0, 1.0);
	
  gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
	
	
	var sphereColors = new Float32Array(sphereVertices.length);
	
	
	
	for(i=0; i<sphereColors.length; i++){
		sphereColors[i] = 1;
		
		if(i%3 == 0){ sphereColors[i] = this.color[0];}
		if(i%3 == 1){ sphereColors[i] = this.color[1];}
		if(i%3 == 2){ sphereColors[i] = this.color[2];}
	}
	
	
	var normalDirection = 1;
	var indexBuffer = gl.createBuffer();
  if (!indexBuffer) return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer( sphereVertices, 3, gl.FLOAT, 'a_Position')) return -1;
  if (!initArrayBuffer( sphereColors, 3, gl.FLOAT, 'a_Color'))return -1;
  if (!initArrayBuffer( sphereNormals, 4, gl.FLOAT, 'a_Normal'))return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphereIndices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(gl.program, 'u_NormalDirection');
  if (!u_NormalDirection) {console.log('Failed to get the storage location of u_NormalDirection'); return;}
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, sphereIndices.length, gl.UNSIGNED_BYTE, 0);
	
}



Bullet.prototype.setVelocity = function(x,y,z){
	this.velocity = normalizeVec([x,y,z]);
}


Bullet.prototype.setRotation = function(x,y,z){
	this.rotation.x = x;
	this.rotation.y = y;
	this.rotation.z = z;
}


Bullet.prototype.getScaledRadius = function(){
	var x = Math.max(this.scale[0], this.scale[1]);
	
	return this.radius*x*1.5;
	
}