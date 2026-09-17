/* ============================================================
   AniStream — app.js (Vanilla JS, ES6+)
   Sections:
     1. Data layer (replace with your API later)
     2. State + DOM refs
     3. Hero (featured rotation + dynamic Watch Now)
     4. Genre filters + search + sort (real-time)
     5. Card grid rendering + hover overlay
     6. Player modal + episode list
     7. Info modal + global events / init
   ============================================================ */

/* ---------------- 1. DATA LAYER ----------------
   Poster URLs: MyAnimeList CDN (hotlink-friendly).
   Backdrops: Unsplash (stable). Swap for TMDB in production.
   TRAILERS: official YouTube trailer/PV per title, each verified
   via oEmbed (official channels: Crunchyroll, Aniplex USA,
   TOHO animation, PONY CANYON, MAPPA, Toei, ONE PIECE ENG).
   Embedded with youtube-nocookie for privacy. Episode buttons
   browse the episode list UI; playback is the official trailer
   (full episodes are licensed to paid streamers and cannot be
   embedded legally). Replace with your licensed HLS CDN in prod. */

const TRAILERS = {
  'solo-leveling':    { id: 'NtssbUbxDDM', by: 'Crunchyroll' },
  'frieren':          { id: 'Iwr1aLEDpe4', by: 'Crunchyroll' },
  'jujutsu-kaisen':   { id: '5yb2N3pnztU', by: 'TOHO animation' },
  'demon-slayer':     { id: 'PUeB0qbisq0', by: 'Aniplex USA' },
  'attack-on-titan':  { id: 'E7WytLM2KvY', by: 'PONY CANYON' },
  'chainsaw-man':     { id: 'l96zmDlWCBk', by: 'Crunchyroll' },
  'spy-x-family':     { id: '30Dy3GERCqQ', by: 'TOHO animation' },
  'oshi-no-ko':       { id: 'BQ28u-8c-hI', by: 'Oshi no Ko official' },
  'vinland-saga':     { id: 'Ph50sNkApVM', by: 'Crunchyroll' },
  'my-hero-academia': { id: 'fqMHdYPxl3Y', by: 'TOHO animation' },
  'one-piece':        { id: 'okSWhWr52u8', by: 'ONE PIECE Official ENG' },
  'death-note':       { id: 'NlJZ-YgAt-c', by: 'Crunchyroll' },
};

function trailerEmbedUrl(animeId) {
  const t = TRAILERS[animeId];
  if (!t) return '';
  return `https://www.youtube-nocookie.com/embed/${t.id}?autoplay=1&rel=0`;
}

function trailerWatchUrl(animeId) {
  const t = TRAILERS[animeId];
  return t ? `https://www.youtube.com/watch?v=${t.id}` : '#';
}

