import express from 'express';
import authencticateToken from '../../middleware/authMiddleware';
import { messageController } from './messageController';
import upload from '../../multer/multer';

const messageRouter = express.Router();


const authMiddleware = authencticateToken;


messageRouter.post('/createChatId', messageController.getChatId);
messageRouter.get('/getmessages', messageController.getMessage);
messageRouter.get('/getInboxMessages', messageController.getInboxMessage);
messageRouter.put('/readUpdate', messageController.readUpdate);
// messageRouter.put('/ulpload', messageController.upload);
messageRouter.post('/upload', upload.fields([
    { name: 'FileData', maxCount: 1 },  // Handling an array of images 
      // Handling a single PDF file
  ]),messageController.uploadImage)
  messageRouter.get('/getNotification', messageController.getNotification);
  messageRouter.get('/readNotification',messageController.readNotification)

















messageRouter.get('/getNotification',authMiddleware,messageController.getNotification)
messageRouter.post('/sendImage',authMiddleware,upload.array('images'),messageController.saveImages)
messageRouter.post('/sendVideo',authMiddleware,upload.array('images'),messageController.saveImages)



export {messageRouter}