type DataPoint = { date: string; value: number };

function formatDate(d: Date) {
  return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

function generateData(days: number): DataPoint[] {
  const out: DataPoint[] = [];
  let v = 200 + Math.round(Math.random() * 400);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // random walk
    v = Math.max(20, Math.round(v + (Math.random() - 0.45) * 80));
    out.push({ date: formatDate(d), value: v });
  }
  return out;
}

// Assume these elements exist in the page (index.html includes them)
const canvas = document.getElementById('visitsChart') as HTMLCanvasElement;
const tooltip = document.getElementById('tooltip') as HTMLDivElement;
const visitsEl = document.getElementById('visitsStat') as HTMLElement;
const newUsersEl = document.getElementById('newUsersStat') as HTMLElement;
const conversionEl = document.getElementById('conversionStat') as HTMLElement;
const usersTableBody = document.querySelector('#usersTable tbody') as HTMLTableSectionElement;

let currentDays = 7;
let dataset = generateData(currentDays);

const ctx = canvas.getContext('2d')!;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function updateStats(data: DataPoint[]) {
  const total = data.reduce((s, p) => s + p.value, 0);
  const avg = Math.round(total / data.length);
  const newUsers = Math.round(avg * 0.12 + Math.random() * 40);
  const conv = (Math.max(0.5, Math.min(8, (newUsers / avg) * 100))).toFixed(1);
  visitsEl.textContent = total.toLocaleString('en-US');
  newUsersEl.textContent = newUsers.toLocaleString('en-US');
  conversionEl.textContent = `${conv}%`;
}

function drawGrid(margin: number, w: number, h: number) {
  ctx.strokeStyle = '#eef2f7';
  ctx.lineWidth = 1;
  const rows = 4;
  for (let i = 0; i <= rows; i++) {
    const y = margin + (i * (h - margin * 2)) / rows;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(w - margin, y);
    ctx.stroke();
  }
}

function drawChart(data: DataPoint[]) {
  resizeCanvas();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const margin = 30;
  ctx.clearRect(0, 0, w, h);

  drawGrid(margin, w, h);

  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  // compute points
  const points = data.map((d, i) => {
    const x = margin + (i * (w - margin * 2)) / (data.length - 1 || 1);
    const y = margin + ((max - d.value) * (h - margin * 2)) / range;
    return { x, y, value: d.value, label: d.date };
  });

  // area gradient
  const grad = ctx.createLinearGradient(0, margin, 0, h - margin);
  grad.addColorStop(0, 'rgba(59,130,246,0.25)');
  grad.addColorStop(1, 'rgba(59,130,246,0)');

  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.lineTo(w - margin, h - margin);
  ctx.lineTo(margin, h - margin);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // line
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#2563eb';
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();

  // points
  points.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = '#1e40af';
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // labels on x for larger screens
  if (w > 500) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    points.forEach((p, i) => {
      if (i % Math.ceil(points.length / 6) === 0) {
        ctx.fillText(p.label, p.x - 18, h - 8);
      }
    });
  }

  // mouse interaction
  canvas.onmousemove = ev => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = ev.clientX - rect.left;
    // find closest point by x
    let closest = points[0];
    let closestDist = Math.abs(mouseX - points[0].x);
    for (const p of points) {
      const d = Math.abs(mouseX - p.x);
      if (d < closestDist) {
        closest = p;
        closestDist = d;
      }
    }
    // show tooltip
    tooltip.style.display = 'block';
    tooltip.style.left = `${closest.x + rect.left + 8}px`;
    tooltip.style.top = `${closest.y + rect.top - 30}px`;
    tooltip.innerHTML = `<div class="font-medium">${closest.value.toLocaleString()}</div><div class="text-xs text-gray-500">${closest.label}</div>`;
  };

  canvas.onmouseleave = () => {
    tooltip.style.display = 'none';
  };
}

function populateUsers() {
  const names = ['أحمد محمد', 'سارة علي', 'محمود سمير', 'نور خالد', 'ليلى حسن', 'يوسف إبراهيم'];
  const rows = names.map((n, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return `<tr class="hover:bg-gray-50"><td class="py-2 text-right">${n}</td><td class="py-2 text-right">user${i}@example.com</td><td class="py-2 text-right">${date.toLocaleDateString('ar-EG')}</td></tr>`;
  });
  usersTableBody.innerHTML = rows.join('');
}

function setActiveButton(days: number) {
  ['btn7', 'btn30', 'btn90'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('bg-blue-600', id === `btn${days}`);
    el.classList.toggle('text-white', id === `btn${days}`);
    el.classList.toggle('bg-blue-100', id !== `btn${days}`);
    el.classList.toggle('text-blue-700', id !== `btn${days}`);
  });
}

function updateAll(days: number) {
  currentDays = days;
  dataset = generateData(days);
  updateStats(dataset);
  drawChart(dataset);
  populateUsers();
  setActiveButton(days);
}

// wire buttons
['btn7', 'btn30', 'btn90'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => {
    const d = id === 'btn7' ? 7 : id === 'btn30' ? 30 : 90;
    updateAll(d);
  });
});

// initial render
updateAll(currentDays);

// responsive redraw
let resizeTimer: number | null = null;
window.addEventListener('resize', () => {
  if (resizeTimer) window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => drawChart(dataset), 120);
});

// Small helper to avoid TS isolatedModules error when compiled as module
export {};
 