/* === Global Variables === */
let radar1;
let radar2;
let chartColor = '#8080ff'; // Default ability color
let currentStats; // Stores the current stats for chart 2

// Chart 1 is slightly shifted left to be centered visually
const CHART1_CENTER = { x: 247, y: 250 }; 
// Chart 2 is centered in its container
const CHART2_CENTER = { x: 200, y: 200 };

/* === Custom Chart Plugins === */

// 1. Radar Background Plugin (Rings and Spokes)
const radarBackgroundPlugin = {
  id: 'radarBackground',
  beforeDraw(chart) {
    const ctx = chart.ctx;
    const r = chart.scales.r;
    const cx = r.xCenter;
    const cy = r.yCenter;
    const labels = chart.data.labels;
    const numPoints = labels.length;
    
    ctx.save();
    
    // Draw Radial Gradient Background for Chart 2 only
    if (chart.canvas.id === 'radarChart2') {
      const gradient = ctx.createRadialGradient(
        cx, cy, 0, 
        cx, cy, r.drawingArea * 1.05 
      );
      gradient.addColorStop(0, chartColor); // Center color is ability color
      gradient.addColorStop(0.33, chartColor); // Gradient starts here (33%)
      gradient.addColorStop(1, 'white'); // Fades to white
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, r.drawingArea * 1.05, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw Spokes (darker lines emanating from center)
    ctx.beginPath();
    ctx.strokeStyle = '#35727d'; // Darker spoke color
    ctx.lineWidth = 2; // Spoke thickness (increased to 2)
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI / 2) - (i * 2 * Math.PI / numPoints);
      const x = cx + r.drawingArea * Math.cos(angle);
      const y = cy - r.drawingArea * Math.sin(angle);
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw the Central Circle (white dot)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }
};

// 2. Outlined Axis Labels (White Fill, Color Outline)
const outlinedLabelsPlugin = {
  id: 'outlinedLabels',
  afterDraw(chart) {
    const ctx = chart.ctx;
    const r = chart.scales.r;
    const labels = chart.data.labels;
    const cx = chart.options.centerPoint.x;
    const cy = chart.options.centerPoint.y;
    
    // Adjust label radius for better positioning outside the chart area
    const radius = r.drawingArea * 1.05 + 15; 
    const base = -Math.PI / 2;
    
    // Custom offsets to adjust label positions (in radians)
    const powerOffset = 0;
    // Defense shifted further left (increased from 0.04 to 0.08)
    const defenseOffset = 0.08; 
    const speedOffset = -0.04; // Moves Speed slightly right
    const offsets = [powerOffset, defenseOffset, speedOffset, 0, 0];

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic 18px Candara';
    
    // Corrected Color Swap: Outline is chartColor, Fill is White
    ctx.strokeStyle = chartColor; 
    ctx.fillStyle = 'white'; 
    ctx.lineWidth = 4;

    labels.forEach((label, i) => {
      // Calculate angle and apply custom offset
      let angle = base + (i * 2 * Math.PI / labels.length);
      if (i < offsets.length) {
        angle += offsets[i];
      }
      
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      
      // Draw the outline first, then the fill on top
      ctx.strokeText(label, x, y);
      ctx.fillText(label, x, y);
    });
    ctx.restore();
  }
};

/* === Utility Functions === */

function getStats() {
  return [
    parseFloat(document.getElementById('powerInput').value),
    parseFloat(document.getElementById('defenseInput').value),
    parseFloat(document.getElementById('speedInput').value),
    parseFloat(document.getElementById('recoveryInput').value),
    parseFloat(document.getElementById('trickInput').value),
  ];
}

