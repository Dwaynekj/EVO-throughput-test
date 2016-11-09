var _mainWin,
    _interAppMessageField,
    _namedSendResult,
    _unnamedSendResult,
    _listeners,
    apps = [],
    windowsNames = [],
    winId = 0,
    _app_to_app_button = null,
    _app_to_app_uuid ="APP_0",
    _app_to_app_message = null;



document.addEventListener("DOMContentLoaded", function(){
    init();
});
//------

function init(){
    try{
        fin.desktop.main(function(){
            initWithOpenFin();
        })
    }catch(err){
        initNoOpenFin();
    }
};

function initWithOpenFin(){
    // NB it is 'Window' not 'Application' that the EventListener is being attached to
    _mainWin = fin.desktop.Window.getCurrent();

    _listeners              = document.querySelector("#listeners");
    _namedSendResult        = document.querySelector("#named-send-result");
    _unnamedSendResult      = document.querySelector("#unnamed-send-result");
    _app_to_app_uuid        = document.querySelector("#app_to_app_uuid");
    _app_to_app_message     = document.querySelector("#app_to_app_message");

    document.querySelector("#uuid").innerHTML = "<h2>UUID: "+_mainWin.app_uuid+"</h2>";
    fin.desktop.System.getVersion(function (version) {
        try{
            document.querySelector('#of-version').innerText = "OpenFin version "+version;
        }catch(err){
            //---
        }
    });
    initRezizing();
    initInterApp();
    createSubscriptionTestWindow();

    document.querySelector('#new-win-btt').addEventListener('click', function(evt){
        evt.preventDefault();
        var _winName = document.querySelector("#window-name").value;
        if(windowsNames.indexOf(_winName) === -1){
            windowsNames.push(_winName);
            initNewWindow(_winName);
        } else{
            //initNewWindow();
            alert("Choose unique name")
        }
    });

    document.querySelector("#new-btt").addEventListener('click', function(e){
        initNewApp("APP_"+winId).then(function(value){
            winId++;
            apps.push(value);
        });
    });

    document.querySelector("#min-btt").addEventListener('click', function(e){
        minAll()
    });

    document.querySelector("#max-btt").addEventListener('click', function(e){
        maxAll();
    });



    document.querySelector("#app_to_app_button").addEventListener('click', function(e){
        sendAppToApp(_app_to_app_uuid.value, _app_to_app_message.value)
    });


    _mainWin.addEventListener('close-requested', function(e) {
        var challenge = confirm('Closing this app will close all child apps.');
        if (challenge == true) {
            terminateAllApps();
            _mainWin.close(true);
        }else{
            console.log("The confirm was false")
        }
    });

/*
//create an new app
    initNewApp("BGCIROVolumeMatch").then(function(value){
        var _childWin = value.getWindow()
        _childWin.addEventListener('close-requested', function(e){
            console.log("close requested, but blocked. Close me from the main app.");
            _childWin.minimize();
        });
        apps.push(value);
    });
// and a second - for good measure...
    initNewApp("BGCIROVolumeMatch2").then(function(value){
        var _childWin2 = value.getWindow()
        _childWin2.addEventListener('close-requested', function(e){
            console.log("close requested, but blocked. Close me from the main app.");
            _childWin2.minimize();
        });
        apps.push(value);
    });

    // and a third - for even better measure...
    initNewApp("BGCIROVolumeMatch3").then(function(value){
        var _childWin3 = value.getWindow()
        _childWin3.addEventListener('close-requested', function(e){
            console.log("close requested, but blocked. Close me from the main app.");
            _childWin3.minimize();
        });
        apps.push(value);
    });
    */
}


function initNoOpenFin(){
    alert("OpenFin is not available - you are probably running in a browser.");
}

function terminateAllApps(){
    for(var app in apps ){
        apps[app].close();
    }
}

/*
Functional tests
 */


// Callbacks for the subscription tests
var callbacks = {
    listener:function(value){
        console.log("callbacks: listener: ", value);
    },
    callback:function(value){
        console.log("callbacks: callback: ", value);
    },
    errorCallback:function(value){
        console.log("callbacks: errorCallback: ",value);
    }
};

function createSubscriptionTestWindow(){
    initNewApp(CHILD_APP_UUID).then(function(value){
        var _childWin = value.getWindow();
        apps.push(value);
    });
};

