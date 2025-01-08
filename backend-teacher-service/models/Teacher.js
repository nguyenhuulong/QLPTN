const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    account: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }
});

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
