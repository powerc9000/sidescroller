var $h = require("./head-on");
module.exports = function(canvas, map){
	return function(){
		canvas.clear();
		for(var y=0; y < map.length; y++){
			for(var x=0; x<map[0].length; x++){
				if(map[y][x]=== 0){
					continue;
				}
				if(map[y][x] === 1){
					canvas.drawImage($h.images("grass"), x*32, y*32);
				}
				if(map[y][x] === 2){
					canvas.drawImage($h.images("brick"), x*32, y*32);
				}
			}
		}
		$h.player.render(canvas);
	}

}