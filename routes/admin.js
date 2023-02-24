
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
const { Int32, ObjectId } = require("mongojs");
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
            demandeSchema.updateOne({ "_id": ObjectID(req.params.id) }, { '$set': { status: demande.status, comment: demande.comment } }, { runValidators: true }, async (err, doc) => {
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
router.get("/applications", isManager,
    async (req, res) => {
        try {
            const alldemandes = await demandeSchema.find({ "status": "pending" });
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
//get a demande by id
router.get("/applications/:id", isManager,
    async (req, res) => {
        try {
            const alldemandes = await demandeSchema.find({ "_id": ObjectID(req.params.id) });
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

//get a demande by user
router.get("/applications/user/:id", isManager,
    async (req, res) => {
        try {
            const alldemandes = await demandeSchema.find({ employee_id: ObjectID(req.params.id) });
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });


router.put("/applications/:id", isManager,

    async (req, res) => {
        const { status } = req.body;
        console.log(JSON.stringify(status));
        try {
            demandeSchema.updateOne({ "_id": ObjectId(req.params.id) }, { '$set': { status: status } }, { runValidators: true }, async (err, doc) => {
                if (err || !doc) {
                    console.log("applications patch: " + err)
                    return res.status(500).json({ Error: "Something went wrong." });
                } else {
                    console.log("applications patch: ok ")
                    res.status(201).json({ message: "update successfully" });

                }
            })
        } catch (err) {
            console.log("applications patch: " + err)

            res.status(400).json({ message: err.message });
        }
    });
//update profile
router.patch("/user/:id", isManager,

    async (req, res) => {
        const { role, passsword } = req.body;
        console.log(JSON.stringify(req.body));
        passsword ? (password = await bcrypt.hash(passsword, await bcrypt.genSalt(10))) : null
        try {
            userSchema.updateOne({ "_id": ObjectId(req.params.id) }, { '$set': { role: role } }, { runValidators: true }, async (err, doc) => {
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
router.get("/users", isManager,

    async (req, res) => {
        try {
            const alldemandes = await userSchema.find();
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });



router.post("/users",
    [
        check("nom", "Please Enter a Valid First Name").not().isEmpty(),
        check("prenom", "Please Enter a Valid Last Name").not().isEmpty(),
        check("departement", "Please Enter a Valid departement").not().isEmpty(),
        check("jobtitle", "Please Enter a Valid jobtitle").not().isEmpty(),
        check("contracttype", "Please Enter a Valid contracttype").not().isEmpty(),
        check("telephone", "Please Enter a Valid telephone").not().isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        // check("password", "Please enter a valid password").isLength({ min: 6 })

    ],
    async (req, res) => {
        const errorFormatter = ({ param, msg }) => { return `${param}: ${msg}`; };
        //const errors = validationResult(req);

        const errors = validationResult(req).formatWith(errorFormatter);

        if (!errors.isEmpty()) {
            console.log(JSON.stringify(req.body))
            console.log(JSON.stringify(errors))

            return res.status(400).json({
                Error: errors.array()
            });

        }
        const {
            nom,
            prenom,
            email,
            role,
            telephone,
            password,
            profilepicture,
            manager,
            contracttype,
            jobtitle,
            departement,

        } = req.body;
        try {
            let user = await userSchema.findOne({ email });
            if (user) {

                return res.status(400).json({
                    Error: "User Already Exists"
                });
            }
            user = new userSchema({
                nom,
                prenom,
                email,
                role,
                password,
                telephone,
                profilepicture,
                manager,
                contracttype,
                jobtitle,
                departement,
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            const payload = {
                user: { id: user.id }
            };

            jwt.sign(payload, "mlou5iya", {
                expiresIn: 100000000
            },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

module.exports = router;
