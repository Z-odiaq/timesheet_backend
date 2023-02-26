const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DemandeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    end_date: {
        type: String,
        required: true
    },
    start_date: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    comment: {
        type: String
    },
    titre: {
        type: String
    },
    homeworking: {
        type: Boolean,
        default: false
    },
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    soldeConges: {
        type: Number,
        required: true
    },
    userpicture: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model("Demande", DemandeSchema);
