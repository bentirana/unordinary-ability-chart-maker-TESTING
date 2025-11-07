let chartColor = '#92dfec';
let radar1, radar2;

// create chart function (shared)
function makeRadar(ctx, maxCap = null, showPoints = true) {
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Power', 'Speed', 'Trick', 'Recovery', 'Defense'],
      datasets: [{
        data: [0,0,0,0,0],
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

window.addEventListener('load', () => {
  radar1 = makeRadar(document.getElementById('radarChart1'));        // main chart
  radar2 = makeRadar(document.getElementById('radarChart2'), 10, false); // capped chart
});

// helper
function hexToRGBA(hex,alpha){
  const r=parseInt(hex.slice(1,3),16),
        g=parseInt(hex.slice(3,5),16),
        b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// update both charts
document.getElementById('updateBtn').addEventListener('click', () => {
  const vals = [
    parseFloat(power.value)||0,
    parseFloat(speed.value)||0,
    parseFloat(trick.value)||0,
    parseFloat(recovery.value)||0,
    parseFloat(defense.value)||0
  ];
  const capped = vals.map(v=>Math.min(v,10));
  const color = colorPicker.value;
  chartColor = color;

  // update chart 1
  radar1.data.datasets[0].data = vals;
  radar1.data.datasets[0].borderColor = color;
  radar1.data.datasets[0].backgroundColor = hexToRGBA(color,0.75);
  radar1.data.datasets[0].pointBorderColor = color;
  radar1.update();

  // update chart 2
  radar2.data.datasets[0].data = capped;
  radar2.data.datasets[0].borderColor = color;
  radar2.data.datasets[0].backgroundColor = hexToRGBA(color,0.75);
  radar2.update();

  dispName.textContent = name.value || '-';
  dispAbility.textContent = ability.value || '-';
  dispLevel.textContent = level.value || '-';
});

// overlay logic
const overlay = document.getElementById('overlay');
viewBtn.addEventListener('click', () => {
  overlay.classList.remove('hidden');
  overlayImg.src = uploadedImg.src;
  overlayName.textContent = name.value || '-';
  overlayAbility.textContent = ability.value || '-';
  overlayLevel.textContent = level.value || '-';
});
closeBtn.addEventListener('click', ()=>overlay.classList.add('hidden'));

// download
downloadBtn.addEventListener('click', ()=> {
  html2canvas(document.getElementById('characterBox')).then(canvas=>{
    const link=document.createElement('a');
    link.download='character_chart.png';
    link.href=canvas.toDataURL();
    link.click();
  });
});

// image upload
imgInput.addEventListener('change', e=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload = ev => { uploadedImg.src = ev.target.result; };
  reader.readAsDataURL(file);
});
