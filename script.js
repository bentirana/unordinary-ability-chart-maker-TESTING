let radar1, radar2;
let chartColor = '#92dfec';

function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ===== CUSTOM LABEL PLUGINS ===== */
const mainLabelsPlugin = {
  id: 'mainLabels',
  afterDraw(chart) {
    if (chart.canvas.id !== 'radarChart1') return;
    const r = chart.scales.r;
    const ctx = chart.ctx;
    const labels = chart.data.labels;
    const values = getStatValues();
    const base = -Math.PI / 2;
    const radius = r.drawingArea * 0.92;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < labels.length; i++) {
      const ang = base + (i * 2 * Math.PI / labels.length);
      const x = r.xCenter + radius * Math.cos(ang);
      const y = r.yCenter + radius * Math.sin(ang);

      ctx.lineWidth = 4;
      ctx.strokeStyle = chartColor;
      ctx.fillStyle = 'white';
      ctx.font = '18px Candara';
      ctx.strokeText(labels[i], x, y - 6);
      ctx.fillText(labels[i], x, y - 6);

      const v = isNaN(values[i]) ? 0 : values[i];
      ctx.font = 'italic 14px Candara';
      ctx.fillStyle = '#000';
      ctx.fillText(`(${v.toFixed(1)})`, x, y + 12);
    }
    ctx.restore();
  }
};

const overlayLabelsPlugin = {
  id: 'overlayLabels',
  afterDraw(chart) {
    if (chart.canvas.id !== 'radarChart2') return;
    const r = chart.scales.r;
    const ctx = chart.ctx;
    const labels = chart.data.labels;
    const base = -Math.PI / 2;
    const radius = r.drawingArea * 0.95;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '18px Candara';
    ctx.lineWidth = 4;
    ctx.strokeStyle = chartColor;
    ctx.fillStyle = 'white';
    for (let i = 0; i < labels.length; i++) {
      const ang = base + (i * 2 * Math.PI / labels.length);
      const x = r.xCenter + radius * Math.cos(ang);
      const y = r.yCenter + radius * Math.sin(ang);
      ctx.strokeText(labels[i], x, y);
      ctx.fillText(labels[i], x, y);
    }
    ctx.restore();
  }
};

const overlayBackgroundPlugin = {
  id: 'overlayBackground',
  beforeDraw(chart) {
    if (chart.canvas.id !== 'radarChart2') return;
    const r = chart.scales.r;
    const ctx = chart.ctx;
    const cx = r.xCenter, cy = r.yCenter;
    const N = chart.data.labels.length;
    const start = -Math.PI / 2;
    const radius = r.drawingArea * 0.9;

    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grd.addColorStop(0, '#92dfec');
    grd.addColorStop(0.4, '#f8fcff');
    grd.addColorStop(1, '#f8fcff');

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = start + i * 2 * Math.PI / N;
      const x = cx + radius * Math.cos(a);
      const y = cy + radius * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.strokeStyle = '#184046';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
};

Chart.register(mainLabelsPlugin, overlayLabelsPlugin, overlayBackgroundPlugin);

/* ===== CHART CREATION ===== */
function makeRadar(ctx, overlay = false) {
  const color = document.getElementById('colorPicker').value || '#92dfec';
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: hexToRGBA(color, 0.70),
        borderColor: color,
        borderWidth: 2,
        pointRadius: overlay ? 0 : 4,
        pointHoverRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 22 },
      scales: {
        r: {
          beginAtZero: true,
          max: overlay ? 10 : undefined,
          suggestedMax: overlay ? 10 : undefined,
          ticks: { display: false },
          grid: { display: false },
          angleLines: { color: '#6db5c0' },
          pointLabels: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    },
    plugins: overlay ? [overlayBackgroundPlugin, overlayLabelsPlugin] : [mainLabelsPlugin]
  });
}

/* ===== INTERACTIONS ===== */
const inputs = ['powerInput', 'speedInput', 'trickInput', 'recoveryInput', 'defenseInput'];
const colorPicker = document.getElementById('colorPicker');
const viewBtn = document.getElementById('viewBtn');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadedImg = document.getElementById('uploadedImg');
const imgInput = document.getElementById('imgInput');

window.addEventListener('load', () => {
  const ctx1 = document.getElementById('radarChart1').getContext('2d');
  radar1 = makeRadar(ctx1, false);
  updateCharts();
});

function getStatValues() {
  return inputs.map(id => +document.getElementById(id).value || 0);
}

function updateCharts() {
  const raw = getStatValues();
  const capped = raw.map(v => Math.min(v, 10));
  chartColor = colorPicker.value;
  const fill = hexToRGBA(chartColor, 0.70);
  const maxVal = Math.max(10, ...raw);
  radar1.options.scales.r.max = maxVal * 1.1;
  radar1.data.datasets[0].data = raw;
  radar1.data.datasets[0].borderColor = chartColor;
  radar1.data.datasets[0].backgroundColor = fill;
  radar1.update();
  if (radar2) {
    radar2.data.datasets[0].data = capped;
    radar2.data.datasets[0].borderColor = chartColor;
    radar2.data.datasets[0].backgroundColor = fill;
    radar2.update();
  }
}

inputs.forEach(id => document.getElementById(id).addEventListener('input', updateCharts));
colorPicker.addEventListener('input', updateCharts);

viewBtn.addEventListener('click', () => {
  overlay.classList.remove('hidden');
  document.getElementById('overlayImg').src = uploadedImg.src;
  document.getElementById('overlayName').textContent = document.getElementById('nameInput').value || '-';
  document.getElementById('overlayAbility').textContent = document.getElementById('abilityInput').value || '-';
  document.getElementById('overlayLevel').textContent = document.getElementById('levelInput').value || '-';
  const ctx2 = document.getElementById('radarChart2').getContext('2d');
  if (radar2) radar2.destroy();
  radar2 = makeRadar(ctx2, true);
  updateCharts();
});

closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

downloadBtn.addEventListener('click', () => {
  downloadBtn.style.visibility = 'hidden';
  closeBtn.style.visibility = 'hidden';
  html2canvas(document.getElementById('characterBox'), { scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = `${document.getElementById('nameInput').value || 'Character'}.png`;
    link.href
