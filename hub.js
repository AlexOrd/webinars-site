/* Renders the webinar list (textContent only). Runs before dos-kit.js enhances the file list. */
(function () {
  const list = (window.WEBINARS || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const fmt = d => d.split('-').reverse().join('.');
  const status = w => {
    const d = new Date(w.date + 'T00:00:00');
    if (d > today) return ['Скоро', 'soon'];
    if (d.getTime() === today.getTime()) return ['Наживо', 'live'];
    return ['Матеріали', 'past'];
  };
  const rows = document.getElementById('rows'), cards = document.getElementById('cards');
  list.forEach((w, i) => {
    const [st, cls] = status(w);
    const tr = el('tr'); tr.dataset.href = w.url; if (i === 0) tr.setAttribute('aria-selected', 'true');
    const a = el('a'); a.href = w.url; a.dataset.track = 'hub_open'; a.dataset.trackLabel = w.title;
    a.append(el('span', 'name', w.file), document.createTextNode(' '), el('span', 'ext', '.' + w.ext));
    const td1 = el('td'); td1.appendChild(a);
    tr.append(td1, el('td', 'label', w.title), el('td', 'col-date', fmt(w.date)), el('td', 'st ' + cls, st));
    tr.addEventListener('click', e => { if (!e.target.closest('a')) location.href = w.url; });
    rows.appendChild(tr);

    const c = el('article', 'dos-panel card');
    c.appendChild(el('span', 'dos-panel-title', fmt(w.date) + ' · ' + st));
    c.appendChild(el('h2', 'no-rule', w.title));
    if (w.event) c.appendChild(el('p', 'muted', w.event));
    c.appendChild(el('p', '', w.about));
    const go = el('a', 'dos-btn ' + (cls === 'past' ? 'primary' : 'accent'), cls === 'past' ? 'Матеріали' : 'Сторінка вебінару');
    go.href = w.url; go.dataset.track = 'hub_open'; go.dataset.trackLabel = w.title; c.appendChild(go);
    cards.appendChild(c);
  });
  document.getElementById('count').textContent = list.length + ' вебінар(ів)';
})();
