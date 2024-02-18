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
      console.log("Game Waypoint ignored: ", waypointIndex);
      return;
    }

    this.currentWaypointIndex = waypointIndex;

    if (waypointIndex === 0) {
      console.log("Game Lap triggered");
      this.onLapTriggered();
    }

    console.log("Game Waypoint triggered: ", waypointIndex);
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
        console.log("FINAL LAP FINISHED");
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
