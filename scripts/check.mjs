import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const files=['index','policy-privacy','policy-terms','policy-deletion','404'];
for (const file of files) {
  const html=await readFile(`dist/${file}.html`,'utf8');
  assert(html.includes('<html lang="en">'), `${file}: English language required`);
  assert.equal((html.match(/<h1>/g)||[]).length,1,`${file}: one page heading`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,`${file}: duplicate anchor`);
  for (const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (href.startsWith('#')) assert(ids.includes(href.slice(1)),`${file}: broken ${href}`);
    else if (href.startsWith('/')) {
      const [pathname,anchor]=href.split('#');
      const target=pathname==='/'?'index.html':pathname.slice(1)+(pathname.includes('.')?'':'.html');
      await access(`dist/${target}`);
      if(anchor) assert((await readFile(`dist/${target}`,'utf8')).includes(`id="${anchor}"`),`Missing ${href}`);
    }
  }
}
const firebase=JSON.parse(await readFile('firebase.json','utf8'));
assert.equal(firebase.hosting.public,'dist');
assert.equal(firebase.hosting.cleanUrls,true);
assert(!firebase.hosting.rewrites,'Do not hide missing pages behind a catch-all');
console.log('Verified page structure, unique IDs, local assets, all internal links and section anchors, and Hosting routes.');
