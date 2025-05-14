import { IPoll } from "../model/poll";
import { IUser } from "../model/userModel";

export interface IPollRepository {
  pollDatas(): Promise<IPoll[]>;
  userAuth(email: string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  createUser(email: string, password: string): Promise<void>;
  findVoteByEmail(userEmail: string): Promise<IPoll | null>;
  findById(pollId: string): Promise<IPoll | null>;
  savePoll(poll: IPoll): Promise<IPoll>;
}
