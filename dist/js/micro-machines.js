(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Car = require("./car");

class AICar extends Car {
  constructor(opts) {
    super(opts);

    this.recordedPositions = opts.recordedPositions;
    this.recordedPositionIndex = 0;
  }

  draw(game) {
    const recordedPosition = this.recordedPositions[this.recordedPositionIndex];

    this.x = (recordedPosition.x - game.viewport.width / 2) * -1;
    this.y = (recordedPosition.y - game.viewport.height / 2) * -1;
    this.angle = recordedPosition.angle;

    // draw

    super.draw(game, this.x + game.viewport.x, this.y + game.viewport.y);

    // increment position

    if (this.recordedPositionIndex === this.recordedPositions.length - 1) {
      this.recordedPositionIndex = 0;
    } else {
      this.recordedPositionIndex++;
    }
  }
}

module.exports = AICar;

},{"./car":2}],2:[function(require,module,exports){
/* global Image */

class Car {
  constructor(opts) {
    this.name = opts.name;

    this.height = opts.height;
    this.width = opts.width;

    this.acceleration = opts.acceleration;
    this.braking = opts.braking;
    this.handling = opts.handling;
    this.maxPower = opts.maxPower;
    this.handbrake = opts.handbrake;

    this.img = new Image();
    this.img.src = opts.imageLocation;

    this.x = opts.x;
    this.y = opts.y;
    this.prevX = 0;
    this.prevY = 0;
    this.angle = opts.angle;
    this.vx = 0;
    this.vy = 0;
    this.power = 0;
    this.steering = 0;
  }

  respondToEvents(game, keysDown = {}) {
    // steer left?

    if (keysDown.left) {
      if (this.power > 0) {
        this.angle -= this.steering;
      } else {
        this.angle += this.steering;
      }
    }

    // steer right?

    if (keysDown.right) {
      if (this.power > 0) {
        this.angle += this.steering;
      } else {
        this.angle -= this.steering;
      }
    }

    // accelerate?

    if (keysDown.accelerate && !keysDown.brake) {
      if (this.power < this.maxPower) {
        this.power += this.acceleration;
      }
    }

    // decelerate?

    if (
      (keysDown.accelerate && keysDown.brake) ||
      (!keysDown.accelerate && !keysDown.brake)
    ) {
      this.power *= game.friction;
    }

    // brake/reverse?

    if (keysDown.brake && !keysDown.accelerate) {
      if (this.power > this.maxPower * -1) {
        this.power -= this.braking;
      }
    }

    // handbrake

    if (keysDown.handbrake && !keysDown.left && !keysDown.right) {
      if (this.power > 0) {
        this.power -= this.handbrake;
      }

      // handbrake is not reverse

      if (this.power < 0) {
        this.power = 0;
      }
    }

    // decrease angle if i'm sliding left

    if (keysDown.handbrake && keysDown.left) {
      if (this.power > 0) {
        this.angle -= this.steering * 0.5;
      } else {
        this.angle += this.steering * 0.5;
      }
    }

    // increase angle if i'm sliding right

    if (keysDown.handbrake && keysDown.right) {
      if (this.power > 0) {
        this.angle += this.steering * 0.5;
      } else {
        this.angle -= this.steering * 0.5;
      }
    }

    // Round the angle to 360 degrees
    this.angle = (this.angle + 360) % 360;

    // Check for collision and deflect if necessary

    if (this.checkCollision(game)) {
      // if we're colliding, bounce off at the same angle we hit the wall

      this.x = this.prevX;
      this.y = this.prevY;
      this.vx *= -0.5;
      this.vy *= -0.5;

      // if we're going backwards, stop us

      if (this.power < 0) {
        this.power = 0;
      }
    }

    const waypointPassed = this.checkWaypoint(game);
    if (waypointPassed !== -1) {
      game.onWaypointTriggered(waypointPassed);
    }
  }

  checkWaypoint(game) {
    const carProjectedX = (this.x - game.viewport.width / 2) * -1;
    const carProjectedY = (this.y - game.viewport.height / 2) * -1;

    for (let i = 0; i < game.track.waypoints.length; i++) {
      const waypoint = game.track.waypoints[i];

      if (
        carProjectedX < waypoint.x + waypoint.width &&
        carProjectedX + this.width > waypoint.x &&
        carProjectedY < waypoint.y + waypoint.height &&
        carProjectedY + this.height > waypoint.y
      ) {
        // Check the angle of the car to see if it's facing the right way to the trigger
        const waypointAngle = waypoint.angle;
        const carAngle = this.angle;

        // Make sure we're going through the right way
        if (Math.abs(waypointAngle - carAngle) < 90) {
          return i;
        }
      }
    }
    return -1;
  }

  checkCollision(game) {
    const obstacles = game.track.obstacles;

    const carProjectedX = (this.x - game.viewport.width / 2) * -1;
    const carProjectedY = (this.y - game.viewport.height / 2) * -1;

    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];

      if (
        carProjectedX < obstacle.x + obstacle.width &&
        carProjectedX + this.width > obstacle.x &&
        carProjectedY < obstacle.y + obstacle.height &&
        carProjectedY + this.height > obstacle.y
      ) {
        return true;
      }

      // if (
      //   this.x < obstacle.x - game.viewport.width / 2 + obstacle.width &&
      //   this.x + this.width > obstacle.x - game.viewport.width / 2 &&
      //   this.y < obstacle.y - game.viewport.height / 2 + obstacle.height &&
      //   this.y + this.height > obstacle.y - game.viewport.height / 2
      // ) {
      //   return true;
      // }
    }
  }

  calculate(game) {
    // record prev x/y

    this.prevX = this.x;
    this.prevY = this.y;

    // get dx/dy

    const dx = Math.cos(this.angle * (Math.PI / 180));
    const dy = Math.sin(this.angle * (Math.PI / 180));

    // add power to velocity to get new point

    this.vx += dx * this.power;
    this.vy += dy * this.power;

    // apply friction with grip

    const grip =
      Math.abs(Math.atan2(this.y - this.vy, this.x - this.vx)) * 0.01;

    this.vx *= game.friction - grip;
    this.vy *= game.friction - grip;

    // turn quicker when going faster

    this.steering = this.handling * (Math.abs(this.power) / this.maxPower);
  }

  draw(game, x, y) {
    // save state

    game.canvas.context.save();

    // translate to centre & perform rotation

    game.canvas.context.translate(x, y);
    game.canvas.context.rotate(this.angle * (Math.PI / 180));

    // draw on middle of canvas

    game.canvas.context.drawImage(
      this.img,
      0 - this.width / 2,
      0 - this.height / 2
    );

    // restore state

    game.canvas.context.restore();
  }
}

