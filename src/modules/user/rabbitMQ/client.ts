// import { Channel, connect, Connection } from 'amqplib';
// import Producer from './producer';
// import Consumer from './consumer';
// import { EventEmitter } from 'events';
// import rabbitMQConfig from '../../../config/rabbitMQconfig';

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
//         if (!this.instance) {
//             this.instance = new RabbitMQClient();
//         }
//         return this.instance;
//     }

//     async initialize() {
//         if (this.isInitialized) {
//             return;
//         }
//         try {
//             console.log('Connecting to RabbitMQ...');
//             this.connection = await connect(rabbitMQConfig.rabbitMQ.url);
//             console.log('Connected to RabbitMQ');

//             this.producerChannel = await this.connection.createChannel();
//             this.consumerChannel = await this.connection.createChannel();

//             console.log('Creating reply queue...');
//             const { queue: replyQueueName } = await this.consumerChannel.assertQueue('', { exclusive: true });
//             console.log(`Reply queue created: ${replyQueueName}`);

//             this.eventEmitter = new EventEmitter();
//             this.producer = new Producer(this.producerChannel, replyQueueName, this.eventEmitter);
//             this.consumer = new Consumer(this.consumerChannel, replyQueueName, this.eventEmitter);

//             console.log('Starting to consume messages...');
//             await this.consumer.consumeMessage();
//             this.isInitialized = true;

//             console.log('RabbitMQ initialized');
//         } catch (error) {
//             console.error('Error initializing RabbitMQ:', error);
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

// import { Channel, connect, Connection } from 'amqplib';
// import Producer from './producer';
// import Consumer from './consumer';
// import { EventEmitter } from 'events';
// import rabbitMQConfig from '../../../config/rabbitMQconfig';

// class RabbitMQClient {
//     private static instance: RabbitMQClient;
//     private connection: Connection | undefined;
//     private producerChannel: Channel | undefined;
//     private consumerChannel: Channel | undefined;
//     private producer: Producer | undefined;
//     private consumer: Consumer | undefined;
//     private eventEmitter: EventEmitter = new EventEmitter();
//     private isInitialized = false;
//     private replyQueueName: string | undefined;  // Ensure queue is reused

//     private constructor() {}

//     public static getInstance() {
//         if (!this.instance) {
//             this.instance = new RabbitMQClient();
//         }
//         return this.instance;
//     }

//     async initialize() {
//         if (this.isInitialized) {
//             return;
//         }
//         try {
//             console.log('Connecting to user RabbitMQ...');
//             this.connection = await connect(rabbitMQConfig.rabbitMQ.url);
//             console.log('Connected to user RabbitMQ');

//             this.producerChannel = await this.connection.createChannel();
//             this.consumerChannel = await this.connection.createChannel();

//             if (!this.replyQueueName) {
//                 console.log('Creating reply queue...');
//                 const { queue } = await this.consumerChannel.assertQueue('', { exclusive: true });
//                 this.replyQueueName = queue;
//                 console.log(`Reply queue created: ${this.replyQueueName}`);
//             }

//             this.eventEmitter = new EventEmitter();
//             this.producer = new Producer(this.producerChannel, this.replyQueueName, this.eventEmitter);
//             this.consumer = new Consumer(this.consumerChannel, this.replyQueueName, this.eventEmitter);

//             console.log('Starting to consume messages...');
//             await this.consumer.consumeMessage();
//             this.isInitialized = true;

//             console.log('RabbitMQ initialized');
//         } catch (error) {
//             console.error('Error initializing RabbitMQ:', error);
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
import { Channel, connect, Connection } from 'amqplib';
import Producer from './producer';
import Consumer from './consumer';
import { EventEmitter } from 'events';
import rabbitMQConfig from '../../../config/rabbitMQconfig';

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
        if (!this.instance) {
            this.instance = new RabbitMQClient();
        }
        return this.instance;
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            console.log('Connecting to user RabbitMQ...');
            this.connection = await connect(rabbitMQConfig.rabbitMQ.url);
            console.log('Connected user to RabbitMQ');

            this.producerChannel = await this.connection.createChannel();
            this.consumerChannel = await this.connection.createChannel();

            console.log('Creating reply queue for user...');
            const { queue: replyQueueName } = await this.consumerChannel.assertQueue('', { exclusive: true });
            console.log(`Reply queue created for user: ${replyQueueName}`);

            this.eventEmitter = new EventEmitter();
            this.producer = new Producer(this.producerChannel, replyQueueName, this.eventEmitter);
            this.consumer = new Consumer(this.consumerChannel, replyQueueName, this.eventEmitter);

            console.log('Starting to consume messages for user...');
            await this.consumer.consumeMessage();
            this.isInitialized = true;

            console.log('RabbitMQ initialized for user');
        } catch (error) {
            console.error('Error initializing RabbitMQ in user:', error);
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

