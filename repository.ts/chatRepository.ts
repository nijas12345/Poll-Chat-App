import { Model } from "mongoose";
import { IChat } from "../model/chatModel";
import { IChatRepository } from "../interfaces/chat.repository.interface";

class ChatRepository implements IChatRepository {
  private chatModel: Model<IChat>;
  constructor(chatModel: Model<IChat>) {
    this.chatModel = chatModel;
  }
  addMessage = async (message: string, email: string): Promise<IChat> => {
    try {
      const newChat = new this.chatModel({
        senderEmail: email,
        message: message,
      });
      const chatData: IChat = await newChat.save();
      return chatData;
    } catch (error) {
      throw error;
    }
  };
  fetchMessages = async (page: number, limit: number): Promise<IChat[]> => {
    try {
      const skip = (page - 1) * limit;
      const message = await this.chatModel
        .find()
        .sort({ timestamp: -1 }) // Sort newest to oldest
        .skip(skip)
        .limit(limit);
      console.log("mesg", message);

      return message;
    } catch (error) {
      throw error;
    }
  };
}

export default ChatRepository;
