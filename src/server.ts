import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './utils/logger';
import { userRoutes } from './modules/user/userRoutes'
import { adminRoutes } from './modules/user/adminRoutes';
import { postRoutes } from './modules/post/postRoutes';
import { messageRouter } from './modules/message/messageRoutes';
import { initializeSocket } from './socket/socketService';
import { HttpStatus } from './enum/StatusCode';
import morgan from 'morgan'

import config from './config/config';
import dotenv from 'dotenv';
dotenv.config()

const app = express();

const corsOptions = {
    origin: 'https://oneliner.space',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    preflightContinue: false,
    optionsSuccessStatus: HttpStatus.NO_CONTENT
};


app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

// Use Morgan middleware with the desired format
app.use(morgan('dev')); // 'dev' is a popular format for development


app.use('/', userRoutes)
app.use('/admin', adminRoutes)
app.use('/post', postRoutes)
app.use('/message', messageRouter)

const server = http.createServer(app); 
initializeSocket(server)

const startServer = async () => {
    try {
        
        console.log(`Config Port: ${config.port}`, '----', typeof (process.env.PORT));
        server.listen(config.port, () => {
            logger.info(`Service is running on port ${config.port}`);
        });
    } catch (error) {
        logger.error('Something went wrong ->', error);
    }
}

startServer();