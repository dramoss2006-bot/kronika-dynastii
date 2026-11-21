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
  const events = campaign.players[player]?.events;
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

assert(/fetch\(`data\/campaign\.json/.test(scriptJs), 'script.js nie pobiera data/campaign.json.');
assert(/validateAnalyzerExport/.test(scriptJs), 'script.js nie waliduje danych Analyzera.');

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

