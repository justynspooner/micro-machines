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
