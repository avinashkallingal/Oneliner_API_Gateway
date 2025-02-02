// import { Channel, ConsumeMessage } from "amqplib";
// import EventEmitter from "events";

// export default class Consumer {
//     constructor(private channel: Channel, private replyQueueName: string, private eventEmitter: EventEmitter) {}

//     async consumeMessage(){
//         this.channel.consume(this.replyQueueName,(message: ConsumeMessage | null)=>{
//             if(message){
//                 this.eventEmitter.emit(message.properties.correlationId.toString(), message);
//                  this.channel.ack(message); 
//             }
//         },{noAck:true})
//     }
// }


//darshan code down

import { Channel, ConsumeMessage } from "amqplib";
import EventEmitter from "events";

export default class Consumer {
    constructor(private channel: Channel, private replyQueueName: string, private eventEmitter: EventEmitter) {}

    async consumeMessage(){
        console.log(`Consuming messages from queue for message: ${this.replyQueueName}`);
        this.channel.consume(this.replyQueueName,(message: ConsumeMessage | null)=>{
            if(message){
                // console.log('Message received in consumeMessage message:', message.content.toString());
                this.eventEmitter.emit(message.properties.correlationId.toString(), message);
            } else {
                console.log('No message received in message que')
            }
        },{noAck:true})
    }
}
