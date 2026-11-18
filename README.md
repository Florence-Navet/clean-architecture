# Partage de dépenses entre amis — séance 6 : brancher une API externe

Le partage de dépenses de mardi (3 couches, en mémoire), avec une nouveauté : une dépense peut être payée dans une **autre devise** (ex. 30 $). Elle est convertie en euros avant d'entrer dans le groupe, grâce à l'API externe **Frankfurter** (https://frankfurter.dev/).

L'énoncé de la séance est dans [ENONCE.md](ENONCE.md).

## Installation

```bash
npm install
```

Pas de base de données ni de Docker.

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | lance l'API sur http://localhost:3000 (mode watch) |
| `npm test` | lance les tests (vitest) |
| `npm run test:watch` | tests en mode watch |
| `npm run typecheck` | vérifie les types (tsc, sans compiler) |
| `npm run api-simulee` | lance l'API simulée sur http://localhost:4000/v2 (même route et même JSON que Frankfurter) |
| `npm run api-simulee:lente` | idem, mais chaque réponse arrive au bout de 3 s |
| `npm run api-simulee:en-panne` | idem, mais une requête sur deux répond 500 |

Lancez l'API simulée dans un **2e terminal** (Ctrl+C pour l'arrêter). Chaque requête qu'elle reçoit s'affiche dans ce terminal.

Les requêtes HTTP prêtes à l'emploi sont dans `requests.http` (extension VS Code « REST Client »).

Au départ, **9 tests sont rouges** : ils attendent votre code. Le nom de chaque test rouge commence par le bloc qui le fait passer (`Bloc A · …`).

## Arborescence

```
src/
  domain/                Couche Domaine : Group, Expense, ExchangeRate, les erreurs métier
  application/           Couche Applicative : les use cases + les interfaces (GroupRepository, ExchangeRateProvider)
  infrastructure/        Couche Infrastructure : les adapteurs
    http/                les routes Express
    persistence/         le repository en mémoire
    exchange-rates/      les adapteurs de taux : à taux figés (fourni) et Frankfurter (à écrire)
  main.ts                composition root : câble les adapteurs et les use cases (et choisit l'adresse de l'API de taux)
tests/                   les tests (et les fakes, dans tests/application/)
tools/
  api-simulee.ts         l'API simulée (un petit serveur local qui imite Frankfurter)
```

## La dependency rule

```
Infrastructure  ──▶  Applicative  ──▶  Domaine
```

- La Couche Domaine n'importe rien des deux autres : ni Express, ni `fetch`, ni Frankfurter.
- La Couche Applicative déclare l'interface `ExchangeRateProvider` ; elle ne sait pas qui fournit les taux.
- L'adapteur `FrankfurterExchangeRateProvider` (Infrastructure) est le **seul** fichier qui connaît le JSON de Frankfurter.
- Seul `main.ts` connaît tout le monde, et l'adresse de l'API.
