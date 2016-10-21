// Open a connection to the background

var port = chrome.extension.connect({
    name: "Sample Communication"
});
port.onMessage.addListener(function(msg) {
    console.log("message recieved" + msg);
    var request = JSON.parse(msg);
    switch(request["request"]){
        case "LoggedIn": showLoggedIn(request["data"]); break;
        case "AvailableAccounts": showAvailableAccounts(request["data"]["accounts"],request["data"]["url"]); break;
    }
    
});

function sendBackgroundRequest(request, data) {
    port.postMessage(JSON.stringify({'request':request, 'data':data}));
}


function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}
 
function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;
        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(url);
    });

}

/* Init content */

document.addEventListener('DOMContentLoaded', function() {
  sendBackgroundRequest('LoggedIn',null);
  getCurrentTabUrl(function(url) {
      sendBackgroundRequest("AvailableAccounts",{'url':url});
  });
  document.getElementById('loggedIn').addEventListener('click', clickLogin);
});

/* Output section */

function showLoggedIn(loggedIn) {
    var text;
    if (loggedIn["status"])
        text = "logged in as " + loggedIn["username"];
    else
        text = '<a href="#">not logged in</a>';
    document.getElementById('loggedIn').innerHTML = text;
}


function showAvailableAccounts(accounts,url) {
    var ul = document.getElementById('accounts_ul');
    for (item in accounts) {
        var account = accounts[item];
        var a = document.createElement("a");
        a.innerHTML = account["name"]+" ("+account["username"]+")";
        a.index = account["index"];
        a.url = url;
        a.onclick = function(e){ sendBackgroundRequest("setAccount",{"index":this.index, "url":this.url});}; 
        var li = document.createElement("li");
        if (account["active"])
            li.setAttribute("class", "active");
        li.appendChild(a);
        ul.appendChild(li);
    }
}

function clickLogin() {
    chrome.tabs.create({url:"https://%HOST%/"});
}
