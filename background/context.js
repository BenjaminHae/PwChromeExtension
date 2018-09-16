// handle click on context menu item
function genericOnClick(info, tab) {
    var frameId = info["frameId"];
    switch (info.menuItemId) {
        case contextEntries["add"]: break;
        case contextEntries["show"]: break;
        case contextEntries["login"]: break;
        case contextEntries["user"]: 
                                      InsertUsername(tab.url, frameId);
                                      break;
        case contextEntries["password"]: 
                                      InsertPassword(tab.url, frameId);
                                      break;
        case contextEntries["signin"]: 
                                      InsertUsernameAndPasswordAndSignin(tab.url, frameId);
                                      break;
    }
}


function getDomainFromUrl(url) {
    return url.split('/')[2].split(':')[0];
}

function getAccount(url){
    domain = getDomainFromUrl(url);
    return getAccountForDomain(url);//ToDo, bug? url != Domain
}

function InsertUsername(url, frameId = 0){
    account = getAccount(url);
    if (account != null) {
        insertTextIntoSelectedInput(account["other"]["user"], frameId);
    }
    else {
        if (!isLoggedIn()) {
            chrome.tabs.create({url:host});
            insertTextIntoSelectedInput("not logged in", frameId);
        }
        else
            insertTextIntoSelectedInput("no account found", frameId);
    }
}

function InsertPassword(url, frameId = 0){
    account = getAccount(url);
    if (account != null) {
        getPassword(account)
            .then(function(password) {
                insertTextIntoSelectedInput(password, frameId);
            });
    }
    else {
        if (!isLoggedIn()) {
            chrome.tabs.create({url:host});
        }
        insertTextIntoSelectedInput("", frameId);
    }
}

function InsertUsernameAndPasswordAndSignin(url, frameId = 0){
    account = getAccount(url);
    if (account != null) {
        account.getPassword()
            .then(function(password) {
                executeScript(function(args) {
                    var input = document.activeElement;
                    input.value = args["user"];
                    input.dispatchEvent(new Event('change'));
                    let form = input.closest("form");
                    let passwd = form.querySelectorAll("input[type=password]")[0];
                    passwd.value = args["passwd"];
                    passwd.dispatchEvent(new Event('change'));
                }, { 'user': account["other"]["user"], 'passwd': password}, frameId);
                return new Promise(resolve => setTimeout(resolve, 250));
            })
            .then(function() {
                executeScript(function(args) {
                    let form = document.activeElement.closest("form");
                    let buttons = form.querySelectorAll("[type=submit]");
                    if (buttons.length > 0) {
                        buttons[0].click();
                    }
                    else {
                        //Hack to prevent issues with forms containing <input name="submit"
                        //See https://stackoverflow.com/a/41846503/3592375
                        let submitFormFunction = Object.getPrototypeOf(form).submit;
                        submitFormFunction.call(form);
                    }
                }, {});
            });
    }
    else {
        if (!isLoggedIn()) {
            chrome.tabs.create({url: host});
            insertTextIntoSelectedInput("not logged in", frameId);
        }
        else
            insertTextIntoSelectedInput("no account found", frameId);
    }
}

// Create one test item for each context type.
var contexts = ["editable"];//"page"
var menu =[];
for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Password-Manager";
    var id = chrome.contextMenus.create({"title": title, "contexts":[context],
        "onclick": genericOnClick});
    menu[context] = id;
}


// Create context entries 
var contextEntries = [];
// Editable
contextEntries["user"] = chrome.contextMenus.create(
        {"title": "Insert Username", "parentId": menu["editable"], "contexts":[context], "onclick": genericOnClick});
contextEntries["password"] = chrome.contextMenus.create(
        {"title": "Insert Password", "parentId": menu["editable"], "contexts":[context], "onclick": genericOnClick});
contextEntries["signin"] = chrome.contextMenus.create(
        {"title": "Sign in", "parentId": menu["editable"], "contexts":[context], "onclick": genericOnClick});
