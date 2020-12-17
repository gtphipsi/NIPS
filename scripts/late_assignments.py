"""
Fetches the list of all point assigners who assigned points
late (greater than 48 hours after the points were earned)

@author Colin Cassell
"""
import time
from bson.objectid import ObjectId
from pymongo import MongoClient

client = MongoClient('mongodb+srv://phikappapsi:liveeverdienever@pkp.alpwd.mongodb.net/test')
db = client.NIPS
transactions = db.Transactions.find()

print("----All transactions submitted late (over 48 hours after points were earned)----")

for t in transactions:
    time1 = t.get('dateEarned')
    time2 = t.get('dateAssigned')
    diff = (time2 - time1).total_seconds()
    if (diff > 172800):
        assigner = db.Users.find_one({'_id': ObjectId(t.get('assigner'))})
        receiver = db.Users.find_one({'_id': ObjectId(t.get('receiver'))})

        print("Assigner: " + assigner.get('firstName') + " " + assigner.get('lastName'))
        print("Receiver: " + receiver.get('firstName') + " " + receiver.get('lastName'))
        print("Date points were earned: " + str(time1))
        print("Date points were assigned: " + str(time2))
        print("Difference: " + str(time2 - time1))
        print("Assigner ID: " + str(assigner.get('_id')) + "\n")