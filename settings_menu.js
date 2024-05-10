document.addEventListener("DOMContentLoaded", function() {
    const workingHours = localStorage.getItem('workingHours');
    const lunchBreak = localStorage.getItem('lunchBreak');
    document.getElementById('workingHours').value = workingHours ? workingHours : '';
    document.getElementById('lunchBreak').value = lunchBreak ? lunchBreak : '';
});

function openMenu() {
    document.getElementById("menu").style.width = "250px";
    // set the default value of the start time to the current time
    document.getElementById('startTime').value = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    
}

function closeMenu() {
    const startTime = document.getElementById('startTime').value;
    const workingHours = document.getElementById('workingHours').value;
    const lunchBreak = document.getElementById('lunchBreak').value;

    localStorage.setItem('workingHours', workingHours);
    localStorage.setItem('lunchBreak', lunchBreak);

    const workTimeInstance = new WorkTime(startTime, workingHours, lunchBreak);
    console.log(workTimeInstance);

    document.getElementById("menu").style.width = "0";
}
