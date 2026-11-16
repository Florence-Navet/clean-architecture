// Couche Infrastructure · postgres-group-repository.ts
//
// TODO séance 4 · bloc A : écrire ici le PostgresGroupRepository.
//
// - Il « signe le même contrat » que InMemoryGroupRepository : l'interface
//   GroupRepository (src/application/group-repository.ts), avec findById et save.
// - Il parle à Postgres avec le client Prisma (import { PrismaClient } from '@prisma/client').
//   Les tables sont décrites dans prisma/schema.prisma (modèles GroupRecord et ExpenseRecord).
// - Pour lire un groupe : Group.restore(id, name, members, expenses).
//   Pour le sauvegarder : group.expenses donne ses dépenses, en lecture seule.
// - Puis le brancher dans src/main.ts, à la place du TODO de createGroupRepository.
//
// Les Couches Domaine et Applicative ne doivent pas changer : si vous avez envie
// de les modifier, c'est que quelque chose fuit. Appelez le formateur.
