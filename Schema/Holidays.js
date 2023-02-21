const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HolidaySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String
    }
});

module.exports = mongoose.model("Holiday", HolidaySchema);
