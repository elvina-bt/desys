---
title: Design tokens
section: tokens
order: 10
summary: 18 tokens sémantiques partagés entre Figma, l’atelier et le code.
status: stable
figma: color, font, space, radius
---

## Contrat de nommage

Figma groupe avec `/`, le code avec `.` : `color/brand` ↔ `color.brand` ↔ `var(--color-brand)`. Les noms sémantiques sont identiques partout. Détail complet : `FIGMA.md` du dépôt desys.

## Tous les tokens

{{tokens:color}}

{{tokens:font}}

{{tokens:space}}

{{tokens:radius}}

## Synchronisation avec Figma

L’atelier n’est pas connecté directement à Figma. La synchro se fait avec Claude Code (skill `figma-sync` du dépôt desys) : relevé de Figma, diff Git du dépôt, puis report dans Figma après accord. Voir [Bienvenue](doc:bienvenue).
