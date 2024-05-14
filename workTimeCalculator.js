class WorkTime {
  constructor(currentDate, startTime, endTime, lunchBreak, workDuration) {
    this.currentDate = currentDate;
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

    // TODO: eventuell löschen und Pausen nur nach Eingabe des Benutzers berücksichtigen
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

  // calulate the time difference between the current time and the calculated endTime
  overTime() {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
  
    const [inputHours, inputMinutes] = this.calculateEndTime().split(':').map(Number);
  
    // Berechne neue Zeit
    let resultHours = currentHours - inputHours;
    let resultMinutes = currentMinutes - inputMinutes;

    // return if current time is before end time
    if (resultHours < 0) {
      return '00:00';
    }
  
    // // TODO: löschen -- Korrigiere Minuten, falls nötig
    // if (resultMinutes < 0) {
    //   resultMinutes += 60;
    //   resultHours -= 1;
    // }
  
    // // Korrigiere Stunden, falls nötig
    // if (resultHours < 0) {
    //   resultHours += 24;
    // }
  
    // add trailing zeros to hours and minutes
    const formattedHours = resultHours.toString().padStart(2, '0');
    const formattedMinutes = resultMinutes.toString().padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}`;
  }
} // end of class WorkTime

// get the minute chunks for the work duration based on the total number of chunks (circle segments)
function calculateTimeChunks(timeValue, numChunks) {
  // Split the timeValue (expected format "HH:MM") into hours and minutes
  const [hours, minutes] = timeValue.split(':').map(Number);

  // Calculate total minutes from hours and minutes
  const totalMinutes = hours * 60 + minutes;

  // Calculate the number of 15-minute chunks
  const timeChunks = Math.floor(totalMinutes / numChunks ?? 19.5);

  return timeChunks;
}


// this is the main routine that does all the calculations and displays the work duration
function displayWorkDuration() {
  // console.log('updating visual: '+ new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
  // get instance var from the global variable
  let workTimeCalculator = window.workTimeCalculator;

  // first check if we still are in the same day if not show the settings menu
  let currentDate = getFormattedDate();
  if (workTimeCalculator.currentDate !== currentDate) {
    openMenu();
    return;
  }

  const startTime = workTimeCalculator.startTime ?? '08:00';
  // lunchbrake in minutes
  const lunchbrake = workTimeCalculator.lunchBreak ?? 30;
  // number of segments in the circle
  const maxChunks = 24;
  // time to work in minutes
  const workDuration = workTimeCalculator.workDuration ?? 480;
  const timeChunks = workDuration / maxChunks;
  try {
    let workTime = workTimeCalculator.calculateDuration();
    let minuteChunks = calculateTimeChunks(workTime, timeChunks);

    // calculate the end time
    let endTime = workTimeCalculator.calculateEndTime();
    // workTimeCalculator.endTime = endTime;

    // prepare the text for the overtime circle
    let textAbove = `Start: ${startTime}`;
    let textBelow = `End: ${endTime}`;
    
    // check for overtime
    console.log('End Time: ' + workTimeCalculator.endTime);
    let overtime = workTimeCalculator.overTime();
    if (overtime !== '00:00') {
      textBelow = `Overtime: ${overtime}`;
    }

    // call the main drawing routine for the worktime circle
    createSegmentedCircle({ segments: maxChunks, actualCount: minuteChunks, text: workTime, ringThickness: 10, ringColor: 'green', textAbove: textAbove, textBelow: textBelow, divId: 'workTimeCircle' });

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

// write a function that returns a string with the formated date "YYYY-MM-DD"
function getFormattedDate() {
  return new Date().toISOString().substring(0, 10); // YYYY-MM-DD format
}


window.onload = init();  // Call the function when the page loads

// create a function that is run on load an initializes all global vars
function init() {
  // read initial values from local storage if emtpy use default values
  let startTime = localStorage.getItem('startTime') ?? new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  let workingHours = localStorage.getItem('workingHours');
  let lunchBreak = localStorage.getItem('lunchBreak');
  let storedDate = localStorage.getItem('date');
  
  // get the current date is the actual date if not show the settings menu in the if clause below
  let currentDate = getFormattedDate();
  
  // create a new instance of the WorkTime class
  let workTimeCalculator = new WorkTime(currentDate, startTime, null, lunchBreak, workingHours);
  window.workTimeCalculator = workTimeCalculator;

  // if workingHours and/or lunchbreak is not set display the settings menu
  if (!workingHours || !lunchBreak || storedDate !== currentDate) {
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
