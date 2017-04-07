

function checkCollisions(){

	//check ships ships collisions.
	for(i=0; i< ships.length; i++){
		for(j=0; j<ships.length; j++){
			if(i != j){
				if(checkSphereSphere(ships[i].position, ships[i].getScaledRadius(), ships[j].position, ships[j].getScaledRadius())){
					//TODO ship collision stuff.
					//ships[i].color = [1.0, .1, .1];
				}
			}
		}
	}
	
	
	//TODO check Ships asteroids collisions.
	for(i=0; i< ships.length; i++){
		for(j=0; j<asteroids.length; j++){
				if(checkSphereSphere(ships[i].position, ships[i].getScaledRadius(), asteroids[j].position, asteroids[j].getScaledRadius())){
					//TODO ship collision stuff.
					//ships[i].color = [1.0, .1, .1];
				}
		}
	}
	
	
	//TODO check ships bullets collisions.
	for(i=0; i< ships.length; i++){
		for(j=0; j<bullets.length; j++){
				if(checkSphereSphere(ships[i].position, ships[i].getScaledRadius(), bullets[j].position, bullets[j].getScaledRadius())){
					//TODO ship collision stuff.
					document.getElementById('asteroidCollisionAudio').play();
					ships[i].isDestroid = true;
					//ships[i].color = [.1, .1, 1.0];
					bullets[j].isDestroid = true;
					shipsStunned +=1;
					killCounter+=1;
				}
		}
	}
	
	
	//TODO check asteroids bullet collisions.
	for(i=0; i< asteroids.length; i++){
		for(j=0; j<bullets.length; j++){
				if(checkSphereSphere(asteroids[i].position, asteroids[i].getScaledRadius(), bullets[j].position, bullets[j].getScaledRadius())){
					//TODO ship collision stuff.
					document.getElementById('asteroidCollisionAudio').play();
					asteroids[i].isDestroid = true;
					bullets[j].isDestroid = true;
					killCounter += 1;
					spawnVar+=1;
				}
		}
	}
	//Check for SpaceJunk (satellite, ) collisions
	for(i=0; i< spaceJunk.length; i++){
		for(j=0; j<bullets.length; j++){
				if(checkSphereSphere(spaceJunk[i].position, spaceJunk[i].getScaledRadius(), bullets[j].position, bullets[j].getScaledRadius())){
					//TODO ship collision stuff.
          document.getElementById('asteroidCollisionAudio').play();
					spaceJunk[i].isDestroid = true;
					bullets[j].isDestroid = true;
          killCounter += 1;
				}
		}
	}
	
	
	
	//TODO (if we have time) check asteroid asteroid collision.
	
	
	
	
	//TODO (if we have time) check bullet bullet collision.
	
	
	

} /// End of checkCollision()


function checkSphereSphere(position1, radius1, position2, radius2){

	var radSqr = radius1 * radius2;
	radSqr *= radSqr;
	
	return distanceSquared(position1, position2) < radSqr;
		
}


function distanceSquared(position1, position2){
	var subVec = [0,0,0];
	subVec[0] = position2[0] - position1[0];
	subVec[1] = position2[1] - position1[1];
	subVec[2] = position2[2] - position1[2];
	
	return dotProduct(subVec, subVec);
}


function dotProduct(vec1, vec2){
		return (vec1[0] * vec2[0]) + (vec1[1] * vec2[1]) + (vec1[2] * vec2[2]) ;
}