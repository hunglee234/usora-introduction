// routePages is bundled into this file at build time: navigation needs no fetch.
let observer;
let currentPath = location.pathname;
let entryId = 0;
const scrollPositions = new Map();
function enhancePage() {
  observer?.disconnect();
  const links = [...document.querySelectorAll('.contents a')];
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links) {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      }
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('article section[id]').forEach(section => observer.observe(section));
  }
}
function saveScroll() { scrollPositions.set(entryId, [scrollX, scrollY]); }
function restoreScroll(position) {
  window.scrollTo({ left: position[0], top: position[1], behavior: 'instant' });
}
function render(url, { fromTab = false, position } = {}) {
  const page = routePages[url.pathname];
  if (!page) return false;
  if (url.pathname !== currentPath) {
    const incoming = new DOMParser().parseFromString(page.html, 'text/html');
    document.querySelector('main').replaceWith(incoming.querySelector('main'));
    document.title = page.title;
    for (const selector of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'link[rel="canonical"]']) {
      document.querySelector(selector)?.replaceWith(incoming.querySelector(selector));
    }
    currentPath = url.pathname;
    enhancePage();
  }
  const focus = fromTab ? document.querySelector('.policy-tabs [aria-current="page"]') : document.querySelector('h1');
  if (focus) { if (!fromTab) focus.setAttribute('tabindex', '-1'); focus.focus({ preventScroll: true }); }
  if (position) restoreScroll(position);
  else if (url.hash) {
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { id = url.hash.slice(1); }
    const target = document.getElementById(id);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  } else restoreScroll([0, 0]);
  return true;
}
enhancePage();
if (typeof routePages !== 'undefined') {
  history.scrollRestoration = 'manual';
  history.replaceState({ ...history.state, usoraEntry: entryId }, '');
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !routePages[url.pathname] || url.search) return;
    event.preventDefault();
    if (url.href === location.href) return;
    const fromTab = Boolean(link.closest('.policy-tabs'));
    const position = fromTab ? [scrollX, scrollY] : undefined;
    saveScroll();
    entryId = Math.max(Date.now(), entryId + 1);
    history.pushState({ usoraEntry: entryId }, '', url);
    render(url, { fromTab, position });
  });
  window.addEventListener('popstate', event => {
    saveScroll();
    entryId = event.state?.usoraEntry ?? Date.now();
    if (event.state?.usoraEntry == null) history.replaceState({ ...event.state, usoraEntry: entryId }, '');
    const url = new URL(location.href);
    if (!render(url, { position: url.hash ? undefined : scrollPositions.get(entryId) })) location.reload();
  });
}
document.addEventListener('click', event => {
  if (event.target.closest('[data-print]')) window.print();
});
