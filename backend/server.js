require("dotenv").config();
const config = require("./config.json");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dbUrl = process.env.MONGODB_URL;


mongoose.connect(dbUrl);

const express = require("express");
const cors = require('cors');
const NotesRouter = require('./Routes/Router/Router');
const app = express();

app.use(express.json());

app.use(cors({
    origin:"*"
}));

app.get("/", (req, res)=>{
    res.json({
        data:"hello"
    })
})

app.use('/api/v1/user', NotesRouter);

app.listen(8000,()=>{
    console.log(`Server is up and running on port 8000`)
})

module.exports = app; 