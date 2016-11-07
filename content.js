document.addEventListener('secretKeyReady', function(e){
    //send message to ext
    console.log(e.detail);
    chrome.runtime.sendMessage({"request":"session", "data":e.detail}, function(response) {
        //callback
    });
}, false);

document.addEventListener('loggedOut', function(e){
    //send message to ext
    chrome.runtime.sendMessage({"request":"logout"}, function(response) {
        //callback
    });
}, false);

function executeScript(script,args) {
    var payload = '(' + script + ')('+JSON.stringify(args)+');';
    var script = document.createElement('script');
    script.textContent = payload;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
}

console.log(103);
function getActions() {
    console.log("ask for actions");
    chrome.runtime.sendMessage({"request":"actions"}, function(response) {
        console.log(response);
        var request = response;//JSON.parse(response);
        switch(request["request"]){
            case "login":
                //data contains secretkey. It must be set using executeScript
                executeScript(function(data){
                    console.log('logging in');
                    console.log(data);
                    var salt = data["salt"];
                    setpwdstore(data["sk"],decryptchar(data["confKey"],salt),salt);
                }, {'sk': request["data"]["sk"],'confKey': request["data"]["confKey"], "salt":request["data"]["salt"]});
                getActions();
                break;
            case "edit":
                executeScript(function(data){
                    edit(data["index"]);
                }, {'index': request["data"]});
                break;
            case "addAccount":
                executeScript(function(data){
                    $("#newiteminputurl").val(data["url"]);
                    $("#newbtn").click();
                }, {"url":request["data"]["url"]});
                break;
            case "none": break;
        }
    });
}
getActions();
console.log(104);

executeScript(function(){
    var dataReadyOriginal = dataReady; 
    dataReady = function(data) {
        console.log("105 - before");
        dataReadyOriginal(data);
        console.log("100 - after");
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
    console.log(101);
},null);
console.log(102);
