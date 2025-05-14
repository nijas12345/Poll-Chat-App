import { IChat } from "../model/chatModel";

export interface IChatRepository {
  addMessage(message: string, email: string): Promise<IChat>;
  fetchMessages(page: number, limit: number): Promise<IChat[]>;
}
