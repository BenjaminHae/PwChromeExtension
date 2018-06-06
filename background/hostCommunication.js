var host = "";
var accounts;
var backend;
var data;
var username;
var activeAccountIndex;
var activeAccountIndexForced;
var error = "";

var lastAction;
var inactiveTimeout = 10 * 60 * 1000;

// Dummy function to make backend.js work
function callPlugins() { }

function timeOut() {
    if (lastAction==null) {
        setTimeout(timeOut, inactiveTimeout);
        return;
    }
    if ((lastAction + inactiveTimeout) <= Date.now()){
        cleanup();
        setTimeout(timeOut, inactiveTimeout);
        return;
    }
    setTimeout(timeOut, lastAction + inactiveTimeout - Date.now());
}

function doneAction() {
    lastAction = Date.now();
}

function getAccounts(session_token) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            readData(JSON.parse(this.responseText));
        }
    };
    xhttp.open("POST", host + "rest/password.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhttp.send("session_token="+session_token);
}

function readData(data0) {
    console.log("Received Data");
    doneAction();
    data = data0;
    if (data["status"] != "success") {
        error = "Server Error: " + data["message"];
        console.log(error);
        cleanup();
        return;
    }
    accounts = null;
    //Read Accounts if available
    if (secretkey != "")
        readPasswords();
}

function readPasswords()
{
    accounts = [];
    accountArray = data["accounts"];
    for (var i = 0; i < accountArray.length; i++) {
        var account = accountArray[i];
        var index = account["index"];
        var other = JSON.parse(decryptchar(String(account["additional"]),secretkey));
        accounts[index]  = { "index":index, "name":decryptchar(account["name"], secretkey), "url":other["url"], "username":other["user"], "enpassword": account["kss"]};
    }
    chrome.browserAction.setIcon({ path: "iconLoggedIn.png" });
    console.log("Decrypted Accounts");
}

function receiveUserSession(session) {
    error = "";
    doneAction();
    console.log("Received session");
    var cryptoData = JSON.parse(session["encryptionWrapper"]);
    var encryptionWrapper = new EncryptionWrapper(cryptoData["secretkey"], cryptoData["jsSalt"], cryptoData["pwSalt"], cryptoData["alphabet"]);

    backend = new AccountBackend();
    backend._sessionToken = session["sessionToken"];
    backend.domain = host;
    backend.encryptionWrapper = encryptionWrapper;
    backend.loadAccounts()
        .then(function(){
            console.log(backend);
            doneAction();
        })
        .catch(function() {
            encryptionWrapper = null;
        });
}

function cleanup(){
    for (item in accounts){
        for (value in accounts[item])
            accounts[item][value] = null;
    }
    if (accounts!= null) {
        accounts.length = 0;
        accounts = null;
    }
    data = null;
    secretkey = null;
    default_letter_used = null;
    default_length = null;
	salt1 = null;
	salt2 = null;
	confkey = null;
	username = null;
    lastAction = null;
    chrome.browserAction.setIcon({ path: "iconLoggedOut.png" });
    console.log("Logged out");
}

function forceSelectAccount(index){
    activeAccountIndexForced = index;
    activeAccountIndex = null;
}

function isLoggedIn() {
    doneAction();
    return (secretkey != "") && (secretkey != null) && (accounts!= null);
}

function getUsername() {
    doneAction();
    return username;
}

function getPassword(account) {
    doneAction();
    var key = decryptchar(account["enpassword"], secretkey);
    var conf = confkey;
    var sha512 = String(CryptoJS.SHA512(account["name"]));
    activeAccountIndexForced = null;
    return get_orig_pwd(conf, salt2, sha512, default_letter_used, key);
}

function getAccountForDomain(domain) {
    var applicableAccounts = getAccountsForDomain(domain);
    for (var item in applicableAccounts) {
        if (applicableAccounts[item]["active"] == true)
            return applicableAccounts[item];
    }
    return null;
}

function getAccountsForDomain(domain) {
    doneAction();
    var result = [];
    var markedActive = false;
    var bestFitIndex = -1;
    var bestFitLength = 0;
    for (var item in accounts) {
        var account = accounts[item];
        var url = account["url"];
        if (item == activeAccountIndexForced) {
            markedActive = true;
            account["active"] = true;
            result.push(accounts[item]);
        }
        else if (url.length < 5) {
            continue;
        }
        else if (domain.indexOf(url) >= 0) {
            account["active"] = item == activeAccountIndex;
            markedActive = account["active"] || markedActive;
            if (url.length > bestFitLength) {
                bestFitLength = url.length;
                bestFitIndex = result.length;
            }
            result.push(account);
        }
    }
    if (!markedActive ) {
        activeAccountIndex = null;
        if (bestFitIndex >= 0)
            result[bestFitIndex]["active"] = true;
    }
    return result;
}

function setActiveAccount(index, url) {
    activeAccountIndex = index;
    activeAccountIndexForced = null;
}

loadSettings(function(){ timeOut(); });