const ANIME_DATA = [
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    japanese: 'Ore dake Level Up na Ken',
    synopsis: 'Sung Jinwoo, the weakest hunter of all mankind, stumbles into a double dungeon that changes everything. Granted a mysterious System that lets him level up without limits, he rises from the weakest to a shadow monarch the world has never seen.',
    genres: ['Action', 'Fantasy', 'Adventure'],
    episodes: 12, year: 2024, rating: 8.7, type: 'TV Series', studio: 'A-1 Pictures',
    poster: 'https://cdn.myanimelist.net/images/anime/1928/140031.jpg',
    backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920&auto=format&fit=crop',
    featured: true, badge: '#1 Trending Now',
  },
  {
    id: 'frieren',
    title: 'Frieren: Beyond Journey\'s End',
    japanese: 'Sousou no Frieren',
    synopsis: 'Elven mage Frieren outlives the hero Himmel and his party. Decades later she sets out on a new journey to understand humanity, grief, and the fleeting time she once took for granted.',
    genres: ['Fantasy', 'Drama', 'Adventure'],
    episodes: 28, year: 2023, rating: 9.1, type: 'TV Series', studio: 'Madhouse',
    poster: 'https://cdn.myanimelist.net/images/anime/2226/132764.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    featured: true, badge: '#1 Top Rated of All Time',
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen Season 2',
    japanese: 'Jujutsu Kaisen: Shibuya Incident',
    synopsis: 'Yuji Itadori swallows a cursed finger and joins Tokyo Jujutsu High. In Shibuya, curses and sorcerers collide in an all-out war that will shatter the world of jujutsu forever.',
    genres: ['Action', 'Supernatural', 'Drama'],
    episodes: 23, year: 2023, rating: 8.9, type: 'TV Series', studio: 'MAPPA',
    poster: 'https://cdn.myanimelist.net/images/anime/1792/138022.jpg',
    backdrop: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1920&auto=format&fit=crop',
    featured: true, badge: 'Most Watched This Week',
  },
  {
    id: 'demon-slayer',
    title: 'Demon Slayer: Swordsmith Village',
    japanese: 'Kimetsu no Yaiba',
    synopsis: 'Tanjiro travels to the Swordsmith Village to repair his blade, only to face two Upper Rank demons. Mist Hashira Muichiro and Love Hashira Mitsuri join the battle.',
    genres: ['Action', 'Fantasy', 'Drama'],
    episodes: 11, year: 2023, rating: 8.6, type: 'TV Series', studio: 'ufotable',
    poster: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
    featured: false,
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan: Final Season',
    japanese: 'Shingeki no Kyojin',
    synopsis: 'Eren Yeager unleashes the Rumbling while his former friends race to stop him. A decade-long saga of freedom, hatred and survival reaches its devastating finale.',
    genres: ['Action', 'Drama', 'Mystery'],
    episodes: 28, year: 2023, rating: 9.0, type: 'TV Series', studio: 'MAPPA',
    poster: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    featured: false,
  },
  {
    id: 'chainsaw-man',
    title: 'Chainsaw Man',
    japanese: 'Chainsaw Man',
    synopsis: 'Broke devil hunter Denji fuses with his chainsaw-dog Pochita and becomes Chainsaw Man — recruited by Public Safety to hunt devils, chase dreams, and maybe touch grass.',
    genres: ['Action', 'Supernatural', 'Comedy'],
    episodes: 12, year: 2022, rating: 8.5, type: 'TV Series', studio: 'MAPPA',
    poster: 'https://cdn.myanimelist.net/images/anime/1806/136007.jpg',
    featured: false,
  },
  {
    id: 'spy-x-family',
    title: 'Spy x Family Season 2',
    japanese: 'Spy x Family',
    synopsis: 'Master spy Twilight, assassin Yor, and esper Anya keep playing the perfect family — while hiding world-shaking secrets from each other. Mission: survive school, work, and dinner.',
    genres: ['Comedy', 'Action', 'Slice of Life'],
    episodes: 12, year: 2023, rating: 8.3, type: 'TV Series', studio: 'Wit × CloverWorks',
    poster: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg',
    featured: false,
  },
  {
    id: 'oshi-no-ko',
    title: 'Oshi no Ko',
    japanese: 'Oshi no Ko',
    synopsis: 'Idol Ai Hoshino is murdered, and her twin children — reincarnated fans — infiltrate the entertainment industry to uncover the truth behind fame, lies, and revenge.',
    genres: ['Drama', 'Mystery', 'Supernatural'],
    episodes: 11, year: 2023, rating: 8.4, type: 'TV Series', studio: 'Doga Kobo',
    poster: 'https://cdn.myanimelist.net/images/anime/1812/134736.jpg',
    featured: false,
  },
  {
    id: 'vinland-saga',
    title: 'Vinland Saga Season 2',
    japanese: 'Vinland Saga',
    synopsis: 'Enslaved and broken, Thorfinn toils on a Danish farm and confronts the emptiness of revenge. A slow, powerful meditation on violence and the meaning of a true warrior.',
    genres: ['Action', 'Drama', 'Adventure'],
    episodes: 24, year: 2023, rating: 8.8, type: 'TV Series', studio: 'MAPPA',
    poster: 'https://cdn.myanimelist.net/images/anime/1465/119846.jpg',
    featured: false,
  },
  {
    id: 'my-hero-academia',
    title: 'My Hero Academia Season 7',
    japanese: 'Boku no Hero Academia',
    synopsis: 'Deku and Class 1-A face Shigaraki and All For One in the final war. Heroes from around the world converge as society itself hangs in the balance.',
    genres: ['Action', 'Comedy', 'Drama'],
    episodes: 21, year: 2024, rating: 8.2, type: 'TV Series', studio: 'Bones',
    poster: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg',
    featured: false,
  },
  {
    id: 'one-piece',
    title: 'One Piece: Egghead Arc',
    japanese: 'One Piece',
    synopsis: 'The Straw Hats land on Dr. Vegapunk\'s future island Egghead as the Navy closes in. Secrets of the Void Century surface — and the saga hurtles toward its endgame.',
    genres: ['Action', 'Adventure', 'Comedy'],
    episodes: 1100, year: 2024, rating: 8.9, type: 'TV Series', studio: 'Toei Animation',
    poster: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
    featured: false,
  },
  {
    id: 'death-note',
    title: 'Death Note',
    japanese: 'Death Note',
    synopsis: 'Genius Light Yagami finds a notebook that kills anyone whose name is written in it. Detective L closes in. A legendary cat-and-mouse game of justice and ego begins.',
    genres: ['Mystery', 'Thriller', 'Supernatural'],
    episodes: 37, year: 2006, rating: 8.6, type: 'TV Series', studio: 'Madhouse',
    poster: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
    featured: false,
  },
];

