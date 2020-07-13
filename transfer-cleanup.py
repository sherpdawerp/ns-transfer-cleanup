from nspywrapper import nsRequests, FailedRequest
from .transfer_cleanup_vars import *

main_name = main_name.replace(" ", "_").lower()
puppets = {new_key.replace(" ", "_").lower(): puppets[new_key] for new_key in puppets.keys()}


agent = main_name + " , using SherpDaWerp's transfer cleanup tool"
nsapi = nsRequests(agent)

request = nsapi.world(shards=["card", "owners"], parameters={"cardid": transfer_card[0], "season": transfer_card[1]})
owners = request[1]["CARD"]["OWNERS"]
owners_list = [owner["OWNER"] for owner in owners]

gift_queue = [owner for owner in owners_list if owner in puppets.keys()]

for pup_name in gift_queue:
    params = {"cardid": transfer_card[0], "season": transfer_card[1], "to": main_name, "mode": "prepare"}

    try:
        prepare = nsapi.command(nation=pup_name, command="giftcard", parameters=params, auth=(puppets[pup_name], "", ""))
    except FailedRequest as err:
        print("An error was encountered preparing a gift from "+pup_name)
        continue

    try:
        x_autologin = prepare[0]["X-autologin"]
        x_pin = prepare[0]["X-pin"]
    except KeyError:
        x_autologin = ""
        x_pin = ""

    try:
        token = prepare[1]["NATION"]["SUCCESS"]
    except KeyError:
        try:
            message = prepare[1]["NATION"]["ERROR"]
        except KeyError:
            message = prepare[1]

        print(message + " (" + pup_name + ")")
        continue

    params = {"cardid": transfer_card[0], "season": transfer_card[1], "to": main_name, "mode": "execute", "token": token}

    try:
        execute = nsapi.command(nation=pup_name, command="giftcard", parameters=params, auth=(puppets[pup_name], x_autologin, x_pin))
    except FailedRequest as err:
        print("An error was encountered making a gift from "+pup_name)
        continue

    try:
        message = prepare[1]["NATION"]["SUCCESS"]
    except KeyError:
        try:
            message = prepare[1]["NATION"]["ERROR"]
        except KeyError:
            message = prepare[1]

    print(message + " (" + pup_name + ")")

print("\nCompleted!")
