Chrome Addon
============

Version 0.2-beta

This is a Chrome Extension for the password manager(https://github.com/zeruniverse/Password-Manager).
It currently supports inserting username and password into inputs in pages for whose urls accounts exist.
This addon doesn't write any changes to the password manager.

Installation
------------

Make sure you have an instance of the password manager(version 9.11 and above) installed.
Download the current version of the addon from [releases](https://github.com/BenjaminHae/PwChromeExtension/releases) and install it in your browser. For chrome you have to download the file, then drag it onto the addon manager.:w
Afterwards click on the new icon and fill in the url of your password manager instance.

Usage
----- 

After installation you will find a new icon in your menu. 
When you log in to your password manager the addon automatically loads your accounts.
When logged in clicking the icon shows a popup containing the available accounts for the current tab. Choosing an account makes it default until you visit another url.
Right clicking on an input field on a webpage shows the context entry "Password-Manager" here you can choose to "Insert Username" or "Insert Password". This inserts the data of the currently active account into the selected input field. Choosing "Sign In" tries to fill in username and password, then submits the form.

After 10 minutes of inactivity you automatically get logged out.

Future Plans
------------

  * Remembering which account is chosen as default for a webpage
  * Searching accounts

