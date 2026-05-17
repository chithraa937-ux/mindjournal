from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import json, os

app = Flask(__name__)
app.secret_key = 'mindjournal-secret-key-change-in-production'

# ── Simple file-based user store (replace with DB in production) ──
USERS_FILE = 'users.json'

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE) as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def load_history(email):
    path = f'history_{email.replace("@","_at_")}.json'
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return []

def save_history(email, history):
    path = f'history_{email.replace("@","_at_")}.json'
    with open(path, 'w') as f:
        json.dump(history, f, indent=2)


# ── Routes ──

@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        if not email or not password:
            error = 'Please enter your email and password.'
        elif '@' not in email:
            error = 'Please enter a valid email address.'
        else:
            users = load_users()
            if email in users:
                if users[email]['password'] != password:
                    error = 'Incorrect password. Please try again.'
                else:
                    session['user'] = {'email': email, 'name': users[email]['name']}
                    return redirect(url_for('dashboard'))
            else:
                # Auto-create account on first login
                name = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
                users[email] = {'password': password, 'name': name}
                save_users(users)
                session['user'] = {'email': email, 'name': name}
                return redirect(url_for('dashboard'))
    return render_template('login.html', error=error)

@app.route('/register', methods=['GET', 'POST'])
def register():
    error = None
    if request.method == 'POST':
        first = request.form.get('firstname', '').strip()
        last  = request.form.get('lastname', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm  = request.form.get('confirm', '')
        if not first or not email or not password:
            error = 'Please fill in all required fields.'
        elif '@' not in email:
            error = 'Please enter a valid email address.'
        elif len(password) < 6:
            error = 'Password must be at least 6 characters.'
        elif confirm and password != confirm:
            error = 'Passwords do not match.'
        else:
            name = f"{first} {last}".strip()
            users = load_users()
            users[email] = {'password': password, 'name': name}
            save_users(users)
            session['user'] = {'email': email, 'name': name}
            return redirect(url_for('dashboard'))
    return render_template('register.html', error=error)

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html', user=session['user'])

@app.route('/journal')
def journal():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('journal.html', user=session['user'])

@app.route('/history')
def history():
    if 'user' not in session:
        return redirect(url_for('login'))
    entries = load_history(session['user']['email'])
    return render_template('history.html', user=session['user'], entries=entries)

@app.route('/wellness')
def wellness():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('wellness.html', user=session['user'])


# ── API endpoints ──

@app.route('/api/history', methods=['GET'])
def api_get_history():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    entries = load_history(session['user']['email'])
    return jsonify(entries)

@app.route('/api/history', methods=['POST'])
def api_save_entry():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    entries = load_history(session['user']['email'])
    entries.insert(0, data)
    save_history(session['user']['email'], entries)
    return jsonify({'status': 'ok', 'count': len(entries)})


if __name__ == '__main__':
    app.run(debug=True)
