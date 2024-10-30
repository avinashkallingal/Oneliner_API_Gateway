import { Channel } from "amqplib";
import rabbitMqConfig from "../../../config/rabbitMQconfig";
import { randomUUID } from "crypto";
import EventEmitter from "events";

export default class Producer {
    constructor(private channel: Channel, private replyQueueName: string, private eventEmitter: EventEmitter){}

    async produceMessage(data: any={}, operation:string){
        const correlationId = randomUUID();
        this.channel.sendToQueue(rabbitMqConfig.rabbitMQ.queues.messageQueue, Buffer.from(JSON.stringify(data)), {
            replyTo: this.replyQueueName,
            correlationId,
            headers:{function: operation},
        });

        return new Promise((resolve, reject)=>{
            this.eventEmitter.once(correlationId, (message)=>{
                try {
                    const reply = JSON.parse(message.content.toString());
                    resolve(reply);
                } catch (error) {
                    reject(error);
                }
            })
        })
    }
}