
import { Request, Response } from 'express';
import { IChatService } from '../interfaces/chat.service.interface';
import { log } from 'node:console';

class ChatController{
  private chatService:IChatService
  constructor(chatService:IChatService){
    this.chatService = chatService
  }
  fetchMessages = async(req:Request,res:Response):Promise<void>=>{
    try {
    const page = parseInt(req.query.page as string) 
    const limit = parseInt(req.query.limit as string)
    const serviceResponse = await this.chatService.fetchMessages(page,limit);
    if (req.email) {
      const email: string = req.email;
      console.log("email", email);
      res.json({ email, serviceResponse });
      return; 
    }
    res.json({ email: null, serviceResponse }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
  }
}

export default ChatController
