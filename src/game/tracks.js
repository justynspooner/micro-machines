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
