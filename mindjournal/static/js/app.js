// ── localStorage helpers ──
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

// ── Mood config ──
const moodConfig = {
  happy:     { label: '😊 Happy',     color: 'var(--green)',   scoreRange:[7,9.5],  stress:'Low',      insight: 'Your entry radiates genuine positivity and joy. These moments are worth celebrating and building on.', motivation: "You're glowing! Happiness is contagious — share this energy with someone around you today.", activities: ['🎵 Play your favourite music','📞 Call someone you love','🌟 Log what made today great'] },
  sad:       { label: '😔 Sad',       color: 'var(--blue)',    scoreRange:[2,4.5],  stress:'Moderate', insight: 'Your entry reflects sadness and emotional heaviness. It\'s completely okay to feel this way.', motivation: "Sadness doesn't last forever. Be gentle with yourself today — you have survived difficult days before.", activities: ['🤗 Talk to someone you trust','🎬 Watch a comfort show','🛁 Take a warm shower'] },
  anxious:   { label: '😰 Anxious',   color: 'var(--amber)',   scoreRange:[3,5.5],  stress:'High',     insight: "Your entry shows signs of anxiety and worry. Your mind is racing — it needs a gentle reset.", motivation: "Anxiety lies to you. Take one breath, then another. You don't have to solve everything right now.", activities: ['🫁 Try 4-7-8 breathing now','🚶 Take a 10-min walk','📝 Write down your worries'] },
  stressed:  { label: '😤 Stressed',  color: 'var(--red)',     scoreRange:[2,5],    stress:'High',     insight: "Your entry reflects high stress and overwhelm. Stress is a signal — pause, prioritize, and breathe.", motivation: "You've handled every stressful day so far. Break what feels overwhelming into one small task.", activities: ['✅ Write a to-do list','⏸️ Take a 5-min break','🫁 Breathing exercise'] },
  angry:     { label: '😡 Angry',     color: '#fb923c',        scoreRange:[2,5],    stress:'High',     insight: 'Your entry reflects anger and frustration. These feelings are valid — let the feeling out safely.', motivation: "Anger is energy. Channel it. Ask yourself: what can I actually control in this situation?", activities: ['🏃 Go for a run','📝 Write it all out uncensored','🎵 Play loud music'] },
  calm:      { label: '😌 Calm',      color: 'var(--teal)',    scoreRange:[6,8],    stress:'Low',      insight: "Your entry reflects a peaceful, balanced state of mind. Calm is a superpower.", motivation: "Note what created this calm — sleep, exercise, good food? That's your personal wellness formula.", activities: ['🧘 Try a body scan meditation','📚 Read something enriching','🌿 Spend time in nature'] },
  motivated: { label: '🤩 Motivated', color: 'var(--accent2)', scoreRange:[7.5,10], stress:'Low',      insight: "Your entry is full of drive and positive energy. You're in a peak state — don't waste it!", motivation: "You're in flow state. Tackle your hardest task NOW. Log this feeling for tougher days.", activities: ['💻 Tackle your hardest task','📈 Set a goal for today','🎯 Log your wins'] },
  numb:      { label: '😶 Numb',      color: 'var(--muted)',   scoreRange:[2,4],    stress:'Moderate', insight: "Your entry suggests emotional numbness — often after prolonged stress. Your mind is protecting itself.", motivation: "Numbness is temporary. Do one small thing: make tea, step outside, text one person.", activities: ['☀️ Go outside for 5 mins','👋 Text one friend','🍵 Make something warm to drink'] },
};

const crisisWords = ['hopeless','no point','end it','give up on life','want to die','can\'t go on','suicid','kill myself','hurt myself'];

// ── API helpers ──
async function fetchHistory() {
  const res = await fetch('/api/history');
  if (res.ok) return await res.json();
  return [];
}

async function postEntry(entry) {
  const res = await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  return res.ok;
}

// ── Mood detection ──
function detectMoodFromText(text) {
  const t = text.toLowerCase();
  const scores = { happy:0, sad:0, anxious:0, stressed:0, angry:0, calm:0, motivated:0, numb:0 };
  const keywords = {
    happy:     ['happy','joy','great','wonderful','excited','love','amazing','fantastic','good','smile','laugh','grateful','thankful','proud'],
    sad:       ['sad','cry','lonely','hopeless','empty','miss','hurt','pain','crying','depressed','down','unhappy','grief'],
    anxious:   ['anxious','worry','nervous','panic','scared','fear','overthink','what if','dread','uneasy','tense'],
    stressed:  ['stress','overwhelm','deadline','pressure','tired','exhaust','too much','burden','can\'t cope','drowning','stuck','busy'],
    angry:     ['angry','frustrat','annoyed','rage','furious','irritated','mad','upset','unfair','hate'],
    calm:      ['calm','peace','relax','serene','content','quiet','still','balance','settled','breathe','mindful'],
    motivated: ['motivated','focus','productive','achieve','goal','energy','drive','success','accomplish','excite','inspire'],
    numb:      ['numb','blank','empty','don\'t care','nothing matters','disconnected','hollow','flat','zombie']
  };
  for (const [mood, words] of Object.entries(keywords)) {
    words.forEach(w => { if (t.includes(w)) scores[mood]++; });
  }
  let best = 'calm', bestScore = -1;
  for (const [mood, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = mood; }
  }
  return best;
}
