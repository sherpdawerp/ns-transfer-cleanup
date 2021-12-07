# ns-transfer-cleanup
A nice, easy script to automate cleanup after a mass-copy bank transfer in NationStates Cards. This script goes through a given list of puppets and gifts any copies of the given transfer card back to your main nation, so you don't have to do it manually!

### Usage Information:
Install the script into a userscript manager of your choice; this can be achieved very easily by simply clicking the "raw" button while looking at the file's github page. Currently, the script has been tested only in Greasemonkey, but support for the other monkeys is planned.

Once you've done that, you should see a "Cleanup" link in the banner of your standard gameside NS pages. Clicking this link will take you to the transfer-cleanup page where you can enter the relevant details (or upload files containing the relevant details).

From there, the script proceeds much like nslogin-web or goldretriever-web, except that it runs as a userscript on NS pages instead of a github-hosted domain. This lets us disregard the rare occurrences of preflight CORS requests (effectively doubling the program runtime) that come when you make API requests from a non-NS website.

### Disclaimer:
This script *requires* you to input the passwords for your nations. That's how the NS API can verify that it's really you who wants to gift the cards. All the required code is open-source. (which is just the one userscript file!) I cannot see or access any data you input in any way shape or form. Your passwords are only stored locally on your computer if you create a file - which you have to do manually - and only get transmitted to the NS API.

### License:
ns-transfer-cleanup is provided under the Apache License 2.0.
