import mongoose, { Document, Schema } from "mongoose";

// Define an interface for the User document
export interface IUser extends Document {
  email: string;
  password: string;
}

const userSchema: Schema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create the User model
const User = mongoose.model<IUser>("User", userSchema);

export default User;
