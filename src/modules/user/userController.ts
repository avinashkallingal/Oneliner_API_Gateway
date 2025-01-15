import express, { Request, Response } from "express";
import userRabbitMqClient from "./rabbitMQ/client";
import { generateToken } from "../../jwt/jwtCreate";
import rabbitMQConfig from "../../config/rabbitMQconfig";
import config from '../../config/config';
import jwt from 'jsonwebtoken';
import postRabbitMqClient from "../post/rabbitMQ/client";
import { IPost } from "../../interfaces/Ipost";
interface RabbitMQResponse<T> {
  success: boolean;
  message: string;
  user_ata?: T;

  }

export const userController = {
  // Define memory storage object
  memoryStorage: {} as { [key: string]: any },

  register: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      console.log("req.body by sign up in api gateway");
      const operation = "register_user";

      console.log(req.body, "body print");

      const result: any = await userRabbitMqClient.produce(data, operation);
      console.log(result, "register-user");

      userController.memoryStorage["user"] = JSON.stringify(result.user_data);
      userController.memoryStorage["otp"] = result.otp;
      setTimeout(() => {
        userController.memoryStorage["otp"] = "";
      }, 60000);

      return res.json({ data: result });
    } catch (error) {
      console.log("error in register user --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  otp: async (req: Request, res: Response) => {
    try {
      console.log("otp verify function triggered");
      console.log(req.body, "this is req body on otp in api gateway");
      const data = req.body;
      let userData;
      const userOtp = userController.memoryStorage["otp"];
      let operation = "";
      if (data.operation == "change_password_otp") {
        //otp checking
        if (userController.memoryStorage["otp"] == data.otp) {
          console.log(
            data.otp,
            "otp in chnagw pss",
            userController.memoryStorage["otp"],
            " saved pass"
          );
          return res.json({ success: true, message: "otp matching" });
        } else {
          console.log(
            data.otp,
            "otp in chnagw paass",
            userController.memoryStorage["otp"],
            " saved paaass"
          );
          return res.json({ success: false, message: "otp mismatch" });
        }
      } else {
        operation = "save_user";
        userData = JSON.parse(userController.memoryStorage["user"]);
      }
      console.log(
        "generated otp got in api gateway",
        userController.memoryStorage["otp"],
        userOtp
      );

      if (userController.memoryStorage["otp"] == data.otp) {
        const result: any = await userRabbitMqClient.produce(
          userData,
          operation
        );
        return res.json({
          success: true,
          message: "account created successfully!!!!!",
        });
      } else {
        console.log("Error in OTP verification:");
        return res.json({ success: false, message: " otp not matching!!!!!" });
      }
    } catch (error) {
      console.log("Error in OTP verification:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  resendOtp: async (req: Request, res: Response) => {
    try {
    // Implement resend OTP logic here
    const operation = "resend_otp";
    const userData = JSON.parse(userController.memoryStorage["user"]);
    const result: any = await userRabbitMqClient.produce(
      userData.email,
      operation
    );
    userController.memoryStorage["otp"] = result.otp; //global otp storage for compare
    console.log(
      userController.memoryStorage["otp"],
      "result otp in controler global otp"
    );
    console.log(result.otp, "result otp in controler");
    setTimeout(() => {
      userController.memoryStorage["otp"] = "";
    }, 60000); //expiration time for otp
    return res.json({ success: true, message: "otp send sucessfully!!!!!" });

    //  const generateOtp = (): string => {

    //         const otp = Math.floor(1000 + Math.random() * 9000).toString();
    //         return otp;

    //     }
  }
  catch (error) {
    console.log("error in resend otp --> ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
  },

  login: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const operation = "user_login";

      const result: any = await userRabbitMqClient.produce(data, operation);
      console.log(result, "user-login");

      if (!result.success) {
        console.log("credential not matching");
        return res.json(result);
        // return res.status(401).json({ error: 'Login failed' });
      }

      const token = generateToken({
        id: result.user_data._id,
        email: result.user_data.email,
        role:"user",
      });
      // const refreshToken = generateToken({
      //   id: result.user_data._id,
      //   email: result.user_data.email,
      // });

      // res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
      result.token = token.accessToken;
      result.refreshToken = token.refreshToken;

      return res.json(result);
    } catch (error) {
      console.log("error in userLogin --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  verifyEmail: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      console.log(data, "email");
      const operation = "verify_email";
      const result: any = await userRabbitMqClient.produce(data, operation);

      if (!result.success) {
        console.log("credential not matching");
        return res.json(result);
        // return res.status(401).json({ error: 'Login failed' });
      } else {
        userController.memoryStorage["otp"] = result.user_data.otp;
        setTimeout(() => {
          userController.memoryStorage["otp"] = "";
        }, 60000); //expiration time for otp
        return res.json(result);
      }
    } catch (error) {
      console.log("error in verifyEmail --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },


  refreshToken: async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        console.log(refreshToken, 'ref toekn')
        // Check if the refresh token exists and is valid
        if (!refreshToken) {
            return res.status(403).json({ message: 'Refresh token not valid' });
        }

        // Verify the refresh token
        jwt.verify(refreshToken, config.jwt_key, (err: any, user: any) => {
            if (err) return res.status(403).json({ message: 'Forbidden' });

            console.log(err, '-----------', user)
            console.log('refresh token')
            // Create a new access token
            const accessToken = jwt.sign({ id: user.id, email: user.email,role:"user" }, config.jwt_key, { expiresIn: '15m' });
          console.log(accessToken," access token in api gateway")
            res.json({ accessToken });
        });
    } catch (error) {

    }
},




  resetPassword: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      console.log(data, "password in reset password api gateway");
      const operation = "reset_password";
      const result: any = await userRabbitMqClient.produce(data, operation);
      if (!result.success) {
        console.log("error in reset");
        return res.json(result);
        // return res.status(401).json({ error: 'Login failed' });
      } else {
        console.log("password changed");
        return res.json(result);
      }
    } catch (error) {
      console.log("error in resetPassword --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  googleLogin: async (req: Request, res: Response) => {
    const data = req.body;
    console.log(req.body, "body in goole login api gateway");
    const operation = "google_login";
    try {
      const result: any = await userRabbitMqClient.produce(data, operation);
      if (result.success) {
        console.log("loged in successfully");
        console.log(result, "result from user service");
        //generation jwt token and adding to result object
        const token = generateToken({
          id: result.user_data._id,
          email: result.user_data.email,
          role:"user"
        });
        const refreshToken = generateToken({
          id: result.user_data._id,
          email: result.user_data.email,
          role:'user'
        });

        // res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });//
        result.token = token;
        // result.refreshToken = refreshToken;

        //
        return res.json(result);
      } else {
        console.log("error from back end google auth");
        return res.json(result);
      }
    } catch (error) {
      console.log("error in resetPassword --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  fetchUserData: async (req: Request, res: Response) => {
    // Implement logic here
    const data = req.body;
    console.log(req.body, "body in goole login api gateway");
    const operation = "user_data";
    try {
      const result: any = await userRabbitMqClient.produce(data, operation);
      if (result.success) {
        return res.json({ success: true, result });
      } else {
        return res.json({ success: false, result });
      }
    } catch (error) {
      console.log("error in resetPassword --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  
  searchUsers: async (req: Request, res: Response) => {
    // Implement logic here
    const data = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';
    // const data = req.query.q as string;
    console.log(data, "search input string");
    const operation = "user_search";
    try {
      const result: any = await userRabbitMqClient.produce(data, operation);
      if (result.success) {
        return res.json({ success: true, result });
      } else {
        return res.json({ success: false, result });
      }
    } catch (error) {
      console.log("error in search user --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  savePost: async (req: Request, res: Response) => {
    try {
      const data = req.query;
      console.log(data, " save post data here^^^^^^^^^^^^^^^^^^^");
      const operation = "save_post";
      const result: any = await userRabbitMqClient.produce(data, operation);
      if (!result.success) {
        console.log("error in reset");
        return res.json(result);
        // return res.status(401).json({ error: 'Login failed' });
      } else {
        console.log("post saved");
        return res.json(result);
      }
    } catch (error) {
      console.log("error in save post --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getSavedPosts: async (req: Request, res: Response) => {
    try {
      const data = req.query;
      console.log(data, " get save post data");
      const operation = 'fetch-user-for-inbox';
      const result: any = await userRabbitMqClient.produce(data, operation);
    
      if (!result.success) {
        console.log("error in fetching data ");
        return res.json(result);
        // return res.status(401).json({ error: 'Login failed' });
      } else {
        console.log(result.user_data.savedPost,"   post saved12121212121212")
//////////////
   // Fetch user details for each like
      const posts = await Promise.all(
        result.user_data.savedPost.map(async (post:any) => {
          const postOperation = 'get-post';
          const postResult:any = await postRabbitMqClient.produce(
            { postId: post },
            postOperation
          ) as RabbitMQResponse<IPost>;
          console.log(postResult," post result in user details for saved post fetch")
          // if (postResult.success) {
          //   return {
          //     ...postResult.data // User data from RabbitMQ
            
          //   };
          // } else {
          //   // console.error(`Failed to fetch user details for userId: ${like.userId}`);
          //   return null; // Handle failed user fetches gracefully
          // }


          // if (postResult.success) {
          //   // Access the first key dynamically if the result has numeric keys
          //   const postData = postResult.data['0'] || postResult.data;
          //   return {
          //     ...postData // Extract the actual data
          //   };
          // } else {
          //   // Handle failed user fetches gracefully
          //   return null;
          // }

          if (postResult.success) {
            // Access the first key dynamically if the result has numeric keys
            const postData = postResult.data['0'] || Object.values(postResult.data)[0] || postResult.data;
      
            return {
              ...postData, // Extract the actual data
            };
          } else {
            // Handle failed post fetches gracefully
            return null;
          }


        })
      );
/////////////////

 console.log(posts," post result in report^^^^^^^^^^^^^^^^^^^^")


        // return res.json(posts);
        return res.json({ success: true,message:"successfully got saved posts" ,posts:posts });
      }
    } catch (error) {
      console.log("error in get post  --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  follow: async (req: Request, res: Response) => {
    // Implement logic here
    const data = req.body;
    console.log(req.body, "body in goole login api gateway");
    const operation = "follow_user";
    try {
      const result: any = await userRabbitMqClient.produce(data, operation);
      if (result.success) {
        return res.json({ success: true, result });
      } else {
        return res.json({ success: false, result });
      }
    } catch (error) {
      console.log("error in resetPassword --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  unFollow: async (req: Request, res: Response) => {
    // Implement logic here
    const data = req.body;
    console.log(req.body, "body in goole login api gateway");
    const operation = "unFollow_user";
    try {
      const result: any = await userRabbitMqClient.produce(data, operation);
      if (result.success) {
        return res.json({ success: true, result });
      } else {
        return res.json({ success: false, result });
      }
    } catch (error) {
      console.log("error in resetPassword --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  
  contactsFetch: async (req: Request, res: Response) => {
    // Implement logic here
  
    const data = req.body;
    // console.log(req.body, "body in contact fetch api gateway");
        const operation = "contacts_fetch";
    try {
      const result: any = await userRabbitMqClient.produce(data, operation);
      if (result.success) {
        return res.json({ success: true, result });
      } else {
        return res.json({ success: false, result });
      }
    } catch (error) {
      console.log("error in resetPassword --> ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  
  

  //
  editUserProfile: async (req: Request, res: Response) => {
    try {
      console.log(
        req.file,
        "=============userController for edit profile image"
      );
      console.log(
        req.body,
        "-------------userController for edit profile userData"
      );
      console.log(
        req.params.id,
        "00000000 userController for edit profile userID"
      );

      const image = req.file as Express.Multer.File | undefined;
      const data = req.body;
      const id = req.params.id;

      const validImageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

      if (image) {
        // Check if the uploaded file has a valid MIME type
        if (!validImageMimeTypes.includes(image.mimetype)) {
          return res
            .status(400)
            .json({ error: "Only image files are allowed" });
        }
      }

      console.log(image, "-----------image in API gateway");

      const operation = "update-UserData";
      const response = await userRabbitMqClient.produce(
        { image, data, id },
        operation
      );

      console.log(response, "------------");
      res.json(response);
    } catch (error) {
      console.log(
        "error in editUserProfile in API gateway in userController:",
        error
      );
      res.status(500).json({ error: "Internal server error " });
    }
  },
  //

  logout: async (req: Request, res: Response) => {
    // Implement logout logic here
  },
};
