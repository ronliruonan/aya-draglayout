import { cp, mkdir, rm, access, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const legacy = new URL('docs/', root);
const modern = new URL('apps/v2/dist/', root);
const output = new URL('.pages/', root);

// Fail before replacing the staging directory if either build is missing.
await access(new URL('index.html', legacy));
await access(new URL('index.html', modern));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(legacy, output, { recursive: true });
await rm(new URL('v2/', output), { recursive: true, force: true });
await cp(modern, new URL('v2/', output), { recursive: true });
await writeFile(new URL('.nojekyll', output), '');
console.log(`Pages artifact prepared: ${fileURLToPath(output)}`);
