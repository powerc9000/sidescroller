var $h = require("./head-on");
module.exports = (function(){
	player = $h.entity({
		render: function(canvas){
			canvas.drawImage($h.images("player"), this.position.x, this.position.y);
		},
		update: function(delta){
			var col = this.position;
			if($h.keys.Right){
				this.vx = $h.Vector(400, 0);
			}else{
				this.vx = $h.Vector(0,0);
			}
			if($h.keys.Left){
				this.vx = $h.Vector(-400, 0);
			}else{
				this.vx = $h.Vector(0,0);
			}
			for(var y=0; y<$h.map.length; y++){
				for(var x=0; x<$h.map[0].length; x++){
					if($h.map[y][x] && $h.collides(this, {width:32, height:32, angle:0, position: $h.Vector(x*32, y*32)})){
						this.position = old;
					}
				}
			}
			// if($h.keys.space){
			// 	this.ay = $h.Vector(0, 400);
			// }

			this.vy.add(this.ay);
			this.vx.add(this.ax);
			this.position = this.position.add(this.vx.mul(delta/1000));
			$h.currentCamera.moveTo(this.position);

		},
		position: $h.Vector(0,268),
		ax: $h.Vector(0,0),
		ay: $h.Vector(0,0),
		vx: $h.Vector(400,0),
		vy: $h.Vector(0, 400),
		angle: 0,
		width:32,
		height:52
	});
	return player;
}());