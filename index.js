import express from "express";
// import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend"
}).then(()=>console.log("Database Connected")).catch((e)=>console.log(e));

const userSchema = new mongoose.Schema(
    {
        name:String,
        email:String,
        password:String,
    }
);

const User = mongoose.model("User", userSchema)
const app = express();

// const users = [];
//Using Middlewares 
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());
//Setting up view engine
app.set("view engine", "ejs");

const isAuthenticated = async(req,res,next) => {
    const {token} = req.cookies;
    if(token) {
        // res.render("logout");
        const decoded = jwt.verify(token, "fhjdfkjsdfkj")
        // console.log(decoded);
        req.user = await User.findById(decoded._id);
        next();
    }
    else {
        res.redirect("/login");
    }
}



app.get("/",isAuthenticated, (req,res) => {
    // res.sendStatus(400);
    // res.json({
    //     success:true,
    //     products:[]
    // })
    // res.status(400).send("Meri marzi");
    // const pathlocation = path.resolve();
    // res.sendFile(path.join(pathlocation, "./index.html"));
    // res.render("index", {name: "Sudhanshu Kumar"});
    // console.log(req.cookies.token);
    // const {token} = req.cookies;
    // if(token) {
    //     res.render("logout");
    // }
    // else {
    //     res.render("login");
    // }
    // console.log(req.user);
    res.render("logout", {name:req.user.name});
    // res.sendFile("index");
    
    // res.render("logout", {name: req.user.name});
})
app.get("/login",(req,res) => {
    res.render("login");
})
app.get("/register", (req,res) => {
    res.render("register");
})
app.post("/login", async(req,res) => {
    const {email, password} = req.body;
    let user = await User.findOne({email});
    if(!user) return res.redirect("/register");
    // const isMatch = user.password === password;
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.render("login", {email, message:"Incorrect Passwrod"});
    const token = jwt.sign({_id:user._id}, "fhjdfkjsdfkj")
    res.cookie("token", token ,{
        httpOnly:true, //to make it more secure
        expires:new Date(Date.now()+60*1000)
    });
    res.redirect("/"); 
})
app.post("/register", async(req,res)=> {
    const {name, email, password} = req.body;

    let user = await User.findOne({email});
    if(user) {
        return res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // console.log(req.body);
    // console.log(token);
    user = await User.create({
        name,
        email,
        password: hashedPassword,
    })
    const token = jwt.sign({_id:user._id}, "fhjdfkjsdfkj")
    res.cookie("token", token ,{
        httpOnly:true, //to make it more secure
        expires:new Date(Date.now()+60*1000)
    });
    res.redirect("/");
})
app.get("/logout", (req,res)=> {
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    });
    res.redirect("/");
})
// app.get("/success", (req,res) => {
//     res.render("success");
// })

// app.get("/add", async(req,res)=> {
//     await message.create({name:"Sudhanshu1", email:"sudhanshu1kumar4534@gmail.com"}).then(()=>{
//         res.send("Nice");
//     })
//     // res.send("Nice");
// })
// app.post("/contact", async(req,res) => {
//     // console.log(req.body.name);
//     // const messageData = {userName: req.body.name, email: req.body.email}
//     // console.log(messageData);
//     const {name, email} = req.body;
//     await message.create({name, email});
//     res.redirect("/success");
// })

// app.get("/users", (req,res) => {
//     res.json({
//         users,
//     })
// })
app.listen(5000, () => {
    console.log("Server is working");
})