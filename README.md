# Partage de dépenses entre amis — séance 5 : réagir à un événement (Kafka)

Le partage de dépenses de mardi, réduit au strict nécessaire : **ajouter une dépense à un groupe**.
Aujourd'hui, on veut que d'autres choses se passent quand une dépense est ajoutée (notification, statistiques, badge…), sans que le use case `AddExpense` les connaisse toutes.

## Installation

```bash
npm install
docker compose up -d
```

Ouvrez http://localhost:8080 : l'interface de Kafka (kafka-ui). Le conteneur `depenses-kafka-init` crée les topics puis s'arrête : c'est normal qu'il soit « Exited ».

## Commandes

| Commande | Effet |
|---|---|
| `npm test` | lance les tests (vitest) |
| `npm run typecheck` | vérifie les types (tsc, sans compiler) |
| `npm run dev` | lance l'API sur http://localhost:3000 (mode watch) |
| `npm run consumer:notification` | lance le consumer de notification (Ctrl+C pour l'arrêter) |
| `npm run replay` | republie le dernier message du topic `expenses` (bloc C, bonus) |
| `docker compose up -d` / `docker compose down` | démarre / arrête Kafka et kafka-ui |

Les requêtes HTTP prêtes à l'emploi sont dans `requests.http` (extension VS Code « REST Client »).

Au départ, seul `add-expense.test.ts` est vert : les autres tests sont rouges (ils attendent votre code) ou en pause (`add-expense.etape-b.test.ts`, à activer au bloc A).

Au tout premier lancement d'un consumer, une ligne `ERROR … group coordinator is not available` peut s'afficher : Kafka finit de se préparer, ça repart tout seul.

## Arborescence

```
src/
  domain/                  Couche Domaine : Group, Expense
  application/             Couche Applicative : AddExpense, les interfaces (GroupRepository, Notifier, GroupStats, EventPublisher)
  infrastructure/          Couche Infrastructure : les adapteurs
    http/                  la route Express
    persistence/           le repository en mémoire
    console/               les adapteurs Notifier et GroupStats (console.log)
    events/                les adapteurs EventPublisher (mémoire, Kafka) et la connexion Kafka
    outbox/                bonus 1
  consumers/               les programmes qui lisent le topic (lancés à part, comme main.ts)
  scripts/                 replay
  main.ts                  composition root : câble les adapteurs et le use case
tests/                     les tests (bonus dans tests/bonus)
```

Les `import` pointent toujours vers l'intérieur : Infrastructure → Applicative → Domaine. Seuls `main.ts`, les consumers et les scripts connaissent Kafka.
