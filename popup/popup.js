// Open a connection to the background

var host = "";

var port = chrome.runtime.connect({
    name: "popup"
});
port.onMessage.addListener(function(msg) {
    var request = JSON.parse(msg);
    switch(request["request"]){
        case "LoggedIn": showLoggedIn(request["data"]); break;
        case "AvailableAccounts": showAvailableAccounts(request["data"]["accounts"],request["data"]["url"]); break;
        case "Host": host = request["data"]["url"]; break;
    }
    
});

function sendBackgroundRequest(request, data) {
    port.postMessage(JSON.stringify({'request':request, 'data':data}));
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
  sendBackgroundRequest('Host',null);
  sendBackgroundRequest('LoggedIn',null);
  getCurrentTabUrl(function(url) {
      sendBackgroundRequest("AvailableAccounts",{'url':url});
  });
//  document.getElementById('loggedIn').addEventListener('click', clickLogin);
});

/* Output section */

function showLoggedIn(loggedIn) {
    var text;
    var cls="btn";
    button = document.getElementById('logInButton');
    document.getElementById('options').onclick = function(e) { showOptions(); };
    if (loggedIn["status"]) {
        var textnode = document.createTextNode("Logged in as ");
        var user = document.createElement("span");
        user.setAttribute("id","user");
        user.textContent = loggedIn["username"];
        var link = document.createElement("a");
        link.setAttribute("class", "glyphicon glyphicon-eye-open");
        link.setAttribute("id", "openManager");
        link.setAttribute("href", "#");
        link.onclick = function(e) {
            var actions = [];
            actions.push({"action":"login", "data":null});
            openWithAction(actions);
        };
        user.appendChild(link);
        document.getElementById("loggedIn").appendChild(button);
        document.getElementById("loggedIn").appendChild(textnode);
        document.getElementById("loggedIn").appendChild(user);
        text = "Logout";
        cls += " btn-danger";
        button.onclick = function(e) {
            var actions = [];
            actions.push({"action":"login", "data":null});
            actions.push({"action":"logout", "data":null});
            openWithAction(actions);
        };
    }
    else {
        var error = loggedIn["error"];
        if (error != "") {
            var errormsg = document.createElement("p");
            errormsg.textContent = error;
            document.getElementById("status").appendChild(errormsg);
        }
        else{
            if (host != "")
                clickLogin();
            else
                showOptions();
        }
        text = 'Login';
        cls += " btn-success";
        document.getElementById('accounts').setAttribute("class", "hidden");
        button.onclick = function(e) { clickLogin(); };
    }
    button.textContent = text;
    button.setAttribute("class", cls);
}


function showAvailableAccounts(accounts,url) {
    var ul = document.getElementById('accounts-list');
    var editIcon = document.createElement("span");
    editIcon.setAttribute("class", "pull-right glyphicon glyphicon-pencil");
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    for (item in accounts) {
        var account = accounts[item];
        var a = document.createElement("a");
        a.textContent = account["name"]+" ("+account["username"]+')';
        a.index = account["index"];
        a.url = url;
        a.onclick = function(e){ 
            sendBackgroundRequest("setAccount",{"index":this.index, "url":this.url});
            sendBackgroundRequest("AvailableAccounts",{'url':this.url});
        }; 
        a.setAttribute("class", "list-group-item clearfix");
        if (account["active"])
            a.setAttribute("class", "list-group-item active clearfix");
        editIconHere = editIcon.cloneNode(true);
        editIconHere.index = account["index"];
        editIconHere.onclick = function(e){
            var actions = [];
            actions.push({"action":"login", "data":null});
            actions.push({"action":"edit", "data":this.index});
            openWithAction(actions);
            e.stopPropagation();
        }
        a.prepend(editIconHere);
        ul.appendChild(a);
    }
    if (accounts.length == 0){
        var a = document.createElement("a");
        a.textContent = "No accounts found";
        a.setAttribute("class", "list-group-item disabled");
        ul.appendChild(a);
    }
    var search = document.createElement("a");
    search.innerHTML = '<i class="glyphicon glyphicon-share list-glyph"></i><strong>Search All Accounts</strong>';
    search.onclick = function(e) {
        var actions = [];
        actions.push({"action":"login", "data":null});
        openWithAction(actions);
    };
    search.setAttribute("class", "list-group-item list-group-item-success");
    ul.appendChild(search);
    var a = document.createElement("a");
    a.innerHTML = '<i class="glyphicon glyphicon-plus list-glyph"></i><strong>Add Account</strong>';
    a.onclick = function(e){
        var actions = [];
        actions.push({"action":"login", "data":null});
        actions.push({"action":"addAccount", "data":{"url":url}});
        openWithAction(actions);
    };
    a.setAttribute("class", "list-group-item list-group-item-success");
    ul.appendChild(a);
}

function openWithAction(actions) {
    var action = actions.shift();
    while (action != null){
        sendBackgroundRequest("setAction", action);
        action = actions.shift();
    }
    chrome.tabs.create({url:host+"password.php"});
}

function clickLogin() {
    chrome.tabs.create({url:host});
}
function showOptions() {
    chrome.runtime.openOptionsPage();
}
