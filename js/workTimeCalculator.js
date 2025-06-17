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
    console.error('Error: startTime must not be NULL');
    throw new Error('Error: startTime must not be NULL');
  }

    let currentDate = new Date().toISOString().substring(0, 10); // YYYY-MM-DD format
    let adjustedStartTime = new Date(`${currentDate} ${this.startTime}`);
    let adjustedEndTime = this.endTime ? new Date(`${currentDate} ${this.endTime}`) : new Date();
    // console.log(`adjustedEndTime: ${adjustedEndTime}`);
    
    let durationInMilliseconds = adjustedEndTime - adjustedStartTime - this.lunchBreak * 60000;
    let finalDuration = new Date(durationInMilliseconds);
    
    // Convert duration to seconds for comparison
    let durationInSeconds = durationInMilliseconds / 1000;
    
    // check if the breaktime is grater than the worktime then return 0
    if (durationInSeconds < 0) {
      return '00:00';
    }

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

  // calculatethe amout of time until the end of the workday
  timeToGo() {
    // get the current time
    let currentTime = new Date();

    // get the end time
    const [nendHours, endMinutes] = this.calculateEndTime().split(':').map(Number);
    let endTime = new Date(currentTime.getTime());
    endTime.setHours(nendHours, endMinutes, 0, 0);

    // Calculate the difference in milliseconds
    let differenceInMilliseconds = endTime.getTime() - currentTime.getTime();

    // Handling negative differences (if end time is before current time)
    if (differenceInMilliseconds < 0) {
        // return 0 if the end time is before the current time
        return '00:00';
    }

    // Convert milliseconds to minutes and hours
    let differenceInMinutes = Math.round(differenceInMilliseconds / (1000 * 60));
    let hours = Math.floor(differenceInMinutes / 60);
    let minutes = differenceInMinutes % 60;

    // Format the time difference to HH:MM
    let formattedDifference = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedDifference;
  }


  calculateEndTime() {
    // Zerlege die Startzeit in Stunden und Minuten
    const [hours, minutes] = this.startTime.split(':').map(Number);
    
    // Erstelle ein Date-Objekt (das Datum ist hier nicht wichtig)
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    
    // add the work duration and lunchbreak to the time object
    let endTime = new Date(time.getTime() + this.workDuration * 60000 + (this.lunchBreak ?? 30) * 60000);

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
  
    // get the difference between the current time and the calculated end time
    let resultHours = currentHours - inputHours;
    let resultMinutes = currentMinutes - inputMinutes;

    // if overtime minutes are negative subtract one hour and add 60 minutes
    if (resultMinutes < 0) {
      resultHours--;
      resultMinutes += 60;
    }
    
    
    // return if current time is before end time
    if (resultHours < 0) {
      return '00:00';
    }
    
    // add trailing zeros to hours and minutes
    const formattedHours = resultHours.toString().padStart(2, '0');
    const formattedMinutes = resultMinutes.toString().padStart(2, '0');
    console.log(`Current Overtime: ${formattedHours}:${formattedMinutes}`);
    
    return `${formattedHours}:${formattedMinutes}`;
  }

  // function that creates a hour string from workduration minutes integer
  minutesToTimeString() {
    const hours = Math.floor(this.workDuration / 60);
    const remainingMinutes = this.workDuration % 60;
    return `${hours<10 ? '0':''}${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`;
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
    // reset all relevant values and show the settings menu
    resetWorkDay();
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
  console.log(`One Segment is ${timeChunks.toFixed(2)} Min.`);

  // calculate the time value from the minutes "timeChunks" decimal value as "MM:SS"
  const timeChunksTimeValue = Math.floor(timeChunks) + ':' + Math.round((timeChunks % 1) * 60).toString().padStart(2, '0'); 
  
  // TODO: clear error message if it is set
  document.getElementById('errorMsg').textContent = '';

  try {
    let workTime = workTimeCalculator.calculateDuration();
    let minuteChunks = calculateTimeChunks(workTime, timeChunks);
    
    // calculate the end time
    let endTime = workTimeCalculator.calculateEndTime();
    // workTimeCalculator.endTime = endTime;

    // caculate the time to go
    let timeToGo = workTimeCalculator.timeToGo();
    console.log(`Time to go: ${timeToGo}`);

    // prepare the text for the overtime circle
    let textAbove = `Start: ${startTime}`;
    let textBelow = `End: ${endTime}`;
    
    // check for overtime
    // console.log('End Time: ' + workTimeCalculator.endTime);
    let overtime = workTimeCalculator.overTime();
    let overtimeFlag = overtime !== '00:00';
    if (overtime !== '00:00') {
      textBelow = `Overtime: ${overtime}`;
    }

    // show the breaktime in a additional text below if set
    if (lunchbrake > 0) {
       textBelow += `\nBreak: ${lunchbrake} Min.`;  
    }

    // call the main drawing routine for the worktime circle
    createSegmentedCircle({ segments: maxChunks, actualCount: minuteChunks, text: workTime, ringThickness: 10, textAbove: textAbove, textBelow: textBelow, divId: 'workTimeCircle' });

    // reduce the fraction of the minuteChunks and maxChunks
    // this is only for logging purposes
    const fraction = reduceFraction(minuteChunks, maxChunks);
    console.log(`MinuteChunks: ${minuteChunks} / ${maxChunks} --> ${fraction.numerator}/${fraction.denominator}`);
    
    // update the values in the details section
    // get formated date and time value
    let formattedDate = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('detailsTimeValue').textContent = formattedDate;

    // console.log(`Workduration: ${workTimeCalculator.minutesToTimeString()} h`);
    document.getElementById('detailsWorkingHours').textContent = workTimeCalculator.minutesToTimeString();
    document.getElementById('detailsTime2Go').textContent = timeToGo;

    let workDayCompletedText = overtimeFlag ? 'overtime' : `${fraction.numerator}/${fraction.denominator}`;
    document.getElementById('detailsTimeFraction').textContent = workDayCompletedText;
    document.getElementById('detailsMinutesPerSegment').textContent = timeChunksTimeValue + ' Min.';

  } catch (error) {
    console.log(error);
    document.getElementById('errorMsg').textContent = error;
  }
}

