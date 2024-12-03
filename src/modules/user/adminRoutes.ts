import express, { Request, Response } from 'express'
import {adminController} from "./adminController"
import authencticateTokenMiddleware from '../../middleware/authMiddleware';
const adminRoutes = express.Router();


adminRoutes.get("/userList",adminController.userList);
adminRoutes.post("/userBlock",adminController.userBlock);
adminRoutes.post("/login",adminController.adminLogin);
// adminRoutes.get("/getDashboardData",adminController.userList);


export { adminRoutes }