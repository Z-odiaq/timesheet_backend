
const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const userSchema = require("../Schema/User");
const demandeSchema = require("../Schema/Demande");
const holidaysSchema = require("../Schema/Holidays");


const auth = require("../auth");
const { routerAuth, isManager, userAuth } = require("../auth");
const { Int32 } = require("mongojs");
const { json } = require("express");







router.post("/login",
    [
        check("email", "Email incorrect").isEmail(),
        check("password", "Mot de passe incorrect").isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                Error: "Please check your credentials."
            });
        }

        var { email, password } = req.body;
        email = email.toLowerCase();

        try {
            let user = await userSchema.findOne({
                email
            });

            if (!user) {
                console.log('user does not exist ' + email)
                return res.status(400).json({
                    Error: "Account does not exist!\nPlease register first."
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({
                    Error: "Password is Incorrect!"
                });

            const payload = { user: { id: user.id } };

            jwt.sign(payload, "mlou5iya",
                {
                    //expiresIn: 1000000
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({ token });
                }
            );
        } catch (e) {
            console.error("Server Error" + e);
            res.status(500).json({
                Error: "Server Error"
            });
        }
    }
);




//create
router.post("/demande", userAuth, async (req, res) => {
    const { leaveDays, reason } = req.body;
    const user = await userSchema.findById(req.session.employeeId).select({ soldeConges: 1 })

    if (leaveDays > user.soldeConges) {

        const demande = new demandeSchema({
            employee_id: req.session.employeeId,
            leave_days: leaveDays,
            status: "Pending",
            reason: reason,
        });
        try {
            await demande.save();
            res.status(200).json({ message: "Leave application submitted successfully." });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    } else {
        res.status(400).json({ error: "Employee doesn't have enough leave days." });
    }
});


//get demande by id
router.get("/demande/:id", userAuth,
    async (req, res) => {
        try {
            const demandes = await demandeSchema.findById(req.params.id);
            res.json(demandes);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

//get all demande
router.get("/demande", userAuth,
    async (req, res) => {

        try {
            await demandeSchema.find({ "employee_id": ObjectID(req.user.id) }, async (err, doc) => {
                if (err || !doc) {
                    res.status(500).json({ message: err });
                } else {
                    res.status(200).json(doc);
                }
            })
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });


//delete
router.delete("/demande/:id", userAuth,
    async (req, res) => {

        try {
            await demandeSchema.find({ "_id": ObjectID(req.params.id), status: "pending" }, async (err, doc) => {
                if (err || !doc) {
                    res.status(500).json({ message: "no pending applications" });
                } else {
                    demandeSchema.findByIdAndDelete(req.params.id);
                    res.status(201).json({ message: "deleted successfully" });

                }
            })
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

//update
router.patch("/demande/:id", userAuth,

    async (req, res) => {
        const { demande } = req.body;

        try {
            demandeSchema.updateOne({ "_id": ObjectID(req.params.id) }, { '$set': { leave_days: demande.demande } }, { runValidators: true }, async (err, doc) => {
                if (err || !doc) {
                    console.log("no users: " + err)
                    return res.status(500).json({ Error: "Something went wrong." });
                } else {
                    res.status(201).json({ message: "update successfully" });

                }
            })
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

//update profile
router.patch("/profile/:id", userAuth,

    async (req, res) => {
        const { user } = req.body;

        user.passsword ? (user.password = await bcrypt.hash(user.passsword, await bcrypt.genSalt(10))) : null
        user.role ? delete user['role'] : null;
        user.email ? delete user['email'] : null;
        user.manager ? delete user['manager'] : null;
        user.contracttype ? delete user['contracttype'] : null;
        user.departement ? delete user['departement'] : null;
        user.jobtitle ? delete user['jobtitle'] : null;




        try {
            userSchema.updateOne({ "_id": ObjectID(req.params.id) }, { '$set': user }, { runValidators: true }, async (err, doc) => {
                if (err || !doc) {
                    console.log("no users: " + err)
                    return res.status(500).json({ Error: "Something went wrong." });
                } else {
                    res.status(201).json({ message: "update successfully" });

                }
            })
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });


module.exports = router;
