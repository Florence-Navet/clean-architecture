// Partie C · Couche Infrastructure
// Rouge tant que src/infrastructure/persistence/in-memory-group-repository.ts n'existe pas.


import {groupRepositoryContract} from "./group-repository.contract";
import {InMemoryGroupRepository} from "../../src/infrastructure/persistence/in-memory-group-repository";

describe('InMemoryGroupRepository', () => {
  groupRepositoryContract(() => new InMemoryGroupRepository())
})