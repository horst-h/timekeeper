function openMenu() {
    // read the values from the local storage
    const startTime = localStorage.getItem('startTime') ?? new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const workDuration = localStorage.getItem('workDuration') ?? 480;
    const lunchBreak = localStorage.getItem('lunchBreak') ?? '30';

    document.getElementById("menu").style.width = "250px";

    // function that calculates the work duaration from number of minutes and returns a string with the format "hh:mm"
    function minutesToTimeString(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours<10 ? '0':''}${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`;
    }

    // set the default values of the input fields
    document.getElementById('startTime').value = startTime;
    document.getElementById('workingHours').value = minutesToTimeString(workDuration);
    document.getElementById('lunchBreak').value = lunchBreak;

    // set the default value of the start time to the current time
    // document.getElementById('startTime').value = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

}

function closeMenu() {

    // get the entered values from the input fields
    const startTime = document.getElementById('startTime').value;
    const workDuration = timeStringToMinutes(document.getElementById('workingHours').value);
    const lunchBreak = document.getElementById('lunchBreak').value;

    // update the global variables
    window.startTime = startTime;
    window.workDuration = workDuration;
    window.lunchBreak = lunchBreak;

    // function that takes a time string value and returns the minutes
    function timeStringToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
    }

    // store the values in the local storage
    localStorage.setItem('startTime', startTime);
    localStorage.setItem('workDuration', workDuration);
    localStorage.setItem('lunchBreak', lunchBreak);
    localStorage.setItem('date', getFormattedDate());

    // console.log('closeMenu: ', startTime, workDuration, lunchBreak);

    // get object instance from the global variable
    let workTimeCalculator = window.workTimeCalculator;
    
    // update the worktime calculator
    workTimeCalculator.startTime = startTime;
    workTimeCalculator.workDuration = workDuration;
    workTimeCalculator.lunchBreak = lunchBreak;
    workTimeCalculator.currentDate = getFormattedDate();

    // update the worktime clock
    displayWorkDuration();    

    document.getElementById("menu").style.width = "0";
}


