const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: '*', // Cho phép tất cả origin, hoặc bạn có thể cấu hình cụ thể
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức được phép
    allowedHeaders: ['Content-Type', 'Authorization'] // Các header được phép
}));

app.use(bodyParser.json());

// Kết nối MongoDB
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Model MongoDB
const Device = mongoose.model("Device", {
    name: String,
    type: String,
    status: String,
    manufacturer: String,
    labId: String,
});

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
    purpose: {
        type: String,
        required: true,
        enum: ["teaching", "seminar"]
    },
    subjectId: {
        type: String,
        default: null
    },
    seminarContent: {
        type: String,
        default: null
    }
});

// Routes
app.get("/", (req, res) => {
    res.send("Lab Service is running!");
});

app.get("/labs", async (req, res) => {
    const labs = await Lab.find();
    res.json(labs);
});

app.get("/labs/:id", async (req, res) => {
    try {
        const lab = await Lab.findById(req.params.id);
        if (!lab) return res.status(404).send("Lab not found");
        res.json(lab);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.post("/labs", async (req, res) => {
    const lab = new Lab(req.body);
    await lab.save();
    res.status(201).json(lab);
});

app.put("/labs/:id", async (req, res) => {
    try {
        const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lab) return res.status(404).send("Lab not found");
        res.json(lab);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete("/labs/:id", async (req, res) => {
    try {
        const lab = await Lab.findByIdAndDelete(req.params.id);
        if (!lab) return res.status(404).send("Lab not found");

        // Xóa các lịch và thiết bị liên quan
        await Schedule.deleteMany({ labId: req.params.id });
        await Device.deleteMany({ labId: req.params.id });

        res.send("Lab deleted successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get("/labs/:id/devices", async (req, res) => {
    const devices = await Device.find({ labId: req.params.id });
    res.json(devices);
});

app.get("/labs/:labId/devices/:deviceId", async (req, res) => {
    try {
        const device = await Device.findOne({
            _id: req.params.deviceId,
            labId: req.params.labId,
        });
        if (!device) {
            return res.status(404).json({ message: "Không tìm thấy thiết bị!" });
        }
        res.json(device);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin thiết bị.", error });
    }
});

app.post("/labs/:id/devices", async (req, res) => {
    const device = new Device({ ...req.body, labId: req.params.id });
    await device.save();
    res.status(201).json(device);
});

app.put("/labs/:labId/devices/:deviceId", async (req, res) => {
    try {
        const device = await Device.findByIdAndUpdate(req.params.deviceId, req.body, { new: true });
        if (!device) return res.status(404).send("Device not found");
        res.json(device);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete("/labs/:labId/devices/:deviceId", async (req, res) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.deviceId);
        if (!device) return res.status(404).send("Device not found");
        res.send("Device deleted successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get("/schedules", async (req, res) => {
    const schedules = await Schedule.find();
    res.json(schedules);
});

app.get("/labs/:id/schedule", async (req, res) => {
    const schedules = await Schedule.find({ labId: req.params.id });
    res.json(schedules);
});

app.get("/labs/:labId/schedule/:scheduleId", async (req, res) => {
    try {
        const schedule = await Schedule.findOne({
            _id: req.params.scheduleId,
            labId: req.params.labId,
        });
        if (!schedule) {
            return res.status(404).json({ message: "Không tìm thấy lịch đặt phòng!" });
        }
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin lịch đặt phòng.", error });
    }
});

app.post("/labs/:id/schedule", async (req, res) => {
    try {
        const { date, timeSlot } = req.body;
        const labId = req.params.id;
        const [startTimeNew, endTimeNew] = timeSlot.split("-").map(time => new Date(`1970-01-01T${time}:00`));
        const existingSchedules = await Schedule.find({ labId, date });
        const isOverlapping = existingSchedules.some(schedule => {
            const [startTimeExisting, endTimeExisting] = schedule.timeSlot
                .split("-")
                .map(time => new Date(`1970-01-01T${time}:00`));
            return (
                (startTimeNew < endTimeExisting && endTimeNew > startTimeExisting) // Giao nhau
            );
        });
        if (isOverlapping) {
            return res.status(400).json({
                message: `Lịch đặt trùng lặp cho phòng lab ${labId} vào ngày ${date} với thời gian ${timeSlot}.`,
            });
        }
        const schedule = new Schedule({ ...req.body, labId });
        await schedule.save();
        res.status(201).json(schedule);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo lịch đặt.", error });
    }
});

app.delete("/labs/:id/schedule/:scheduleId", async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.scheduleId);
        if (!schedule) return res.status(404).send("Schedule not found");
        res.send("Schedule deleted successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.listen(5000, () => console.log("Lab service running on port 5000"));