/* ---------------- 2. STATE + DOM ---------------- */

const state = {
  query: '',
  genre: 'All',
  sort: 'rating',
  featuredIndex: 0,
  currentAnime: null,   // anime open in player
  currentEpisode: 1,
  dub: false,           // SUB / DUB toggle (demo: same video)
};

const $ = (sel) => document.querySelector(sel);

const els = {
  navbar: $('#navbar'),
  mobileMenuBtn: $('#mobileMenuBtn'),
  mobileMenu: $('#mobileMenu'),
  heroBackdrop: $('#heroBackdrop'),
  heroBadge: $('#heroBadge'),
  heroTitle: $('#heroTitle'),
  heroMeta: $('#heroMeta'),
  heroGenres: $('#heroGenres'),
  heroSynopsis: $('#heroSynopsis'),
  heroWatchBtn: $('#heroWatchBtn'),
  heroInfoBtn: $('#heroInfoBtn'),
  heroDots: $('#heroDots'),
  searchInput: $('#searchInput'),
  clearSearch: $('#clearSearch'),
  sortSelect: $('#sortSelect'),
  genreFilters: $('#genreFilters'),
  resultCount: $('#resultCount'),
  resetFilters: $('#resetFilters'),
  animeGrid: $('#animeGrid'),
  emptyState: $('#emptyState'),
  emptyReset: $('#emptyReset'),
  // player
  playerModal: $('#playerModal'),
  playerBackdrop: $('#playerBackdrop'),
  playerClose: $('#playerClose'),
  playerKicker: $('#playerKicker'),
  playerTitle: $('#playerTitle'),
  playerEpisodeLabel: $('#playerEpisodeLabel'),
  playerFrame: $('#playerFrame'),
  playerYTLink: $('#playerYTLink'),
  playerSynopsis: $('#playerSynopsis'),
  playerMetaLine: $('#playerMetaLine'),
  episodeList: $('#episodeList'),
  epCount: $('#epCount'),
  prevEpBtn: $('#prevEpBtn'),
  nextEpBtn: $('#nextEpBtn'),
  // info
  infoModal: $('#infoModal'),
  infoBackdrop: $('#infoBackdrop'),
  infoClose: $('#infoClose'),
  infoContent: $('#infoContent'),
  infoWatchBtn: $('#infoWatchBtn'),
};

const featuredAnime = ANIME_DATA.filter((a) => a.featured);
const ALL_GENRES = ['All', ...new Set(ANIME_DATA.flatMap((a) => a.genres))].sort((a, b) =>
  a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)
);

/* ---------------- 3. HERO ---------------- */

function starSVG() {
  return `<svg class="w-4 h-4 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.3l7.1-.7L12 2z"/></svg>`;
}

