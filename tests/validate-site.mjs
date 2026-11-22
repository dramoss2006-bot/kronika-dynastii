import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [indexHtml, scriptJs, campaignText] = await Promise.all([
  readFile(resolve(root, 'index.html'), 'utf8'),
  readFile(resolve(root, 'script.js'), 'utf8'),
  readFile(resolve(root, 'data/campaign.json'), 'utf8'),
]);

let campaign;
try {
  campaign = JSON.parse(campaignText);
} catch (error) {
  throw new Error(`data/campaign.json nie jest prawidłowym JSON-em: ${error.message}`);
}

assert([1, 2].includes(Number(campaign.schema)), 'Obsługiwane są wyłącznie schema 1 i 2.');
assert(campaign.campaign && typeof campaign.campaign === 'object', 'Brakuje sekcji campaign.');
assert(campaign.players && typeof campaign.players === 'object', 'Brakuje sekcji players.');

const eventIds = new Map();
const warnings = [];
for (const player of ['P1', 'P2']) {
  const playerData = campaign.players[player];
  assert(playerData && typeof playerData === 'object', `Brakuje sekcji players.${player}.`);
  assert(playerData.profile && typeof playerData.profile === 'object', `Brakuje players.${player}.profile.`);
  assert(playerData.statistics && typeof playerData.statistics === 'object', `Brakuje players.${player}.statistics.`);
  assert(typeof playerData.report_date === 'string', `Brakuje players.${player}.report_date.`);
  const events = playerData.events;
  assert(Array.isArray(events), `Brakuje tablicy players.${player}.events.`);
  for (const event of events) {
    assert(event && typeof event === 'object', `${player}: wydarzenie nie jest obiektem.`);
    assert(typeof event.event_id === 'string' && event.event_id.length > 0, `${player}: wydarzenie bez event_id.`);
    const scopedId = `${player}:${event.event_id}`;
    const previous = eventIds.get(scopedId);
    if (previous) {
      const sameEvent = previous.date === event.date && previous.type === event.type;
      assert(!sameEvent, `${player}: zduplikowane wydarzenie ${event.event_id} z datą ${event.date}.`);
      warnings.push(`${player}: identyfikator ${event.event_id} występuje dla różnych dat.`);
    } else {
      eventIds.set(scopedId, event);
    }
  }
}

const p1Data = campaign.players.P1;
for (const field of ['character', 'dynasty', 'house', 'primary_title', 'faith', 'culture']) {
  assert(typeof p1Data.profile[field] === 'string' && p1Data.profile[field].length > 0,
    `P1: brak wartości profile.${field}.`);
}
assert(p1Data.profile.character === 'Król Helgi (Gardariki)', 'P1: nieoczekiwana postać w danych testowych.');
assert(p1Data.profile.dynasty === 'Rurykowicz', 'P1: nieoczekiwana dynastia w danych testowych.');
assert(p1Data.report_date === '10 lutego 867', 'P1: nieoczekiwana data raportu.');
assert(p1Data.statistics.successions === 1, 'P1: licznik sukcesji powinien wynosić 1.');
assert(p1Data.statistics.white_peace === 2, 'P1: licznik białych pokojów powinien wynosić 2.');

const p2Data = campaign.players.P2;
assert(Object.values(p2Data.profile).every(value => value === ''), 'P2: test multiplayer nie był wykonywany, profil powinien być pusty.');
assert(p2Data.events.length === 0, 'P2: test multiplayer nie był wykonywany, lista wydarzeń powinna być pusta.');

assert(/fetch\(`data\/campaign\.json/.test(scriptJs), 'script.js nie pobiera data/campaign.json.');
assert(/validateAnalyzerExport/.test(scriptJs), 'script.js nie waliduje danych Analyzera.');
assert(/playerDynastyCardMarkup/.test(scriptJs), 'script.js nie renderuje kart dynastii graczy.');

const localAssets = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(([, value]) => value.split(/[?#]/, 1)[0])
  .filter(value => value && !/^(?:https?:|data:|#)/.test(value));

for (const asset of localAssets) {
  await access(resolve(root, asset));
}

const p1 = campaign.players.P1.events.length;
const p2 = campaign.players.P2.events.length;
for (const warning of warnings) console.warn(`OSTRZEŻENIE: ${warning}`);
console.log(`Walidacja PASS: schema ${campaign.schema}, P1=${p1}, P2=${p2}, zasoby=${localAssets.length}.`);

