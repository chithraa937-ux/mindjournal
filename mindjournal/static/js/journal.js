// ── Writing prompts ──
const writingPrompts = [
  "What is one thing I'm avoiding right now, and what would it feel like to finally face it?",
  "If my future self could send me a message today, what would it say?",
  'What does a "good day" look like for me? When did I last have one?',
  "What emotion am I most uncomfortable feeling? Why?",
  "What is one small step I can take this week toward something that matters to me?",
  "What would I tell a close friend who felt exactly the way I feel right now?",
  "What has drained my energy this week, and what has refilled it?",
  "What am I most grateful for in this exact moment, even if today was hard?",
  "What belief about myself is holding me back right now?",
  "What does rest actually feel like for me? When did I last truly rest?",
  "Describe a moment this week when you felt most like yourself.",
  "What would change in my life if I stopped worrying about what others think?",
];
let currentPromptIndex = Math.floor(Math.random() * writingPrompts.length);

function refreshPrompt() {
  currentPromptIndex = (currentPromptIndex + 1) % writingPrompts.length;
  document.getElementById('prompt-display').textContent = writingPrompts[currentPromptIndex];
}
function usePrompt() {
  const ta = document.getElementById('journal-text');
  const prompt = writingPrompts[currentPromptIndex];
  ta.value = ta.value ? ta.value + '\n\n' + prompt + '\n' : prompt + '\n';
  ta.focus();
  updateCharCount();
}

// ── Mood selection ──
let selectedMoodKey = null;
function pickMood(el, label, key) {
  document.querySelectorAll('.mood-pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  selectedMoodKey = key;
}

function updateCharCount() {
  document.getElementById('char-count').textContent = document.getElementById('journal-text').value.length;
}

// ── Analyze ──
function analyzeEntry() {
  const text = document.getElementById('journal-text').value.trim();
  if (!text) { alert('Please write something in your journal first!'); return; }

  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div> Analyzing...';

  setTimeout(() => {
    const moodKey = selectedMoodKey || detectMoodFromText(text);
    const cfg = moodConfig[moodKey];
    const score = +(cfg.scoreRange[0] + Math.random() * (cfg.scoreRange[1] - cfg.scoreRange[0])).toFixed(1);

    document.getElementById('emotion-badge').textContent = cfg.label;
    document.getElementById('emotion-badge').style.cssText = `background:${cfg.color}22;color:${cfg.color};border:1px solid ${cfg.color}55;`;
    document.getElementById('mood-score-val').textContent = score + '/10';
    document.getElementById('mood-score-val').style.color = cfg.color;
    document.getElementById('stress-val').textContent = (cfg.stress === 'High' ? '🔴 ' : cfg.stress === 'Low' ? '🟢 ' : '🟡 ') + cfg.stress;
    document.getElementById('insight-text').textContent = cfg.insight;
    document.getElementById('motivation-text').textContent = cfg.motivation;

    const chips = document.getElementById('activity-chips');
    chips.innerHTML = cfg.activities.map(a => `<div class="activity-chip">${a}</div>`).join('');

    const isCrisis = crisisWords.some(w => text.toLowerCase().includes(w));
    document.getElementById('crisis-card').style.display = isCrisis ? 'block' : 'none';
    document.getElementById('result-panel').style.display = 'block';
    document.getElementById('result-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    btn.disabled = false;
    btn.innerHTML = '✨ Analyze with AI';

    // Store for saveEntry
    window._lastAnalysis = { moodKey, score, stress: cfg.stress, text };
  }, 1600);
}

// ── Save entry ──
async function saveEntry() {
  if (!window._lastAnalysis) return;
  const { moodKey, score, stress, text } = window._lastAnalysis;
  const cfg = moodConfig[moodKey];
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day:'numeric', month:'short' }) + ', ' + now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  const entry = {
    date: dateStr,
    mood: cfg.label.split(' ').slice(1).join(' '),
    moodKey,
    text: text.slice(0, 120) + (text.length > 120 ? '...' : ''),
    score,
    stress,
    keywords: text.toLowerCase().split(/\s+/).filter(w => w.length > 4).slice(0, 3)
  };

  const ok = await postEntry(entry);
  if (ok) {
    document.getElementById('journal-text').value = '';
    document.getElementById('char-count').textContent = '0';
    document.getElementById('result-panel').style.display = 'none';
    document.querySelectorAll('.mood-pill').forEach(p => p.classList.remove('selected'));
    selectedMoodKey = null;
    window._lastAnalysis = null;
    alert('✅ Entry saved!');
  } else {
    alert('Error saving entry. Please try again.');
  }
}

// ── Breathing ──
let breathInterval = null;
function openBreathing() {
  document.getElementById('breathing-overlay').classList.add('show');
  const circle = document.getElementById('breath-circle');
  const instruction = document.getElementById('breath-instruction');
  let phase = 0;
  const phases = [
    { text: 'Inhale...', instruction: 'Breathe in slowly for 4 seconds', duration: 4000, scale: 'scale(1.4)' },
    { text: 'Hold...',   instruction: 'Hold your breath for 7 seconds',  duration: 7000, scale: 'scale(1.4)' },
    { text: 'Exhale...', instruction: 'Breathe out slowly for 8 seconds', duration: 8000, scale: 'scale(1)' },
  ];
  function runPhase() {
    const p = phases[phase % 3];
    circle.textContent = p.text;
    circle.style.transform = p.scale;
    instruction.textContent = p.instruction;
    phase++;
    breathInterval = setTimeout(runPhase, p.duration);
  }
  setTimeout(runPhase, 500);
}
function closeBreathing() {
  document.getElementById('breathing-overlay').classList.remove('show');
  clearTimeout(breathInterval);
  document.getElementById('breath-circle').textContent = 'Inhale';
  document.getElementById('breath-circle').style.transform = 'scale(1)';
  document.getElementById('breath-instruction').textContent = 'Get ready...';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const el = document.getElementById('journal-date');
  if (el) el.textContent = now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  document.getElementById('prompt-display').textContent = writingPrompts[currentPromptIndex];

  // Load quick stats into sidebar
  fetchHistory().then(entries => {
    document.getElementById('stat-total').textContent = entries.length;
    const week = entries.slice(0, 7);
    if (week.length) {
      const avg = (week.reduce((s,e) => s + e.score, 0) / week.length).toFixed(1);
      document.getElementById('stat-avg').textContent = avg + '/10';
    }
    if (entries.length) {
      const counts = {};
      entries.forEach(e => { counts[e.moodKey] = (counts[e.moodKey]||0)+1; });
      const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
      document.getElementById('stat-top').textContent = moodConfig[top]?.label || top;
    }
    document.getElementById('streak-num').textContent = '🔥 ' + entries.length;
  });
});
