// Logique de synchro Figma ↔ dépôt, sans accès réseau ni fichier : les relevés
// viennent des scripts de .agents/skills/figma-sync (MCP Figma, Claude Code).
import { parseIcon } from './generate.js';

type Token = {
  $type: 'color' | 'dimension' | 'fontFamily';
  $value: string | number;
};
type Tokens = Record<string, Token>;

// --- Tokens (PFE – Tokens, collection Semantics) ---------------------------
export type TokensDump = {
  fileKey: string;
  collection: string;
  readAt: string;
  variables: { name: string; type: string; value: string | number | boolean }[];
};
// Seul écart volontaire de valeur : la police système iOS s'appelle SF Pro dans Figma.
const fontFromFigma: Record<string, string> = { 'SF Pro': 'system-ui' };
const fontToFigma: Record<string, string> = { 'system-ui': 'SF Pro' };
const keyOf = (name: string) => name.replace('/', '.');
const nameOf = (key: string) => key.replace('.', '/');

export function tokensFromFigma(dump: TokensDump): Tokens {
  const out: Tokens = {};
  for (const v of dump.variables) {
    const key = keyOf(v.name);
    if (!/^(color|font|space|radius)\.[a-zA-Z]+$/.test(key))
      throw new Error(`Variable Figma hors contrat : ${v.name}.`);
    if (v.type === 'COLOR')
      out[key] = { $type: 'color', $value: String(v.value).toUpperCase() };
    else if (v.type === 'FLOAT')
      out[key] = { $type: 'dimension', $value: Number(v.value) };
    else if (v.type === 'STRING')
      out[key] = {
        $type: 'fontFamily',
        $value: fontFromFigma[String(v.value)] ?? String(v.value),
      };
    else throw new Error(`${v.name} : type ${v.type} non pris en charge.`);
  }
  return out;
}

export type TokenChange = {
  key: string;
  from: Token['$value'] | null;
  to: Token['$value'] | null;
};
export function tokensDiff(before: Tokens, after: Tokens): TokenChange[] {
  const keys = [
    ...new Set([...Object.keys(before), ...Object.keys(after)]),
  ].sort();
  return keys
    .filter((k) => before[k]?.$value !== after[k]?.$value)
    .map((k) => ({
      key: k,
      from: before[k]?.$value ?? null,
      to: after[k]?.$value ?? null,
    }));
}

// Dépôt → Figma : uniquement les variables dont la valeur diffère (apply-tokens.js).
export function tokensPlan(repo: Tokens, dump: TokensDump) {
  const figmaTokens = tokensFromFigma(dump);
  return tokensDiff(figmaTokens, repo)
    .filter((c) => c.to !== null)
    .map((c) => {
      const t = repo[c.key];
      const to =
        t.$type === 'fontFamily'
          ? (fontToFigma[String(t.$value)] ?? t.$value)
          : t.$value;
      return {
        name: nameOf(c.key),
        type:
          t.$type === 'color'
            ? 'COLOR'
            : t.$type === 'dimension'
              ? 'FLOAT'
              : 'STRING',
        from: c.from,
        to,
      };
    });
}

// --- Assets (PFE – Assets, page Icônes) -------------------------------------
export type FigmaRef = { node: string; key: string };
export type AssetEntry = {
  name: string;
  label: string;
  usage: string;
  figma: FigmaRef | null;
};
export type AssetsDump = {
  fileKey: string;
  readAt: string;
  icons: {
    name: string;
    node: string;
    key: string;
    description?: string;
    svg: string;
  }[];
};

export const slug = (label: string) =>
  label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// SVG canonique du dépôt : 24×24, tracés seuls, trait currentColor.
export function canonicalSvg(name: string, svg: string) {
  const icon = parseIcon(name, name, svg);
  const paths = icon.paths.map((d) => `<path d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${icon.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>\n`;
}

// Figma → dépôt : une icône Figma « Icône/<Libellé> » devient assets/icons/<nom>.svg.
// Une icône du dépôt absente de Figma reste (elle n'a juste pas de lien Figma).
export function assetsFromFigma(dump: AssetsDump, manifest: AssetEntry[]) {
  const entries = manifest.map((e) => ({ ...e }));
  const files: Record<string, string> = {};
  for (const icon of dump.icons) {
    const label = icon.name.replace(/^Icône\//, '').trim();
    const existing = entries.find((e) => e.label === label);
    const name = existing?.name ?? slug(label);
    files[name] = canonicalSvg(name, icon.svg);
    const ref = { node: icon.node, key: icon.key };
    if (existing) existing.figma = ref;
    else
      entries.push({
        name,
        label,
        usage: icon.description || label,
        figma: ref,
      });
  }
  return { entries, files };
}

// Dépôt → Figma : les icônes sans lien Figma, à créer avec push-assets.js.
export function assetsPush(
  manifest: AssetEntry[],
  svgOf: (name: string) => string,
  fileKey: string,
) {
  return {
    fileKey,
    icons: manifest
      .filter((e) => !e.figma)
      .map((e) => ({
        name: e.name,
        label: e.label,
        usage: e.usage,
        svg: svgOf(e.name),
      })),
  };
}

// --- Composants (PFE – Components) ------------------------------------------
export type ComponentsDump = {
  fileKey: string;
  readAt: string;
  components: {
    name: string;
    node: string;
    key: string;
    variants: { name: string; node: string; key: string }[];
  }[];
};
type StoryRef = { id: string; figma?: FigmaRef };

// Le code est la source des composants : on signale les écarts, on n'écrit rien.
export function componentsCheck(dump: ComponentsDump, stories: StoryRef[]) {
  const variants = dump.components.flatMap((c) =>
    c.variants.map((v) => ({ ...v, component: c.name })),
  );
  const byNode = new Map(variants.map((v) => [v.node, v]));
  const missing = stories
    .filter((s) => s.figma && !byNode.has(s.figma.node))
    .map((s) => s.id);
  const changedKey = stories
    .filter(
      (s) =>
        s.figma &&
        byNode.has(s.figma.node) &&
        byNode.get(s.figma.node)!.key !== s.figma.key,
    )
    .map((s) => s.id);
  const used = new Set(stories.map((s) => s.figma?.node));
  const unmapped = variants
    .filter((v) => !used.has(v.node))
    .map((v) => `${v.component} · ${v.name}`);
  return {
    missing,
    changedKey,
    unmapped,
    aligned: !missing.length && !changedKey.length && !unmapped.length,
  };
}
