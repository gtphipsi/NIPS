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
            });
            client.close();
        }
    });
});

app.post("/users", (req, res) => {
    console.log("adding new user");
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
                var isAdmin = JSON.parse(req.body.admin);
                var officerPositions = req.body.officerPositions;
                for (var position in officerPositions) {
                    officerPositions[position] = JSON.parse(req.body.officerPositions[position]);
                }
                req.body.admin = isAdmin;
                collection.insertOne(req.body, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log('user added');
                        console.log(req.body);
                        res.sendStatus(200);
                    }
                });
            }
            client.close();
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
                });
            } catch(e) {
                console.log("ERROR FINDING USER");
                console.log(err);
                res.sendStatus(404);
            }
            client.close();
        }
    });
});

app.put("/users/:userId", (req, res) => {
    console.log('editing user by ID');
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
                var isAdmin = JSON.parse(req.body.admin);
                var officerPositions = req.body.officerPositions;
                for (var position in officerPositions) {
                    officerPositions[position] = JSON.parse(req.body.officerPositions[position]);
                }
                req.body.admin = isAdmin;
                var update = {$set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    admin: req.body.admin,
                    officerPositions: req.body.officerPositions
                }};
                console.log(req.body);
                collection.updateOne(query, update, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(404);
                    } else {
                        res.send(result);
                    }
                });
            } catch(e) {
                console.log("ERROR FINDING USER");
                console.log(err);
                res.sendStatus(404);
            }
            client.close();
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
            });
            client.close();
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
                });
            }
            client.close();
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
            });
            client.close();
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
                console.log("FINDING ONE USER");
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
                });
            } catch(e) {
                console.log("ERROR FINDING USER");
                console.log(err);
                res.sendStatus(404);
            }
            client.close();
        }
    });
});

app.post("/committees", (req, res) => {
    console.log("adding new committee");
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
                collection.insertOne(req.body, function(err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log('user added');
                        console.log(req.body);
                        res.sendStatus(200);
                    }
                });
            }
            client.close();
        }
    });
});

app.put("/committees/:committeeId", (req, res) => {
    console.log('editing committee by ID');
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
                });
            } catch(e) {
                console.log("ERROR FINDING COMMITTEE");
                console.log(err);
                res.sendStatus(404);
            }
            client.close();
        }
    });
});

app.post("/transactions", (req, res) => {
    console.log("adding new transactions");
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
                console.log(req.body);
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
                        console.log(req.body);
                        res.sendStatus(200);
                    }
                });
            }
            client.close();
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
            var db = client.db('NIPS');
            var collection = db.collection('Transactions');
            collection.find({}).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    res.send(result);
                }
            });
            client.close();
        }
    });
});

/**
 * Server Activation
 */
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});