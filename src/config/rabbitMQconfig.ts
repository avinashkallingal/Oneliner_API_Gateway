import config from "./config";

interface RabbitMQConfig {
    rabbitMQ: {
        url: string;
        queues: {
            userQueue: string
            postQueue: string
        }
    }
}

const rabbitMQConfig: RabbitMQConfig = {
    rabbitMQ: {
        url: config.rabbitMq_url,
        queues: {
            userQueue: 'user_queue',
            postQueue: 'post_queue',
        }
    }
}

export default rabbitMQConfig;