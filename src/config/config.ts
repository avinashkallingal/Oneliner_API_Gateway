import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: parseInt(process.env.PORT as string, 10) || "4000",
    jwt_key: process.env.JWT_SECRET_KEY || 'default_jwt_secret_key',
    rabbitMq_url:process.env.RABBITMQ_URL ||'',
    USER_SERVICE_PORT:process.env.USER_SERVICE_PORT

    
};

export default config;
