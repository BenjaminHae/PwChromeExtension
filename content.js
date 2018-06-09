var pwAddonHost = false;
chrome.runtime.sendMessage({"request":"host"}, function(response) {
    pwAddonHost = document.location.href.startsWith(response["data"]["url"] + 'password.php');
    if (pwAddonHost) {
        getActions();
    }
});
document.addEventListener('secretKeyReady', function(e) {
    //send secretKey to Addon
    getActions();
    chrome.runtime.sendMessage({"request":"session", "data":e.detail}, function(response) {
    });
}, false);

document.addEventListener('loggedOut', function(e) {
    //log addon out
    chrome.runtime.sendMessage({"request": "logout", "data": {"url": e.detail.url}}, function(response) {
    });
}, false);
document.addEventListener('selectedAccount', function(e) {
    if (pwAddonHost) {
        chrome.runtime.sendMessage({"request": "selectAccount", "data": {"index": e.detail.index}}, function(response) { });
    }
}, false);

function executeScript(script, args) {
    var payload = '(' + script + ')('+JSON.stringify(args)+');';
    var script = document.createElement('script');
    script.textContent = payload;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
}

function getActions() {
    chrome.runtime.sendMessage({"request":"actions"}, function(response) {
        if (!pwAddonHost) {//check if this is really the right url before sending any confidential data
            // return actions to still make other PWmanager instances work
            var evt = new CustomEvent("actionsReceived", null);
            document.dispatchEvent(evt);
            return;
        }
        var request = response;//JSON.parse(response);
        switch(request["request"]) {
            case "login":
                //data contains secretkey. It must be set using executeScript
                executeScript(function(data) {
                    if (typeof(thisIsThePasswordManager) === 'undefined' || thisIsThePasswordManager === null || thisIsThePasswordManager != "d8180864-4596-43a0-9701-99840e5c4259")
                        return;
                    console.log('logging in');

                    var cryptoData = JSON.parse(data["encryptionWrapper"]);
                    window.encryptionWrapper = new EncryptionWrapper(cryptoData["secretkey"], cryptoData["jsSalt"], cryptoData["pwSalt"], cryptoData["alphabet"]);
                    window.encryptionWrapper._confkey = cryptoData["_confkey"];
                    //actionsReceived = true;
                }, {'encryptionWrapper': request["data"]["encryptionWrapper"]});
                break;
            case "logout":
                executeScript(function(data) {
                    if (typeof(thisIsThePasswordManager) === 'undefined' || thisIsThePasswordManager === null || thisIsThePasswordManager != "d8180864-4596-43a0-9701-99840e5c4259")
                        return;
                    backend.logout();
                }, null);
                break;
            case "edit":
                executeScript(function(data) {
                    if (typeof(thisIsThePasswordManager) === 'undefined' || thisIsThePasswordManager === null || thisIsThePasswordManager != "d8180864-4596-43a0-9701-99840e5c4259")
                        return;
                    edit(data["index"]);
                }, {'index': request["data"]});
                break;
            case "addAccount":
                executeScript(function(data) {
                    if (typeof(thisIsThePasswordManager) === 'undefined' || thisIsThePasswordManager === null || thisIsThePasswordManager != "d8180864-4596-43a0-9701-99840e5c4259")
                        return;
                    $('#add').modal('show');
                    $("#newiteminputurl").val(data["url"]);
                }, {"url":request["data"]["url"]});
                break;
            case "none": break;
        }
        var evt = new CustomEvent("actionsReceived", null);
        document.dispatchEvent(evt);
    });
}

executeScript(function() {
    if (typeof(thisIsThePasswordManager) === 'undefined' || thisIsThePasswordManager === null || thisIsThePasswordManager != "d8180864-4596-43a0-9701-99840e5c4259")
        return;
    // We can't be sure this is "our" Password Manager here so the URL get's checked in every "action" instead
    document.addEventListener('actionsReceived', function(e) {
        actionsReceived = true;
    });
    var actionsReceived = false;
    window.encryptionWrapper = null;
    registerPlugin("preDataReady", function() {
        return new Promise((resolve, reject) => {
            if (actionsReceived) {
                resolve();
            }
            var maxChecks = 100;
            const timeOutLength = 30;
            function checkActionsReceived() {
                if (actionsReceived) {
                    if (window.encryptionWrapper) {
                        backend.encryptionWrapper = window.encryptionWrapper;
                    }
                    resolve();
                }
                else {
                    maxChecks -= 1;
                    if (maxChecks > 0) {
                        setTimeout(checkActionsReceived, timeOutLength);
                    }
                }
            }
            setTimeout(checkActionsReceived, timeOutLength);
        });
    });
    registerPlugin("accountsReady", function() {
        backend.encryptionWrapper.getConfkey()
            .then(function(confkey) {
                //getConfkey only get's called to explicitly set the confkey in encryptionWrapper._confkey,
                // so it's contained in the encryptionWrapper JSON
                var evt = new CustomEvent("secretKeyReady", {
                    'detail': {
                        'encryptionWrapper': JSON.stringify(backend.encryptionWrapper),
                        'username': backend.user, 
                        'sessionToken': backend.sessionToken,
                        'url': window.location.href 
                    }
                });
                document.dispatchEvent(evt);
            });
    });
    registerPlugin("preLogout", function() {
        var evt = new CustomEvent("loggedOut", {'detail':{'url':window.location.href}});
        document.dispatchEvent(evt);
    });

    // Add a symbol to select an account from the password manager in the addon
    registerPlugin("drawAccount", function(data) {
        var account = data["account"];
        var row = data["row"];
        row.find(".namecell .cellOptionButton:last").before($('<a>')
            .attr('title', "Select account for usage with addon")
            .attr('class', 'cellOptionButton')
            .on('click', {'index':account["index"]}, function(e) {
                var evt = new CustomEvent("selectedAccount", {"detail":{"index":e.data.index}});
                document.dispatchEvent(evt);
                showMessage('success', 'This account is now selected in your browser addon.');
            })
            .append($('<span></span>')
                .attr('class', 'glyphicon glyphicon-share')));
    });
}, null);
