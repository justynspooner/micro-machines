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
