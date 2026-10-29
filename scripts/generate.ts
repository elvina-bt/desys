// Génère les sorties web et iOS depuis les sources du design system :
//   tokens/tokens.json      → src/web/generated/tokens.{ts,css}, Sources/Desys/Generated/Tokens.swift
//   assets/icons/*.svg      → src/web/generated/icons.ts, Sources/Desys/Generated/Icons.swift,
//                             Sources/Desys/Resources/Assets.xcassets
//   src/web/stories.ts      → components/components.json (manifeste commun web / iOS / Figma)
// Déterministe : relancer sans changement de source ne change aucun fichier.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { figmaFile, storyGroups, storyId } from '../src/web/stories.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const banner =
  'Généré par scripts/generate.ts depuis les sources desys. Ne pas modifier à la main.';

type Token = {
  $type: 'color' | 'dimension' | 'fontFamily';
  $value: string | number;
};
export type Icon = {
  name: string;
  label: string;
  strokeWidth: number;
  paths: string[];
};

export function readTokens(file = path.join(root, 'tokens/tokens.json')) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<
    string,
    Token
  >;
  for (const [key, t] of Object.entries(raw)) {
    if (!/^(color|font|space|radius)\.[a-zA-Z]+$/.test(key))
      throw new Error(`Nom de token invalide : ${key}`);
    if (t.$type === 'color' && !/^#[0-9A-F]{6}$/.test(String(t.$value)))
      throw new Error(`${key} : couleur #RRGGBB attendue.`);
    if (
      t.$type === 'dimension' &&
      !(typeof t.$value === 'number' && t.$value >= 0 && t.$value <= 200)
    )
      throw new Error(`${key} : dimension entre 0 et 200 attendue.`);
    if (t.$type === 'fontFamily' && !/^[\w -]{1,60}$/.test(String(t.$value)))
      throw new Error(`${key} : nom de police invalide.`);
    if (!['color', 'dimension', 'fontFamily'].includes(t.$type))
      throw new Error(`${key} : type inconnu ${t.$type}.`);
  }
  return raw;
}

// Un SVG d'icône : 24×24, uniquement des <path d="…">, trait currentColor.
export function parseIcon(name: string, label: string, svg: string): Icon {
  if (!/viewBox="0 0 24 24"/.test(svg))
    throw new Error(`${name}.svg : viewBox 0 0 24 24 attendu.`);
  const tags = [...svg.matchAll(/<([a-zA-Z]+)[\s>/]/g)].map((m) => m[1]);
  const extra = tags.filter((t) => t !== 'svg' && t !== 'path');
  if (extra.length)
    throw new Error(
      `${name}.svg : seuls des <path> sont acceptés (${extra.join(', ')}).`,
    );
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  if (!paths.length) throw new Error(`${name}.svg : aucun tracé.`);
  for (const d of paths)
    if (!/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/.test(d))
      throw new Error(`${name}.svg : tracé invalide.`);
  const width = Number(/stroke-width="([\d.]+)"/.exec(svg)?.[1] ?? 2);
  return { name, label, strokeWidth: width, paths };
}

export function readIcons() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'assets/assets.json'), 'utf8'),
  ) as {
    icons: { name: string; label: string }[];
  };
  const files = fs
    .readdirSync(path.join(root, 'assets/icons'))
    .filter((f) => f.endsWith('.svg'));
  const listed = new Set(manifest.icons.map((i) => i.name));
  const orphans = files
    .map((f) => f.replace(/\.svg$/, ''))
    .filter((n) => !listed.has(n));
  if (orphans.length)
    throw new Error(`SVG absents du manifeste : ${orphans.join(', ')}.`);
  return manifest.icons.map((i) => {
    if (!/^[a-z][a-z0-9-]{0,40}$/.test(i.name))
      throw new Error(`Nom d’icône invalide : ${i.name}`);
    const file = path.join(root, 'assets/icons', `${i.name}.svg`);
    if (!fs.existsSync(file))
      throw new Error(`Fichier manquant : assets/icons/${i.name}.svg`);
    return parseIcon(i.name, i.label, fs.readFileSync(file, 'utf8'));
  });
}

const camel = (s: string) =>
  s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
const cssVar = (key: string) => `--${key.replaceAll('.', '-')}`;
const swiftName = (key: string) => camel(key.split('.')[1]);

export function webTokens(tokens: Record<string, Token>) {
  const ts = `// ${banner}\nimport type { TokenSet } from '../tokens.js';\n\nexport const tokens = ${JSON.stringify(tokens, null, 2)} as const satisfies TokenSet;\nexport type TokenKey = keyof typeof tokens;\n`;
  const css = `/* ${banner} */\n:root {\n${Object.entries(tokens)
    .map(
      ([k, t]) =>
        `  ${cssVar(k)}: ${t.$value}${t.$type === 'dimension' ? 'px' : ''};`,
    )
    .join('\n')}\n}\n`;
  return { ts, css };
}

export function webIcons(icons: Icon[]) {
  const data = Object.fromEntries(
    icons.map((i) => [
      i.name,
      { label: i.label, strokeWidth: i.strokeWidth, paths: i.paths },
    ]),
  );
  return `// ${banner}\nexport const icons = ${JSON.stringify(data, null, 2)} as const;\nexport type IconName = keyof typeof icons;\nexport const iconNames = Object.keys(icons) as IconName[];\n`;
}

