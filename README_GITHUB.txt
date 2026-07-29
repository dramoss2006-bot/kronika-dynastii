KRONIKA DYNASTII — STRONA v0.5 (GITHUB PAGES)

CEL
Wspólna strona internetowa dla P1 i P2. Dane kampanii są automatycznie
wczytywane z pliku:
data/analyzer-live.js

PIERWSZA PUBLIKACJA
1. Wgraj zawartość tego folderu do głównego katalogu repozytorium:
   dramoss2006-bot/kronika-dynastii
2. W GitHub: Settings -> Pages.
3. Source: Deploy from a branch.
4. Branch: main, folder: / (root).
5. Zapisz i poczekaj na publikację.

AKTUALIZACJA PO SESJI
1. W Analyzerze wyeksportuj kampanię do JSON.
2. Otwórz na stronie plik aktualizator.html.
3. Wybierz JSON i pobierz analyzer-live.js.
4. W repozytorium GitHub otwórz folder data.
5. Zastąp plik analyzer-live.js nową wersją.
6. Po wdrożeniu GitHub Pages obaj gracze zobaczą nowe dane pod tym samym URL.

UWAGA
Nie wgrywaj zewnętrznego folderu ani całego ZIP-a jako jednego pliku.
Plik index.html musi być bezpośrednio w głównym katalogu repozytorium.
