// Consumer de notification : lit le topic « expenses » et affiche une notification par dépense.
// Lancer : npm run consumer:notification     Arrêter : Ctrl+C
// C'est un programme à part entière, comme main.ts : il peut tourner (ou pas) sans l'API.
import { ExpenseAdded } from '../application/events';
import { kafka, TOPIC } from '../infrastructure/events/kafka-client';

// kafkajs exige un nom (groupId) : Kafka retient pour ce nom le dernier message lu.
const consumer = kafka.consumer({ groupId: 'notification' });

// La réaction à l'événement. Bloc C : c'est ici qu'on ignore un message déjà traité.
function handle(event: ExpenseAdded): void {
  console.log(`📣 Groupe ${event.groupId} : ${event.payerName} a ajouté ${event.amountInCents / 100} €`);
}

async function main(): Promise<void> {
  await consumer.connect();
  // fromBeginning : la toute première fois, on lit aussi les messages déjà dans le topic.
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });
  console.log(`Consumer de notification prêt, il écoute le topic « ${TOPIC} »…`);

  // Ctrl+C : on prévient Kafka qu'on part, pour pouvoir relancer tout de suite.
  process.on('SIGINT', () => consumer.disconnect().then(() => process.exit(0)));
  process.on('SIGTERM', () => consumer.disconnect().then(() => process.exit(0)));

  await consumer.run({
    // Appelé pour chaque message reçu
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event: ExpenseAdded = JSON.parse(message.value.toString());
      handle(event);
    },
  });
}

main();
