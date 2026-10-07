// 분야별 아이콘
const categoryIcons = {
  "리서치": "🔎",
  "글쓰기": "✍️",
  "녹음·회의록": "🎙️",
  "시각화·PPT": "📊",
  "AI 만화·스토리보드": "🎨",
  "웹·UI/UX 디자인": "🖥️",
  "이미지 생성": "🖼️",
  "영상": "🎬",
  "음성·음악": "🎵",
  "업무 자동화": "⚙️",
};

// view: all(전체 서비스) / my(내 앱) / combos(추천 조합)
const state = { view: "all", category: "전체", price: "all", query: "" };

const grid = document.getElementById("grid");
const chips = document.getElementById("chips");
const result = document.getElementById("result");
const empty = document.getElementById("empty");
const emptyMy = document.getElementById("emptyMy");
const clearMy = document.getElementById("clearMy");
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const combosEl = document.getElementById("combos");

// ---------- 내 앱 저장 (이 브라우저에 저장됨) ----------
const STORAGE_KEY = "ai-guide:my-apps";

function loadMyApps() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return new Set(Array.isArray(saved) ? saved : []);
  } catch (e) {
    return new Set();
  }
}

const myApps = loadMyApps();

function saveMyApps() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...myApps]));
  } catch (e) {
    // 저장이 막힌 브라우저(시크릿 모드 등)에서는 이번 방문 동안만 유지
  }
  const count = document.getElementById("myCount");
  count.textContent = myApps.size;
  count.classList.remove("bump");
  void count.offsetWidth; // 애니메이션 다시 시작
  count.classList.add("bump");
}

