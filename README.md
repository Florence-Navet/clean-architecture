# Billetterie de concerts — API

L'API d'une petite billetterie : des organisateurs mettent des concerts en vente, avec plusieurs catégories de places (fosse, gradin, carré VIP) et un quota par catégorie. Le public réserve des billets, peut changer de catégorie ou annuler, et se fait rembourser selon les conditions de vente.

Stack : Node.js · TypeScript · Express 5. Pas de base de données ni de Docker : les données vivent en mémoire et sont réinitialisées à chaque redémarrage.

## Installation

Prérequis : **Node.js 20 ou plus** (`node -v`).

```bash
npm install
npm run dev          # lance l'API sur http://localhost:3000 (rechargement auto)
```

| Commande | Effet |
|---|---|
| `npm run dev` | lance l'API en mode watch |
| `npm start` | lance l'API une fois |
| `npm test` | lance les tests (vitest) ; il n'y en a aucun pour l'instant |
| `npm run typecheck` | vérifie les types (tsc, sans compiler) |

Les emails ne partent pas vraiment : ils sont écrits dans le fichier `emails.log`, à la racine du projet.

## Données de démo

| id | Concert | Ville | Date | État |
|---|---|---|---|---|
| 1 | Les Lumières Vives | Lyon | dans 90 jours | en vente, il reste 1 place en VIP |
| 2 | Nuit Blanche Orchestra | Paris | dans 20 jours | en vente, la fosse est pleine |
| 3 | Margaux Sel | Marseille | dans 5 jours | en vente |
| 4 | Kilomètre Zéro | Nantes | dans 40 jours | complet |

Les dates sont calculées à partir du moment où l'API démarre.

Réservations existantes : n°1 (alice@mail.fr, concert 1), n°2 (bob@mail.fr, concert 2), n°3 (bob@mail.fr, concert 1, annulée).

Codes promo : `FAN10` (−10 %) et `BIENVENUE5` (−5 € dès 50 € d'achat).

## Règles de vente

- **Tarif étudiant** : −20 % sur toutes les catégories sauf le carré VIP.
- **Early bird** : −10 % si on réserve plus de 60 jours avant le concert.
- **Tarif groupe** : −5 % à partir de 6 billets dans la même réservation.
- **Frais** : 1,50 € par billet + 3 % de frais de service, le tout plafonné à 15 € par réservation.
- **Limite** : 8 billets maximum par adresse email et par concert.
- **Annulation par le client** : remboursement complet (hors frais) à plus de 30 jours du concert, moitié entre 7 et 30 jours, rien à moins de 7 jours.
- **Annulation du concert par l'organisateur** : tout le monde est remboursé, frais compris.

## Authentification

Pas de compte client : on prouve qu'une réservation est la sienne en donnant son email. Les routes organisateur demandent l'en-tête `x-admin-key: admin123`.

## Routes

| Méthode | Route | Description |
|---|---|---|
| GET | `/concerts?city=&available=true` | Liste des concerts |
| GET | `/concerts/:id` | Détail d'un concert et de ses catégories |
| POST | `/concerts/:id/bookings` | Réserver (`email`, `tickets: [{ category, quantity }]`, `promoCode` et `student` optionnels) |
| GET | `/bookings/:id?email=` | Consulter sa réservation |
| POST | `/bookings/:id/change-category` | Changer de catégorie (`email`, `category`) |
| POST | `/bookings/:id/cancel` | Annuler sa réservation (`email`) |
| POST | `/concerts` | Créer un concert (organisateur) |
| POST | `/concerts/:id/cancel` | Annuler un concert (organisateur) |
| GET | `/concerts/:id/stats` | Statistiques de vente (organisateur) |
| POST | `/admin/reset` | Remettre les données de démo (organisateur) |
| GET | `/health` | L'API répond-elle ? |

Le fichier [`requests.http`](requests.http) contient des requêtes prêtes à lancer (extension VS Code **REST Client**).

## Tester l'API depuis vitest

`src/app.ts` exporte l'application Express sans démarrer le serveur, ce qui permet de l'appeler avec [supertest](https://github.com/ladjs/supertest) (déjà installé) :

```ts
import request from 'supertest';
import { app } from '../src/app';

it('liste les concerts', async () => {
  const res = await request(app).get('/concerts');
  expect(res.status).toBe(200);
});
```
