const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    nom: {
        type: String,
        required: true,
    },
    prenom: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true

    },
    departement: {
        type: String,
    },
    jobtitle: {
        type: String,
        required: true,
    },
    contracttype: {
        type: String,
        required: true,
    },
    manager: {
        type: Schema.Types.ObjectId,

    },
    profilepicture: {
        type: String,
        default: "https://www.w3schools.com/howto/img_avatar.png"
    },
    telephone: {
        type: String,
        required: true,
        unique: true
    },
    soldeConges: {
        type: Number,
        default: 20
    },
    soldeMaladie: {
        type: Number,
        default: 20
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["employee", "manager", "rh"],
        default: "employee"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", UserSchema);
