let chartColor = '#92dfec';
let radar1, radar2;
let radar2Ready = false;

// Safer references so "name" doesn't collide with window.name
const nameInput     = document.getElementById('name');
const abilityInput  = document.getElementById('ability');
const levelInput    = document.getElementById('level');
const powerInput    = document.getElementById('power');
const speedInput    = document.getElementById('speed');
const trickInput    = document.getElementById('trick');
const recoveryInput = document.getElementById('recovery');
const defenseInput  = document.getElementById('defense');
const colorPicker   = document.getElementById('colorPicker');

// Helper to build a radar chart
function makeRadar(ctx, maxCap = null, showPoints = true) {
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(146,223,236,0.75)',
        borderColor: '#92dfec',
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#92dfec',
        pointRadius: showPoints ? 5 : 0
      }]
    },
    options: {
      scales: {
        r: {
          grid: { display: false },
          angleLines: { color: '#6db5c0', lineWidth: 1 },
          suggestedMin: 0,
          suggestedMax: maxCap ?? undefined,
          ticks: { display: false },
          pointLabels: {
            color: () => chartColor,
            font: { family: 'Candara', style: 'italic', size: 16 }
          }
        }
      },
      plugins: { legend: { display: false } },
      animation: { duration: 500 },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Init chart 1
window.addEventListener('load', () => {
  radar1 = makeRadar(document.getElementById('radarChart1'));
});

// HEX → RGBA
function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Update stats + chart1 (+ chart2 if open)
document.getElementById('updateBtn').addEventListener('click', () => {
  const vals = [
    parseFloat(powerInput.value) || 0,
    parseFloat(speedInput.value) || 0,
    parseFloat(trickInput.value) || 0,
    parseFloat(recoveryInput.value) || 0,
    parseFloat(defenseInput.value) || 0
  ];
  const capped = vals.map(v => Math.min(v, 10));
  const color = colorPicker.value;
  chartColor = color;

  // Chart 1 update
  radar1.data.datasets[0].data = vals;
  radar1.data.datasets[0].borderColor = color;
  radar1.data.datasets[0].backgroundColor = hexToRGBA(color, 0.75);
  radar1.data.datasets[0].pointBorderColor = color;
  radar1.options.scales.r.pointLabels.color = color;
  radar1.update();

  // Chart 2 live update (if open)
  if (radar2Ready) {
    radar2.data.datasets[0].data = capped;
    radar2.data.datasets[0].borderColor = color;
    radar2.data.datasets[0].backgroundColor = hexToRGBA(color, 0.75);
    radar2.options.scales.r.pointLabels.color = color;
    radar2.update();
  }

  // Update info boxes
  document.getElementById('dispName').textContent    = nameInput.value    || '-';
  document.getElementById('dispAbility').textContent = abilityInput.value || '-';
  document.getElementById('dispLevel').textContent   = levelInput.value   || '-';
});

// Overlay elements
const overlay     = document.getElementById('overlay');
const viewBtn     = document.getElementById('viewBtn');
const closeBtn    = document.getElementById('closeBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Open overlay
viewBtn.addEventListener('click', () => {
  overlay.classList.remove('hidden');

  // Copy info immediately
  document.getElementById('overlayImg').src        = document.getElementById('uploadedImg').src;
  document.getElementById('overlayName').textContent    = nameInput.value    || '-';
  document.getElementById('overlayAbility').textContent = abilityInput.value || '-';
  document.getElementById('overlayLevel').textContent   = levelInput.value   || '-';

  // Wait for overlay to render fully, then create / resize chart2
  setTimeout(() => {
    const ctx2 = document.getElementById('radarChart2');
    if (!radar2Ready) {
      radar2 = makeRadar(ctx2, 10, false);
      radar2Ready = true;
    } else {
      radar2.resize(); // ensure proper dimensions after display
    }

    const vals = [
      parseFloat(powerInput.value) || 0,
      parseFloat(speedInput.value) || 0,
      parseFloat(trickInput.value) || 0,
      parseFloat(recoveryInput.value) || 0,
      parseFloat(defenseInput.value) || 0
    ].map(v => Math.min(v, 10));

    const color = colorPicker.value;
    radar2.data.datasets[0].data = vals;
    radar2.data.datasets[0].borderColor = color;
    radar2.data.datasets[0].backgroundColor = hexToRGBA(color, 0.75);
    radar2.options.scales.r.pointLabels.color = color;
    radar2.update();
  }, 150);
});

// Close overlay
closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

// Download character box as PNG
downloadBtn.addEventListener('click', () => {
  html2canvas(document.getElementById('characterBox')).then(canvas => {
    const link = document.createElement('a');
    link.download = 'character_chart.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

// Image upload
document.getElementById('imgInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('uploadedImg').src = ev.target.result;
  };
  reader.readAsDataURL(file);
});
