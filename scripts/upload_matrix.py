"""
Read information from spreadsheet of matrix items

TO RUN: 
 - site must be running locally (via >_npm start)
 - must be logged in
"""

import argparse
import csv
import time
import requests
import json

parser = argparse.ArgumentParser(description='Script to upload matrix items to MongoDB from CSV')
parser.add_argument("--file", default='', help="File path of CSV")
args = parser.parse_args()

filename = args.file
print(filename)

url = 'http://localhost:8000/matrix'
# matrix = requests.get(url).json()
# print('\nretrieved all matrix items\n')


headers = {'Content-Type': "application/json", 'Accept': "application/json"}
with open(filename) as csvfile:
    csvreader = csv.reader(csvfile, delimiter=',')
    num = 0
    for row in csvreader:
        if num >= 2:
            matrix_item = {
                'title': row[0],
                'positivePoints': row[1],
                'negativePoints': row[2],
                'notes': row[3],
                'assigner': row[4],
                'tag': row[5]
            }
            json_string = json.dumps(matrix_item, indent=4)
            print('making POST request to ' + url)
            print(json_string)
            r = requests.post(url, data=json_string, headers=headers)
            print('POST request complete')
            print(r)
        num = num + 1
