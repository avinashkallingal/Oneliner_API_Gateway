import { Request, Response } from "express";
import messageRabbitMqClient from './rabitMQ/client';
import userRabbitMqClient from '../user/rabbitMQ/client';
import logger from "../../utils/logger";
import { promises } from "dns";
import { read } from "fs";
import { HttpStatus } from "../../enum/StatusCode";

interface Chat {
    participants: string[];
    _id: string;
    UserId: string;
}

interface User {
    id: string;
    _id: string;
}

interface RabbitMQResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export const messageController = {

    getConversationData: async (req: Request, res: Response) => {


        try {
            const userId = req.query.userId as string;
            if (!userId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "UserId is missing" });
            }

            const operation = 'getConvData';
            const result = await messageRabbitMqClient.produce({ userId }, operation) as RabbitMQResponse<Chat[]>;
            console.log(result, '1');
            if (result.success && Array.isArray(result.data)) {
                console.log('2')
                const allParticipants = result.data.flatMap(chat => chat.participants);
                const uniqueParticipantIds = [...new Set(allParticipants)];
                console.log(uniqueParticipantIds)

                const userOperation = "get-user-deatils-for-post";
                const userResponse = await userRabbitMqClient.produce({ userIds: uniqueParticipantIds }, userOperation) as RabbitMQResponse<User[]>;

                if (userResponse.success && Array.isArray(userResponse.data)) {
                    const userMap = new Map(userResponse.data.map((user) => [user.id, user]));

                    const combinedData = result.data.map((chat) => {
                        const chatUsers = chat.participants.map((participantId: string) => userMap.get(participantId) || null);
                        return {
                            ...chat,
                            users: chatUsers
                        };
                    });

                    console.log()

                    res.status(HttpStatus.OK).json({ success: true, data: combinedData });
                } else {
                    res.status(HttpStatus.OK).json({
                        success: true,
                        data: result.data,
                        message: "Chats fetched, but user data not available",
                    });
                }
            } else {
                res.json({ success: true, message: "No chats found" });
            }
        } catch (error) {
            logger.error("Error occurred while fetching conversation users", { error });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Error occurred while fetching conversation users" });
        }

    },



    getChatId: async (req: Request, res: Response) => {
        try {
            const userId = req.query.userId as string;
            const recievedId = req.query.receiverId as string;
            if (!userId || !recievedId) {
                console.log("UserId or receiver id is missing")
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "UserId or receiver id is missing" });
            }
            const operation = 'get-chatId';
            const response = await messageRabbitMqClient.produce({ userId, recievedId }, operation);
            return res.json(response);
        } catch (error) {
            logger.error("Error occurred while fetching chat ID", { error });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Error occurred while fetching chat ID" });
        }
    },


    getMessage: async (req: Request, res: Response) => {
        try {
            console.log(req.query, 'get message in controller api')
            const userId = req.query.userId as string;
            const recievedId = req.query.receiverId as string;

            if (!userId || !recievedId) {
                return res.status(400).json({ error: "UserId or receiver id is missing" });
            }
            const operation = 'fetch-message';
            const result = await messageRabbitMqClient.produce({ userId, recievedId }, operation) as any;

            // console.log(result," message result in api gateway ++++++++++++++++++++")
            // console.log(result, '-------prev message of the users')

            // const userIds = [recievedId];
            // const userOperation = "get-user-deatils-for-post";
            // const userResponse = await userRabbitMqClient.produce({ userIds }, userOperation) as RabbitMQResponse<User[]>;


            // console.log(userResponse, 'hello user response')

            // let responseData: { messages: any[]; user: User | null } = {
            //     messages: result.data,
            //     user: null
            // };

            // if (userResponse.success && Array.isArray(userResponse.data) && userResponse.data.length > 0) {
            //     responseData.user = userResponse.data[0];
            // }
            // res.status(200).json({ success: true, data: responseData });
            res.status(200).json({ success: true, data: result.data });
        } catch (error) {
            logger.error("Error occurred while fetching messages", { error });
            res.status(500).json({ error: "Error occurred while fetching messages" });
        }
    },

    getInboxMessage: async (req: Request, res: Response) => {
        try {
            console.log(req.query, 'get message in controller api')
            const userId = req.query.userId as string;
          

            if (!userId ) {
                return res.status(400).json({ error: "UserId or receiver id is missing" });
            }
            const operation = 'fetch-inbox-message';
            const messageResult =await messageRabbitMqClient.produce({ userId}, operation) as any
            console.log(messageResult," message inbox fetch in api gateway)*=============***********")
          
            //    let ids:any[]=[]
            //    messageResult.data.map((val:any)=>ids.push(val.senderId))
           
             
            //    const uniqueIds = [...new Set(ids)];
            //    console.log(uniqueIds,"ids+++++++++++++++++++++++")
               

            const messagesWithReceiverData = await Promise.all(
                messageResult.data.map(async (chatData:any,index:any) => {
                    // For each message, fetch the receiver user data
                    const receiverData:any = await userRabbitMqClient.produce(
                        { userId: chatData.receiverId },
                        "fetch-user-for-inbox"
                    );
                    const senderData:any = await userRabbitMqClient.produce(
                        { userId: chatData.senderId },
                        "fetch-user-for-inbox"
                    );
                    
    
                    // Combine message with receiver user data
                    return {
                        ...messageResult.data[index],
                        sender: receiverData.user_data,
                        reciever:senderData.user_data,
                        chatRoomData:chatData, // Assuming `data` contains the user object
                    };
                })
            );
            

     
            res.status(200).json({ success: true, data: messagesWithReceiverData });
        } catch (error) {
            logger.error("Error occurred while fetching messages in inbox msg", { error });
            console.log(error," error in inbox messag")
            res.status(500).json({ error: "Error occurred while fetching messages" });
        }
    },

    readUpdate: async (req: Request, res: Response) => {
        try {
            const read = req.body.read as string;
            // userId: userId, receiverId: userData._id
            const userId=req.body.userId
            const receiverId=req.body.receiverId
           
            if (!read ) {
                return res.status(400).json({ error: "no read status found" });
            }
            const operation = 'read-update';
            const response = await messageRabbitMqClient.produce({ read,userId,receiverId }, operation);
            return res.json(response);
        } catch (error) {
            logger.error("Error occurred while fetching chat ID", { error });
            res.status(500).json({ error: "Error occurred while fetching chat ID" });
        }
    },
    
    uploadImage: async (req: Request, res: Response) => {
        try {
          
            console.log(req.files,"response in upload file%%%%%%%%%%^^^^^^^^^^")
            // userId: userId, receiverId: userData._id
            const file=req.files
           
            if (!file ) {
                return res.status(400).json({ error: "no file found" });
            }
            const operation = 'save-image';
            const response = await messageRabbitMqClient.produce({ file }, operation);
            return res.json(response);
        } catch (error) {
            logger.error("Error occurred while uploading file", { error });
            res.status(500).json({ error: "Error occurred while uploading file" });
        }
    },

    getNotification: async (req: Request, res: Response) => {
        try {
            const id = req.query.id;
            const operation = 'get-Notification'
            const result = await messageRabbitMqClient.produce(id, operation);
            console.log(result);
            res.status(200).json(result)
        } catch (error) {
            console.log("Error occurred while fetching notification", { error });
            res.status(500).json({ error: "Error occurred while fetching notification" });
        }
    },

    saveImages: async (req: Request, res: Response) => {
        try {
            console.log('save image')
            const images = req.files;
            const chatId = req.query.chatId;
            const senderId = req.query.senderId;
            const receiverId = req.query.receiverId;

            if (!senderId || !chatId || !images || !receiverId) {
                return res.status(400).json({ error: "UserId , receiverId, or imgUrl is missing" });
            }
            const operation = 'save-image'
            const response = await messageRabbitMqClient.produce({ images, senderId, chatId, receiverId }, operation)
            return res.json(response);
        } catch (error) {
            logger.error("Error occurred while saving images in messages", { error });
            res.status(500).json({ error: "Error occurred while saving images in messages" });
        }
    },

    readNotification: async (req: Request, res: Response) => {
        try {
            const operation = 'update-Notification';
            const id = req.query.id;
            const result = await messageRabbitMqClient.produce(id, operation);
            return res.status(200).json({success:true});
        } catch (error) {
            logger.error("Error occurred while notification is read images in messages", { error });
            res.status(500).json({ error: "Error occurred while saving images in messages" });
        }
    },

};