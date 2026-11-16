# Partage de dépenses entre amis — séance 2

Une API pour partager des dépenses dans un groupe d'amis (type Tricount) : groupes, dépenses, soldes. On la construit **from scratch**, en 3 couches.

## Installation

```bash
npm install
```

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | lance `src/main.ts` en mode watch (tsx) |
| `npm start` | lance `src/main.ts` une fois |
| `npm test` | lance les tests (vitest) |
| `npm run test:watch` | tests en mode watch |
| `npm run typecheck` | vérifie les types (tsc, sans compiler) |

Pas de base de données ni de Docker : la persistance est en mémoire.

## Arborescence

```
src/
  domain/              Couche Domaine : entités et règles métier pures
  application/         Couche Applicative : use cases + interfaces dont ils ont besoin
  infrastructure/      Couche Infrastructure : les adapteurs
    http/              Express (routes, controllers)
    persistence/       implémentations en mémoire des interfaces de stockage
  main.ts              composition root : câble les adapteurs et les use cases
tests/                 les tests
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
