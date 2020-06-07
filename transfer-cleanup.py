import requests
import xmltodict
import time
import xml

# # Bits that you need to change # #
puppets = [
    ["nation name", "nation password"],
    ["nation name", "nation password"],
    ["nation name", "nation password"]
]
main_name = "main nation name"
transfer_card = ["transfer card id", "transfer card season"]
# # Bits that you need to change # #

debug = False
agent = main_name + " , using SherpDaWerp's transfer cleanup tool."
main_name = main_name.replace(" ", "_")
last_request_time = int(round(time.time() * 1000)) - 1000

for puppet in puppets:
    pup_name = puppet[0].replace(" ", "_")
    headers = {"User-Agent": agent,
               "X-Password": puppet[1],
               "X-Pin": ""}

    url = "https://www.nationstates.net/cgi-bin/api.cgi?" \
          "nation="+pup_name+"&c=giftcard&cardid="+transfer_card[0]+"&season="+transfer_card[1]+"&" \
          "to="+main_name+"&mode=prepare"

    current_time = int(round(time.time() * 1000))
    delay = 600 - (current_time - last_request_time)
    if delay <= 0:
        pass
    else:
        time.sleep(delay / 1000)

    prep_giftcard = requests.get(url, headers=headers)
    headers = {"User-Agent": agent,
               "X-Password": puppet[1],
               "X-Pin": prep_giftcard.headers["X-pin"]}

    try:
        resp_data = xmltodict.parse(prep_giftcard.content, "utf-8")
    except xml.parsers.expat.ExpatError as err:
        if debug:
            print(prep_giftcard.content)
            print(err)
        print(pup_name+" suffered an error preparing the gift. Check the spelling of the nation name and password!")
        continue

    last_request_time = int(round(time.time() * 1000))

    try:
        token = resp_data["NATION"]["SUCCESS"]
    except KeyError as err:
        message = resp_data["NATION"]["ERROR"]
        if message == "You don't have this card to gift.":
            print(pup_name + " does not have the transfer card")
        else:
            if debug:
                print(resp_data)
                print(err)
        continue

    url = "https://www.nationstates.net/cgi-bin/api.cgi?" \
          "nation="+pup_name+"&c=giftcard&cardid="+transfer_card[0]+"&season="+transfer_card[1]+"&" \
          "to="+main_name+"&mode=execute&token="+token

    current_time = int(round(time.time() * 1000))
    delay = 600 - (current_time - last_request_time)
    if delay <= 0:
        pass
    else:
        time.sleep(delay / 1000)

    giftcard = requests.get(url, headers=headers)

    try:
        resp_data = xmltodict.parse(giftcard.content, "utf-8")
    except xml.parsers.expat.ExpatError as err:
        if debug:
            print(giftcard.content)
            print(err)
        print(pup_name + " suffered an error making the gift. Check the spelling of the nation name and password!")
        continue

    last_request_time = int(round(time.time() * 1000))

    try:
        message = resp_data["NATION"]["SUCCESS"]
    except KeyError as err:
        if debug:
            print(resp_data)
            print(err)
        print(pup_name + " encountered an error in gifting")
        continue

    print(message + ", from " + pup_name)
