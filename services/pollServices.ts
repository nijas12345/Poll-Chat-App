import { IPollRepository } from "../interfaces/poll.repository.interface"
import { IPollService } from "../interfaces/poll.service.interface"
import { createToken } from "../middleware/jwt";
import { IPoll } from "../model/poll"
import { IUser } from "../model/userModel"
import bcrypt from 'bcrypt';
// import { createToken } from "../middleware/jwt";

class PollService implements IPollService{
    private pollRepository:IPollRepository
    constructor(pollRepository:IPollRepository){
     this.pollRepository = pollRepository
    }
    pollDatas = async():Promise<IPoll[]> => {
       try {
        return await this.pollRepository.pollDatas()
       } catch (error) {
        throw error
       }
    }
    userAuth = async(email:string):Promise<void> => {
      try {
        const userData:IUser|null =  await this.pollRepository.userAuth(email)
        if(!userData) throw new Error("You have already voted")
      } catch (error) {
        throw error
      }
     }
     userLogin = async(email: string, password: string): Promise<string> => {
       try {
        const existingUser:IUser|null = await this.pollRepository.findUserByEmail(email);
        if(existingUser){
          const isMatch = await bcrypt.compare(password,existingUser.password);
          if(!isMatch) throw new Error("Invalid Password")
        }
        if(!existingUser){
          const hashedPassword = await bcrypt.hash(password, 10); 
          await this.pollRepository.createUser(email, hashedPassword);
        }
        const token = createToken(email);
        return token
       } catch (error) {
        throw error
       }
     }
     updateVote = async (pollId: string, optionIndex: string, userEmail: string): Promise<IPoll> => {
      try {
          const index: number = parseInt(optionIndex);
          // Find the poll by the user's vote
          const pollData: IPoll | null = await this.pollRepository.findVoteByEmail(userEmail);
          if (!pollData) {
              // If the user hasn't voted yet, find the poll by pollId
              const poll: IPoll|null = await this.pollRepository.findById(pollId);
              if (!poll) throw new Error("No Poll Data");
  
              // Add the vote to the selected option
              poll.options[index].votes += 1;
              
              // Track the user's vote
              poll.votedUsers.push({ email: userEmail, optionIndex: index });
  
              // Save the updated poll data
              return await this.pollRepository.savePoll(poll);
          } else {
              // If the user has already voted, find their previous vote
              const votedUser = pollData.votedUsers.find(v => v.email === userEmail);
              if (!votedUser) throw new Error("User not found in votedUsers");
              console.log("vteduser",votedUser);
              
              // If the user is trying to vote the same option again, throw an error
              if (votedUser.optionIndex === index) {
                  throw new Error("You already voted for this option");
              }
  
              // Remove the vote from the previously selected option
              pollData.options[votedUser.optionIndex].votes -= 1;
              // Add the new vote
              pollData.options[index].votes += 1;
              votedUser.optionIndex = index;
              // Save the updated poll data
              return await this.pollRepository.savePoll(pollData);
          }
      } catch (error) {
          throw error
      }
  };
  
    }

export default PollService