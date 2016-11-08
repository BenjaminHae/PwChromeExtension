Chrome Addon
============

This is a Chrome Extension for the password manager(https://github.com/zeruniverse/Password-Manager).
It currently supports inserting username and password into inputs in pages for whose urls accounts exist.

Preparation
-----------

You need to replace https://%HOST%/ with the address of your own instance of the password manager.

    find ./ -type f -exec sed -i -e 's#%HOST%#www.yourhost.de#g' {}\;

