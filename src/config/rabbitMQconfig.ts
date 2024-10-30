import config from "./config";

interface RabbitMQConfig {
    rabbitMQ: {
        url: string;
        queues: {
            userQueue: string
            postQueue: string
            messageQueue:string
        }
    }
}

const rabbitMQConfig: RabbitMQConfig = {
    rabbitMQ: {
        url: config.rabbitMq_url,
        queues: {
            userQueue: 'user_queue',
            postQueue: 'post_queue',
            messageQueue:'message_queue',
        }
    }
}

export default rabbitMQConfig;