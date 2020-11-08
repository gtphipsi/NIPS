// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
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

/**
 * Routes Definitions
 */
app.get("/", (req, res) => {
    res.render("login", { title: "Login" });
});

app.get("/login", (req, res) => {
    console.log("GET LOGIN");
    res.render("login", { title: "Login" });
});

app.get("/home", (req, res) => {
    console.log("GET HOME");
    res.render("home", { title: "Home" });
});

app.get("/ledger", (req, res) => {
    console.log("GET LEDGER");
    res.render("ledger", { title: "ledger" });
});

app.get("/assign", (req, res) => {
    console.log("GET ASSIGN");
    res.render("assign", { title: "Assign Points" });
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

app.get("/ledger/:userId", (req, res) => {
    console.log('getting user by ID');
    MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log('ERROR CONNECTING TO MONGO');
            res.sendStatus(404);
        } else {
            var userId = req.params.userId;
            console.log("FINDING ONE USER'S LEDGER");
            var mongoId = ObjectId(userId);
            var db = client.db('NIPS');
            var collection = db.collection('Transactions');
            collection.find({$or: [{receiver: userId}, {assigner: userId}]}).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    console.log('result');
                    console.log(result);
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
    console.log('getting all users');
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

/**
 * Server Activation
 */
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});