function renderHero(index) {
  const anime = featuredAnime[index];
  if (!anime) return;
  state.featuredIndex = index;

  // Fade swap
  els.heroBackdrop.style.opacity = '0';
  const swap = () => {
    els.heroBackdrop.src = anime.backdrop || anime.poster;
    els.heroBackdrop.alt = `${anime.title} backdrop`;
    els.heroBackdrop.onload = () => (els.heroBackdrop.style.opacity = '1');
    // Fallback if backdrop fails: show poster blurred
    els.heroBackdrop.onerror = () => {
      els.heroBackdrop.onerror = null;
      els.heroBackdrop.src = anime.poster;
      els.heroBackdrop.style.opacity = '1';
    };
    // In case cached (onload may not fire)
    setTimeout(() => (els.heroBackdrop.style.opacity = '1'), 350);
  };
  setTimeout(swap, 150);

  els.heroBadge.textContent = anime.badge || 'Featured';
  els.heroTitle.textContent = anime.title;
  els.heroSynopsis.textContent = anime.synopsis;

  els.heroMeta.innerHTML = `
    <span class="inline-flex items-center gap-1.5 font-semibold text-white">${starSVG()} ${anime.rating.toFixed(1)}</span>
    <span class="text-slate-500">•</span><span>${anime.year}</span>
    <span class="text-slate-500">•</span><span>${anime.type}</span>
    <span class="text-slate-500">•</span><span class="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-xs font-semibold">${anime.episodes} EP</span>
    <span class="text-slate-500 hidden sm:inline">•</span><span class="hidden sm:inline text-slate-400">${anime.studio}</span>
  `;

  els.heroGenres.innerHTML = anime.genres
    .map((g) => `<button data-genre="${g}" class="hero-genre px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-brand-600 border border-white/15 backdrop-blur transition">${g}</button>`)
    .join('');

  els.heroDots.innerHTML = featuredAnime
    .map((_, i) => `<button class="hero-dot ${i === index ? 'active' : ''}" data-index="${i}" aria-label="Show featured ${i + 1}"></button>`)
    .join('');

  // Dynamic Watch Now → opens player for THIS anime, episode 1
  els.heroWatchBtn.onclick = () => openPlayer(anime.id, 1);
  els.heroInfoBtn.onclick = () => openInfo(anime.id);
}

// Auto-rotate featured every 8s (pause on hover)
let heroTimer = null;
function startHeroRotation() {
  stopHeroRotation();
  heroTimer = setInterval(() => {
    renderHero((state.featuredIndex + 1) % featuredAnime.length);
  }, 8000);
}
function stopHeroRotation() {
  if (heroTimer) clearInterval(heroTimer);
}

/* ---------------- 4. FILTER / SEARCH / SORT ---------------- */

function renderGenrePills() {
  els.genreFilters.innerHTML = ALL_GENRES.map(
    (g) => `<button role="tab" data-genre="${g}" class="genre-pill ${state.genre === g ? 'active' : ''}">${g}</button>`
  ).join('');
}

function getFilteredAnime() {
  const q = state.query.trim().toLowerCase();
  let list = ANIME_DATA.filter((a) => {
    const matchGenre = state.genre === 'All' || a.genres.includes(state.genre);
    const matchQuery =
      !q ||
      a.title.toLowerCase().includes(q) ||
      (a.japanese && a.japanese.toLowerCase().includes(q)) ||
      a.genres.some((g) => g.toLowerCase().includes(q));
    return matchGenre && matchQuery;
  });

  const sorters = {
    rating: (a, b) => b.rating - a.rating,
    year: (a, b) => b.year - a.year,
    title: (a, b) => a.title.localeCompare(b.title),
    episodes: (a, b) => b.episodes - a.episodes,
  };
  return list.sort(sorters[state.sort] || sorters.rating);
}

// Debounce helper — keeps typing smooth on large catalogs
function debounce(fn, ms = 180) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ---------------- 5. CARD GRID ---------------- */

function genreTag(g) {
  return `<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-black/60 border border-white/15 backdrop-blur">${g}</span>`;
}

