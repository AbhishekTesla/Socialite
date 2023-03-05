// helpful middleware to make sure the username stored on the token is the same as the request

const jwt = require('jsonwebtoken')


function authMiddleware(req,res,next){

console.log(req.headers["authorization"].split(" ")[1]);
    if(!req.headers.authorization){
        return res.status(401).send("Unauthorized");
    }
    
try{
    const {userId} = jwt.verify(req.headers["authorization"].split(" ")[1],process.env.JWT_SECRET);  //Returns the payload decoded if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will throw the error.

    req.userId = userId; 
    next();
}
catch(error){
    console.log(error);
    return res.status(401).send("Unauthorized");
}
}

module.exports = authMiddleware;