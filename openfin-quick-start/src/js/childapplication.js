var _childApp, _messageButton, _interAppMessage;

document.addEventListener("DOMContentLoaded", function () {
    initChild();
});

function initChild() {

    fin.desktop.main(function () {
        initChildWithOpenFin();
    })
}

initChildWithOpenFin = function () {
    _interAppMessage = document.querySelector("#inter-app-message")
    _childApp = fin.desktop.Window.getCurrent();
    _childApp.show();

    document.querySelector("#uuid").innerHTML = "<h2>UUID: " + _childApp.app_uuid + "</h2>";
    _messageButton = document.querySelector("#post-interapp").addEventListener('click', function () {
        publishMessage();
    });

    document.querySelector("#post-many-interapp").addEventListener('click', function () {
        publishMany();
    });

    document.querySelector("#send-interapp").addEventListener('click', function () {
        sendMessage();
    });


    document.querySelector("#send-bad-interapp").addEventListener('click', function () {
        sendBadMessage();
    });

    document.querySelector("#send-interapp-named").addEventListener('click', function () {
        sendToNamedMessage();
    });

    document.querySelector("#send-interapp-unnamed").addEventListener('click', function () {
        sendToUnNamedMessage();
    });

    initListeners();
};

function initListeners() {
    var _offset = Math.ceil(Math.random() * 800);

    fin.desktop.InterApplicationBus.subscribe("*",
        "bounds-changed-event",
        function (message, uuid) {
            console.log("BOUNDS CHANGED --- ");
            console.log(message.bounds.width);
            _childApp.setBounds(_offset, _offset, message.bounds.width, message.bounds.height)

        });

        fin.desktop.InterApplicationBus.subscribe(PARENT_UUID,
            TOPIC_APP_TO_APP,
        function (message, uuid) {
            console.log("The child application has received ",message, _interAppMessage)
            _interAppMessage.innerHTML = "Send from uuid: '"+uuid+"' Message: '"+ message.message+"'";
        });

}


function publishMany(num) {
    var _count = 0;

    var _int = setInterval(function () {
        _count++;
        if (_count < 1000) {
            publishMessage()
        } else {
            clearInterval(_int);
        }
    }, 1)

}

function sendBadMessage() {
    var _random = Math.random() * 300;

    var successCallback = function (e) {
        console.log("SUCCESSFULLY SENT ")
    };

    var errorCallback = function (e) {
        console.log("ERROR MESSAGE ", e)
    };

    fin.desktop.InterApplicationBus.send('OpenFin_appseed', null, 'universal-message', {
        num: _random,
        text: "The random number is: "
    }, successCallback, errorCallback);
}


function sendMessage() {
    var _random = Math.random() * 300;

    var successCallback = function (e) {
        console.log("SUCCESSFULLY SENT ");
    };

    var errorCallback = function (e) {
        console.log("ERROR MESSAGE ", e);
    };

    fin.desktop.InterApplicationBus.send(PARENT_UUID, 'universal-message', {
        num: _random,
        num: _random,
        text: "The random number is: "
    }, successCallback, errorCallback);
}
//Testing sending to a named window via the inter app bus.
function sendToNamedMessage() {
    var _name = document.querySelector("#name-of-window").value;
    var _message = document.querySelector("#message-to-send").value;

    fin.desktop.InterApplicationBus.send({
            uuid: PARENT_UUID,
            name: _name,
            message: {text:_message, name:_name},
            topic: 'send-to-named',
            cache: 'until-delivered'
        },
        function () {
            console.log('sendToNamedMessage worked')
        },
        function (err) {
            console.log("sendToNamedMessage failed: ", err)
        });
}


//Testing sending to a named window via the inter app bus.
function sendToUnNamedMessage() {
    var _name = document.querySelector("#name-of-window").value;
    var _message = document.querySelector("#message-to-send").value;

    fin.desktop.InterApplicationBus.send({
            uuid: PARENT_UUID,
            message: {text:_message, name:_name},
            topic: 'send-to-unnamed',
            cache: 'until-delivered'
        },
        function () {
            console.log('sendToNamedMessage worked')
        },
        function (err) {
            console.log("sendToNamedMessage failed: ", err)
        });
}


function publishMessage() {
    var _random = Math.random() * 300;
    fin.desktop.InterApplicationBus.publish("universal-message", {
        "num": _random,
        "text": "The random number is: ",
        "AppKey": "RN",
        "ApplicationIcon": null,
        "AssetClasses": ["FX"],
        "CategoryName": "Services",
        "Description": "RN",
        "DisplayOrder": 0,
        "EnableViaSailpoint": false,
        "FavoriteAppOrder": 0,
        "Id": 551,
        "InternalUri": "\\RiskNavigator\\RiskUI.exe",
        "IsFavorite": true,
        "IsNewApp": false,
        "IsSuggested": false,
        "LongName": "Risk Navigator",
        "MarketingUri": "http://risknavigator.staging.echonet/risk/static/",
        "MaxNumberOfInstances": 1,
        "ShortDescription": "RN",
        "ShortName": "RN",
        "category": "Services",
        "longName": "Risk Navigator",
        "shortName": "RN"
    });
}
