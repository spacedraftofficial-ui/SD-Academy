import fs from 'fs';

const master = JSON.parse(fs.readFileSync('master_registry_compiled.json', 'utf8'));

const jsContent = `/* ============================================================
   SD Academy — Master Organizational Hierarchy & Handbook Catalog
   Extracted from Excel Governance Registers (Data/*.xlsx)
   Source of Truth for Organizations, Access Matrices, & Validation
   ============================================================ */

window.SD_ORG_DATA = ${JSON.stringify(master, null, 2)};
`;

fs.writeFileSync('client/js/org-master-data.js', jsContent);
console.log('client/js/org-master-data.js generated successfully! Handbooks:', master.handbooks.length);
