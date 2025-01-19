import express, { Request, Response } from 'express'
import { userController } from './userController';
import upload from '../../multer/multer';
import authencticateToken from '../../middleware/authMiddleware';


const userRoutes = express.Router();
const authMiddleware = authencticateToken({ role: 'user' });

userRoutes.get('/check', (req: Request, res: Response) => {
    
    res.status(200).json({ success: true, message: 'sample test' })
})
userRoutes.post('/register', userController.register);
userRoutes.post('/verifyOtp', userController.otp);
userRoutes.post('/resendOtp', userController.resendOtp);
userRoutes.post('/login', userController.login);
userRoutes.post('/logout', userController.logout);
userRoutes.post('/verifyEmail',userController.verifyEmail);
userRoutes.post('/resetPassword',userController.resetPassword);
userRoutes.post('/googleLogin',userController.googleLogin)
userRoutes.post('/fetchUserData',authMiddleware,userController.fetchUserData)
// edit in userProfile
userRoutes.put('/userProfile/update/:id',authMiddleware, upload.single('avatar'), userController.editUserProfile)
userRoutes.put('/follow',authMiddleware,userController.follow)
userRoutes.put('/unFollow',authMiddleware,userController.unFollow)
userRoutes.post('/contacts',authMiddleware,userController.contactsFetch)

userRoutes.get('/savePost',authMiddleware,userController.savePost)
userRoutes.get('/getSavedPosts',authMiddleware,userController.getSavedPosts)

userRoutes.get('/search',authMiddleware,userController.searchUsers)

// refresh token verification
userRoutes.post('/refresh-token', userController.refreshToken)

//followers data fetch
userRoutes.get('/fetchFollowers',authMiddleware,userController.getFollowersData)


// userRoutes.post('/resetPassword',(req,res)=>{
// console.log("password came",req.body)
// });



export { userRoutes }