function cardHTML(anime, i) {
  return `
  <article class="anime-card group relative rounded-2xl overflow-hidden bg-base-850 border border-white/10 hover:border-brand-500/60 hover:shadow-glow transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
    data-id="${anime.id}" tabindex="0" role="button" aria-label="Watch ${anime.title}"
    style="animation-delay:${Math.min(i * 40, 400)}ms">
    <div class="poster-wrap relative aspect-[3/4] overflow-hidden bg-base-800">
      <img src="${anime.poster}" alt="${anime.title} poster" loading="lazy"
        class="w-full h-full object-cover"
        onerror="this.onerror=null;this.src='https://picsum.photos/seed/${anime.id}/400/533'" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>

      <!-- top badges -->
      <div class="absolute top-2 left-2 flex items-center gap-1.5">
        <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-black/70 border border-white/15 backdrop-blur">${starSVG()} ${anime.rating.toFixed(1)}</span>
      </div>
      <span class="absolute top-2 right-2 px-2 py-1 rounded-lg text-[11px] font-bold bg-brand-600/90 backdrop-blur">${anime.episodes} EP</span>

      <!-- hover overlay -->
      <div class="hover-overlay absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/70 to-transparent pt-10">
        <div class="flex items-center gap-2 mb-2">
          <button class="play-btn w-11 h-11 rounded-full grid place-items-center bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow shrink-0" data-action="play" aria-label="Play ${anime.title}">
            <svg class="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>
          </button>
          <button class="w-9 h-9 rounded-full grid place-items-center bg-white/15 hover:bg-white/30 backdrop-blur border border-white/20" data-action="info" aria-label="More info">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M12 5v.01M12 12v7"/></svg>
          </button>
          <span class="ml-auto text-[11px] font-semibold text-slate-300">${anime.year} • ${anime.type}</span>
        </div>
        <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">${anime.synopsis}</p>
      </div>
    </div>

    <div class="p-3">
      <h3 class="font-display font-semibold text-sm leading-snug truncate group-hover:text-brand-400 transition">${anime.title}</h3>
      <div class="flex flex-wrap gap-1.5 mt-2">${anime.genres.slice(0, 3).map(genreTag).join('')}</div>
    </div>
  </article>`;
}

function renderGrid() {
  const list = getFilteredAnime();

  els.resultCount.textContent =
    list.length === 0
      ? 'No results'
      : `Showing ${list.length} of ${ANIME_DATA.length} titles${state.genre !== 'All' ? ` in “${state.genre}”` : ''}${state.query ? ` for “${state.query}”` : ''}`;

  els.emptyState.classList.toggle('hidden', list.length !== 0);
  els.animeGrid.innerHTML = list.map(cardHTML).join('');
}

function setGenre(genre) {
  state.genre = genre;
  renderGenrePills();
  renderGrid();
}

/* ---------------- 6. PLAYER MODAL ----------------
   Layout: trailer player (left) + episode selection list (right).
   Playback is the title's official YouTube trailer (see TRAILERS).
   Episode buttons update the browser UI + restart the trailer;
   swap `trailerEmbedUrl()` with your licensed episode CDN in prod. */

const MAX_LISTED_EPISODES = 24; // cap UI for 1000+ ep series

function episodeTitle(anime, ep) {
  const total = Math.min(anime.episodes, MAX_LISTED_EPISODES);
  if (anime.episodes > MAX_LISTED_EPISODES && ep === total) return `Episode ${ep} — latest… (+${anime.episodes - total} more)`;
  const hooks = ['The Awakening', 'Shadows Rise', 'A New Resolve', 'Battle Cry', 'Turning Point', 'Reckoning'];
  return `Episode ${ep} — ${hooks[(ep - 1) % hooks.length]}`;
}

function openPlayer(animeId, episode = 1) {
  const anime = ANIME_DATA.find((a) => a.id === animeId);
  if (!anime) return;
  state.currentAnime = anime;
  state.currentEpisode = Math.min(Math.max(1, episode), anime.episodes);
  renderPlayer();
  els.playerModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // lock scroll
  stopHeroRotation();
}

function closePlayer() {
  els.playerModal.classList.add('hidden');
  els.playerFrame.setAttribute('src', ''); // stop YouTube playback
  document.body.style.overflow = '';
  startHeroRotation();
}

