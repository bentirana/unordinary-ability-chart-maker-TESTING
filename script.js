let radar1, radar2;
let chartColor = '#92dfec';

function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Pentagon background + gradient + border
const radarBackgroundPlugin = {
  id: 'customBackground',
  beforeDatasetsDraw(chart) {
    const ctx = chart.ctx;
    const r = chart.scales.r;
    const cx = r.xCenter;
    const cy = r.yCenter;
    const radius = r.drawingArea;
    const N = chart.data.labels.length;
    const start = -Math.PI / 2;

    // Gradient background: center #92dfec → 40% #f8fcff
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, '#92dfec');
    gradient.addColorStop(0.4, '#f8fcff');
    gradient.addColorStop(1, '#f8fcff');

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = start + (i * 2 * Math.PI / N);
      const x = cx + radius * Math.cos(a);
      const y = cy + radius * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    // Outer pentagon border (over everything)
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = start + (i * 2 * Math.PI / N);
      const x = cx + radius * Math.cos(a);
      const y = cy + radius * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#184046';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
};

function makeRadar(ctx, withBackground = false, showNumbers = false) {
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: hexToRGBA(chartColor, 0.75),
        borderColor: chartColor,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: chartColor
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            display: showNumbers,
            font: { family: 'Candara', size: 12 }
          },
          grid: { display: false },
          angleLines: { color: '#6db5c0' },
          pointLabels: {
            font: { family: 'Candara', size: 16 },
            color: '#333'
          }
        }
      },
      plugins: { legend: { display: false } }
    },
    plugins: withBackground ? [radarBackgroundPlugin] : []
  });
}

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
  radar1 = makeRadar(ctx1);
  updateCharts();
});

function getStatValues() {
  return inputs.map(id => +document.getElementById(id).value || 0);
}

function updateCharts() {
  const vals = getStatValues();
  chartColor = colorPicker.value;
  const fill = hexToRGBA(chartColor, 0.75);
  radar1.data.datasets[0].data = vals;
  radar1.data.datasets[0].backgroundColor = fill;
  radar1.data.datasets[0].borderColor = chartColor;
  radar1.update();

  if (radar2) {
    radar2.data.datasets[0].data = vals;
    radar2.data.datasets[0].backgroundColor = fill;
    radar2.data.datasets[0].borderColor = chartColor;
    radar2.update();
  }
}

inputs.forEach(id => document.getElementById(id).addEventListener('input', updateCharts));
colorPicker.addEventListener('input', updateCharts);
['nameInput', 'abilityInput', 'levelInput'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateCharts)
);

viewBtn.addEventListener('click', () => {
  overlay.classList.remove('hidden');
  document.getElementById('overlayImg').src = uploadedImg.src;
  document.getElementById('overlayName').textContent = document.getElementById('nameInput').value || '-';
  document.getElementById('overlayAbility').textContent = document.getElementById('abilityInput').value || '-';
  document.getElementById('overlayLevel').textContent = document.getElementById('levelInput').value || '-';
  document.getElementById('subtleSignature').textContent = 'Chart made by Atlas Skies';

  const ctx2 = document.getElementById('radarChart2').getContext('2d');
  radar2?.destroy();
  radar2 = makeRadar(ctx2, true, true);
  updateCharts();
});

closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

downloadBtn.addEventListener('click', () => {
  downloadBtn.style.visibility = 'hidden';
  closeBtn.style.visibility = 'hidden';
  html2canvas(document.getElementById('characterBox'), { scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = `${document.getElementById('nameInput').value || 'Character'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    downloadBtn.style.visibility = 'visible';
    closeBtn.style.visibility = 'visible';
  });
});

imgInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => { uploadedImg.src = ev.target.result; };
  reader.readAsDataURL(file);
});
