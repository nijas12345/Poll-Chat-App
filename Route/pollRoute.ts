import express from "express";
import Poll from "../model/poll";
import PollController from "../controller/pollController";
import PollService from "../services/pollServices";
import PollRepository from "../repository.ts/pollRepository";
import { verifyToken } from "../middleware/jwt";
import User from "../model/userModel";
import ChatRepository from "../repository.ts/chatRepository";
import Chat from "../model/chatModel";
import ChatService from "../services/chatServices";
import ChatController from "../controller/chatController";
import { verifyFetchMessagesToken } from "../middleware/messageJwt";

const pollRouter = express.Router();
const pollRepository = new PollRepository(Poll, User);
const pollService = new PollService(pollRepository);
const pollController = new PollController(pollService);

const chatRepository = new ChatRepository(Chat);
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

pollRouter.get("/", verifyFetchMessagesToken, pollController.pollDatas);
pollRouter.post("/login", verifyFetchMessagesToken, pollController.userLogin);
pollRouter.get("/logout", pollController.logout);
pollRouter.get("/check-auth", verifyToken, pollController.userAuth);
pollRouter.get(
  "/messages",
  verifyFetchMessagesToken,
  chatController.fetchMessages
);

export default pollRouter;
