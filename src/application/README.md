# Couche Applicative

Les use cases (« créer un groupe », « ajouter une dépense », « consulter les soldes »…) qui orchestrent la Couche Domaine.

C'est ici qu'on déclare les **interfaces** dont les use cases ont besoin (ex. un repository de groupes). Leurs implémentations (les **adapteurs**) vivent dans `infrastructure/`.

Peut importer `domain/`, jamais `infrastructure/`.
