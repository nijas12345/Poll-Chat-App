import mongoose, { Model } from "mongoose";
import { IPoll } from "../model/poll";
import { IPollRepository } from "../interfaces/poll.repository.interface";
import { IUser } from "../model/userModel";

class PollRepository implements IPollRepository {
  private pollModel: Model<IPoll>;
  private userModel: Model<IUser>;
  constructor(pollModel: Model<IPoll>, userModel: Model<IUser>) {
    this.pollModel = pollModel;
    this.userModel = userModel;
  }
  pollDatas = async (): Promise<IPoll[]> => {
    try {
      const pollData: IPoll[] = await this.pollModel.find();
      return pollData;
    } catch (error) {
      throw error;
    }
  };
  userAuth = async (email: string): Promise<IUser | null> => {
    try {
      return await this.userModel.findOne({ email: email });
    } catch (error) {
      throw error;
    }
  };
  findUserByEmail = async (email: string): Promise<IUser | null> => {
    try {
      return await this.userModel.findOne({ email: email });
    } catch (error) {
      throw error;
    }
  };
  createUser = async (email: string, password: string): Promise<void> => {
    try {
      const newUser = new this.userModel({ email, password });
      await newUser.save();
    } catch (error) {
      throw error;
    }
  };
  findVoteByEmail = async (userEmail: string): Promise<IPoll | null> => {
    try {
      return await this.pollModel.findOne({ "votedUsers.email": userEmail });
    } catch (error) {
      throw error;
    }
  };
  findById = async (pollId: string): Promise<IPoll | null> => {
    try {
      const optionObjectId = new mongoose.Types.ObjectId(pollId);
      const pollData: IPoll | null = await this.pollModel.findOne({
        "options._id": pollId,
      });
      return pollData;
    } catch (error) {
      throw error;
    }
  };
  savePoll = async (poll: IPoll): Promise<IPoll> => {
    try {
      return await poll.save();
    } catch (error) {
      throw error;
    }
  };
}

export default PollRepository;
