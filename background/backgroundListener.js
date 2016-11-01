// Listens to popup.js and into sites injected scripts and dispatches actions
// context menu events are handled in context.js

// listen to popup.js
chrome.extension.onConnect.addListener(function(port) {
    console.log("Connected .....");
    port.onMessage.addListener(function(msg) {
        var request = JSON.parse(msg);
        function sendPopupRequest(request, data) {
            port.postMessage(JSON.stringify({'request':request, 'data':data}));
        }
        switch(request["request"]){
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
        }
    });
});

// listen to the injected code in content.js
chrome.runtime.onMessage.addListener(function(myMessage, sender, sendResponse){
    //do something that only the extension has privileges here
    switch(myMessage["request"]){
        case "session": receiveUserSession(myMessage["data"]); break;
        case "logout":  cleanup(); break;
    }
    return true;
});