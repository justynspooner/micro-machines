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
