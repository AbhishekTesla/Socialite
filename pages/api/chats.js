const express = require('express');
const router = require('express').Router();
const ChatSchema = require('../../models/ChatSchema');
const UserModel = require('../../models/UserModel');
const authMiddleware = require('../../middleware/authMiddleware');

// Get All Chats

router.get('/',authMiddleware,async(req,res)=>{
    try{
        const {userId} = req;
        const user = await ChatSchema.findOne({user:userId}).populate("chats.textsWith")

        let chatsToBesent =[];

        if(user.chats.length>0){
            chatsToBesent = await user.chats.map((chat)=>({
                textsWith:chat.textWith._id,
                name:chat.textWith.name,
                profilePicUrl:chat.textWith.profilePicUrl,
                lastText:chat.texts[chat.texts.length - 1].text,
                date:chat.texts[chat.texts.length - 1].date,
                //date of the last message
            }))
        }

        return res.json(chatsToBesent);

    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error")
    }
})



//set unreadChat to false once the user clicks on chat header icon

router.post("/",authMiddleware,async(req,res)=>{
    try{
        const {userId} = req;
        const user = await UserModel.findById(userId);

        if(user.unreadMessage){
            user.unreadMessage = false;
            await user.save();
        }
        return res.status(200).send("Updated");

    }
    catch(err){
        console.log(err);
        return res.status(500).send("server error")
    }
})

module.exports = router;