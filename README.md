# Partage de dépenses entre amis — séance 4 : switch de database

Une API pour partager des dépenses dans un groupe d'amis (type Tricount) : groupes, dépenses, soldes, remboursements. Elle est écrite en 3 couches, et garde aujourd'hui ses données **en mémoire**.

Objectif de la séance : brancher un adapteur **Postgres** à la place de l'adapteur en mémoire, **sans toucher aux Couches Domaine et Applicative**. Seul le câblage de `src/main.ts` change.

## Prérequis

- Node.js 22
- Docker (avec `docker compose`)

## Installation

```bash
npm install
cp .env.example .env
```

`npm install` génère aussi le client Prisma (`prisma generate`).

## Démarrer la base

```bash
npm run db:setup
```

Cette commande lance Postgres dans Docker (port **5434** sur votre machine) puis crée les tables décrites dans `prisma/schema.prisma`.

Pour regarder ce qu'il y a dans la base :

```bash
npm run db:studio
```

ou, en SQL :

```bash
docker exec -it tricount-db psql -U tricount -d tricount
```

## Choisir le stockage

Dans `.env`, la variable `STORAGE` choisit l'adapteur que `main.ts` branche :

| `STORAGE` | Adapteur |
|---|---|
| `memory` (par défaut) | `InMemoryGroupRepository` : les données disparaissent au redémarrage |
| `postgres` | `PostgresGroupRepository` : **à écrire** (`src/infrastructure/persistence/postgres-group-repository.ts`) |

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | lance `src/main.ts` en mode watch (tsx), avec les variables de `.env` |
| `npm start` | lance `src/main.ts` une fois |
| `npm test` | lance les tests (vitest) |
| `npm run test:watch` | tests en mode watch |
| `npm run typecheck` | vérifie les types (tsc, sans compiler) |
| `npm run db:setup` | démarre Postgres et applique le schéma |
| `npm run db:up` | démarre Postgres seulement |
| `npm run db:push` | applique `prisma/schema.prisma` à la base (et régénère le client Prisma) |
| `npm run db:studio` | ouvre Prisma Studio pour explorer la base |
| `npm run db:down` | arrête Postgres (les données restent dans le volume Docker) |

Pour repartir d'une base vide : `docker compose down -v`, puis `npm run db:setup`.

Le fichier `requests.http` contient des requêtes prêtes à envoyer (extension VS Code REST Client).

## Arborescence

```
prisma/
  schema.prisma        les tables groups et expenses (Couche Infrastructure)
src/
  domain/              Couche Domaine : entités et règles métier pures
  application/         Couche Applicative : use cases + interfaces dont ils ont besoin
  infrastructure/      Couche Infrastructure : les adapteurs
    http/              Express (routes, controllers)
    persistence/       implémentations des interfaces de stockage (en mémoire, Postgres)
  main.ts              composition root : choisit et câble les adapteurs et les use cases
tests/                 les tests
docker-compose.yml     la base Postgres
```

## La dependency rule

Les dépendances (les `import`) pointent **toujours vers l'intérieur** :

```
Infrastructure  ──▶  Applicative  ──▶  Domaine
```

- La Couche Domaine n'importe rien des deux autres (ni Express, ni stockage).
- La Couche Applicative importe le Domaine, jamais l'Infrastructure. Quand elle a besoin du monde extérieur, elle déclare une **interface**.
- La Couche Infrastructure fournit les **adapteurs** qui implémentent ces interfaces.
- Seul `main.ts` connaît tout le monde, pour tout brancher ensemble.
