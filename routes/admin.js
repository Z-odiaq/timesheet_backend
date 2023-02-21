
const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const userSchema = require("../Schema/User");
const demandeSchema = require("../Schema/Demande");
const holidaysSchema = require("../Schema/Holidays");


const auth = require("../auth");
const { routerAuth, isManager } = require("../auth");
const { Int32 } = require("mongojs");
const { json } = require("express");
const Demande = require("../Schema/Demande");

router.get("/",
    async (req, res) => {

        return res.status(200).json({ ok: "Something went ok." });

    }
);


//update
router.patch("/process/:id", isManager,

    async (req, res) => {
        const { demande } = req.body;

        try {
            demandeSchema.updateOne({ "_id": ObjectID(req.body.letterID) }, { '$set': { status: demande.status, comment: demande.comment } }, { runValidators: true }, async (err, doc) => {
                if (err || !doc) {
                    return res.status(500).json({ Error: "Something went wrong." });
                } else {
                    if (demande.status == "accepted") {
                        await userSchema.updateOne({ "_id": ObjectID(req.body.userID) }, { '$inc': { leave_days: -demande.leave_days } }, { runValidators: true }, async (err, doc) => {
                            if (err || !doc) {
                                return res.status(500).json({ Error: "Something went wrong." });
                            } else {
                                res.status(201).json({ message: "update successfully" });
                            }
                        })
                    }
                    res.status(201).json({ message: "update successfully" });
                }
            })
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

//get all demandes
router.get("/pendingApps", isManager,
    async (req, res) => {
        try {
            const alldemandes = await demandeSchema.find({ "status": "pending" });
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
//get a demande by id
router.get("/pendingApps/:id", isManager,
    async (req, res) => {
        try {
            const alldemandes = await demandeSchema.find({ "_id": ObjectID(req.params.id) });
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

//get a demande by user
router.get("/pendingApps/user/:id", isManager,
    async (req, res) => {
        try {
            const alldemandes = await demandeSchema.find({ employee_id: ObjectID(req.params.id) });
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

module.exports = router;
