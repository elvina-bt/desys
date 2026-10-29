// Synchro Figma ↔ dépôt desys. Les relevés sont produits par Claude Code (MCP
// Figma) avec les scripts de .agents/skills/figma-sync, enregistrés dans
// figma/private/ (ignoré par Git), puis intégrés ici :
//   npm run figma:tokens -- figma/private/tokens.json        Figma → tokens/tokens.json
//   npm run figma:tokens:plan -- figma/private/tokens.json   dépôt → plan pour apply-tokens.js
//   npm run figma:assets -- figma/private/assets.json        Figma → assets/icons
//   npm run figma:assets -- --push                           dépôt → plan pour push-assets.js
//   npm run figma:components -- figma/private/components.json  écarts Figma ↔ registre
// Le diff Git du dépôt est la revue : rien n'est commité automatiquement.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storyGroups } from '../src/web/stories.js';
import { generate } from './generate.js';
import {
  assetsFromFigma,
  assetsPush,
  componentsCheck,
  tokensDiff,
  tokensFromFigma,
  tokensPlan,
  type AssetEntry,
} from './sync.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(
  fs.readFileSync(path.join(root, 'figma.config.json'), 'utf8'),
);
const readJson = (rel: string) =>
  JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel: string, value: unknown) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
  return rel;
};
function readDump(
  file: string | undefined,
  library: 'tokens' | 'assets' | 'components',
) {
  if (!file) throw new Error('Chemin du relevé Figma manquant.');
  const dump = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  if (dump.fileKey !== config[library].fileKey)
    throw new Error(
      `Relevé d’un autre fichier (${dump.fileKey}) : ${config[library].name} attendu.`,
    );
  return dump;
}
const show = (v: unknown) => (v === null ? '—' : String(v));

const [command, arg] = process.argv.slice(2);
if (command === 'tokens') {
  const dump = readDump(arg, 'tokens');
  const before = readJson('tokens/tokens.json');
  const after = tokensFromFigma(dump);
  const diff = tokensDiff(before, after);
  writeJson('tokens/tokens.json', after);
  const { changed } = generate();
  console.log(
    diff.length
      ? `${diff.length} token(s) mis à jour depuis Figma (${dump.readAt}) :\n` +
          diff
            .map((c) => `  ${c.key} : ${show(c.from)} → ${show(c.to)}`)
            .join('\n')
      : 'Tokens déjà iso Figma.',
  );
  if (changed.length)
    console.log(
      `Sorties régénérées : ${changed.length} fichier(s). Revoir avec git diff.`,
    );
} else if (command === 'tokens-plan') {
  const dump = readDump(arg, 'tokens');
  const changes = tokensPlan(readJson('tokens/tokens.json'), dump);
  if (!changes.length) console.log('Figma est déjà aligné sur le dépôt.');
  else {
    const file = writeJson('figma/private/tokens-changes.json', {
      fileKey: dump.fileKey,
      changes,
    });
    console.log(
      `${changes.length} variable(s) à reporter dans Figma (${file}) :\n` +
        changes
          .map((c) => `  ${c.name} : ${show(c.from)} → ${show(c.to)}`)
          .join('\n'),
    );
  }
} else if (command === 'assets' && arg === '--push') {
  const manifest = readJson('assets/assets.json');
  const plan = assetsPush(
    manifest.icons as AssetEntry[],
    (name) =>
      fs.readFileSync(path.join(root, 'assets/icons', `${name}.svg`), 'utf8'),
    config.assets.fileKey,
  );
  if (!plan.icons.length)
    console.log('Toutes les icônes du dépôt sont déjà dans Figma.');
  else {
    const file = writeJson('figma/private/assets-push.json', plan);
    console.log(
      `${plan.icons.length} icône(s) à créer dans ${config.assets.name} (${file}) :\n` +
        plan.icons
          .map((i) => `  Icône/${i.label}  ← assets/icons/${i.name}.svg`)
          .join('\n'),
    );
  }
} else if (command === 'assets') {
  const dump = readDump(arg, 'assets');
  const manifest = readJson('assets/assets.json');
  const { entries, files } = assetsFromFigma(dump, manifest.icons);
  for (const [name, svg] of Object.entries(files))
    fs.writeFileSync(path.join(root, 'assets/icons', `${name}.svg`), svg);
  writeJson('assets/assets.json', { ...manifest, icons: entries });
  const { changed } = generate();
  console.log(
    `${Object.keys(files).length} icône(s) relue(s) depuis Figma (${dump.readAt}). Sorties régénérées : ${changed.length} fichier(s).`,
  );
} else if (command === 'components') {
  const dump = readDump(arg, 'components');
  const stories = storyGroups.flatMap((g) =>
    g.stories.map((s) => ({ id: `${g.id}--${s.id}`, figma: s.figma })),
  );
  const report = componentsCheck(dump, stories);
  if (report.aligned) console.log('Registre des composants iso Figma.');
  else {
    if (report.missing.length)
      console.log(
        `Variantes du registre absentes de Figma :\n  ${report.missing.join('\n  ')}`,
      );
    if (report.changedKey.length)
      console.log(
        `Clés de composant changées (republier, mettre à jour stories.ts) :\n  ${report.changedKey.join('\n  ')}`,
      );
    if (report.unmapped.length)
      console.log(
        `Variantes Figma sans story (à ajouter dans src/web/stories.ts) :\n  ${report.unmapped.join('\n  ')}`,
      );
    process.exitCode = 1;
  }
} else {
  console.error(
    'Commande : tokens | tokens-plan | assets [--push] | components',
  );
  process.exitCode = 2;
}
