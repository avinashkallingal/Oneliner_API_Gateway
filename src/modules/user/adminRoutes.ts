import express, { Request, Response } from 'express'
import {adminController} from "./adminController"
import authencticateTokenMiddleware from '../../middleware/authMiddleware';
const adminRoutes = express.Router();


adminRoutes.get("/userList",adminController.userList);
adminRoutes.post("/userBlock",authencticateTokenMiddleware,adminController.userBlock);
adminRoutes.post("/login",adminController.adminLogin);


export { adminRoutes }