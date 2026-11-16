// Couche Applicative · events.ts
// L'événement « une dépense a été ajoutée » (un fait passé), et l'interface pour le publier.
// La Couche Applicative ne sait pas QUI publie (mémoire, Kafka…) : elle ne connaît que l'interface.
export type ExpenseAdded = {
  type: "ExpenseAdded";
  eventId: string;
  groupId: string;
  payerName: string;
  amountInCents: number;
  occurredAt: string;
};

export interface EventPublisher {
  publish(event: ExpenseAdded): Promise<void>;
}
