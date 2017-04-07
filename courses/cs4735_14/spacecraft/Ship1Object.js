var ship1Texture;


function Ship1(position, velocity, rotation, scale){

	this.position = position;
	this.velocity = velocity;
	this.rotation = rotation;
	this.scale = scale;
	this.isDestroid = false;
	this.radius = 1.5;
	this.color = [0.8, 0.2, 0.2];
	
}// end of bullet()


Ship1.prototype.update = function(dt) {
	
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


Ship1.prototype.draw = function() {
	
	mdlMatrixChild=new Matrix4(mdlMatrix); 
	mdlMatrixChild.translate(this.position[0], this.position[1], this.position[2]);
	mdlMatrixChild.scale(this.scale[0], this.scale[1], this.scale[2]);
	mdlMatrixChild.rotate(this.rotation[0], 1.0, 0.0, 0.0);
	mdlMatrixChild.rotate(this.rotation[1], 0.0, 1.0, 0.0);
	mdlMatrixChild.rotate(this.rotation[2], 0.0, 0.0, 1.0);
	
	gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
	gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
	
	
	var ship1Colors = new Float32Array(ship1Vertices.length);
	
	
	
	for(i=0; i<ship1Colors.length; i++){
		ship1Colors[i] = 1;
		
		if(i%3 == 0){ ship1Colors[i] = this.color[0];}
		if(i%3 == 1){ ship1Colors[i] = this.color[1];}
		if(i%3 == 2){ ship1Colors[i] = this.color[2];}
	}
	
	
	
	
	
	
	var normalDirection = 1;
	var indexBuffer = gl.createBuffer();
	if (!indexBuffer) return -1;

	// Write the vertex coordinates and color to the buffer object
	if (!initArrayBuffer( ship1Vertices, 3, gl.FLOAT, 'a_Position')) return -1;
	if (!initArrayBuffer( ship1Colors, 3, gl.FLOAT, 'a_Color'))return -1;
	//if (!initArrayBuffer( ship1UVCoords, 2, gl.FLOAT, 'a_UV'))return -1;
	if (!initArrayBuffer( ship1Normals, 4, gl.FLOAT, 'a_Normal'))return -1;

	// Write the indices to the buffer object
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ship1Indices, gl.STATIC_DRAW);
  
	// Get the storage location of u_NormalDirection
	var u_NormalDirection = gl.getUniformLocation(gl.program, 'u_NormalDirection');
	if (!u_NormalDirection) {console.log('Failed to get the storage location of u_NormalDirection'); return;}
  
	gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
	gl.drawElements(gl.TRIANGLES, ship1Indices.length, gl.UNSIGNED_BYTE, 0);
	
}



Ship1.prototype.setVelocity = function(x,y,z){
	this.velocity = normalizeVec([x,y,z]);
}


Ship1.prototype.setRotation = function(x,y,z){
	this.rotation.x = x;
	this.rotation.y = y;
	this.rotation.z = z;
	
}


Ship1.prototype.getScaledRadius = function(){
	var x = Math.max(this.scale[0], this.scale[1]);
	
	return this.radius*x;
	
}