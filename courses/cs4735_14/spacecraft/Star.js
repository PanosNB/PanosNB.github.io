function Star(position, rotation, scale, color){

	this.position = position;
	this.rotation = rotation;
	this.scale = scale;
	this.radius = 1;
	this.isDestroid = false;
	this.color= color;
	
}// end of bullet()


Star.prototype.update = function(dt) {
	
	
};


Star.prototype.draw = function() {
	//calling star.draw();
	
	
	mdlMatrixChild=new Matrix4(mdlMatrix); 
	mdlMatrixChild.translate(this.position[0], this.position[1], this.position[2]);
	mdlMatrixChild.scale(this.scale[0], this.scale[1], this.scale[2]);
	mdlMatrixChild.rotate(this.rotation[0], 1.0, 0.0, 0.0);
	mdlMatrixChild.rotate(this.rotation[1], 0.0, 1.0, 0.0);
	mdlMatrixChild.rotate(this.rotation[2], 0.0, 0.0, 1.0);
	
	gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
	gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
	
	
	var starColors = new Float32Array(planeVertices.length);
	
	for(i=0; i<starColors.length; i++){
		starColors[i] = this.color[0];
	}
	
	var normalDirection = 1;
	var indexBuffer = gl.createBuffer();
	if (!indexBuffer) return -1;

	// Write the vertex coordinates and color to the buffer object
	if (!initArrayBuffer( planeVertices, 3, gl.FLOAT, 'a_Position')) return -1;
	if (!initArrayBuffer( starColors, 3, gl.FLOAT, 'a_Color'))return -1;
	if (!initArrayBuffer( planeNormals, 4, gl.FLOAT, 'a_Normal'))return -1;
	
	// Write the indices to the buffer object
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, planeIndices, gl.STATIC_DRAW);
	
	// Get the storage location of u_NormalDirection
	var u_NormalDirection = gl.getUniformLocation(gl.program, 'u_NormalDirection');
	if (!u_NormalDirection) {console.log('Failed to get the storage location of u_NormalDirection'); return;}
	
	gl.uniform1f(u_NormalDirection, normalDirection);
	
	// Draw the cube
	gl.drawElements(gl.TRIANGLES, planeIndices.length, gl.UNSIGNED_BYTE, 0);
		
}



Star.prototype.setVelocity = function(x,y,z){
	this.velocity = normalizeVec([x,y,z]);
}


Star.prototype.setRotation = function(x,y,z){
	this.rotation.x = x;
	this.rotation.y = y;
	this.rotation.z = z;
}

Star.prototype.getScaledRadius = function(){
	var x = Math.max(this.scale[0], this.scale[1]);
	return this.radius*x;
}