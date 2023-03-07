// By default, Next.js includes its own server with next start. If you have an existing backend, you can still use it with Next.js (this is not a custom server). A custom Next.js server allows you to start a server 100% programmatically in order to use custom server patterns. Most of the time, you will not need this – but it's available for complete customization.

// So here we are building our custom server below

const express = require("express");
const app = express();
const connectionDB = require('./db/connectionDB');

const cors = require("cors"); //Basically cors module allows server to communcate with different domains

const server = require("http").Server(app);

const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({dev});   // Next Dev runs your application in Dev mode

const handle = nextApp.getRequestHandler();

require("dotenv").config();
const PORT = process.env.PORT || 3000;
//In next js, server and app both run on the same port, i.e. port 3000
// we don't need two separate ports for frontend and backend


connectionDB();
const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors(corsOpts));
app.use(express.json()); //for getting req.body in a json format and for parsing the request.


nextApp.prepare().then(()=>{
    //Now here we are setting up our api calls
  
    app.use("/api/signup",require('./pages/api/signup'));
    app.use("/api/auth",require("./pages/api/auth"));
    app.use("/api/profile",require("./pages/api/profile"));
    app.use("/api/notification",require("./pages/api/notification"));
    
  

    server.listen(PORT,(err)=>{
        if(err) throw err;
        console.log(`Server listening on port ${PORT}...`)
    })
})


