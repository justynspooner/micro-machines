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
const tracks = require("./tracks");
const cars = require("./cars");
const Canvas = require("../lib/canvas");
const Track = require("./track");
const PlayerCar = require("./player-car");
const AICar = require("./ai-car");
const Viewport = require("../lib/viewport");

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
    };

    this.keysDown = {
      left: false,
      right: false,
      accelerate: false,
      brake: false,
      handbrake: false,
    };

    this.friction = 0.82;
  }

  bindEvents() {
    // keydown events

    document.addEventListener("keydown", (e) => {
      if (
        e.keyCode === this.keys.accelerate ||
        e.keyCode === this.keys.brake ||
        e.keyCode === this.keys.left ||
        e.keyCode === this.keys.right ||
        e.keyCode === this.keys.handbrake
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
    });

    // keyup events

    document.addEventListener("keyup", (e) => {
      if (
        e.keyCode === this.keys.left ||
        e.keyCode === this.keys.right ||
        e.keyCode === this.keys.accelerate ||
        e.keyCode === this.keys.brake ||
        e.keyCode === this.keys.handbrake
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
    });
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
  }

  start() {
    // create canvas object

    this.canvas = new Canvas(document.getElementById("canvas"));

    // add objects

    const track = new Track(tracks.sand);

    this.objects.push(track);

    this.track = track;

    this.objects.push(
      new PlayerCar(
        Object.assign({}, cars.rocket, {
          x: track.startPositions[0].x,
          y: track.startPositions[0].y,
          angle: track.startAngle,
        })
      )
    );

    this.objects.push(
      new AICar(
        Object.assign({}, cars.greenSport, {
          x: track.startPositions[1].x,
          y: track.startPositions[1].y,
          angle: track.startAngle,
          recordedPositions: track.recordedPositions[0],
        })
      )
    );

    // this.objects.push(
    //   new AICar(
    //     Object.assign({}, cars.greenSport, {
    //       x: track.startPositions[2].x,
    //       y: track.startPositions[2].y,
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
}

module.exports = Game;

},{"../lib/canvas":8,"../lib/viewport":10,"./ai-car":1,"./cars":3,"./player-car":5,"./track":6,"./tracks":7}],5:[function(require,module,exports){
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

},{"./car":2}],6:[function(require,module,exports){
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

    // Define the boundary of the entire quadtree
    const boundary = {
      x: 0,
      y: 0,
      width: opts.width,
      height: opts.height,
    };

    console.log("boundary", boundary);

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

    game.canvas.context.restore();
  }
}

