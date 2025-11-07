let chartColor = '#92dfec';
let radar1, radar2;
let radar2Ready = false;

// Create radar chart (shared)
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
      animation: { duration: 500 }
    }
  });
}

// Initialize Chart 1
window.addEventListener('load', () => {
  radar1 = makeRadar(document.getElementById('radarChart1'));
});

// HEX → RGBA helper
function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Update both charts and info
document.getElementById('updateBtn').addEventListener('click', () => {
  const vals = [
    parseFloat(power.value) || 0,
    parseFloat(speed.value) || 0,
    parseFloat(trick.value) || 0,
    parseFloat(recovery.value) || 0,
    parseFloat(defense.value) || 0
  ];
  const capped = vals.map(v => Math.min(v, 10));
  const color = colorPicker.value;
  chartColor = color;

  // Update chart 1
  radar1.data.datasets[0].data = vals;
  radar1.data.datasets[0].borderColor = color;
  radar1.data.datasets[0].backgroundColor = hexToRGBA(color, 0.75);
  radar1.data.datasets[0].pointBorderColor = color;
  radar1.options.scales.r.pointLabels.color = color;
  radar1.update();

  // Update chart 2 if already built
  if (radar2Ready) {
    radar2.data.datasets[0].data = capped;
    radar2.data.datasets[0].borderColor = color;
    radar2.data.datasets[0].backgroundColor = hexToRGBA(color, 0.75);
    radar2.options.scales.r.pointLabels.color = color;
    radar2.update();
  }

  dispName.textContent = document.getElementById('name').value || '-';
  dispAbility.textContent = document.getElementById('ability').value || '-';
  dispLevel.textContent = document.getElementById('level').value || '-';
});

// Overlay logic
const overlay = document.getElementById('overlay');
const viewBtn = document.getElementById('viewBtn');
const closeBtn = document.getElementById('closeBtn');
const downloadBtn = document.getElementById('downloadBtn');

viewBtn.addEventListener('click', () => {
  overlay.classList.remove('hidden');

  // Copy info
  document.getElementById('overlayImg').src = document.getElementById('uploadedImg').src;
  document.getElementById('overlayName').textContent = document.getElementById('name').value || '-';
  document.getElementById('overlayAbility').textContent = document.getElementById('ability').value || '-';
  document.getElementById('overlayLevel').textContent = document.getElementById('level').value || '-';

  // Build Chart 2 after overlay renders
  setTimeout(() => {
    if (!radar2Ready) {
      radar2 = makeRadar(document.getElementById('radarChart2'), 10, false);
      radar2Ready = true;
    }

    const vals = [
      parseFloat(power.value) || 0,
      parseFloat(speed.value) || 0,
      parseFloat(trick.value) || 0,
      parseFloat(recovery.value) || 0,
      parseFloat(defense.value) || 0
    ].map(v => Math.min(v, 10));

    const color = colorPicker.value;
    radar2.data.datasets[0].data = vals;
    radar2.data.datasets[0].borderColor = color;
    radar2.data.datasets[0].backgroundColor = hexToRGBA(color, 0.75);
    radar2.options.scales.r.pointLabels.color = color;
    radar2.update();
  }, 100);
});

closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

// Download Character Box
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
