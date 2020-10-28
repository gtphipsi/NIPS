// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
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

/**
 * Routes Definitions
 */
app.get("/", (req, res) => {
    res.render("login", { title: "Login" });
});

app.get("/login", (req, res) => {
    console.log("GET LOGIN")
    res.render("login", { title: "Login" });
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
                    res.sendStatus(result);
                }
            });
            client.close();
        }
    });
});

// app.post("/login", (req, res) => {
//     console.log("POST LOGIN");
//     // console.log(req);
//     MongoClient.connect(uri, { useNewUrlParser: true }, {useUnifiedTopology: true }, function(err, client) {
//         if (err) {
//             console.log('ERROR CONNECTING TO MONGO');
//             res.sendStatus(404);
//         } else {
//             var db = client.db('NIPS');
//             var collection = db.collection('Users');
//             if (!req.body) {
//                 console.log("No message body");
//                 res.sendStatus(200);
//             } else {
//                 var lastName = req.body.lastName;
//                 var badgeNumber = req.body.badgeNumber;
//                 collection.findOne({lastName: lastName, badgeNumber: badgeNumber}, function(err, result) {
//                     if (err) {
//                         console.log(err);
//                         throw err;
//                     } else if (result) {
//                         console.log('Matching user found--logging in');
//                         res.sendStatus(result);
//                     } else {
//                         console.log('No matching user found');
//                         res.sendStatus(404);
//                     }
//                 });
//             }
//             client.close();
//         }
//     });
// });

/**
 * Server Activation
 */
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});