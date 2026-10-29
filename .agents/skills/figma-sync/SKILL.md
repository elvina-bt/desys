---
name: figma-sync
description: Synchroniser le dépôt desys avec ses trois bibliothèques Figma (PFE – Tokens, PFE – Assets, PFE – Components) via le MCP Figma de Claude Code. Utiliser quand on demande « synchronise depuis Figma », « reporte dans Figma » ou « vérifie les composants ».
---

# Synchroniser desys et Figma

Aucune synchronisation automatique : l’agent du terminal relit et écrit, avec
l’accord de l’étudiante. Cibles : `figma.config.json` uniquement. Avant tout appel
`use_figma`, charger les consignes Figma (`figma-use`) et ouvrir une session
`create_session` sur le `fileKey` concerné. Les relevés vont dans `figma/private/`
(ignoré par Git).

## Tokens — PFE – Tokens

1. Relever : passer `read-tokens.js` à `use_figma`, enregistrer le JSON rendu dans
   `figma/private/tokens.json`.
2. **Figma → dépôt** : `npm run figma:tokens -- figma/private/tokens.json`. Le
   dépôt devient iso Figma ; montrer le diff Git à l’étudiante avant tout commit.
3. **Dépôt → Figma** : `npm run figma:tokens:plan -- figma/private/tokens.json`,
   afficher le plan et attendre un accord explicite pour ce plan précis. Remplacer
   `__PLAN__` dans `apply-tokens.js` par `figma/private/tokens-changes.json`,
   exécuter d’abord avec `"dryRun": true`, montrer le rapport, puis sans. Relever
   à nouveau : le plan doit annoncer « Figma est déjà aligné ».

## Assets — PFE – Assets (page « Icônes », composants « Icône/<Libellé> »)

- **Figma → dépôt** : `read-assets.js`, puis
  `npm run figma:assets -- figma/private/assets.json` (SVG normalisés : 24×24,
  tracés, `currentColor` ; liens Figma reportés dans `assets/assets.json`).
- **Dépôt → Figma** : `npm run figma:assets -- --push` liste les icônes sans lien
  Figma ; après accord, remplacer `__PLAN__` dans `push-assets.js` par
  `figma/private/assets-push.json` (`dryRun` d’abord). Puis relire (étape
  Figma → dépôt) pour enregistrer nœuds et clés. Le script ne modifie ni ne
  supprime jamais une icône existante.

## Composants — PFE – Components

Le code est la source des composants ; Figma est leur reflet de design.
`read-components.js`, puis `npm run figma:components -- figma/private/components.json` :
rapport des variantes sans story, des stories sans variante et des clés changées.
Corriger `src/web/stories.ts` (et le composant React / SwiftUI si besoin), puis
`npm run generate`.

## Après chaque synchro

`npm run check && npm test`, entrée dans `CHANGELOG.md`, commit par l’étudiante.
Les bibliothèques se publient dans Figma par l’étudiante (Assets → Publish).

## Limites

- Collection Semantics seulement (Primitives et Breakpoints restent dans Figma).
- Icônes au trait uniquement (pas de remplissage ni d’image) : sinon l’import échoue.
- Consomme le quota Figma MCP et Claude de l’étudiante.
