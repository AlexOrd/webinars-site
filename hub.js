/* Renders the webinar list (textContent only). Runs before dos-kit.js enhances the file list.
   Order = order in webinars.js (newest first). No dates: materials stay timeless. */
(function () {
  const list = window.WEBINARS || [];
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const rows = document.getElementById('rows'), cards = document.getElementById('cards');
  list.forEach((w, i) => {
    const tr = el('tr'); tr.dataset.href = w.url; if (i === 0) tr.setAttribute('aria-selected', 'true');
    const a = el('a'); a.href = w.url; a.dataset.track = 'hub_open'; a.dataset.trackLabel = w.title;
    a.append(el('span', 'name', w.file), document.createTextNode(' '), el('span', 'ext', '.' + w.ext));
    const td1 = el('td'); td1.appendChild(a);
    tr.append(td1, el('td', 'label', w.title), el('td', 'col-date', (w.tags || []).join(' · ')));
    tr.addEventListener('click', e => { if (!e.target.closest('a')) location.href = w.url; });
    rows.appendChild(tr);

    const c = el('article', 'dos-panel card');
    c.appendChild(el('span', 'dos-panel-title', (w.tags || []).join(' · ') || 'Майстер-клас'));
    c.appendChild(el('h2', 'no-rule', w.title));
    c.appendChild(el('p', '', w.about));
    const go = el('a', 'dos-btn primary', 'Матеріали'); go.href = w.url; go.dataset.track = 'hub_open'; go.dataset.trackLabel = w.title;
    c.appendChild(go);
    cards.appendChild(c);
  });
  document.getElementById('count').textContent = list.length + ' майстер-клас(ів)';
})();
