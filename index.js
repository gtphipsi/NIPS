// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const { use } = require("browser-sync");
var ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
const uri = 'mongodb+srv://phikappapsi:liveeverdienever@pkp.alpwd.mongodb.net/test'

/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.engine('html', require('ejs').renderFile);
app.set("view engine", "html");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Routes Definitions
 */
app.get("/", (req, res) => {
    res.render("login", { title: "Login" });
});

app.get("/login", (req, res) => {
    console.log("RENDER LOGIN");
    res.render("login", { title: "Login" });
});

app.get("/home", (req, res) => {
    console.log("RENDER HOME");
    res.render("home", { title: "Home" });
});

app.get("/ledger", (req, res) => {
    console.log("RENDER LEDGER");
    res.render("ledger", { title: "ledger" });
});

app.get("/assign", (req, res) => {
    console.log("RENDER ASSIGN");
    res.render("assign", { title: "Assign Points" });
});

app.get("/admin", (req, res) => {
    console.log("RENDER ADMIN");
    res.render("admin", { title: "Perform Admin Actions" });
});

app.get("/viewcommittees", (req, res) => {
    console.log("RENDER COMMITTEES");
    res.render("committees", { title: "View Committees" });
});

app.get("/matrix", (req, res) => {
    console.log("RENDER MATRIX");
    res.render("matrix", { title: "View Committees" });
});

app.get("/users", (req, res) => {
    console.log('getting all users');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Users');
            collection.find({}).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    res.send(result);
                }
                client.close();
            });
        }
    });
});

// Accessible by admin only
app.post("/users", (req, res) => {
    console.log("adding new user");
    if (req.body.USER.admin != 'true') {
        console.log("access denied");
        res.status(403).send();
        return;
    }
    console.log("is admin");
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Users');
            if (!req.body) {
                console.log("No message body");
                res.sendStatus(200);
            } else {
                var isAdmin = JSON.parse(req.body.newUser.admin);
                var officerPositions = req.body.newUser.officerPositions;
                for (var position in officerPositions) {
                    officerPositions[position] = JSON.parse(req.body.newUser.officerPositions[position]);
                }
                req.body.newUser.admin = isAdmin;
                collection.insertOne(req.body.newUser, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log('user added');
                        console.log(req.body);
                        res.sendStatus(200);
                    }
                    client.close();
                });
            }
        }
    });
});

app.get("/users/:userId", (req, res) => {
    console.log('getting user by ID');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            try {
                var userId = req.params.userId;
                console.log("FINDING ONE USER");
                var mongoId = ObjectId(userId);
                var db = client.db('NIPS');
                var collection = db.collection('Users');
                collection.findOne({_id: mongoId}, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(404);
                    } else {
                        res.send(result);
                    }
                    client.close();
                });
            } catch(e) {
                console.log("ERROR FINDING USER");
                console.log(err);
                res.sendStatus(404);
            }
        }
    });
});

// Accessible by admin only
app.put("/users/:userId", (req, res) => {
    console.log('editing user by ID');
    if (req.body.USER.admin == 'false') {
        console.log("access denied");
        res.status(403).send();
        return;
    }
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            try {
                var userId = req.params.userId;
                console.log("UPDATING ONE USER");
                var mongoId = ObjectId(userId);
                var db = client.db('NIPS');
                var collection = db.collection('Users');
                var query = {_id: mongoId};
                var isAdmin = JSON.parse(req.body.updateUser.admin);
                var officerPositions = req.body.updateUser.officerPositions;
                for (var position in officerPositions) {
                    officerPositions[position] = JSON.parse(req.body.updateUser.officerPositions[position]);
                }
                req.body.updateUser.admin = isAdmin;
                var update = {$set: {
                    firstName: req.body.updateUser.firstName,
                    lastName: req.body.updateUser.lastName,
                    admin: req.body.updateUser.admin,
                    officerPositions: req.body.updateUser.officerPositions
                }};
                console.log(req.body);
                collection.updateOne(query, update, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(404);
                    } else {
                        res.send(result);
                    }
                    client.close();
                });
            } catch(e) {
                console.log("ERROR FINDING USER");
                console.log(err);
                res.sendStatus(404);
            }
        }
    });
});

