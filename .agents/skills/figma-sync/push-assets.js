// Écriture, à passer à use_figma sur PFE – Assets UNIQUEMENT après accord explicite
// sur la liste affichée. Remplacer le marqueur de `const PLAN` par le contenu de
// figma/private/assets-push.json (sortie de `npm run figma:assets -- --push`).
// Crée, sur la page « Icônes », un composant 24×24 « Icône/<Libellé> » par icône
// absente ; ne modifie ni ne supprime jamais une icône existante.
// Avec "dryRun": true, rien n'est écrit : le script rend ce qu'il ferait.
const PLAN = __PLAN__;
const DRY = PLAN.dryRun === true;
if (PLAN.fileKey !== figma.fileKey)
  throw new Error(
    `Fichier inattendu : ${figma.fileKey} au lieu de ${PLAN.fileKey}.`,
  );
let page = figma.root.children.find((p) => p.name === 'Icônes');
if (!page && !DRY) {
  page =
    figma.root.children.length === 1 &&
    figma.root.children[0].children.length === 0
      ? figma.root.children[0]
      : figma.createPage();
  page.name = 'Icônes';
}
if (page) await figma.setCurrentPageAsync(page);
const existing = new Set(
  page
    ? page.findAllWithCriteria({ types: ['COMPONENT'] }).map((n) => n.name)
    : [],
);
const report = [];
const created = [];
let x = 0;
for (const icon of PLAN.icons) {
  const name = `Icône/${icon.label}`;
  if (existing.has(name)) {
    report.push(`${name} : déjà présente, inchangée`);
    continue;
  }
  report.push(`${name} : créée depuis assets/icons/${icon.name}.svg`);
  if (DRY) continue;
  const frame = figma.createNodeFromSvg(icon.svg);
  const component = figma.createComponentFromNode(frame);
  component.name = name;
  component.description = `${icon.usage}. desys : assets/icons/${icon.name}.svg`;
  component.resize(24, 24);
  component.x = x;
  component.y = 0;
  x += 56;
  created.push({ name: icon.name, node: component.id, key: component.key });
}
return JSON.stringify({ dryRun: DRY, report, created });
