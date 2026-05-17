async function loadDashboard() {
  const entries = await fetchHistory();
  const total = entries.length;
  const week = entries.slice(0, 7);
  const avgMood = week.length ? (week.reduce((s,e) => s+e.score,0)/week.length).toFixed(1) : '—';
  const highStress = entries.filter(e => e.stress === 'High').length;

  document.getElementById('dash-total').textContent = total;
  document.getElementById('dash-avg').textContent = avgMood;
  document.getElementById('dash-stress').textContent = highStress;
  document.getElementById('dash-streak').textContent = '🔥 ' + total;

  renderMoodChart([...week].reverse());
  renderEmotionBars(entries);
  renderWeekInsight(entries, avgMood);
}

function renderWeekInsight(entries, avgMood) {
  const el = document.getElementById('insight-body');
  if (!entries.length) {
    el.innerHTML = 'Start journaling to see your weekly AI report here!';
    return;
  }
  const week = entries.slice(0,7);
  const highCount = week.filter(e=>e.stress==='High').length;
  const counts = {};
  entries.forEach(e => { counts[e.moodKey]=(counts[e.moodKey]||0)+1; });
  const topMood = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'calm';
  const cfg = moodConfig[topMood];
  el.innerHTML = `Your average mood this week is <strong style="color:var(--green);">${avgMood}/10</strong>. Your most frequent emotion is <strong style="color:${cfg?.color}">${cfg?.label || topMood}</strong>. High-stress entries: <strong style="color:var(--red);">${highCount}</strong>.<br><br>💡 <em>Keep journaling daily to build deeper insights over time.</em>`;
}

function renderEmotionBars(entries) {
  const el = document.getElementById('emotion-bars');
  if (!entries.length) { el.innerHTML = '<div style="color:var(--muted);font-size:13px;">No entries yet.</div>'; return; }
  const counts = {};
  entries.forEach(e => { counts[e.moodKey]=(counts[e.moodKey]||0)+1; });
  const total = entries.length;
  const colorMap = { happy:'var(--green)',sad:'var(--blue)',anxious:'var(--amber)',stressed:'var(--red)',angry:'#fb923c',calm:'var(--teal)',motivated:'var(--accent2)',numb:'var(--muted)' };
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  el.innerHTML = sorted.map(([key,count]) => {
    const pct = Math.round(count/total*100);
    const cfg = moodConfig[key];
    return `<div class="emotion-bar">
      <div class="ebar-top"><span style="font-size:13px;">${cfg?.label||key}</span><span style="color:var(--muted);">${pct}%</span></div>
      <div class="ebar-track"><div class="ebar-fill" style="width:${pct}%;background:${colorMap[key]||'var(--accent)'};"></div></div>
    </div>`;
  }).join('');
}

function renderMoodChart(data) {
  const svg = document.getElementById('mood-chart-svg');
  const tooltip = document.getElementById('chart-tooltip');
  if (!svg) return;
  const W=320, H=160, padL=28, padR=12, padT=16, padB=32;
  if (!data.length) { svg.innerHTML='<text x="160" y="80" text-anchor="middle" fill="#7b7a8e" font-size="13">No entries yet</text>'; return; }
  const scores = data.map(e=>e.score);
  const chartW=W-padL-padR, chartH=H-padT-padB;
  const xStep = data.length>1 ? chartW/(data.length-1) : chartW;
  const xPos = i => padL+(data.length>1 ? i*xStep : chartW/2);
  const yPos = v => padT+chartH-((v/10)*chartH);

  let gridLines='';
  [0,2.5,5,7.5,10].forEach(v=>{
    const y=yPos(v);
    gridLines+=`<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
    gridLines+=`<text x="${padL-4}" y="${y+4}" text-anchor="end" fill="#7b7a8e" font-size="9">${v}</text>`;
  });

  let areaPath=`M ${xPos(0)} ${yPos(scores[0])}`;
  for(let i=1;i<scores.length;i++) areaPath+=` L ${xPos(i)} ${yPos(scores[i])}`;
  areaPath+=` L ${xPos(scores.length-1)} ${H-padB} L ${xPos(0)} ${H-padB} Z`;

  let linePath=`M ${xPos(0)} ${yPos(scores[0])}`;
  for(let i=1;i<scores.length;i++) linePath+=` L ${xPos(i)} ${yPos(scores[i])}`;

  let xLabels='';
  data.forEach((e,i)=>{
    const label=e.date.split(',')[0].trim().slice(0,6);
    xLabels+=`<text x="${xPos(i)}" y="${H-padB+16}" text-anchor="middle" fill="#7b7a8e" font-size="9">${label}</text>`;
  });

  let dots='';
  data.forEach((e,i)=>{
    const cx=xPos(i), cy=yPos(e.score);
    const dotColor=e.score>=7?'#34d399':e.score>=5?'#fbbf24':'#f87171';
    dots+=`<circle cx="${cx}" cy="${cy}" r="4" fill="${dotColor}" stroke="#0d0d12" stroke-width="2"/>`;
    dots+=`<circle cx="${cx}" cy="${cy}" r="14" fill="transparent" class="chart-dot" data-score="${e.score}" data-date="${e.date}" data-mood="${e.mood||''}" style="cursor:pointer"/>`;
  });

  svg.innerHTML=`<defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7c6af7" stop-opacity="0.25"/><stop offset="100%" stop-color="#7c6af7" stop-opacity="0"/></linearGradient></defs>${gridLines}<path d="${areaPath}" fill="url(#areaGrad)"/><path d="${linePath}" fill="none" stroke="#7c6af7" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${xLabels}${dots}`;

  svg.querySelectorAll('.chart-dot').forEach(dot=>{
    dot.addEventListener('mouseenter',()=>{
      const wrap=svg.closest('.chart-wrap');
      const wr=wrap.getBoundingClientRect(), dr=dot.getBoundingClientRect();
      tooltip.style.display='block';
      tooltip.style.left=(dr.left-wr.left+8)+'px';
      tooltip.style.top=(dr.top-wr.top)+'px';
      tooltip.innerHTML=`<strong>${dot.dataset.mood}</strong> · ${dot.dataset.score}/10<br><span style="color:#7b7a8e;font-size:11px;">${dot.dataset.date}</span>`;
    });
    dot.addEventListener('mouseleave',()=>{ tooltip.style.display='none'; });
  });
}

document.addEventListener('DOMContentLoaded', loadDashboard);
