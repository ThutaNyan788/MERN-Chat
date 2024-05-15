const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const process = require("node:process");
const User = require("./models/User");
const Message = require("./models/Message");

const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");


dotenv.config();

process.on("uncaughtException", (err, origin) => {
    console.log(`UNCHAUGHT_EXCEPTION:: ${err.message}`)
})

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));


app.get("/test", (req, res) => {
    res.json("test ok");
});

app.get("/profile", (req, res) => {
    const token = req.cookies?.token;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        })
    } else {
        res.status(401).json({
            status: "fail",
            message: "No token"
        })
    }

})


app.post("/register", async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await User.create({username, password});

        jwt.sign({userId: user._id, username: user.username}, process.env.JWT_SECRET, {}, (err, token) => {
            if (err) throw err;
            res.cookie("token", token, {sameSite: "none", secure: true}).status(201).json({
                status: "success",
                id: user._id,
                username: user.username
            });
        })
    } catch (err) {
        console.log(`From Post Register: ${err.message}`);
        throw err;
    }

})

app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});

    if (foundUser) {
        const isCorrectPassword = bcrypt.compareSync(password, foundUser.password);

        if (isCorrectPassword) {
            try {
                await jwt.sign({
                    userId: foundUser._id,
                    username: foundUser.username
                }, process.env.JWT_SECRET, {}, (err, token) => {
                    if (err) throw err;
                    res.cookie("token", token, {sameSite: "none", secure: true}).status(201).json({
                        status: "success",
                        id: foundUser._id,
                        username: foundUser.username
                    });
                })
            } catch (err) {
                console.log(err.message);
            }
        }
    }
})

const server = app.listen(4040, (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
        .then((res) => {
            console.log("Database is connected")
            console.log("Server is listen at port:4040")
        })
        .catch((err) => {
            console.log(err.message)
        });
})
// wss => web socket server
// ws => web socket


const wss = new ws.WebSocketServer({server});
wss.on("connection", (connection, req) => {


    const cookies = req.headers.cookie;

    if (cookies) {
        const tokenCookieString = cookies.split(";").find((str) => str.startsWith("token"));

        if (tokenCookieString) {
            const token = tokenCookieString.split("=")[1];
            if (token) {
                jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
                    if (err) throw err;

                    const {userId, username} = userData;
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }

    connection.on("message", async (message) => {
        const messageData = JSON.parse(message.toString());

        const {recipient, text} = messageData;


        if (recipient && text) {
            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text
            });

            [...wss.clients]
                .filter((c) => c.userId === recipient)
                .forEach((c) => c.send(JSON.stringify(
                    {
                        text,
                        sender: connection.userId,
                        recipient,
                        id: messageDoc._id
                    })))
        }


    });


    [...wss.clients].forEach((client) => {
        client.send(JSON.stringify({
            online: [...wss.clients].map((c) => ({userId: c.userId, username: c.username}))
        }));
    });

})

