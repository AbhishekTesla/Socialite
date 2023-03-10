const ChatSchema = require('../models/ChatSchema');
const UserModel  = require('../models/UserModel');

const loadTexts = async(userId,textsWith)=>{
 
    try{
 const chatUser = await ChatSchema.findOne({user:userId}).populate("chats.textsWith")

  const chat = chatUser.chats.find(
    (chat)=>chat.textsWith._id.toString()===textsWith
  )

  if(!chat){
    const textsWithUser = await UserModel.findById(textsWith);

    const textsWithDetails ={
        name:textsWithUser.name,
        profilePicUrl:textsWithUser.profilePicUrl,
        id:textsWithUser._id,
    };

    return {
        textsWithDetails
    };


  }
  return {chat};

    }
    catch(err){
       console.log(err);
       return {err};
    }


}

const getUserInfo = async(userId)=>{
    try{
        const user = await UserModel.findById(userId);

        if(user){
            const userDetails ={
                name:user.name,
                profilePicUrl:user.profilePicUrl,
                id:user._id,
            };

            return {
                userDetails,
            }
        }
        return;
    }
    catch(err){
console.log(err);
    }
};


const sendText = async(userId,userToTextId,text)=>{
    try{
        const loggedInUser = await ChatSchema.findOne({user:userId});
        const textToSendUser = await ChatSchema.findOne({user:userToTextId});

        const newText ={
            sender:userId,
            receiver: userToTextId,
            text,
            date:Date.now(),
        }

        // Sender
        const previousChat = loggedInUser.chats.length > 0 && loggedInUser.chats.find((chat)=>chat.textsWith.toString()===userToTextId)
         
        if(previousChat)
        previousChat.texts.push(newText);
        else{
            const newChat ={
                textWith:userToTextId,
                texts:[newText],
            };
            loggedInUser.chats.unshift(newChat);
        }
        await loggedInUser.save();

           // Receiver

           const lastChat =
           textToSendUser.chats.length >0 &&
           textToSendUser.chats.find((chat)=>chat.textsWith.toString()===userId)
  
            if(lastChat)
            lastChat.texts.push(newText);

            else{
                const newChat={
                    textWith:userId,
                    texts:[newText],
                }

                textToSendUser.chats.unshift(newChat);

            }
            await textToSendUser.save();

            return {newText};

    }
    catch(err){
     console.log(err);
     return {err};
    }
}


const setMessageToUnread = async(userId)=>{
    try{
        const user = await UserModel.findById(userId);

        if(!user.unreadMessage){
            user.unreadMessage = true;
            await user.save();
        }
        return ;

    }
    catch(err){
        console.log(err);
    }
}

module.exports = {setMessageToUnread,sendText,getUserInfo,loadTexts};