module.exports = Track;

},{"../lib/quadtree":9}],7:[function(require,module,exports){
module.exports = {
  sand: {
    name: "Sand",
    imageLocation: "./images/tracks/sand.png",
    height: 1760,
    width: 1728,
    startPositions: [
      {
        x: 38,
        y: -467,
      },
      {
        x: 358,
        y: 741,
      },
      {
        x: 38,
        y: 741,
      },
    ],
    startAngle: -90,
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
    recordedPositions: [
      [
        {
          x: 38,
          y: -467,
          angle: -90,
        },
        {
          x: 38,
          y: -467,
          angle: -90,
        },
        {
          x: 38,
          y: -467,
          angle: -90,
        },
        {
          x: 38,
          y: -467,
          angle: -90,
        },
        {
          x: 38,
          y: -467,
          angle: -90,
        },
        {
          x: 38,
          y: -466.1948943129197,
          angle: -90,
        },
        {
          x: 38,
          y: -463.9364749722259,
          angle: -90,
        },
        {
          x: 38,
          y: -459.7028236656738,
          angle: -90,
        },
        {
          x: 38,
          y: -453.07364954810515,
          angle: -90,
        },
        {
          x: 38,
          y: -443.7104115138681,
          angle: -90,
        },
        {
          x: 38,
          y: -432.1454941857823,
          angle: -90,
        },
        {
          x: 38,
          y: -418.8073584066428,
          angle: -90,
        },
        {
          x: 38,
          y: -404.04079295864875,
          angle: -90,
        },
        {
          x: 38,
          y: -388.1232184136001,
          angle: -90,
        },
        {
          x: 38,
          y: -371.2778101621165,
          angle: -90,
        },
        {
          x: 38,
          y: -353.68405885793874,
          angle: -90,
        },
        {
          x: 38,
          y: -335.48626620377325,
          angle: -90,
        },
        {
          x: 38,
          y: -316.80037677315096,
          angle: -90,
        },
        {
          x: 38,
          y: -297.71946793570186,
          angle: -90,
        },
        {
          x: 38,
          y: -278.3181562394627,
          angle: -90,
        },
        {
          x: 38.699637663859214,
          y: -258.7165323146275,
          angle: -100,
        },
        {
          x: 40.64195444822556,
          y: -239.12997998192856,
          angle: -110,
        },
        {
          x: 44.2240478595038,
          y: -219.8445972225096,
          angle: -120,
        },
        {
          x: 49.7072868805794,
          y: -201.19424400590506,
          angle: -130,
        },
        {
          x: 56.72982833073868,
          y: -183.0422883156459,
          angle: -130,
        },
        {
          x: 65.0032830247696,
          y: -165.27557926247704,
          angle: -130,
        },
        {
          x: 74.29869895802125,
          y: -147.7996851648619,
          angle: -130,
        },
        {
          x: 83.85636498424826,
          y: -130.13056112785443,
          angle: -120,
        },
        {
          x: 92.66265793602366,
          y: -111.87263903992434,
          angle: -105,
        },
        {
          x: 99.8205998154442,
          y: -92.96810617312578,
          angle: -90,
        },
        {
          x: 104.59494654485765,
          y: -73.64374020660337,
          angle: -75,
        },
        {
          x: 106.44996002505857,
          y: -54.35055030383319,
          angle: -60,
        },
        {
          x: 105.07684465426749,
          y: -35.697714505289376,
          angle: -45,
        },
        {
          x: 100.4084746255309,
          y: -18.383131340663862,
          angle: -30,
        },
        {
          x: 92.62035095713487,
          y: -3.1244767373475657,
          angle: -15,
        },
        {
          x: 82.15337933834999,
          y: 9.364603663748143,
          angle: 0,
        },
        {
          x: 69.5194433299563,
          y: 19.566099242849944,
          angle: 0,
        },
        {
          x: 55.15146559674731,
          y: 27.878189139070255,
          angle: 0,
        },
        {
          x: 39.42293425109782,
          y: 34.62835006353226,
          angle: 0,
        },
        {
          x: 22.66318177445583,
          y: 40.0860944828072,
          angle: 0,
        },
        {
          x: 5.157670334018398,
          y: 44.47679733998165,
          angle: 0,
        },
        {
          x: -12.866562501268152,
          y: 47.99322711842583,
          angle: 0,
        },
        {
          x: -31.186041134428784,
          y: 51.49348552535022,
          angle: -10,
        },
        {
          x: -49.523593248222554,
          y: 55.64438802788682,
          angle: -20,
        },
        {
          x: -67.85140112247656,
          y: 60.30749229900197,
          angle: -20,
        },
        {
          x: -86.15531121789017,
          y: 65.37364353233993,
          angle: -20,
        },
        {
          x: -104.42896127632014,
          y: 70.75686446212528,
          angle: -20,
        },
        {
          x: -122.84823100562272,
          y: 75.72060728609942,
          angle: -10,
        },
        {
          x: -141.4343477480126,
          y: 79.65995743117035,
          angle: 0,
        },
        {
          x: -160.0833811534779,
          y: 82.09606293045374,
          angle: 10,
        },
        {
          x: -178.59386513493038,
          y: 82.6716578296493,
          angle: 20,
        },
        {
          x: -196.98519061125242,
          y: 81.772648250868,
          angle: 20,
        },
        {
          x: -215.27315925594627,
          y: 79.70613616015922,
          angle: 20,
        },
        {
          x: -233.47080839067934,
          y: 76.71630826789507,
          angle: 20,
        },
        {
          x: -251.76817247735747,
          y: 73.66322280735258,
          angle: 10,
        },
        {
          x: -270.198643740429,
          y: 71.24793652711601,
          angle: 0,
        },
        {
          x: -288.67008284898816,
          y: 70.02435466989569,
          angle: -10,
        },
        {
          x: -307.17077209359485,
          y: 69.74335793724745,
          angle: -10,
        },
        {
          x: -325.69224108086405,
          y: 70.20768027273037,
          angle: -10,
        },
        {
          x: -344.22838031252775,
          y: 71.26121162349509,
          angle: -10,
        },
        {
          x: -362.7747947236062,
          y: 72.78046626661923,
          angle: -10,
        },
        {
          x: -381.32833272836393,
          y: 74.6677962106419,
          angle: -10,
        },
        {
          x: -399.9462931111807,
          y: 76.15964147482345,
          angle: 0,
        },
        {
          x: -418.5533643020309,
          y: 76.65252446846483,
          angle: 10,
        },
        {
          x: -437.14982752868167,
          y: 76.35588188345396,
          angle: 10,
        },
        {
          x: -455.73577558841066,
          y: 75.43538861596903,
          angle: 10,
        },
        {
          x: -474.3112246047,
          y: 74.02209390156764,
          angle: 10,
        },
        {
          x: -492.8761804492114,
          y: 72.21964577518379,
          angle: 10,
        },
        {
          x: -511.43067544753876,
          y: 70.11000733431635,
          angle: 10,
        },
        {
          x: -529.9747859922568,
          y: 67.75798126547956,
          angle: 10,
        },
        {
          x: -548.5086382488194,
          y: 65.21479171852897,
          angle: 10,
        },
        {
          x: -567.0324067684624,
          y: 62.520920063748164,
          angle: 10,
        },
        {
          x: -585.6066259980075,
          y: 60.39385599872073,
          angle: 0,
        },
        {
          x: -604.2193596569828,
          y: 58.714458834707145,
          angle: 0,
        },
        {
          x: -622.8613774908092,
          y: 57.38859151524416,
          angle: 0,
        },
        {
          x: -641.5255466684653,
          y: 56.34188678252983,
          angle: 0,
        },
        {
          x: -660.2063597689828,
          y: 55.51560400300484,
          angle: 0,
        },
        {
          x: -678.8995687665054,
          y: 54.86335120141598,
          angle: 0,
        },
        {
          x: -697.6019012373898,
          y: 54.3484927560422,
          angle: 0,
        },
        {
          x: -716.3108403294879,
          y: 53.94210003889578,
          angle: 0,
        },
        {
          x: -735.0244541718312,
          y: 53.62133172667917,
          angle: 0,
        },
        {
          x: -753.7412636182614,
          y: 53.368153977554705,
          angle: 0,
        },
        {
          x: -772.4601397140614,
          y: 53.16832933728094,
          angle: 0,
        },
        {
          x: -791.180224210113,
          y: 53.01061806398074,
          angle: 0,
        },
        {
          x: -809.9008679495752,
          y: 52.886147320141646,
          angle: 0,
        },
        {
          x: -828.6215831150424,
          y: 52.78791299870251,
          angle: 0,
        },
        {
          x: -847.3420062254648,
          y: 52.710386328512435,
          angle: 0,
        },
        {
          x: -866.0618694706474,
          y: 52.64920324349508,
          angle: 0,
        },
        {
          x: -884.7809785125819,
          y: 52.60091911857735,
          angle: 0,
        },
        {
          x: -903.4991953025796,
          y: 52.562815127566246,
          angle: 0,
        },
        {
          x: -922.2164247885805,
          y: 52.532745365138396,
          angle: 0,
        },
        {
          x: -940.9326046393552,
          y: 52.50901615671623,
          angle: 0,
        },
        {
          x: -959.6476973080198,
          y: 52.49029078284197,
          angle: 0,
        },
        {
          x: -978.3616839090989,
          y: 52.47551426897044,
          angle: 0,
        },
        {
          x: -997.0745595011523,
          y: 52.46385401671452,
          angle: 0,
        },
        {
          x: -1015.7863294583756,
          y: 52.45465294124778,
          angle: 0,
        },
        {
          x: -1034.4970066855115,
          y: 52.44739248142081,
          angle: 0,
        },
        {
          x: -1053.206609485457,
          y: 52.44166340341067,
          angle: 0,
        },
        {
          x: -1071.9151599316854,
          y: 52.43714275640247,
          angle: 0,
        },
        {
          x: -1090.622682630769,
          y: 52.43357568439981,
          angle: 0,
        },
        {
          x: -1109.2690832683631,
          y: 51.74567867293242,
          angle: 10,
        },
        {
          x: -1127.556848613593,
          y: 49.535654051322915,
          angle: 25,
        },
        {
          x: -1145.0072235958896,
          y: 45.25632338338014,
          angle: 40,
        },
        {
          x: -1161.0363059486806,
          y: 38.649210357189126,
          angle: 55,
        },
        {
          x: -1175.0292573506458,
          y: 29.731191035729196,
          angle: 70,
        },
        {
          x: -1186.4094445329317,
          y: 18.768816760481556,
          angle: 85,
        },
        {
          x: -1194.699251107688,
          y: 6.240661879531963,
          angle: 100,
        },
        {
          x: -1200.5524717574583,
          y: -7.523487701399983,
          angle: 100,
        },
        {
          x: -1204.4846311038375,
          y: -22.26475807526988,
          angle: 100,
        },
        {
          x: -1206.901851868485,
          y: -37.77933336333902,
          angle: 100,
        },
        {
          x: -1208.8091979592402,
          y: -53.96668188833219,
          angle: 90,
        },
        {
          x: -1210.9996993923423,
          y: -70.62785102553694,
          angle: 80,
        },
        {
          x: -1213.414093668433,
          y: -87.66596569188661,
          angle: 80,
        },
        {
          x: -1216.0056772679068,
          y: -105.00470539064744,
          angle: 80,
        },
        {
          x: -1218.7376375199087,
          y: -122.58392828955661,
          angle: 80,
        },
        {
          x: -1221.5809522114823,
          y: -140.35622822597352,
          angle: 80,
        },
        {
          x: -1224.5127360360998,
          y: -158.28422559808237,
          angle: 80,
        },
        {
          x: -1227.5149387070544,
          y: -176.3384355335925,
          angle: 80,
        },
        {
          x: -1229.8872507599508,
          y: -194.55565338804917,
          angle: 90,
        },
        {
          x: -1231.0759691696685,
          y: -212.84497268075464,
          angle: 100,
        },
        {
          x: -1230.663828140525,
          y: -231.01629949621827,
          angle: 110,
        },
        {
          x: -1228.9859372308715,
          y: -249.0976574225187,
          angle: 110,
        },
        {
          x: -1226.3068250906367,
          y: -267.1111892745554,
          angle: 110,
        },
        {
          x: -1222.8353399772925,
          y: -285.0743992976705,
          angle: 110,
        },
        {
          x: -1218.7363971487089,
          y: -303.0011316911583,
          angle: 110,
        },
        {
          x: -1214.140242032692,
          y: -320.9023416282137,
          angle: 110,
        },
        {
          x: -1208.5246729450591,
          y: -338.49519389055433,
          angle: 120,
        },
        {
          x: -1201.536129386343,
          y: -355.4515298268073,
          angle: 130,
        },
        {
          x: -1192.9715632559473,
          y: -371.4191225276524,
          angle: 140,
        },
        {
          x: -1182.761866630843,
          y: -386.04130210868345,
          angle: 150,
        },
        {
          x: -1170.9560635245734,
          y: -398.97486929438134,
          angle: 160,
        },
        {
          x: -1157.7057182308638,
          y: -409.90615747181675,
          angle: 170,
        },
        {
          x: -1143.2492182776068,
          y: -418.5650712886749,
          angle: 180,
        },
        {
          x: -1127.8957619280634,
          y: -424.73692019752895,
          angle: 190,
        },
        {
          x: -1111.8301560934428,
          y: -428.93890251721047,
          angle: 190,
        },
        {
          x: -1095.138526313634,
          y: -432.2684024505168,
          angle: 180,
        },
        {
          x: -1078.0092831948039,
          y: -435.5948840226443,
          angle: 170,
        },
        {
          x: -1060.7100300049308,
          y: -439.58655915953835,
          angle: 160,
        },
        {
          x: -1043.2738918093562,
          y: -444.10598064922345,
          angle: 160,
        },
        {
          x: -1025.7269605595163,
          y: -449.04435728381776,
          angle: 160,
        },
        {
          x: -1008.0897718560049,
          y: -454.31558097038135,
          angle: 160,
        },
        {
          x: -990.3784713179432,
          y: -459.85149887081366,
          angle: 160,
        },
        {
          x: -972.605735679691,
          y: -465.598171409098,
          angle: 160,
        },
        {
          x: -954.7815001271623,
          y: -471.5129107375284,
          angle: 160,
        },
        {
          x: -936.9135326003092,
          y: -477.56193693996767,
          angle: 160,
        },
        {
          x: -919.0078872482494,
          y: -483.7185231155824,
          angle: 160,
        },
        {
          x: -901.0692624666182,
          y: -489.9615273335671,
          angle: 160,
        },
        {
          x: -883.3935355435335,
          y: -496.90124970456384,
          angle: 150,
        },
        {
          x: -866.3199227282146,
          y: -504.9622594996522,
          angle: 140,
        },
        {
          x: -850.2102250243219,
          y: -514.4047079403475,
          angle: 130,
        },
        {
          x: -835.7369165362323,
          y: -525.5034387636017,
          angle: 115,
        },
        {
          x: -823.5493080765334,
          y: -538.2322210652413,
          angle: 100,
        },
        {
          x: -814.2114359807292,
          y: -552.3041943672187,
          angle: 85,
        },
        {
          x: -808.1493033234933,
          y: -567.2219035997564,
          angle: 70,
        },
        {
          x: -805.6102618393237,
          y: -582.3353044029254,
          angle: 55,
        },
        {
          x: -806.4024608620704,
          y: -597.1609744523541,
          angle: 45,
        },
        {
          x: -809.843345362443,
          y: -611.7595606265389,
          angle: 45,
        },
        {
          x: -815.390666085952,
          y: -626.1789624261955,
          angle: 45,
        },
        {
          x: -822.6134993070576,
          y: -640.4570183224965,
          angle: 45,
        },
        {
          x: -831.614738843156,
          y: -654.0925196323586,
          angle: 35,
        },
        {
          x: -842.3771685356908,
          y: -666.6171553657648,
          angle: 25,
        },
        {
          x: -854.7773634061678,
          y: -677.6070418642527,
          angle: 15,
        },
        {
          x: -868.6000921740756,
          y: -686.6935352427116,
          angle: 5,
        },
        {
          x: -883.5533697748293,
          y: -693.5728474148091,
          angle: -5,
        },
        {
          x: -899.4046055123065,
          y: -698.696589829983,
          angle: -5,
        },
        {
          x: -915.9686342159367,
          y: -703.1170555880867,
          angle: 5,
        },
        {
          x: -932.9778466063838,
          y: -707.6604666418584,
          angle: 15,
        },
        {
          x: -950.1029277858391,
          y: -712.9524428410817,
          angle: 25,
        },
        {
          x: -967.3191420712238,
          y: -718.8391984077102,
          angle: 25,
        },
        {
          x: -984.6069002043483,
          y: -725.1984492452623,
          angle: 25,
        },
        {
          x: -1001.9506936242163,
          y: -731.9329719710438,
          angle: 25,
        },
        {
          x: -1019.338248795007,
          y: -738.9654766506331,
          angle: 25,
        },
        {
          x: -1036.7598563348026,
          y: -746.2345263319402,
          angle: 25,
        },
        {
          x: -1054.2078389323888,
          y: -753.6912903501815,
          angle: 25,
        },
        {
          x: -1071.6761294178543,
          y: -761.2969614975591,
          angle: 25,
        },
        {
          x: -1089.1599362343668,
          y: -769.0207016242989,
          angle: 25,
        },
        {
          x: -1106.3093040139527,
          y: -777.4379060117342,
          angle: 35,
        },
        {
          x: -1122.7474770349893,
          y: -786.9366787460087,
          angle: 45,
        },
        {
          x: -1138.0899558146957,
          y: -797.7402236029086,
          angle: 55,
        },
        {
          x: -1151.9621704931146,
          y: -809.9272546421622,
          angle: 65,
        },
        {
          x: -1164.666385871601,
          y: -823.214226686779,
          angle: 65,
        },
        {
          x: -1176.4428610502894,
          y: -837.3759941864162,
          angle: 65,
        },
        {
          x: -1187.4825514911233,
          y: -852.2337880954914,
          angle: 65,
        },
        {
          x: -1197.937217613978,
          y: -867.6456610431094,
          angle: 65,
        },
        {
          x: -1207.9274655665358,
          y: -883.4988974549514,
          angle: 65,
        },
        {
          x: -1217.5491409037093,
          y: -899.7039864784457,
          angle: 65,
        },
        {
          x: -1226.2273521267912,
          y: -916.4269219888862,
          angle: 75,
        },
        {
          x: -1233.473694481603,
          y: -933.6832450865027,
          angle: 85,
        },
        {
          x: -1239.5821102083753,
          y: -951.3651653514145,
          angle: 85,
        },
        {
          x: -1244.786175049281,
          y: -969.3871189558826,
          angle: 85,
        },
        {
          x: -1249.2715008451046,
          y: -987.6811764556459,
          angle: 85,
        },
        {
          x: -1253.1855915369836,
          y: -1006.1933990623821,
          angle: 85,
        },
        {
          x: -1255.9524097491392,
          y: -1024.8810277834293,
          angle: 95,
        },
        {
          x: -1257.1240109707749,
          y: -1043.589806202312,
          angle: 105,
        },
        {
          x: -1257.0265519361471,
          y: -1062.3175022847745,
          angle: 105,
        },
        {
          x: -1255.9192722865785,
          y: -1081.0624032597473,
          angle: 105,
        },
        {
          x: -1254.0082400383471,
          y: -1099.823192230164,
          angle: 105,
        },
        {
          x: -1250.8054241951816,
          y: -1118.3616480665175,
          angle: 115,
        },
        {
          x: -1245.9731273304546,
          y: -1136.378563228935,
          angle: 125,
        },
        {
          x: -1239.8429739392175,
          y: -1153.9825814180494,
          angle: 125,
        },
        {
          x: -1232.67865816233,
          y: -1171.2601375646775,
          angle: 125,
        },
        {
          x: -1224.689880499205,
          y: -1188.2800043069471,
          angle: 125,
        },
        {
          x: -1216.0434222621577,
          y: -1205.0969064941262,
          angle: 125,
        },
        {
          x: -1206.8719457914212,
          y: -1221.7543948299713,
          angle: 125,
        },
        {
          x: -1197.280987769662,
          y: -1238.287130623743,
          angle: 125,
        },
        {
          x: -1187.3545169788913,
          y: -1254.7227024592994,
          angle: 125,
        },
        {
          x: -1177.1593515207794,
          y: -1271.0830708066512,
          angle: 125,
        },
        {
          x: -1166.2165708861887,
          y: -1286.939254684296,
          angle: 135,
        },
        {
          x: -1154.0430610210678,
          y: -1301.570338076533,
          angle: 150,
        },
        {
          x: -1140.4886359379475,
          y: -1314.2654434069777,
          angle: 165,
        },
        {
          x: -1125.6956877206812,
          y: -1324.3869122708584,
          angle: 180,
        },
        {
          x: -1110.0493007997552,
          y: -1331.425564787652,
          angle: 195,
        },
        {
          x: -1094.1190665653005,
          y: -1335.0449048746677,
          angle: 210,
        },
        {
          x: -1078.5948287044846,
          y: -1335.1117415430158,
          angle: 225,
        },
        {
          x: -1064.2193548658413,
          y: -1331.711496862798,
          angle: 240,
        },
        {
          x: -1051.3895910584374,
          y: -1325.2520130775736,
          angle: 250,
        },
        {
          x: -1039.7924217565871,
          y: -1316.3523016035988,
          angle: 250,
        },
        {
          x: -1029.1782952679569,
          y: -1305.5061442186557,
          angle: 250,
        },
        {
          x: -1019.3482884828421,
          y: -1293.1074986620035,
          angle: 250,
        },
        {
          x: -1010.1438172733921,
          y: -1279.470724099254,
          angle: 250,
        },
        {
          x: -1000.8083676554766,
          y: -1265.1403796091656,
          angle: 240,
        },
        {
          x: -990.7990966364617,
          y: -1250.6556861046756,
          angle: 230,
        },
        {
          x: -979.7608369858597,
          y: -1236.5394112361032,
          angle: 220,
        },
        {
          x: -967.9017769556349,
          y: -1222.716881325596,
          angle: 220,
        },
        {
          x: -955.3878908142187,
          y: -1209.128470017178,
          angle: 220,
        },
        {
          x: -942.3514890053622,
          y: -1195.7265656266745,
          angle: 220,
        },
        {
          x: -928.8980392673103,
          y: -1182.4731486545793,
          angle: 220,
        },
        {
          x: -914.7127548322534,
          y: -1169.9072456516533,
          angle: 210,
        },
        {
          x: -899.6492314380223,
          y: -1158.5193092496409,
          angle: 200,
        },
        {
          x: -883.8842707561405,
          y: -1148.0704588668912,
          angle: 200,
        },
        {
          x: -867.5587023324246,
          y: -1138.3701374440827,
          angle: 200,
        },
        {
          x: -850.7846879739628,
          y: -1129.2663371310296,
          angle: 200,
        },
        {
          x: -833.4714497761332,
          y: -1121.3094792666236,
          angle: 190,
        },
        {
          x: -815.6655843797371,
          y: -1114.9599418818773,
          angle: 180,
        },
        {
          x: -797.5251467413633,
          y: -1110.585391221026,
          angle: 170,
        },
        {
          x: -779.115363601525,
          y: -1107.7866976194873,
          angle: 170,
        },
        {
          x: -760.668074442124,
          y: -1106.9176750414447,
          angle: 160,
        },
        {
          x: -742.4821492990401,
          y: -1108.2198786396739,
          angle: 150,
        },
        {
          x: -724.9012412857782,
          y: -1111.826225816194,
          angle: 140,
        },
        {
          x: -708.2928811233417,
          y: -1117.7656409227434,
          angle: 130,
        },
        {
          x: -693.0289769982223,
          y: -1125.969029653097,
          angle: 120,
        },
        {
          x: -679.4678522104631,
          y: -1136.2767693025858,
          angle: 110,
        },
        {
          x: -667.2652376523763,
          y: -1148.267614970332,
          angle: 110,
        },
        {
          x: -656.1464630949787,
          y: -1161.6053896668577,
          angle: 110,
        },
        {
          x: -645.8923511050674,
          y: -1176.0217432701227,
          angle: 110,
        },
        {
          x: -635.696471244269,
          y: -1191.00803666223,
          angle: 120,
        },
        {
          x: -624.9747675546687,
          y: -1206.0526186380707,
          angle: 130,
        },
        {
          x: -613.3380742343404,
          y: -1220.6533525470916,
          angle: 140,
        },
        {
          x: -600.9677201670238,
          y: -1234.9014293013067,
          angle: 140,
        },
        {
          x: -588.008496931838,
          y: -1248.869706973153,
          angle: 140,
        },
        {
          x: -574.5760393563681,
          y: -1262.616401847133,
          angle: 140,
        },
        {
          x: -560.7627130897702,
          y: -1276.1880349354417,
          angle: 140,
        },
        {
          x: -546.242206050281,
          y: -1289.0504298567612,
          angle: 150,
        },
        {
          x: -530.8583781928687,
          y: -1300.7149864211435,
          angle: 160,
        },
        {
          x: -514.6002218092965,
          y: -1310.7485455683372,
          angle: 170,
        },
        {
          x: -497.57844847766034,
          y: -1318.7825898396964,
          angle: 180,
        },
        {
          x: -480.07883492605174,
          y: -1324.180252706376,
          angle: 195,
        },
        {
          x: -462.59392963154824,
          y: -1326.5011855015046,
          angle: 210,
        },
        {
          x: -445.754964215093,
          y: -1325.528197929523,
          angle: 225,
        },
        {
          x: -430.26120528065996,
          y: -1321.2795125782775,
          angle: 240,
        },
        {
          x: -416.8101129471368,
          y: -1314.0056081723894,
          angle: 255,
        },
        {
          x: -406.03192448113015,
          y: -1304.1706853556964,
          angle: 270,
        },
        {
          x: -397.3951741974638,
          y: -1292.2832031271812,
          angle: 270,
        },
        {
          x: -390.4742580497258,
          y: -1278.7507002052193,
          angle: 270,
        },
        {
          x: -384.23246348478466,
          y: -1263.96066053133,
          angle: 260,
        },
        {
          x: -377.86016594456225,
          y: -1248.3434354653075,
          angle: 250,
        },
        {
          x: -370.7501376764122,
          y: -1232.3581468119758,
          angle: 240,
        },
        {
          x: -362.4764828515953,
          y: -1216.4779422394786,
          angle: 230,
        },
        {
          x: -352.7758867969253,
          y: -1201.1750302917217,
          angle: 220,
        },
        {
          x: -341.9309556182118,
          y: -1186.3338019310877,
          angle: 220,
        },
        {
          x: -330.16792710011094,
          y: -1171.8614872872572,
          angle: 220,
        },
        {
          x: -317.66789185804987,
          y: -1157.6836365152208,
          angle: 220,
        },
        {
          x: -304.5757862769085,
          y: -1143.7404922584383,
          angle: 220,
        },
        {
          x: -290.60667839570607,
          y: -1130.5564152631437,
          angle: 210,
        },
        {
          x: -275.6371310134262,
          y: -1118.6127564359558,
          angle: 200,
        },
        {
          x: -259.6820919414063,
          y: -1108.337366215511,
          angle: 190,
        },
        {
          x: -242.87298065310267,
          y: -1100.0949488593524,
          angle: 180,
        },
        {
          x: -225.43657757648754,
          y: -1094.1786820993404,
          angle: 170,
        },
        {
          x: -207.6744979097659,
          y: -1090.803452461869,
          angle: 160,
        },
        {
          x: -189.9431711130581,
          y: -1090.1009883330025,
          angle: 150,
        },
        {
          x: -172.634357903878,
          y: -1092.1171066057989,
          angle: 140,
        },
        {
          x: -156.1563248329083,
          y: -1096.811223427788,
          angle: 130,
        },
        {
          x: -140.91586645370842,
          y: -1104.0582132579166,
          angle: 120,
        },
        {
          x: -127.30141850623693,
          y: -1113.652631132884,
          angle: 110,
        },
        {
          x: -116.01498957862262,
          y: -1125.3609204512486,
          angle: 95,
        },
        {
          x: -107.64532998187865,
          y: -1138.722833658688,
          angle: 80,
        },
        {
          x: -102.61869244264595,
          y: -1153.0987493533187,
          angle: 65,
        },
        {
          x: -100.27782307500603,
          y: -1168.2898181955434,
          angle: 65,
        },
        {
          x: -100.09481437079786,
          y: -1184.1359840194286,
          angle: 65,
        },
        {
          x: -101.64553351130681,
          y: -1200.508390431428,
          angle: 65,
        },
        {
          x: -103.93116784826053,
          y: -1217.5429291451726,
          angle: 75,
        },
        {
          x: -106.11764292103487,
          y: -1235.230934513049,
          angle: 85,
        },
        {
          x: -107.176764963662,
          y: -1253.3983547277137,
          angle: 100,
        },
        {
          x: -106.3299403655809,
          y: -1271.636113244608,
          angle: 115,
        },
        {
          x: -103.0671047356709,
          y: -1289.3678055600772,
          angle: 130,
        },
        {
          x: -97.15401147400638,
          y: -1305.9208555730447,
          angle: 145,
        },
        {
          x: -88.6261465583564,
          y: -1320.5978432825125,
          angle: 160,
        },
        {
          x: -77.76868447055506,
          y: -1332.744430838668,
          angle: 175,
        },
        {
          x: -65.08302238111013,
          y: -1341.8103172894896,
          angle: 190,
        },
        {
          x: -51.24147229621654,
          y: -1347.3999286352578,
          angle: 205,
        },
        {
          x: -37.032600726136764,
          y: -1349.3100730282665,
          angle: 220,
        },
        {
          x: -23.30043317794018,
          y: -1347.5525233681708,
          angle: 235,
        },
        {
          x: -10.881244613956083,
          y: -1342.3603819992404,
          angle: 250,
        },
        {
          x: 0.4831746557297123,
          y: -1334.405206489143,
          angle: 250,
        },
        {
          x: 11.000248019652323,
          y: -1324.2266878312048,
          angle: 250,
        },
        {
          x: 20.836635596323497,
          y: -1312.2586110199352,
          angle: 250,
        },
        {
          x: 30.126269608992715,
          y: -1298.8496807775177,
          angle: 250,
        },
        {
          x: 38.976799577104856,
          y: -1284.280236022692,
          angle: 250,
        },
        {
          x: 48.110452452516185,
          y: -1269.0719480784026,
          angle: 240,
        },
        {
          x: 58.04748878517711,
          y: -1253.7502251329838,
          angle: 230,
        },
        {
          x: 69.1283804169903,
          y: -1238.831376178635,
          angle: 220,
        },
        {
          x: 81.13151998800795,
          y: -1224.234856063959,
          angle: 220,
        },
        {
          x: 93.87886536100315,
          y: -1209.895762161084,
          angle: 220,
        },
        {
          x: 107.22738440798116,
          y: -1195.7617838146157,
          angle: 220,
        },
        {
          x: 121.06217801715842,
          y: -1181.7907460532163,
          angle: 220,
        },
        {
          x: 134.79447182989207,
          y: -1167.4523109631298,
          angle: 230,
        },
        {
          x: 147.87119485223533,
          y: -1152.4129321334162,
          angle: 240,
        },
        {
          x: 159.78520988982268,
          y: -1136.50979094785,
          angle: 250,
        },
        {
          x: 169.73695663303437,
          y: -1119.6808928790315,
          angle: 265,
        },
        {
          x: 177.05741366815923,
          y: -1102.15005819644,
          angle: 280,
        },
        {
          x: 181.25436186799993,
          y: -1084.3685840108415,
          angle: 295,
        },
        {
          x: 182.04665849603262,
          y: -1066.9497667583382,
          angle: 310,
        },
        {
          x: 179.38412146831269,
          y: -1050.599022490518,
          angle: 325,
        },
        {
          x: 173.58609117836076,
          y: -1035.7181846326184,
          angle: 335,
        },
        {
          x: 165.26168673502846,
          y: -1022.0230985761817,
          angle: 335,
        },
        {
          x: 154.90242856307458,
          y: -1009.2849442663862,
          angle: 335,
        },
        {
          x: 142.90505039156685,
          y: -997.3194323652349,
          angle: 335,
        },
        {
          x: 129.94080973413452,
          y: -985.3700110676746,
          angle: 325,
        },
        {
          x: 116.65096104022922,
          y: -972.8975551019275,
          angle: 315,
        },
        {
          x: 103.63850994400676,
          y: -959.5545241685284,
          angle: 305,
        },
        {
          x: 91.45898107059541,
          y: -945.1613980256069,
          angle: 295,
        },
        {
          x: 80.95373969874701,
          y: -929.6084350531057,
          angle: 280,
        },
        {
          x: 72.84711534916477,
          y: -913.0771746497181,
          angle: 265,
        },
        {
          x: 67.36281670971456,
          y: -895.8809916639567,
          angle: 255,
        },
        {
          x: 63.989645556208174,
          y: -878.1499111586082,
          angle: 255,
        },
        {
          x: 62.31595953843628,
          y: -859.9882154929047,
          angle: 255,
        },
        {
          x: 61.31941865112091,
          y: -841.3578899583671,
          angle: 265,
        },
        {
          x: 60.16636832195856,
          y: -822.3502494201134,
          angle: 275,
        },
        {
          x: 58.196382831027464,
          y: -803.1609227766656,
          angle: 285,
        },
        {
          x: 54.90956650528826,
          y: -784.0659774522262,
          angle: 295,
        },
        {
          x: 50.56295305243529,
          y: -765.0480235762255,
          angle: 295,
        },
        {
          x: 45.36362633632534,
          y: -746.0933636275679,
          angle: 295,
        },
        {
          x: 40.13752778697784,
          y: -726.9510624223996,
          angle: 285,
        },
        {
          x: 35.580949907987254,
          y: -707.5370810272959,
          angle: 275,
        },
        {
          x: 32.2647275784227,
          y: -687.9051866116727,
          angle: 265,
        },
        {
          x: 29.946734494370197,
          y: -668.0983564166542,
          angle: 265,
        },
        {
          x: 28.43206386635026,
          y: -648.150916439746,
          angle: 265,
        },
        {
          x: 27.563846470343382,
          y: -628.090257961616,
          angle: 265,
        },
        {
          x: 27.21584505697337,
          y: -607.938214040744,
          angle: 265,
        },
        {
          x: 27.286484733078535,
          y: -587.7121624074296,
          angle: 265,
        },
        {
          x: 26.992631691486814,
          y: -567.4262980142006,
          angle: 275,
        },
        {
          x: 25.714714210655107,
          y: -547.2143497538054,
          angle: 285,
        },
        {
          x: 23.644925701815506,
          y: -527.0625172994013,
          angle: 285,
        },
        {
          x: 21.125453968468996,
          y: -507.65949525167764,
          angle: 285,
        },
        {
          x: 18.397969532443454,
          y: -489.43362774138916,
          angle: 285,
        },
      ],
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

    game.canvas.context.save();

    // draw all quadtree nodes

    game.canvas.context.strokeStyle = "rgba(255, 0, 0, 0.8)";
    game.canvas.context.lineWidth = 5;

    this.drawNode(game, this);

    // draw all objects

    game.canvas.context.fillStyle = "rgba(255, 0, 0, 0.5)";
    game.canvas.context.strokeStyle = "rgba(255, 0, 0, 0.5)";
    game.canvas.context.lineWidth = 2;

    this.drawObjects(game, this);

    game.canvas.context.restore();
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

},{}],10:[function(require,module,exports){
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

},{"../game/player-car":5}],11:[function(require,module,exports){
const Game = require('./game');

document.addEventListener('DOMContentLoaded', () => {
  new Game().start();
});

},{"./game":4}]},{},[11]);
