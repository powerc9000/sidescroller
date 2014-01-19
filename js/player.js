var $h = require("./head-on");
module.exports = (function(){
	var gravity = $h.Vector(0,20);
	player = $h.entity({
		render: function(canvas){
			canvas.drawImage($h.images("player"), this.position.x, this.position.y);
		},
		update: function(delta){
			var col;
			var collided = false;
			
			if($h.keys.Right ){
				this.v = $h.Vector(400, this.v.y);
			}else if($h.keys.Left ){
				this.v = $h.Vector(-400, this.v.y);
			}else{
				this.v = $h.Vector(0, this.v.y);
			}
			if($h.keys.space && this.onGround){
				this.v = $h.Vector(this.v.x, -800);
			}
			this.v.add(this.ay);
			this.v.add(this.ax);
			this.v = this.v.add(gravity);
			this.position = this.position.add(this.v.mul(delta/1000));
			//set on ground to false after movement to let collision detection check if we are on ground
			//We cant just check the v.y of the player because when he reaches the height of his arc you can jump again
			this.onGround = false;
			for(var y=0; y<$h.map.length; y++){
				for(var x=0; x<$h.map[0].length; x++){
					col = $h.collides(this, {width:32, height:32, angle:0, position: $h.Vector(x*32, y*32)});
					if($h.map[y][x] && col){
						if(col.normal.y){
							if(col.normal.y == -1){
								//normal of -1 means we on on top of a block so we are on the ground
								this.onGround = true;
							}
							this.v = $h.Vector(this.v.x, 0);
						}
						if(col.normal.x){
							this.v = $h.Vector(0, this.v.y);
						}
						this.position = this.position.sub($h.Vector(col.normal.x, col.normal.y).mul(col.overlap));
						//this.position = col;
					}
				}
			}
			

			
			$h.currentCamera.moveTo(this.position);

		},
		position: $h.Vector(0,268),
		ax: $h.Vector(0,0),
		ay: $h.Vector(0,0),
		v: $h.Vector(400,0),
		angle: 0,
		width:32,
		height:52
	});
	return player;
}());