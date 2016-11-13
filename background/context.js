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
    }
}


function getDomainFromUrl(url) {
    return url.split('/')[2].split(':')[0];
}

function getAccount(url){
    domain = getDomainFromUrl(url);
    return getAccountForDomain(url);
}

function InsertUsername(url){
    account = getAccount(url);
    if (account != null) {
        insertTextIntoSelectedInput(account["username"]);
    }
    else {
        if (!loggedIn())
            insertTextIntoSelectedInput("not logged in");
        else
            insertTextIntoSelectedInput("no account found");
    }
}

function InsertPassword(url){
    account = getAccount(url);
    if (account != null) {
        insertTextIntoSelectedInput(getPassword(account));
    }
    else
        insertTextIntoSelectedInput("");
}

// Create one test item for each context type.
var contexts = ["page","editable"];
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
// Page
//contextEntries["add"] = chrome.contextMenus.create(
//        {"title": "Add Account", "parentId": menu["page"], "onclick": genericOnClick});
//contextEntries["show"] = chrome.contextMenus.create(
//        {"title": "Show Account", "parentId": menu["page"], "onclick": genericOnClick});
//contextEntries["login"] = chrome.contextMenus.create(
//        {"title": "Show Account", "parentId": menu["page"], "onclick": genericOnClick});
// Editable
contextEntries["user"] = chrome.contextMenus.create(
        {"title": "Insert Username", "parentId": menu["editable"], "contexts":[context], "onclick": genericOnClick});
contextEntries["password"] = chrome.contextMenus.create(
        {"title": "Insert Password", "parentId": menu["editable"], "contexts":[context], "onclick": genericOnClick});
