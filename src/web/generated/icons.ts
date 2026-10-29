// Généré par scripts/generate.ts depuis les sources desys. Ne pas modifier à la main.
export const icons = {
  "preparer": {
    "label": "Préparer",
    "strokeWidth": 1.8,
    "paths": [
      "M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"
    ]
  },
  "debriefer": {
    "label": "Débriefer",
    "strokeWidth": 1.8,
    "paths": [
      "M6 3h9l4 4v14H6zM9 11h7M9 15h7"
    ]
  },
  "progresser": {
    "label": "Progresser",
    "strokeWidth": 1.8,
    "paths": [
      "M4 20V10M10 20V4M16 20v-7M22 20H2"
    ]
  },
  "profil": {
    "label": "Profil",
    "strokeWidth": 1.8,
    "paths": [
      "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"
    ]
  },
  "chevron": {
    "label": "Chevron",
    "strokeWidth": 1.8,
    "paths": [
      "M9 6l6 6-6 6"
    ]
  },
  "check": {
    "label": "Coche",
    "strokeWidth": 2,
    "paths": [
      "M6 12.5l4 4L18 8"
    ]
  }
} as const;
export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];
