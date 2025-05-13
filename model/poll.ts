import mongoose, { Document, Schema } from 'mongoose';

interface PollOption {
  name: string;
  votes: number;
  image: string;
}

interface VotedUser {
  email: string;
  optionIndex: number;
}

export interface IPoll extends Document {
  options: PollOption[];
  votedUsers: VotedUser[];
}

const pollSchema: Schema<IPoll> = new Schema<IPoll>({
  options: [
    {
      name: { type: String, required: true },
      image: { type: String, required: true },
      votes: { type: Number, default: 0 },
    },
  ],
  votedUsers: [
    {
      email: { type: String, required: true },
      optionIndex: { type: Number, required: true },
    },
  ],
});

const Poll = mongoose.model<IPoll>('Poll', pollSchema);
export default Poll;