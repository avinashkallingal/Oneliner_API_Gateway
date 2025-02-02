// import { Channel, connect, Connection } from "amqplib";
// import Producer from "./producer";
// import Consumer from "./consumer";
// import EventEmitter from "events";
// import rabbitMqConfig from "../../../config/rabbitMQconfig";

// class RabbitMQClient {
//     private static instance: RabbitMQClient;
//     private connection: Connection | undefined;
//     private producerChannel: Channel | undefined;
//     private consumerChannel: Channel | undefined;
//     private producer: Producer | undefined;
//     private consumer: Consumer | undefined;
//     private eventEmitter: EventEmitter = new EventEmitter();
//     private isInitialized = false;

//     private constructor() {}

//     public static getInstance() {
//         if(!this.instance) {
//             this.instance = new RabbitMQClient();
//         }
//         return this.instance;
//     }

//     async initialize() {
//         if(this.isInitialized) {
//             return
//         }
//         try {
//             console.log('Connecting to message RabbitMQ...');
//             this.connection = await connect(rabbitMqConfig.rabbitMQ.url);
//             console.log('Connected to message RabbitMQ');
//             [this.producerChannel, this.consumerChannel] = await Promise.all([
//                 this.connection.createChannel(),
//                 this.connection.createChannel(),
//             ]);

//             const { queue: replyQueueName } = await this.consumerChannel.assertQueue('', {exclusive: true});

//             this.producer = new Producer(this.producerChannel, replyQueueName, this.eventEmitter);
//             this.consumer = new Consumer(this.consumerChannel, replyQueueName, this.eventEmitter);
//             await this.consumer.consumeMessage();

//             this.isInitialized = true;
//         } catch (error) {
//             console.error("RabbitMQ error:", error);
//         }
//     }

//     async produce(data: any={}, operation: string) {
        
//         if(!this.isInitialized) {
//             await this.initialize();
//         }
//         return this.producer?.produceMessage(data, operation);
//     }
// }

// export default RabbitMQClient.getInstance();



//darshan code

import { Channel, connect, Connection } from "amqplib";
import Producer from "./producer";
import Consumer from "./consumer";
import EventEmitter from "events";
import rabbitMqConfig from "../../../config/rabbitMQconfig";

class RabbitMQClient {
    private static instance: RabbitMQClient;
    private connection: Connection | undefined;
    private producerChannel: Channel | undefined;
    private consumerChannel: Channel | undefined;
    private producer: Producer | undefined;
    private consumer: Consumer | undefined;
    private eventEmitter: EventEmitter = new EventEmitter();
    private isInitialized = false;

    private constructor() {}

    public static getInstance() {
        if(!this.instance) {
            this.instance = new RabbitMQClient();
        }
        return this.instance;
    }

    async initialize() {
        if(this.isInitialized) {
            return
        }
        try {
            console.log('Connecting to message RabbitMQ...');
            this.connection = await connect(rabbitMqConfig.rabbitMQ.url);
            console.log('Connecte message to RabbitMQ');


            [this.producerChannel, this.consumerChannel] = await Promise.all([
                this.connection.createChannel(),
                this.connection.createChannel(),
            ]);

            console.log('Creating reply queue for message...');
            const { queue: replyQueueName } = await this.consumerChannel.assertQueue('', {exclusive: true});
            console.log(`Reply queue created for message: ${replyQueueName}`);

            this.producer = new Producer(this.producerChannel, replyQueueName, this.eventEmitter);
            this.consumer = new Consumer(this.consumerChannel, replyQueueName, this.eventEmitter);

            console.log('Starting to consume messages for message...');
            await this.consumer.consumeMessage();
            this.isInitialized = true;

            console.log('RabbitMQ initialized for message');
        } catch (error) {
            console.error("RabbitMQ error in message:", error);
        }
    }

    async produce(data: any={}, operation: string) {
        
        if(!this.isInitialized) {
            await this.initialize();
        }
        return this.producer?.produceMessage(data, operation);
    }
}

export default RabbitMQClient.getInstance();