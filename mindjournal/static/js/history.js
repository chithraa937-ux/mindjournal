// All history items are rendered server-side via Jinja.
// This file handles client-side search + mood filter.

function filterHistory() {
  const query = (document.getElementById('history-search').value || '').toLowerCase().trim();
  const moodFilter = document.getElementById('history-mood-filter').value;
  const items = document.querySelectorAll('.history-item');
  let visible = 0;

  items.forEach(item => {
    const text = item.querySelector('.history-text')?.textContent.toLowerCase() || '';
    const mood = item.dataset.mood || '';
    const tags = [...item.querySelectorAll('.meta-tag')].map(t=>t.textContent.toLowerCase()).join(' ');

    const matchesMood = !moodFilter || mood === moodFilter;
    const matchesQuery = !query || text.includes(query) || mood.includes(query) || tags.includes(query);

    if (matchesMood && matchesQuery) {
      item.style.display = '';
      visible++;
    } else {
      item.style.display = 'none';
    }
  });

  const countEl = document.getElementById('history-count');
  if (query || moodFilter) {
    countEl.textContent = `Showing ${visible} of ${items.length} entries`;
  } else {
    countEl.textContent = `${items.length} entries total`;
  }

  // Show empty state if nothing matches
  let empty = document.getElementById('filter-empty');
  if (visible === 0 && items.length > 0) {
    if (!empty) {
      empty = document.createElement('div');
      empty.id = 'filter-empty';
      empty.className = 'history-empty';
      empty.textContent = '😶 No entries match your search.';
      document.getElementById('history-list').appendChild(empty);
    }
    empty.style.display = '';
  } else if (empty) {
    empty.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.history-item');
  const countEl = document.getElementById('history-count');
  if (countEl) countEl.textContent = `${items.length} entries total`;
});
