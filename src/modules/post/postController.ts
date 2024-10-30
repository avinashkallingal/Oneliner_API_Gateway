import { Request, Response } from "express";
import postRabbitMqClient from "./rabbitMQ/client";
import userRabbitMqClient from "../../modules/user/rabbitMQ/client";

interface Post {
  _id: string;
  userId: string;
}

interface User {
  id: any;
  _id: string;
}

interface RabbitMQResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  like?: boolean;
}

interface data {
  userId: string;
  summary: string;
  title: string;
  username?: string;
  tags?: string[];
  genre?: string;
}

const validImageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

export const postController = {
  addPost: async (req: any, res: Response) => {
    try {
      console.log("addPost function called+++++++++++");
      // console.log(req.files, '++++++', req.body)
      const data: data = req.body;
      // const images = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
      const images = req.files["photoFile"];
      const pdf = req.files["pdfFile"];

      // if (!data.userId) {
      //     return res.status(400).json({ success: false, message: 'UserId is missing' });
      // }
      // console.log('1');

      // if (images) {
      //     let filesArray: Express.Multer.File[] = [];
      //     if (Array.isArray(images)) {
      //         filesArray = images;
      //     } else {
      //         filesArray = Object.values(images).flat();
      //     }

      //     for (let file of filesArray) {
      //         if (!validImageMimeTypes.includes(file.mimetype)) {
      //             return res.status(400).json({ error: "Only image files are allowed" });
      //         }
      //     }
      // }

      const userId = data.userId;
      const summary = data.summary;
      const title = data.title;
      const tags = data.tags;
      const genre = data.genre;

      const operation = "create-post";
      console.log("+++++++++ sending to post_queu", images);
      const response = await postRabbitMqClient.produce(
        { userId, summary, title, genre, images, pdf, tags },
        operation
      );
      console.log("3");
      console.log(response, "-------------------post added to database");
      return res.status(200).json(response);
    } catch (error) {
      console.log("4");
      return res
        .status(500)
        .json({
          success: false,
          message: "Error occurred while creating new post",
        });
    }
  },
  editPost: async (req: any, res: Response) => {
    try {
      console.log("editPost function called++++++++++++++");

      const data: any = req.body;

      const images = req.files["photoFile"];
      const pdf = req.files["pdfFile"];

      // if (!data.userId) {
      //     return res.status(400).json({ success: false, message: 'UserId is missing' });
      // }
      // console.log('1');

      // if (images) {
      //     let filesArray: Express.Multer.File[] = [];
      //     if (Array.isArray(images)) {
      //         filesArray = images;
      //     } else {
      //         filesArray = Object.values(images).flat();
      //     }

      //     for (let file of filesArray) {
      //         if (!validImageMimeTypes.includes(file.mimetype)) {
      //             return res.status(400).json({ error: "Only image files are allowed" });
      //         }
      //     }
      // }

      const userId = data.userId;
      const summary = data.summary;
      const title = data.title;
      const tags = data.tags;
      const genre = data.genre;
      const postId = data.postId;

      const operation = "edit-post";
      console.log("+++++++++ sending to post_queu", images);
      const response = await postRabbitMqClient.produce(
        { userId, summary, title, genre, images, pdf, tags, postId },
        operation
      );
      console.log("3");
      console.log(response, "-------------------post added to database");
      return res.status(200).json(response);
    } catch (error) {
      console.log("4");
      return res
        .status(500)
        .json({
          success: false,
          message: "Error occurred while creating new post",
        });
    }
  },

  getAllPosts: async (req: Request, res: Response) => {
    try {
      console.log(req.query.genre,"get all post+++++++++++++++++++++++++");
      const page = req.query.page;
      const genre=req.query.genre
      const operation = "get-all-posts";
      const result = (await postRabbitMqClient.produce({page,genre},operation)) as RabbitMQResponse<Post[]>;

      if (result.success && Array.isArray(result.data)) {
        const userIds = [...new Set(result.data.map((post) => post.userId))];
        const userOperation = "get-user-deatils-for-post";

        console.log(userIds, "--------------------userIds");
        const userResponse = (await userRabbitMqClient.produce(
          { userIds },
          userOperation
        )) as RabbitMQResponse<User[]>;

        if (userResponse.success && Array.isArray(userResponse.data)) {
          const userMap = new Map(
            userResponse.data.map((user) => [user.id, user])
          );

          const combinedData = result.data.map((post) => {
            const user = userMap.get(post.userId) || null;
            return { ...post, user };
          });

          // Return combined data in response
          // console.log(combinedData);
          return res.status(200).json({ success: true, data: combinedData });
        } else {
          // Handle case where user data is not available
          console.error("User data fetch failed or is not an array");
          return res
            .status(500)
            .json({ success: false, message: "Error fetching user details" });
        }
      } else {
        // Handle case where posts data is not available
        console.error("Posts data fetch failed or is not an array");
        return res
          .status(500)
          .json({ success: false, message: "Error fetching posts" });
      }
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getUserPosts: async (req: Request, res: Response) => {
    try {
      console.log("hiiiiiiiiii+++++++++user posts in api gateway");
      const userId = req.query.id;
      console.log(userId, "hiiiiiiiiii+++++++++user posts in api gateway");
      const userOperation = "get-user-posts";
      const postResponse = (await postRabbitMqClient.produce(
        { userId },
        userOperation
      )) as RabbitMQResponse<Post[]>;
      if (postResponse.success) {
        return res
          .status(200)
          .json({
            success: true,
            message: "user data fetched successfully",
            data: postResponse.data,
          });
      }
    } catch (error) {
      console.error("Error in getUserPosts:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  getPost: async (req: Request, res: Response) => {
    try {
      console.log("hiiiiiiiiii+++++++++user view post in api gateway");
      const postId = req.query.id;
      console.log(postId, "hiiiiiiiiii+++++++++user posts in api gateway");
      const userOperation = "get-post";
      const postResponse = (await postRabbitMqClient.produce(
        { postId },
        userOperation
      )) as RabbitMQResponse<Post[]>;
      if (postResponse.success) {
        return res
          .status(200)
          .json({
            success: true,
            message: "post data fetched successfully",
            data: postResponse.data,
          });
      }
    } catch (error) {
      console.error("Error in getPost:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  addComment: async (req: Request, res: Response) => {
    try {
      const operation = "add-comment";
      const data = req.body;
      const commentResposnse = (await postRabbitMqClient.produce(
        { data },
        operation
      )) as RabbitMQResponse<Post[]>;
      if (commentResposnse.success) {
        return res
          .status(200)
          .json({
            success: true,
            message: "comment added successfully",
            data: commentResposnse.data,
          });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    } catch (error) {
      console.error("Error in getUserPosts:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  reportPost:async (req:Request,res:Response)=>{
    try{
      const operation = "report-post";
      const data = req.body;
      const reportResposnse = (await postRabbitMqClient.produce(
        { data },
        operation
      )) as RabbitMQResponse<Post[]>;
      if (reportResposnse.success) {
        return res
          .status(200)
          .json({
            success: true,
            message: "report done successfully",
            data: reportResposnse.data,
          });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }catch (e) {
      console.log("error in report post function ", e);
    }
  },
 
  removePostAdmin:async (req:Request,res:Response)=>{
    try{
      const postId = req.query.postId;
      console.log(postId," post id in api gateway%%%%%%%%%%%%%%%%%%%%%%")
      const operation = "admin-remove-post";
      const data = postId;
      const reportResposnse = (await postRabbitMqClient.produce(
        { data },
        operation
      )) as RabbitMQResponse<Post[]>;
      if (reportResposnse.success) {
        return res
          .status(200)
          .json({
            success: true,
            message: "remove done successfully"
          });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }catch (e) {
      console.log("error in report post function ", e);
    }
  },

  pdfUrlFetch: async (req: Request, res: Response) => {
    try {
      console.log(req.body.postId, " id from frontend");
      const operation = "get-pdf-url";
      const data: data = req.body;
      const result = (await postRabbitMqClient.produce(
        data,
        operation
      )) as RabbitMQResponse<Post[]>;
      if (result.success) {
        console.log(result.data, " data got in api++++++++++ ");
        return res
          .status(200)
          .json({
            success: true,
            message: "pdf url generated",
            pdfUrl: result.data,
          });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    } catch (e) {
      console.log("error in fetching pdf url in pdfUrlFetch function ", e);
    }
  },
  imageUrlFetch: async (req: Request, res: Response) => {
    try {
      console.log(req.body.postId, " id from frontend");
      const operation = "get-image-url";
      const data: data = req.body;
      const result = (await postRabbitMqClient.produce(
        data,
        operation
      )) as RabbitMQResponse<Post[]>;
      if (result.success) {
        console.log(result.data, " data got in api++++++++++ ");
        return res
          .status(200)
          .json({
            success: true,
            message: "pdf url generated",
            imageUrl: result.data,
          });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    } catch (e) {
      console.log("error in fetching pdf url in pdfUrlFetch function ", e);
    }
  },

  likePost: async (req: Request, res: Response) => {
    try {
      const data: any = req.body;
      const operation = "like-post";
      const result = (await postRabbitMqClient.produce(
        data,
        operation
      )) as RabbitMQResponse<Post[]>;
      if (result.success) {
        if (result.like) {
          return res
            .status(200)
            .json({ success: true, message: "Liked", like: true });
        } else {
          return res
            .status(200)
            .json({ success: true, message: "Unliked", like: false });
        }
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    } catch (error) {
      console.error("Error in likePost:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  deletePost: async (req: Request, res: Response) => {
    try {
      const data: any = req.body;
      const operation = "delete-post";
      const result = (await postRabbitMqClient.produce(
        data,
        operation
      )) as RabbitMQResponse<Post[]>;
      if (result.success) {
        return res.status(200).json({ success: true, message: "deleted" });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    } catch (error) {
      console.error("Error in likePost:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  adminPostData: async (req: Request, res: Response) => {
    try {
  
      const userId = req.query.id;
      console.log(userId, "hiiiiiiiiii+++++++++user admin posts in api gateway");
      const adminOperation = "get-posts-data-for-admin";
      const postResponse = (await postRabbitMqClient.produce(
        { userId },
        adminOperation
      )) as RabbitMQResponse<Post[]>;
      if (postResponse.success) {
        return res
          .status(200)
          .json({
            success: true,
            message: "user data fetched successfully",
            data: postResponse.data,
          });
      }
    } catch (error) {
      console.error("Error in getUserPosts:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },


};
