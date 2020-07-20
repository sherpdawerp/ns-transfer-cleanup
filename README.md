# ns-transfer-cleanup
A nice, easy script to automate cleanup after a mass-copy bank transfer in NationStates Cards. This script goes through a given list of puppets and gifts any copies of the given transfer card back to your main nation, so you don't have to do it manually!

### Usage Information:
To use this script, you will need to have Python 3 installed. You can download it [here.](https://www.python.org/downloads/)
You will also need to install nspy_wrapper. nspy_wrapper is installable via pip - follow the instructions [here](https://github.com/abrow425/nspy_wrapper) for more information.

You will need to download the file (transfer_cleanup.py). Once you have saved a copy, edit all the necessary information into the transfer_cleanup.py file. At the top of the code (lines 19-31) the following block can be seen:
```
# # # # # BITS TO BE EDITED BELOW HERE # # # # #

puppets = {
  "puppet_name_1": "password",
  "puppet_name_2": "password",
  "puppet_name_3": "password"
}

main_name = "main_nation_name"

transfer_card = ["transfer_card_id", "transfer_card_season"]

# # # # # BITS TO BE EDITED ABOVE HERE # # # # #
```
To setup this file, enter all of your puppet names and passwords in the "dictionary" format provided (*including all the quotes*), enter the name of your main nation (the nation that the cards will be gifted to) and the details of the transfer card (card ID and season).

If you enter someone else's nation name as main_name, they will recieve all the cards, so make sure it's correct!

Once that's done, run the code! It has to make two API calls per gift (and wait a little bit in between each call), so it might take a little while. 
### Disclaimer:
This script *requires* you to input the passwords for your nations. That's how the NS API can verify that it's really you who wants to gift the cards. All the required code is open-source. (both ns-transfer-cleanup and nspy_wrapper) I cannot see or access any data you input in any way shape or form. Your passwords are only stored locally on your computer when you edit them into the file, and only get transmitted to the NS API - nowhere else.

### License:
ns-transfer-cleanup is provided under the Apache License 2.0.
