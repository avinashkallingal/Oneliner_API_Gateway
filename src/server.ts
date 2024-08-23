import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './utils/logger';
import { userRoutes } from './modules/user/userRoutes'
import { adminRoutes } from './modules/user/adminRoutes';
import config from './config/config';
import dotenv from 'dotenv';
dotenv.config()

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204
};


app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));


app.use('/', userRoutes)
app.use('/admin', adminRoutes)

const server = http.createServer(app);

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