const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProfileSchema = new Schema(
    {

        user:{type:Schema.Types.ObjectId , ref:"User"},
            //The ref option is what tells Mongoose which model to use during population, in our case the User  model from UserSchema.
        
        bio:{type:String, required:true},
        social:{
            youtube:{type:String},
            twitter:{type:String},
            facebook:{type:String},
            instagram:{type:String},

        },


    },
    {
        timestamps:true
    }
);


module.exports = mongoose.model("Profile",ProfileSchema);