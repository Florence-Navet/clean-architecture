// Couche Domaine · domain-error.ts
// L'erreur levée quand une règle métier est violée (montant invalide, non-membre…).
// Lui donner sa propre classe permet aux couches extérieures de la reconnaître
// avec `instanceof DomainError`, sans lire le texte du message.

export class DomainError extends Error {}
