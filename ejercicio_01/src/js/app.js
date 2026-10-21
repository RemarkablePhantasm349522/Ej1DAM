const $ = (id) => document.getElementById(id);

const state = {
  page: 1,
  totalPages: 1,
  totalCount: 0,
  activeController: null,
  currentResults: []
};

const TRANSLATIONS = {
  status: {
    alive: 'Vivo',
    dead: 'Muerto',
    unknown: 'Desconocido'
  },
  gender: {
    female: 'Femenino',
    male: 'Masculino',
    genderless: 'Sin género',
    unknown: 'Desconocido'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initElectronBridge();
  initEventListeners();
  loadCharacters();
});

function initElectronBridge() {
  if (window.electronAPI?.appInfo) {
    const { name, version, platform } = window.electronAPI.appInfo;
    const badge = $('appPlatformBadge');
    const versionBadge = $('appVersionBadge');
    if (badge) badge.textContent = `⚡ ESCRITORIO · ${platform.toUpperCase()}`;
    if (versionBadge) versionBadge.textContent = `v${version}`;
  }
}

function initEventListeners() {
  const form = $('searchForm');
  const resetBtn = $('resetBtn');
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');
  const queryInput = $('queryInput');
  const clearSearchBtn = $('clearSearchBtn');
  const closeModalBtn = $('closeModalBtn');
  const characterModal = $('characterModal');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.page = 1;
    loadCharacters();
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    clearSearchBtn.style.display = 'none';
    state.page = 1;
    loadCharacters();
  });

  queryInput.addEventListener('input', () => {
    clearSearchBtn.style.display = queryInput.value ? 'block' : 'none';
  });

  clearSearchBtn.addEventListener('click', () => {
    queryInput.value = '';
    clearSearchBtn.style.display = 'none';
    queryInput.focus();
  });

  prevBtn.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      loadCharacters();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (state.page < state.totalPages) {
      state.page++;
      loadCharacters();
    }
  });

  closeModalBtn.addEventListener('click', closeModal);
  characterModal.addEventListener('click', (e) => {
    if (e.target === characterModal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function buildApiUrl() {
  const url = new URL('https://rickandmortyapi.com/api/character');
  const params = {
    page: state.page,
    name: $('queryInput').value.trim(),
    status: $('statusSelect').value,
    gender: $('genderSelect').value,
    species: $('speciesSelect').value
  };

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

async function loadCharacters() {
  if (state.activeController) {
    state.activeController.abort();
  }

  state.activeController = new AbortController();
  const currentSignal = state.activeController.signal;
  const timeoutId = setTimeout(() => state.activeController?.abort(), 18000);

  showLoadingState();

  try {
    const url = buildApiUrl();
    const response = await fetch(url, { signal: currentSignal });

    if (response.status === 404) {
      handleEmptyResults();
      return;
    }

    if (!response.ok) {
      throw new Error(`Error en el servidor de la API (HTTP ${response.status})`);
    }

    const data = await response.json();

    if (currentSignal.aborted) return;

    state.currentResults = data.results || [];
    state.totalPages = data.info?.pages || 1;
    state.totalCount = data.info?.count || 0;

    renderCharacters(state.currentResults);
    updateStatsAndPagination();
    setStatusMessage(`${state.totalCount} personajes encontrados · Página ${state.page} de ${state.totalPages}`, false);

  } catch (error) {
    if (currentSignal.aborted) return;

    const isTimeout = error.name === 'AbortError';
    const message = isTimeout
      ? 'El tiempo de espera se agotó. Comprueba tu conexión a Internet y vuelve a intentar.'
      : `No se pudo conectar con la API (${error.message}). Verifica tu conexión.`;

    showErrorState(message);
  } finally {
    clearTimeout(timeoutId);
  }
}

function showLoadingState() {
  const grid = $('charactersGrid');
  grid.replaceChildren();

  $('prevBtn').disabled = true;
  $('nextBtn').disabled = true;

  setStatusMessage('Sintonizando frecuencia con el multiverso…', false);

  for (let i = 0; i < 8; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    grid.append(skeleton);
  }
}

function renderCharacters(characters) {
  const grid = $('charactersGrid');
  grid.replaceChildren();

  if (!characters || characters.length === 0) {
    handleEmptyResults();
    return;
  }

  characters.forEach((character) => {
    const card = createCharacterCard(character);
    grid.append(card);
  });
}

function createCharacterCard(character) {
  const article = document.createElement('article');
  article.className = 'character-card';

  const mediaWrapper = document.createElement('div');
  mediaWrapper.className = 'card-media-wrapper';

  const img = document.createElement('img');
  img.className = 'card-image';
  img.src = character.image || '';
  img.alt = `Fotografía de ${character.name}`;
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    img.src = '../assets/icon.png';
  });

  const statusClass = (character.status || 'unknown').toLowerCase();
  const statusPill = document.createElement('div');
  statusPill.className = `status-pill status-${statusClass}`;

  const statusDot = document.createElement('span');
  statusDot.className = 'status-dot';

  const statusText = document.createElement('span');
  statusText.textContent = TRANSLATIONS.status[statusClass] || character.status || 'Desconocido';

  statusPill.append(statusDot, statusText);
  mediaWrapper.append(img, statusPill);

  const content = document.createElement('div');
  content.className = 'card-content';

  const nameH2 = document.createElement('h2');
  nameH2.className = 'character-name';
  nameH2.textContent = character.name;

  const dataList = document.createElement('div');
  dataList.className = 'card-data-list';

  dataList.append(createDataItem('Especie', character.species || 'No especificada'));

  const genderKey = (character.gender || 'unknown').toLowerCase();
  const genderLabel = TRANSLATIONS.gender[genderKey] || character.gender || 'No disponible';
  dataList.append(createDataItem('Género', genderLabel));

  const originName = character.origin?.name || 'Origen desconocido';
  const originItem = createDataItem('Origen', originName);
  originItem.querySelector('.data-value').classList.add('origin-tag');
  dataList.append(originItem);

  const cardFooter = document.createElement('div');
  cardFooter.className = 'card-footer';

  const detailBtn = document.createElement('button');
  detailBtn.type = 'button';
  detailBtn.className = 'btn-detail';
  detailBtn.textContent = 'Ver ficha completa';
  detailBtn.addEventListener('click', () => openModal(character));

  cardFooter.append(detailBtn);
  content.append(nameH2, dataList, cardFooter);
  article.append(mediaWrapper, content);

  return article;
}

function createDataItem(label, value) {
  const item = document.createElement('div');
  item.className = 'data-item';

  const lbl = document.createElement('span');
  lbl.className = 'data-label';
  lbl.textContent = label;

  const val = document.createElement('span');
  val.className = 'data-value';
  val.textContent = value;

  item.append(lbl, val);
  return item;
}

function updateStatsAndPagination() {
  $('totalCharactersCount').textContent = state.totalCount.toLocaleString();
  $('totalPagesCount').textContent = state.totalPages.toLocaleString();

  $('currentPageText').textContent = `Página ${state.page}`;
  $('totalPagesText').textContent = `${state.totalPages}`;

  $('prevBtn').disabled = state.page <= 1;
  $('nextBtn').disabled = state.page >= state.totalPages;
}

function handleEmptyResults() {
  state.totalPages = 1;
  state.totalCount = 0;
  state.currentResults = [];

  const grid = $('charactersGrid');
  grid.replaceChildren();

  const emptyMsg = document.createElement('div');
  emptyMsg.className = 'status-bar';
  emptyMsg.style.gridColumn = '1 / -1';
  emptyMsg.style.padding = '30px';
  emptyMsg.style.textAlign = 'center';
  emptyMsg.textContent = 'No se encontró ningún personaje con esos filtros. Prueba modificando el nombre o los selectores.';

  grid.append(emptyMsg);
  updateStatsAndPagination();
  setStatusMessage('Sin resultados encontrados en esta dimensión.', false);
}

function showErrorState(message) {
  const grid = $('charactersGrid');
  grid.replaceChildren();

  const errorBox = document.createElement('div');
  errorBox.className = 'status-bar error';
  errorBox.style.gridColumn = '1 / -1';
  errorBox.style.padding = '24px';
  errorBox.textContent = message;

  grid.append(errorBox);
  setStatusMessage(message, true);

  $('prevBtn').disabled = true;
  $('nextBtn').disabled = true;
  $('currentPageText').textContent = 'Página —';
  $('totalPagesText').textContent = '—';
}

function setStatusMessage(msg, isError = false) {
  const statusBar = $('statusBar');
  const statusMsg = $('statusMessage');

  statusMsg.textContent = msg;
  if (isError) {
    statusBar.classList.add('error');
  } else {
    statusBar.classList.remove('error');
  }
}

function openModal(character) {
  const modal = $('characterModal');
  const body = $('modalBody');
  body.replaceChildren();

  const hero = document.createElement('div');
  hero.className = 'modal-hero';

  const avatar = document.createElement('img');
  avatar.className = 'modal-avatar';
  avatar.src = character.image;
  avatar.alt = character.name;

  const heroInfo = document.createElement('div');
  const title = document.createElement('h2');
  title.style.fontSize = '24px';
  title.style.marginBottom = '6px';
  title.textContent = character.name;

  const statusClass = (character.status || 'unknown').toLowerCase();
  const statusSpan = document.createElement('span');
  statusSpan.className = `status-pill status-${statusClass}`;
  statusSpan.style.position = 'static';
  statusSpan.style.display = 'inline-flex';
  statusSpan.textContent = `Estado: ${TRANSLATIONS.status[statusClass] || character.status}`;

  heroInfo.append(title, statusSpan);
  hero.append(avatar, heroInfo);

  const metaGrid = document.createElement('div');
  metaGrid.className = 'modal-meta-grid';

  metaGrid.append(
    createDataItem('Especie', character.species || 'N/A'),
    createDataItem('Subtipo', character.type || 'Sin subtipo'),
    createDataItem('Género', TRANSLATIONS.gender[(character.gender || '').toLowerCase()] || character.gender),
    createDataItem('Planeta de Origen', character.origin?.name || 'Desconocido'),
    createDataItem('Ubicación Actual', character.location?.name || 'Desconocida'),
    createDataItem('Apariciones', `${character.episode?.length || 0} episodios registrados`)
  );

  body.append(hero, metaGrid);
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = $('characterModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}
