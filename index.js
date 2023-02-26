

var express = require('express');
const bodyParser = require("body-parser");
var http = require('http')

var cookieParser = require('cookie-parser')

//const Userx = require("../models/User");
var mongojs = require('mongojs');
var ObjectId = require('mongoose').Types.ObjectId;
const user = require("./routes/user"); //new addition
const admin = require("./routes/admin"); //new addition
var ObjectID = mongojs.ObjectID;
var db = mongojs('mongodb://localhost:27017/timesheet');
const userSchema = require("./Schema/User");
const demandeSchema = require("./Schema/Demande");
const cors = require('cors');

const auth = require("./auth");
const InitiateMongoServer = require("./db");
const { json } = require('express');
const Demande = require('./Schema/Demande');
InitiateMongoServer();
var app = express();
const server = http.Server(app);
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get('/api/myroute', (req, res) => {
    return res.status(200).json({ ok: "Something went ok." });
});
app.use("/user", user);
app.use("/admin", admin);

app.use(express.static('uploads'));

app.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(`C:/Users/moham/Bureau/Timesheet/back/uploads/${filename}`);
});

server.listen(port, () => console.log('started on port: ' + port));









// app.patch("demande/:id", getdemande, async (req, res) => {
//     if (req.body.status) {
//         res.demande.status = req.body.status;
//     }
//     try {
//         const updateddemande = await res.demande.save();
//         res.json(updateddemande);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


// app.delete("demande/:id", getdemande, async (req, res) => {
//     try {
//         await res.demande.remove();
//         res.json({ message: "Deleted Holiday Request" });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });





