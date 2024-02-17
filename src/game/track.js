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
