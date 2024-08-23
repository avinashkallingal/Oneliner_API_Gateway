import express, { Request, Response } from 'express';
import userRabbitMqClient from './rabbitMQ/client';
import { generateToken } from '../../jwt/jwtCreate';

export const userController = {
    // Define memory storage object
    memoryStorage: {} as { [key: string]: any },

    register: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'register_user';

            console.log(req.body, 'body print');

            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(result, 'register-user');

            userController.memoryStorage['user'] = JSON.stringify(result.user_data);

            return res.json({data: result });
        } catch (error) {
            console.log('error in register user --> ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    otp: async (req: Request, res: Response) => {
        try {
            console.log('otp verify function triggered');
            const userData = JSON.parse(userController.memoryStorage['user']);
            const operation = 'save_user'
            const result: any = await userRabbitMqClient.produce(userData, operation);
            return res.json({ success: true, message: 'account created successfully!!!!!' })
        } catch (error) {
            console.log('Error in OTP verification:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    resendOtp: async (req: Request, res: Response) => {
        // Implement resend OTP logic here
    },

    login: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'user-login';

            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(result, 'user-login');

            if (!result.success) {
                return res.status(401).json({ error: 'Login failed' });
            }

            const token = generateToken({ id: result.user_data._id, email: result.user_data.email });
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
            result.token = token;

            return res.json(result);
        } catch (error) {
            console.log('error in userLogin --> ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    logout: async (req: Request, res: Response) => {
        // Implement logout logic here
    }
};
