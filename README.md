Chrome Addon
============

Version 0.3.5-beta

This is a Chrome Extension for the [Password-Manager](https://github.com/zeruniverse/Password-Manager).
Currently, it supports inserting username and password into inputs in pages whose urls exist in the password manager.
This addon doesn't write any changes to your account.

Installation
------------

+ Install [Password-Manager](https://github.com/zeruniverse/Password-Manager).
+ In Chrome: Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/password-manager/mbfjokpccbakbnnpklkcginkalkijkan).
+ In Firefox: Install from [Add-ons](https://addons.mozilla.org/de/firefox/addon/self-hosted-password-addon/).
+ Click the now new icon and input the url of your Password-Manager instance.

Usage
----- 

After installation, you will find a new icon in your menu.
Once you log in to your password manager, the addon will automatically load your accounts.

A popup containing all available accounts for the current web page will show up if you click the addon icon. Choosing an account makes it default until you visit another url.

The context entry "Password-Manager" will show up if you right-click on an input field, where you can choose to "Insert Username" or "Insert Password". Data of the default account will be inserted into the selected input field. The addon will try to login current website automatically if you click "Sign In".

Note: After 10 minutes of inactivity, you will automatically get logged out from your password manager.

Future Plans
------------

  + Remember which account is chosen as default for a webpage
