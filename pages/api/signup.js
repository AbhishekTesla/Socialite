const router = require('express').Router();
const UserModel = require('../../models/UserModel');

router.get("/",async(req,res)=>{
    UserModel.find()
    .then(user => res.json(user))
    .catch(err=>res.status(400).json("Error" + err))
})

router.post("/", async(req,res)=>{
   
    const name = req.body.name;
    const username= req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    const newuser = new UserModel({
        name,
        password,
        email,
        username
    })
    newuser.save()
    .then(()=>res.json("User added !"))
    .catch(err => res.status(400).json("Error : " + err));
} )


module.exports = router