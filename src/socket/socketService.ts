import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import messageRabbitMqClient from "../modules/message/rabitMQ/client";

interface User {
  id: string;
  _id: string;
}

interface RabbitMQResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

let io: Server;
const onlineUsers = new Map<string, string>();

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "http://oneliner.space",
      methods: ["POST", "GET"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("socket server started ->", socket.id);
    
   

    socket.on("userConnected", (userId) => {
      console.log(userId, " user id for userConnected#################");
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
      console.log("Current online users:", Array.from(onlineUsers.entries()));
    });
    // socket.emit("emitUserOnline",(socket.id)=>{
    //     for (const [userId, id] of onlineUsers.entries()) {
    //         if (id === socket.id) {
    //             return userId;
    //         }
    // })
    const checkOnline = () => {
      let foundUserId = null;
      for (const [userId, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          foundUserId = userId;
          break; // Exit the loop once the userId is found
        }
      }
      return foundUserId; // Ensure the function returns the userId
    };
    socket.broadcast.emit("emitUserOnline", checkOnline());
    const msg = "hiii";
    // socket.broadcast.emit("emitUserOnline",  {msg});

    socket.on("joinConversation", (chatId) => {
      socket.join(chatId);
      console.log("User joined conversation", chatId, "Socket ID:", socket.id);
    });

    socket.on("userTyping", (id) => {
      console.log("user is typing ", id);
      const receiverSocketId = onlineUsers.get(id) || "";
      socket.broadcast.emit("onUserTyping");
    });
    socket.on("emitUserOnline", (id) => {
      console.log("user in online ", id);
      const receiverSocketId = onlineUsers.get(id) || "";
      console.log("in status purpose:", Array.from(onlineUsers.entries()));
      if (receiverSocketId) {
        const online = "online";
        socket.broadcast.emit("onUserOnline", online);
      } else {
        const offline = "offline";
        socket.broadcast.emit("onUserOnline", offline);
      }
    });

    // socket.on('userOffline', (id) => {
    //     console.log('user is offline ', id);
    //     onlineUsers.delete(id);
    //     console.log('in status purpose:', Array.from(onlineUsers.entries()));
    //     // if(receiverSocketId){
    //     //     const online="online"
    //     //     socket.broadcast.emit('onUserOnline',online)
    //     // }else{
    //     //     const offline='offline'
    //     //     socket.broadcast.emit('onUserOnline',offline)
    //     // }

    // })

    socket.on("sendMessage", async (message) => {
      console.log("Received message:", message);

      try {
        console.log(message," messages in on sendMessage socket1")
        const operation = "save-message";
        const response: any = await messageRabbitMqClient.produce(
          message,
          operation
        );
        console.log(response, "response in sendMesage socket");
        if (response.success) {
          io.to(message.chatId).emit("newMessage", message);
          console.log("Message sent to chat:", message.chatId);
        } else {
          console.error("Failed to send message:", response.message);
        }
        // io.to(message.chatId).emit('newMessage', message);
      } catch (err) {
        console.error("Error sending message to RabbitMQ:", err);
      }
    });

    socket.on("newImage", async (message) => {
      // console.log('Received message', message);
      console.log(message, " newImages&&&&&&&&&&&&&&&&&&&&&&");
      try {
        const operation = "save-media";
        const response: any = await messageRabbitMqClient.produce(
          message,
          operation
        );
        console.log(response, "response in sendMesage socket");
        if (response.success) {
          io.to(message.chatId).emit("newMessage", message);
          console.log("Message sent to chat:", message.chatId);
        } else {
          console.error("Failed to send message:", response.message);
        }
        // io.to(message.chatId).emit('newMessage', message);
      } catch (err) {
        console.error("Error sending message to RabbitMQ:", err);
      }
      // io.to(message.chatId).emit('newMessage', message);
    });

   

    // // videocall
    // socket.on("user:call", (offer) => {
    //     if (!offer.offer || !offer.offer.receiverId) {
    //       console.error("Invalid offer object:", offer);
    //       return;
    //     }
    //     console.log("online users in call usercall 1st listener ",onlineUsers)
    //     const receiverSocketId = onlineUsers.get(offer.offer.receiverId);
    //     console.log(offer," offer in api socket&&&&&&&&&&&&")
    //     if (receiverSocketId) {
    //       io.to(receiverSocketId).emit("incomming:call", offer);
    //     } else {
    //       console.error("Receiver is not online or receiverId is invalid");
    //     }
    //   });

    //   socket.on("call:accepted",(ans)=>{
    //     if (!ans.ans || !ans.ans.receiverId) {
    //         console.error("Invalid offer object:", ans);
    //         return;
    //       }
    //       console.log("online users in call accepted listener ",onlineUsers)
    //       const receiverSocketId = onlineUsers.get(ans.ans.receiverId);
    //       console.log(ans," ans in api socket++++++++++++")
    //       if (receiverSocketId) {
    //         io.to(receiverSocketId).emit("call:accepted:confirm", ans);
    //       } else {
    //         console.error("Receiver is not online or receiverId is invalid");
    //       }

    //   })


    //video call new
    socket.on("askingSocketId",(id:any)=>{
      console.log("test object came &&&&&&&&&&&&&&&")
      const receiverSocketId = onlineUsers.get(id) || "";
      socket.emit("me", receiverSocketId)//new
    })

    socket.on("callUser", (data) => {
      const receiverSocketId = onlineUsers.get(data.userToCall) || "";
      io.to(receiverSocketId).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
    })
  
    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal)
    })



    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
      socket.broadcast.emit("callEnded")//new

      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          socket.broadcast.emit("userOffline", userId);
          onlineUsers.delete(userId);
          console.log(`Removed user ${userId} from online users`);
          break;
        }
      }
    });
  });
};

// export const emitUserStatus = (userId: string, isOnline: boolean) => {
//     if (io) {
//         io.emit('userStatusChanged', { userId, isOnline });
//     } else {
//         console.log('Socket.io not initialized');
//     }
// };

export const sendNotification = async (notificationData) => {
  console.log("sendNotification triggered in socketio.", notificationData);
  const receiverSocketId = onlineUsers.get(notificationData.senderId);

  const notification = await messageRabbitMqClient.produce(
    notificationData,
    "save-notification"
  );
  console.log(
    notification,
    " notification response in socket*&********************"
  );
  console.log(
    onlineUsers,
    " online sockets presents$$$$$$$$$$$$$$$$$$$$$$$$$$$$$"
  );
  //  io.emit('newNotification', notificationData);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newNotification", notificationData);
  } else {
    console.log("user is not in online");
  }
};
