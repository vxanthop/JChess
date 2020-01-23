let clockWhite, clockBlack;
let timeInterval;

function getTimeRemaining(t) {
    return {
        total: t,
        minutes: Math.floor((t/1000/60) % 60),
        seconds: Math.floor((t/1000) % 60),
        miliseconds: Math.floor(t % 1000)
    };
}


function updateClocks() {
    if(turn == 'white') {
        let newTime = getTimeRemaining(clockWhite.total - 10);
        clockWhite = Object.assign({}, newTime);
    } else {
        let newTime = getTimeRemaining(clockBlack.total - 10); 
        clockBlack = Object.assign({}, newTime);
    }

    if(clockBlack.total <= 0 || clockWhite.total <= 0) {
        clearInterval(timeInterval)
        // playing = false;
    }

    renderClocks()
}

function initializeClocks(timeWhite, timeBlack) {
    clockWhite = getTimeRemaining(timeWhite);
    clockBlack = getTimeRemaining(timeBlack);   

    updateClocks();
    timeInterval = setInterval(updateClocks, 10);
}

initializeClocks(30000, 30000);
