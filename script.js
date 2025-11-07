let radar1, radar2;
let radar2Ready = false;
// Initial chart color, will be updated from color picker
let chartColor = '#92dfec';

// Pre-defined center coordinates for the main chart based on its container size (450x450 max)
const CHART1_CENTER = { x: 225, y: 225 }; 
const CHART_SCALE_FACTOR = 0.8;

function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* === Fix radar scale center and radius (to prevent clipping) === */
const fixedCenterPlugin = {
  id: 'fixedCenter',
  beforeLayout(chart) {
    const opt = chart.config.options.fixedCenter;
    if (!opt?.enabled) return;
    const r = chart.scales.r;
    
    // Set center if provided (for Chart 1)
    if (opt.centerX && opt.centerY) {
      r.xCenter = opt.centerX;
      r.yCenter = opt.centerY;
    }
    
    // Scale down drawing area relative to the total available space
    r.drawingArea *= CHART_SCALE_FACTOR;
  }
};

/* === Pentagon background + spokes (Overlay Chart) === */
const radarBackgroundPlugin = {
  id: 'customPentagonBackground',
  beforeDraw(chart) {
    const opts = chart.config.options.customBackground;
    if (!opts?.enabled) return;
    const r = chart.scales.r;
    const ctx = chart.ctx;
    const cx = r.xCenter;
    const cy = r.yCenter;
    const radius = r.drawingArea;
    const N = chart.data.labels.length;
    const start = -Math.PI / 2;
    
    // Radial Gradient
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, '#f8fcff');
    gradient.addColorStop(0.25, '#92dfec');
    gradient.addColorStop(1, '#92dfec');
    
    ctx.save();
    
    // Draw Pentagon Shape (background)
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
    
    // Outer Line
    ctx.strokeStyle = '#184046';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Spokes
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = start + (i * 2 * Math.PI / N);
      const x = cx + radius * Math.cos(a);
      const y = cy + radius * Math.sin(a);
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#6db5c0';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }
};

/* === Outlined Axis Labels (Prevents Cutoff & uses chartColor) === */
const outlinedLabelsPlugin = {
  id: 'outlinedLabels',
  afterDraw(chart) {
    const ctx = chart.ctx;
    const r = chart.scales.r;
    const labels = chart.data.labels;
    const cx = r.xCenter;
    const cy = r.yCenter;
    // Calculate a dynamic radius for label placement outside the chart
    // A little past the chart's total drawing area + the max label length spacing
    const radius = r.drawingArea * 1.05 + 15; 
    const base = -Math.PI / 2;
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic 18px Candara';
    
    // Use the global updated chartColor variable
    ctx.strokeStyle = 'white'; 
    ctx.fillStyle = chartColor; 
    ctx.lineWidth = 4;

    labels.forEach((label, i) => {
      const angle = base + (i * 2 * Math.PI / labels.length);
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      
      // Draw white outline
      ctx.strokeText(label, x, y);
      // Draw color fill
      ctx.fillText(label, x, y);
    });
    ctx.restore();
  }
};

/* === Create Chart Function === */
function makeRadar(ctx, maxCap = null, showPoints = true, withBackground = false, fixedCenter = null) {
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'transparent',
        borderColor: chartColor, // Use global color
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: chartColor, // Use global color
        pointRadius: showPoints ? 5 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          grid: { display: false },
          angleLines: { color: '#6db5c0', lineWidth: 1 },
          suggestedMin: 0,
          // Set suggestedMax to 10 for better scaling consistency in Chart 1
          suggestedMax: maxCap ?? 10, 
          ticks: { display: false },
          // Must be true for Chart.js to calculate the padding for the point labels
          pointLabels: { 
            display: true, 
            font: { size: 16 },
            color: 'transparent' // Hide default labels, let plugin draw them
          } 
        }
      },
      customBackground: { enabled: withBackground },
      fixedCenter: { enabled: !!fixedCenter, centerX: fixedCenter?.x, centerY: fixedCenter?.y },
      plugins: { legend: { display: false } }
    },
    plugins: [fixedCenterPlugin, radarBackgroundPlugin, outlinedLabelsPlugin]
  });
}

