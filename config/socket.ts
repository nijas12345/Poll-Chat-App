import { Server, Socket } from "socket.io";
import Poll, { IPoll } from "../model/poll";
import User from "../model/userModel";
import PollRepository from "../repository.ts/pollRepository";
import PollService from "../services/pollServices";
import ChatRepository from "../repository.ts/chatRepository";
import ChatService from "../services/chatServices";
import Chat, { IChat } from "../model/chatModel";
import { verifyMessageToken } from "../middleware/jwt";

const pollRepository = new PollRepository(Poll, User);
const pollService = new PollService(pollRepository);

const chatRepository = new ChatRepository(Chat);
const chatService = new ChatService(chatRepository);

function setUpSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("vote", async ({ pollOptionId, optionIndex, userEmail }) => {
      try {
        const updatedPollData: IPoll = await pollService.updateVote(
          pollOptionId,
          optionIndex,
          userEmail
        );
        socket.emit("voteSuccess");
        const userDoc = updatedPollData.votedUsers.find(
          (user) => user.email === userEmail
        );
        io.emit("voteUpdate", { userDoc, updatedPollData });
        console.log(updatedPollData);
        socket.broadcast.emit("voteEmail", { userEmail });
      } catch (error) {
        console.error("Vote processing error:", error);
        socket.emit("voteError", "Internal server error");
      }
    });

    socket.on("typing", async () => {
      const userEmail = verifyMessageToken(socket);
      if (!userEmail) {
        return socket.emit("error", "Please Login to send Message");
      }
      const userName = userEmail.split("@")[0];
      socket.broadcast.emit("showTyping", userName);
    });

    socket.on("sendMessage", async (message) => {
      const userEmail = verifyMessageToken(socket);
      if (!userEmail) {
        return socket.emit("error", "Please Login to send Message");
      }

      const addMessage: IChat = await chatService.addMessage(
        message,
        userEmail
      );
      const userName = addMessage.senderEmail.split("@")[0];
      socket.emit("receiveOwnMessage", {
        message,
        timestamp: addMessage.timestamp,
      });
      socket.broadcast.emit("receiveMessage", {
        userName,
        message: addMessage.message,
        timestamp: addMessage.timestamp,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

export default setUpSocket;
