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

import {PrismaClient} from '@prisma/client';
import {GroupRepository} from '../../application/group-repository';
import {Group} from '../../domain/group';
import {Expense} from '../../domain/expense';
import e from "express";

export class postgresGroupRepository implements GroupRepository {
    constructor(private readonly prisma: PrismaClient) {
    }

    async findById(id: string): Promise<Group | undefined> {
        const record = await this.prisma.groupRecord.findUnique({
            where: {id},
            include: {expenses: {orderBy: {id: 'asc'}}},
        });
        if (!record) return undefined;
        const expenses = record.expenses.map(
            (e) => new Expense(e.label, e.amountCents, e.paidBy, e.participants),
        );
        return Group.restore(record.id, record.name, record.members, expenses);
    }

    async save(group: Group): Promise<void> {
        // Tout ou rien : si une requête échoue, aucune n'est appliquée.
        await this.prisma.$transaction([
            // 1. Crée le groupe s'il n'existe pas, sinon met à jour son nom et ses membres.
            this.prisma.groupRecord.upsert({
                where: { id: group.id },
                create: { id: group.id, name: group.name, members: group.members },
                update: { name: group.name, members: group.members },
            }),
            // 2. Efface les anciennes dépenses du groupe...
            this.prisma.expenseRecord.deleteMany({ where: { groupId: group.id } }),
            // 3. ...puis réécrit toutes ses dépenses actuelles, dans l'ordre.
            this.prisma.expenseRecord.createMany({
                data: group.expenses.map((e) => ({
                    groupId: group.id,
                    label: e.label,
                    amountCents: e.amountCents,
                    paidBy: e.paidBy,
                    participants: e.participants,
                })),
            }),
        ]);
    }

}



