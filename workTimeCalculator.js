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
    // console.log(`adjustedEndTime: ${adjustedEndTime}`);

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

  calculateEndTime() {
    // Zerlege die Startzeit in Stunden und Minuten
    const [hours, minutes] = this.startTime.split(':').map(Number);
    
    // Erstelle ein Date-Objekt (das Datum ist hier nicht wichtig)
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    // console.log(`Start-Timex: ${time.getHours()}:${time.getMinutes()}`);
    
    // add the work duration and lunchbreak to the time object
    let endTime = new Date(time.getTime() + this.workDuration * 60000 + (this.lunchBreak ?? 30) * 60000);

    // log start and end-time and lunchbreak 
    // console.log(`Start-Time: ${this.startTime}`);
    // console.log(`Lunch-Break: ${this.lunchBreak}`);
    // console.log(`Work-Duration: ${this.workDuration}`);
    // console.log(`End-Time: ${endTime}`);
    // console.log(`End-Time: ${endTime.getHours()}:${time.getMinutes()}`);

    // return the end time as a string in the format "HH:MM"
    const resultHours = endTime.getHours().toString().padStart(2, '0');
    const resultMinutes = endTime.getMinutes().toString().padStart(2, '0');

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
  console.log('updating visual: '+ new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
  // get instance var from the global variable
  let workTimeCalculator = window.workTimeCalculator;
  const startTime = workTimeCalculator.startTime ?? '08:00';
  // lunchbrake in minutes
  const lunchbrake = workTimeCalculator.lunchBreak ?? 30;
  // number of segments in the circle
  const maxChunks = 24;
  // time to work in minutes
  const workDuration = workTimeCalculator.workDuration ?? 480;
  const timeChunks = workDuration / maxChunks;
  try {
    // let workTimeCalculator = new WorkTime(startTime, null, lunchbrake, workDuration);
    let workTime = workTimeCalculator.calculateDuration();
    // document.getElementById('output').textContent = workTime;
    let minuteChunks = calculateTimeChunks(workTime, timeChunks);

    // calculate the end time
    let endTime = workTimeCalculator.calculateEndTime();
    // console.log(`End Time: ${endTime}`);

    createSegmentedCircle({ segments: maxChunks, actualCount: minuteChunks, text: workTime, ringThickness: 10, ringColor: 'green', textAbove: `Start: ${startTime}`, textBelow: `End: ${endTime}`, divId: 'workTimeCircle' });

    // Bruch kürzen
    const result = reduceFraction(minuteChunks, maxChunks);
    console.log(`MinuteChunks: ${minuteChunks} / ${maxChunks} --> ${result.numerator}/${result.denominator}`);

  } catch (error) {
    console.log(error);
    document.getElementById('errorMsg').textContent = error;
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


window.onload = init();  // Call the function when the page loads

// create a function that is run on load an initializes all global vars
function init() {
  // read initial values from local storage if emtpy use default values
  let startTime = localStorage.getItem('startTime') ?? new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  let workingHours = localStorage.getItem('workingHours');
  let lunchBreak = localStorage.getItem('lunchBreak');

  // create a new instance of the WorkTime class
  let workTimeCalculator = new WorkTime(startTime, null, lunchBreak, workingHours);
  window.workTimeCalculator = workTimeCalculator;

  // if workingHours and/or lunchbreak is not set display the settings menu
  if (!workingHours || !lunchBreak) {
    openMenu();
  } else {
    // display the work duration
    displayWorkDuration();
  }
}

// Refresh the page every 60 seconds
setInterval(function () {
  // do not refresh if the sidemenui is open
  if (document.getElementById('menu').style.width === '250px') {
    return;
  }
  // window.location.reload();
  displayWorkDuration();
}, 60000);  // 60000 milliseconds = 1 minute