function makeRadar(ctx, stats, isEditable, showLabels, centerPoint) {
  const data = {
    labels: ['Power', 'Defense', 'Speed', 'Recovery', 'Trick'],
    datasets: [{
      data: stats || [5.0, 5.0, 5.0, 5.0, 5.0], // Default center stats for Chart 1
      backgroundColor: `${chartColor}A6`, // A6 is 65% opacity in hex
      borderColor: chartColor,
      borderWidth: 3,
      pointRadius: isEditable ? 5 : 0,
      pointBackgroundColor: chartColor,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  const options = {
    centerPoint: centerPoint, // Custom option for plugin positioning
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      // Apply plugins conditionally
      radarBackground: { enabled: true },
      outlinedLabels: { enabled: showLabels }
    },
    scales: {
      r: {
        grid: { display: false },
        angleLines: { color: '#6db5c0', lineWidth: 2 }, // Angle line thickness (increased to 2)
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          display: isEditable, // Only show ticks on editable chart 1
          stepSize: 1,
          backdropColor: 'transparent',
          color: '#333',
          font: { size: 10, family: 'Candara' }
        },
        pointLabels: {
          display: false // Hide default labels; handled by custom plugin
        }
      }
    }
  };

  const plugins = [radarBackgroundPlugin];
  if (showLabels) {
    plugins.push(outlinedLabelsPlugin);
  }

  return new Chart(ctx, {
    type: 'radar',
    data: data,
    options: options,
    plugins: plugins
  });
}

function updateChart() {
  // Update Chart 1 color and data
  chartColor = document.getElementById('colorPicker').value;
  currentStats = getStats();
  
  if (radar1) {
    radar1.data.datasets[0].data = currentStats;
    radar1.data.datasets[0].borderColor = chartColor;
    radar1.data.datasets[0].pointBackgroundColor = chartColor;
    radar1.data.datasets[0].backgroundColor = `${chartColor}A6`; // A6 is 65% opacity in hex
    radar1.update();
  }
}

function updateOverlayChart(stats, level, name, color) {
  const ctx2 = document.getElementById('radarChart2').getContext('2d');
  
  // Destroy old chart if it exists
  if (radar2) {
    radar2.destroy();
  }
  
  // Update global chartColor for plugin use
  chartColor = color; 

  // Make new chart 2 (not editable, shows labels, smaller center point)
  radar2 = makeRadar(ctx2, stats, false, true, CHART2_CENTER);
  radar2.data.datasets[0].borderColor = color;
  radar2.data.datasets[0].backgroundColor = `${color}A6`; // A6 is 65% opacity
  radar2.update();

  // Update text elements
  document.getElementById('overlayImg').src = document.getElementById('uploadImg').src;
  document.getElementById('overlayName').textContent = name;
  document.getElementById('overlayLevel').textContent = level;
  
  // Update subtle signature (Hardcoded to Atlas Skies)
  document.getElementById('subtleSignature').textContent = "Chart made by Atlas Skies";
}

/* === Event Handlers === */

// Image Upload Handler
document.getElementById('imageUpload').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('uploadImg').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Input Handlers (Triggers Chart 1 Update)
const statInputs = ['levelInput', 'colorPicker', 'powerInput', 'defenseInput', 'speedInput', 'recoveryInput', 'trickInput'];
statInputs.forEach(id => {
  document.getElementById(id).addEventListener('input', updateChart);
});

// Character Name Input Handler (Updates placeholder image text)
document.getElementById('charName').addEventListener('input', (event) => {
    const name = event.target.value || "Upload Image";
    // Update placeholder image text dynamically
    document.getElementById('uploadImg').src = `https://placehold.co/250x250/cccccc/333333?text=${name.replace(/\s/g, '+')}`;
    updateChart(); // Also update chart if the name is an input that refreshes something
});

// View Chart Button Handler
document.getElementById('viewChartBtn').addEventListener('click', () => {
  const name = document.getElementById('charName').value || "Unknown Character";
  const level = parseFloat(document.getElementById('levelInput').value).toFixed(1);
  const stats = getStats();
  const color = document.getElementById('colorPicker').value;

  updateOverlayChart(stats, level, name, color);
  document.getElementById('overlay').classList.remove('hidden');
});

// Close Overlay Handler
document.getElementById('closeBtn').addEventListener('click', () => {
  document.getElementById('overlay').classList.add('hidden');
});

// Download Handler (Simple and stable version)
document.getElementById('downloadBtn').addEventListener('click', () => {
  const canvas = document.getElementById('radarChart2');
  const name = document.getElementById('charName').value || "Unknown";
  const filename = `${name.replace(/\s/g, '_')}_characterChart.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
});


/* === Chart 1 (Main) Initialization === */
// FIX: Using DOMContentLoaded ensures the script runs after the canvas element exists
document.addEventListener('DOMContentLoaded', () => {
  // Set initial image src for uploadImg based on charName
  const initialName = document.getElementById('charName').value;
  document.getElementById('uploadImg').src = `https://placehold.co/250x250/cccccc/333333?text=${initialName.replace(/\s/g, '+')}`;
  
  const ctx1 = document.getElementById('radarChart1').getContext('2d');
  radar1 = makeRadar(ctx1, getStats(), true, false, CHART1_CENTER); 
  chartColor = document.getElementById('colorPicker').value;
  updateChart(); // Initial draw and color sync
});