app.get("/ledger/:userId", (req, res) => {
    console.log('getting user ledger by ID');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var userId = req.params.userId;
            console.log("FINDING ONE USER'S LEDGER");
            var db = client.db('NIPS');
            var collection = db.collection('Transactions');
            collection.find({$or: [{receiver: userId}, {assigner: userId}]}).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    res.send(result);
                }
                client.close();
            });
        }      
    });
});

app.post("/login", (req, res) => {
    console.log("POST LOGIN");
    console.log("body:");
    console.log(req.body);
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Users');
            if (!req.body) {
                console.log("No message body");
                res.sendStatus(200);
            } else {
                var lastName = req.body.lastName;
                var badgeNumber = req.body.badgeNumber;
                collection.findOne({lastName: lastName, badgeNumber: badgeNumber}, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else if (result) {
                        console.log('Matching user found--logging in');
                        res.send(result);
                    } else {
                        console.log('No matching user found');
                        res.sendStatus(404);
                    }
                    client.close();
                });
            }
        }
    });
});



app.get("/committees", (req, res) => {
    console.log('getting all committees');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Committees');
            collection.find({}).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    res.send(result);
                }
                client.close();
            });
        }
    });
});

app.get("/committees/:committeeId", (req, res) => {
    console.log('getting committee by ID');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            try {
                var committeeId = req.params.committeeId;
                console.log("FINDING ONE COMMITTEE");
                var mongoId = ObjectId(committeeId);
                var db = client.db('NIPS');
                var collection = db.collection('Committees');
                collection.findOne({_id: mongoId}, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(404);
                    } else {
                        res.send(result);
                    }
                    client.close();
                });
            } catch(e) {
                console.log("ERROR FINDING COMMITTEE");
                console.log(err);
                res.sendStatus(404);
            }
        }
    });
});

// Accessible by admin only
app.post("/committees", (req, res) => {
    console.log("adding new committee");
    console.log(req.body.USER.admin);
    console.log(req.body.USER.admin == 'false');
    if (req.body.USER.admin  == 'false') {
        console.log('access denied');
        res.status(403).send();
        return;
    }

    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Committees');
            if (!req.body) {
                console.log("No message body");
                res.sendStatus(200);
            } else {
                collection.insertOne(req.body.newCommittee, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log('user added');
                        console.log(req.body);
                        res.sendStatus(200);
                    }
                    client.close();
                });
            }
        }
    });
});

// Accessible by admin only
app.put("/committees/:committeeId", (req, res) => {
    console.log('editing committee by ID');
    if (req.body.USER.admin == 'false') {
        console.log("access denied");
        res.status(403).send();
        return;
    }
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            try {
                var committeeId = req.params.committeeId;
                console.log("UPDATING ONE COMMITTEE");
                var mongoId = ObjectId(committeeId);
                var db = client.db('NIPS');
                var collection = db.collection('Committees');
                var query = {_id: mongoId};
                var update = {$set: {
                    members: req.body.members,
                    meetings: req.body.meetings,
                    head: req.body.head,
                    budget: req.body.budget
                }};
                console.log(req.body);
                collection.updateOne(query, update, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(404);
                    } else {
                        res.send(result);
                    }
                    client.close();
                });
            } catch(e) {
                console.log("ERROR FINDING COMMITTEE");
                console.log(err);
                res.sendStatus(404);
            }
        }
    });
});

// Accessible by officers and committee heads only only
app.post("/transactions", (req, res) => {
    console.log("adding new transactions");
    console.log(req.body);
    console.log(req.body.positions);
    if (!req.body.positions || req.body.positions.length <= 0) {
        console.log('access denied');
        res.status(403).send();
        return;
    }
    console.log('access permitted');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Transactions');
            if (!req.body) {
                console.log("No message body");
                res.sendStatus(200);
            } else {
                var transactions = req.body.transactions;
                for (var i = 0; i < transactions.length; i++) {
                    transactions[i].dateAssigned = new Date(transactions[i].dateAssigned);
                    transactions[i].dateEarned = new Date(transactions[i].dateEarned);
                }
                collection.insertMany(req.body.transactions, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log('transactions added');
                        res.sendStatus(200);
                    }
                    client.close();
                });
            }
        }
    });
});

