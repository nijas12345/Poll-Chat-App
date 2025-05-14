import { Request, Response } from "express";
import { IChatService } from "../interfaces/chat.service.interface";
import { HttpStatusCode } from "../Enums/enum";

class ChatController {
  private chatService: IChatService;
  constructor(chatService: IChatService) {
    this.chatService = chatService;
  }
  fetchMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const serviceResponse = await this.chatService.fetchMessages(page, limit);
      if (req.email) {
        const email: string = req.email;
        res.status(HttpStatusCode.OK).json({ email, serviceResponse });
        return;
      }
      res.status(HttpStatusCode.OK).json({ email: null, serviceResponse });
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };
}

export default ChatController;
