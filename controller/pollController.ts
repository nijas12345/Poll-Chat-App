
import { Request, Response } from 'express';
import { IPollService } from '../interfaces/poll.service.interface';

class PollController{
  private pollService:IPollService
  constructor(pollService:IPollService){
    this.pollService = pollService
  }
  pollDatas = async(req:Request,res:Response):Promise<void>=>{
    try {
     let email: string | undefined | null = req.email; // Allow null in type
      const serviceResponse = await this.pollService.pollDatas();
      if (email === undefined) {
        email = null; // Now this is valid since null is allowed in the type
      }
      res.render('index',{polls:serviceResponse,userEmail:email})
    } catch (error) {
      console.log(error);
    }
  }
  userLogin = async(req:Request,res:Response):Promise<void>=>{
    try {
      const email = req.body.email as string
      const password = req.body.password as string
      console.log("paswrod",password);
      const token = await this.pollService.userLogin(email,password)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        sameSite: 'lax', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      res.setHeader('Cache-Control', 'no-store')
      res.status(200).send()
    } catch (error:any) {
      const message = error.message
      console.log(message);
      res.status(401).json(message)
    }
  }
  logout = async(req:Request,res:Response):Promise<void> =>{
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      throw error
    }
  }
  userAuth = async(req:Request,res:Response):Promise<void>=>{
    try {
      const email = req.email as string
      await this.pollService.userAuth(email)
      res.status(200).json(email)
    } catch (error) {
        const err = error as Error;
        res.status(401).json(err.message)
    }
  }
}

export default PollController