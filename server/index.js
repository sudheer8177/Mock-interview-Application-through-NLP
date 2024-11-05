require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { authendicateTocken } = require("./utilities");
const User = require("./models/user.model");
const app=express();

mongoose.connect("mongodb://localhost:27017/mainproject")
.then(() => {
    console.log('Successfully connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

//sign up

app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full Name is required" });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.json({
      error: true,
      message: "User already exists",
    });
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRECT, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken, // Fix the typo here
    message: "Registration Successful",
  });
});

//Log in 
app.post("/login", async (req,res)=>{
  const {email,password}= req.body

  if(!email){
    return res.status(400).json({message:"Email is required"});
  }
  if(!password){
    return res.status(400).json({message:"Password is required"});
  }
   const userInfo= await User.findOne({email:email});

   if(!userInfo){
    return res.status(400).json({message:"User not found"})
   }

   if(userInfo.email == email && userInfo.password == password){
    const user ={user: userInfo}
    const accessTocken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRECT,{
      expiresIn:"36000m",
    })
    return res.json({
      error:false,
      message:"Login Succesful",
      email,
      accessTocken,
    })
   }else{
    return res.status(400).json({
      error:true,
      message:"Invalid Credentials",
    })
   }

})

//get user
app.get("/get-user", authendicateTocken, async (req, res) => {
  const { user } = req.user;

  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }
  return res.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdOn: isUser.createdOn,
    },
    message: "",
  });
});

app.listen(3001, () => {
  console.log("server is running 3001");
});

module.exports = app;
