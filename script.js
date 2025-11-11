/*************************
 * GLOBAL STATE
 *************************/
let charts = [];
let activeIndex = 0;
let radarPopup = null;

const BASE_COLOR = '#92dfec';
const FILL_ALPHA = 0.65;

/*************************
 * HELPERS
 *************************/
function hexToRGBA(hex, alpha) {
  if (!hex) hex = BASE_COLOR;
  if (hex.startsWith('rgb')) return hex.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function makeConicGradient(chart, axisColors, alpha = FILL_ALPHA) {
  const r = chart.scales.r;
  const ctx = chart.ctx;
  const grad = ctx.createConicGradient(-Math.PI / 2, r.xCenter, r.yCenter);
  const N = axisColors.length;
  for (let i = 0; i <= N; i++) grad.addColorStop(i / N, hexToRGBA(axisColors[i % N], alpha));
  return grad;
}

/*************************
 * CHART CREATION
 *************************/
function makeRadar(ctx, color, withBackground = false) {
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: hexToRGBA(color, FILL_ALPHA),
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: color,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      layout: { padding: { top: 25, bottom: 25, left: 10, right: 10 } },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: { display: false },
          grid: { display: false },
          angleLines: { color: '#6db5c0', lineWidth: 1 },
          pointLabels: { color: 'transparent' }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

/*************************
 * DOM ELEMENTS
 *************************/
const chartArea = document.getElementById('chartArea');
const addChartBtn = document.getElementById('addChartBtn');
const chartButtons = document.getElementById('chartButtons');
const powerInput = document.getElementById('powerInput');
const speedInput = document.getElementById('speedInput');
const trickInput = document.getElementById('trickInput');
const recoveryInput = document.getElementById('recoveryInput');
const defenseInput = document.getElementById('defenseInput');
const colorPicker = document.getElementById('colorPicker');
const multiColorBtn = document.getElementById('multiColorBtn');
const viewBtn = document.getElementById('viewBtn');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadedImg = document.getElementById('uploadedImg');
const imgInput = document.getElementById('imgInput');
const overlayImg = document.getElementById('overlayImg');
const overlayName = document.getElementById('overlayName');
const overlayAbility = document.getElementById('overlayAbility');
const overlayLevel = document.getElementById('overlayLevel');
const nameInput = document.getElementById('nameInput');
const abilityInput = document.getElementById('abilityInput');
const levelInput = document.getElementById('levelInput');
const axisColorPickers = [
  document.getElementById('powerColor'),
  document.getElementById('speedColor'),
  document.getElementById('trickColor'),
  document.getElementById('recoveryColor'),
  document.getElementById('defenseColor')
];

/*************************
 * INIT
 *************************/
window.addEventListener('load', () => {
  addChart();
  selectChart(0);
  refreshAll();
});

/*************************
 * ADD / SELECT
 *************************/
function addChart() {
  const canvas = document.createElement('canvas');
  canvas.className = 'layer';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.zIndex = charts.length + '';
  chartArea.appendChild(canvas);

  const color = charts.length === 0 ? BASE_COLOR : `hsl(${Math.floor(Math.random() * 360)},70%,55%)`;
  const chart = makeRadar(canvas.getContext('2d'), color, false);
  const cObj = {
    chart,
    canvas,
    color,
    stats: [0, 0, 0, 0, 0],
    multi: false,
    axis: axisColorPickers.map(p => p.value)
  };
  charts.push(cObj);
  const idx = charts.length - 1;

  const btn = document.createElement('button');
  btn.textContent = `Select Chart ${idx + 1}`;
  btn.addEventListener('click', () => selectChart(idx));
  chartButtons.appendChild(btn);
}

function selectChart(index) {
  activeIndex = index;
  chartButtons.querySelectorAll('button').forEach((b, i) => {
    b.style.backgroundColor = i === index ? '#6db5c0' : '#92dfec';
    b.style.color = i === index ? '#fff' : '#000';
  });
  const c = charts[index];
  [powerInput, speedInput, trickInput, recoveryInput, defenseInput].forEach((el, i) => (el.value = c.stats[i]));
  colorPicker.value = c.color;
  multiColorBtn.textContent = c.multi ? 'Single-color' : 'Multi-color';
  axisColorPickers.forEach(p => (p.style.display = c.multi ? 'inline-block' : 'none'));
}

/*************************
 * UPDATE
 *************************/
function refreshAll() {
  charts.forEach(obj => {
    const ds = obj.chart.data.datasets[0];
    const fill = obj.multi ? makeConicGradient(obj.chart, obj.axis, FILL_ALPHA) : hexToRGBA(obj.color, FILL_ALPHA);
    ds.data = obj.stats.map(v => Math.min(v, 10));
    ds.borderColor = obj.color;
    ds.pointBorderColor = obj.color;
    ds.backgroundColor = fill;
    obj.chart.update();
  });
}

function refreshActiveFromInputs() {
  const c = charts[activeIndex];
  c.stats = [
    +powerInput.value || 0,
    +speedInput.value || 0,
    +trickInput.value || 0,
    +recoveryInput.value || 0,
    +defenseInput.value || 0
  ];
  c.color = colorPicker.value;
  c.axis = axisColorPickers.map(p => p.value);
  refreshAll();
}

/*************************
 * LISTENERS
 *************************/
addChartBtn.addEventListener('click', addChart);
[powerInput, speedInput, trickInput, recoveryInput, defenseInput].forEach(el =>
  el.addEventListener('input', refreshActiveFromInputs)
);
colorPicker.addEventListener('input', () => {
  charts[activeIndex].color = colorPicker.value;
  refreshAll();
});
axisColorPickers.forEach(p =>
  p.addEventListener('input', () => {
    if (charts[activeIndex].multi) {
      charts[activeIndex].axis = axisColorPickers.map(p => p.value);
      refreshAll();
    }
  })
);
multiColorBtn.addEventListener('click', () => {
  const c = charts[activeIndex];
  c.multi = !c.multi;
  multiColorBtn.textContent = c.multi ? 'Single-color' : 'Multi-color';
  axisColorPickers.forEach(p => (p.style.display = c.multi ? 'inline-block' : 'none'));
  refreshAll();
});
imgInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = ev => (uploadedImg.src = ev.target.result);
  r.readAsDataURL(file);
});

/*************************
 * POPUP + DOWNLOAD (unchanged)
 *************************/
// same as your existing popup + download logic
