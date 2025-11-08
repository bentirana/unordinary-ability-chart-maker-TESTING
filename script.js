let radar1, radar2;
let chartColor = '#92dfec';
const CHART1_CENTER = { x: 247, y: 250 };
const CHART_SCALE_FACTOR = 0.8;

// Convert HEX to RGBA
function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Create radar chart
function makeRadar(ctx, maxCap = 10, showPoints = true, withBackground = false) {
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: hexToRGBA(chartColor, 0.65),
        borderColor: chartColor,
        borderWidth: 2,
        pointRadius: showPoints ? 4 : 0,
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
          max: maxCap,
          grid: { display: false },
          angleLines: { color: '#6db5c0' },
          ticks: { display: false },
          pointLabels: { font: { size: 16 } }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// DOM
const inputs = ['powerInput', 'speedInput', 'trickInput', 'recoveryInput', 'defenseInput'];
const colorPicker = document.getElementById('colorPicker');
const updateBtn = document.getElementById('updateBtn');
const viewBtn = document.getElementById('viewBtn');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const imgInput = document.getElementById('imgInput');
const uploadedImg = document.getElementById('uploadedImg');

// Chart 1 setup
window.addEventListener('load', () => {
  const ctx1 = document.getElementById('radarChart1').getContext('2d');
  radar1 = makeRadar(ctx1);
  updateChart();
});

function updateChart() {
  const vals = inputs.map(id => +document.getElementById(id).value || 0);
  chartColor = colorPicker.value;
  const fill = hexToRGBA(chartColor, 0.65);
  radar1.data.datasets[0].data = vals;
  radar1.data.datasets[0].borderColor = chartColor;
  radar1.data.datasets[0].backgroundColor = fill;
  radar1.update();
}

inputs.forEach(id => document.getElementById(id).addEventListener('input', updateChart));
colorPicker.addEventListener('input', updateChart);
updateBtn.addEventListener('click', updateChart);

// View overlay
viewBtn.addEventListener('click', () => {
  overlay.classList.remove('hidden');
  document.getElementById('overlayImg').src = uploadedImg.src;
  document.getElementById('overlayName').textContent = document.getElementById('nameInput').value || '-';
  document.getElementById('overlayAbility').textContent = document.getElementById('abilityInput').value || '-';
  document.getElementById('overlayLevel').textContent = document.getElementById('levelInput').value || '-';
  document.getElementById('subtleSignature').textContent = 'Chart made by Atlas Skies';

  const ctx2 = document.getElementById('radarChart2').getContext('2d');
  radar2 = makeRadar(ctx2, 10, false, true);
  const vals = inputs.map(id => Math.min(+document.getElementById(id).value || 0, 10));
  radar2.data.datasets[0].data = vals;
  radar2.data.datasets[0].borderColor = chartColor;
  radar2.data.datasets[0].backgroundColor = hexToRGBA(chartColor, 0.65);
  radar2.update();
});

closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

// Download
downloadBtn.addEventListener('click', () => {
  downloadBtn.style.visibility = 'hidden';
  closeBtn.style.visibility = 'hidden';
  const box = document.getElementById('characterBox');
  html2canvas(box, { scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = `${document.getElementById('nameInput').value || 'UnOrdinary_Character'}.png`;
    link.href = canvas.toDataURL();
    link.click();
    downloadBtn.style.visibility = 'visible';
    closeBtn.style.visibility = 'visible';
  });
});

// Image upload
imgInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => { uploadedImg.src = ev.target.result; };
  reader.readAsDataURL(file);
});
