const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DemandeSchema = new Schema({
    employee_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    leave_days: {
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
