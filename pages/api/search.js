const express = require('express');
const router = require('express').Router();
const UserModel = require('../../models/UserModel');
const authmiddleware = require('../../middleware/authMiddleware');


router.get('/:searchText',authmiddleware,async(req,res)=>{
    const {searchText} = req.params;
    const {userId} = req;
    if(searchText.length===0)return;

    try{
        const results = await UserModel.find({
            name:{$regex:searchText,$options:"i"},
        })

        // regex regular expression capabilities for pattern matching strings in queries. & options for case sensitivity

        const resultsToBeSent=
        results.length>0 && 
        results.filter((result)=>result._id.toString()!==userId);

        return res.status(200).json(resultsToBeSent)

    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
    }
})

module.exports = router;