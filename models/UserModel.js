const mongoose = require('mongoose');
const Schema = mongoose.Schema;  // used to create schema variable

const UserSchema =  new Schema({

    name:{type:String , required:true},

    password:{type:String , required:true , select:false},

    email:{type:String , required:true , unique:true},

    username:{type:String,required:true,unique:true,trim:true},

    profilePicUrl:{type:String},

    coverPicUrl:{type:String},

    newMessagePopup:{type:Boolean , default:true},
    //newMessagePopup default value set  be true

    unreadMessage:{type:Boolean , default:false},
    //unreadMessage default value set be false

    role:{type:String , default:"user" , enum:["user","root"]},
   //enum tells mongoose that there can only be two values for role, i.e. 'user' and 'root'

    resetToken:{type:String},

    expireToken:{type: Date},

},
{timestamps:true}
//timestamps are auto added to the databse and they tell when the user was created
);



module.exports = mongoose.model("User",UserSchema);