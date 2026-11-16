// Bloc C (bonus) · processed-events.ts
// Retient les eventId déjà traités, pour ignorer un message reçu deux fois.
// En mémoire : si le consumer redémarre, il oublie tout (on en reparle demain).

export class ProcessedEvents {
  // À compléter (bloc C) : ajoutez un Set<string> pour ranger les eventId.

  has(eventId: string): boolean {
    throw new Error('À compléter : bloc C');
  }

  add(eventId: string): void {
    throw new Error('À compléter : bloc C');
  }
}
