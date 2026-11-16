# Couche Infrastructure

Les **adapteurs** : le code qui parle au monde extérieur et implémente les interfaces de la Couche Applicative.

- `http/` : routes et controllers Express (traduisent une requête HTTP en appel de use case, et le résultat en réponse HTTP).
- `persistence/` : implémentations des interfaces de stockage : en mémoire, et bientôt Postgres (via Prisma, schéma dans `prisma/schema.prisma`).

Peut importer `application/` et `domain/`.