function toggleMyApp(name) {
  if (myApps.has(name)) {
    myApps.delete(name);
    showToast(`${name} — 내 앱에서 뺐어요`);
  } else {
    myApps.add(name);
    showToast(`⭐ ${name} — 내 앱에 담았어요`);
  }
  saveMyApps();
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

// 이름으로 서비스 찾기 (같은 서비스가 여러 분야에 있으면 첫 번째)
function findService(name) {
  return services.find((s) => s.name === name);
}

// ---------- 요금 표시 ----------
// "무료 (오픈소스)"처럼 설명이 붙어도 무료로 분류
function priceType(price) {
  if (price.startsWith("무료+유료")) return "mixed";
  if (price.startsWith("무료")) return "free";
  return "paid";
}

// 무료 = 파란 마크, 유료 = 빨간 마크, 무료+유료 = 둘 다
function priceMarks(price) {
  const type = priceType(price);
  const marks = [];
  if (type !== "paid") marks.push('<span class="badge free">무료</span>');
  if (type !== "free") marks.push('<span class="badge paid">유료</span>');
  return `<span class="marks" title="${escapeHtml(price)}">${marks.join("")}</span>`;
}

// "무료 (오픈소스)" → "오픈소스"
function priceExtra(price) {
  const m = price.match(/\((.+)\)/);
  return m ? m[1] : "";
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function highlight(text) {
  const safe = escapeHtml(text);
  if (!state.query) return safe;
  const q = escapeHtml(state.query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(q, "gi"), (m) => `<mark>${m}</mark>`);
}

function faviconUrl(url) {
  const host = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
}

// ---------- 서비스 목록 ----------
function matches(s) {
  if (state.category !== "전체" && s.category !== state.category) return false;
  if (state.price !== "all" && priceType(s.price) !== state.price) return false;
  if (state.query) {
    const q = state.query.toLowerCase();
    const text = [s.name, s.desc, s.useFor, s.category].join(" ").toLowerCase();
    if (!text.includes(q)) return false;
  }
  return true;
}

// 같은 서비스가 분야별로 여러 번 나오지 않게 하나만
function uniqueByName(list) {
  const seen = new Set();
  return list.filter((s) => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });
}

function myServiceList() {
  return uniqueByName(services.filter((s) => myApps.has(s.name)));
}

function renderStats() {
  const names = new Set(services.map((s) => s.name));
  const cats = new Set(services.map((s) => s.category));
  const freeNames = new Set(services.filter((s) => priceType(s.price) !== "paid").map((s) => s.name));
  document.getElementById("statTotal").textContent = names.size;
  document.getElementById("statCats").textContent = cats.size;
  document.getElementById("statFree").textContent = freeNames.size;
}

function renderChips() {
  const source = state.view === "my" ? myServiceList() : services;
  const counts = { "전체": uniqueByName(source).length };
  source.forEach((s) => { counts[s.category] = (counts[s.category] || 0) + 1; });

  chips.innerHTML = Object.keys(counts).map((cat) => `
    <button type="button" class="chip ${cat === state.category ? "active" : ""}" data-cat="${escapeHtml(cat)}">
      ${categoryIcons[cat] ? `<span aria-hidden="true">${categoryIcons[cat]}</span>` : ""}
      ${escapeHtml(cat)} <span class="count">${counts[cat]}</span>
    </button>`).join("");
}

function cardHtml(s, i) {
  const extra = priceExtra(s.price);
  const saved = myApps.has(s.name);
  const label = saved ? "내 앱에서 빼기" : "내 앱에 담기";
  return `
    <article class="card ${saved ? "saved" : ""}" style="animation-delay:${Math.min(i, 12) * 25}ms">
      <button type="button" class="star ${saved ? "on" : ""}" data-name="${escapeHtml(s.name)}"
        aria-label="${label}" title="${label}">${saved ? "★" : "☆"}</button>
      <div class="card-head">
        <div class="logo"><img src="${faviconUrl(s.url)}" alt="" loading="lazy"
          onerror="this.replaceWith(document.createTextNode('${escapeHtml(s.name[0])}'))"></div>
        <div>
          <div class="card-cat">${categoryIcons[s.category] || ""} ${escapeHtml(s.category)}</div>
          <h2 class="card-name"><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${highlight(s.name)}</a></h2>
        </div>
      </div>
      <p class="card-desc">${highlight(s.desc)}</p>
      ${s.useFor ? `<p class="card-use"><b>추천</b>${highlight(s.useFor)}</p>` : ""}
      <div class="card-foot">
        <div class="foot-price">${priceMarks(s.price)}${extra ? `<span class="price-note">${escapeHtml(extra)}</span>` : ""}</div>
        <button type="button" class="more" data-index="${services.indexOf(s)}">자세히 보기 →</button>
      </div>
    </article>`;
}

function renderGrid() {
  const isMy = state.view === "my";
  let list = (isMy ? myServiceList() : services).filter(matches);
  if (state.category === "전체") list = uniqueByName(list);
  const noSaved = isMy && myApps.size === 0;

  grid.innerHTML = list.map(cardHtml).join("");
  emptyMy.hidden = !noSaved;
  empty.hidden = list.length > 0 || noSaved;
  clearMy.hidden = !isMy || noSaved;
  document.getElementById("filters").hidden = noSaved;
  result.hidden = noSaved;
  result.innerHTML = (isMy ? "⭐ 내 앱 " : "") + `<b>${list.length}</b>개의 서비스`
    + (state.category !== "전체" ? ` · ${escapeHtml(state.category)}` : "")
    + (state.query ? ` · "${escapeHtml(state.query)}" 검색 결과` : "");
}

// ---------- 프로젝트별 추천 조합 ----------
const MODE_KEY = "ai-guide:combo-mode";

function loadComboMode() {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    return comboModes.some((m) => m.id === saved) ? saved : "base";
  } catch (e) {
    return "base";
  }
}

let comboMode = loadComboMode();

// 현재 모드에서 조합의 각 단계가 쓰는 앱·요금제
function comboPicks(combo, mode = comboMode) {
  return combo.steps.map((st) => {
    const pick = st[mode] || st.base;
    return {
      service: findService(pick.app),
      role: pick.role || st.role,
      plan: mode === "base" ? null : pick.plan,
      cost: mode === "base" ? 0 : pick.cost || 0,
    };
  }).filter((p) => p.service);
}

function comboCost(combo, mode = comboMode) {
  return comboPicks(combo, mode).reduce((sum, p) => sum + p.cost, 0);
}

function usd(n) {
  return `$${Math.round(n)}`;
}

function modeOf(id) {
  return comboModes.find((m) => m.id === id);
}

// 모드 버튼에 표시할 월 비용 범위 (예: 월 $8~29)
function modeCostRange(mode) {
  if (mode === "base") return "요금제 자유";
  const costs = combos.map((c) => comboCost(c, mode));
  const min = Math.min(...costs);
  const max = Math.max(...costs);
  return min === max ? `월 ${usd(min)}` : `월 ${usd(min)}~${usd(max)}`;
}

