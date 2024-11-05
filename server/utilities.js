const jwt = require("jsonwebtoken");


function authendicateTocken(req,res,next){
    const authHeader=req.headers["authorization"];
    const token =authHeader && authHeader.split(" ")[1];
   
    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRECT,(err,user)=>{
        if(err) return res.sendStatus(401);
        req.user = user;
        next();
    })

}

module.exports={
    authendicateTocken,
}