// Inserts text into the currently selected input
function insertTextIntoSelectedInput(text) {
    executeScript(function (text) {
        var input = document.activeElement;
        input.value = text;
    }, text);
}

// Executes the function in script in the context of the active tab
// args as [arg1,arg2,...], single argument as arg
function executeScript(script, args) {
    var payload = '(' + script + ')('+JSON.stringify(args)+');';
    chrome.tabs.executeScript({code : payload});
}
