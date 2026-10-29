// Lecture seule, à passer tel quel à use_figma sur PFE – Assets. Exporte en SVG
// les composants « Icône/… » de la page Icônes. Rend le relevé attendu par
// `npm run figma:assets`.
const page = figma.root.children.find((p) => p.name === 'Icônes');
if (!page) throw new Error('Page « Icônes » introuvable dans PFE – Assets.');
await figma.setCurrentPageAsync(page);
const nodes = page
  .findAllWithCriteria({ types: ['COMPONENT'] })
  .filter((n) => n.name.startsWith('Icône/'));
const icons = [];
for (const node of nodes) {
  icons.push({
    name: node.name,
    node: node.id,
    key: node.key,
    description: node.description,
    svg: await node.exportAsync({ format: 'SVG_STRING' }),
  });
}
return JSON.stringify({
  fileKey: figma.fileKey,
  readAt: new Date().toISOString(),
  icons,
});
