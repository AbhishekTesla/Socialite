import axios from "axios";
import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";
import Router from "next/router";
import cookie from "js-cookie";

export const registerUser = async(
    user,
    profilePicUrl,
    setError,
    setLoading
)=>{
 
    try{
        const res = await axios.post(`${baseUrl}/api/signup`,{
            user,
            profilePicUrl
        });  // user is the user obj from frontend

        setToken(res.data); // jwt token received in res.data from backend
    }
    catch(err){
        const errmsg = catchErrors(err);
        setError(errmsg);
    }
    setLoading(false);
};

export const loginUser = async(user,setErrorMessage,setLoading)=>{
    setLoading(true);
    try{
        const res = await axios.post(`${baseUrl}/api/auth`,{user});
        setToken(res.data);
    }
   catch(err){
        const errmsg = catchErrors(err);
        setErrorMessage(errmsg);
    }
    setLoading(false);
}


export const redirectUser = (ctx,location)=>{

     if(ctx.req){
        ctx.res.writeHead(302,{Location:location});
        ctx.res.end();
     }
     else{
         //if the user is on client side
        Router.push(location);
     }

};

const setToken=(token)=>{
    cookie.set("token",token); //save the jwt token in the cookie
    Router.push("/");
}

export const logoutUser = async(email,router)=>{
    if(router.pathname==="/chats"){
        router.replace("/");
    }
    cookie.set("userEmail",email); //this cookie is set to auto set the email field next time the user is on /login page
    cookie.remove("token");

    await router.push("/login");
    router.reload();
}