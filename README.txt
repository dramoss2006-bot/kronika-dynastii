<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#11120f" />
  <meta name="description" content="Kronika Dynastii — kronika kampanii Crusader Kings III generowana przez Kronika Analyzer." />
  <title>Kronika Dynastii — Analyzer Live</title>
  <link rel="icon" type="image/png" href="assets/favicon-64.png" />
  <link rel="apple-touch-icon" href="assets/icon-180.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Crimson+Pro:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="page-shell">
    <aside class="side-banner"><div class="monogram">KD</div><div class="ornament">✦</div></aside>
    <main class="app">
      <header class="topbar">
        <button class="mobile-menu" type="button" aria-label="Otwórz menu">☰</button>
        <div class="brand-wrap"><div class="crown">♛</div><h1>Kronika Dynastii</h1><p>Pisz historię. Zapamiętaj dziedzictwo.</p></div>
        <div class="profile"><div class="avatar" id="ruler-initial">K</div><div><small>Kampania</small><strong id="ruler-name">Ładowanie…</strong></div></div>
      </header>
      <nav class="nav-tabs" aria-label="Główna nawigacja">
        <button data-view="home" class="active">⌂ Strona główna</button>
        <button data-view="chronicle">▤ Kronika AI</button>
      </nav>
      <div id="loading" class="loading-card">Otwieranie księgi kampanii…</div>
      <div id="error" class="error-card" hidden></div>
      <div id="app-content" hidden>
        <section class="view active" id="view-home"></section>
        <section class="view" id="view-chronicle"></section>
      </div>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>
