import config from "./config";

interface RabbitMQConfig {
    rabbitMQ: {
        url: string;
        queues: {
            userQueue: string
        }
    }
}

const rabbitMQConfig: RabbitMQConfig = {
    rabbitMQ: {
        url: config.rabbitMq_url,
        queues: {
            userQueue: 'user_queue',
        }
    }
}

export default rabbitMQConfig;