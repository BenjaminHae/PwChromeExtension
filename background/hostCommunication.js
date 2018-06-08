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

function receiveUserSession(session) {
    error = "";
    doneAction();
    console.log("Received session");
    var cryptoData = JSON.parse(session["encryptionWrapper"]);
    var encryptionWrapper = new EncryptionWrapper(cryptoData["secretkey"], cryptoData["jsSalt"], cryptoData["pwSalt"], cryptoData["alphabet"]);
    encryptionWrapper._confkey = cryptoData["_confkey"];

    backend = new AccountBackend();
    backend._sessionToken = session["sessionToken"];
    backend.domain = host;
    backend.encryptionWrapper = encryptionWrapper;
    return backend.loadAccounts()
        .then(function(){
            doneAction();
            chrome.browserAction.setIcon({ path: "iconLoggedIn.png" });
            console.log("Decrypted Accounts");
        })
        .catch(function(msg) {
            console.log("Error while getting accounts");
            console.log(msg);
            backend.encryptionWrapper = null;
            backend = null;
            chrome.browserAction.setIcon({ path: "iconLoggedOut.png" });
            throw msg;
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
    return (backend != null) && (backend.encryptionWrapper != null) && (backend.accounts.length > 0);
}

function getUsername() {
    doneAction();
    return username;
}

function getPassword(account) {
    doneAction();
    activeAccountIndexForced = null;
    return account.getPassword();
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
    for (var item in backend.accounts) {
        var account = backend.accounts[item];
        var url = account["other"]["url"];
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