function sendAppToApp(uuid, message){

    var successCallback = function (e) {
        console.log("SUCCESSFULLY SENT APP TO APP");
    };

    var errorCallback = function (e) {
        console.log("ERROR MESSAGE APP TO APP", e);
    };

    fin.desktop.InterApplicationBus.send(uuid, TOPIC_APP_TO_APP, {
        message: message
    }, successCallback, errorCallback);
}

function subscribeWithName(id, name){
    var onSuccess = function(){
            console.log("1. subscribeWithName -> UUID: " + id + " Name: " +name )
        },
        onFail = function(){
            console.log("subscribeWithName subscription FAIL")
        };

    fin.desktop.InterApplicationBus.subscribe(CHILD_APP_UUID,
        name,
        "send-to-named",
        function (message, uuid) {
            console.log(message);
            var _message = "The application " + uuid + " send this message " + message;
            _namedSendResult.innerHTML = "Topic: send-to-named, text: " + message.text +", name:"+ message.name;
        },onSuccess,onFail);
};

function subscribeWithoutName(id){
    var onSuccess = function(){
            console.log("2. subscribeWithoutName -> UUID: " + id + " Name: " +name )
        },
        onFail = function(){
            console.log("subscribeWithoutName subscription FAIL")
        };

    fin.desktop.InterApplicationBus.subscribe(CHILD_APP_UUID,
        "send-to-unnamed",
        function (message, uuid) {
            console.log(message);
            var _message = "The application " + uuid + " send this message " + message;
            _unnamedSendResult.innerHTML = "Topic: send-to-unnamed, text: " + message.text +", name:"+ message.name;
        },onSuccess,onFail);
};


function initInterApp(){
    _interAppMessageField = document.querySelector("#inter-app-message")
    fin.desktop.InterApplicationBus.addSubscribeListener(function (uuid, topic) {
        console.log(">>> The application " + uuid + " has subscribed to " + topic);
        var _p = document.createElement('p')
        var _newtext = document.createTextNode("The application " + uuid + " has subscribed to " + topic)
        _p.appendChild(_newtext);
        _listeners.appendChild(_p);
    });

    fin.desktop.InterApplicationBus.subscribe("*",
        "universal-message",
        function (message, uuid) {
          console.log(message);
            var _message = "The application " + uuid + " send this message " + message;
            _interAppMessageField.innerHTML = message.text + message.num;
            console.log(_message);
        });
};

///////////

function createNamedSubscriptionOldSignature(name){
    var onSuccess = function(){
            console.log("UUID: " + CHILD_APP_UUID + " createNamedSubscription subscription SUCCESS - to " +name )
        },
        onFail = function(){
            console.log("createNamedSubscription subscription FAIL")
        };

    fin.desktop.InterApplicationBus.subscribe(CHILD_APP_UUID,
        name,
        function (message, uuid) {
            console.log(message);
            var _message = "The application " + uuid + " send this message " + message;
            _interAppMessageField.innerHTML = message.text + message.num;
        },onSuccess,onFail);
}

//

function initRezizing(){
    _mainWin.addEventListener(TOPIC_BOUNDS_CHANGED, function (event) {
        console.log("The window has been moved or resized ", event);
        fin.desktop.InterApplicationBus.publish(TOPIC_BOUNDS_CHANGED, {
            bounds: event
        });
    }, function () {
        console.log("The registration was successful");
    },function (reason) {
        console.log("failure:" + reason);
    });
}

function minAll(){
    for(var app in apps ){
        apps[app].getWindow().minimize();
    }
}

function maxAll(){
    for(var app in apps ){
        apps[app].getWindow().restore();
    }
}

function initNewApp(uuid){
    return new Promise(function(resolve, reject){
        var SpawnedApplication = new fin.desktop.Application({
            name: "A New OpenFinApp",
            uuid: uuid,
            url: "http://localhost:9098/application.html",
            mainWindowOptions: {
                name: "OpenFin Application",
                autoShow: true,
                defaultCentered: false,
                alwaysOnTop: false,
                saveWindowState: true,
                icon: "favicon.ico"
            }
        }, function () {
            // Ensure the spawned application are closed when the main application is closed.
            console.log("running");
            SpawnedApplication.run();
            resolve(SpawnedApplication)
        });
    })
}


function initNewWindow(name){
    var win = new ExternalWindow(name).then(function(w){
        console.log(w);
        subscribeWithName(CHILD_APP_UUID, name)
        subscribeWithoutName(CHILD_APP_UUID)
    })
}
