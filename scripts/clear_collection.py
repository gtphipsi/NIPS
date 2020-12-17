"""
Deletes all documents in a given collection provided as a command line argument

@author Colin Cassell
"""

import sys
import time
from bson.objectid import ObjectId
from pymongo import MongoClient

client = MongoClient('mongodb+srv://phikappapsi:liveeverdienever@pkp.alpwd.mongodb.net/test')
db = client.NIPS

collections = db.list_collection_names()

#checks input from command line
if len(sys.argv) == 1:
    print("ERROR: Please provide a command line argument with the name of the collection to clear out")
    quit()
elif len(sys.argv) > 2:
    print("ERROR: Please provide ONE command line argument with the name of the collection to clear out")
    quit()

#gets collection to clear from command line input
inp = sys.argv[1]

#errors if collection doesn't exist
if not (inp in collections):
    print('ERROR: The collection "' + inp + '" does not exist in this database.')
    quit()

#confirmation of deletion
coll = db.get_collection(inp)
str = input('You are attempting to delete all ' + str(coll.count_documents({})) + ' documents in the "' + inp + '" collection. Please type "yes" to confirm this action: ')

#deletes all documents in collection
if str == "yes":
    deleted = coll.delete_many({})
    print('All ', deleted.deleted_count, ' documents in the "' + inp + '" collection have been successfully deleted.') 
else: print("Nothing has been deleted.")