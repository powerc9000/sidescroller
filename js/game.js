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
$h.player = player;
$h.currentCamera = camera;
$h.map = map.map;
$h.loadImages([
	{name:"grass", src:"img/grass.png"},
	{name:"brick", src:"img/brick2.png"},
	{name:"player", src:"img/player.png"}
	])
$h.update(update);
$h.render(render(canvas, map.map));
$h.run();