// create function to toggle the details section
function toggleDetails() {
  const detailsDiv = document.getElementById('details');
  detailsDiv.classList.toggle('open');

  // store the status in the local storage
  setDetailsStatus(detailsDiv.classList.contains('open') ? 'open' : 'closed');

  console.log('Details visible: ' + detailsDiv.classList.contains('open'));

  // redraw the svg circle to refresh
  displayWorkDuration();
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

// function that returns a string with the formated date "YYYY-MM-DD"
function getFormattedDate() {
  return new Date().toISOString().substring(0, 10); // YYYY-MM-DD format
}


// global vars in the namespace
let globals = {
  // get colors from css variables
  ringBaseColor: getComputedStyle(document.documentElement).getPropertyValue('--ring-base-color').trim() ?? 'lightgrey',
  ringPrimaryColor: getComputedStyle(document.documentElement).getPropertyValue('--ring-primary-color').trim() ?? 'green',
  ringSecondaryColor: getComputedStyle(document.documentElement).getPropertyValue('--ring-secondary-color').trim() ?? 'lightblue',
  svgRingWith: 200,
  svgRingHeight: 200
};

// create a function that is run on load an initializes all global vars
// this line is executed when the page is loaded
// do not move above the globals object
window.onload = init();  // Call the function when the page loads

// setter and getter for the status of the details section
function setDetailsStatus(status) {
  localStorage.setItem('detailsStatus', status);
  // set status in globals object
  globals.detailsStatus = status;
}

function getDetailsStatus() {
  return globals.detailsStatus;
}


// create a function that is run on load an initializes all global vars
function init() {
  // read initial values from local storage if emtpy use default values
  let startTime = localStorage.getItem('startTime') ?? new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  let workingHours = localStorage.getItem('workingHours');
  let lunchBreak = localStorage.getItem('lunchBreak');
  let storedDate = localStorage.getItem('date');
  // read and set status of the status for the details section from storage
  globals.detailsStatus = localStorage.getItem('detailsStatus');
  
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

function resetWorkDay() {
  // reset all relevant values
  localStorage.removeItem('lunchBreak');
  // get the current date
  let currentDate = getFormattedDate();
  window.workTimeCalculator.currentDate = currentDate;
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