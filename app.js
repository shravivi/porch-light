const KEY = 'porch-light-v1';
let posts = JSON.parse(localStorage.getItem(KEY) || 'null') || [
  { id: 1, type: 'offer', title: 'Saturday soup drop-off', details: 'Cooking a big pot. Message me if you would like a portion left at your door.', area: 'Elm St.', contact: 'Door #5', done: false },
  { id: 2, type: 'need', title: 'Help carrying groceries up three flights', details: 'Tuesday or Friday mornings, about 20 minutes.', area: 'Maple Court', contact: 'Ask at the front desk', done: false },
];
const $ = s => document.querySelector(s);
const save = () => localStorage.setItem(KEY, JSON.stringify(posts));
let filter = 'all';

function node(tag, text, cls) { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; }

function render() {
  const q = $('#q').value.toLowerCase(), board = $('#board'); board.replaceChildren();
  const shown = posts.filter(p => {
    const inTab = filter === 'all' ? !p.done : filter === 'done' ? p.done : p.type === filter && !p.done;
    return inTab && [p.title, p.details, p.area].join(' ').toLowerCase().includes(q);
  });
  if (!shown.length) board.append(node('p', 'Nothing here yet. Post an offer or a need to get the board going.'));
  for (const p of shown) {
    const a = node('article', '', p.type + (p.done ? ' done' : ''));
    a.append(node('div', p.type === 'offer' ? 'Offering' : 'Needed', 'kind'), node('h3', p.title));
    if (p.details) a.append(node('p', p.details));
    a.append(node('p', `${p.area ? p.area + ' · ' : ''}Reach: ${p.contact}`));
    const act = node('div', '', 'actions');
    const d = node('button', p.done ? 'Reopen' : (p.type === 'offer' ? 'Mark taken' : 'Mark helped'));
    d.onclick = () => { p.done = !p.done; save(); render(); };
    const r = node('button', 'Delete');
    r.onclick = () => { if (confirm('Delete this post?')) { posts = posts.filter(x => x !== p); save(); render(); } };
    act.append(d, r); a.append(act); board.append(a);
  }
}
$('#add').addEventListener('submit', e => {
  e.preventDefault(); const f = e.target;
  posts.unshift({ id: Date.now(), type: f.type.value, title: f.title.value.trim(), details: f.details.value.trim(), area: f.area.value.trim(), contact: f.contact.value.trim(), done: false });
  f.reset(); save(); render();
});
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
  filter = b.dataset.f; document.querySelectorAll('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b)); render();
});
$('#q').oninput = render;
$('#print').onclick = () => window.print();
$('#export').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' }));
  a.download = 'porch-light-backup.json'; a.click();
};
$('#import').onchange = async e => {
  try {
    const d = JSON.parse(await e.target.files[0].text()); if (!Array.isArray(d)) throw 0;
    posts = d.map(x => ({ id: x.id || Date.now() + Math.random(), type: x.type === 'need' ? 'need' : 'offer', title: String(x.title || ''), details: String(x.details || ''), area: String(x.area || ''), contact: String(x.contact || ''), done: !!x.done }));
    save(); render();
  } catch { alert('That file is not a valid Porch Light backup.'); }
};
render();
