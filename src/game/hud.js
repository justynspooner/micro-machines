const lapEventTarget = new EventTarget();

class Hud {
  constructor(opts) {
    this.totalLaps = opts.laps;
    this.waypoints = opts.waypoints;
    this.currentLap = 0;
    this.raceStartTimestamp = null;
    this.lapStartTimestamp = null;
    this.raceFinishTimestamp = null;
    this.lapTimes = [];
    this.formattedLapTimes = [];
    this.currentWaypoint = 0;
  }

  startLapTimer() {
    this.raceStartTimestamp = Date.now();
    this.lapStartTimestamp = this.raceStartTimestamp;
  }

  onWaypointTriggered(waypointIndex) {
    // If we're not on the next waypoint or on the last waypoint and the next waypoint is not the first, then ignore

    if (
      waypointIndex !== this.currentWaypoint + 1 &&
      !(
        waypointIndex === 0 &&
        this.currentWaypoint === this.waypoints.length - 1
      )
    ) {
      return;
    }

    this.currentWaypoint = waypointIndex;

    if (waypointIndex === 0) {
      console.log("Game Lap triggered");
      this.onLapTriggered();
    }

    console.log("Game Waypoint triggered: ", waypointIndex);
  }

  onLapTriggered() {
    if (this.lapStartTimestamp) {
      const lapTimeInSeconds = Date.now() - this.lapStartTimestamp / 1000;
      this.lapTimes.push(lapTimeInSeconds);

      // Format the time to 00:00.000
      const minutes = Math.floor(lapTimeInSeconds / 60);
      const seconds = Math.floor(lapTimeInSeconds % 60);
      const milliseconds = Math.floor((lapTimeInSeconds % 1) * 1000);
      const formattedTime = `${minutes}:${String(seconds).padStart(
        2,
        "0"
      )}.${String(milliseconds).padStart(3, "0")}`;

      this.formattedLapTimes.push(formattedTime);
      this.currentLap += 1;

      if (this.currentLap === this.totalLaps) {
        this.raceFinishTimestamp = Date.now();
        this.raceStartTimestamp = null;
        this.lapStartTimestamp = null;
        lapEventTarget.dispatchEvent(new Event("raceFinished"));
      } else {
        this.lapStartTimestamp = Date.now();
      }
    }
  }

  getRaceTotalTime() {
    const timeToUse = this.raceStartTimestamp || this.raceFinishTimestamp;
    if (timeToUse) {
      const totalTimeInSeconds = (Date.now() - timeToUse) / 1000;

      // Format the time to 00:00.000
      const minutes = Math.floor(totalTimeInSeconds / 60);
      const seconds = Math.floor(totalTimeInSeconds % 60);
      const milliseconds = Math.floor((totalTimeInSeconds % 1) * 1000);
      return `${minutes}:${String(seconds).padStart(2, "0")}.${String(
        milliseconds
      ).padStart(3, "0")}`;
    }
    return "00:00.000";
  }

  draw(game) {
    game.canvas.context.save();

    // Draw the lap counter in the top left
    game.canvas.context.fillStyle = "rgba(0,0,0, 0.8)";
    game.canvas.context.font = "20px Arial";
    game.canvas.context.fillText(
      `Lap: ${this.currentLap + 1}/${this.totalLaps}`,
      10,
      20
    );

    // Draw the lap times one after the other aligned top right of the viewport

    game.canvas.context.textAlign = "right";
    game.canvas.context.fillText(
      `Lap times: ${this.lapTimes.join("\n")}`,
      game.canvas.width - 10,
      20
    );

    // Draw the current total time in the center top of the viewport
    game.canvas.context.textAlign = "center";
    game.canvas.context.fillText(
      `Total time: ${this.getRaceTotalTime()}`,
      game.canvas.width / 2,
      20
    );

    game.canvas.context.restore();
  }
}
module.exports = Hud;