function renderPlayer() {
  const anime = state.currentAnime;
  if (!anime) return;
  const ep = state.currentEpisode;
  const total = anime.episodes;
  const listed = Math.min(total, MAX_LISTED_EPISODES);
  const trailer = TRAILERS[anime.id];

  els.playerKicker.textContent = `Official Trailer • ${trailer ? trailer.by : ''} • ${anime.year}`;
  els.playerTitle.textContent = anime.title;
  els.playerEpisodeLabel.textContent = `${episodeTitle(anime, ep)}  •  E${ep} / ${total}`;
  els.playerSynopsis.textContent = anime.synopsis;
  els.playerMetaLine.textContent = `★ ${anime.rating.toFixed(1)}  •  ${anime.genres.join(' · ')}  •  ${anime.studio}`;
  els.epCount.textContent = `(${total})`;

  // Load official trailer (re-setting src restarts it on episode change)
  els.playerFrame.setAttribute('src', trailerEmbedUrl(anime.id));
  els.playerFrame.setAttribute('title', `${anime.title} — official trailer`);
  els.playerYTLink.setAttribute('href', trailerWatchUrl(anime.id));

  // Episode list
  els.episodeList.innerHTML = Array.from({ length: listed }, (_, i) => {
    const n = i + 1;
    const isActive = n === ep;
    return `
    <li>
      <button class="episode-row ${isActive ? 'active' : ''}" data-ep="${n}">
        <span class="ep-num">${n}</span>
        <span class="min-w-0 flex-1">
          <span class="block text-[13px] font-semibold truncate">${episodeTitle(anime, n)}</span>
          <span class="block text-[11px] text-slate-400 mt-0.5">24 min • ${state.dub ? 'DUB' : 'SUB'} HD</span>
        </span>
        ${isActive
          ? '<span class="text-[11px] font-bold text-brand-400 shrink-0">▶ PLAYING</span>'
          : '<span class="text-slate-500 shrink-0">▷</span>'}
      </button>
    </li>`;
  }).join('');

  // Scroll active episode into view
  requestAnimationFrame(() => {
    els.episodeList.querySelector('.episode-row.active')?.scrollIntoView({ block: 'nearest' });
  });

  // Prev / next bounds
  els.prevEpBtn.disabled = ep <= 1;
  els.nextEpBtn.disabled = ep >= total;
  els.prevEpBtn.classList.toggle('opacity-40', ep <= 1);
  els.nextEpBtn.classList.toggle('opacity-40', ep >= total);
}

function gotoEpisode(n) {
  if (!state.currentAnime) return;
  state.currentEpisode = Math.min(Math.max(1, n), state.currentAnime.episodes);
  renderPlayer();
}

/* ---------------- 7. INFO MODAL ---------------- */

let infoAnimeId = null;

