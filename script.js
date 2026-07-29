'use strict';

let campaignData = null;
let analyzerData = null;
const ANALYZER_STORAGE_KEY = 'kronikaDynastii.analyzerExport.v1';

const formatNumber = new Intl.NumberFormat('pl-PL');
const formatDecimal = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

async function loadCampaign() {
  try {
    if (!window.KD_CAMPAIGN_DATA) throw new Error('Brakuje pliku data/campaign-data.js');
    campaignData = window.KD_CAMPAIGN_DATA;
    renderAll();
    document.getElementById('loading').hidden = true;
    document.getElementById('app-content').hidden = false;
  } catch (error) {
    document.getElementById('loading').hidden = true;
    const box = document.getElementById('error');
    box.hidden = false;
    box.innerHTML = `<h2>Nie udało się wczytać kampanii</h2><p>Sprawdź, czy wszystkie pliki zostały rozpakowane i zachowano strukturę folderów.</p><small>${escapeHtml(error.message)}</small>`;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function panel(title, content, action = '') {
  return `<article class="panel"><div class="panel-title"><h3>${title}</h3>${action ? `<button type="button">${action}</button>` : ''}</div>${content}</article>`;
}

function crest(dynasty) {
  return `<div class="crest ${dynasty.color}">${dynasty.symbol}</div>`;
}

function renderAll() {
  const d = campaignData;
  document.getElementById('ruler-name').textContent = d.ruler.name;
  document.getElementById('ruler-initial').textContent = d.ruler.initial;
  document.getElementById('view-home').innerHTML = renderHome(d);
  document.getElementById('view-dynasties').innerHTML = renderDynasties(d);
  document.getElementById('view-characters').innerHTML = renderCharacters(d);
  document.getElementById('view-chronicle').innerHTML = renderChronicle(d);
  document.getElementById('view-players').innerHTML = renderPlayersData();
  document.getElementById('view-map').innerHTML = renderMap(d);
  document.getElementById('view-wars').innerHTML = renderWars(d);
  document.getElementById('view-downloads').innerHTML = renderDownloads();
  bindDynamicActions();
}

function renderHome(d) {
  const recentEvents = d.events.slice(0, 4).map(event => `<div class="event"><span class="dot"></span><time>${event.dateLabel}</time><h4>${event.title}</h4><p>${event.description}</p></div>`).join('');
  const dynasties = d.dynasties.map(item => `<button class="dynasty-card card-link" data-open="dynasties">${crest(item)}<h4>${item.name}</h4><p>${item.head}</p><b>Prestiż ${item.prestige}</b></button>`).join('');
  const characters = d.characters.slice(0, 3).map(item => `<button class="character-card card-link" data-open="characters"><div class="portrait">${item.symbol}</div><h4>${item.name}</h4><p>${item.title}</p><div class="traits">${item.skills.join(' · ')}</div></button>`).join('');
  const wars = d.wars.map(war => `<div><span>${war.name}<small>przeciwko: ${war.opponent}</small></span><b class="${war.score >= 0 ? 'positive' : 'negative'}">${war.score > 0 ? '+' : ''}${war.score}%</b></div>`).join('');
  return `
    <section class="stats-grid">
      <article class="stat-card campaign"><span class="eyebrow">Aktywna kampania</span><div class="campaign-row"><div class="crest red">♔</div><div><h2>${d.campaign.name}</h2><p>${d.campaign.realm}</p></div></div></article>
      <article class="stat-card"><span class="eyebrow">Data rozpoczęcia</span><strong>${d.campaign.startDateLabel}</strong><small>${d.campaign.startDate}</small></article>
      <article class="stat-card"><span class="eyebrow">Aktualny rok</span><strong>${d.campaign.currentYear}</strong><small>${d.campaign.yearsOfHistory} lat historii</small></article>
      <article class="stat-card wide"><span class="eyebrow">Kluczowe statystyki</span><div class="mini-stats"><div><b>${d.stats.prestige}</b><span>Prestiż</span></div><div><b>${d.stats.dynasties}</b><span>Dynastie</span></div><div><b>${d.stats.counties}</b><span>Hrabstwa</span></div><div><b>${d.stats.wars}</b><span>Wojny</span></div></div></article>
    </section>
    <section class="dashboard-grid">
      <article class="panel timeline-panel"><div class="panel-title"><h3>Ostatnie wydarzenia</h3><button data-open="chronicle">Zobacz kronikę</button></div><div class="parchment timeline">${recentEvents}</div></article>
      <article class="panel dynasties-panel"><div class="panel-title"><h3>Dynastie</h3><button data-open="dynasties">Zobacz wszystkie</button></div><div class="dynasty-grid">${dynasties}</div></article>
      <article class="panel map-panel"><div class="panel-title"><h3>Mapa świata</h3><button data-open="map">Otwórz mapę</button></div>${mapMarkup(d)}</article>
      <article class="panel characters-panel"><div class="panel-title"><h3>Wybitne postacie</h3><button data-open="characters">Zobacz wszystkie</button></div><div class="character-grid">${characters}</div></article>
      <article class="panel wars-panel"><div class="panel-title"><h3>Wojny i królestwo</h3><button data-open="wars">Zobacz wszystkie</button></div><div class="war-list">${wars}</div><div class="realm-info"><span>Stolica: ${d.realm.capital}</span><span>Wojska: ${formatNumber.format(d.realm.troops)}</span><span>Dochód: +${formatDecimal.format(d.realm.income)}</span><span>Stabilność: ${d.realm.stability}</span></div></article>
    </section>
    <footer class="footer-panel"><div><h3>Podsumowanie kampanii</h3><p>${d.campaign.summary}</p></div><div class="seal">KD</div></footer>`;
}

function renderDynasties(d) {
  const cards = d.dynasties.map(item => `<article class="detail-card dynasty-detail">${crest(item)}<div><span class="eyebrow">Dynastia</span><h2>${item.name}</h2><p><strong>Głowa rodu:</strong> ${item.head}</p><p><strong>Prestiż:</strong> ${item.prestige}</p><blockquote>„${item.motto}”</blockquote></div></article>`).join('');
  return pageHeader('Dynastie', 'Rody, które kształtują losy kampanii.') + `<div class="detail-grid">${cards}</div>`;
}

function renderCharacters(d) {
  const cards = d.characters.map(item => `<article class="detail-card character-detail"><div class="portrait large">${item.symbol}</div><div><span class="eyebrow">${item.dynasty}</span><h2>${item.name}</h2><p>${item.title} · wiek ${item.age}</p><div class="tag-row">${item.traits.map(t => `<span>${t}</span>`).join('')}</div><div class="skill-row">${item.skills.map((v,i) => `<div><b>${v}</b><small>${['Dypl.','Woj.','Zarz.','Intryga','Nauka'][i]}</small></div>`).join('')}</div></div></article>`).join('');
  return pageHeader('Postacie', 'Najważniejsi ludzie zapisani na kartach kroniki.') + `<div class="detail-grid two-columns">${cards}</div>`;
}

function renderChronicle(d) {
  const filters = ['wszystkie','wojna','dynastia','królestwo','narodziny','religia'];
  return pageHeader('Kronika wydarzeń', 'Chronologiczny zapis dziejów kampanii.') + `<div class="filter-bar">${filters.map((f,i) => `<button class="filter-button ${i===0?'active':''}" data-filter="${f}">${f}</button>`).join('')}</div><article class="panel chronicle-full"><div class="parchment timeline" id="chronicle-list">${chronicleEvents(d.events)}</div></article>`;
}

function chronicleEvents(events) {
  return events.map(event => `<div class="event" data-type="${event.type}"><span class="dot ${event.importance}"></span><time>${event.dateLabel}</time><span class="event-type">${event.type}</span><h4>${event.title}</h4><p>${event.description}</p></div>`).join('');
}

function renderMap(d) {
  return pageHeader('Mapa świata', 'Poglądowa mapa polityczna aktualnej kampanii.') + `<article class="panel map-full"><div class="panel-title"><h3>Europa Środkowa</h3><span class="map-date">Stan na ${d.campaign.currentDate}</span></div>${mapMarkup(d, true)}<div class="map-legend">${d.mapRegions.map(region => `<span><i class="legend-color ${region.className}"></i>${region.name}</span>`).join('')}</div></article>`;
}

function mapMarkup(d, full = false) {
  return `<div class="map-placeholder ${full ? 'large-map' : ''}">${d.mapRegions.map(region => `<div class="region ${region.className}">${region.name}</div>`).join('')}</div>`;
}

function renderWars(d) {
  const rows = d.wars.map(war => `<article class="war-card"><div><span class="eyebrow">${war.status}</span><h2>${war.name}</h2><p>Przeciwnik: ${war.opponent}</p></div><div class="war-score ${war.score >= 0 ? 'positive' : 'negative'}">${war.score > 0 ? '+' : ''}${war.score}%<small>wynik wojny</small></div></article>`).join('');
  return pageHeader('Wojny i królestwo', 'Konflikty zbrojne oraz stan domeny monarchy.') + `<div class="wars-layout"><div>${rows}</div>${panel('Informacje o królestwie', `<dl class="realm-list"><div><dt>Forma rządu</dt><dd>${d.realm.government}</dd></div><div><dt>Religia</dt><dd>${d.realm.faith}</dd></div><div><dt>Stolica</dt><dd>${d.realm.capital}</dd></div><div><dt>Wojska</dt><dd>${formatNumber.format(d.realm.troops)}</dd></div><div><dt>Dochód miesięczny</dt><dd>+${formatDecimal.format(d.realm.income)}</dd></div><div><dt>Stabilność</dt><dd>${d.realm.stability}</dd></div></dl>`)}</div>`;
}



async function loadAnalyzerData() {
  try {
    const response = await fetch(`data/campaign.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const published = validateAnalyzerExport(await response.json());
    analyzerData = published;
    analyzerData.__source = 'public';
    return;
  } catch (error) {
    console.warn('Nie udało się pobrać data/campaign.json, używam pliku zapasowego:', error);
  }

  try {
    if (window.KD_ANALYZER_DATA) {
      analyzerData = validateAnalyzerExport(window.KD_ANALYZER_DATA);
      analyzerData.__source = 'public';
      return;
    }
    const raw = localStorage.getItem(ANALYZER_STORAGE_KEY);
    analyzerData = raw ? validateAnalyzerExport(JSON.parse(raw)) : null;
    if (analyzerData) analyzerData.__source = 'local';
  } catch (error) {
    console.warn('Nie udało się odczytać danych Analyzera:', error);
    analyzerData = null;
  }
}

function validateAnalyzerExport(data) {
  if (!data || typeof data !== 'object') throw new Error('Plik nie zawiera obiektu JSON.');
  if (![1, 2].includes(Number(data.schema))) throw new Error('Nieobsługiwany schemat eksportu. Obsługiwane są schema = 1 oraz schema = 2.');
  if (!data.campaign || !data.players) throw new Error('Brakuje sekcji campaign lub players.');
  for (const player of ['P1', 'P2']) {
    if (!data.players[player] || !Array.isArray(data.players[player].events)) {
      throw new Error(`Brakuje listy wydarzeń gracza ${player}.`);
    }
  }
  return data;
}

function analyzerEventDescription(event) {
  const attrs = event.attributes || {};
  const ignored = new Set(['schema', 'mod', 'category', 'test_package']);
  const details = Object.entries(attrs)
    .filter(([key, value]) => !ignored.has(key) && value !== '' && value !== null && value !== undefined)
    .slice(0, 6)
    .map(([key, value]) => `${escapeHtml(key)}: ${escapeHtml(value)}`)
    .join(' · ');
  return details || (event.is_test ? 'Wydarzenie z pakietu testowego.' : 'Wydarzenie zapisane przez Kronika Analyzer.');
}

function playerEventsMarkup(playerId, events) {
  if (!events.length) return '<div class="empty-player-state">Brak wydarzeń tego gracza.</div>';
  const sorted = [...events].sort((a, b) => {
    const ak = [a.year || 0, a.month || 0, a.day || 0];
    const bk = [b.year || 0, b.month || 0, b.day || 0];
    return bk[0]-ak[0] || bk[1]-ak[1] || bk[2]-ak[2];
  });
  return sorted.map(event => `
    <article class="player-event">
      <div class="player-event-meta">
        <span class="player-badge ${playerId.toLowerCase()}">${playerId}</span>
        <time>${escapeHtml(event.date || `${event.year || '—'}`)}</time>
        <span>${escapeHtml(event.category_label || event.category || 'Inne')}</span>
        ${event.is_test ? '<span class="test-badge">TEST</span>' : ''}
      </div>
      <h4>${escapeHtml(event.type_label || event.type || 'Wydarzenie')}</h4>
      <p>${analyzerEventDescription(event)}</p>
      <small>ID: ${escapeHtml(event.event_id || 'brak')}</small>
    </article>`).join('');
}

function renderPlayersData() {
  if (!analyzerData) {
    return pageHeader('Dane P1/P2', 'Import eksportu JSON z programu Kronika Analyzer.') + `
      <section class="import-panel panel">
        <div class="import-dropzone">
          <div class="import-symbol">⇧</div>
          <h3>Wczytaj eksport kampanii</h3>
          <p>Wybierz plik JSON utworzony przez Kronika Analyzer. Dane zostaną zapisane w tej przeglądarce.</p>
          <label class="download-button import-button">Wybierz plik JSON<input id="analyzer-file-input" type="file" accept="application/json,.json" hidden></label>
        </div>
        <div id="import-message" class="import-message" aria-live="polite"></div>
      </section>
      <aside class="security-note"><strong>Etap testowy</strong><p>Ta wersja zapisuje kampanię lokalnie w przeglądarce. Publikację wspólną dla P1 i P2 dodamy w kolejnym etapie przez internetową bazę danych.</p></aside>`;
  }

  const campaign = analyzerData.campaign || {};
  const p1 = analyzerData.players.P1.events || [];
  const p2 = analyzerData.players.P2.events || [];
  const total = p1.length + p2.length;
  const isPublic = analyzerData.__source === 'public';
  return pageHeader('Dane P1/P2', isPublic ? 'Wspólne dane kampanii opublikowane na stronie.' : 'Lokalny podgląd eksportu z Kronika Analyzer.') + `
    <aside class="security-note"><strong>${isPublic ? 'Dane publiczne' : 'Podgląd lokalny'}</strong><p>${isPublic ? 'Te same wydarzenia widzą P1 i P2. Aktualizacja następuje automatycznie po opublikowaniu pliku data/campaign.json przez Kronika Analyzer.' : 'Ten import jest widoczny tylko w tej przeglądarce i nie zmienia publicznej strony.'}</p></aside>
    <section class="player-summary-grid">
      <article class="stat-card campaign"><span class="eyebrow">Kampania</span><strong>${escapeHtml(campaign.name || 'Bez nazwy')}</strong><small>ID: ${escapeHtml(campaign.id ?? '—')}</small></article>
      <article class="stat-card"><span class="eyebrow">Gracz P1</span><strong>${p1.length}</strong><small>wydarzeń</small></article>
      <article class="stat-card"><span class="eyebrow">Gracz P2</span><strong>${p2.length}</strong><small>wydarzeń</small></article>
      <article class="stat-card"><span class="eyebrow">Łącznie</span><strong>${total}</strong><small>ostatni import: ${escapeHtml(campaign.last_import_at || '—')}</small></article>
    </section>
    <div class="player-toolbar">
      <label class="download-button import-button">Podgląd lokalnego JSON<input id="analyzer-file-input" type="file" accept="application/json,.json" hidden></label>
      <a class="download-button secondary" href="aktualizator.html">Przygotuj aktualizację strony</a>
      ${isPublic ? '' : '<button id="clear-analyzer-data" class="danger-button" type="button">Usuń podgląd lokalny</button>'}
    </div>
    <div id="import-message" class="import-message" aria-live="polite"></div>
    <section class="players-columns">
      <article class="panel player-panel"><div class="panel-title"><h3>Gracz P1</h3><span>${p1.length} wydarzeń</span></div><div class="player-events">${playerEventsMarkup('P1', p1)}</div></article>
      <article class="panel player-panel"><div class="panel-title"><h3>Gracz P2</h3><span>${p2.length} wydarzeń</span></div><div class="player-events">${playerEventsMarkup('P2', p2)}</div></article>
    </section>`;
}

async function importAnalyzerFile(file) {
  const message = document.getElementById('import-message');
  try {
    if (!file) return;
    const text = await file.text();
    const parsed = validateAnalyzerExport(JSON.parse(text));
    localStorage.setItem(ANALYZER_STORAGE_KEY, JSON.stringify(parsed));
    analyzerData = parsed;
    analyzerData.__source = 'local';
    document.getElementById('view-players').innerHTML = renderPlayersData();
    bindDynamicActions();
    showView('players');
  } catch (error) {
    if (message) {
      message.textContent = `Nie udało się wczytać pliku: ${error.message}`;
      message.className = 'import-message error';
    }
  }
}

function renderDownloads() {
  const analyzerHash = '8d67c003f2c34b4e5cb2f0688d2159c2743d13a23856c35a315709fece8baa82';
  const modHash = '619bfc3ced7290a61f6e42605a30ec4012f90977d39aa8dfde918e7da4fbde4e';
  return pageHeader('Pobierz', 'Oficjalne pliki projektu Kronika Dynastii.') + `
    <section class="download-grid">
      <article class="download-card featured">
        <div class="download-icon">KA</div>
        <div class="download-content">
          <span class="release-badge stable">Wersja stabilna</span>
          <h2>Kronika Analyzer</h2>
          <p class="version-line">Wersja 1.0.1 · Windows 10/11</p>
          <p>Program automatycznie odczytuje raporty i wydarzenia z moda, zarządza kampaniami oraz eksportuje dane do JSON.</p>
          <ul>
            <li>Instalator Windows</li>
            <li>Wybór katalogu instalacji</li>
            <li>Opcjonalny skrót na pulpicie</li>
            <li>Nie wymaga Pythona ani Inno Setup</li>
          </ul>
          <a class="download-button" href="downloads/KronikaAnalyzer_Setup_1.0.1.exe" download>Pobierz Analyzer</a>
          <details class="checksum"><summary>SHA-256</summary><code>${analyzerHash}</code></details>
        </div>
      </article>

      <article class="download-card">
        <div class="download-icon mod">KD</div>
        <div class="download-content">
          <span class="release-badge beta">Wersja beta</span>
          <h2>Kronika Dynastii — mod CK3</h2>
          <p class="version-line">Wersja 0.12.0-a · Crusader Kings III</p>
          <p>Mod eksportuje raporty i wydarzenia P1/P2 do pliku debug.log, który jest odczytywany przez Kronika Analyzer.</p>
          <ul>
            <li>Rejestracja graczy P1 i P2</li>
            <li>Wydarzenia dynastyczne, wojenne i terytorialne</li>
            <li>Zmiany wiary, kultury i tytułów</li>
            <li>Pakiet zawiera instrukcję instalacji</li>
          </ul>
          <a class="download-button secondary" href="downloads/Kronika_Dynastii_v0.12.0-a_PACZKA_PUBLIKACYJNA.zip" download>Pobierz mod</a>
          <details class="checksum"><summary>SHA-256</summary><code>${modHash}</code></details>
        </div>
      </article>
    </section>

    <section class="install-guide">
      <article class="panel">
        <div class="panel-title"><h3>Instalacja Analyzera</h3></div>
        <ol>
          <li>Pobierz i uruchom instalator.</li>
          <li>Wybierz folder instalacji.</li>
          <li>Opcjonalnie utwórz skrót na pulpicie.</li>
          <li>Po instalacji uruchom Kronika Analyzer.</li>
        </ol>
      </article>
      <article class="panel">
        <div class="panel-title"><h3>Instalacja moda</h3></div>
        <ol>
          <li>Rozpakuj pobraną paczkę.</li>
          <li>Uruchom instalator moda z paczki albo skopiuj pliki ręcznie.</li>
          <li>Włącz „Kronika Dynastii - Rdzeń” w launcherze Paradox.</li>
          <li>Obaj gracze muszą używać tej samej wersji moda.</li>
        </ol>
      </article>
    </section>

    <aside class="security-note">
      <strong>Weryfikacja pobrania</strong>
      <p>Sumy SHA-256 pozwalają sprawdzić, czy pliki nie zostały zmienione. Nie wyłączaj programu antywirusowego podczas instalacji.</p>
    </aside>`;
}

function pageHeader(title, subtitle) {
  return `<header class="page-header"><span class="eyebrow">Archiwum kampanii</span><h2>${title}</h2><p>${subtitle}</p></header>`;
}

function showView(viewName) {
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
  document.querySelectorAll('.nav-tabs [data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === viewName));
  window.location.hash = viewName === 'home' ? '' : viewName;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindDynamicActions() {
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => showView(button.dataset.open)));
  document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.filter-button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('#chronicle-list .event').forEach(event => event.hidden = filter !== 'wszystkie' && event.dataset.type !== filter);
  }));
  const analyzerInput = document.getElementById('analyzer-file-input');
  if (analyzerInput) analyzerInput.addEventListener('change', event => importAnalyzerFile(event.target.files[0]));
  const clearButton = document.getElementById('clear-analyzer-data');
  if (clearButton) clearButton.addEventListener('click', () => {
    localStorage.removeItem(ANALYZER_STORAGE_KEY);
    analyzerData = null;
    document.getElementById('view-players').innerHTML = renderPlayersData();
    bindDynamicActions();
  });
}

document.querySelectorAll('.nav-tabs [data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelector('.mobile-menu').addEventListener('click', () => document.querySelector('.nav-tabs').classList.toggle('open'));
window.addEventListener('hashchange', () => showView(location.hash.slice(1) || 'home'));

loadAnalyzerData().finally(() => loadCampaign().then(() => showView(location.hash.slice(1) || 'home')));
