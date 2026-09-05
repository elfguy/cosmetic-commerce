import { writeFile } from 'node:fs/promises';
import { ownerMarkdown } from '../src/data/metaOwnerGuide.mjs';
await writeFile(new URL('../docs/35-meta-owner-setup-guide.md', import.meta.url), ownerMarkdown());
console.log('Updated representative setup document.');
