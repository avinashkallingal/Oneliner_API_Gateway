import express, { Request, Response } from 'express'
import { userController } from './userController';
import upload from '../../multer/multer';

const userRoutes = express.Router();

userRoutes.get('/', (req: Request, res: Response) => {
    res.json({ success: true, message: 'sample test' })
})
userRoutes.post('/register', userController.register);
userRoutes.post('/verifyOtp', userController.otp);
userRoutes.post('/resendOtp', userController.resendOtp);
userRoutes.post('/login', userController.login);
userRoutes.post('/logout', userController.logout);
userRoutes.post('/verifyEmail',userController.verifyEmail);
userRoutes.post('/resetPassword',userController.resetPassword);
userRoutes.post('/googleLogin',userController.googleLogin)
userRoutes.post('/fetchUserData',userController.fetchUserData)
// edit in userProfile
userRoutes.put('/userProfile/update/:id', upload.single('avatar'), userController.editUserProfile)

// userRoutes.post('/resetPassword',(req,res)=>{
// console.log("password came",req.body)
// });



export { userRoutes }