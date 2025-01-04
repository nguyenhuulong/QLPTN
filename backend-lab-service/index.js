const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Model MongoDB
const Lab = mongoose.model("Lab", {
    name: String,
    location: String,
    capacity: Number,
});

const Schedule = mongoose.model("Schedule", {
    labId: String,
    date: String,
    timeSlot: String,
    reservedBy: String,
});

// Routes
app.get("/", (req, res) => {
    res.send("Lab Service is running!");
});

app.get("/labs", async (req, res) => {
    const labs = await Lab.find();
    res.json(labs);
});

app.post("/labs", async (req, res) => {
    const lab = new Lab(req.body);
    await lab.save();
    res.status(201).json(lab);
});

app.get("/labs/:id/schedule", async (req, res) => {
    const schedules = await Schedule.find({ labId: req.params.id });
    res.json(schedules);
});

app.listen(5000, () => console.log("Lab service running on port 5000"));