function renderModeBar() {
  document.getElementById("modeBar").innerHTML = comboModes.map((m) => `
    <button type="button" class="mode-btn mode-${m.id} ${m.id === comboMode ? "active" : ""}" data-mode="${m.id}"
      role="tab" aria-selected="${m.id === comboMode}">
      <span class="mode-icon" aria-hidden="true">${m.icon}</span>
      <span class="mode-text">
        <b>${escapeHtml(m.label)}</b>
        <small>${escapeHtml(m.desc)}</small>
      </span>
      <span class="mode-cost">${modeCostRange(m.id)}</span>
    </button>`).join("");

  const m = modeOf(comboMode);
  const list = (items) => items.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  const info = document.getElementById("modeInfo");
  // 기본 추천은 원래 화면 그대로, 요금 모드에서만 범위 설명 표시
  info.hidden = m.id === "base";
  info.className = `mode-info mode-${m.id}`;
  info.innerHTML = `
    <div class="mode-info-title">${m.icon} <b>${escapeHtml(m.label)}</b>으로 할 수 있는 범위</div>
    <div class="mode-info-cols">
      <div><h4>✅ 할 수 있는 것</h4><ul>${list(m.can)}</ul></div>
      <div><h4>⚠️ 감안할 점</h4><ul>${list(m.limit)}</ul></div>
    </div>`;
}

// 조합별로 이 모드에서 할 수 있는 범위
function scopeHtml(combo) {
  const text = combo.scope && combo.scope[comboMode];
  if (!text) return "";
  const m = modeOf(comboMode);
  return `<div class="scope mode-${m.id}"><b>${m.icon} ${escapeHtml(m.label)}로 할 수 있는 범위</b><p>${escapeHtml(text)}</p></div>`;
}

