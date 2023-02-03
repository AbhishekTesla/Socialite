const mongoose = require('mongoose');

async function connectionDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true})
        console.log("MongoDb connected");
    }
    catch(error){
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectionDB;