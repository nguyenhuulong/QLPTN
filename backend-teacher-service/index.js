require("dotenv").config();
const express = require("express");
const cors = require('cors');
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Teacher = require("./models/Teacher");
const Department = require("./models/Department");
const Subject = require("./models/Subject");

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Đọc schema từ tệp `schema.graphql`
const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

// Resolvers
const resolvers = {
  Query: {
    getTeachers: async () => await Teacher.find().populate('departmentId'),
    getTeacher: async (_, { id }) => await Teacher.findById(id).populate("departmentId"),
    getDepartments: async () => {
      const departments = await Department.find(); // Lấy danh sách departments
      const results = await Promise.all(
        departments.map(async (department) => {
          // Sử dụng `new mongoose.Types.ObjectId` thay vì gọi trực tiếp
          const teachers = await Teacher.find({
            departmentId: new mongoose.Types.ObjectId(department._id),
          });
          const subjects = await Subject.find({
            departmentId: new mongoose.Types.ObjectId(department._id),
          });
          return {
            id: department._id,
            name: department.name,
            teachers,
            subjects,
          };
        })
      );
      return results;
    },

    getDepartment: async (_, { id }) => {
      const department = await Department.findById(id); // Lấy department theo id
      if (!department) {
        throw new Error("Department not found");
      }
      // Sử dụng `new mongoose.Types.ObjectId`
      const teachers = await Teacher.find({
        departmentId: new mongoose.Types.ObjectId(id),
      });
      const subjects = await Subject.find({
        departmentId: new mongoose.Types.ObjectId(id),
      });
      return {
        id: department._id,
        name: department.name,
        teachers,
        subjects,
      };
    },
    getSubjects: async () => await Subject.find().populate('departmentId'),
    getSubject: async (_, { id }) => await Subject.findById(id).populate("departmentId"),
  },

  Mutation: {
    // Teacher API
    addTeacher: async (_, { name, departmentId }) => {
      const department = await Department.findById(departmentId);
      if (!department) {
        throw new Error("Department not found");
      }
      const teacher = new Teacher({ name, departmentId });
      await teacher.save();
      const teacherWithDepartment = await Teacher.findById(teacher._id).populate('departmentId');
      return teacherWithDepartment;
    },
    updateTeacher: async (_, { id, name, departmentId }) => {
      const teacher = await Teacher.findById(id);
      if (name) teacher.name = name;
      if (departmentId) teacher.departmentId = departmentId;
      await teacher.save();
      return teacher.populate("departmentId");
    },
    deleteTeacher: async (_, { id }) => {
      const result = await Teacher.deleteOne({ _id: id });
      return result.deletedCount === 1;
    },
    // Department API
    addDepartment: async (_, { name }) => {
      const department = new Department({ name });
      await department.save();
      return department;
    },
    updateDepartment: async (_, { id, name }) => {
      const department = await Department.findById(id);
      if (name) department.name = name;
      await department.save();
      return department;
    },
    deleteDepartment: async (_, { id }) => {
      const result = await Department.deleteOne({ _id: id });
      return result.deletedCount === 1;
    },
    // Subject API
    addSubject: async (_, { name, departmentId }) => {
      const department = await Department.findById(departmentId);
      if (!department) {
        throw new Error("Department not found");
      }
      const subject = new Subject({ name, departmentId });
      await subject.save();
      const subjectWithDepartment = await Subject.findById(subject._id).populate('departmentId');
      return subjectWithDepartment;
    },
    updateSubject: async (_, { id, name, departmentId }) => {
      const subject = await Subject.findById(id);
      if (name) subject.name = name;
      if (departmentId) subject.departmentId = departmentId;
      await subject.save();
      return subject.populate("departmentId");
    },
    deleteSubject: async (_, { id }) => {
      const result = await Subject.deleteOne({ _id: id });
      return result.deletedCount === 1;
    },
  },
};

// Khởi tạo Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

server.start().then(() => {
  app.get("/", (req, res) => {
    res.send("Teacher Service is running!");
  });
  app.head('/graphql', (req, res) => {
    res.status(200).end();
  });
  server.applyMiddleware({ app });
  app.listen(4000, () => console.log("Teacher service running on port 4000"));
});
