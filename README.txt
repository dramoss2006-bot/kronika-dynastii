KRONIKA DYNASTII — STRONA v0.3 AI KRONIKARZ

TEST:
1. Rozpakuj paczkę.
2. Kliknij start.bat.
3. Otwórz zakładkę „Kronika AI”.
4. Sprawdź, czy wydarzenia zawierające chronicle.text pokazują wpis kronikarski.
5. Trzecie wydarzenie testowe nie ma pola chronicle — strona powinna użyć starego description.

INTEGRACJA:
Analyzer powinien zastąpić plik data/campaign.json własnym eksportem.
Strona obsługuje:
- event.chronicle.title
- event.chronicle.text
- event.chronicle.generator
- event.player / event.player_slot
- starsze event.title i event.description jako tryb zgodności

NOWOŚCI:
- wpisy AI widoczne na stronie głównej i w pełnej kronice,
- oznaczenie „wpis kronikarski”,
- filtry typu wydarzenia,
- filtry Gracz I / Gracz II,
- zgodność ze starszym formatem danych.
