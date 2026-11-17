// Relatório de veracidade: lista cada dado com selo e fontes e destaca o que NÃO é confirmado oficialmente.
// Uso: node scripts/data-report.mjs  →  imprime o resumo e grava research/DATA-REPORT.md
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'src/data');
const sources = new Map(JSON.parse(readFileSync(path.join(dir, 'sources.json'), 'utf8')).sources.map((s) => [s.id, s]));
const rows = [];
const label = (o) => o.title || o.name || o.label || o.q || o.text || o.platform || o.system || o.game || '';
function walk(file, node, p = []) {
  if (Array.isArray(node)) return node.forEach((v, i) => walk(file, v, [...p, i]));
  if (!node || typeof node !== 'object') return;
  const statusKeys = Object.keys(node).filter((k) => /status$/i.test(k) && ['confirmado', 'reportado', 'rumor'].includes(node[k]));
  for (const sk of statusKeys) {
    const prefix = sk.replace(/status$/i, '');
    const srcKey = prefix ? `${prefix}Sources` : 'sources';
    const ids = node[srcKey] ?? node.sources ?? [];
    rows.push({ file, path: p.join('.') + (prefix ? `.${prefix}` : ''), what: String(label(node)).slice(0, 90), status: node[sk], sources: ids.map((id) => sources.get(id)?.publisher ?? `??${id}`) });
  }
  for (const [k, v] of Object.entries(node)) if (typeof v === 'object') walk(file, v, [...p, k]);
}
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json') && !['sources.json', 'images.manifest.json'].includes(f))) {
  walk(f, JSON.parse(readFileSync(path.join(dir, f), 'utf8')));
}
const count = (s) => rows.filter((r) => r.status === s).length;
const lines = [
  '# Relatório de dados (gerado por scripts/data-report.mjs)', '',
  `Total de dados com selo: **${rows.length}** · CONFIRMADO: **${count('confirmado')}** · REPORTADO: **${count('reportado')}** · RUMOR: **${count('rumor')}**`, '',
  '## Dados NÃO confirmados por fonte oficial (REPORTADO ou RUMOR)', '',
  '| Selo | Arquivo | Item | Fontes |', '|---|---|---|---|',
  ...rows.filter((r) => r.status !== 'confirmado').map((r) => `| ${r.status.toUpperCase()} | ${r.file} → ${r.path} | ${r.what.replace(/\|/g, '/')} | ${r.sources.join(', ')} |`),
  '', '## Todos os dados', '', '| Selo | Arquivo | Item | Fontes |', '|---|---|---|---|',
  ...rows.map((r) => `| ${r.status} | ${r.file} → ${r.path} | ${r.what.replace(/\|/g, '/')} | ${r.sources.join(', ')} |`),
];
writeFileSync(path.join(root, 'research/DATA-REPORT.md'), lines.join('\n') + '\n');
console.log(`${rows.length} dados com selo — confirmado: ${count('confirmado')}, reportado: ${count('reportado')}, rumor: ${count('rumor')}`);
console.log('Relatório completo em research/DATA-REPORT.md');
