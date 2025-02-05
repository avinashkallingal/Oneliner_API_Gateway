import express from 'express';
import upload from '../../multer/multer';
import authencticateToken from '../../middleware/authMiddleware';
import { postController } from './postController';

import multer from 'multer';
const postRoutes = express.Router();


const authMiddleware = authencticateToken({ role: 'user' });

postRoutes.post('/addPost', upload.fields([
    { name: 'photoFile', maxCount: 5 },  // Handling an array of images 
    { name: 'pdfFile', maxCount: 1 }     // Handling a single PDF file
  ]),postController.addPost)

  postRoutes.post('/editPost', upload.fields([
    { name: 'photoFile', maxCount: 5 },  // Handling an array of images 
    { name: 'pdfFile', maxCount: 1 }     // Handling a single PDF file
  ]),postController.editPost)

// postRoutes.post('/addPost', authencticateToken, upload.array('files'), postController.addPost);
postRoutes.get('/getPosts',authMiddleware, postController.getAllPosts)
postRoutes.get('/getUserPosts', authMiddleware,postController.getUserPosts)
postRoutes.get('/getTagPosts', authMiddleware,postController.getUserPosts)
postRoutes.get('/getPost',authMiddleware, postController.getPost)
postRoutes.post('/pdfUrlFetch',authMiddleware,postController.pdfUrlFetch)
postRoutes.post('/imageUrlFetch',authMiddleware,postController.imageUrlFetch)
postRoutes.post('/likePost',authMiddleware,postController.likePost)
postRoutes.post('/deletePost',authMiddleware,postController.deletePost)
postRoutes.post("/addComment",authMiddleware,postController.addComment)
postRoutes.put("/reportPost",postController.reportPost)

postRoutes.get("/adminPostData",postController.adminPostData)
postRoutes.get('/admin/removePost', postController.removePostAdmin)
postRoutes.get('/likeList',postController.likeList)





export { postRoutes };