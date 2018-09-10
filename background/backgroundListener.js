// Listens to popup.js and into sites injected scripts and dispatches actions
// context menu events are handled in context.js

var actionQueue = [];

//Logged out on startup
chrome.browserAction.setIcon({ path: "iconLoggedOut.png" });

// listen to popup.js
chrome.runtime.onConnect.addListener(function(port) {
    console.log(port.name + " connected .....");
    // check origin
    if (port["sender"]["id"] != chrome.runtime.id) {
        return;
    }
    port.onMessage.addListener(function(msg) {
        var request = JSON.parse(msg);
        function sendPopupRequest(request, data) {
            port.postMessage(JSON.stringify({'request':request, 'data':data}));
        }
        switch(request["request"]){
            case "Host": 
                sendPopupRequest('Host', {'url':host}); 
                break;
            case "LoggedIn": 
                var loggedIn = isLoggedIn();
                var data={'status':loggedIn};
                if (loggedIn){
                    data["username"] = getUsername();
                }
                else {
                    data["error"] = error;
                }
                sendPopupRequest('LoggedIn',data); 
                break;
            case "AvailableAccounts": 
                var accounts = getAccountsForDomain(request["data"]["url"]);
                var send = [];
                for (item in accounts){
                    var account = accounts[item];
                    send.push({"index":account["index"], "active": account["active"], "name":account["name"], "username":account["other"]["user"]});
                }
                sendPopupRequest('AvailableAccounts', {'accounts':send, 'url':request["data"]["url"]}); 
                break;
            case "setAccount":
                setActiveAccount(request["data"]["index"],request["data"]["url"]);
                break;
            case "setAction":
                setAction(request["data"]["action"], request["data"]["data"]);
                break;
        }
    });
});

//get's called in hostCommunications so all variables are ready
function loadSettings(callback) {
    var storage = chrome.storage.local;
    if ("sync" in chrome.storage)
        storage = chrome.storage.sync;
    storage.get({
        timeout: 10,
        url: ""
    }, function(items) {
        inactiveTimeout = items.timeout * 60 * 1000;
        host = items.url;
        callback();
    });
}

function setAction(action, data){
    switch (action) {
        case "login": data = {"encryptionWrapper": JSON.stringify(backend.encryptionWrapper)}; 
                      break;
        //in all other cases no modification is necessary
    }
    actionQueue.push({"request":action, "data":data, "date":new Date()});
}

function getLatestAction() {
    var now = new Date();
    const validity = 10 * 1000;//10s validity for actions
    var action = actionQueue.shift();
    while (action != null && action["date"] + validity <= now) {
        action = actionQueue.shift();
    }
    return action;
}

// listen to the injected code in content.js
chrome.runtime.onMessage.addListener(function(myMessage, sender, sendResponse){
    // check for origin
    if (sender["id"] != chrome.runtime.id) {
        return;
    }
    if (sender["url"] != host + "password.php") {
        if (myMessage["request"] == "actions") {
            action = {"request": "none"};
            sendResponse(action);
        }
        return;
    }
    //do something that only the extension has privileges here
    switch(myMessage["request"]){
        case "session": 
            if (myMessage["data"]["url"].indexOf(host) != 0) {
                console.log("wrong host");
                return;
            }
            receiveUserSession(myMessage["data"]); 
            break;
        case "logout":  
            if (myMessage["data"]["url"].indexOf(host) != 0) {
                console.log("wrong host");
                return;
            }
            cleanup(); 
            break;
        case "actions": var action = getLatestAction();
                        if (action == null)
                            action = {"request": "none"};
                        sendResponse(action);
                        break;
        case "host": sendResponse({"request":"host", "data":{"url":host}}); break;
        case "options": loadSettings(function(){ timeOut(); }); break;
        case "selectAccount": forceSelectAccount(myMessage["data"]["index"]); break;
    }
    return true;
});
