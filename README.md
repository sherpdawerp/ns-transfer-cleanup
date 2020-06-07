# ns-transfer-cleanup
A nice, easy script to automate cleanup after a mass-copy bank transfer in NationStates Cards. This script goes through a given list of puppets and gifts any copies of the given transfer card back to your main nation, so you don't have to do it manually!

### Usage Information:
To use this script, you will need to have Python 3 installed. You can download it [here.](https://www.python.org/downloads/)

Download or copy-paste this code into the Python IDE of your choice.
At the top of the code, you will find this block:
```python
# # Bits that you need to change # #
puppets = [
    ["nation name", "nation password"],
    ["nation name", "nation password"]
]
main_name = "main nation name"
transfer_card = ["transfer card id", "transfer card season"]
# # Bits that you need to change # #
```
To use the script, enter all of your puppet names and passwords in the array format provided, enter the name of your main nation (the nation that the cards will be gifted to) and the details of the transfer card (card ID and season).

If you enter someone else's nation name as main_name, they will recieve all the cards, so make sure it's correct!

Once that's done, run the code! It has to make two API calls per nation (and wait a little bit in between each call), so it might take a while. 
### Disclaimer:
This script *requires* you to input the passwords for your nations. That's how the NS API can verify that it's really you who wants to gift the cards. The code is all open-source; I cannot see or access any data you input in any way shape or form. Your passwords are only stored locally on your computer when you edit them into the file, and only get transmitted to the NS API - nowhere else.
### Common Outputs:
```
imperial_regiment_i does not have the transfer card
```
If you see this message, then the named puppet doesn't have a copy. Don't worry - the code will automatically keep going through the rest of the list!
```
imperial_regiment_i encountered an error in gifting
```
If you see this message, then the named puppet *does* have a copy, but can't gift for some reason. Possible causes include that your main nation is full and cannot recieve gifts, or the named puppet doesn't have enough bank to gift the card.
```
imperial_regiment_i suffered an error preparing the gift. Check the spelling of the nation name and password!
imperial_regiment_i suffered an error making the gift. Check the spelling of the nation name and password!
```
If you see either of these messages, then the returned data isn't what the code expects it should be. The most common cause of this is misspellings in the puppet names/passwords, so make sure they're all spelt right! If you know they're all correct, and you still recieve this error, please contact me via Discord DM or NS Telegram.
```
Card gifted to SherpDaWerp for 0.01, from imperial_regiment_i
```
If you see this message, then, as it says, the named puppet has gifted a copy of the transfer card back to the named main nation!

**Note:**
Currently, if a puppet has more than one copy, only one gets gifted. The next thing I'll work on is making sure all copies of the transfer card get gifted back to the main nation, but in the meantime, running the script again will make sure that any puppet with two copies gets covered, and again for third copies, and so on.
