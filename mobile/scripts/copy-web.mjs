// Copies the website files (one folder up) into mobile/www, which is what gets
// bundled inside the iPhone app. Run automatically by "npm run ios" / "npm run sync".
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..', '..');      // the website folder
const www = join(here, '..', 'www');      // what goes into the app

const files = [
  'index.html', 'marathon_rhino.html',
  'privacy.html', 'terms.html', 'support.html', 'legal.css',
];
const folders = ['js', 'icons', 'branding'];

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
for (const f of files) {
  if (!existsSync(join(site, f))) throw new Error('Missing website file: ' + f);
  cpSync(join(site, f), join(www, f));
}
for (const d of folders) cpSync(join(site, d), join(www, d), { recursive: true });
console.log('Copied the website into mobile/www (' + (files.length) + ' files + ' + folders.join(', ') + ')');
