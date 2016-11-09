
var _childWindow, _namedSendResult, _unnamedSendResult, _windowName;
document.addEventListener("DOMContentLoaded", function(){

    _namedSendResult = document.querySelector("#named-send-result");
    _unnamedSendResult = document.querySelector("#unnamed-send-result");

    // this is a bit of a hack but the openFin api is not immediately available when the dom loads
    setTimeout(function(){
        _childWindow = fin.desktop.Window.getCurrent();
        _windowName = _childWindow.name;
        childWindow.subscribeWithNameChildWindow(CHILD_APP_UUID, _windowName);
        childWindow.subscribeWithoutNameChildWindow(CHILD_APP_UUID);
    }, 100);
});
// Namespace
var childWindow = {
    subscribeWithNameChildWindow:function(id, name){
        var onSuccess = function(){
                console.log("1a. subscribeWithNameChildWindow -> UUID: " + id + " Name: " +name )
            },
            onFail = function(){
                console.log("subscribeWithNameChildWindow subscription FAIL")
            };

        fin.desktop.InterApplicationBus.subscribe(CHILD_APP_UUID,
            CHILD_APP_UUID,
            "send-to-named",
            function (message, uuid) {
                console.log(message);
                var _message = "The application " + uuid + " send this message " + message;
                _namedSendResult.innerHTML = "Topic: send-to-named, text: " + message.text +", name:"+ message.name;
            },onSuccess,onFail);
    },
    subscribeWithoutNameChildWindow:function(id){
        var onSuccess = function(){
                console.log("2a. subscribeWithoutNameChildWindow -> UUID: " + id + " Name: " +name )
            },
            onFail = function(){
                console.log("subscribeWithoutNameChildWindow subscription FAIL");
            };

        fin.desktop.InterApplicationBus.subscribe(CHILD_APP_UUID,
            "send-to-unnamed",
            function (message, uuid) {
                console.log(message);
                var _message = "The application " + uuid + " send this message " + message;
                _unnamedSendResult.innerHTML = "Topic: send-to-unnamed, text: " + message.text +", name:"+ message.name;
            },onSuccess,onFail);
    }

};
