import express, { Request, Response } from "express";
import userRabbitMqClient from "./rabbitMQ/client";
import { generateToken } from "../../jwt/jwtCreate";
import { json } from "stream/consumers";

export const adminController = {
  userList: async (req: Request, res: Response) => {
    const operation = "user_list";
    const data = req.body;
    const resuslt = await userRabbitMqClient.produce(data, operation);
    return res.json({
      success: true,
      message: "user data got!!!!!",
      userData: resuslt,
    });
  },

  
  //userblock
  userBlock: async (req: Request, res: Response) => {
    // Implement logout logic here
    try {
      const data = req.body;
      const operation = "block_user";

      const result: any = await userRabbitMqClient.produce(data, operation);
      if (result.success) {
        return res.json(result);
      } else {
        return res.json(result);
      }
    } catch (error) {
      console.log("error in userblock --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  //
  adminLogin: async (req: Request, res: Response) => {
    try {
      
      const data = req.body;
      const operation = "admin_login";
      const result: any = await userRabbitMqClient.produce(data, operation);
      if (!result.success) {
        console.log("credential not matching");
        return res.json(result);
        // return res.status(401).json({ error: 'Login failed' });
      }

      const token = generateToken({
        id: result.admin_data._id,
        email: result.admin_data.email,
      });
      const refreshToken = generateToken({
        id: result.admin_data._id,
        email: result.admin_data.email,
      });

      // res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
      result.token = token;
      result.refreshToken = refreshToken;

      return res.json(result);
    } catch (error) {
      console.log("error in userblock --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  adminLogout: () => {},
  adminDashboard: () => {},
};
