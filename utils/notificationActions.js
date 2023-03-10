const NotificationModel = require('../models/NotificationModel');
const UserModel = require('../models/UserModel');

// set the Notification to unread, or set unreadNotification to TRUE in user model

const setNotificationToUnread = async(userId)=>{
    try{
        const user = await UserModel.findById(userId);

        if(!user.unreadNotification){
            user.unreadNotification = true;
            await user.save();
        }
        return ;

    }
    catch(err){
        console.log(err);
    }
}


const newLikeNotification = async(userId,postId,userToNotifyId)=>{
  
    try{
        const userToNotify = await NotificationModel.findOne({user:userToNotifyId}) //user who receives notification or who has to be notified
 
         const newNotification ={
            type:"newLike",
            user:userId,
            post:postId,
            date:Date.now()
         };

         await userToNotify.notifications.unshift(newNotification)
        await userToNotify.save();

        await setNotificationToUnread(userToNotifyId);
        return ;

    }

    catch(err){
        console.log(err)
    }

}


const removeLikeNotification = async(userId,postId,userToNotifyId)=>{

try{
    await NotificationModel.findByIdAndUpdate(
        {user:userToNotifyId},
        {
            $pull:{
                notifications:{
                    type:"newLike",
                    user:userId,
                    post:postId,
                },
            },
        }
    );
    return;

}
catch(err){
    console.error(err)

}
};

const newCommentNotification =async(
    postId,
    commentId,
    userId,
    userToNotifyId,
    text
) =>{

   try{
    const userToNotify = await NotificationModel.findOne({
        user:userToNotifyId,
    })

    const newNotification ={
        type:"newComment",
        user:userId,
        post:postId,
        commentId,
        text,
        date:Date.now(),
    }

    await userToNotify.notifications.unshift(newNotification);

    await userToNotify.save();

    await setNotificationToUnread(userToNotifyId);
    return ;

   }

   catch(err){
    console.log(err);
   }


}


const removeCommentNotification = async(
    postId,
    commentId,
    userId,
    userToNotifyId
) =>{

    try{
        await NotificationModel.findOneAndUpdate(
            {user:userToNotifyId},
            {
                $pull:{
                    notifications:{
                        type:"newComment",
                        user:userId,
                        post:postId,
                        commentId:commentId,
                    }
                }
            }
        )

        return;

    }
    catch(err){
        console.error(err);
    }
}

const newFollowerNotification = async(userId,userToNotifyId)=>{

    try{
        const user = await NotificationModel.findOne({
            user:userToNotifyId
        });

        const newNotification ={
            type:"newFollower",
            user:userId,
            date:Date.now(),
        }

        await user.notifications.unshift(newNotification);
        await user.save();

        await setNotificationToUnread(userToNotifyId);
        return;

    }
    catch(err){
        console.log(err);
    }
}


const removeFollowerNotification = async(userId,userToNotifyId)=>{

    try{
        await NotificationModel.findOneAndUpdate(
            {user:userToNotifyId},
            {
                $pull:{
                    notifications:{
                        type:"newFollower",
                        user:userId,
                    }
                }
            }
        )

    }
    catch(err){
        console.error(err);
    }

}

module.exports ={
    newLikeNotification,
    removeCommentNotification,
    newFollowerNotification,
    removeFollowerNotification,
    removeLikeNotification,
    newCommentNotification

};