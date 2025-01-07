const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }
});

const Subject = mongoose.model("Subject", subjectSchema);
module.exports = Subject;
