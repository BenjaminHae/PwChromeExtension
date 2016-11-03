Chrome Addon
============

This is a Chrome Extension for the password manager(https://github.com/zeruniverse/Password-Manager).
It currently supports inserting username and password into inputs in pages for whose urls accounts exist.

Preparation
-----------

You need to replace https://%HOST%/ with the address of your own instance of the password manager.

    find ./ -type f -exec sed -i -e 's#%HOST%#www.yourhost.de#g' {}\;

The code of the password manager must be changed. In the file "src/password.php" add to the end of the function "dataReady"

    var evt= new CustomEvent("secretKeyReady", {'detail':{'secretkey': secretkey, 'session_token': sessionStorage.session_token, 'confkey': sessionStorage.confusion_key, 'username':getcookie('username') }});
    document.dispatchEvent(evt);
