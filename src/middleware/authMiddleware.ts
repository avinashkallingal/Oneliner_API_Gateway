import { NextFunction, Request, Response } from "express";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { HttpStatus } from "../enum/StatusCode";
import userRabbitMqClient from "../modules/user/rabbitMQ/client";
import { clearScreenDown } from "readline";

interface AuthMiddlewareOptions {
  role: string;
}

const authenticateToken = (options: AuthMiddlewareOptions): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("Function is triggered for authentication validation");

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("Token not found");
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "Access denied, token not found" });
    }

    console.log("Token found, verifying...");
    jwt.verify(token, config.jwt_key as string, (err, decoded: any) => {
      if (err) {
        console.log("Invalid token");
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: "Invalid token" });
      }

      if (decoded) {

        
        if (options.role === decoded.role) {

          //checking user is block or not
          const checkUserBlock=async()=>{
            const operation = "user_data";
            const result: any = await userRabbitMqClient.produce(
              { id: decoded.id, loginUserId: "" },
              operation
            );
    
            if (result.success) {
                console.log(result.user_data._doc.isBlocked,"result iffffrrrffggg admin block middleware %%%%%%%%%%%%%%%%%%")
              if (result.user_data._doc.isBlocked) {
                return res
                .status(HttpStatus.FORBIDDEN)
                .json({ success: false, message: "admin blocked" });
              }
                next();
              
            } 
        }
        checkUserBlock()
          
        } else {
          // next();
          console.log("role authorization issue");
          return res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ success: false, message: "role authorization error" });
        }
      } else {
        console.log("else in decode value");
      }

     
    });
  };
};

export default authenticateToken;
