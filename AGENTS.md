# desys — instructions pour les agents

Dépôt du design system, iso avec trois fichiers Figma (`figma.config.json`).

- Sources : `tokens/tokens.json`, `assets/icons/*.svg` + `assets/assets.json`,
  composants dans `src/web/components.tsx` et `Sources/Desys/Components/*.swift`,
  registre des variantes `src/web/stories.ts`.
- Fichiers générés (bannière « Généré ») : ne jamais les modifier à la main ;
  `npm run generate`.
- Un composant existe en React **et** en SwiftUI : changer l’un sans l’autre est
  un écart à signaler. Garde-fou du produit : jamais de verdict « vole / ne vole
  pas », un écart reste neutre (jamais `color.danger`).
- Synchro Figma : suivre `.agents/skills/figma-sync/SKILL.md`. Aucune écriture
  Figma sans accord explicite sur le plan affiché.
- Vérifier : `npm run check`, `npm test`, `npm run build` ; iOS : `swift build`
  et `swift test` (Xcode requis).
