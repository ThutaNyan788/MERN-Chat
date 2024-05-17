const mongoose = require("mongoose");
const dotenv = require("dotenv");
const express = require("express");
const messageModel = require("./models/Message");




dotenv.config();

const app = express();





mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("database is connected")

        app.listen(5050, (req, res) => {
            console.log(`Server is running:5050`)
        })

    })
    .catch(e => {
        console.log(e.message);
    })

async function deleteAllMessages()
{
    await messageModel.deleteMany();
    console.log("deleted success");
}

deleteAllMessages();
