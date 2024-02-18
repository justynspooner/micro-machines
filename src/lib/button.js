class Button {
  constructor(text, fillColor = "#ffffff", textColor = "#000000") {
    this.text = text;
    this.fillColor = fillColor;
    this.textColor = textColor;
  }

  draw(c) {
    c.fillStyle = this.fillColor;
    c.fillRect(this.x, this.y, this.width, this.height);

    c.fillStyle = this.textColor;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "25px arial";
    c.fillText(
      this.text,
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width
    );
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  inBounds(mouseX, mouseY) {
    return !(
      mouseX < this.x ||
      mouseX > this.x + this.width ||
      mouseY < this.y ||
      mouseY > this.y + this.height
    );
  }
}
