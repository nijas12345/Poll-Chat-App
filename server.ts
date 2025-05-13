import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import pollRouter from './Route/pollRoute'
import databaseConnection from './config/mongoDb'
import {Server} from 'socket.io'
import setUpSocket from './config/socket';
import cookieParser from 'cookie-parser';

databaseConnection()
dotenv.config();
const app = express();
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server);
setUpSocket(io)
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', pollRouter);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