app.get("/transactions", (req, res) => {
    console.log('getting all transactions');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            console.log("FINDING ALL TRANSACTIONS");
            var db = client.db('NIPS');
            var collection = db.collection('Transactions');
            collection.find({}).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    res.send(result);
                }
                client.close();
            });
        }      
    });
});

app.put("/transactions/:transactionId", (req, res) => {
    console.log('editing transaction by ID');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            try {
                var transactionId = req.params.transactionId;
                console.log("UPDATING ONE TRANSACTION");
                var mongoId = ObjectId(transactionId);
                var db = client.db('NIPS');
                var collection = db.collection('Transactions');
                var query = {_id: mongoId};
                req.body.dateEarned = new Date(req.body.dateEarned);
                req.body.dateAssigned = new Date(req.body.dateAssigned);
                var update = {$set: {
                    reason: req.body.reason,
                    amount: req.body.amount,
                    dateEarned: req.body.dateEarned
                }};
                console.log(req.body);
                collection.updateOne(query, update, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(404);
                    } else {
                        res.send(result);
                    }
                    client.close();
                });
            } catch(e) {
                console.log("ERROR FINDING COMMITTEE");
                console.log(err);
                res.sendStatus(404);
            }
        }
    });
});

app.delete("/transactions", (req, res) => {
    console.log("deleting transactions");
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Transactions');
            if (!req.body) {
                console.log("No message body");
                res.sendStatus(200);
            } else {
                console.log('body');
                console.log(req.body);
                ids = [];
                for (var i = 0; i < req.body.transactionIds.length; i++) {
                    ids.push(new ObjectId(req.body.transactionIds[i]));
                }
                var query = {_id: {$in: ids}};
                collection.deleteMany(query, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log('request deleted');
                        res.sendStatus(200);
                    }
                    client.close();
                });
            }
        }
    });
});

app.get("/matrixItems", (req, res) => {
    console.log('getting all matrix items');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Matrix');
            collection.find({}).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    res.send(result);
                }
                client.close();
            });
        }
    });
});

app.post("/matrix", (req, res) => {
    console.log("adding new matrix item");
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Matrix');
            if (!req.body) {
                console.log("No message body");
                res.sendStatus(200);
            } else {
                collection.insertOne(req.body, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log('matrix addedse added');
                        console.log(req.body);
                        res.sendStatus(200);
                    }
                    client.close();
                });
            }
        }
    });
});

app.get("/requests", (req, res) => {
    console.log('getting all requests');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Requests');
            collection.find({}).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    res.send(result);
                }
                client.close();
            });
        }
    });
});

app.post("/requests", (req, res) => {
    console.log("adding new request");
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Requests');
            if (!req.body) {
                console.log("No message body");
                res.sendStatus(200);
            } else {
                req.body.date = new Date(req.body.date);
                collection.insertOne(req.body, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log('request added');
                        console.log(req.body);
                        res.sendStatus(200);
                    }
                    client.close();
                });
            }
        }
    });
});

app.delete("/requests", (req, res) => {
    console.log("deleting requests");
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var db = client.db('NIPS');
            var collection = db.collection('Requests');
            if (!req.body) {
                console.log("No message body");
                res.sendStatus(200);
            } else {
                console.log('body');
                console.log(req.body);
                ids = [];
                for (var i = 0; i < req.body.transactionIds.length; i++) {
                    ids.push(new ObjectId(req.body.transactionIds[i]));
                }
                var query = {_id: {$in: ids}};
                collection.deleteMany(query, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log('request deleted');
                        res.sendStatus(200);
                    }
                    client.close();
                });
            }
        }
    });
});

/**
 * Server Activation
 */
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});