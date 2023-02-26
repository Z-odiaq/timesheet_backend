
const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const userSchema = require("../Schema/User");
const demandeSchema = require("../Schema/Demande");


const auth = require("../auth");
const { routerAuth, isManager, userAuth } = require("../auth");
const { Int32, ObjectId } = require("mongojs");
const { json } = require("express");


const multer = require('multer');
const Recommendation = require("../Schema/Recommendation");
const { default: mongoose } = require("mongoose");





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
            let user = await userSchema.findOne({ email });

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
                    res.status(200).json({ token, user });
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


router.get("/user/:id", userAuth,
    async (req, res) => {
        const decoded = jwt.verify(req.token, 'mlou5iya');
        const userId = decoded.userId;

        console.log(userId)
        try {
            const user = await userSchema.findById(userId);
            res.json(user);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

function getDaysDifference(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.round(Math.abs((start - end) / oneDay));
    return diffDays;
}


const filename = Math.random().toString(36).slice(2, 10);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, filename + "." + file.mimetype.split('/')[1]);
    }
});

const upload = multer({ storage: storage });

router.post('/upload-cv', upload.single('cv'), (req, res) => {
    if (!req.file) {
        console.log("No file received");
        return res.status(400).send('No file uploaded');
    }


    res.send(filename + "." + req.file.mimetype.split('/')[1]);
});

router.post("/recommendation", userAuth, async (req, res) => {
    const { nom, prenom, poste, email, message, telephone, file } = req.body;
    const user = await userSchema.findById(req.user.id).select({ nom: 1, prenom: 1, email: 1 })
    const demande = new Recommendation({
        userNom: user.nom,
        userPrenom: user.prenom,
        userEmail: user.email,
        nom: nom,
        prenom: prenom,
        poste: poste,
        email: email,
        message: message,
        telephone: telephone,
        file: file


    });
    try {
        await demande.save();
        res.status(200).json({ message: "Recommendation submitted successfully." });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: "Recommendation Error" });
    }
});




router.post("/demande", userAuth, async (req, res) => {
    const { titre, startDate, endDate, reason, homeworking, malade } = req.body;
    const leaveDays = getDaysDifference(startDate, endDate);

    const user = await userSchema.findById(req.user.id).select({ soldeConges: 1, nom: 1, prenom: 1, email: 1, profilepicture: 1, soldeMaladie: 1 })
    //console.log(user)
    console.log(titre, " ", startDate, " ", endDate, " ", reason, " ", leaveDays, " ", user.soldeConges, leaveDays > user.soldeConges, " ", malade, " ", leaveDays > user.soldeMaladie, " ", user.nom, " ", user.prenom, " ", user.email, " ", user.profilepicture, " ", user.soldeMaladie, " ", user.soldeConges)

    if ((malade == true && leaveDays < user.soldeMaladie) || (malade == false && leaveDays < user.soldeConges)) {

        const demande = new demandeSchema({
            user: req.user.id,
            titre: titre,
            start_date: startDate,
            end_date: endDate,
            reason: reason,
            homeworking: homeworking,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            soldeConges: user.soldeConges,
            soldeMaladie: user.soldeMaladie,
            userpicture: user.profilepicture
        });
        try {
            await demande.save();
            res.status(200).json({ message: "Leave application submitted successfully." });
        } catch (err) {
            res.status(400).json({ message: "Solde Congés Insuffisant!" });
        }
    } else {

        malade ? res.status(400).json({ message: "Employee doesn't have enough sickdays." }) :
            res.status(400).json({ message: "Employee doesn't have enough leavedays." });
    }
});


router.get("/demande/:id", userAuth,
    async (req, res) => {
        try {
            const doc = await demandeSchema.find({ "user": ObjectId(req.user.id) })
            res.json(demandes);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

router.get("/demandes", userAuth,
    async (req, res) => {
        console.log(req.user.id)
        try {
            const doc = await demandeSchema.find({ "user": ObjectId(req.user.id) })
            res.status(200).json(doc);
        } catch (err) {
            res.status(500).json({ message: 'rr' + err.message });
        }
    });


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
