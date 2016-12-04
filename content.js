//ToDo guid for pwmanager
var pwAddonHost = false;
chrome.runtime.sendMessage({"request":"host"}, function(response) {
    pwAddonHost = document.location.href.startsWith(response["data"]["url"] + 'password.php');
});
document.addEventListener('secretKeyReady', function(e){
    //send secretKey to Addon
    chrome.runtime.sendMessage({"request":"session", "data":e.detail}, function(response) {
    });
}, false);

document.addEventListener('loggedOut', function(e){
    //log addon out
    chrome.runtime.sendMessage({"request":"logout"}, function(response) {
    });
}, false);

function executeScript(script,args) {
    var payload = '(' + script + ')('+JSON.stringify(args)+');';
var script = document.createElement('script');
script.textContent = payload;
(document.head||document.documentElement).appendChild(script);
script.remove();
}

function getActions() {
    chrome.runtime.sendMessage({"request":"actions"}, function(response) {
        if (!pwAddonHost)//check if this is really the right url before sending any confidential data
            return
        var request = response;//JSON.parse(response);
        switch(request["request"]){
            case "login":
                //data contains secretkey. It must be set using executeScript
                executeScript(function(data){
                    if (thisIsThePasswordManager != "21688ab4-8e22-43b0-a988-2ca2c98e5796")
                        return;
                    console.log('logging in');
                    var salt = data["salt"];
                    setpwdstore(data["sk"],decryptchar(data["confKey"],salt),salt);
                }, {'sk': request["data"]["sk"],'confKey': request["data"]["confKey"], "salt":request["data"]["salt"]});
                getActions();
                break;
            case "logout":
                executeScript(function(data){
                    if (thisIsThePasswordManager != "21688ab4-8e22-43b0-a988-2ca2c98e5796")
                        return;
                    quitpwd();
                }, null);
                break;
            case "edit":
                executeScript(function(data){
                    if (thisIsThePasswordManager != "21688ab4-8e22-43b0-a988-2ca2c98e5796")
                        return;
                    edit(data["index"]);
                }, {'index': request["data"]});
                break;
            case "addAccount":
                executeScript(function(data){
                    if (thisIsThePasswordManager != "21688ab4-8e22-43b0-a988-2ca2c98e5796")
                        return;
                    $('#add').modal('show');
                    $("#newiteminputurl").val(data["url"]);
                }, {"url":request["data"]["url"]});
                break;
            case "none": break;
        }
    });
}
//ToDo: only execute when necessary
getActions();

executeScript(function(){
    if (thisIsThePasswordManager != "21688ab4-8e22-43b0-a988-2ca2c98e5796")
        return;
    var dataReadyOriginal = dataReady; 
    dataReady = function(data) {
        dataReadyOriginal(data);
        var evt= new CustomEvent("secretKeyReady", {'detail':{'secretkey': secretkey, 'secretkey0': getpwdstore(salt2), 'session_token': localStorage.session_token, 'confkey': getconfkey(salt2), 'username':getcookie('username') }});
        document.dispatchEvent(evt);
    };
    var quitpwdOriginal = quitpwd;
    quitpwd = function() {
        var evt= new CustomEvent("loggedOut", {});
        document.dispatchEvent(evt);
        quitpwdOriginal();
    }
    var quitpwd_untrustOriginal = quitpwd_untrust;
    quitpwd_untrust = function() {
        var evt= new CustomEvent("loggedOut", {});
        document.dispatchEvent(evt);
        quitpwd_untrustOriginal();
    }
},null);