function openInfo(animeId) {
  const anime = ANIME_DATA.find((a) => a.id === animeId);
  if (!anime) return;
  infoAnimeId = animeId;
  els.infoContent.innerHTML = `
    <div class="flex gap-4">
      <img src="${anime.poster}" alt="${anime.title}" class="w-24 h-32 object-cover rounded-xl border border-white/10 shrink-0"
        onerror="this.onerror=null;this.src='https://picsum.photos/seed/${anime.id}/200/280'" />
      <div class="min-w-0">
        <h3 class="font-display font-bold text-xl leading-tight">${anime.title}</h3>
        <p class="text-xs text-slate-400 mt-1">${anime.japanese} • ${anime.year}</p>
        <p class="text-xs mt-2 inline-flex items-center gap-1.5 font-semibold">${starSVG()} ${anime.rating.toFixed(1)} <span class="text-slate-500 font-normal">• ${anime.episodes} episodes • ${anime.studio}</span></p>
        <div class="flex flex-wrap gap-1.5 mt-2">${anime.genres.map(genreTag).join('')}</div>
      </div>
    </div>
    <p class="text-sm text-slate-300 leading-relaxed mt-4">${anime.synopsis}</p>
  `;
  els.infoModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeInfo() {
  els.infoModal.classList.add('hidden');
  if (els.playerModal.classList.contains('hidden')) document.body.style.overflow = '';
}

/* ---------------- 8. EVENTS + INIT ---------------- */

function bindEvents() {
  // Navbar scroll style
  window.addEventListener('scroll', () => {
    els.navbar.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  // Mobile menu
  els.mobileMenuBtn.addEventListener('click', () => els.mobileMenu.classList.toggle('hidden'));

  // Hero dots (event delegation) + hero genre shortcut
  els.heroDots.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-index]');
    if (btn) { renderHero(Number(btn.dataset.index)); startHeroRotation(); }
  });
  els.heroGenres.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-genre]');
    if (!btn) return;
    setGenre(btn.dataset.genre);
    document.querySelector('#browse').scrollIntoView({ behavior: 'smooth' });
  });
  $('#hero').addEventListener('mouseenter', stopHeroRotation);
  $('#hero').addEventListener('mouseleave', startHeroRotation);

  // Real-time search
  const onSearch = debounce((value) => {
    state.query = value;
    els.clearSearch.classList.toggle('hidden', !value);
    renderGrid();
  });
  els.searchInput.addEventListener('input', (e) => onSearch(e.target.value));
  els.clearSearch.addEventListener('click', () => {
    els.searchInput.value = '';
    state.query = '';
    els.clearSearch.classList.add('hidden');
    renderGrid();
    els.searchInput.focus();
  });

  // Genre pills
  els.genreFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-genre]');
    if (btn) setGenre(btn.dataset.genre);
  });

  // Sort
  els.sortSelect.addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderGrid();
  });

  // Reset
  const resetAll = () => {
    state.query = '';
    state.genre = 'All';
    state.sort = 'rating';
    els.searchInput.value = '';
    els.sortSelect.value = 'rating';
    els.clearSearch.classList.add('hidden');
    renderGenrePills();
    renderGrid();
  };
  els.resetFilters.addEventListener('click', resetAll);
  els.emptyReset.addEventListener('click', resetAll);

  // Card grid clicks (delegation): card → play, info btn → info
  els.animeGrid.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    const card = e.target.closest('[data-id]');
    if (!card) return;
    const id = card.dataset.id;
    if (actionBtn?.dataset.action === 'info') {
      e.stopPropagation();
      openInfo(id);
    } else {
      openPlayer(id, 1);
    }
  });
  els.animeGrid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest?.('[data-id]');
    if (card) { e.preventDefault(); openPlayer(card.dataset.id, 1); }
  });

  // Player modal
  els.playerClose.addEventListener('click', closePlayer);
  els.playerBackdrop.addEventListener('click', closePlayer);
  els.episodeList.addEventListener('click', (e) => {
    const row = e.target.closest('[data-ep]');
    if (row) gotoEpisode(Number(row.dataset.ep));
  });
  els.prevEpBtn.addEventListener('click', () => gotoEpisode(state.currentEpisode - 1));
  els.nextEpBtn.addEventListener('click', () => gotoEpisode(state.currentEpisode + 1));

  // SUB / DUB toggle (demo)
  document.querySelectorAll('.ep-range-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ep-range-btn').forEach((b) => {
        b.classList.remove('bg-brand-600', 'font-semibold');
        b.classList.add('bg-white/10');
      });
      btn.classList.add('bg-brand-600', 'font-semibold');
      btn.classList.remove('bg-white/10');
      if (btn.dataset.range !== 'all') state.dub = btn.dataset.range === 'dub';
      renderPlayer();
    });
  });

  // Info modal
  els.infoClose.addEventListener('click', closeInfo);
  els.infoBackdrop.addEventListener('click', closeInfo);
  els.infoWatchBtn.addEventListener('click', () => {
    if (!infoAnimeId) return;
    closeInfo();
    openPlayer(infoAnimeId, 1);
  });

  // Keyboard: Esc closes modals, ←/→ switch episodes
  document.addEventListener('keydown', (e) => {
    if (!els.playerModal.classList.contains('hidden')) {
      if (e.key === 'Escape') closePlayer();
      if (e.key === 'ArrowRight') gotoEpisode(state.currentEpisode + 1);
      if (e.key === 'ArrowLeft') gotoEpisode(state.currentEpisode - 1);
    } else if (e.key === 'Escape' && !els.infoModal.classList.contains('hidden')) {
      closeInfo();
    }
  });
}

function showSkeletons(count = 10) {
  els.animeGrid.innerHTML = Array.from({ length: count }, () => `
    <div class="rounded-2xl overflow-hidden border border-white/10 bg-base-850">
      <div class="skeleton aspect-[3/4]"></div>
      <div class="p-3 space-y-2">
        <div class="skeleton h-4 rounded w-3/4"></div>
        <div class="skeleton h-5 rounded-full w-1/2"></div>
      </div>
    </div>`).join('');
  els.resultCount.textContent = 'Loading…';
}

function init() {
  bindEvents();
  renderGenrePills();
  renderHero(0);
  startHeroRotation();
  // Simulate fetch latency so skeleton state is visible
  showSkeletons();
  setTimeout(renderGrid, 450);
}

document.addEventListener('DOMContentLoaded', init);
