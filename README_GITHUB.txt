KRONIKA DYNASTII — STRONA v0.5.1 (GITHUB PAGES)

CEL
Wspólna strona internetowa dla P1 i P2. Główne dane kampanii są pobierane z:
data/campaign.json

Plik data/analyzer-live.js pozostaje wyłącznie jako zgodność awaryjna ze starszymi wersjami Analyzera.

PUBLIKACJA STRONY
1. Repozytorium: dramoss2006-bot/kronika-dynastii.
2. GitHub Pages publikuje gałąź main z katalogu głównego.
3. Zmiany najpierw testuj na osobnej gałęzi i łącz z main dopiero po walidacji.

AKTUALIZACJA DANYCH PO SESJI
1. W Analyzerze wybierz kampanię i utwórz eksport JSON.
2. Opublikuj wynik jako data/campaign.json.
3. Plik musi zawierać schema 1 albo 2 oraz sekcje campaign i players.P1/P2.events.
4. Po publikacji sprawdź wynik automatycznej walidacji strony.

WALIDACJA
Lokalnie uruchom:
- node --check script.js
- node tests/validate-site.mjs

GitHub Actions wykonuje te kontrole automatycznie po wysłaniu zmian i w pull requestach.

BEZPIECZEŃSTWO
Nie zapisuj tokenu GitHub ani innych sekretów w repozytorium. Jeżeli Analyzer korzysta z tokenu, powinien to być token fine-grained ograniczony do tego repozytorium i uprawnienia Contents: Read and write.

