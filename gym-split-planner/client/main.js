const DATA_URL  = '/exercises.json'; // served from client/public
const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const qEl = document.getElementById('q');
const muscleEl = document.getElementById('muscle');
const listEl = document.getElementById('list');

let all = [];

async function init() {
  const res = await fetch(DATA_URL);
  const raw = await res.json();

  // normalize a tiny bit for easier use
  all = raw.map(x => ({
    id: x.id,
    name: x.name,
    primary: x.primaryMuscles || [],
    secondary: x.secondaryMuscles || [],
    equipment: x.equipment || '',
    images: (x.images || []).map(p => IMAGE_BASE + p)
  }));

  fillMuscles(all);
  render(all.slice(0, 100)); // initial render
}

function fillMuscles(items) {
  const set = new Set();
  items.forEach(x => {
    x.primary.forEach(m => set.add(m));
    x.secondary.forEach(m => set.add(m));
  });
  [...set].sort().forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m[0].toUpperCase() + m.slice(1);
    muscleEl.appendChild(opt);
  });
}

function applyFilters() {
  const term = qEl.value.trim().toLowerCase();
  const muscle = muscleEl.value.toLowerCase();

  const filtered = all.filter(x => {
    const nameOK = !term || x.name.toLowerCase().includes(term);
    const muscles = x.primary.concat(x.secondary).map(s => s.toLowerCase());
    const muscleOK = !muscle || muscles.includes(muscle);
    return nameOK && muscleOK;
  });

  render(filtered.slice(0, 150));
}

function render(items) {
  listEl.innerHTML = items.map(x => `
    <li style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;">
      <div style="font-weight:600;margin-bottom:6px;">${x.name}</div>
      <div style="font-size:12px;color:#555;margin-bottom:8px;">
        <b>Primary:</b> ${x.primary.join(', ') || '—'}
        ${x.equipment ? ` &nbsp; <b>Equipment:</b> ${x.equipment}` : ''}
      </div>
      ${x.images[0] ? `<img src="${x.images[0]}" alt="${x.name}" width="220" loading="lazy">` : ''}
    </li>
  `).join('');
}

qEl.addEventListener('input', applyFilters);
muscleEl.addEventListener('change', applyFilters);

init();
