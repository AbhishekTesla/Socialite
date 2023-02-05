const router = require('express').Router();
const UserModel = require('../../models/UserModel');
const ProfileModel = require('../../models/ProfileModel');
const FollowerModel = require('../../models/FollowerModel');
const NotificationModel = require('../../models/NotificationModel');
const ChatModel = require('../../models/ChatSchema');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt') //A library to help you hash passwords.
const isEmail = require('validator/lib/isEmail'); //This library validates and sanitizes strings only.
const ChatSchema = require('../../models/ChatSchema');
const userPng =
  "https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png"; //default profile pic for the user

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/; //regex to validate username


router.get('/:username',async(req,res)=>{
    const {username} = req.params;
    console.log(username);

      try{

        if(username.length<1) 
        return res.status(401).send("Invalid");

       if(!regexUserName.test(username))  //The test() method tests for a match in a string. If it finds a match, it returns true, otherwise it returns false.
       return res.status(401).send("Invalid")

       const user = await UserModel.findOne({username:username.toLowerCase()})  //on the backend all the usernames are converted to lower case before storing

       if(user) return res.status(400).send("Username Already Taken");

       res.status(200).send("Available");
      }

      catch(err){
         console.log(err.response.data);
         return res.status(500).send("Server Error");
      }

})  //this means /api/signup/:username



router.post('/',async(req,res)=>{
    const {
        name,
        email,
        username,
        password,
        bio,
        facebook,
        youtube,
        twitter,
        instagram,
    } = req.body;

  if(!isEmail(email)) return res.status(401).send("Invalid Email");  //check if the string is an email.
   
  if(password.length < 6)
  return res.status(401).send("Password must be atleast 6 characters");

  try{
 
     let user;
     user = await UserModel.findOne({email:email.toLowerCase()});
     if(user)
     return res.status(401).send("Another user has already registered with this email");
    
    //  Save User Data to the User Model
  
    user = new UserModel({
        name,
        email:email.toLowerCase(),
        username:username.toLowerCase(),
        password,
        profilePicUrl: req.body.profilePicUrl || userPng,
        coverPicUrl:"https://images.pexels.com/photos/114979/pexels-photo-114979.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
    });

    user.password = await bcrypt.hash(password,10); //encrypt password. More will be the rounds, more memory it will consume. 10 is the recommended number
    await user.save();

    // Profile Model

    let profileFields={};
    profileFields.user = user._id;//here we're referencing the id of the new user to the 'user' property of the ProfileModel (which is of the type user ID)
    
    profileFields.social={};

    if(facebook) profileFields.social.facebook=facebook;
    if(youtube) profileFields.social.youtube = youtube;
    if(instagram) profileFields.social.instagram=instagram;
    if(twitter) profileFields.social.twitter=twitter;

    //initialising all the remaining models..
    await new ProfileModel(profileFields).save();


    // Follower Model
    await new FollowerModel(
        {
            user:user._id,
            followers:[],
            following:[],
        }
    ).save();

//    NotificationModel
await new NotificationModel({user:user._id,notifications:[]}).save();

// ChatModel
await new ChatSchema({user:user._id,chats:[]}).save();

// JWT 
// JWT has three main parts Headers,Payload and Signature
const payload = {userId:user._id};

jwt.sign(
    payload,
    process.env.JWT_SECRET,  // it is a secrete key
    { expiresIn:"2d"},
    (err,token)=>{
        if(err) throw err;
        return res.status(200).json(token);
    }
);

  }
  catch(err){
console.log(err)
return res.status(500).send("Server error");
  }
})

module.exports = router