function renderCombos() {
  renderModeBar();
  const isBase = comboMode === "base";

  combosEl.innerHTML = combos.map((combo, ci) => {
    const picks = comboPicks(combo);
    const allSaved = picks.every((p) => myApps.has(p.service.name));
    const freeCount = picks.filter((p) => priceType(p.service.price) !== "paid").length;
    const cost = comboCost(combo);

    const steps = picks.map((p) => `
      <li class="step">
        <div class="step-body">
          ${stepAppHtml(p)}
          <div class="step-role">${escapeHtml(p.role)}</div>
        </div>
      </li>`).join("");

    return `
      <article class="combo" style="animation-delay:${ci * 40}ms">
        <div class="combo-head">
          <div class="combo-icon" aria-hidden="true">${combo.icon}</div>
          <div class="combo-head-text">
            <h3>${escapeHtml(combo.title)}</h3>
            <p>${escapeHtml(combo.desc)}</p>
            <div class="combo-tags">${combo.tags.map((t) => `<span>#${escapeHtml(t)}</span>`).join("")}</div>
          </div>
          ${isBase ? "" : `<div class="combo-cost ${cost ? "" : "zero"}"><small>월 예상</small>${usd(cost)}</div>`}
        </div>
        <ol class="steps">${steps}</ol>
        ${scopeHtml(combo)}
        <div class="combo-foot">
          <span class="combo-note">${isBase
            ? `앱 ${picks.length}개 · <b>${freeCount}개</b> 무료로 시작 가능`
            : `앱 ${picks.length}개 · 월 약 <b class="${cost ? "cost" : ""}">${usd(cost)}</b>`}</span>
          <div class="combo-actions">
            ${combo.example ? `<button type="button" class="combo-example" data-combo="${ci}">💡 예시 보기</button>` : ""}
            ${comboSaveHtml(ci, allSaved)}
          </div>
        </div>
      </article>`;
  }).join("");
}

// 조합 단계에 들어가는 앱 이름 버튼 (누르면 상세 보기)
// 기본 추천은 무료/유료 마크, 요금 모드에서는 요금제 이름과 월 비용 표시
function stepAppHtml(p) {
  const s = p.service;
  const price = p.plan === null
    ? priceMarks(s.price)
    : `<span class="plan ${p.cost ? "paid" : "free"}">${escapeHtml(p.plan)}${p.cost ? ` · $${p.cost}` : ""}</span>`;
  return `
    <button type="button" class="step-app" data-name="${escapeHtml(s.name)}">
      <img src="${faviconUrl(s.url)}" alt="" loading="lazy" onerror="this.remove()">
      ${escapeHtml(s.name)}${myApps.has(s.name) ? '<span class="saved-dot" title="내 앱에 있음">★</span>' : ""}
    </button>${price}`;
}

function comboSaveHtml(ci, allSaved) {
  return `<button type="button" class="combo-save ${allSaved ? "done" : ""}" data-combo="${ci}">
    ${allSaved ? "✓ 모두 담겨 있어요" : "⭐ 조합 통째로 담기"}</button>`;
}

function saveCombo(ci) {
  const combo = combos[ci];
  const added = comboPicks(combo).map((p) => p.service.name).filter((n) => !myApps.has(n));
  if (added.length === 0) {
    showToast("이 조합의 앱은 이미 모두 담겨 있어요");
    return;
  }
  added.forEach((n) => myApps.add(n));
  saveMyApps();
  showToast(`⭐ ${combo.title} — ${added.length}개를 내 앱에 담았어요`);
}

// 조합 사용 예시 (단계별 할 일 · 프롬프트 · 결과) — 지금 고른 모드의 앱으로 보여 줌
function openExample(ci) {
  const combo = combos[ci];
  const ex = combo.example;
  const picks = comboPicks(combo);
  const allSaved = picks.every((p) => myApps.has(p.service.name));
  const m = modeOf(comboMode);

  const steps = picks.map((p, i) => {
    const e = ex.steps[i] || {};
    return `
      <li class="ex-step">
        <div class="ex-app">${stepAppHtml(p)}<span class="ex-role">${escapeHtml(p.role)}</span></div>
        ${e.how ? `<p class="ex-how">${escapeHtml(e.how)}</p>` : ""}
        ${e.prompt ? `
          <div class="ex-prompt">
            <div class="ex-prompt-head"><span>💬 이렇게 입력해 보세요</span>
              <button type="button" class="copy-prompt" data-step="${i}">복사</button></div>
            <p>${escapeHtml(e.prompt)}</p>
          </div>` : ""}
        ${e.output ? `<p class="ex-output"><b>결과</b>${escapeHtml(e.output)}</p>` : ""}
      </li>`;
  }).join("");

  modalBody.innerHTML = `
    <div class="m-head">
      <div class="card-cat">${combo.icon} 사용 예시 · ${m.icon} ${escapeHtml(m.label)}${comboMode === "base" ? "" : ` · 월 약 ${usd(comboCost(combo))}`}</div>
      <h2>${escapeHtml(combo.title)}</h2>
      <p class="ex-scenario">📌 ${escapeHtml(ex.scenario)}</p>
      <button type="button" class="m-close" aria-label="닫기">×</button>
    </div>
    <div class="m-body">
      ${scopeHtml(combo)}
      <ol class="ex-steps">${steps}</ol>
      ${ex.tips && ex.tips.length ? `
        <section class="ex-tips"><h3>✅ 알아두면 좋아요</h3>
          <ul>${ex.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
        </section>` : ""}
      <div class="ex-foot">${comboSaveHtml(ci, allSaved)}</div>
    </div>`;
  modalBody.dataset.combo = ci;
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // file://로 열었을 때 등 clipboard API가 막힌 경우
    const area = document.createElement("textarea");
    area.value = text;
    modalBody.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

// ---------- 화면 전환 ----------
function refresh() {
  if (state.view === "combos") {
    renderCombos();
  } else {
    renderChips();
    renderGrid();
  }
}

function setView(view) {
  state.view = view;
  state.category = "전체";
  const isCombos = view === "combos";

  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  document.getElementById("filters").hidden = isCombos;
  document.getElementById("combosView").hidden = !isCombos;
  document.querySelector(".result-bar").hidden = isCombos;
  grid.hidden = isCombos;
  if (isCombos) {
    empty.hidden = true;
    emptyMy.hidden = true;
  }
  refresh();
  // 주소 뒤에 #view-my, #view-combos를 붙여 새로고침해도 같은 화면 유지
  history.replaceState(null, "", view === "all" ? location.pathname : `#view-${view}`);
}

// ---------- 상세 보기 ----------
function openModal(s) {
  const list = (items) => items.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  const saved = myApps.has(s.name);
  modalBody.innerHTML = `
    <div class="m-head">
      <div class="card-cat">${categoryIcons[s.category] || ""} ${escapeHtml(s.category)}</div>
      <h2>${escapeHtml(s.name)}</h2>
      <p>${escapeHtml(s.desc)}</p>
      <button type="button" class="m-close" aria-label="닫기">×</button>
    </div>
    <div class="m-body">
      ${s.pros.length ? `<section class="m-sec pros"><h3>👍 장점</h3><ul>${list(s.pros)}</ul></section>` : ""}
      ${s.cons.length ? `<section class="m-sec cons"><h3>👎 단점</h3><ul>${list(s.cons)}</ul></section>` : ""}
      ${s.useFor ? `<section class="m-sec"><h3>🎯 이런 용도에 추천</h3><p>${escapeHtml(s.useFor)}</p></section>` : ""}
      <section class="m-sec"><h3>💳 요금</h3>
        <div class="m-price">${priceMarks(s.price)}
        ${s.priceNote ? `<p>${escapeHtml(s.priceNote)}</p>` : ""}</div>
      </section>
      <div class="m-actions">
        <button type="button" class="m-save ${saved ? "on" : ""}" data-name="${escapeHtml(s.name)}">${saved ? "★ 담김" : "☆ 내 앱에 담기"}</button>
        <a class="m-go" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.name)} 바로가기 ↗</a>
      </div>
    </div>`;
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
}

// ---------- 이벤트 ----------
document.getElementById("modeBar").addEventListener("click", (e) => {
  const btn = e.target.closest(".mode-btn");
  if (!btn) return;
  comboMode = btn.dataset.mode;
  try {
    localStorage.setItem(MODE_KEY, comboMode);
  } catch (err) {
    // 저장이 막혀도 화면은 바뀜
  }
  renderCombos();
});

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) setView(btn.dataset.view);
});

