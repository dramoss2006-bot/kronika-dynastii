KRONIKA DYNASTII — STRONA v0.4.1 PEŁNY PAKIET

Kompletna wersja strony przeznaczona do GitHub Pages i współpracy z:
Kronika Analyzer v1.2.0-test2 STRONA AI AUTO.

NAJWAŻNIEJSZE PLIKI:
- index.html — główna strona,
- styles.css — wygląd,
- script.js — odczyt i prezentacja kampanii,
- data/campaign.json — dane kampanii publikowane przez Analyzer,
- assets/ — logo oraz ikony,
- .nojekyll — wyłącza przetwarzanie Jekyll na GitHub Pages,
- start.bat — lokalny test strony.

FORMAT DANYCH:
Strona odczytuje data/campaign.json.
Obsługuje wspólną tablicę events oraz starszy układ players.P1/P2.events.
Wpis Kronikarza jest pobierany z event.chronicle.text.
Gdy tego pola nie ma, strona pokazuje event.description.

ANALYZER:
W ustawieniach publikacji ustaw ścieżkę:
data/campaign.json
