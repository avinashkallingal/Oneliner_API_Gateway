// import { Channel, ConsumeMessage } from "amqplib";
// import EventEmitter from "events";

// export default class Consumer {
//     constructor(private channel: Channel, private replyQueueName: string, private eventEmitter: EventEmitter) { }

//     async consumeMessage() {
//         console.log('consumemessgae--checking in post module')
//         this.channel.consume(this.replyQueueName, (message: ConsumeMessage | null) => {
//             console.log('consumemessgae--1-')
//             if (message) {
//                 console.log('consumemessgae--2-')
//                 this.eventEmitter.emit(message.properties.correlationId.toString(), message);
//                  this.channel.ack(message); // Keep this if you remove noAck: true
//             } else {
//                 console.log('No message received')
//             }
//         });
//     }
// }


//darshan code down

import { Channel, ConsumeMessage } from "amqplib";
import EventEmitter from "events";

export default class Consumer {
    constructor(private channel: Channel, private replyQueueName: string, private eventEmitter: EventEmitter) { }

    async consumeMessage() {
        console.log(`Consuming messages from queue for post: ${this.replyQueueName}`);
        this.channel.consume(this.replyQueueName, (message: ConsumeMessage | null) => {
            console.log('consumemessgae--1-')
            if (message) {
                // console.log('Message received in consumeMessage post:', message.content.toString());
                this.eventEmitter.emit(message.properties.correlationId.toString(), message);
                this.channel.ack(message);  // Keep this if you remove noAck: true
            } else {
                console.log('No message received in post que')
            }
        });
    }
}