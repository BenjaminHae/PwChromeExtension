// Listens to popup.js and into sites injected scripts and dispatches actions
// context menu events are handled in context.js

var actionQueue = [];

// listen to popup.js
chrome.runtime.onConnect.addListener(function(port) {
    console.log(port.name + " connected .....");
    port.onMessage.addListener(function(msg) {
        var request = JSON.parse(msg);
        function sendPopupRequest(request, data) {
            port.postMessage(JSON.stringify({'request':request, 'data':data}));
        }
        switch(request["request"]){
            case "Host": sendPopupRequest('Host', {'url':host}); break;
            case "LoggedIn": 
                var loggedIn = isLoggedIn();
                var data={'status':loggedIn};
                if (loggedIn){
                    data["username"] = getUsername();
                }
                sendPopupRequest('LoggedIn',data); 
                break;
            case "AvailableAccounts": 
                var accounts = getAccountsForDomain(request["data"]["url"]);
                var send = [];
                for (item in accounts){
                    var account = accounts[item];
                    send.push({"index":account["index"], "active": account["active"], "name":account["name"], "username":account["username"]});
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
    chrome.storage.sync.get({
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
        case "login": data = {"sk":secretkey0, "confKey":encryptchar(confkey,salt2), "salt":salt2}; 
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
    //do something that only the extension has privileges here
    switch(myMessage["request"]){
        case "session": receiveUserSession(myMessage["data"]); break;
        case "logout":  cleanup(); break;
        case "actions": console.log("actions");
                        var action = getLatestAction();
                        if (action == null)
                            action = {"request": "none"};
                        sendResponse(action);
                        break;
        case "host": sendResponse({"request":"host", "data":{"url":host}}); break;
    }
    return true;
});
