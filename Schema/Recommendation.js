const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Recommendation = new Schema({
    nom: {
        type: String,
        required: true,
    },
    userNom: {
        type: String,
        required: true,
    },
    userPrenom: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    prenom: {
        type: String,
        required: true,
    },
    poste: {
        type: String,
        required: true,

    },
    email: {
        type: String,
    },
    telephone: {
        type: String,
        required: true,
    },
    message: {
        type: String,
    },
    file: {
        type: String,
        required: true,

    },

});

module.exports = mongoose.model("Recommendation", Recommendation);
