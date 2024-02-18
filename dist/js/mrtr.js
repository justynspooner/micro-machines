!function t(e,i,s){function a(h,r){if(!i[h]){if(!e[h]){var o="function"==typeof require&&require;if(!r&&o)return o(h,!0);if(n)return n(h,!0);var c=new Error("Cannot find module '"+h+"'");throw c.code="MODULE_NOT_FOUND",c}var l=i[h]={exports:{}};e[h][0].call(l.exports,(function(t){return a(e[h][1][t]||t)}),l,l.exports,t,e,i,s)}return i[h].exports}for(var n="function"==typeof require&&require,h=0;h<s.length;h++)a(s[h]);return a}({1:[function(t,e,i){const s=t("./car");e.exports=class extends s{constructor(t){super(t),this.recordedPositions=t.recordedPositions,this.recordedPositionIndex=0}draw(t){const e=this.recordedPositions[this.recordedPositionIndex];this.x=-1*(e.x-t.viewport.width/2),this.y=-1*(e.y-t.viewport.height/2),this.angle=e.angle,super.draw(t,this.x+t.viewport.x,this.y+t.viewport.y),this.recordedPositionIndex===this.recordedPositions.length-1?this.recordedPositionIndex=0:this.recordedPositionIndex++}}},{"./car":2}],2:[function(t,e,i){e.exports=class{constructor(t){this.name=t.name,this.height=t.height,this.width=t.width,this.acceleration=t.acceleration,this.braking=t.braking,this.handling=t.handling,this.maxPower=t.maxPower,this.handbrake=t.handbrake,this.img=new Image,this.img.src=t.imageLocation,this.x=t.x,this.y=t.y,this.prevX=0,this.prevY=0,this.angle=t.angle,this.vx=0,this.vy=0,this.power=0,this.steering=0}respondToEvents(t,e={}){e.left&&(this.power>0?this.angle-=this.steering:this.angle+=this.steering),e.right&&(this.power>0?this.angle+=this.steering:this.angle-=this.steering),e.accelerate&&!e.brake&&this.power<this.maxPower&&(this.power+=this.acceleration),(e.accelerate&&e.brake||!e.accelerate&&!e.brake)&&(this.power*=t.friction),e.brake&&!e.accelerate&&this.power>-1*this.maxPower&&(this.power-=this.braking),!e.handbrake||e.left||e.right||(this.power>0&&(this.power-=this.handbrake),this.power<0&&(this.power=0)),e.handbrake&&e.left&&(this.power>0?this.angle-=.5*this.steering:this.angle+=.5*this.steering),e.handbrake&&e.right&&(this.power>0?this.angle+=.5*this.steering:this.angle-=.5*this.steering),this.angle=(this.angle+360)%360,this.checkCollision(t)&&(this.x=this.prevX,this.y=this.prevY,this.vx*=-.5,this.vy*=-.5,this.power<0&&(this.power=0));const i=this.checkWaypoint(t);-1!==i&&t.onWaypointTriggered(i)}checkWaypoint(t){const e=-1*(this.x-t.viewport.width/2),i=-1*(this.y-t.viewport.height/2);for(let s=0;s<t.track.waypoints.length;s++){const a=t.track.waypoints[s];if(e<a.x+a.width&&e+this.width>a.x&&i<a.y+a.height&&i+this.height>a.y){const t=a.angle,e=this.angle;if(Math.abs(t-e)<90)return s}}return-1}checkCollision(t){const e=t.track.obstacles,i=-1*(this.x-t.viewport.width/2),s=-1*(this.y-t.viewport.height/2);for(let t=0;t<e.length;t++){const a=e[t];if(i<a.x+a.width&&i+this.width>a.x&&s<a.y+a.height&&s+this.height>a.y)return!0}}calculate(t){this.prevX=this.x,this.prevY=this.y;const e=Math.cos(this.angle*(Math.PI/180)),i=Math.sin(this.angle*(Math.PI/180));this.vx+=e*this.power,this.vy+=i*this.power;const s=.01*Math.abs(Math.atan2(this.y-this.vy,this.x-this.vx));this.vx*=t.friction-s,this.vy*=t.friction-s,this.steering=this.handling*(Math.abs(this.power)/this.maxPower)}draw(t,e,i){t.canvas.context.save(),t.canvas.context.translate(e,i),t.canvas.context.rotate(this.angle*(Math.PI/180)),t.canvas.context.drawImage(this.img,0-this.width/2,0-this.height/2),t.canvas.context.restore()}}},{}],3:[function(t,e,i){e.exports={yellowSport:{name:"Yellow sport",imageLocation:"./images/cars/yellow_sport.png",height:14,width:25,maxPower:5,acceleration:1,braking:.25,handling:10,handbrake:2},greenSport:{name:"Green sport",imageLocation:"./images/cars/green_sport.png",height:14,width:25,maxPower:5,acceleration:1,braking:.25,handling:10,handbrake:2},rocket:{name:"Rockewt",imageLocation:"./images/cars/rocket.png",height:14,width:25,maxPower:5,acceleration:1,braking:.25,handling:10,handbrake:2}}},{}],4:[function(t,e,i){const s=new EventTarget;e.exports=class{constructor(t){this.totalLaps=t.laps,this.waypoints=t.waypoints,this.reset()}respondToEvents(t,e={}){e.resetGame&&(this.power>0?this.angle-=this.steering:this.angle+=this.steering)}reset(){this.currentLap=0,this.raceStartTimestamp=null,this.lapStartTimestamp=null,this.raceFinishTimestamp=null,this.finalRaceTime=null,this.finalRaceTimeFormatted="0:00.000",this.lapTimes=[],this.formattedLapTimes=[],this.currentWaypointIndex=0}startLapTimer(){console.log("Game Lap timer started"),this.raceStartTimestamp=Date.now(),this.lapStartTimestamp=this.raceStartTimestamp}onWaypointTriggered(t){0!==this.currentLap||this.lapStartTimestamp?(t===this.currentWaypointIndex+1||0===t&&this.currentWaypointIndex===this.waypoints.length-1)&&(this.currentWaypointIndex=t,0===t&&(console.log("Completed full lap ",this.currentLap),this.onLapTriggered()),console.log("Triggered waypoint: ",t)):this.startLapTimer()}onLapTriggered(){if(this.lapStartTimestamp){const t=Date.now()-this.lapStartTimestamp;this.lapTimes.push(t);const e=this.getFormattedTime(t);if(this.formattedLapTimes.push(e),this.currentLap+=1,this.currentLap===this.totalLaps){if(this.finalRaceTime)return;console.log("Completed final lap!"),this.raceFinishTimestamp=Date.now(),this.finalRaceTime=this.raceFinishTimestamp-this.raceStartTimestamp,console.log("Final Race Time: ",this.finalRaceTimeFormatted=this.getFormattedTime(this.finalRaceTime)),this.raceStartTimestamp=null,this.lapStartTimestamp=null,s.dispatchEvent(new Event("raceFinished"))}else this.lapStartTimestamp=Date.now()}}getFormattedTime(t){if(t){const e=t/1e3,i=Math.floor(e/60),s=Math.floor(e%60),a=Math.floor(e%1*1e3);return`${i}:${String(s).padStart(2,"0")}.${String(a).padStart(3,"0")}`}return"0:00.000"}draw(t){t.canvas.context.save(),t.canvas.context.fillStyle="rgba(0,0,0, 1)",t.canvas.context.font="italic bold 60px Arial",t.canvas.context.fillText(`${Math.min(this.currentLap+1,this.totalLaps)}/${this.totalLaps}`,10,60),this.formattedLapTimes.length>0&&(t.canvas.context.fillStyle="rgba(255,255,255, 0.8)",t.canvas.context.beginPath(),t.canvas.context.roundRect(t.canvas.width-130,10,120,10+20*this.formattedLapTimes.length,10),t.canvas.context.fill()),t.canvas.context.fillStyle="rgb(0,0,0)",t.canvas.context.textAlign="right",t.canvas.context.font="italic 20px Arial";for(let e=0;e<this.formattedLapTimes.length;e++)t.canvas.context.fillText(`${e+1}: ${this.formattedLapTimes[e]}`,t.canvas.width-20,32+20*e);t.canvas.context.textAlign="center",this.finalRaceTime?(t.canvas.context.fillStyle="rgba(255,255,255, 0.8)",t.canvas.context.beginPath(),t.canvas.context.roundRect(t.canvas.width/2-150,t.canvas.height/2-190,300,160,10),t.canvas.context.fill(),t.canvas.context.fillStyle="rgba(0,0,0, 1)",t.canvas.context.font="italic 50px Arial",t.canvas.context.fillText("Total Time",t.canvas.width/2,t.canvas.height/2-120),t.canvas.context.font="italic bold 60px Arial",t.canvas.context.fillText(this.finalRaceTimeFormatted,t.canvas.width/2,t.canvas.height/2-60),t.canvas.context.fillStyle="rgba(255,255,255, 0.8)",t.canvas.context.beginPath(),t.canvas.context.roundRect(40,t.canvas.height-140,t.canvas.width-80,100,10),t.canvas.context.fill(),t.canvas.context.fillStyle="rgba(0,0,0, 1)",t.canvas.context.font="italic 30px Arial",t.canvas.context.fillText("Press 'R' to Restart",t.canvas.width/2,t.canvas.height-100),t.canvas.context.fillText("Press 'I' to Inscribe your time",t.canvas.width/2,t.canvas.height-60)):(t.canvas.context.font="30px Arial",t.canvas.context.fillText(this.getFormattedTime(this.raceStartTimestamp?Date.now()-this.raceStartTimestamp:0),t.canvas.width/2,30)),t.canvas.context.restore()}}},{}],5:[function(t,e,i){t("../lib/roundRect");const s=t("./tracks"),a=t("./cars"),n=t("../lib/canvas"),h=t("./track"),r=t("./player-car"),o=(t("./ai-car"),t("../lib/viewport")),c=t("./hud");e.exports=class{constructor(){this.tickInterval=60,this.cellWidth=10,this.cellHeight=10,this.timer=null,this.canvas=null,this.viewport=null,this.objects=[],this.keys={left:65,right:68,accelerate:87,brake:83,handbrake:32,resetGame:82,inscribeData:73},this.keysDown={left:!1,right:!1,accelerate:!1,brake:!1,handbrake:!1,resetGame:!1,inscribeData:!1},this.friction=.82}onKeydownListener(t){t.keyCode!==this.keys.accelerate&&t.keyCode!==this.keys.brake&&t.keyCode!==this.keys.left&&t.keyCode!==this.keys.right&&t.keyCode!==this.keys.handbrake&&t.keyCode!==this.keys.resetGame&&t.keyCode!==this.keys.inscribeData||t.preventDefault(),t.keyCode===this.keys.left&&(this.keysDown.left=!0),t.keyCode===this.keys.right&&(this.keysDown.right=!0),t.keyCode===this.keys.accelerate&&(this.keysDown.accelerate=!0),t.keyCode===this.keys.brake&&(this.keysDown.brake=!0),t.keyCode===this.keys.handbrake&&(this.keysDown.handbrake=!0),t.keyCode===this.keys.resetGame&&(this.keysDown.resetGame=!0),t.keyCode===this.keys.inscribeData&&(this.keysDown.inscribeData=!0)}onKeyupListener(t){t.keyCode!==this.keys.left&&t.keyCode!==this.keys.right&&t.keyCode!==this.keys.accelerate&&t.keyCode!==this.keys.brake&&t.keyCode!==this.keys.handbrake&&t.keyCode!==this.keys.resetGame&&t.keyCode!==this.keys.inscribeData||t.preventDefault(),t.keyCode===this.keys.left&&(this.keysDown.left=!1),t.keyCode===this.keys.right&&(this.keysDown.right=!1),t.keyCode===this.keys.accelerate&&(this.keysDown.accelerate=!1),t.keyCode===this.keys.brake&&(this.keysDown.brake=!1),t.keyCode===this.keys.handbrake&&(this.keysDown.handbrake=!1),t.keyCode===this.keys.resetGame&&(this.keysDown.resetGame=!1),t.keyCode===this.keys.inscribeData&&(this.keysDown.inscribeData=!1)}bindEvents(){document.addEventListener("keydown",this.onKeydownListener.bind(this)),document.addEventListener("keyup",this.onKeyupListener.bind(this))}tick(){this.canvas.clear(),this.objects.forEach((t=>t.draw(this))),this.track.quadtree.draw(this),this.viewport.draw(this),this.keysDown.resetGame&&this.reset()}reset(){clearInterval(this.timer),console.log("Game Reset"),document.removeEventListener("keydown",this.onKeydownListener),document.removeEventListener("keyup",this.onKeyupListener),this.objects=[],this.start()}start(){this.canvas=new n(document.getElementById("canvas")),this.track=new h(s.sand),this.hud=new c(s.sand),this.objects.push(this.track),this.objects.push(new r(Object.assign({},a.rocket,{x:this.track.startPositions[0].x,y:this.track.startPositions[0].y,angle:this.track.startAngle}))),this.objects.push(this.hud),this.viewport=new o({height:this.canvas.height,width:this.canvas.width,margin:0}),this.bindEvents(),this.timer=setInterval((()=>{this.tick()}),this.tickInterval)}onWaypointTriggered(t){this.hud.onWaypointTriggered(t)}}},{"../lib/canvas":9,"../lib/roundRect":11,"../lib/viewport":12,"./ai-car":1,"./cars":3,"./hud":4,"./player-car":6,"./track":7,"./tracks":8}],6:[function(t,e,i){const s=t("./car");e.exports=class extends s{draw(t){super.respondToEvents(t,t.keysDown),super.calculate(t),this.x-=this.vx,this.y-=this.vy,super.draw(t,t.viewport.centre.x+this.width/2,t.viewport.centre.y+this.height/2)}}},{"./car":2}],7:[function(t,e,i){const s=t("../lib/quadtree");e.exports=class{constructor(t){this.name=t.name,this.imageLocation=t.imageLocation,this.height=t.height,this.width=t.width,this.startPositions=t.startPositions,this.startAngle=t.startAngle,this.recordedPositions=t.recordedPositions,this.obstacles=t.obstacles,this.waypoints=t.waypoints;const e={x:0,y:0,width:t.width,height:t.height},i=new s(e,4);this.obstacles.forEach((t=>{i.insert(t)})),i.logNode(),this.quadtree=i,this.img=new Image,this.img.src=this.imageLocation}draw(t){t.canvas.context.save(),t.canvas.context.drawImage(this.img,t.viewport.x,t.viewport.y),t.canvas.context.fillStyle="rgba(0, 255, 0, 0.5)",t.canvas.context.strokeStyle="rgba(0, 255, 0, 0.5)",t.canvas.context.lineWidth=2,t.canvas.context.beginPath(),this.waypoints.forEach((e=>{t.canvas.context.roundRect(e.x+t.viewport.x,e.y+t.viewport.y,e.width,e.height,10)})),t.canvas.context.fill(),t.canvas.context.restore()}}},{"../lib/quadtree":10}],8:[function(t,e,i){e.exports={sand:{name:"Sand",imageLocation:"./images/tracks/sand.png",height:1760,width:1728,laps:3,waypoints:[{x:230,y:655,width:200,height:20,angle:270},{x:750,y:55,width:20,height:200,angle:0},{x:1500,y:555,width:200,height:20,angle:90},{x:800,y:1500,width:20,height:200,angle:180}],startPositions:[{x:28,y:-335}],startAngle:270,obstacles:[{x:0,y:0,width:1728,height:50},{x:0,y:0,width:50,height:1760},{x:1678,y:0,width:50,height:1760},{x:0,y:1710,width:1728,height:50}]},breakfast:{name:"Beach",imageLocation:"./images/tracks/beach.png",height:1760,width:1600,startPositions:[],startAngle:0},dinner:{name:"Dinner",imageLocation:"./images/tracks/dinner.png",height:2432,width:2405,startPositions:[],startAngle:0},diy:{name:"DIY",imageLocation:"./images/tracks/diy.png",height:1824,width:1440,startPositions:[],startAngle:0},picnic:{name:"Picnic",imageLocation:"./images/tracks/picnic.png",height:1472,width:2144,startPositions:[],startAngle:0}}},{}],9:[function(t,e,i){e.exports=class{constructor(t){this.elem=t,this.height=t.height,this.width=t.width,this.context=t.getContext("2d")}clear(){this.elem.height=this.elem.height,this.elem.width=this.elem.width}}},{}],10:[function(t,e,i){class s{constructor(t,e){this.boundary=t,this.capacity=e,this.objects=[],this.divided=!1}logNode(t="",e=0){console.log(`${"  ".repeat(e)}${t}: ${this.objects.length} objects`),this.divided&&(this.northwest.logNode("NW",e+1),this.northeast.logNode("NE",e+1),this.southwest.logNode("SW",e+1),this.southeast.logNode("SE",e+1))}subdivide(){const t=this.boundary.x,e=this.boundary.y,i=this.boundary.width/2,a=this.boundary.height/2;this.northwest=new s({x:t,y:e,width:i,height:a},this.capacity),this.northeast=new s({x:t+i,y:e,width:i,height:a},this.capacity),this.southwest=new s({x:t,y:e+a,width:i,height:a},this.capacity),this.southeast=new s({x:t+i,y:e+a,width:i,height:a},this.capacity),this.divided=!0}fitsWithin(t){return t.x>=this.boundary.x&&t.x+t.width<=this.boundary.x+this.boundary.width&&t.y>=this.boundary.y&&t.y+t.height<=this.boundary.y+this.boundary.height}insert(t){return this.fitsWithin(t)?this.objects.length<this.capacity&&!this.divided?(this.objects.push(t),!0):(this.divided||this.subdivide(),!!(this.northwest.insert(t)||this.northeast.insert(t)||this.southwest.insert(t)||this.southeast.insert(t))):(console.warn("Object does not fit within this quadtree node",t,this.boundary),!1)}query(t,e=[]){if(!a(this.boundary,t))return e;for(let i of this.objects)a(i,t)&&e.push(i);return this.divided&&(this.northwest.query(t,e),this.northeast.query(t,e),this.southwest.query(t,e),this.southeast.query(t,e)),e}drawNode(t,e){t.canvas.context.strokeRect(e.boundary.x+t.viewport.x,e.boundary.y+t.viewport.y,e.boundary.width,e.boundary.height),e.divided&&(drawNode(e.northwest),drawNode(e.northeast),drawNode(e.southwest),drawNode(e.southeast))}drawObjects(t,e){for(let i of e.objects)t.canvas.context.fillRect(i.x+t.viewport.x,i.y+t.viewport.y,i.width,i.height);e.divided&&(this.drawObjects(t,e.northwest),this.drawObjects(t,e.northeast),this.drawObjects(t,e.southwest),this.drawObjects(t,e.southeast))}draw(t){}}function a(t,e){return!(e.x>t.x+t.width||e.x+e.width<t.x||e.y>t.y+t.height||e.y+e.height<t.y)}e.exports=s},{}],11:[function(t,e,i){(()=>{"use strict";function t(t,i,s,a,n){if(![t,i,s,a].every((t=>Number.isFinite(t))))return;let h,r,o,c;if(4===(n=function(t){const e=typeof t;if("undefined"===e||null===t)return[0];if("function"===e)return[NaN];if("object"===e)return"function"==typeof t[Symbol.iterator]?[...t].map((t=>{const e=typeof t;return"undefined"===e||null===t?0:"function"===e?NaN:"object"===e?y(t):g(t)})):[y(t)];return[g(t)]}(n)).length)h=p(n[0]),r=p(n[1]),o=p(n[2]),c=p(n[3]);else if(3===n.length)h=p(n[0]),r=p(n[1]),c=p(n[1]),o=p(n[2]);else if(2===n.length)h=p(n[0]),o=p(n[0]),r=p(n[1]),c=p(n[1]);else{if(1!==n.length)throw new RangeError(`${e(this)} ${n.length} is not a valid size for radii sequence.`);h=p(n[0]),r=p(n[0]),o=p(n[0]),c=p(n[0])}const l=[h,r,o,c],d=l.find((({x:t,y:e})=>t<0||e<0));d?.x<0&&d.x;if(!l.some((({x:t,y:e})=>!Number.isFinite(t)||!Number.isFinite(e)))){if(d)throw new RangeError(`${e(this)} Radius value ${d} is negative.`);!function(t){const[e,i,n,h]=t,r=[Math.abs(s)/(e.x+i.x),Math.abs(a)/(i.y+n.y),Math.abs(s)/(n.x+h.x),Math.abs(a)/(e.y+h.y)],o=Math.min(...r);if(o<=1)for(const e of t)e.x*=o,e.y*=o}(l),s<0&&a<0?(this.moveTo(t-h.x,i),this.ellipse(t+s+r.x,i-r.y,r.x,r.y,0,1.5*-Math.PI,-Math.PI),this.ellipse(t+s+o.x,i+a+o.y,o.x,o.y,0,-Math.PI,-Math.PI/2),this.ellipse(t-c.x,i+a+c.y,c.x,c.y,0,-Math.PI/2,0),this.ellipse(t-h.x,i-h.y,h.x,h.y,0,0,-Math.PI/2)):s<0?(this.moveTo(t-h.x,i),this.ellipse(t+s+r.x,i+r.y,r.x,r.y,0,-Math.PI/2,-Math.PI,1),this.ellipse(t+s+o.x,i+a-o.y,o.x,o.y,0,-Math.PI,1.5*-Math.PI,1),this.ellipse(t-c.x,i+a-c.y,c.x,c.y,0,Math.PI/2,0,1),this.ellipse(t-h.x,i+h.y,h.x,h.y,0,0,-Math.PI/2,1)):a<0?(this.moveTo(t+h.x,i),this.ellipse(t+s-r.x,i-r.y,r.x,r.y,0,Math.PI/2,0,1),this.ellipse(t+s-o.x,i+a+o.y,o.x,o.y,0,0,-Math.PI/2,1),this.ellipse(t+c.x,i+a+c.y,c.x,c.y,0,-Math.PI/2,-Math.PI,1),this.ellipse(t+h.x,i-h.y,h.x,h.y,0,-Math.PI,1.5*-Math.PI,1)):(this.moveTo(t+h.x,i),this.ellipse(t+s-r.x,i+r.y,r.x,r.y,0,-Math.PI/2,0),this.ellipse(t+s-o.x,i+a-o.y,o.x,o.y,0,0,Math.PI/2),this.ellipse(t+c.x,i+a-c.y,c.x,c.y,0,Math.PI/2,Math.PI),this.ellipse(t+h.x,i+h.y,h.x,h.y,0,Math.PI,1.5*Math.PI)),this.closePath(),this.moveTo(t,i)}function y(t){const{x:e,y:i,z:s,w:a}=t;return{x:e,y:i,z:s,w:a}}function g(t){return+t}function p(t){const e=g(t);return Number.isFinite(e)?{x:e,y:e}:Object(t)===t?{x:g(t.x??0),y:g(t.y??0)}:{x:NaN,y:NaN}}}function e(t){return`Failed to execute 'roundRect' on '${function(t){return Object(t)===t&&t instanceof Path2D?"Path2D":t instanceof globalThis?.CanvasRenderingContext2D?"CanvasRenderingContext2D":t instanceof globalThis?.OffscreenCanvasRenderingContext2D?"OffscreenCanvasRenderingContext2D":t?.constructor.name||t}(t)}':`}Path2D.prototype.roundRect??=t,globalThis.CanvasRenderingContext2D&&(globalThis.CanvasRenderingContext2D.prototype.roundRect??=t),globalThis.OffscreenCanvasRenderingContext2D&&(globalThis.OffscreenCanvasRenderingContext2D.prototype.roundRect??=t)})()},{}],12:[function(t,e,i){const s=t("../game/player-car");e.exports=class{constructor(t){this.x=0,this.y=0,this.height=t.height,this.width=t.width,this.margin=t.margin,this.centre={x:this.width/2,y:this.height/2}}draw(t){const e=t.objects.find((t=>t instanceof s));e&&(this.x=e.x,this.y=e.y)}}},{"../game/player-car":6}],13:[function(t,e,i){const s=t("./game");document.addEventListener("DOMContentLoaded",(()=>{(new s).start()}))},{"./game":5}]},{},[13]);