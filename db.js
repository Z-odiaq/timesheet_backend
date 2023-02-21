

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const url = "mongodb://localhost:27017/timesheet";

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Mongo OK");
  } catch (e) {
    console.log("Mongo NOK");
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;