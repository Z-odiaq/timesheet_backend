
const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const userSchema = require("../Schema/User");
const demandeSchema = require("../Schema/Demande");


const auth = require("../auth");
const { routerAuth, isManager } = require("../auth");
const { Int32, ObjectId } = require("mongojs");
const { json } = require("express");
const Demande = require("../Schema/Demande");
const { default: mongoose } = require("mongoose");
const Recommendation = require("../Schema/Recommendation");

router.get("/",
    async (req, res) => {

        return res.status(200).json({ ok: "Something went ok." });

    }
);






router.get("/applications", isManager,
    async (req, res) => {
        try {
            const demandes = await demandeSchema.find({ "status": "pending" });
            const updatedDemandes = await Promise.all(demandes.map(async (demande) => {
                const user = await userSchema.findOne({ "_id": ObjectId(demande.user) }, { soldeConges: 1, soldeMaladie: 1, _id: 0 });

                return {
                    ...demande.toObject(),
                    soldeConges: user.soldeConges,
                    soldeMaladie: user.soldeMaladie
                }
            }));

            res.status(201).json(updatedDemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }

    });





router.patch("/applications/:id", isManager,

    async (req, res) => {
        const { status, days, homeworking, maladie, comment, userID } = req.body;

        try {
            if (status == "rejected") {
                demandeSchema.updateOne({ "_id": ObjectId(req.params.id) }, { '$set': { status: status, comment: comment } }, { runValidators: true }, async (err, doc) => {
                    if (err || !doc) {
                        return res.status(500).json({ Error: "Something went wrong." });
                    } else {
                        res.status(201).json({ message: "update successfully" });
                    }
                })
            } else if (status == "accepted" && !homeworking && !maladie) {
                //get user solde congee
                const user = await userSchema.findOne({ "_id": ObjectId(userID) }, { soldeConges: 1, _id: 0 });
                console.log(user);
                if (user.soldeConges < days) {
                    return res.status(500).json({ Error: "solde insuffisant" });
                }
                //update user solde congee
                userSchema.updateOne({ "_id": ObjectId(userID) }, { '$set': { soldeConges: user.soldeConges - days } }, { runValidators: true }, async (err, doc) => {
                    if (err || !doc) {
                        return res.status(500).json({ Error: "Something went wrong." });
                    } else {
                        demandeSchema.updateOne({ "_id": ObjectId(req.params.id) }, { '$set': { status: status, comment: comment } }, { runValidators: true }, async (err, doc) => {
                            if (err || !doc) {
                                return res.status(500).json({ Error: "Something went wrong." });
                            } else {
                                res.status(201).json({ message: "update successfully" });
                            }
                        })
                    }
                })
            } else if (status == "accepted" && homeworking) {
                demandeSchema.updateOne({ "_id": ObjectId(req.params.id) }, { '$set': { status: status, comment: comment } }, { runValidators: true }, async (err, doc) => {
                    if (err || !doc) {
                        return res.status(500).json({ Error: "Something went wrong." });
                    } else {
                        res.status(201).json({ message: "update successfully" });
                    }
                })
            } else if (status == "accepted" && maladie) {
                //get user solde maladie
                const user = await userSchema.findOne({ "_id": ObjectId(userID) }, { soldeMaladie: 1, _id: 0 });
                if (user.soldeMaladie < days) {
                    return res.status(500).json({ Error: "solde insuffisant" });
                }
                //update user solde maladie
                userSchema.updateOne({ "_id": ObjectId(userID) }, { '$set': { soldeMaladie: user.soldeMaladie - days } }, { runValidators: true }, async (err, doc) => {
                    if (err || !doc) {
                        return res.status(500).json({ Error: "Something went wrong." });
                    } else {
                        res.status(201).json({ message: "update successfully" });
                    }
                })
            }

        } catch (err) {

            res.status(400).json({ message: err.message });
        }
    });


router.patch("/user/:id", isManager,

    async (req, res) => {
        const { role, passsword, telephone, contracttype, jobtitle, departement, email, prenom, nom } = req.body;
        console.log(JSON.stringify(req.body));
        passsword ? (password = await bcrypt.hash(passsword, await bcrypt.genSalt(10))) : null
        try {
            userSchema.updateOne({ "_id": ObjectId(req.params.id) }, {
                '$set':
                    { role: role, nom: nom, prenom: prenom, passsword: passsword, telephone: telephone, contracttype: contracttype, jobtitle: jobtitle, departement: departement, email: email }
            }, { runValidators: true }, async (err, doc) => {
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

router.get("/userApps/:id", isManager,

    async (req, res) => {
        try {
            const alldemandes = await demandeSchema.find({ "userID": req.params.id });
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

router.delete("/user/:id", isManager,

    async (req, res) => {
        try {
            const alldemandes = await userSchema.deleteOne({ "_id": ObjectId(req.params.id) });
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

router.get("/users", isManager,

    async (req, res) => {
        try {
            const alldemandes = await userSchema.find();
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

router.get("/recommendations", isManager,

    async (req, res) => {
        try {
            const alldemandes = await Recommendation.find();
            res.status(201).json(alldemandes);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
router.delete("/recommendations/:id", isManager,

    async (req, res) => {
        try {
            const alldemandes = await Recommendation.deleteOne({ "_id": ObjectId(req.params.id) });
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
            let user2 = await userSchema.findOne({ telephone });

            if (user) {

                return res.status(400).json({
                    message: "User Already Exists"
                });
            }
            if (user2) {

                return res.status(400).json({
                    message: "Phone Already Exists"
                });
            }
            user = new userSchema({
                nom,
                prenom,
                email,
                role,
                password,
                telephone,
                profilepicture: profilepicture || "https://www.w3schools.com/howto/img_avatar.png",
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
            res.status(500).send(err.message);
        }
    }
);

module.exports = router;
