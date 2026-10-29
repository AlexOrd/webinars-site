// ordynski-dos-kit — put public config values into a built site at deploy time.
// Values come from environment variables (GitHub → Settings → Secrets and variables → Actions → Variables),
// so links and IDs live in GitHub, not in the repo files.
//
//   node kit/tools/inject-config.mjs dist        // rewrites dist/masterclass.js and dist/kit/series.js
//
// Variables (all optional; empty or invalid = keep what the file has):
//   MC_BOT  MC_CHANNEL  MC_FEEDBACK  MC_POLL_ENDPOINT                      → window.MC (this masterclass)
//   GA4_ID  SOCIAL_LINKEDIN  SOCIAL_GITHUB  SOCIAL_TELEGRAM  SOCIAL_FACEBOOK  SOCIAL_YOUTUBE  SOCIAL_INSTAGRAM
//                                                                        → window.DOS_SERIES (whole series)
// Public values only. Tokens and API keys never go here — they live in Apps Script → Script Properties.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const MC_VARS = { bot: 'MC_BOT', channel: 'MC_CHANNEL', feedback: 'MC_FEEDBACK', pollEndpoint: 'MC_POLL_ENDPOINT' };
export const SOCIALS = ['LinkedIn', 'GitHub', 'Telegram', 'Facebook', 'YouTube', 'Instagram'];
export const socialVar = label => 'SOCIAL_' + label.toUpperCase();

export const tme = v => (/^@?[A-Za-z0-9_]{4,}$/.test(v) ? 'https://t.me/' + v.replace(/^@/, '') : v);
export const CHECK = {
  url: Object.assign(v => /^https:\/\/\S+$/.test(v), { msg: 'має починатися з https://' }),
  exec: Object.assign(v => /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(v), { msg: 'потрібна адреса виду https://script.google.com/macros/s/…/exec (без ?poll)' }),
  ga: Object.assign(v => /^G-[A-Z0-9]{4,}$/.test(v), { msg: 'формат G-XXXXXXX' }),
};
export const RULES = {
  bot: { norm: tme, check: CHECK.url }, channel: { norm: tme, check: CHECK.url }, feedback: { check: CHECK.url },
  pollEndpoint: { norm: v => v.replace(/\?.*$/, ''), check: CHECK.exec }, ga4: { check: CHECK.ga },
  Telegram: { norm: tme, check: CHECK.url },
};
export const clean = (key, v) => {
  v = String(v ?? '').trim(); if (!v) return '';
  const r = RULES[key] || { check: CHECK.url };
  if (r.norm) v = r.norm(v);
  return !r.check || r.check(v) ? v : null;   // null = invalid
};

const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

export function setMc(src, values) {
  for (const [k, v] of Object.entries(values)) if (v) src = src.replace(new RegExp(`(\\n\\s*${k}:\\s*)'(?:[^'\\\\]|\\\\.)*'`), `$1${q(v)}`);
  return src;
}
export function setSeries(src, { ga4, socials }) {
  if (ga4) src = src.replace(/(\n\s*ga4:\s*)'[^']*'/, `$1${q(ga4)}`);
  if (socials) src = src.replace(/socials:\s*\[[\s\S]*?\n\s*\],/, 'socials: [\n' + socials.map(s => `    { label: ${q(s.label)}, url: ${q(s.url)} },`).join('\n') + '\n  ],');
  return src;
}
export function readSocials(src) {
  const m = src.match(/socials:\s*\[([\s\S]*?)\n\s*\],/); if (!m) return [];
  return [...m[1].matchAll(/label:\s*'((?:[^'\\]|\\.)*)',\s*url:\s*'((?:[^'\\]|\\.)*)'/g)].map(x => ({ label: x[1], url: x[2] }));
}
export function mergeSocials(current, byLabel) {
  const out = [];
  for (const label of SOCIALS) {
    const v = byLabel[label];
    if (v === '') continue;                                  // explicitly cleared
    const url = v || (current.find(s => s.label === label) || {}).url;
    if (url && !/YOUR_/.test(url)) out.push({ label, url });
  }
  for (const s of current) if (!SOCIALS.includes(s.label) && !/YOUR_/.test(s.url)) out.push(s);
  return out;
}

export function inject(dir, env = process.env, log = console.log) {
  const warn = (n, v) => log(`  ! ${n}: значення «${v}» має неправильний формат — пропущено`);
  const mcFile = path.join(dir, 'masterclass.js');
  if (fs.existsSync(mcFile)) {
    const vals = {};
    for (const [k, n] of Object.entries(MC_VARS)) { const v = clean(k, env[n]); if (v === null) warn(n, env[n]); else if (v) vals[k] = v; }
    fs.writeFileSync(mcFile, setMc(fs.readFileSync(mcFile, 'utf8'), vals));
    log(`  masterclass.js ← ${Object.keys(vals).join(', ') || '(нічого)'}`);
  }
  const sFile = path.join(dir, 'kit', 'series.js');
  if (fs.existsSync(sFile)) {
    let src = fs.readFileSync(sFile, 'utf8');
    const ga4 = clean('ga4', env.GA4_ID); if (ga4 === null) warn('GA4_ID', env.GA4_ID);
    const by = {};
    for (const l of SOCIALS) { const n = socialVar(l), v = clean(l, env[n]); if (v === null) warn(n, env[n]); else if (v) by[l] = v; }
    src = setSeries(src, { ga4: ga4 || '', socials: mergeSocials(readSocials(src), by) });
    fs.writeFileSync(sFile, src);
    log(`  series.js ← ${[ga4 && 'GA4_ID', ...Object.keys(by)].filter(Boolean).join(', ') || '(нічого)'}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: inject-config.mjs <built-site-dir>'); process.exit(2); }
  console.log('Config from environment → ' + dir);
  inject(path.resolve(dir));
}
