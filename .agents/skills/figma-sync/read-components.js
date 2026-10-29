// Lecture seule, à passer tel quel à use_figma sur PFE – Components. Liste les
// composants et leurs variantes (nœud, clé). Rend le relevé attendu par
// `npm run figma:components`.
const page = figma.currentPage;
const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
const singles = page
  .findAllWithCriteria({ types: ['COMPONENT'] })
  .filter((c) => c.parent?.type !== 'COMPONENT_SET');
const components = [
  ...sets.map((s) => ({
    name: s.name,
    node: s.id,
    key: s.key,
    variants: s.children.map((c) => ({ name: c.name, node: c.id, key: c.key })),
  })),
  ...singles.map((c) => ({
    name: c.name,
    node: c.id,
    key: c.key,
    variants: [{ name: c.name, node: c.id, key: c.key }],
  })),
];
return JSON.stringify({
  fileKey: figma.fileKey,
  readAt: new Date().toISOString(),
  components,
});
