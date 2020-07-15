from nspywrapper import *
from .transfer_cleanup_vars import *

main_name = main_name.replace(" ", "_").lower()
puppets = {new_key.replace(" ", "_").lower(): puppets[new_key] for new_key in puppets.keys()}


agent = main_name + " , using SherpDaWerp's transfer cleanup tool"
nsapi = nsRequests(agent)

request = nsapi.world(shards=["card", "owners"], parameters={"cardid": transfer_card[0], "season": transfer_card[1]})
owners = request.data["CARD"]["OWNERS"]
owners_list = [owner["OWNER"] for owner in owners]

gift_queue = [owner for owner in owners_list if owner in puppets.keys()]

for pup_name in gift_queue:
    params = {"cardid": transfer_card[0], "season": transfer_card[1], "to": main_name, "mode": "prepare"}

    prepare = nsapi.command(nation=pup_name, command="giftcard", parameters=params, auth=(puppets[pup_name], "", ""))

    if prepare.status != 200:
        print("An error was encountered preparing a gift from " + pup_name + ". Error Code: +" + str(prepare.status))
        continue

    try:
        x_autologin, x_pin = prepare.get_auth()
    except MissingHeaders:
        x_autologin = ""
        x_pin = ""

    try:
        token = prepare.data["NATION"]["SUCCESS"]
    except KeyError:
        try:
            message = prepare.data["NATION"]["ERROR"]
        except KeyError:
            message = prepare.data

        print(message + " (" + pup_name + ")")
        continue

    params = {"cardid": transfer_card[0], "season": transfer_card[1], "to": main_name, "mode": "execute", "token": token}

    execute = nsapi.command(nation=pup_name, command="giftcard", parameters=params, auth=(puppets[pup_name], x_autologin, x_pin))

    if execute.status != 200:
        print("An error was encountered preparing a gift from " + pup_name + ". Error Code: +" + str(execute.status))
        continue

    try:
        print(execute.data["NATION"])
        message = execute.data["NATION"]["SUCCESS"]
    except KeyError:
        try:
            message = execute.data["NATION"]["ERROR"]
        except KeyError:
            message = execute.data

    print(message + " (" + pup_name + ")")

print("\nCompleted!")
