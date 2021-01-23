"""
    Copyright 2020 Andrew Brown (aka SherpDaWerp)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
"""

from nspywrapper import *

# # # # # BITS TO BE EDITED BELOW HERE # # # # #

main_name = "main_nation_name"

transfer_card = ["transfer_card_id", "transfer_card_season"]

puppets = {
  "puppet_name_1": "password",
  "puppet_name_2": "password",
  "puppet_name_3": "password"
}

# # # # # BITS TO BE EDITED ABOVE HERE # # # # #

main_name = main_name.replace(" ", "_").lower()
agent = main_name + " , using SherpDaWerp's transfer cleanup tool"

nsapi = nsRequests(agent)
request = nsapi.world(shards=["card", "owners"], parameters={"cardid": transfer_card[0], "season": transfer_card[1]})
owners = request.data["CARD"]["OWNERS"]
owners_list = [owner["OWNER"] for owner in owners]

puppets = {new_key.replace(" ", "_").lower(): puppets[new_key] for new_key in puppets.keys()}
gift_queue = [owner for owner in owners_list if owner in puppets.keys()]

prev_pup = None
for pup_name in gift_queue:
    if pup_name == main_name:
        continue
    params = {"cardid": transfer_card[0], "season": transfer_card[1], "to": main_name, "mode": "prepare"}

    prepare = nsapi.command(
        nation=pup_name,
        command="giftcard",
        parameters=params,
        auth=(
            puppets[pup_name],
            x_autologin if prev_pup == pup_name else "",
            x_pin if prev_pup == pup_name else "",
        ),
    )

    if prepare.status != 200:
        print("An error was encountered preparing a gift from " + pup_name + ". Error Code: +" + str(prepare.status))
        continue

    try:
        x_autologin, x_pin = prepare.get_auth()
    except MissingHeaders:
        if prev_pup != pup_name:
            x_autologin = ""
            x_pin = ""
            prev_pup = -1
    else:
        prev_pup = pup_name

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
