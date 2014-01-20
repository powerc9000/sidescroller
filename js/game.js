var player = require("./player"),
	$h = require("./head-on"),
	map = require("./map"),
	render = require("./render"),
	update = require("./update"),
	keys = require("./keys"),
	viewport = {
		width:500,
		height:500
	},
	camera = new $h.Camera(viewport.width, viewport.height),
	canvas;
$h.canvas.create("main", viewport.width, viewport.height, camera);
canvas = $h.canvas("main");
canvas.append("body");

$h.currentCamera = camera;
$h.map = map.map;
$h.loadImages([
	{name:"grass", src:"img/grass.png"},
	{name:"brick", src:"img/brick2.png"},
	{name:"player", src:"img/player.png"},
	{name:"walk", src:"img/playerwalk.png"},
	{name:"walk1", src:"img/playerwalk1.png"},
	{name:"walk2", src:"img/playerwalk2.png"},
	{name:"walk3", src:"img/playerwalk3.png"},
	{name:"walk4", src:"img/playerwalk4.png"},
	{name:"jump", src:"img/player_jump.png"}
	], function(){}, function(){
		$h.player = player();
	})
$h.update(update);
$h.render(render(canvas, map.map));
$h.run();