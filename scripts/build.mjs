import { readFile, mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { policies } from '../content/policies.mjs';
const config = JSON.parse(await readFile(new URL('../content/site.json', import.meta.url), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
if (config.email && !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(config.email)) throw new Error('Invalid contact email');
const ready = Boolean(config.operator && config.email && config.policyVerified);
const pages = policies({ operator: escape(config.operator), email: escape(config.email) });
const contact = config.email ? `mailto:${escape(config.email)}` : '/policy-privacy#changes';
const draft = ready ? '' : '<div class="draft" role="note"><strong>Policy preview.</strong> Operator details and data-handling practices are awaiting verification before publication.</div>';
const cssName = `styles.${createHash('sha256').update(await readFile('public/styles.css')).digest('hex').slice(0, 12)}.css`;
const brand = '<a class="brand" href="/" aria-label="Usora home"><img class="brand-icon" src="/usora-icon-transparent.png" width="44" height="44" alt=""><img class="brand-wordmark" src="/usora-wordmark.webp" width="822" height="185" alt="Usora"></a>';
function shell(title, description, path, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} · Usora</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#fff7fa">${ready ? '' : '<meta name="robots" content="noindex, nofollow">'}<link rel="canonical" href="${escape(config.origin + path)}"><meta property="og:title" content="${escape(title)} · Usora"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${escape(config.origin + path)}"><link rel="icon" type="image/png" href="/usora-icon-transparent.png"><link rel="stylesheet" href="/${cssName}"><script src="/site.js" defer></script></head><body><a class="skip" href="#main">Skip to content</a><div class="container"><header class="site-header">${brand}<nav aria-label="Main navigation"><a href="/policy-privacy">Privacy & terms</a><a class="contact-link" href="${contact}">Get in touch <span aria-hidden="true">↗</span></a></nav></header>${body}<footer class="footer"><span>© 2026 Usora. A space for two.</span><div class="footer-links"><a href="/policy-privacy">Privacy</a><a href="/policy-terms">Terms</a><a href="/policy-deletion">Data deletion</a></div></footer></div></body></html>`;
}
await rm('dist', { recursive:true, force:true });
await mkdir('dist', { recursive:true });
await cp('public','dist',{recursive:true});
await cp('public/styles.css', `dist/${cssName}`);
for (const page of pages) {
  const tabs = pages.map(p => `<a href="/${p.slug}"${p.slug === page.slug ? ' aria-current="page"' : ''}>${p.label}</a>`).join('');
  const contents = page.sections.map(([id,title],i) => `<a href="#${id}">${String(i+1).padStart(2,'0')} &nbsp; ${title}</a>`).join('');
  const sections = page.sections.map(([id,title,html],i) => `<section id="${id}" aria-labelledby="heading-${id}"><h2 id="heading-${id}"><span class="section-number">${String(i+1).padStart(2,'0')}</span>${title}</h2>${html}</section>`).join('');
  const words = page.sections.map(s=>s[2]).join(' ').replace(/<[^>]+>/g,' ').split(/\s+/).length;
  const body = `<main id="main"><div class="hero"><div class="eyebrow">${page.eyebrow}</div><h1>${page.title}</h1><p>${page.description}</p><div class="meta"><span>${page.label}</span><span class="dot" aria-hidden="true"></span><span>Effective ${escape(config.effectiveDate)}</span><span class="dot" aria-hidden="true"></span><span>${Math.ceil(words/220)} min read</span></div><div class="hero-art" aria-hidden="true"><svg viewBox="0 0 80 80"><path d="M40 7 65 17v21c0 17-15 28-25 34C30 66 15 55 15 38V17Z"/><path d="M40 48s-14-8-14-17c0-8 11-10 14-2 3-8 14-6 14 2 0 9-14 17-14 17Z"/></svg></div></div><nav class="policy-tabs" aria-label="Policy pages">${tabs}</nav>${draft}<div class="policy-layout"><aside class="sidebar" aria-label="On this page"><div class="sidebar-inner"><p class="sidebar-title">ON THIS PAGE</p><nav class="contents" aria-label="Table of contents">${contents}</nav><div class="sidebar-note">A question about your data?<br><a href="${contact}">We’re here to help ↗</a></div><button class="print-button" type="button" data-print>Print or save as PDF ↗</button></div></aside><article class="article" aria-label="${page.label}"><div class="summary-card"><div class="eyebrow">AT A GLANCE</div><h2>${page.summaryTitle}</h2><p>${page.summary}</p></div>${sections}<div class="contact-card"><div class="eyebrow">LET’S KEEP IT CLEAR</div><h2>Questions? We’re here.</h2><p>For help with your account or a question about your information, reach out to the Usora team.</p><a href="${contact}">${config.email ? escape(config.email) : 'View contact options'} ↗</a></div></article></div></main>`;
  await writeFile(`dist/${page.slug}.html`, shell(page.label, page.description, `/${page.slug}`, body));
}
await writeFile('dist/index.html',shell('A space for two','Shared moments, meaningful conversations, and a little more connection. Welcome to Usora.','/',`<main id="main"><section class="home-hero"><div class="eyebrow">A SPACE FOR TWO</div><h1>Little moments.<br><em>Closer together.</em></h1><p>A place for your memories, thoughtful conversations, and everyday connection. Made for you and your person.</p><a class="button" href="/policy-privacy">Explore our privacy policy <span aria-hidden="true">↗</span></a></section>${draft}<div class="cards"><section class="card"><div class="eyebrow">01 / YOUR PRIVACY</div><h2>Personal moments.<br>Clear choices.</h2><p>Understand how your information helps Usora work, and how you can manage it.</p><a href="/policy-privacy">Privacy Policy ↗</a></section><section class="card"><div class="eyebrow">02 / OUR AGREEMENT</div><h2>A little respect.<br>A better space.</h2><p>Simple expectations for using Usora, sharing content, and managing purchases.</p><a href="/policy-terms">Terms of Service ↗</a></section><section class="card"><div class="eyebrow">03 / YOUR CONTROL</div><h2>Your next chapter.<br>Your decision.</h2><p>Find your options for removing content and requesting account and data deletion.</p><a href="/policy-deletion">Account & Data Deletion ↗</a></section></div></main>`));
await writeFile('dist/404.html',shell('Page not found','This page could not be found.','/404', '<main id="main" class="home-hero"><div class="eyebrow">404 / PAGE NOT FOUND</div><h1>A little off course.</h1><p>The page you’re looking for isn’t here.</p><a class="button" href="/">Back to Usora</a></main>'));
await writeFile('dist/robots.txt',`User-agent: *\n${ready ? 'Allow: /' : 'Disallow: /'}\n${ready ? `Sitemap: ${config.origin}/sitemap.xml\n` : ''}`);
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['',...pages.map(p=>p.slug)].map(path=>`<url><loc>${escape(config.origin)}/${path}</loc></url>`).join('')}</urlset>`);
console.log(`Built home, 3 policy pages, and 404. Publication status: ${ready ? 'verified' : 'preview — missing verified operator / policy details'}.`);

// Embed the small static route set in the script so policy tabs work instantly,
// including offline after initial load, without loosening connect-src in CSP.
const routePages = {};
for (const route of ['', ...pages.map(page => page.slug)]) {
  const html = await readFile(`dist/${route || 'index'}.html`, 'utf8');
  routePages[`/${route}`] = { html, title: html.match(/<title>(.*?)<\/title>/)[1] };
}
const script = `const routePages = ${JSON.stringify(routePages)};\n${await readFile('public/site.js', 'utf8')}`;
const scriptName = `site.${createHash('sha256').update(script).digest('hex').slice(0, 12)}.js`;
await writeFile(`dist/${scriptName}`, script);
for (const file of ['index', '404', ...pages.map(page => page.slug)]) {
  const path = `dist/${file}.html`;
  await writeFile(path, (await readFile(path, 'utf8')).replace('src="/site.js"', `src="/${scriptName}"`));
}
