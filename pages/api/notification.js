const express = require("express");
const router = express.Router();
const authmiddleware = require("../../middleware/authmiddleware");
const UserModel = require("../../models/UserModel");
const NotificationModel = require("../../models/NotificationModel");


// Get User Notifications
router.get("/",authmiddleware,async(req,res)=>{
    try{
        const {userId} = req;

        const user = await NotificationModel.findOne({user:userId})
        .populate("notifications.user")
        .populate("notifications.post")

        return res.status(200).json(user.notifications);
    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
    }
})

router.post("/",authmiddleware,async(req,res)=>{
    try{
        const {userId} = req;

        const user = await UserModel.findById(userId);

            //set user.unread notification to false if it's already true (used from frontend to set it to false).

            if(user.unreadNotification){
                user.unreadNotification = false;
                await user.save();

            }

            return res.status(200).send("Updated");

    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error")
    }
})

module.exports = router;