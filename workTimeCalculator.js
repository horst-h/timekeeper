class WorkTime {
  constructor(startTime, endTime, lunchBreak, workDuration) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.lunchBreak = lunchBreak;
    this.workDuration = workDuration;
  }

  calculateDuration() {
    if (!this.startTime) {
      throw new Error('Error: startTime must not be NULL');
    }

    let currentDate = new Date().toISOString().substring(0, 10); // YYYY-MM-DD format
    let adjustedStartTime = new Date(`${currentDate} ${this.startTime}`);
    let adjustedEndTime = this.endTime ? new Date(`${currentDate} ${this.endTime}`) : new Date();
    console.log(`adjustedEndTime: ${adjustedEndTime}`);

    if (this.lunchBreak === null) {
      let currentHour = new Date().getHours();
      this.lunchBreak = currentHour < 12 ? 0 : 30;
    }

    let durationInMilliseconds = adjustedEndTime - adjustedStartTime - this.lunchBreak * 60000;
    let finalDuration = new Date(durationInMilliseconds);

    // Convert duration to seconds for comparison
    let durationInSeconds = durationInMilliseconds / 1000;

    // TIME maximum and minimum in seconds
    let maxTimeInSeconds = 3020399; // 838 hours, 59 minutes, 59 seconds
    let minTimeInSeconds = -3020399;

    if (durationInSeconds > maxTimeInSeconds) {
      return new Date(maxTimeInSeconds * 1000).toISOString().substr(11, 5);
    } else if (durationInSeconds < minTimeInSeconds) {
      return new Date(minTimeInSeconds * 1000).toISOString().substr(11, 5);
    } else {
      return finalDuration.toISOString().substr(11, 5);
    }
  }
  // calculate the end time by adding the number of minutes to the start time and return the time in HH:MM format
  // consider the lunch break if the lunchbrake is null take a default value of 30 minutes
  calculateEndTime() {
    if (!this.startTime) {
      throw new Error('Error: startTime must not be NULL');
    }

    let currentDate = new Date().toISOString().substring(0, 10); // YYYY-MM-DD format
    let adjustedStartTime = new Date(`${currentDate} ${this.startTime}`);
    let adjustedEndTime = new Date(adjustedStartTime.getTime() + this.workDuration * 60000 + (this.lunchBreak ?? 30) * 60000);

    return adjustedEndTime.toISOString().substr(11, 5);
  }

  addMinutesToTime() {
    // Zerlege die Startzeit in Stunden und Minuten
    const [hours, minutes] = this.startTime.split(':').map(Number);

    // Erstelle ein Date-Objekt (das Datum ist hier nicht wichtig)
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);

    // Addiere die Minuten
    time.setMinutes(time.getMinutes() + this.workDuration + (this.lunchBreak ?? 30));

    // Formatierung der neuen Zeit in "HH:MM"
    const resultHours = time.getHours().toString().padStart(2, '0');
    const resultMinutes = time.getMinutes().toString().padStart(2, '0');

    return `${resultHours}:${resultMinutes}`;
}

}

function calculateTimeChunks(timeValue, numChunks) {
  // Split the timeValue (expected format "HH:MM") into hours and minutes
  const [hours, minutes] = timeValue.split(':').map(Number);

  // Calculate total minutes from hours and minutes
  const totalMinutes = hours * 60 + minutes;

  // Calculate the number of 15-minute chunks
  const timeChunks = Math.floor(totalMinutes / numChunks ?? 19.5);

  return timeChunks;
}


function displayWorkDuration() {
  const startTime = '10:00';
  // lunchbrake in minutes
  const lunchbrake = 35;
  // number of segments in the circle
  const maxChunks = 24;
  // time to work in minutes
  const workDurationMinutes = 468;
  const timeChunks = workDurationMinutes / maxChunks;
  try {
    let workTimeCalculator = new WorkTime(startTime, null, lunchbrake, workDurationMinutes);
    let workTime = workTimeCalculator.calculateDuration();
    // document.getElementById('output').textContent = workTime;
    let minuteChunks = calculateTimeChunks(workTime, timeChunks);

    // calculate the end time
    let endTime = workTimeCalculator.addMinutesToTime();
    console.log(`End Time: ${endTime}`);

    createSegmentedCircle({segments: maxChunks, actualCount: minuteChunks, text: workTime, ringThickness: 10, ringColor: 'green', textAbove: `Start: ${startTime}`, textBelow: `End: ${endTime}`, divId: 'workTimeCircle'});

    // Bruch kürzen
    const result = reduceFraction(minuteChunks, maxChunks);
    console.log(`MinuteChunks: ${minuteChunks} / ${maxChunks} --> ${result.numerator}/${result.denominator}`);

  } catch (error) {
    document.getElementById('output').textContent = error;
  }
}


function reduceFraction(numerator, denominator) {
  // Hilfsfunktion, um den größten gemeinsamen Teiler zu finden
  function gcd(a, b) {
    while (b !== 0) {
      let t = b;
      b = a % b;
      a = t;
    }
    return a;
  }
  // Finde den GGT von Zähler und Nenner
  const greatestCommonDivisor = gcd(numerator, denominator);

  // Teile Zähler und Nenner durch den GGT, um den Bruch zu kürzen
  return {
    numerator: numerator / greatestCommonDivisor,
    denominator: denominator / greatestCommonDivisor
  };
}


window.onload = displayWorkDuration;  // Call the function when the page loads



// Refresh the page every 60 seconds
setInterval(function () {
  // do not refresh if the sidemenui is open
  if (document.getElementById('menu').style.width === '250px') {
    return;
  }
  window.location.reload();
}, 60000);  // 60000 milliseconds = 1 minute