export function swiftTokens(tokens: Record<string, Token>) {
  const group = (prefix: string) =>
    Object.entries(tokens).filter(([k]) => k.startsWith(`${prefix}.`));
  const colors = group('color')
    .map(
      ([k, t]) =>
        `    public static let ${swiftName(k)} = Color(desysHex: 0x${String(t.$value).slice(1)})`,
    )
    .join('\n');
  const dims = (prefix: string) =>
    group(prefix)
      .filter(([, t]) => t.$type === 'dimension')
      .map(
        ([k, t]) =>
          `    public static let ${swiftName(k)}: CGFloat = ${t.$value}`,
      )
      .join('\n');
  const family = String(tokens['font.family']?.$value ?? 'system-ui');
  // system-ui (web) = police système iOS (SF Pro) ; sinon police nommée.
  const font =
    family === 'system-ui'
      ? '        Font.system(size: size, weight: weight)'
      : `        Font.custom("${family}", size: size).weight(weight)`;
  return `// ${banner}
import SwiftUI

public enum DesysColor {
${colors}
}

public enum DesysSpace {
${dims('space')}
}

public enum DesysRadius {
${dims('radius')}
}

public enum DesysFontSize {
${dims('font')}
}

public enum DesysFont {
    /// Police du token font.family (${family}).
    public static func make(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
${font}
    }
}
`;
}

export function swiftIcons(icons: Icon[]) {
  const cases = icons
    .map((i) => `    case ${camel(i.name)} = "desys-${i.name}"`)
    .join('\n');
  return `// ${banner}
import SwiftUI

/// Icônes de PFE – Assets, rendues en mode modèle : elles prennent la couleur du texte.
public enum DesysIcon: String, CaseIterable {
${cases}

    public var image: Image {
        Image(rawValue, bundle: .module).renderingMode(.template)
    }
}
`;
}

export function xcassets(icons: Icon[], svgOf: (name: string) => string) {
  const files: Record<string, string> = {
    'Assets.xcassets/Contents.json':
      JSON.stringify({ info: { author: 'xcode', version: 1 } }, null, 2) + '\n',
  };
  for (const i of icons) {
    const dir = `Assets.xcassets/desys-${i.name}.imageset`;
    files[`${dir}/${i.name}.svg`] = svgOf(i.name);
    files[`${dir}/Contents.json`] =
      JSON.stringify(
        {
          images: [{ filename: `${i.name}.svg`, idiom: 'universal' }],
          info: { author: 'xcode', version: 1 },
          properties: {
            'preserves-vector-representation': true,
            'template-rendering-intent': 'template',
          },
        },
        null,
        2,
      ) + '\n';
  }
  return files;
}

// Manifeste des composants : propriétés, variantes et lien Figma de chacune.
export function componentsManifest() {
  return (
    JSON.stringify(
      {
        $comment: banner,
        figmaFile,
        components: storyGroups.map((g) => ({
          id: g.id,
          name: g.name,
          props: g.props,
          stories: g.stories.map((s) => ({
            id: storyId(g.id, s.id),
            name: s.name,
            values: s.values,
            figma: s.figma ?? null,
          })),
        })),
      },
      null,
      2,
    ) + '\n'
  );
}

function write(rel: string, content: string) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content)
    return false;
  fs.writeFileSync(file, content);
  return true;
}

export function generate() {
  const tokens = readTokens();
  const icons = readIcons();
  const web = webTokens(tokens);
  const svgOf = (name: string) =>
    fs.readFileSync(path.join(root, 'assets/icons', `${name}.svg`), 'utf8');
  const outputs: Record<string, string> = {
    'src/web/generated/tokens.ts': web.ts,
    'src/web/generated/tokens.css': web.css,
    'src/web/generated/icons.ts': webIcons(icons),
    'Sources/Desys/Generated/Tokens.swift': swiftTokens(tokens),
    'Sources/Desys/Generated/Icons.swift': swiftIcons(icons),
    'components/components.json': componentsManifest(),
    ...Object.fromEntries(
      Object.entries(xcassets(icons, svgOf)).map(([k, v]) => [
        `Sources/Desys/Resources/${k}`,
        v,
      ]),
    ),
  };
  // Imagesets d'icônes retirées du manifeste : supprimés pour rester iso.
  const catalog = path.join(root, 'Sources/Desys/Resources/Assets.xcassets');
  if (fs.existsSync(catalog))
    for (const dir of fs.readdirSync(catalog))
      if (
        dir.endsWith('.imageset') &&
        !icons.some((i) => dir === `desys-${i.name}.imageset`)
      )
        fs.rmSync(path.join(catalog, dir), { recursive: true });
  const changed = Object.entries(outputs)
    .filter(([rel, content]) => write(rel, content))
    .map(([rel]) => rel);
  return { tokens: Object.keys(tokens).length, icons: icons.length, changed };
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const result = generate();
  console.log(
    `${result.tokens} tokens, ${result.icons} icônes. ${result.changed.length ? `Fichiers mis à jour :\n  ${result.changed.join('\n  ')}` : 'Aucun changement.'}`,
  );
}
