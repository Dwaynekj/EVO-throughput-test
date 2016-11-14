var electron = require('electron'),
    app = electron.app, // Module to control application life.
    ipcMain = electron.ipcMain,
    BrowserWindow = electron.BrowserWindow, // Module to create native browser window.
    // Window Information
    electronWins = [], //Circularly Linked Lists
    width = 220,
    height = 144,
    appsGap = 1,
    screenWidth = 800,
    screenHeight = 600,
    winFullWidth = width + appsGap,
    winFullHeight = height + appsGap,
    maxRow = Math.floor(screenWidth / winFullWidth), // Get screen bounds and center window
    //clock information
    timeTestStart = 0,
    elapsedTimeIntervalHandle = null,
    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.
    mainWin = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function init () {
    // Create the browser window.
    mainWin = new BrowserWindow({width: 300, height: 310});

    // and load the index.html of the app.
    mainWin.loadURL('http://localhost:8080/child.html');

    // Emitted when the window is closed.
    mainWin.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWin = null;
    });

});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('updateWinQty', function(event, numWins) {
    event.sender.send('loader', true);
    updateWinQty(numWins, event);
});

ipcMain.on('startTesting', function(event, messageSizeNumber) {
    startTesting(messageSizeNumber);
});

ipcMain.on('stopTesting', function(event) {
    stopTesting();
});


//=====================================================================
// Add new Window to the test
//=====================================================================
function createNewWin() {

    var lastWin = electronWins[electronWins.length - 1],
        left, top;

    // Calculate win position
    left = electronWins.length % maxRow * winFullWidth;
    top = Math.floor(electronWins.length / maxRow) * winFullHeight;
    if (top + winFullHeight > screenHeight) {
        top = 0;
    }

    var _window = BrowserWindow(
        {
            frame: false,
            show: true,
            resizable: false,
            minWidth: width,
            width: width,
            minHeight: height,
            height: height,
            y: top,
            x: left,
            webPreferences: {
                devTools: true
            }
        }
    );
    _window.loadURL('http://localhost:8080/child.html');

    electronWins.push(_window);
    if (lastWin) {lastWin._next = _window;}
    _window._next = null;
}

//=====================================================================
// Update the amount of the Windows in the test
//=====================================================================
function updateWinQty(winQty, event){

    // close and remove windows
    if (winQty < electronWins.length) {
        electronWins.forEach(function(win, i) {
            if (i + 1 > winQty) {
                win.close();
                win.on('closed', function(){
                    win = null;
                });
            }
        });
        electronWins.splice(winQty);
    }
    // create new windows
    else if (winQty > electronWins.length) {
        winsToCreate = winQty - electronWins.length;
        for (var i = 0; i < winsToCreate; i++) {
            createNewWin();
        }
    }

    if (electronWins.length > 1) {
        var lastWin = electronWins[electronWins.length - 1];
        lastWin._next = electronWins[0];
    }

    event.sender.send('loader', false);
}

//=====================================================================
// Start elapsed time clock
//=====================================================================
function startClock() {
    elapsedTimeIntervalHandle = setInterval(analytics, 1000);
    analytics();
}

//=====================================================================
// Crunch numbers and send to the mainWindow
//=====================================================================
function analytics() {
    var results = {
        messages: 0,
        latency: 0,
        throughputMbs: 0,
        throughputMsgs: 0,
        elapsedTime: Math.round(window.performance.now() - timeTestStart)
    };

    //Average across all the child windows for throughput and latency
    electronWins.forEach(function(win) {
        results.messages += Number(win._results.messages);
        results.latency += Number(win._results.latency);
        results.throughputMbs += Number(win._results.throughputMbs);
        results.throughputMsgs += Number(win._results.throughputMsgs);
    });

    results.latency = (results.latency  / electronWins.length).toFixed(3);
    results.throughputMbs = ( results.throughputMbs / electronWins.length).toFixed(3);

    ipcMain.send('results', results);
}

//=====================================================================
// Start testing
//=====================================================================
function startTesting(messageSizeNumber) {
    timeTestStart = window.performance.now();
    startClock();

    // Tell each app to start testing
}

//=====================================================================
// Stop testing
//=====================================================================
function stopTesting() {
    clearInterval(elapsedTimeIntervalHandle);

    // Tell each app to stop testing
}



