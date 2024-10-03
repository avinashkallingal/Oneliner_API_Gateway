import express from 'express';
import upload from '../../multer/multer';
import authencticateToken from '../../middleware/authMiddleware';
import { postController } from './postController';
import multer from 'multer';
const postRoutes = express.Router();

postRoutes.post('/addPost', upload.fields([
    { name: 'photoFile', maxCount: 5 },  // Handling an array of images 
    { name: 'pdfFile', maxCount: 1 }     // Handling a single PDF file
  ]),postController.addPost)

  postRoutes.post('/editPost', upload.fields([
    { name: 'photoFile', maxCount: 5 },  // Handling an array of images 
    { name: 'pdfFile', maxCount: 1 }     // Handling a single PDF file
  ]),postController.editPost)

// postRoutes.post('/addPost', authencticateToken, upload.array('files'), postController.addPost);
postRoutes.get('/getAllPosts', postController.getAllPosts)
postRoutes.post('/pdfUrlFetch',postController.pdfUrlFetch)
postRoutes.post('/likePost',postController.likePost)
postRoutes.post('/deletePost',postController.deletePost)





export { postRoutes };