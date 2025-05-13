// utils/jwt.ts or inside your existing file
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import { Socket } from "socket.io";

const secret_key = process.env.JWT_SECRET as string;
const tokenTime = "1d"

export const createToken = (email: string): string => {
  return jwt.sign({ email }, secret_key, {
    expiresIn: tokenTime,
  });
};

const verifySimpleToken = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.cookies.token);
      
      const accessToken: string = req.cookies?.token;
      console.log(accessToken);
     
      if (!accessToken) {
         res.status(401).json({
          message: "Access denied. No token provided.",
        });
        return
      }
      const decoded = jwt.verify(accessToken, secret_key) as jwt.JwtPayload;

      if (!decoded?.email) {
         res.status(401).json({
          message: "Invalid token payload.",
        });
        return
      }

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

export const verifyMessageToken = (socket: Socket): string | null => {
  const cookieHeader = socket.handshake.headers.cookie;
  const token = cookieHeader?.split('=')[1]; // naive parsing — assumes format: token=...
  
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, secret_key) as jwt.JwtPayload;
    return decoded.email;
  } catch (error) {
    return null;
  }
}

export const verifyToken = verifySimpleToken();
