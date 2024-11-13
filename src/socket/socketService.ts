import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import messageRabbitMqClient from '../modules/message/rabitMQ/client';

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
            origin: 'http://localhost:5173',
            methods: ['POST', 'GET'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('socket server started ->', socket.id);

        socket.on('userConnected', (userId) => {
            console.log(userId)
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} connected with socket ${socket.id}`);
            console.log('Current online users:', Array.from(onlineUsers.entries()));
        });

        socket.on('joinConversation', (chatId) => {
            socket.join(chatId);
            console.log('User joined conversation', chatId, 'Socket ID:', socket.id);
        });

        socket.on('userTyping', (id) => {
            console.log('user is typing ', id);
            const receiverSocketId = onlineUsers.get(id) || '';
            socket.broadcast.emit('onUserTyping')

        })
        socket.on('userOnline', (id) => {
            console.log('user is online ', id);
            const receiverSocketId = onlineUsers.get(id) || '';
            socket.broadcast.emit('onUserOnline')

        })

        socket.on('sendMessage', async (message) => {
            console.log('Received message:', message);

            try {
                const operation = 'save-message';
                const response: any = await messageRabbitMqClient.produce(message, operation);
                console.log(response, 'response in sendMesage socket')
                if (response.success) {
                    io.to(message.chatId).emit('newMessage', message);
                    console.log('Message sent to chat:', message.chatId);
                } else {
                    console.error('Failed to send message:', response.message);
                }
                // io.to(message.chatId).emit('newMessage', message);
            } catch (err) {
                console.error('Error sending message to RabbitMQ:', err);
            }
        });

        socket.on('newImage', async (message) => {
            // console.log('Received message', message);
            console.log(message," newImages&&&&&&&&&&&&&&&&&&&&&&")
            try {
                const operation = 'save-media';
                const response: any = await messageRabbitMqClient.produce(message, operation);
                console.log(response, 'response in sendMesage socket')
                if (response.success) {
                    io.to(message.chatId).emit('newMessage', message);
                    console.log('Message sent to chat:', message.chatId);
                } else {
                    console.error('Failed to send message:', response.message);
                }
                // io.to(message.chatId).emit('newMessage', message);
            } catch (err) {
                console.error('Error sending message to RabbitMQ:', err);
            }
            // io.to(message.chatId).emit('newMessage', message);
        })

        // // video call.
        // socket.on('callUser', ({ userToCall, from, offer, fromId }) => {
        //     console.log('CallUser event received:', { userToCall, from, offer, fromId });
        //     const receiverSocketId = onlineUsers.get(userToCall) || '';
        //     console.log(receiverSocketId, 'hello user to call', userToCall);
        //     io.emit('incomingCall', { from: fromId, callerName: from, offer, userToCall });
        // });

        // socket.on('signal', (data) => {
        //     const { userId, type, candidate, answer, context } = data;
        //     if (context === 'webRTC') {
        //         io.emit('signal', { type, candidate, answer, userId });
        //     }
        // });

        // socket.on('callAccepted', ({ userId, answer, context, acceptedBy }) => {
        //     if (context === 'webRTC') {
        //         io.emit('callAcceptedSignal', { answer, context, userId, acceptedBy });
        //     }
        // });

        // socket.on('callEnded', (guestId) => {
        //     io.emit('callEndedSignal');
        // });

        // disconnect the socket connection. 
        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);

            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
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

// export const sendNotification = async (notificationData: any) => {
//     console.log('sendNotification triggered in socketio.', notificationData)
//     const receiverSocketId = onlineUsers.get(notificationData.senderId);
//     const notification = await messageRabbitMqClient.produce(notificationData, 'save-notification')

//     if (receiverSocketId) {
//         io.to(receiverSocketId).emit('newNotification', notificationData);
//     } else {
//         console.log('user is not in online')
//     }
// }
