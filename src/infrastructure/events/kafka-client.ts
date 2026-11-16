// Couche Infrastructure · kafka-client.ts
// La connexion à Kafka (lancé par docker compose), partagée par l'API, les consumers et les scripts.
import { Kafka, logLevel } from 'kafkajs';

export const TOPIC = 'expenses';
export const DLQ_TOPIC = 'expenses.dlq'; // bonus 2

export const kafka = new Kafka({
  clientId: 'partage-depenses',
  brokers: ['localhost:9092'],
  logLevel: logLevel.WARN,
});
