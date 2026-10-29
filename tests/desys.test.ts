import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generate,
  parseIcon,
  readIcons,
  readTokens,
  swiftTokens,
  webTokens,
} from '../scripts/generate.js';
import {
  assetsFromFigma,
  assetsPush,
  canonicalSvg,
  componentsCheck,
  tokensDiff,
  tokensFromFigma,
  tokensPlan,
} from '../scripts/sync.js';
import { storyGroups } from '../src/web/stories.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readTokens();

test('sources : 18 tokens valides, icônes 24×24 en tracés seuls', () => {
  assert.equal(Object.keys(tokens).length, 18);
  assert.equal(readIcons().length, 6);
  assert.throws(
    () => parseIcon('x', 'x', '<svg viewBox="0 0 24 24"><script/></svg>'),
    /seuls des <path>/,
  );
  assert.throws(
    () =>
      parseIcon('x', 'x', '<svg viewBox="0 0 32 32"><path d="M0 0"/></svg>'),
    /24 24/,
  );
});

test('génération : déterministe, web et iOS couvrent chaque token', () => {
  assert.deepEqual(
    generate().changed,
    [],
    'sorties à jour : lancer npm run generate',
  );
  const css = webTokens(tokens).css;
  const swift = swiftTokens(tokens);
  for (const [key, t] of Object.entries(tokens)) {
    assert.match(css, new RegExp(`--${key.replace('.', '-')}: ${t.$value}`));
    if (t.$type === 'color')
      assert.match(
        swift,
        new RegExp(
          `static let ${key.split('.')[1]} = Color\\(desysHex: 0x${String(t.$value).slice(1)}\\)`,
        ),
      );
  }
  assert.match(swift, /Font\.system\(size: size, weight: weight\)/);
  for (const icon of readIcons())
    assert(
      fs.existsSync(
        path.join(
          root,
          `Sources/Desys/Resources/Assets.xcassets/desys-${icon.name}.imageset/${icon.name}.svg`,
        ),
      ),
    );
});

const figmaTokens = {
  fileKey: '90pqKBxgw5j3rUlfZmCM0J',
  collection: 'Semantics',
  readAt: '2026-10-29T00:00:00Z',
  variables: Object.entries(tokens).map(([k, t]) => ({
    name: k.replace('.', '/'),
    type:
      t.$type === 'color'
        ? 'COLOR'
        : t.$type === 'dimension'
          ? 'FLOAT'
          : 'STRING',
    value: t.$value === 'system-ui' ? 'SF Pro' : t.$value,
  })),
};

test('synchro tokens : Figma → dépôt iso, plan seulement des écarts', () => {
  assert.deepEqual(tokensDiff(tokens, tokensFromFigma(figmaTokens)), []);
  assert.deepEqual(tokensPlan(tokens, figmaTokens), []);
  const repo = {
    ...tokens,
    'font.heading': { $type: 'dimension' as const, $value: 34 },
  };
  assert.deepEqual(tokensPlan(repo, figmaTokens), [
    {
      name: 'font/heading',
      type: 'FLOAT',
      from: tokens['font.heading'].$value,
      to: 34,
    },
  ]);
  assert.throws(
    () =>
      tokensFromFigma({
        ...figmaTokens,
        variables: [{ name: 'grille/12', type: 'FLOAT', value: 1 }],
      }),
    /hors contrat/,
  );
});

test('synchro assets : SVG Figma normalisé, liens Figma reportés au manifeste', () => {
  const figmaSvg =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="black" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  assert.match(
    canonicalSvg('chevron', figmaSvg),
    /stroke="currentColor" stroke-width="1.8"/,
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'assets/assets.json'), 'utf8'),
  ).icons;
  const { entries, files } = assetsFromFigma(
    {
      fileKey: 'XTTp2t19IZhVUnxbvomcNp',
      readAt: '2026-10-29T00:00:00Z',
      icons: [
        {
          name: 'Icône/Chevron',
          node: '1:2',
          key: 'a'.repeat(40),
          svg: figmaSvg,
        },
        {
          name: 'Icône/Météo',
          node: '1:3',
          key: 'b'.repeat(40),
          svg: figmaSvg,
        },
      ],
    },
    manifest,
  );
  assert.deepEqual(entries.find((e) => e.name === 'chevron')?.figma, {
    node: '1:2',
    key: 'a'.repeat(40),
  });
  assert.equal(entries.find((e) => e.label === 'Météo')?.name, 'meteo');
  assert.deepEqual(Object.keys(files).sort(), ['chevron', 'meteo']);
  const push = assetsPush(manifest, () => '<svg/>', 'XTTp2t19IZhVUnxbvomcNp');
  assert.equal(
    push.icons.length,
    manifest.filter((e: { figma: unknown }) => !e.figma).length,
  );
});

test('synchro composants : registre iso PFE – Components, écarts signalés', () => {
  const stories = storyGroups.flatMap((g) =>
    g.stories.map((s) => ({ id: `${g.id}--${s.id}`, figma: s.figma })),
  );
  const refs = new Map(
    stories.filter((s) => s.figma).map((s) => [s.figma!.node, s.figma!.key]),
  );
  const dump = {
    fileKey: 'dRoA2PB74Ne8TWXz5Cafin',
    readAt: '2026-10-29T00:00:00Z',
    components: [
      {
        name: 'Tout',
        node: '0:0',
        key: '',
        variants: [...refs].map(([node, key]) => ({ name: node, node, key })),
      },
    ],
  };
  assert.equal(componentsCheck(dump, stories).aligned, true);
  dump.components[0].variants.push({
    name: 'Nouvelle',
    node: '99:1',
    key: 'c'.repeat(40),
  });
  assert.deepEqual(componentsCheck(dump, stories).unmapped, [
    'Tout · Nouvelle',
  ]);
});

test('doc : chaque bloc {{composant:id}} a son composant', () => {
  for (const file of fs.readdirSync(path.join(root, 'docs'))) {
    const body = fs.readFileSync(path.join(root, 'docs', file), 'utf8');
    for (const [, id] of body.matchAll(/\{\{composant:([a-z0-9-]+)\}\}/g))
      assert(
        storyGroups.some((g) => g.id === id),
        `${file} : composant inconnu ${id}`,
      );
  }
});
