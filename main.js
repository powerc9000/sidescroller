(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
//camera.zoomIn(2);
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
},{"./head-on":2,"./keys":3,"./map":4,"./player":5,"./render":6,"./update":7}],2:[function(require,module,exports){
module.exports = (function(window, undefined){
	"use strict";
	var headOn = (function(){
		var vectorProto;
		var headOn = {

				groups: {},
				_images: {},
				fps: 50,
				imagesLoaded: true,
				gameTime: 0,
				_update:"",
				_render:"",
				_ticks: 0,

				randInt: function(min, max) {
					return Math.floor(Math.random() * (max +1 - min)) + min;
				},
				randFloat: function(min, max) {
					return Math.random() * (max - min) + min
				},
				events: {
					events: {},
					listen: function(eventName, callback){
						if(!this.events[eventName]){
							this.events[eventName] = [];
						}
						this.events[eventName].push(callback);
					},
					
					trigger: function(eventName){
						var args = [].splice.call(arguments, 1),
							e = this.events[eventName],
							l,
							i;
						if(e){
							l = e.length;
							for(i = 0; i < l; i++){
								e[i].apply(headOn, args);
							}
						}
						
					}
				},
				Camera: function(width, height, x, y, zoom){
					this.width = width;
					this.height = height;
					x = x || 0;
					y = y || 0;
					this.position = headOn.Vector(x, y);
					this.dimensions = headOn.Vector(width, height);
					this.center = headOn.Vector(x+width/2, y+height/2);
					this.zoomAmt = zoom || 1;
					return this;
				},
				animate: function(keyFrames, fps){
					if(this === headOn){
						throw "Must be called with `new`";
					}
					var that, interval, currentFrame = 0;
					this.frames = keyFrames;
					this.animating = false;
					this.frame = 0;
					this.fps = fps || headOn.fps;

					return this;
				},

				update: function(cb){this._update = cb},

				render: function(cb){this._render = cb},

				entity: function(values, parent){
					var i, o, base;
					if (parent && typeof parent === "object") {
						o = Object.create(parent);
					}
					else{
						o = {};
					}
					for(i in values){
						if(values.hasOwnProperty(i)){
							o[i] = values[i];
						}
					}
					return o;
				},
				collides: function(poly1, poly2) {
					var points1 = this.getPoints(poly1),
						points2 = this.getPoints(poly2),
						i = 0,
						l = points1.length,
						j, k = points2.length,
						normal = {
							x: 0,
							y: 0
						},
						length,
						min1, min2,
						max1, max2,
						interval,
						MTV = null,
						MTV2 = null,
						MN = null,
						dot,
						nextPoint,
						currentPoint;
						
					if(poly1.type === "circle" && poly2.type ==="circle"){
						return circleCircle(poly1, poly2);
					}else if(poly1.type === "circle"){
						return circleRect(poly1, poly2);
					}else if(poly2.type === "circle"){
						return circleRect(poly2, poly1);
					}
					

					//loop through the edges of Polygon 1
					for (; i < l; i++) {
						nextPoint = points1[(i == l - 1 ? 0 : i + 1)];
						currentPoint = points1[i];

						//generate the normal for the current edge
						normal.x = -(nextPoint[1] - currentPoint[1]);
						normal.y = (nextPoint[0] - currentPoint[0]);

						//normalize the vector
						length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
						normal.x /= length;
						normal.y /= length;

						//default min max
						min1 = min2 = -1;
						max1 = max2 = -1;

						//project all vertices from poly1 onto axis
						for (j = 0; j < l; ++j) {
							dot = points1[j][0] * normal.x + points1[j][1] * normal.y;
							if (dot > max1 || max1 === -1) max1 = dot;
							if (dot < min1 || min1 === -1) min1 = dot;
						}

						//project all vertices from poly2 onto axis
						for (j = 0; j < k; ++j) {
							dot = points2[j][0] * normal.x + points2[j][1] * normal.y;
							if (dot > max2 || max2 === -1) max2 = dot;
							if (dot < min2 || min2 === -1) min2 = dot;
						}

						//calculate the minimum translation vector should be negative
						if (min1 < min2) {
							interval = min2 - max1;

							normal.x = -normal.x;
							normal.y = -normal.y;
						} else {
							interval = min1 - max2;
						}

						//exit early if positive
						if (interval >= 0) {
							return false;
						}

						if (MTV === null || interval > MTV) {
							MTV = interval;
							MN = {
								x: normal.x,
								y: normal.y
							};
						}
					}

					//loop through the edges of Polygon 2
					for (i = 0; i < k; i++) {
						nextPoint = points2[(i == k - 1 ? 0 : i + 1)];
						currentPoint = points2[i];

						//generate the normal for the current edge
						normal.x = -(nextPoint[1] - currentPoint[1]);
						normal.y = (nextPoint[0] - currentPoint[0]);

						//normalize the vector
						length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
						normal.x /= length;
						normal.y /= length;

						//default min max
						min1 = min2 = -1;
						max1 = max2 = -1;

						//project all vertices from poly1 onto axis
						for (j = 0; j < l; ++j) {
							dot = points1[j][0] * normal.x + points1[j][1] * normal.y;
							if (dot > max1 || max1 === -1) max1 = dot;
							if (dot < min1 || min1 === -1) min1 = dot;
						}

						//project all vertices from poly2 onto axis
						for (j = 0; j < k; ++j) {
							dot = points2[j][0] * normal.x + points2[j][1] * normal.y;
							if (dot > max2 || max2 === -1) max2 = dot;
							if (dot < min2 || min2 === -1) min2 = dot;
						}

						//calculate the minimum translation vector should be negative
						if (min1 < min2) {
							interval = min2 - max1;

							normal.x = -normal.x;
							normal.y = -normal.y;
						} else {
							interval = min1 - max2;


						}

						//exit early if positive
						if (interval >= 0) {
							return false;
						}
					
						if (MTV === null || interval > MTV) MTV = interval;
						if (interval > MTV2 || MTV2 === null) {
							MTV2 = interval;
							MN = {
								x: normal.x,
								y: normal.y
							};
						}
					}

					return {
						overlap: MTV2,
						normal: MN
					};
					function circleRect(circle, rect){
						var newX = circle.position.x * Math.cos(-rect.angle);
						var newY = circle.position.y * Math.sin(-rect.angle);
						var circleDistance = {x:newX, y:newY};
						var cornerDistance_sq;
						circleDistance.x = Math.abs(circle.position.x - rect.position.x);
					    circleDistance.y = Math.abs(circle.position.y - rect.position.y);

					    if (circleDistance.x > (rect.width/2 + circle.radius)) { return false; }
					    if (circleDistance.y > (rect.height/2 + circle.radius)) { return false; }

					    if (circleDistance.x <= (rect.width/2)) { return true; } 
					    if (circleDistance.y <= (rect.height/2)) { return true; }

					    cornerDistance_sq = Math.pow(circleDistance.x - rect.width/2,2) +
					                         Math.pow(circleDistance.y - rect.height/2, 2);

					    return (cornerDistance_sq <= Math.pow(circle.radius,2));
					}
					function pointInCircle(point, circle){
						Math.pow(point.x - circle.position.x ,2) + Math.pow(point.y - circle.position.y, 2) < Math.pow(circle.radius,2);
					}
					function circleCircle(ob1, ob2){
						square(ob2.position.x - ob1.position.x) + square(ob2.position.y - ob1.position.y) <= square(ob1.radius + ob2.radius)
					}
				},

				getPoints: function (obj){
					if(obj.type === "circle"){
						return [];
					}
					var x = obj.position.x,
						y = obj.position.y,
						width = obj.width,
						height = obj.height,
						angle = obj.angle,
						that = this,
						points = [];

					points[0] = [x,y];
					points[1] = [];
					points[1].push(Math.sin(-angle) * height + x);
					points[1].push(Math.cos(-angle) * height + y);
					points[2] = [];
					points[2].push(Math.cos(angle) * width + points[1][0]);
					points[2].push(Math.sin(angle) * width + points[1][1]);
					points[3] = [];
					points[3].push(Math.cos(angle) * width + x);
					points[3].push(Math.sin(angle) * width + y);
						//console.log(points);
					return points;

				},

				Timer: function(){
					this.jobs = [];
				},
				pause: function(){
					this.paused = true;
					this.events.trigger("pause");
				},
				unpause: function(){
					this.events.trigger("unpause");
					this.paused = false;
				},
				isPaused: function(){
					return this.paused;
				},
				group: function(groupName, entity){
					if(this.groups[groupName]){
						if(entity){
							this.groups[groupName].push(entity);
						}
					}
					else{
						this.groups[groupName] = [];
						if(entity){
							this.groups[groupName].push(entity);
						}
					}
					return this.groups[groupName];
				},

				loadImages: function(imageArray, imgCallback, allCallback){
					var args, img, total, loaded, timeout, interval, that, cb, imgOnload;
					that = this;
					this.imagesLoaded = false;
					total = imageArray.length;
					if(!total){
						this.imagesLoaded = true;
					}
					loaded = 0;
					imgOnload = function(){
						loaded += 1;
						imgCallback && imgCallback(this);
						if(loaded === total){
							allCallback && allCallback();
							that.imagesLoaded = true;
						}
					}
					imageArray.forEach(function(image){
						img = new Image();
						img.src = image.src;
						img.onload = imgOnload
					
						that._images[image.name] = img;
					});
				},
				images: function(image){
					if(this._images[image]){
						return this._images[image];
					}
					else{
						return new Image();
					}
				},
				onTick: function(then){
					var now = Date.now(),
					modifier = now - then;
				  	this.trueFps = 1/(modifier/1000);
					this._ticks+=1;
					this._update(modifier, this._ticks);
					this._render(modifier, this._ticks);
					this.gameTime += modifier;

				},

				timeout: function(cb, time, scope){
					setTimeout(function(){
						cb.call(scope);
					}, time)
				},

				interval: function(cb, time, scope){
					return setInterval(function(){
						cb.call(scope);
					}, time);
				},
				canvas: function(name){
					if(this === headOn){
						return new this.canvas(name);
					}
					this.canvas = this.canvases[name];
					this.width = this.canvas.width;
					this.height = this.canvas.height;
					return this;
				},

				Vector: function(x, y){
					var vec = this.entity({x:x,y:y}, vectorProto);
					return vec;
				},
				run: function(){
					var that = this;
					var then = Date.now();

					window.requestAnimationFrame(aniframe);
					function aniframe(){
						if(that.imagesLoaded){
							that.onTick(then);
							then = Date.now();

						}
						window.requestAnimationFrame(aniframe);
					}
					
				},
				exception: function(message){
					this.message = message;
					this.name = "Head-on Exception";
					this.toString = function(){
						return this.name + ": " + this.message
					}
				}
		};

		headOn.canvas.create = function(name, width, height, camera){
			var canvas, ctx;
			if(!camera || !(camera instanceof headOn.Camera)){
				throw new headOn.exception("Canvas must be intialized with a camera");
			}
			canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext("2d");
			this.prototype.canvases[name] = {
				canvas: canvas,
				ctx: ctx,
				width: canvas.width,
				height: canvas.height,
				camera: camera
			};
		}
		headOn.canvas.prototype = {
			canvases: {},
			stroke: function(stroke){
				var ctx = this.canvas.ctx;
				ctx.save();
				if(stroke){
					ctx.lineWith = stroke.width;
					ctx.strokeStyle = stroke.color;
					ctx.stroke();
				}
				ctx.restore();
			},
			drawRect: function(width, height, x, y, color, stroke, rotation){
				var ctx = this.canvas.ctx, mod = 1, camera = this.canvas.camera;
				ctx.save();
				ctx.beginPath();

				if(rotation){
					ctx.translate(x,y);
					ctx.rotate(rotation);
					ctx.rect(0, 0, width, height);
				}
				else{
					//console.log(camera.position.x)
					ctx.rect((x - camera.position.x)/camera.zoomAmt , (y - camera.position.y)/camera.zoomAmt , width / camera.zoomAmt, height / camera.zoomAmt);
				}
				if(color){
					ctx.fillStyle = color;
				}
				
				ctx.fill();
				if(typeof stroke === "object" && !isEmpty(stroke)){
					this.stroke(stroke);
				}
				ctx.closePath();
				ctx.restore();
				return this;
			},
			drawCircle: function(x, y, radius, color, stroke){
				var ctx = this.canvas.ctx, camera = this.canvas.camera;
				ctx.save();
				ctx.beginPath();
				ctx.arc((x - camera.position.x)/camera.zoomAmt, (y - camera.position.y)/camera.zoomAmt, radius / camera.zoomAmt, 0, 2*Math.PI, false);
				ctx.fillStyle = color || "black";
				ctx.fill();
				this.stroke(stroke);
				ctx.restore();
				ctx.closePath();
				return this;
			},
			drawImage: function(image,x,y, flipH, flipV){
				var ctx = this.canvas.ctx, camera = this.canvas.camera;
				// scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
				// scaleV = flipV ? -1 : 1;
				ctx.save();
				//ctx.scale(scaleH,scaleV)
				try{
					ctx.drawImage(
						image,
						(x - camera.position.x)/camera.zoomAmt, 
						(y - camera.position.y)/camera.zoomAmt,
						image.width/camera.zoomAmt,
						image.height/camera.zoomAmt)
				}
				catch(e){
					console.log(e.message);
					// if(console.count()%100){
					// 	console.log(image);
					// }
					
				}
				ctx.restore();
				return this;
			},

			drawImageRotated: function(image, rotation, x,y){
				var ctx = this.canvas.ctx;
				var radians = rotation * Math.PI / 180;
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(radians);
				ctx.drawImage(image, 0-image.width, 0-image.height);
				ctx.restore();
				return this;
			},

			drawText: function(textString, x, y, fontStyle, color, alignment, baseline){
				var ctx = this.canvas.ctx;
				ctx.save();

				if(fontStyle){
					ctx.font = fontStyle + " sans-serif";
				}
				if(color){
					ctx.fillStyle = color;
				}
				if(alignment){
					ctx.textAlign = alignment;
				}
				if(baseline){
					ctx.textBaseline = baseline;
				}

				ctx.fillText(textString,x,y);

				ctx.restore();
				return this;
			},

			append: function(element){
				element = document.querySelector(element);
				if(element){
					element.appendChild(this.canvas.canvas);
				}
				else{
					document.body.appendChild(this.canvas.canvas);
				}
				return this;
			},
			clear: function(){
				var ctx = this.canvas.ctx;
				ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
			},
			setCamera: function(cam){
				this.canvas.camera = cam;
			}
		}
		headOn.animate.prototype = {
			start:function(repeat, start){
				start = start || 0;
				this.repeat = repeat;
				if(!this.animating){
					this.animating = true;
					this.image = this.frames[start];

					this.interval = setInterval(function(){
						if(this.frames.length === this.frame + 1){
							//callback();
							if(repeat){
								this.frame = start;
								this.image = this.frames[start];
							}else{
								this.animating = false;
								clearInterval(this.interval);

							}
						}
						else{
							this.frame += 1;
							this.image = this.frames[this.frame];
						}
					}.bind(this), 1000/this.fps);
				}
				
			},
			stop: function(){
				clearInterval(this.interval);
				this.animating = false;
				this.frame = 0;
			},
			pause: function(){
				clearInterval(this.interval);
				this.paused = true;
				this.animating = false;
			},
			resume: function(){
				if(this.paused){
					this.start(this.repeat, this.frame);
				}
			}
		}
		headOn.Timer.prototype = {
			job: function(time, start){
				var jiff = {
					TTL: time,
					remaining: start || time
				};
				this.jobs.push(jiff);
				return {
					ready: function(){
						return jiff.remaining <= 0;
					},
					reset: function(){
						jiff.remaining = jiff.TTL;
					},
					timeLeft: function(){
						return jiff.remaining;
					}
				}
			},
			update: function(time){
				this.jobs.forEach(function(j){
					j.remaining -= time;
				});
			}
		}
		headOn.Camera.prototype = {
			zoomIn: function(amt){
				this.zoomAmt /= amt;
				this.position = this.center.sub(this.dimensions.mul(this.zoomAmt / 2))
				return this;
			},
			zoomOut: function(amt){
				this.zoomAmt *= amt;
				this.position = this.center.sub(this.dimensions.mul(this.zoomAmt / 2));
				
				return this;
			},
			move: function(vec){
				this.position = this.position.add(vec);
				this.center = this.position.add(headOn.Vector(this.width, this.height).mul(.5));
				return this;
			},
			moveTo: function(vec){
				this.position = vec.sub(this.dimensions.mul(.5).mul(this.zoomAmt));
				this.center = vec;
			},
			visible: function(obj){
				var dimensions = this.dimensions.mul(this.zoomAmt),
					camera = {
					width:dimensions.x,
					height:dimensions.y,
					position:this.position,
					angle:0
				};
				if(headOn.collides(obj, camera)){
					return true;
				}else{
					return false;
				}
			}
		}
		vectorProto = {
			normalize: function(){
				var len = this.length();
				return headOn.Vector(this.x/len, this.y/len);
			},

			normalizeInPlace: function(){
				var len = this.length();
				this.x /= len;
				this.y /= len;
			},

			dot: function(vec2){
				return vec2.x * this.x + vec2.y * this.y;
			},

			length: function(){
				return Math.sqrt(this.x*this.x + this.y*this.y);
			},

			sub: function(vec2){
				return headOn.Vector(this.x - vec2.x, this.y - vec2.y);
			},

			add: function(vec2){
				return headOn.Vector(this.x + vec2.x, this.y + vec2.y);
			},

			mul: function(scalar){
				return headOn.Vector(this.x * scalar, this.y * scalar);
			}
		}
		function sign(num){
			if(num < 0){
				return -1;
			}else{
				return 1;
			}
		}
		

		return headOn;
		function square(num){
			return num * num;
		}
		function isEmpty(obj){
			return Object.keys(obj).length === 0;
		}
	}());
	return headOn;
})(window);
},{}],3:[function(require,module,exports){
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
},{"./head-on":2}],4:[function(require,module,exports){
var $h = require("./head-on");
exports.map = [
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2],
[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2],
[0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

exports.dimensions = {
	width:32*40,
	height:11*20
}
},{"./head-on":2}],5:[function(require,module,exports){
var $h = require("./head-on");
module.exports = function(){
	var walkAnimation = new $h.animate([
		$h.images("walk"),
		$h.images("walk2"),
		$h.images("walk3"),
		$h.images("walk4")
	], 30);
	var currentAnimation;
	var gravity = $h.Vector(0,20);
	player = $h.entity({
		render: function(canvas){
			canvas.drawImage(currentAnimation.image, this.position.x, this.position.y, true);
		},
		update: function(delta){
			var col;
			var collided = false;
			
			if($h.keys.Right){
				this.v = $h.Vector(400, this.v.y);
				currentAnimation = walkAnimation;
				walkAnimation.start(true);
				
			}else if($h.keys.Left){
				this.v = $h.Vector(-400, this.v.y);
				
				currentAnimation = walkAnimation;
				walkAnimation.start(true);
				
			}else{
				this.v = $h.Vector(0, this.v.y);
				currentAnimation = {image:$h.images("player")}
				walkAnimation.stop();
			}
			if($h.keys.space && this.onGround){
				this.v = $h.Vector(this.v.x, -600);
				
			}

			this.v.add(this.ay);
			this.v.add(this.ax);
			this.v = this.v.add(gravity);
			this.position = this.position.add(this.v.mul(delta/1000));
			if(!this.onGround){
				walkAnimation.stop();
				currentAnimation = {image:$h.images("jump")}
			}
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
};
},{"./head-on":2}],6:[function(require,module,exports){
var $h = require("./head-on");
module.exports = function(canvas, map){
	return function(){
		canvas.clear();
		for(var y=0; y < map.length; y++){
			for(var x=0; x<map[0].length; x++){
				if($h.currentCamera.visible({width:32, height:32, position:$h.Vector(x*32, y*32), angle:0})){
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
		}
		$h.player.render(canvas);
	}

}
function visible(x,y){
	var cam = $h.currentCamera;
	
}
},{"./head-on":2}],7:[function(require,module,exports){
var $h = require("./head-on");
module.exports = function(delta){
	$h.player.update(delta);
}
},{"./head-on":2}]},{},[1])