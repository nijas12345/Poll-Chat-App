import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
const secret_key = process.env.JWT_SECRET as string;
const tokenTime = "1d"

const verifySimpleToken = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.cookies.token);
      
      const accessToken: string = req.cookies?.token;
      console.log(accessToken);
     
      if (!accessToken) {
         next()
         return
      }
      const decoded = jwt.verify(accessToken, secret_key) as jwt.JwtPayload;
      req.email = decoded.email; 
      console.log(req.email);
      next();
    } catch (error) {
       res.status(401).json({
        message: "Access denied. Invalid token.", 
      });
      return
    }
  };
};

export const verifyFetchMessagesToken = verifySimpleToken();
