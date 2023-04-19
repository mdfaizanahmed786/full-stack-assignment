const express = require("express");
const app = express();
require("dotenv").config();
const cors=require('cors');
const jwt = require("jsonwebtoken");
const morgan=require('morgan');
const authenticateUser = require("./middleware/authenticateUser");
const port = 3001;
const { v4 } = require("uuid");
const errorHandler = require("./middleware/errorHandler");
const asyncHandler = require("express-async-handler");
app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());


const USERS = [
  {
    email: "faizan@gmail.com",
    password: "123456",
    role: "admin",
  },
];



const QUESTIONS = [
  {
    questionId: "1",
    title: "Two states",
    description: "Given an array , return the maximum of the array?",
    testCases: [
      {
        input: "[1,2,3,4,5]",
        output: "5",
      },
    ],
  },
  {
    questionId: "2",
    title: "Binary Search",
    description:
    "Given an sorted array , find index in array that matches the key?",

    testCases: [
      {
        input: "[1,2,3,4,5]",
        key: "5",
        output: "4",
      },
      {
        input: "[11,12,13,14,17]",
        key: "14",
        output: "3",
      },
    ],
  },
  {
    questionId: "3",
    title: "Find Unique",
    description:
    "Given an array, each element appears twice except for one, find that element?",
    
    testCases: [
      {
        input: "[2,2,1,3,3]",
        output: "1",
      },
      {
        input: "[5,5,6,6,7,7,9,9,10]",
        
        output: "10",
      },
    ],
  },
];

const SUBMISSION = [
  {
    user: "faizan@gmail.com",
    questionId: "1",
    code: "function getResults(){ return {result:true}}",
    status: "accepted",
  },
  {
    user: "faizan@gmail.com",
    questionId: "2",
    code: "function getResults(){ return {result:true}}",
    status: "rejected",
  },
];


app.post("/signup", asyncHandler(function (req, res) {
  // Add logic to decode body
  // body should have email and password
  const { email, password } = req.body;
  if (!email) {
 res.status(400)
    throw new Error("Email is required")


  }
  if (!password) {
    res.status(400)
    throw new Error("Password is required")
  }
  // to check user exists in the db or not
  const checkUserExists = USERS.find((user) => user.email === email);
  if (checkUserExists) {
    res.status(400)
    throw new Error("User already exists")
  }
  USERS.push({
    email,
    password,
    role: "user",
  });

  // check result
  console.log(USERS);

  const token = jwt.sign(
    {
      email,
      role: "user",
    },
    process.env.JWT_SECRET
  );

  //Store email and password (as is for now) in the USERS array above (only if the user with the given email doesnt exist)
  
  // return back 200 status code to the client
  res.status(201).json({ success: "Created a user", token });
}))


app.post("/login", asyncHandler(function (req, res) {
  // Add logic to decode body
  // body should have email and password
  
  const { email, password } = req.body;
  if (!email) {
    res.status(400)
    throw new Error("Email is required")
  }
  if (!password) {
    res.status(400)
    throw new Error("Password is required")
  }
  
  // Check if the user with the given email exists in the USERS array
  // Also ensure that the password is the same
  const checkUserExists = USERS.find(
    (user) => user.email === email && user.password === password
    );
  if (!checkUserExists) {
    res.status(401)
    throw new Error("Invalid credentials")
  }
  const checkAdmin = USERS.find((user) => user.role === "admin" && user.email===email);
  console.log(checkAdmin)
  if (!checkAdmin) {
    const token = jwt.sign(
      {
        email,
        role: "user",
      },
      process.env.JWT_SECRET
      );
      return res.json({ success: "Login success", token });
    }
    // If the password is the same, return back 200 status code to the client
    // Also send back a token (any random string will do for now)
    const token = jwt.sign(
      {
      email,
      role:"admin"
    },
    process.env.JWT_SECRET
    );
    
    // If the password is not the same, return back 401 status code to the client
    
    res.json({ success: "Login success", token });
  }))
  
app.get("/questions", asyncHandler(function (req, res) {
  //return the user all the questions in the QUESTIONS array
  res.status(200).json(QUESTIONS);
}))


// return a single question based on its title
app.get("/questions/:title", asyncHandler(function (req, res) {
  const { title } = req.params;
  const checkQuestion = QUESTIONS.find((question) => question.title === title);
  if (!checkQuestion) {
    res.status(404)
    throw new Error("No question found!")
  }

res.status(200).json(checkQuestion);
}))












app.get("/submissions", authenticateUser, asyncHandler(function (req, res) {
  // return the users submissions for this problem
  
  const authUser = req.user;
  const { questionId } = req.body;
  if (!questionId) {
    res.status(404)
    throw new Error("No submissions found!")
  }
  const checkSubmission = SUBMISSION.find(
    (submission) =>
      submission.user === authUser.email && questionId === submission.questionId
  );
  if (!checkSubmission) {
    res.status(404)
    throw new Error("No submissions found!")
  }

  // check result
  console.log(checkSubmission);
  
  res.status(200).json(checkSubmission);
}))

app.post("/submissions", authenticateUser, asyncHandler(function (req, res) {
  // let the user submit a problem, randomly accept or reject the solution
  // Store the submission in the SUBMISSION array above
  const authUser = req.user;
  const { code, questionId, title } = req.body;
  if (!code || !questionId || !title) {
    res.status(400)
    throw new Error("Invalid request")
  }
  const findQuestion = QUESTIONS.find(
    (question) => question.questionId === questionId && title === question.title
  );

  if (!findQuestion) {
    res.status(404)
    throw new Error("Invalid request")
  }
  
  const generateResult = Math.floor(Math.random() + 0.5);
  
  SUBMISSION.push({
    email: authUser.email,
    questionId,
    code,
    status: generateResult === 1 ? "accepted" : "rejected",
  });
  
  // to check the result
  console.log(SUBMISSION);
  
  const result = SUBMISSION.find(
    (submission) =>
      submission.user === authUser.email && questionId === submission.questionId
  );
  res.status(201).json({
    success: "Problem submitted successfully",
    result:SUBMISSION,
  });
}))

// leaving as hard todos
// Create a route that lets an admin add a new problem
// ensure that only admins can do that.

app.post("/create-question", authenticateUser, asyncHandler(function (req, res) {
  const checkRole = req.user.role === "admin";
  if (!checkRole) {
    res.status(401)
    throw new Error("You are not authorized to add a question")
  }
  const { title, description, testCases } = req.body;
  if (!title || !description || !testCases) {
    res.status(400)
    throw new Error("Invalid request")
  }
  if (!Array.isArray(testCases)) {
    res.status(400)
    throw new Error("Invalid request")
  }
  const existenceOfQuestion = QUESTIONS.find(
    (question) =>
    question.title === title || question.description === description
    );
    if (existenceOfQuestion) {
    res.status(400)
    throw new Error("Question already exists")
  }
  QUESTIONS.push({
    questionId: v4(),
    title,
    description,
    testCases,
  });

  
// to check the results
  console.log(QUESTIONS);

  res.status(201).json({ success: "Created a new question" });
}))
app.use(errorHandler)


app.listen(port, function () {
  console.log(`Example app listening on port ${port}`);
});
