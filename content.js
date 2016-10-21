document.addEventListener('secretKeyReady', function(e){
    //send message to ext
    chrome.runtime.sendMessage({"request":"session", "data":e.detail}, function(response) {
        //callback
    });
}, false);

document.addEventListener('loggedOut', function(e){
    //send message to ext
    chrome.runtime.sendMessage({"request":"logout"}, function(response) {
        //callback
    });
}, false);
