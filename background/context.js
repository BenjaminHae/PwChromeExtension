// handle click on context menu item
function genericOnClick(info, tab) {
    switch (info.menuItemId) {
        case contextEntries["add"]: break;
        case contextEntries["show"]: break;
        case contextEntries["login"]: break;
        case contextEntries["user"]: 
                                      InsertUsername(tab.url);
                                      break;
        case contextEntries["password"]: 
                                      InsertPassword(tab.url);
                                      break;
        case contextEntries["signin"]: 
                                      InsertUsernameAndPasswordAndSignin(tab.url);
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

function InsertUsername(url){
    account = getAccount(url);
    if (account != null) {
        insertTextIntoSelectedInput(account["username"]);
    }
    else {
        if (!isLoggedIn()) {
            chrome.tabs.create({url:host});
            insertTextIntoSelectedInput("not logged in");
        }
        else
            insertTextIntoSelectedInput("no account found");
    }
}

function InsertPassword(url){
    account = getAccount(url);
    if (account != null) {
        insertTextIntoSelectedInput(getPassword(account));
    }
    else {
        if (!isLoggedIn()) {
            chrome.tabs.create({url:host});
        }
        insertTextIntoSelectedInput("");
    }
}

function InsertUsernameAndPasswordAndSignin(url){
    account = getAccount(url);
    if (account != null) {
        executeScript(function (args) {
            var input = document.activeElement;
            input.value = args["user"];
            form = input.closest("form");
            passwd = form.querySelectorAll("input[type=password]")[0];
            passwd.value = args["passwd"];

            //Hack to prevent issues with forms containing <input name="submit"
            //See https://stackoverflow.com/a/41846503/3592375
            var submitFormFunction = Object.getPrototypeOf(form).submit;
            submitFormFunction.call(form);

        }, { 'user':account["username"], 'passwd':getPassword(account)});
    }
    else {
        if (!isLoggedIn()) {
            chrome.tabs.create({url:host});
            insertTextIntoSelectedInput("not logged in");
        }
        else
            insertTextIntoSelectedInput("no account found");
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
