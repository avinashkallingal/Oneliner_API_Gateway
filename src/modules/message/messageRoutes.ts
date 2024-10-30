import express from 'express';
import authencticateToken from '../../middleware/authMiddleware';
import { messageController } from './messageController';
import upload from '../../multer/multer';

const messageRouter = express.Router();


const authMiddleware = authencticateToken;

messageRouter.get('/getConversationData', authMiddleware, messageController.getConversationData);
messageRouter.post('/createChatId', messageController.getChatId);
messageRouter.get('/getmessages', authMiddleware, messageController.getMessage);
messageRouter.get('/getNotification',authMiddleware,messageController.getNotification)
messageRouter.post('/sendImage',authMiddleware,upload.array('images'),messageController.saveImages)
messageRouter.post('/sendVideo',authMiddleware,upload.array('images'),messageController.saveImages)
messageRouter.get('/readNotification',authMiddleware,messageController.readNotification)


export {messageRouter}