// Couche Applicative · group-not-found-error.ts
// L'erreur levée par un use case quand le groupe demandé n'existe pas.
// Ce n'est pas une règle métier violée : c'est « je ne trouve pas ce que vous demandez ».

export class GroupNotFoundError extends Error {
  constructor(groupId: string) {
    super(`Groupe introuvable : ${groupId}`);
  }
}
