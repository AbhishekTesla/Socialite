// Login authentication
const router = require('express').Router();
const UserModel = require('../../models/UserModel');
const ChatModel = require('../../models/ChatSchema');
const FollowerModel = require('../../models/FollowerModel');
const NotificationModel = require('../../models/NotificationModel');
const ProfileModel = require('../../models/ProfileModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isEmail = require('validator/lib/isEmail');
const authMiddleware = require('../../middleware/authMiddleware');


router.get('/',authMiddleware,async(req,res)=>{
  
    const {userId} = req;
    console.log(userId)

    try{
      const user = await UserModel.findById(userId);

      const userFollowStats = await FollowerModel.findOne({user:userId});
      
      return res.status(200).json({user,userFollowStats});
    }

    catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
    }
})




router.post('/',async(req,res)=>{
    const {email, password} = req.body;

    if(!isEmail(email)) return res.status(401).send("Invalid Email");
    if(password.length < 6) return res.status(401).send("Password must be atleast 6 characters");
    
    try{
        const user = await UserModel.findOne({email:email.toLowerCase()}).select('+password'); //selecting the password field from the database
        
        if(!user) return res.status(401).send("Invalid Credentials");

        const isMatch = await bcrypt.compare(password,user.password); //comparing the password entered by the user with the password stored in the database

        if(!isMatch) return res.status(401).send("Invalid Credentials");

        const chatModel = await ChatModel.findOne({user:user._id});
        const profileModel = await ProfileModel.findOne({user:user._id});
        const followerModel = await FollowerModel.findOne({user:user._id});
        const notificationModel = await NotificationModel.findOne({user:user._id});

        if(!chatModel){
            const newChatModel = new ChatModel({user:user._id});
            await newChatModel.save();
        }

        if(!profileModel){
            const newProfileModel = new ProfileModel({user:user._id});
            await newProfileModel.save();
        }

         if (!followerModel) {
      await new FollowerModel({
        user: user._id,
        followers: [],
        following: [],
      }).save();
    }

        if(!notificationModel){
            const newNotificationModel = new NotificationModel({user:user._id});
            await newNotificationModel.save();
        }

        const payload = { userId: user._id };
        jwt.sign(payload, process.env.JWT_SECRET,  {expiresIn:'2d'} , (err, token) => {
            if (err) throw err;
            res.status(200).json(token);
        });



    }

catch(err){
    console.log(err);
    return res.status(500).send("Server Error");
}

})



module.exports = router;