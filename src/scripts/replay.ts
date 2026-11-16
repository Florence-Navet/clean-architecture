// Script fourni (bloc C, bonus) : republie le DERNIER message du topic « expenses », à l'identique.
// But : simuler un message reçu deux fois (Kafka garantit « au moins une fois »).
// Lancer : npm run replay
import { Partitioners } from 'kafkajs';
import { kafka, TOPIC } from '../infrastructure/events/kafka-client';

async function main(): Promise<void> {
  // 1. Où en est le topic ? « high » = position du prochain message (le dernier est à high - 1).
  const admin = kafka.admin();
  await admin.connect();
  const [partition] = await admin.fetchTopicOffsets(TOPIC);
  await admin.disconnect();
  if (!partition || partition.high === '0') {
    console.log('Le topic est vide : ajoutez d\'abord une dépense.');
    return;
  }

  // 2. Relire le dernier message
  const consumer = kafka.consumer({ groupId: `replay-${Date.now()}` });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC });
  let receive: (value: Buffer | null) => void = () => {};
  const received = new Promise<Buffer | null>((resolve) => (receive = resolve));
  await consumer.run({ eachMessage: async ({ message }) => receive(message.value) });
  consumer.seek({ topic: TOPIC, partition: 0, offset: String(Number(partition.high) - 1) });
  const last = await received;
  await consumer.disconnect();

  // 3. Le republier tel quel (même eventId)
  const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
  await producer.connect();
  await producer.send({ topic: TOPIC, messages: [{ value: last }] });
  await producer.disconnect();
  console.log(`Message republié : ${last?.toString()}`);
}

main();
