// Couche Infrastructure · kafka-event-publisher.ts
// Bloc B : un adapteur qui implémente EventPublisher en envoyant l'événement dans le topic Kafka.
// C'est le SEUL fichier de l'API qui connaît Kafka.
import { Partitioners } from 'kafkajs';
import { EventPublisher, ExpenseAdded } from '../../application/events';
import { kafka, TOPIC } from './kafka-client';

export class KafkaEventPublisher implements EventPublisher {
  private readonly producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
  private connected = false;

  async publish(event: ExpenseAdded): Promise<void> {
    await this.connect();
    // À compléter (bloc B) : envoyez l'événement dans le topic TOPIC avec this.producer.send(...)
    await this.producer.send({
      topic: TOPIC, // "expenses"
      messages: [{ value: JSON.stringify(event) }],
    });
    // Le message est un texte : transformez l'événement avec JSON.stringify(event).
    // throw new Error('À compléter : bloc B');



  }

  // Fourni : on se connecte à Kafka une seule fois, au premier publish.
  private async connect(): Promise<void> {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }
  }
}
