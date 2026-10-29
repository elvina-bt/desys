# desys

Design system de l’app iPhone parapente (PFE) : **tokens**, **assets** et
**composants**, iso avec les trois bibliothèques Figma, livrés pour le **web**
(React + CSS) et **iOS** (Swift Package, SwiftUI).

| Bibliothèque Figma       | Source dans ce dépôt                            | Web                          | iOS                                                                     |
| ------------------------ | ----------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| PFE – Tokens (Semantics) | `tokens/tokens.json`                            | `desys/tokens.css`, `tokens` | `DesysColor`, `DesysSpace`, `DesysRadius`, `DesysFontSize`, `DesysFont` |
| PFE – Assets (Icônes)    | `assets/icons/*.svg`, `assets/assets.json`      | `<Icon name="…" />`          | `DesysIcon` (catalogue `.xcassets`, vectoriel)                          |
| PFE – Components         | composants codés + `components/components.json` | `Button`, `ForecastCard`…    | `DesysButton`, `DesysForecastCard`…                                     |

L’outil **desys** (dépôt DS-Studio) sert de documentation, de playground et
d’éditeur de tokens : il lit et écrit ce dépôt.

## Web

```bash
npm install github:elvina-bt/desys
```

```tsx
import 'desys/tokens.css';
import 'desys/styles.css';
import { DesysProvider, Button, ForecastCard } from 'desys';

<DesysProvider>
  <Button>Nouvelle sortie</Button>
</DesysProvider>;
```

`DesysProvider` pose les variables CSS des tokens (on peut lui passer un autre
jeu de tokens, comme le fait l’éditeur). React 19 est une dépendance pair.

## iOS (Swift Package Manager)

Dans Xcode : **File → Add Package Dependencies…**, URL du dépôt, produit `Desys`
(iOS 16 minimum).

```swift
import Desys

DesysButton("Nouvelle sortie") { start() }
DesysForecastCard(place: "Saint-Hilaire", slot: "sam. 14 h–16 h", wind: "12–18 km/h",
                  summary: "Ouest, rafales possibles l’après-midi.", gusts: "jusqu’à 25 km/h",
                  ceiling: "2 400 m", confidence: "Moyenne · maille 1,3 km")
Text("Plafond").foregroundStyle(DesysColor.muted).padding(DesysSpace.md)
DesysIcon.preparer.image
```

Aperçus : ouvrir `Sources/Desys/Previews.swift` dans Xcode (Canvas).

## Faire évoluer le DS

1. Modifier une **source** : `tokens/tokens.json`, `assets/`, ou un composant
   (`src/web/components.tsx` et son équivalent SwiftUI dans `Sources/Desys/Components`).
2. `npm run generate` régénère les sorties web et iOS (fichiers marqués « Généré »,
   à ne pas modifier à la main).
3. `npm run check && npm test`, puis commit.

## Synchro avec Figma

Figma n’offre pas d’API de variables hors plan Enterprise : la synchro passe par
**Claude Code** (client MCP Figma), avec la skill `.agents/skills/figma-sync`.
Rien n’est automatique ni écrit dans Figma sans accord sur un plan précis.

| Sens               | Commande après relevé                                                            |
| ------------------ | -------------------------------------------------------------------------------- |
| Figma → tokens     | `npm run figma:tokens -- figma/private/tokens.json`                              |
| Tokens → Figma     | `npm run figma:tokens:plan -- figma/private/tokens.json`, puis `apply-tokens.js` |
| Figma → assets     | `npm run figma:assets -- figma/private/assets.json`                              |
| Assets → Figma     | `npm run figma:assets -- --push`, puis `push-assets.js`                          |
| Figma ↔ composants | `npm run figma:components -- figma/private/components.json` (rapport d’écarts)   |

Contrat de nommage : `FIGMA.md` (`color/brand` ↔ `color.brand` ↔ `--color-brand` ↔
`DesysColor.brand`). Règles et usages : pages de `docs/` (principes, accessibilité, ton).

## Structure

```
tokens/            source des tokens (iso PFE – Tokens)
assets/            icônes SVG + manifeste (iso PFE – Assets)
components/        manifeste des composants (généré depuis src/web/stories.ts)
docs/              pages de documentation (affichées par desys)
src/web/           composants React, styles, stories ; generated/ = sorties
Sources/Desys/     package Swift : Components/, Generated/, Resources/Assets.xcassets
scripts/           generate.ts (sorties), figma.ts + sync.ts (synchro)
.agents/skills/    procédure de synchro Figma pour Claude Code
```
