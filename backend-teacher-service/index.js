const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Định nghĩa schema
const typeDefs = gql`
  type Teacher {
    id: ID!
    name: String!
    department: String!
    subjects: [String!]!
  }

  type Query {
    getTeachers: [Teacher!]
  }

  type Mutation {
    addTeacher(name: String!, department: String!, subjects: [String!]): Teacher
  }
`;

// Resolvers
const resolvers = {
  Query: {
    getTeachers: async () => {
      return await Teacher.find();
    },
  },
  Mutation: {
    addTeacher: async (_, { name, department, subjects }) => {
      const teacher = new Teacher({ name, department, subjects });
      await teacher.save();
      return teacher;
    },
  },
};

// Model MongoDB
const Teacher = mongoose.model("Teacher", {
  name: String,
  department: String,
  subjects: [String],
});

// Khởi tạo Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });
const app = express();

server.start().then(() => {
  app.get("/", (req, res) => {
    res.send("Teacher Service is running!");
  });
  server.applyMiddleware({ app });
  app.listen(4000, () => console.log("Teacher service running on port 4000"));
});
