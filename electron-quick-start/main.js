var electron = require('electron'),
    app = electron.app, // Module to control application life.
    ipcMain = electron.ipcMain,
    BrowserWindow = electron.BrowserWindow, // Module to create native browser window
    process = require('process'),
    path = require('path'),
    url = require('url'),
    localIndex = url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }),
    localTestWin = url.format({
        pathname: path.join(__dirname, 'test-window.html'),
        protocol: 'file:',
        slashes: true
    }),
    // Window Information
    testWins = [], //Circularly Linked Lists
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
    mainWin = new BrowserWindow({
        width: 300,
        height: 310,
        frame: false,
        webPreferences: {
            devTools: true
        }
    });

    // and load the index.html of the app.
    mainWin.loadURL(localIndex);
    //mainWin.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWin.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWin = null;
        updateWinQty(0);
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
    console.log(numWins);
    updateWinQty(numWins, event);
});

ipcMain.on('startTesting', function(event, messageSizeNumber) {
    startTesting(messageSizeNumber);
});

ipcMain.on('stopTesting', function() {
    stopTesting();
});

ipcMain.on('msg', function(event, msg) {
    forwardMessage(event, msg);
});

ipcMain.on('exitApp', function exitApp() {
    stopTesting();
    updateWinQty(0);
    mainWin.close();
});

//=====================================================================
// Add new Window to the test
//=====================================================================
function createNewWin() {

    var lastWin = testWins[testWins.length - 1],
        left, top;

    // Calculate win position
    left = testWins.length % maxRow * winFullWidth;
    top = Math.floor(testWins.length / maxRow) * winFullHeight;
    if (top + winFullHeight > screenHeight) {
        top = 0;
    }

    var _window = new BrowserWindow(
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
    _window.loadURL(localTestWin);
    //_window.webContents.openDevTools();

    testWins.push(_window);
    if (lastWin) {lastWin._next = _window;}
    _window._next = null;
}

//=====================================================================
// Update the amount of the Windows in the test
//=====================================================================
function updateWinQty(winQty, event){

    // close and remove windows
    if (winQty < testWins.length) {
        testWins.forEach(function(win, i) {
            if (i + 1 > winQty) {
                win.close();
                win.on('closed', function(){
                    win = null;
                });
            }
        });
        testWins.splice(winQty);
    }
    // create new windows
    else if (winQty > testWins.length) {
        winsToCreate = winQty - testWins.length;
        for (var i = 0; i < winsToCreate; i++) {
            createNewWin();
        }
    }

    if (testWins.length > 1) {
        var lastWin = testWins[testWins.length - 1];
        lastWin._next = testWins[0];
    }

    if (event) {event.sender.send('loader', false);}
}

//=====================================================================
// Start elapsed time clock
//=====================================================================
function startClock() {
    timeTestStart = process.hrtime();
    elapsedTimeIntervalHandle = setInterval(analytics, 1000);
}

//=====================================================================
// Crunch numbers and send to the mainWindow
//=====================================================================
function analytics() {
    var elapsedTime = process.hrtime(timeTestStart);

    var results = {
        messages: 0,
        latency: 0,
        throughputMbs: 0,
        throughputMsgs: 0,
        elapsedTime: Math.round((elapsedTime[0]*1000) + (elapsedTime[1]/1000000)) //convert nanoseconds to milliseconds
    };

    var readyWins = testWins.filter(function(w){
        return w._results;
    });

    if (readyWins.length > 0) {

        //Average across all the child windows for throughput and latency that have results
        readyWins.forEach(function (win) {
            results.messages += Number(win._results.messages);
            results.latency += Number(win._results.latency);
            results.throughputMbs += Number(win._results.throughputMbs);
            results.throughputMsgs += Number(win._results.throughputMsgs);
        });

        results.latency = (results.latency / readyWins.length).toFixed(3);
        results.throughputMbs = ( results.throughputMbs / readyWins.length).toFixed(3);

        mainWin.webContents.send('results', results);
    }
}

//=====================================================================
// Pass messages between renderer processes
//=====================================================================
function forwardMessage(event, msg) {
    var win = findWindow(event.sender.id);
    if (win._next) {
        win._next.webContents.send('msg', msg); //Round and Round the messages go
    }
}


//=====================================================================
// Start testing
//=====================================================================
function startTesting(messageSizeNumber) {
    startClock();
    testWins.forEach(function(w){
        w.webContents.send('ready', messageSizeNumber);
    });
    testWins[0].webContents.send('start', messageSizeNumber);
    ipcMain.on('testWindowResult', function (e, results){
        var win = findWindow(e.sender.id);
        win._results = results;
    });
}

//=====================================================================
// Stop testing
//=====================================================================
function stopTesting() {
    clearInterval(elapsedTimeIntervalHandle);
    testWins.forEach(function(w){
        w.webContents.send('stop');
    });
    ipcMain.removeAllListeners('testWindowResult');
}


function findWindow(id){
    return testWins.find(function(w){
        return w.id === id;
    });
}
