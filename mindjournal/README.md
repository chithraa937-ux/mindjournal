# MindJournal AI — Flask App

## Folder Structure
```
mindjournal/
├── app.py                   ← Flask routes & API
├── requirements.txt
├── users.json               ← auto-created on first run
├── history_*.json           ← per-user journal entries
│
├── templates/
│   ├── base.html            ← HTML head, fonts, shared meta
│   ├── layout.html          ← Sidebar + nav (shared by app pages)
│   ├── login.html           ← Sign in page
│   ├── register.html        ← Create account page
│   ├── dashboard.html       ← Stats, mood chart, insights
│   ├── journal.html         ← Write + AI analyze
│   ├── history.html         ← Past entries with search/filter
│   └── wellness.html        ← Breathing, prompts, affirmations
│
└── static/
    ├── css/
    │   ├── base.css         ← Variables, reset, shared UI
    │   ├── auth.css         ← Login / register split layout
    │   └── app.css          ← Sidebar, journal, dashboard, history, wellness
    └── js/
        ├── app.js           ← Shared: mood config, API helpers, detection
        ├── journal.js       ← Journal page logic
        ├── dashboard.js     ← Chart, emotion bars, metrics
        ├── history.js       ← Client-side search & filter
        └── wellness.js      ← Toolkit, breathing, affirmations
```

## Setup in VS Code

### 1. Open the folder
```
File → Open Folder → select the `mindjournal` folder
```

### 2. Create a virtual environment
```bash
python -m venv venv
```

### 3. Activate it
- **Windows:** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the app
```bash
python app.py
```

### 6. Open in browser
```
http://127.0.0.1:5000
```

## Notes
- User accounts are saved to `users.json` automatically
- Journal entries are saved to `history_<email>.json` per user
- Any email + password works for sign up (no email verification)
- Change `app.secret_key` in `app.py` before deploying to production
