const express = require('express');
const authmiddleware = require('../../middleware/authMiddleware');
const UserModel = require('../../models/UserModel');
const ProfileModel = require('../../models/ProfileModel');
const FollowerModel = require('../../models/FollowerModel');
const PostModel = require('../../models/PostModel');
const router = express.Router();
const bcrypt = require('bcrypt');

//Get The user Information
router.get("/:username",authmiddleware,async(req,res)=>{
    const {username} = req.params;

    try{
     const user = await UserModel.findOne({username:username.toLowerCase()});

     if(!user) return res.status(404).send("user not found");

     const profile = await (await ProfileModel.findOne({user:user._id})).populate("user");

     const profileFollowStats = await FollowerModel.findOne({user:user._id});

    return res.json({
      profile,
      followersLength:
        profileFollowStats.followers.length > 0
          ? profileFollowStats.followers.length
          : 0,
      followingLength:
        profileFollowStats.following.length > 0
          ? profileFollowStats.following.length
          : 0,
    });
    }
    catch(err){
 console.log(err);
 return res.status(500).send("Server error");
    }

})

//Get The user posts
router.get('/posts/:username',authmiddleware,async(req,res)=>{

    const {username} = res.params;

    try{
        const user = await UserModel.findOne({username:username.toLowerCase()});
        
        if(!user)
        return res.status(404).send("User Not Found!");

        const posts = await PostModel.find({user:user._id})    //Find({}) will finds all user posts
        .sort({createdAt:-1})
        .populate("user")
        .populate("comments.user");

        return res.json(posts);
    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
    }
})


//Get the User Followers
router.get("/followers/:userId",authmiddleware,async(req,res)=>{
    const {userId} = req.params;

    try{

        const user = await FollowerModel.findOne({user:userId}).populate("followers.user");

        
        return res.json(user.followers);
    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
    }
})


//Get the User following
router.get("/following/:userId",authmiddleware,async(req,res)=>{
    const {userId} = req.params;

    try{

        const user = await FollowerModel.findOne({user:userId}).populate("following.user");

        
        return res.json(user.following);
    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
    }
})


//Follow A User
router.post("/follow/:userToFollowId",authmiddleware,async(req,res)=>{
    const {userId} = req; // This is from middleware
    const {userToFollowId} = req.params;

    try{
        const user = await FollowerModel.findOne({user:userId});
        const userToFollow = await FollowerModel.findOne({user:userToFollowId});

        if(!user || !userToFollow)
        return res.status(404).send("user not found");

        const isFollowing =
        user.following.length > 0 &&
        user.following.filter(
            (following)=>following.user.toString()===userToFollowId
        ).length>0;

        if(isFollowing)
        return res.status(401).send("User Already Followed");

        await user.following.unshift({user:userToFollowId});  //The unshift() method adds new elements to the beginning of an array.
        await user.save();

        await userToFollow.followers.unshift({user:userId});
        await userToFollow.save();

        // await newFollowerNotification(userId,userToFollowId);

        return res.status(200).send("success");

    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server error");
    }
})


//Unfollow A User
router.put("/unfollow/:userToUnfollowId",async(req,res)=>{
    const {userId} = req;
    const {userToUnfollowId} = req.params;

    try{
        const user = await FollowerModel.findOne({user:userId});
        const userToUnfollow = await FollowerModel.findOne({
            user:userToUnfollowId
        });

        if(!user || !userToUnfollow)
        return res.status(404).send("User Not Found");

        const isNotFollowing =
        user.following.length>0 &&
        user.following.filter(
            (following)=>following.user.toString()===userToUnfollowId
        ).length===0;

        if(isNotFollowing)
        return res.status(401).send("User Not Followed Previously");

        const userToUnfollowIndex = user.following.findIndex(
            (following)=>following.user.toString()===userToUnfollowId
        );

        await user.following.splice(userToUnfollowIndex,1);  //The splice() method removes array userToUnfollowIndex  item and 1 is number of items.
        await user.save();

        const userIndex = userToUnfollow.followers.findIndex(
            (followers)=>followers.user.toString()===userId
        );

        await userToUnfollow.followers.splice(userIndex,1);  
        await userToUnfollow.save();

        // await removeFollowerNotification(userId, userToUnfollowId);

        return res.status(200).send("success");

    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
    }
})

//Update profile

router.post("/update",authmiddleware,async(req,res)=>{
    try{
        const {userId} = req;

        const {bio,facebook,youtube,twitter,instagram,profilePicUrl}=
        req.body;

        let profileFields = {};

        profileFields.user = userId;

        if(bio) profileFields.bio = bio;

        profileFields.social = {};
        if(facebook) profileFields.social.facebook = facebook;
        if(youtube) profileFields.social.youtube = youtube;
        if(instagram) profileFields.social.instagram = instagram;
        if(twitter) profileFields.social.twitter = twitter;

        await ProfileModel.findOneAndUpdate(
            {user:userId},
            {$set:profileFields},
            {new:true}
        )

        if(profilePicUrl){
            const user = await UserModel.findById(userId);
            user.profilePicUrl=profilePicUrl;
            await user.save();
        }
        
        return res.status(200).send("Success");

    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server error");
    }
})

// Update ProfilePicUrl and/or CoverPicUrl

router.post("/updatepictures",authmiddleware,async(req,res)=>{
    try{
        const {userId} = req;
        const {profilePicUrl,coverPicUrl} = req.body;

        if(profilePicUrl){
            const user = await UserModel.findById(userId);
            user.profilePicUrl=profilePicUrl;
            await user.save();
        }
        if(coverPicUrl){
            const user = await UserModel.findById(userId);
            user.coverPicUrl=coverPicUrl;
            await user.save();
        }

        return res.status(200).send("Success");
    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server error")
    }
})

//Update Password 

router.post("/settings/password",authmiddleware,async(req,res)=>{
    console.log(req.body)
    try{
        const {currentPassword,newPassword} = req.body;

        if(newPassword.length<6){
            return res.status(401).send("Password must be atleast 6 char")
        }

        const user = await UserModel.findById(req.userId).select("+password");

        const isPassword = await bcrypt.compare(currentPassword,user.password)
        if(!isPassword){
            return res.status(401).send("Invalid Password");
        }

        user.password = await bcrypt.hash(newPassword,10);
        await user.save();

        return res.status(200).send("Updated");

    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server error !!")
    }
})


// Update Message Popup Settings

router.post("/settings/messagePopup",authmiddleware,async(req,res)=>{
    try{
        const user = await UserModel.findById(req.userId);

        if(user.newMessagePopup){
            user.newMessagePopup = false;
            await user.save();

        }
        else{
            user.newMessagePopup = true;
            await user.save();
        }

        return res.status(200).send("Success");

    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error")
    }
})

//Get all followers of all users and then return the first 5 results from top to bottom;

router.get("/home/youMayLikeToFollow",authmiddleware,async(req,res)=>{
    try{
        const users = await FollowerModel.find({}).populate("user").limit(4);
        return res.json(users);
    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server error");
    }
})


module.exports = router;