// Get DOM elements
const updateBtn = document.getElementById('updateBtn');
const viewBtn = document.getElementById('viewBtn');
const powerInput = document.getElementById('powerInput');
const speedInput = document.getElementById('speedInput');
const trickInput = document.getElementById('trickInput');
const recoveryInput = document.getElementById('recoveryInput');
const defenseInput = document.getElementById('defenseInput');
const colorPicker = document.getElementById('colorPicker');
const dispName = document.getElementById('dispName');
const dispAbility = document.getElementById('dispAbility');
const dispLevel = document.getElementById('dispLevel');
const nameInput = document.getElementById('nameInput');
const abilityInput = document.getElementById('abilityInput');
const levelInput = document.getElementById('levelInput');
const overlay = document.getElementById('overlay');
const overlayImg = document.getElementById('overlayImg');
const overlayName = document.getElementById('overlayName');
const overlayAbility = document.getElementById('overlayAbility');
const overlayLevel = document.getElementById('overlayLevel');
const closeBtn = document.getElementById('closeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const characterBox = document.getElementById('characterBox');
const imgInput = document.getElementById('imgInput');
const uploadedImg = document.getElementById('uploadedImg');


/* === Chart 1 (Main) Initialization === */
window.addEventListener('load', () => {
  const ctx1 = document.getElementById('radarChart1').getContext('2d');
  // Pass null for maxCap so it uses the default (10) set in makeRadar, and uses fixed center
  radar1 = makeRadar(ctx1, null, true, false, CHART1_CENTER); 
  // Initialize chartColor with picker value
  chartColor = colorPicker.value;
});

/* === Update charts and info === */
updateBtn.addEventListener('click', () => {
  const vals = [
    +powerInput.value || 0,
    +speedInput.value || 0,
    +trickInput.value || 0,
    +recoveryInput.value || 0,
    +defenseInput.value || 0
  ];
  
  // Cap the values at 10 for the overlay chart (radar2) 
  const capped = vals.map(v => Math.min(v, 10)); 
  
  // Get the selected color
  chartColor = colorPicker.value;
  const fill = hexToRGBA(chartColor, 0.75);

  // Update Chart 1 (Main) with uncapped values
  radar1.data.datasets[0].data = vals;
  radar1.data.datasets[0].borderColor = chartColor;
  radar1.data.datasets[0].pointBorderColor = chartColor;
  radar1.data.datasets[0].backgroundColor = fill;
  radar1.update();

  // Update Chart 2 (Overlay) if it has been initialized
  if (radar2Ready) {
    radar2.data.datasets[0].data = capped;
    radar2.data.datasets[0].borderColor = chartColor;
    radar2.data.datasets[0].backgroundColor = fill;
    radar2.update();
  }

  // Update info box on the main page
  dispName.textContent = nameInput.value || '-';
  dispAbility.textContent = abilityInput.value || '-';
  dispLevel.textContent = levelInput.value || '-';
});

/* === Overlay controls === */
viewBtn.addEventListener('click', () => {
  // Update overlay info
  overlay.classList.remove('hidden');
  overlayImg.src = uploadedImg.src;
  overlayName.textContent = nameInput.value || '-';
  overlayAbility.textContent = abilityInput.value || '-';
  overlayLevel.textContent = levelInput.value || '-';

  // Timeout to ensure the DOM elements (especially the overlay chart's container) have rendered 
  // and have their correct size before Chart.js tries to draw.
  setTimeout(() => {
    const img = document.getElementById('overlayImg');
    const textBox = document.querySelector('.text-box');
    const overlayChart = document.querySelector('.overlay-chart');
    
    // Use clientHeight for the dynamic height calculation
    const imgHeight = img.clientHeight; 
    const textHeight = textBox.clientHeight;
    const totalHeight = imgHeight + textHeight;
    // Dynamic chart size based on image + text box height
    const targetSize = totalHeight * 0.8; 

    // Apply the calculated size to the chart container
    overlayChart.style.height = `${targetSize}px`;
    overlayChart.style.width = `${targetSize}px`;

    const ctx2 = document.getElementById('radarChart2').getContext('2d');
    if (!radar2Ready) {
      // Initialize Chart 2: Cap at 10, no points, with background, dynamic center
      radar2 = makeRadar(ctx2, 10, false, true, { x: targetSize / 2, y: targetSize / 2 });
      radar2Ready = true;
    } else {
      // If already initialized, just resize
      radar2.resize(); 
    }

    // Update Chart 2 data (CAPPED at 10)
    const vals = [
      +powerInput.value || 0,
      +speedInput.value || 0,
      +trickInput.value || 0,
      +recoveryInput.value || 0,
      +defenseInput.value || 0
    ].map(v => Math.min(v, 10));

    const fill = hexToRGBA(chartColor, 0.75);
    radar2.data.datasets[0].data = vals;
    radar2.data.datasets[0].borderColor = chartColor;
    radar2.data.datasets[0].backgroundColor = fill;
    radar2.update();
  }, 200);
});

closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

/* === Download (hide buttons before capture) === */
downloadBtn.addEventListener('click', () => {
  // Hide buttons before screenshot
  downloadBtn.style.visibility = 'hidden';
  closeBtn.style.visibility = 'hidden';
  
  // Use html2canvas to capture the characterBox
  html2canvas(characterBox, { scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = (nameInput.value || 'UnOrdinary_Character') + '_chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Restore buttons after download
    downloadBtn.style.visibility = 'visible';
    closeBtn.style.visibility = 'visible';
  });
});

/* === Image upload === */
imgInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => { uploadedImg.src = ev.target.result; };
  reader.readAsDataURL(file);
});
