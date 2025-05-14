import { IPoll } from "../model/poll";
import { IUser } from "../model/userModel";

export interface IPollService {
  pollDatas(): Promise<IPoll[]>;
  userAuth(email: string): Promise<void>;
  userLogin(email: string, password: string): Promise<string>;
  updateVote(
    pollId: string,
    optionIndex: string,
    userEmail: string
  ): Promise<IPoll>;
}
