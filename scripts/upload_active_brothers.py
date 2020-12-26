"""
Read information from spreadsheet of active brothers

If brother is already in database, do nothing
Else add brother to database

TO RUN: 
 - site must be running locally (via >_npm start)
 - must be logged in
"""

import argparse
import csv
import time
import requests
import json

parser = argparse.ArgumentParser(description='Script to upload active brothers to MongoDB from CSV')
parser.add_argument("--file", default='', help="File path of CSV")
args = parser.parse_args()

filename = args.file
print(filename)

url = 'http://localhost:8000/users'
users = requests.get(url).json()
print('\nretrieved all users\n')

existing_badges = []
badges_to_ids = {}
for user in users:
    badge = user['badgeNumber']
    existing_badges.append(badge)
    badges_to_ids[badge] = user['_id']

def get_positions_all_false():
    return  {
        'GP': False,
        'VGP': False,
        'P': False,
        'NME': False,
        'Hod': False,
        'Hi': False,
        'AG': False,
        'SG': False,
        'BG': False,
        'Phu': False,
        'Risk Manager': False,
        'Rush Chair': False
    }

def get_positions(positions):
    if len(positions) != 12:
        return get_positions_all_false()
    return  {
        'GP': positions[0] == 'TRUE',
        'VGP': positions[1] == 'TRUE',
        'P': positions[2] == 'TRUE',
        'NME': positions[3] == 'TRUE',
        'Hod': positions[4] == 'TRUE',
        'Hi': positions[5] == 'TRUE',
        'AG': positions[6] == 'TRUE',
        'SG': positions[7] == 'TRUE',
        'BG': positions[8] == 'TRUE',
        'Phu': positions[9] == 'TRUE',
        'riskManager': positions[10] == 'TRUE',
        'rushChair': positions[11] == 'TRUE'
    }

with open(filename) as csvfile:
    csvreader = csv.reader(csvfile, delimiter=',')
    for row in csvreader:
        if len(row) == 16:
            if row[0] != 'Last Name':
                last_name = row[0]
                first_name = row[1]
                badge = row[2]
                admin = row[3] == 'TRUE'
                positions = get_positions(row[4:])
                user = {
                    'firstName': first_name,
                    'lastName': last_name,
                    'badgeNumber': badge,
                    'admin': admin,
                    'officerPositions': positions
                }
                json_string = json.dumps(user, indent=4)
                headers = {'Content-Type': "application/json", 'Accept': "application/json"}
                if badge in existing_badges:
                    mongoId = badges_to_ids[badge]
                    put_url = url + '/' + mongoId
                    print('user already in database, making PUT request to ' + put_url)
                    r = requests.put(put_url, data=json_string, headers=headers)
                    print('PUT request complete')
                    print(r)
                else:
                    print('user not in database, making POST request to ' + url)
                    r = requests.post(url, data=json_string, headers=headers)
                    print('POST request complete')
                    print(r)

        else:
            print(row)
            print('\t\tnot proper length')
