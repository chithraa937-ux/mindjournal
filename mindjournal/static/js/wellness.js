const gratitudePrompts = [
  "Name 3 small things that went okay today, even if everything feels hard.",
  "Who is someone that made your life better this week? What did they do?",
  "What is one thing your body did today that you're grateful for?",
  "What is a simple pleasure you enjoyed recently — a smell, taste, or feeling?",
  "What is something difficult you've overcome that made you stronger?",
];
const affirmations = [
  "I am capable of handling whatever comes my way today.",
  "My feelings are valid, and I am allowed to take up space.",
  "I am doing the best I can with what I have right now.",
  "I deserve rest, kindness, and good things.",
  "Every day is a new opportunity to grow into who I want to be.",
];
const journalPrompts = [
  "What is one thing I'm avoiding right now, and what would it feel like to finally face it?",
  "If my future self could send me a message today, what would it say?",
  'What does a "good day" look like for me? When did I last have one?',
  "What emotion am I most uncomfortable feeling? Why?",
  "What is one small step I can take this week toward something that matters to me?",
];
const groundingSteps = [
  "Notice 5 things you can SEE around you right now.",
  "Notice 4 things you can TOUCH. Feel their texture.",
  "Notice 3 things you can HEAR in this moment.",
  "Notice 2 things you can SMELL — or your favourite smell.",
  "Notice 1 thing you can TASTE right now.",
];
const bodyScanSteps = [
  "Close your eyes and take 3 slow deep breaths.",
  "Notice your feet — release any tension there.",
  "Move up to your calves and thighs — let them soften.",
  "Relax your belly and chest with each exhale.",
  "Drop your shoulders away from your ears — feel the release.",
  "Unclench your jaw. Soften your eyes. You are safe right now.",
];

function showWellnessOutput(html) {
  const box = document.getElementById('wellness-output');
  document.getElementById('wellness-output-content').innerHTML = html;
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function openGratitude() {
  const p = gratitudePrompts[Math.floor(Math.random()*gratitudePrompts.length)];
  showWellnessOutput(`<div style="font-size:24px;margin-bottom:10px;">🙏</div><div style="font-size:16px;font-family:var(--serif);margin-bottom:12px;">Gratitude Prompt</div><div style="font-size:14px;color:var(--muted);line-height:1.7;">${p}</div><textarea class="journal-textarea" style="margin-top:1rem;min-height:100px;" placeholder="Write your thoughts here..."></textarea>`);
}
function openAffirmation() {
  const a = affirmations[Math.floor(Math.random()*affirmations.length)];
  showWellnessOutput(`<div style="font-size:24px;margin-bottom:10px;">💪</div><div style="font-size:16px;font-family:var(--serif);margin-bottom:12px;">Today's Affirmation</div><div style="font-size:18px;font-family:var(--serif);color:var(--accent2);line-height:1.6;font-style:italic;">"${a}"</div><div style="font-size:13px;color:var(--muted);margin-top:12px;">Read this 3 times. Say it to yourself in the mirror. Mean it.</div>`);
}
function openJournalPrompt() {
  const p = journalPrompts[Math.floor(Math.random()*journalPrompts.length)];
  showWellnessOutput(`<div style="font-size:24px;margin-bottom:10px;">📝</div><div style="font-size:16px;font-family:var(--serif);margin-bottom:12px;">Journal Prompt</div><div style="font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:1rem;">${p}</div><textarea class="journal-textarea" style="min-height:120px;" placeholder="Take your time..."></textarea>`);
}
function openGrounding() {
  showWellnessOutput(`<div style="font-size:24px;margin-bottom:10px;">🌳</div><div style="font-size:16px;font-family:var(--serif);margin-bottom:12px;">5-4-3-2-1 Grounding</div>${groundingSteps.map((s,i)=>`<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;"><div style="width:28px;height:28px;border-radius:50%;background:var(--accent-glow);border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--accent2);flex-shrink:0;">${5-i}</div><div style="font-size:14px;color:var(--muted);line-height:1.6;padding-top:4px;">${s}</div></div>`).join('')}`);
}
function openMeditation() {
  showWellnessOutput(`<div style="font-size:24px;margin-bottom:10px;">🧘</div><div style="font-size:16px;font-family:var(--serif);margin-bottom:12px;">Body Scan Meditation</div>${bodyScanSteps.map((s,i)=>`<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;"><div style="width:24px;height:24px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:var(--accent2);flex-shrink:0;">${i+1}</div><div style="font-size:14px;color:var(--muted);line-height:1.6;padding-top:2px;">${s}</div></div>`).join('')}`);
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
