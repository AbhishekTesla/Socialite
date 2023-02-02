const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user:{type: Schema.Types.ObjectId , ref:"User"},
    text:{type:String , required:true},
    location:{type:String},
    likes:[{user:{type: Schema.Types.ObjectId , ref:"User"} }],
    // Mongoose also supports arrays of subdocuments. Here's how you can define an array of likes, having user property.

comments:[
    {
         // by default, if we dont provide any _id, mongo db adds it by itself. But we can override that by specifying _id ourselves
        _id:{type:String,required:true},
        
        user:{type:Schema.Types.ObjectId , ref:"User"},
        text:{type:String,required:true},
        date:{type:Date , default:Date.now},
    }
],

},
{timestamps:true}
);

module.exports = mongoose.model("Post",PostSchema)