module.exports = Car;

},{}],3:[function(require,module,exports){
module.exports = {
  yellowSport: {
    name: "Yellow sport",
    imageLocation: "./images/cars/yellow_sport.png",
    height: 14,
    width: 25,
    maxPower: 5,
    acceleration: 1,
    braking: 0.25,
    handling: 10,
    handbrake: 2,
  },
  greenSport: {
    name: "Green sport",
    imageLocation: "./images/cars/green_sport.png",
    height: 14,
    width: 25,
    maxPower: 5,
    acceleration: 1,
    braking: 0.25,
    handling: 10,
    handbrake: 2,
  },
  rocket: {
    name: "Rockewt",
    imageLocation: "./images/cars/rocket.png",
    height: 14,
    width: 25,
    maxPower: 5,
    acceleration: 1,
    braking: 0.25,
    handling: 10,
    handbrake: 2,
  },
};

},{}],4:[function(require,module,exports){
const lapEventTarget = new EventTarget();

class Hud {
  constructor(opts) {
    this.totalLaps = opts.laps;
    this.waypoints = opts.waypoints;
    this.reset();
  }

  respondToEvents(game, keysDown = {}) {
    // steer left?

    if (keysDown.resetGame) {
      if (this.power > 0) {
        this.angle -= this.steering;
      } else {
        this.angle += this.steering;
      }
    }
  }

  reset() {
    this.currentLap = 0;
    this.raceStartTimestamp = null;
    this.lapStartTimestamp = null;
    this.raceFinishTimestamp = null;
    this.finalRaceTime = null;
    this.finalRaceTimeFormatted = "0:00.000";
    this.lapTimes = [];
    this.formattedLapTimes = [];
    this.currentWaypointIndex = 0;
  }

  startLapTimer() {
    console.log("Game Lap timer started");
    this.raceStartTimestamp = Date.now();
    this.lapStartTimestamp = this.raceStartTimestamp;
  }

  onWaypointTriggered(waypointIndex) {
    // If we're not on the next waypoint or on the last waypoint and the next waypoint is not the first, then ignore

    // If we're on the first lap, then start the lap timer
    if (this.currentLap === 0 && !this.lapStartTimestamp) {
      this.startLapTimer();
      return;
    }

    if (
      waypointIndex !== this.currentWaypointIndex + 1 &&
      !(
        waypointIndex === 0 &&
        this.currentWaypointIndex === this.waypoints.length - 1
      )
    ) {
      return;
    }

    this.currentWaypointIndex = waypointIndex;

    if (waypointIndex === 0) {
      console.log("Completed full lap ", this.currentLap);
      this.onLapTriggered();
    }

    console.log("Triggered waypoint: ", waypointIndex);
  }

  onLapTriggered() {
    if (this.lapStartTimestamp) {
      const lapTimeInMilliseconds = Date.now() - this.lapStartTimestamp;
      this.lapTimes.push(lapTimeInMilliseconds);

      const formattedTime = this.getFormattedTime(lapTimeInMilliseconds);

      this.formattedLapTimes.push(formattedTime);
      this.currentLap += 1;

      if (this.currentLap === this.totalLaps) {
        if (this.finalRaceTime) {
          return;
        }
        console.log("Completed final lap!");
        this.raceFinishTimestamp = Date.now();
        this.finalRaceTime = this.raceFinishTimestamp - this.raceStartTimestamp;
        console.log(
          "Final Race Time: ",
          (this.finalRaceTimeFormatted = this.getFormattedTime(
            this.finalRaceTime
          ))
        );

        this.raceStartTimestamp = null;
        this.lapStartTimestamp = null;
        lapEventTarget.dispatchEvent(new Event("raceFinished"));
      } else {
        this.lapStartTimestamp = Date.now();
      }
    }
  }

  getFormattedTime(dateTime) {
    if (dateTime) {
      const totalTimeInSeconds = dateTime / 1000;

      // Format the time to 00:00.000
      const minutes = Math.floor(totalTimeInSeconds / 60);
      const seconds = Math.floor(totalTimeInSeconds % 60);
      const milliseconds = Math.floor((totalTimeInSeconds % 1) * 1000);
      return `${minutes}:${String(seconds).padStart(2, "0")}.${String(
        milliseconds
      ).padStart(3, "0")}`;
    }
    return "0:00.000";
  }

  draw(game) {
    game.canvas.context.save();

    // Draw the lap counter in the top left
    game.canvas.context.fillStyle = "rgba(0,0,0, 1)";
    game.canvas.context.font = "italic bold 60px Arial";
    game.canvas.context.fillText(
      `${Math.min(this.currentLap + 1, this.totalLaps)}/${this.totalLaps}`,
      10,
      60
    );

    // Draw the lap times one after the other aligned top right of the viewport

    // Add a white transparent background with corner radius to the following text
    if (this.formattedLapTimes.length > 0) {
      game.canvas.context.fillStyle = "rgba(255,255,255, 0.8)";
      game.canvas.context.beginPath();
      game.canvas.context.roundRect(
        game.canvas.width - 130,
        10,
        120,
        10 + 20 * this.formattedLapTimes.length,
        10
      );
      game.canvas.context.fill();
    }

    game.canvas.context.fillStyle = "rgb(0,0,0)";
    game.canvas.context.textAlign = "right";
    game.canvas.context.font = "italic 20px Arial";
    for (let i = 0; i < this.formattedLapTimes.length; i++) {
      game.canvas.context.fillText(
        `${i + 1}: ${this.formattedLapTimes[i]}`,
        game.canvas.width - 20,
        32 + 20 * i
      );
    }

    // Draw the current total time in the center top of the viewport
    game.canvas.context.textAlign = "center";

    if (this.finalRaceTime) {
      game.canvas.context.fillStyle = "rgba(255,255,255, 0.8)";
      game.canvas.context.beginPath();
      game.canvas.context.roundRect(
        game.canvas.width / 2 - 150,
        game.canvas.height / 2 - 190,
        300,
        160,
        10
      );
      game.canvas.context.fill();

      game.canvas.context.fillStyle = "rgba(0,0,0, 1)";
      game.canvas.context.font = "italic 50px Arial";
      game.canvas.context.fillText(
        "Total Time",
        game.canvas.width / 2,
        game.canvas.height / 2 - 120
      );

      game.canvas.context.font = "italic bold 60px Arial";
      game.canvas.context.fillText(
        this.finalRaceTimeFormatted,
        game.canvas.width / 2,
        game.canvas.height / 2 - 60
      );

      game.canvas.context.fillStyle = "rgba(255,255,255, 0.8)";
      game.canvas.context.beginPath();
      game.canvas.context.roundRect(
        40,
        game.canvas.height - 140,
        game.canvas.width - 80,
        100,
        10
      );
      game.canvas.context.fill();

      game.canvas.context.fillStyle = "rgba(0,0,0, 1)";

      game.canvas.context.font = "italic 30px Arial";
      game.canvas.context.fillText(
        "Press 'R' to Restart",
        game.canvas.width / 2,
        game.canvas.height - 100
      );

      // Press S to store time on leaderboard
      game.canvas.context.fillText(
        "Press 'I' to Inscribe your time",
        game.canvas.width / 2,
        game.canvas.height - 60
      );
    } else {
      game.canvas.context.font = "30px Arial";
      game.canvas.context.fillText(
        this.getFormattedTime(
          this.raceStartTimestamp ? Date.now() - this.raceStartTimestamp : 0
        ),
        game.canvas.width / 2,
        30
      );
    }

    game.canvas.context.restore();
  }
}
module.exports = Hud;

},{}],5:[function(require,module,exports){
const tracks = require("./tracks");
const cars = require("./cars");
const Canvas = require("../lib/canvas");
const Track = require("./track");
const PlayerCar = require("./player-car");
const AICar = require("./ai-car");
const Viewport = require("../lib/viewport");
const Hud = require("./hud");

class Game {
  constructor() {
    this.tickInterval = 60;
    this.cellWidth = 10;
    this.cellHeight = 10;

    this.timer = null;
    this.canvas = null;
    this.viewport = null;

    this.objects = [];

    this.keys = {
      left: 65,
      right: 68,
      accelerate: 87,
      brake: 83,
      handbrake: 32,
      // 'r' key to reset game
      resetGame: 82,
      // 'i' key to inscribe data to HCS
      inscribeData: 73,
    };

    this.keysDown = {
      left: false,
      right: false,
      accelerate: false,
      brake: false,
      handbrake: false,
      resetGame: false,
      inscribeData: false,
    };

    this.friction = 0.82;
  }

  onKeydownListener(e) {
    if (
      e.keyCode === this.keys.accelerate ||
      e.keyCode === this.keys.brake ||
      e.keyCode === this.keys.left ||
      e.keyCode === this.keys.right ||
      e.keyCode === this.keys.handbrake ||
      e.keyCode === this.keys.resetGame ||
      e.keyCode === this.keys.inscribeData
    ) {
      e.preventDefault();
    }

    // left

    if (e.keyCode === this.keys.left) {
      this.keysDown.left = true;
    }

    // right

    if (e.keyCode === this.keys.right) {
      this.keysDown.right = true;
    }

    // up

    if (e.keyCode === this.keys.accelerate) {
      this.keysDown.accelerate = true;
    }

    // down

    if (e.keyCode === this.keys.brake) {
      this.keysDown.brake = true;
    }

    // slide

    if (e.keyCode === this.keys.handbrake) {
      this.keysDown.handbrake = true;
    }

    // reset game

    if (e.keyCode === this.keys.resetGame) {
      this.keysDown.resetGame = true;
    }

    // inscribe data

    if (e.keyCode === this.keys.inscribeData) {
      this.keysDown.inscribeData = true;
    }
  }

  onKeyupListener(e) {
    if (
      e.keyCode === this.keys.left ||
      e.keyCode === this.keys.right ||
      e.keyCode === this.keys.accelerate ||
      e.keyCode === this.keys.brake ||
      e.keyCode === this.keys.handbrake ||
      e.keyCode === this.keys.resetGame ||
      e.keyCode === this.keys.inscribeData
    ) {
      e.preventDefault();
    }

    // left

    if (e.keyCode === this.keys.left) {
      this.keysDown.left = false;
    }

    // right

    if (e.keyCode === this.keys.right) {
      this.keysDown.right = false;
    }

    // up

    if (e.keyCode === this.keys.accelerate) {
      this.keysDown.accelerate = false;
    }

    // down

    if (e.keyCode === this.keys.brake) {
      this.keysDown.brake = false;
    }

    // slide

    if (e.keyCode === this.keys.handbrake) {
      this.keysDown.handbrake = false;
    }

    // reset game

    if (e.keyCode === this.keys.resetGame) {
      this.keysDown.resetGame = false;
    }

    // inscribe data

    if (e.keyCode === this.keys.inscribeData) {
      this.keysDown.inscribeData = false;
    }
  }

  bindEvents() {
    // keydown events

    document.addEventListener("keydown", this.onKeydownListener.bind(this));

    // keyup events

    document.addEventListener("keyup", this.onKeyupListener.bind(this));
  }

  tick() {
    // clear canvas

    this.canvas.clear();

    // draw objects

    this.objects.forEach((obj) => obj.draw(this));

    // draw quadtree

    this.track.quadtree.draw(this);

    // draw viewport

    this.viewport.draw(this);

    // Check for game reset
    if (this.keysDown.resetGame) {
      this.reset();
    }
  }

  reset() {
    // Clear timer

    clearInterval(this.timer);

    // Unbind events

    console.log("Game Reset");

    document.removeEventListener("keydown", this.onKeydownListener);
    document.removeEventListener("keyup", this.onKeyupListener);

    // Clear objects

    this.objects = [];

    // Restart game

    this.start();
  }

  start() {
    // create canvas object

    this.canvas = new Canvas(document.getElementById("canvas"));

    // add objects

    this.track = new Track(tracks.sand);

    this.hud = new Hud(tracks.sand);

    this.objects.push(this.track);

    this.objects.push(
      new PlayerCar(
        Object.assign({}, cars.rocket, {
          x: this.track.startPositions[0].x,
          y: this.track.startPositions[0].y,
          angle: this.track.startAngle,
        })
      )
    );

    this.objects.push(this.hud);

    // this.objects.push(
    //   new AICar(
    //     Object.assign({}, cars.greenSport, {
    //       x: track.startPositions[1].x,
    //       y: track.startPositions[1].y,
    //       angle: track.startAngle,
    //       recordedPositions: track.recordedPositions[0],
    //     })
    //   )
    // );

    // create viewport object

    this.viewport = new Viewport({
      height: this.canvas.height,
      width: this.canvas.width,
      margin: 0,
    });

    // bind events

    this.bindEvents();

    // run internal ticker

    this.timer = setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }

  onWaypointTriggered(waypointIndex) {
    this.hud.onWaypointTriggered(waypointIndex);
  }
}

module.exports = Game;

},{"../lib/canvas":9,"../lib/viewport":11,"./ai-car":1,"./cars":3,"./hud":4,"./player-car":6,"./track":7,"./tracks":8}],6:[function(require,module,exports){
const Car = require("./car");

class PlayerCar extends Car {
  draw(game) {
    super.respondToEvents(game, game.keysDown);
    super.calculate(game);

    // add velocity

    this.x -= this.vx;
    this.y -= this.vy;

    // draw

    super.draw(
      game,
      game.viewport.centre.x + this.width / 2,
      game.viewport.centre.y + this.height / 2
    );
  }
}

module.exports = PlayerCar;

},{"./car":2}],7:[function(require,module,exports){
/* global Image */
const Quadtree = require("../lib/quadtree");

class Track {
  constructor(opts) {
    this.name = opts.name;
    this.imageLocation = opts.imageLocation;
    this.height = opts.height;
    this.width = opts.width;
    this.startPositions = opts.startPositions;
    this.startAngle = opts.startAngle;
    this.recordedPositions = opts.recordedPositions;
    this.obstacles = opts.obstacles;
    this.waypoints = opts.waypoints;

    // Define the boundary of the entire quadtree
    const boundary = {
      x: 0,
      y: 0,
      width: opts.width,
      height: opts.height,
    };

    // Create the quadtree with a boundary and capacity
    const qt = new Quadtree(boundary, 4);

    // Insert objects into the quadtree
    this.obstacles.forEach((obstacle) => {
      qt.insert(obstacle);
    });

    qt.logNode();

    this.quadtree = qt;

    // image
    this.img = new Image();
    this.img.src = this.imageLocation;
  }

  draw(game) {
    game.canvas.context.save();

    game.canvas.context.drawImage(this.img, game.viewport.x, game.viewport.y);

    // draw obstacles

    // game.canvas.context.fillStyle = "rgba(0, 0, 255, 0.8)";
    // game.canvas.context.strokeStyle = "rgba(255, 0, 0, 0.5)";
    // game.canvas.context.lineWidth = 2;

    // console.log("game.viewport.x", game.viewport.x);
    // console.log("game.viewport.y", game.viewport.y);
    // console.log("game.canvas.width", game.canvas.width);
    // console.log("game.canvas.height", game.canvas.height);

    // Filter out obstacles that are not in the viewport
    // const visibleObstacles = this.quadtree.query({
    //   x: game.viewport.x,
    //   y: game.viewport.y,
    //   width: game.canvas.width,
    //   height: game.canvas.height,
    // });

    // visibleObstacles.forEach((obstacle) => {
    //   // Draw the rectangle
    //   game.canvas.context.fillRect(
    //     obstacle.x + game.viewport.x,
    //     obstacle.y + game.viewport.y,
    //     obstacle.width,
    //     obstacle.height
    //   );
    // });

    // Draw the waypoints
    game.canvas.context.fillStyle = "rgba(0, 255, 0, 0.5)";
    game.canvas.context.strokeStyle = "rgba(0, 255, 0, 0.5)";
    game.canvas.context.lineWidth = 2;
    game.canvas.context.beginPath();
    this.waypoints.forEach((waypoint) => {
      game.canvas.context.roundRect(
        waypoint.x + game.viewport.x,
        waypoint.y + game.viewport.y,
        waypoint.width,
        waypoint.height,
        10
      );
    });
    game.canvas.context.fill();

    game.canvas.context.restore();
  }
}

module.exports = Track;

},{"../lib/quadtree":10}],8:[function(require,module,exports){
module.exports = {
  sand: {
    name: "Sand",
    imageLocation: "./images/tracks/sand.png",
    height: 1760,
    width: 1728,
    laps: 3,
    waypoints: [
      {
        x: 230,
        y: 655,
        width: 200,
        height: 20,
        angle: 270,
      },
      // {
      //   x: 450,
      //   y: 655,
      //   width: 200,
      //   height: 20,
      //   angle: 90,
      // },
      {
        x: 750,
        y: 55,
        width: 20,
        height: 200,
        angle: 0,
      },
      {
        x: 1500,
        y: 555,
        width: 200,
        height: 20,
        angle: 90,
      },
    ],

    startPositions: [
      {
        x: 28,
        y: -335,
      },
    ],
    startAngle: 270,
    obstacles: [
      {
        x: 0,
        y: 0,
        width: 1728,
        height: 50,
      },
      {
        x: 0,
        y: 0,
        width: 50,
        height: 1760,
      },
      {
        x: 1678,
        y: 0,
        width: 50,
        height: 1760,
      },
      {
        x: 0,
        y: 1710,
        width: 1728,
        height: 50,
      },
    ],
  },
  breakfast: {
    name: "Beach",
    imageLocation: "./images/tracks/beach.png",
    height: 1760,
    width: 1600,
    startPositions: [],
    startAngle: 0,
  },
  dinner: {
    name: "Dinner",
    imageLocation: "./images/tracks/dinner.png",
    height: 2432,
    width: 2405,
    startPositions: [],
    startAngle: 0,
  },
  diy: {
    name: "DIY",
    imageLocation: "./images/tracks/diy.png",
    height: 1824,
    width: 1440,
    startPositions: [],
    startAngle: 0,
  },
  picnic: {
    name: "Picnic",
    imageLocation: "./images/tracks/picnic.png",
    height: 1472,
    width: 2144,
    startPositions: [],
    startAngle: 0,
  },
};

},{}],9:[function(require,module,exports){
class Canvas {
  constructor (elem) {
    this.elem = elem;
    this.height = elem.height;
    this.width = elem.width;
    this.context = elem.getContext('2d');
  }

  clear () {
    this.elem.height = this.elem.height;
    this.elem.width = this.elem.width;
  }
}

module.exports = Canvas;

},{}],10:[function(require,module,exports){
class Quadtree {
  constructor(boundary, capacity) {
    this.boundary = boundary; // An object with x, y, width, height representing the boundary of this node
    this.capacity = capacity; // Maximum number of objects a node can hold before subdividing
    this.objects = []; // Objects in this node
    this.divided = false; // Whether this node has been subdivided (has children)
  }

  logNode(quadrant = "", level = 0) {
    console.log(
      `${"  ".repeat(level)}${quadrant}: ${this.objects.length} objects`
    );
    if (this.divided) {
      this.northwest.logNode("NW", level + 1);
      this.northeast.logNode("NE", level + 1);
      this.southwest.logNode("SW", level + 1);
      this.southeast.logNode("SE", level + 1);
    }
  }

  // Method to subdivide the node into four children
  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    this.northwest = new Quadtree(
      { x: x, y: y, width: w, height: h },
      this.capacity
    );
    this.northeast = new Quadtree(
      { x: x + w, y: y, width: w, height: h },
      this.capacity
    );
    this.southwest = new Quadtree(
      { x: x, y: y + h, width: w, height: h },
      this.capacity
    );
    this.southeast = new Quadtree(
      { x: x + w, y: y + h, width: w, height: h },
      this.capacity
    );

    this.divided = true;
  }

  // Check if an object fits within this quadrant
  fitsWithin(boundary) {
    return (
      boundary.x >= this.boundary.x &&
      boundary.x + boundary.width <= this.boundary.x + this.boundary.width &&
      boundary.y >= this.boundary.y &&
      boundary.y + boundary.height <= this.boundary.y + this.boundary.height
    );
  }

  // Insert an object into the quadtree
  insert(object) {
    // If the object does not fit within this quad, don't insert it
    if (!this.fitsWithin(object)) {
      console.warn(
        "Object does not fit within this quadtree node",
        object,
        this.boundary
      );
      return false;
    }

    // If there is space in this quadtree and it hasn't been subdivided, add the object here
    if (this.objects.length < this.capacity && !this.divided) {
      this.objects.push(object);
      return true;
    }

    // Otherwise, subdivide and then add the object to whichever node will accept it
    if (!this.divided) {
      this.subdivide();
    }

    if (
      this.northwest.insert(object) ||
      this.northeast.insert(object) ||
      this.southwest.insert(object) ||
      this.southeast.insert(object)
    ) {
      return true;
    }

    // This case should not happen
    return false;
  }

  // Query the quadtree for objects that might collide with the given boundary
  query(range, found = []) {
    // If the range doesn't intersect this quad, return early
    if (!intersect(this.boundary, range)) {
      // console.log("No intersection", this.boundary, range);
      return found;
    }

    // Check objects in this quadtree node
    for (let obj of this.objects) {
      // console.log("Checking object", obj, range);
      if (intersect(obj, range)) {
        // console.log("Intersection found", obj);
        found.push(obj);
      }
    }

    // Recursively check children if this node is subdivided
    if (this.divided) {
      // console.log("Checking children", this.boundary, range);
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }

  drawNode(game, node) {
    game.canvas.context.strokeRect(
      node.boundary.x + game.viewport.x,
      node.boundary.y + game.viewport.y,
      node.boundary.width,
      node.boundary.height
    );

    if (node.divided) {
      drawNode(node.northwest);
      drawNode(node.northeast);
      drawNode(node.southwest);
      drawNode(node.southeast);
    }
  }

  drawObjects(game, node) {
    for (let obj of node.objects) {
      game.canvas.context.fillRect(
        obj.x + game.viewport.x,
        obj.y + game.viewport.y,
        obj.width,
        obj.height
      );
    }

    if (node.divided) {
      this.drawObjects(game, node.northwest);
      this.drawObjects(game, node.northeast);
      this.drawObjects(game, node.southwest);
      this.drawObjects(game, node.southeast);
    }
  }

  draw(game) {
    // save state
    // game.canvas.context.save();
    // // draw all quadtree nodes
    // game.canvas.context.strokeStyle = "rgba(255, 0, 0, 0.8)";
    // game.canvas.context.lineWidth = 5;
    // this.drawNode(game, this);
    // // draw all objects
    // game.canvas.context.fillStyle = "rgba(255, 0, 0, 0.5)";
    // game.canvas.context.strokeStyle = "rgba(255, 0, 0, 0.5)";
    // game.canvas.context.lineWidth = 2;
    // this.drawObjects(game, this);
    // game.canvas.context.restore();
  }
}

/*
{x: 0, y: 0, width: 1728, height: 50}
{x: 336.58759334881813, y: -362.76206316796146, width: 700, height: 500}
[Log] Intersection found – {x: 0, y: 0, width: 1728, …} (micro-machines.js, line 2581)
*/

// Helper function to check if two rectangles intersect
function intersect(rect1, rect2) {
  return !(
    rect2.x > rect1.x + rect1.width ||
    rect2.x + rect2.width < rect1.x ||
    rect2.y > rect1.y + rect1.height ||
    rect2.y + rect2.height < rect1.y
  );
}

module.exports = Quadtree;

},{}],11:[function(require,module,exports){
const PlayerCar = require("../game/player-car");

class Viewport {
  constructor(opts) {
    this.x = 0;
    this.y = 0;

    this.height = opts.height;
    this.width = opts.width;
    this.margin = opts.margin;

    this.centre = {
      x: this.width / 2,
      y: this.height / 2,
    };
  }

  draw(game) {
    // get player car

    const playerCar = game.objects.find((obj) => obj instanceof PlayerCar);

    // centre

    if (playerCar) {
      this.x = playerCar.x;
      this.y = playerCar.y;
    }
  }
}

module.exports = Viewport;

},{"../game/player-car":6}],12:[function(require,module,exports){
const Game = require('./game');

document.addEventListener('DOMContentLoaded', () => {
  new Game().start();
});

},{"./game":5}]},{},[12]);
