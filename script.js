'use strict';

let campaignData = null;

async function loadCampaign() {
  try {
    const response = await fetch('data/campaign.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Błąd HTTP ${response.status}`);
    campaignData = await response.json();
    normalizeCampaign(campaignData);
    renderAll();
    document.getElementById('loading').hidden = true;
    document.getElementById('app-content').hidden = false;
  } catch (error) {
    document.getElementById('loading').hidden = true;
    const box = document.getElementById('error');
    box.hidden = false;
    box.innerHTML = `<h2>Nie udało się wczytać kampanii</h2>
      <p>Uruchom stronę plikiem <strong>start.bat</strong>, zamiast otwierać bezpośrednio <code>index.html</code>.</p>
      <small>${escapeHtml(error.message)}</small>`;
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])
  );
}

function normalizeCampaign(data) {
  data.campaign = data.campaign || {};
  data.ruler = data.ruler || {
    name: data.campaign.name || 'Kampania',
    initial: (data.campaign.name || 'K').charAt(0).toUpperCase()
  };
  data.events = Array.isArray(data.events) ? data.events : [];
}

function eventNarrative(event) {
  const aiText = event?.chronicle?.text;
  return aiText && String(aiText).trim()
    ? aiText
    : (event.description || 'Brak opisu wydarzenia.');
}

function eventTitle(event) {
  return event?.chronicle?.title || event.title || 'Wydarzenie';
}

function eventDate(event) {
  return event.dateLabel || event.date || 'Data nieznana';
}

function eventPlayer(event) {
  const raw = event.player || event.player_slot || event.slot || '';
  const normalized = String(raw).toUpperCase();
  if (normalized === 'P1' || normalized === '1') return 'Gracz I';
  if (normalized === 'P2' || normalized === '2') return 'Gracz II';
  return raw ? String(raw) : '';
}

function eventType(event) {
  return event.type || event.event_type || 'inne';
}

function renderEvent(event, compact = false) {
  const player = eventPlayer(event);
  const generator = event?.chronicle?.generator;
  const isAi = Boolean(event?.chronicle?.text);
  return `<article class="event ${compact ? 'compact' : ''}" data-type="${escapeHtml(eventType(event))}" data-player="${escapeHtml(player)}">
    <span class="dot ${escapeHtml(event.importance || '')}"></span>
    <div class="event-meta">
      <time>${escapeHtml(eventDate(event))}</time>
      ${player ? `<span class="player-badge">${escapeHtml(player)}</span>` : ''}
      <span class="event-type">${escapeHtml(eventType(event))}</span>
      ${isAi ? `<span class="ai-badge" title="${escapeHtml(generator || 'AI Kronikarz')}">✦ wpis kronikarski</span>` : ''}
    </div>
    <h4>${escapeHtml(eventTitle(event))}</h4>
    <p>${escapeHtml(eventNarrative(event))}</p>
  </article>`;
}

function renderAll() {
  const d = campaignData;
  document.getElementById('ruler-name').textContent = d.ruler.name || d.campaign.name || 'Kampania';
  document.getElementById('ruler-initial').textContent = d.ruler.initial || 'K';
  document.getElementById('view-home').innerHTML = renderHome(d);
  document.getElementById('view-chronicle').innerHTML = renderChronicle(d);
  bindDynamicActions();
}

function renderHome(d) {
  const events = d.events.slice(0, 5);
  const aiCount = d.events.filter(event => event?.chronicle?.text).length;
  const p1Count = d.events.filter(event => eventPlayer(event) === 'Gracz I').length;
  const p2Count = d.events.filter(event => eventPlayer(event) === 'Gracz II').length;
  return `
    <section class="stats-grid">
      <article class="stat-card campaign"><span class="eyebrow">Aktywna kampania</span><h2>${escapeHtml(d.campaign.name || 'Kampania testowa')}</h2><p>${escapeHtml(d.campaign.realm || 'Kronika dwóch graczy')}</p></article>
      <article class="stat-card"><span class="eyebrow">Wpisy AI</span><strong>${aiCount}</strong><small>wygenerowane opisy</small></article>
      <article class="stat-card"><span class="eyebrow">Gracz I</span><strong>${p1Count}</strong><small>wydarzeń</small></article>
      <article class="stat-card"><span class="eyebrow">Gracz II</span><strong>${p2Count}</strong><small>wydarzeń</small></article>
    </section>
    <article class="panel">
      <div class="panel-title"><h3>Ostatnie wpisy kronikarskie</h3><button data-open="chronicle">Zobacz całą kronikę</button></div>
      <div class="parchment timeline">${events.length ? events.map(event => renderEvent(event, true)).join('') : '<p class="empty">Brak wydarzeń.</p>'}</div>
    </article>`;
}

function renderChronicle(d) {
  const types = [...new Set(d.events.map(eventType))].sort();
  const filters = ['wszystkie', ...types];
  return `
    <header class="page-header"><span class="eyebrow">Archiwum kampanii</span><h2>Kronika AI</h2><p>Opisy utworzone przez Kronikarza na podstawie danych z moda.</p></header>
    <div class="toolbar">
      <div class="filter-bar">${filters.map((f, i) => `<button class="filter-button ${i === 0 ? 'active' : ''}" data-filter="${escapeHtml(f)}">${escapeHtml(f)}</button>`).join('')}</div>
      <div class="player-filters">
        <button class="player-filter active" data-player-filter="wszyscy">Wszyscy gracze</button>
        <button class="player-filter" data-player-filter="Gracz I">Gracz I</button>
        <button class="player-filter" data-player-filter="Gracz II">Gracz II</button>
      </div>
    </div>
    <article class="panel chronicle-full"><div class="parchment timeline" id="chronicle-list">${d.events.length ? d.events.map(event => renderEvent(event)).join('') : '<p class="empty">Brak wydarzeń.</p>'}</div></article>`;
}

function applyFilters() {
  const typeButton = document.querySelector('.filter-button.active');
  const playerButton = document.querySelector('.player-filter.active');
  const typeFilter = typeButton?.dataset.filter || 'wszystkie';
  const playerFilter = playerButton?.dataset.playerFilter || 'wszyscy';

  document.querySelectorAll('#chronicle-list .event').forEach(event => {
    const typeMatches = typeFilter === 'wszystkie' || event.dataset.type === typeFilter;
    const playerMatches = playerFilter === 'wszyscy' || event.dataset.player === playerFilter;
    event.hidden = !(typeMatches && playerMatches);
  });
}

function showView(viewName) {
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
  document.querySelectorAll('.nav-tabs [data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === viewName));
  window.location.hash = viewName === 'home' ? '' : viewName;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindDynamicActions() {
  document.querySelectorAll('[data-open]').forEach(button =>
    button.addEventListener('click', () => showView(button.dataset.open))
  );
  document.querySelectorAll('.filter-button').forEach(button =>
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-button').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      applyFilters();
    })
  );
  document.querySelectorAll('.player-filter').forEach(button =>
    button.addEventListener('click', () => {
      document.querySelectorAll('.player-filter').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      applyFilters();
    })
  );
}

document.querySelectorAll('.nav-tabs [data-view]').forEach(button =>
  button.addEventListener('click', () => showView(button.dataset.view))
);
document.querySelector('.mobile-menu').addEventListener('click', () =>
  document.querySelector('.nav-tabs').classList.toggle('open')
);
window.addEventListener('hashchange', () => showView(location.hash.slice(1) || 'home'));

loadCampaign().then(() => showView(location.hash.slice(1) || 'home'));
