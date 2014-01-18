var $h = require("./head-on");
(function(){
	$h.keys = {};
	window.addEventListener("keydown", function(e){
		if(e.which == 32){
			$h.keys["space"] = true;
		}
		$h.keys[e.keyIdentifier] = true;
	});

	window.addEventListener("keyup", function(e){
		if(e.which == 32){
			$h.keys["space"] = false;
		}
		$h.keys[e.keyIdentifier] = false;
	})
}());