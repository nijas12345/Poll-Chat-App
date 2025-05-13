import { IChat } from "../model/chatModel"
import { IChatService } from "../interfaces/chat.service.interface"
import { IChatRepository } from "../interfaces/chat.repository.interface"

 class ChatService implements IChatService{
     private chatRepository:IChatRepository
     constructor(chatRepository:IChatRepository){
      this.chatRepository = chatRepository
     }  
     addMessage = async(message:string,email:string): Promise<IChat> => {
         try {
            return await this.chatRepository.addMessage(message,email)
         } catch (error) {
            throw error
         }
     }
     fetchMessages = async(page:number,limit:number): Promise<IChat[]> => {
         try {
            return await this.chatRepository.fetchMessages(page,limit)
         } catch (error) {
            throw error
         }
     }
}
 
 export default ChatService