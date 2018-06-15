// select storage location
storage = chrome.storage.local;
if ("sync" in chrome.storage)
    storage = chrome.storage.sync;
versionRequired = [10,0];

function validateVersion(versionString){
    var version = versionString.split('.').map(function (x){return parseInt(x);});
    return (version[0]==versionRequired[0] && version[1]>=versionRequired[1]);
}

function ValidURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
}

// validate url wrapper
function sanitize_url(url) {
    if (!ValidURL(url)){
        return "";
    }
    if (url.slice(-1)!="/"){
        url += "/";
    }
    return url
}

// Saves options to chrome.storage
function save_options() {
    var timeout = document.getElementById('timeout').value;
    var url = document.getElementById('url').value;
    url = sanitize_url(url);
    if (url == "") {
        document.getElementById('status').textContent= 'Please enter a valid URL';
        return;
    }
    document.getElementById('url').value = url;

    storage.set({
        timeout: parseInt(timeout),
        url: url
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
            close();
        }, 1000);
        chrome.runtime.sendMessage({"request":"options"}, function(response) {});
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    storage.get({
        timeout: 10,
        url: ""
    }, function(items) {
        document.getElementById('timeout').value = items.timeout;
        document.getElementById('url').value = items.url;
    });
}

// check if url contains a valid password manager version
function check_manager() {
    var url = document.getElementById('url').value;
    url = sanitize_url(url);
    if (url == "") {
        document.getElementById('status').textContent= 'Please enter a valid URL';
    }
    document.getElementById('url').value = url;

    function checkResult() {
        var state = document.getElementById('status');
        try{
            var info = JSON.parse(this.responseText);
            if (validateVersion(info["version"])) {
                state.textContent = 'Password Manager instance is ok (Version ' + info["version"] + ')';
            }
            else {
                state.textContent = 'Password Manager version mismatch(' + info["version"] + ', expected: ' + versionRequired[0] + '.' + versionRequired[1] + ')';
            }
        }
        catch (e){
            state.textContent= 'Error occured while checking your Password Manager instance: ';
            state.append(document.createElement('br'));
            state.append(document.createTextNode(e));
            state.append(document.createElement('br'));
            state.append(document.createTextNode('Please check your url'));
        }
    }
    var pwReq = new XMLHttpRequest();
    pwReq.addEventListener("load", checkResult);
    pwReq.open("POST", url + "rest/info.php");
    pwReq.send();
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
        save_options);
document.getElementById('check').addEventListener('click',
        check_manager);

