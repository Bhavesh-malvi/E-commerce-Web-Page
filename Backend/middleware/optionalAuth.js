import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const optionalAuth = async (req,res,next)=>{

 try{

  if(req.cookies?.token){

   const decoded = jwt.verify(
    req.cookies.token,
    process.env.JWT_SECRET
   );

   req.user = await User.findById(decoded.id);
  }

 }catch(err){
  // ignore
 }

 next();
};

export default optionalAuth;
