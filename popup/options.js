// select storage location
storage = chrome.storage.local;
if ("sync" in chrome.storage)
    storage = chrome.storage.sync;

function ValidURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
}

// Saves options to chrome.storage
function save_options() {
    var timeout = document.getElementById('timeout').value;
    var url = document.getElementById('url').value;
    if (!ValidURL(url)){
        var status = document.getElementById('status').textContent= 'Please enter a valid URL';
        return;
    }
    if (url.slice(-1)!="/"){
        url += "/";
        document.getElementById('url').value = url;
    }

    storage.set({
        timeout: parseInt(timeout),
        url: url
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
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
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
        save_options);
