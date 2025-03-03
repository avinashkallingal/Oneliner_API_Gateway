// import { Channel, connect, Connection } from "amqplib";
// import rabbitMqConfig from "../../../config/rabbitMQconfig";
// import Producer from './producer';
// import Consumer from './consumer';
// import EventEmitter from "events";

// class RabbitMQClient {
//     private static instance: RabbitMQClient;
//     private connection: Connection | undefined;
//     private producerChannel: Channel | undefined;
//     private consumerChannel: Channel | undefined;
//     private producer: Producer | undefined;
//     private consumer: Consumer | undefined;
//     private eventEmitter: EventEmitter = new EventEmitter();
//     private isInitialized = false;

//     private constructor() { }

//     public static getInstance() {
//         if (!this.instance) {
//             this.instance = new RabbitMQClient();
//         }
//         return this.instance;
//     }

//     async initialize() {
//         if (this.isInitialized) {
//             return
//         }
//         try {
//             console.log('Connecting to post RabbitMQ...');
           
//             this.connection = await connect(rabbitMqConfig.rabbitMQ.url);
//             console.log('Connected to post RabbitMQ');
//             [this.producerChannel, this.consumerChannel] = await Promise.all([
//                 this.connection.createChannel(),
//                 this.connection.createChannel(),
//             ]);

//             const { queue: replyQueueName } = await this.consumerChannel.assertQueue('', { exclusive: true });

//             this.producer = new Producer(this.producerChannel, replyQueueName, this.eventEmitter);
//             this.consumer = new Consumer(this.consumerChannel, replyQueueName, this.eventEmitter);
//             await this.consumer.consumeMessage();

//             this.isInitialized = true;
//         } catch (error) {
//             console.error("RabbitMQ error:", error);
//         }
//     }

//     async produce(data: any = {}, operation: string) {

//         if (!this.isInitialized) {
//             await this.initialize();
//         }
//         return this.producer?.produceMessage(data, operation);
//     }
// }

// export default RabbitMQClient.getInstance();


//darshan code down
import { Channel, connect, Connection } from "amqplib";
import rabbitMqConfig from "../../../config/rabbitMQconfig";
import Producer from './producer';
import Consumer from './consumer';
import EventEmitter from "events";

class RabbitMQClient {
    private static instance: RabbitMQClient;
    private connection: Connection | undefined;
    private producerChannel: Channel | undefined;
    private consumerChannel: Channel | undefined;
    private producer: Producer | undefined;
    private consumer: Consumer | undefined;
    private eventEmitter: EventEmitter = new EventEmitter();
    private isInitialized = false;

    private constructor() { }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RabbitMQClient();
        }
        return this.instance;
    }

    async initialize() {
        if (this.isInitialized) {
            return
        }
        try {
            console.log('Connecting to post RabbitMQ...');
            this.connection = await connect(rabbitMqConfig.rabbitMQ.url);
            console.log('Connected post to RabbitMQ');

            [this.producerChannel, this.consumerChannel] = await Promise.all([
                this.connection.createChannel(),
                this.connection.createChannel(),
            ]);

            console.log('Creating reply queue for post...');
            const { queue: replyQueueName } = await this.consumerChannel.assertQueue('', { exclusive: true });
            console.log(`Reply queue created for post: ${replyQueueName}`);

            this.producer = new Producer(this.producerChannel, replyQueueName, this.eventEmitter);
            this.consumer = new Consumer(this.consumerChannel, replyQueueName, this.eventEmitter);

            console.log('Starting to consume messages for post...');
            await this.consumer.consumeMessage();
            this.isInitialized = true;

            console.log('RabbitMQ initialized for post');
        } catch (error) {
            console.error("RabbitMQ error in post:", error);
        }
    }

    async produce(data: any = {}, operation: string) {

        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.producer?.produceMessage(data, operation);
    }
}

export default RabbitMQClient.getInstance();