chips.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  state.category = btn.dataset.cat;
  renderChips();
  renderGrid();
});

document.getElementById("priceFilter").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  state.price = btn.dataset.price;
  document.querySelectorAll("#priceFilter button").forEach((b) => b.classList.toggle("active", b === btn));
  renderGrid();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  renderGrid();
});

grid.addEventListener("click", (e) => {
  const star = e.target.closest(".star");
  if (star) {
    const name = star.dataset.name;
    toggleMyApp(name);
    // 내 앱에서 마지막 하나를 뺀 분야에 머물지 않도록
    if (state.view === "my" && !myServiceList().some((s) => s.category === state.category)) {
      state.category = "전체";
    }
    refresh();
    grid.querySelectorAll(".star").forEach((b) => {
      if (b.dataset.name === name) b.classList.add("pop");
    });
    return;
  }
  const more = e.target.closest(".more");
  if (more) openModal(services[more.dataset.index]);
});

combosEl.addEventListener("click", (e) => {
  const app = e.target.closest(".step-app");
  if (app) {
    openModal(findService(app.dataset.name));
    return;
  }
  const example = e.target.closest(".combo-example");
  if (example) {
    openExample(Number(example.dataset.combo));
    return;
  }
  const save = e.target.closest(".combo-save");
  if (save) {
    saveCombo(Number(save.dataset.combo));
    renderCombos();
  }
});

modal.addEventListener("click", (e) => {
  // 바깥(배경) 클릭이나 닫기 버튼으로 닫기
  if (e.target === modal || e.target.closest(".m-close")) {
    modal.close();
    return;
  }

  // 예시 안의 앱 이름 → 그 앱 상세 보기
  const app = e.target.closest(".step-app");
  if (app) {
    openModal(findService(app.dataset.name));
    return;
  }

  // 예시 프롬프트 복사
  const copy = e.target.closest(".copy-prompt");
  if (copy) {
    const combo = combos[modalBody.dataset.combo];
    copyText(combo.example.steps[copy.dataset.step].prompt).then(() => {
      copy.textContent = "✓ 복사됨";
      copy.classList.add("done");
      setTimeout(() => { copy.textContent = "복사"; copy.classList.remove("done"); }, 1500);
    });
    return;
  }

  // 예시 화면에서 조합 통째로 담기
  const comboSave = e.target.closest(".combo-save");
  if (comboSave) {
    const ci = Number(comboSave.dataset.combo);
    saveCombo(ci);
    comboSave.outerHTML = comboSaveHtml(ci, true);
    refresh();
    return;
  }

  const save = e.target.closest(".m-save");
  if (!save) return;
  toggleMyApp(save.dataset.name);
  const on = myApps.has(save.dataset.name);
  save.classList.toggle("on", on);
  save.textContent = on ? "★ 담김" : "☆ 내 앱에 담기";
  refresh();
});

clearMy.addEventListener("click", () => {
  if (!confirm(`내 앱 ${myApps.size}개를 모두 비울까요?`)) return;
  myApps.clear();
  saveMyApps();
  state.category = "전체";
  refresh();
});

emptyMy.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-goto]");
  if (btn) setView(btn.dataset.goto);
});

document.getElementById("reset").addEventListener("click", () => {
  state.category = "전체";
  state.price = "all";
  state.query = "";
  searchInput.value = "";
  document.querySelectorAll("#priceFilter button").forEach((b) => b.classList.toggle("active", b.dataset.price === "all"));
  refresh();
});

// ---------- 시작 ----------
renderStats();
document.getElementById("myCount").textContent = myApps.size;
const startView = location.hash.replace("#view-", "");
setView(["my", "combos"].includes(startView) ? startView : "all");
