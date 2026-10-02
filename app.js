import { renderHome } from './home.js';
import { renderTraining as renderTrainingPage } from './treinos.js';
import { renderDiet as renderDietPage } from './alimentacao.js';
import { renderProgress as renderProgressPage } from './evolucao.js';
import { renderProfile as renderProfilePage } from './perfil.js';
import { renderAuthMarkup } from './auth.js';

const FIREBASE_VERSION = '12.2.1';
const firebaseConfig = window.HACKTOON_FIREBASE_CONFIG || {};
const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const today = new Date().toISOString().slice(0, 10);
const defaultMeals = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];
const pageFiles = { landing: 'index.html', demo: 'demo.html', home: 'home.html', training: 'treinos.html', diet: 'alimentacao.html', ai: 'ia-coach.html', progress: 'evolucao.html', profile: 'perfil.html', login: 'login.html', register: 'cadastro.html' };
let page = document.body.dataset.page || 'landing';
let mode = page === 'register' ? 'register' : 'login';
let currentUser = null;
let data = emptyData();
let firebase = null;
let toastTimer;

function emptyData() {
  return { profile: { weight: '', goalWeight: '', calorieGoal: '' }, exercises: [], workouts: [], sessions: [], foods: [], foodLogs: [], weights: [] };
}
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function uid() { return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`; }
function prettyDate(date) { if (!date) return ''; return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }
function safeNumber(value) { const number = Number(value); return Number.isFinite(number) ? number : 0; }
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function cacheKey() { return `hacktoon:data:${currentUser?.uid || 'guest'}`; }
function saveData() {
  localStorage.setItem(cacheKey(), JSON.stringify(data));
  if (firebase && currentUser && !currentUser.demo) {
    firebase.setDoc(firebase.doc(firebase.db, 'users', currentUser.uid, 'appData', 'main'), data)
      .catch(() => showToast('Sem conexão com o Firestore. Os dados continuam salvos neste dispositivo.'));
  }
}
function navigate(nextPage, replace = false) {
  page = nextPage;
  if (nextPage === 'login' || nextPage === 'register') {
    mode = nextPage;
    renderAuth();
  } else if (currentUser) renderApp();
  else { mode = 'login'; renderAuth(); }
  const file = pageFiles[nextPage] || pageFiles.home;
  const method = replace ? 'replaceState' : 'pushState';
  history[method]({ page: nextPage }, '', file);
}
function loadLocalData() {
  try { data = { ...emptyData(), ...JSON.parse(localStorage.getItem(cacheKey()) || '{}') }; }
  catch { data = emptyData(); }
  data.profile = { ...emptyData().profile, ...(data.profile || {}) };
  for (const key of ['exercises', 'workouts', 'sessions', 'foods', 'foodLogs', 'weights']) data[key] = Array.isArray(data[key]) ? data[key] : [];
}

function renderAuth() {
  app.innerHTML = renderAuthMarkup(mode);
}
function seedDemo() {
  const monday = new Date();
  monday.setDate(monday.getDate() - 6);
  const dateAt = (offset) => { const d = new Date(monday); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
  data = {
    profile: { weight: 72.4, goalWeight: 68, calorieGoal: 2100 },
    exercises: [
      { id: 'ex1', name: 'Agachamento livre', group: 'Pernas', type: 'strength' },
      { id: 'ex2', name: 'Supino reto', group: 'Peito', type: 'strength' },
      { id: 'ex3', name: 'Corrida leve', group: 'Cardio', type: 'cardio' }
    ],
    workouts: [{ id: 'w1', name: 'Treino A · Inferiores', exerciseIds: ['ex1', 'ex3'] }, { id: 'w2', name: 'Treino B · Superiores', exerciseIds: ['ex2'] }],
    sessions: [
      { id: 's1', exerciseId: 'ex1', date: dateAt(0), load: 50, reps: 10, sets: 3 },
      { id: 's2', exerciseId: 'ex2', date: dateAt(1), load: 35, reps: 10, sets: 3 },
      { id: 's3', exerciseId: 'ex1', date: dateAt(2), load: 52.5, reps: 10, sets: 3 },
      { id: 's4', exerciseId: 'ex3', date: dateAt(3), duration: 28, distance: 3.5 },
      { id: 's5', exerciseId: 'ex1', date: dateAt(5), load: 55, reps: 10, sets: 3 },
      { id: 's6', exerciseId: 'ex2', date: dateAt(6), load: 37.5, reps: 10, sets: 3 }
    ],
    foods: [{ id: 'f1', name: 'Aveia', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 }, { id: 'f2', name: 'Ovo', calories: 143, protein: 13, carbs: 1.1, fat: 9.5 }, { id: 'f3', name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: .3 }, { id: 'f4', name: 'Peito de frango', calories: 165, protein: 31, carbs: 0, fat: 3.6 }],
    foodLogs: [
      { id: 'l1', foodId: 'f1', date: dateAt(0), meal: 'Café da manhã', amount: 60 }, { id: 'l2', foodId: 'f2', date: dateAt(0), meal: 'Café da manhã', amount: 100 }, { id: 'l3', foodId: 'f4', date: dateAt(0), meal: 'Almoço', amount: 180 },
      { id: 'l4', foodId: 'f3', date: dateAt(1), meal: 'Lanche', amount: 120 }, { id: 'l5', foodId: 'f4', date: dateAt(1), meal: 'Almoço', amount: 160 }, { id: 'l6', foodId: 'f1', date: dateAt(2), meal: 'Café da manhã', amount: 50 },
      { id: 'l7', foodId: 'f4', date: dateAt(3), meal: 'Almoço', amount: 150 }, { id: 'l8', foodId: 'f2', date: dateAt(3), meal: 'Jantar', amount: 100 }, { id: 'l9', foodId: 'f1', date: dateAt(5), meal: 'Café da manhã', amount: 60 },
      { id: 'l10', foodId: 'f4', date: dateAt(5), meal: 'Almoço', amount: 200 }, { id: 'l11', foodId: 'f3', date: dateAt(6), meal: 'Lanche', amount: 100 }
    ],
    weights: [{ id: 'p1', date: dateAt(0), weight: 73.1 }, { id: 'p2', date: dateAt(3), weight: 72.8 }, { id: 'p3', date: dateAt(6), weight: 72.4 }]
  };
}
function navItems() {
  return [['home', '⌂', 'Visão geral'], ['training', '↗', 'Treinos'], ['diet', '◒', 'Alimentação'], ['ai', '✦', 'IA'], ['progress', '⌁', 'Evolução'], ['profile', '◎', 'Perfil']];
}
function navMarkup(mobile = false) {
  return navItems().map(([key, icon, label]) => `<button class="nav-item ${page === key || (page === 'demo' && key === 'home') ? 'active' : ''}" data-nav="${key}" aria-label="${label}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`).join('');
}
function renderApp() {
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Atleta';
  const modeText = currentUser?.demo ? 'Modo demonstração' : 'Conta conectada';
  app.innerHTML = `<div class="app-shell">
    <aside class="sidebar"><a class="brand" href="index.html" aria-label="Body Fit"><span class="brand-logo-frame"><img class="brand-logo" src="img/bodyfit2-removebg-preview.png" alt="Body Fit"></span></a><div class="side-label">Sua rotina</div><nav class="nav-list" aria-label="Navegação principal">${navMarkup()}</nav>
      <div class="sidebar-bottom"><div class="user-mini"><div class="avatar">${escapeHtml(displayName[0]?.toUpperCase() || 'A')}</div><div style="min-width:0"><div class="user-name">${escapeHtml(displayName)}</div><div class="user-mode">${modeText}</div></div></div><button class="nav-item" id="logout-button"><span class="nav-icon">↪</span><span>Sair da conta</span></button></div>
    </aside>
    <section class="main-area"><header class="topbar"><div class="topbar-date">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div><div class="topbar-right"><span class="sync-indicator"><i class="sync-dot"></i>${currentUser?.demo ? 'Dados neste dispositivo' : 'Sincronizado'}</span><button class="btn btn-quiet" id="logout-mobile" aria-label="Sair">Sair</button></div></header><main class="page-content">${renderPage()}</main></section>
    <nav class="mobile-nav" aria-label="Navegação móvel">${navMarkup(true)}</nav>
  </div>`;
  const exerciseSelect = document.querySelector('#session-form-data select[name="exerciseId"]');
  if (exerciseSelect) updateMetrics(exerciseSelect.value);
}
function heading(title, subtitle, actions = '') { return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`; }
function stat(label, value, note, accent = '') { return `<div class="stat"><div class="stat-label">${label}</div><div class="stat-value ${accent}">${value}</div><div class="stat-note">${note}</div></div>`; }
function panel(title, content, subtitle = '', link = '') { return `<section class="panel"><div class="panel-head"><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div>${link}</div>${content}</section>`; }
function chartSvg(values, labels, color = '#6e9d53', target = null) {
  if (!values.some((value) => value > 0)) return '<div class="chart-empty">Adicione registros para visualizar seu histórico.</div>';
  const width = 620, height = 205, left = 42, right = 12, top = 15, bottom = 28;
  const maxValue = Math.max(1, ...values, ...(target === null ? [] : [target])) * 1.15;
  const x = (index) => left + (values.length <= 1 ? (width - left - right) / 2 : index * (width - left - right) / (values.length - 1));
  const y = (value) => top + (height - top - bottom) * (1 - value / maxValue);
  const grid = [0, .5, 1].map((step) => { const yy = y(maxValue * step); return `<line x1="${left}" y1="${yy}" x2="${width - right}" y2="${yy}" stroke="#edf0eb"/><text x="${left - 7}" y="${yy + 3}" text-anchor="end" fill="#96a098" font-size="9">${Math.round(maxValue * step)}</text>`; }).join('');
  const path = values.map((value, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(value)}`).join(' ');
  const targetLine = target === null ? '' : `<line x1="${left}" y1="${y(target)}" x2="${width - right}" y2="${y(target)}" stroke="#ee7864" stroke-dasharray="5 4"/><text x="${width - right}" y="${y(target) - 6}" text-anchor="end" fill="#bf695b" font-size="9">Meta</text>`;
  const dots = values.map((value, i) => `<circle cx="${x(i)}" cy="${y(value)}" r="3.5" fill="${color}" stroke="#fff" stroke-width="2"><title>${labels[i]}: ${Math.round(value)}</title></circle>`).join('');
  const ticks = labels.map((label, i) => `<text x="${x(i)}" y="${height - 6}" text-anchor="middle" fill="#96a098" font-size="9">${escapeHtml(label)}</text>`).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de histórico"><g>${grid}${targetLine}<path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots}${ticks}</g></svg>`;
}
function totalBurned(date) {
  return data.sessions.filter((session) => session.date === date).reduce((sum, session) => {
    const ex = data.exercises.find((item) => item.id === session.exerciseId);
    if (!ex) return sum;
    if (ex.type === 'cardio') return sum + Math.round(safeNumber(session.duration) * 7);
    const volume = safeNumber(session.load) * safeNumber(session.reps) * safeNumber(session.sets);
    return sum + Math.round(volume * .06);
  }, 0);
}
function caloriesOn(date) {
  return data.foodLogs.filter((entry) => entry.date === date).reduce((sum, entry) => {
    const food = data.foods.find((item) => item.id === entry.foodId);
    return sum + (food ? safeNumber(food.calories) * safeNumber(entry.amount) / 100 : 0);
  }, 0);
}
function dailyBalance(date) {
  const eaten = caloriesOn(date);
  const burned = totalBurned(date);
  const goal = safeNumber(data.profile.calorieGoal);
  return { eaten, burned, net: eaten - burned, target: goal, remaining: goal - eaten + burned };
}
function strengthVolume(session) {
  const exercise = data.exercises.find((item) => item.id === session.exerciseId);
  if (!exercise) return 0;
  return exercise.type === 'cardio' ? safeNumber(session.distance) || safeNumber(session.duration) : safeNumber(session.load) * safeNumber(session.reps) * safeNumber(session.sets);
}
function progression(exerciseId) {
  const entries = data.sessions.filter((session) => session.exerciseId === exerciseId).sort((a, b) => a.date.localeCompare(b.date));
  if (entries.length < 2) return { label: 'Mais registros necessários', kind: 'neutral', change: null };
  const before = strengthVolume(entries[entries.length - 2]);
  const latest = strengthVolume(entries[entries.length - 1]);
  const change = before ? (latest - before) / before : 0;
  return { label: change > .03 ? 'Evoluindo' : change < -.03 ? 'Regredindo' : 'Estagnado', kind: change > .03 ? '' : change < -.03 ? 'warn' : 'neutral', change };
}
function makeInsight() {
  const trainedDates = new Set(data.sessions.map((entry) => entry.date));
  const goal = safeNumber(data.profile.calorieGoal);
  if (!goal || !data.foodLogs.length) return 'Registre refeições e treinos para descobrir como seus hábitos se relacionam.';
  const days = [...new Set(data.foodLogs.map((entry) => entry.date))].sort();
  const workoutOver = days.filter((date) => caloriesOn(date) > goal && trainedDates.has(date)).length;
  const restOver = days.filter((date) => caloriesOn(date) > goal && !trainedDates.has(date)).length;
  const workoutDays = days.filter((date) => trainedDates.has(date)).length;
  const restDays = days.length - workoutDays;
  const workoutRate = workoutDays ? workoutOver / workoutDays : 0;
  const restRate = restDays ? restOver / restDays : 0;
  if (workoutDays && restDays && Math.abs(restRate - workoutRate) >= .15) {
    const who = restRate > workoutRate ? 'dias sem treino' : 'dias com treino';
    const rate = Math.round(Math.max(restRate, workoutRate) * 100);
    const diff = Math.round(Math.abs(restRate - workoutRate) * 100);
    return `Nos seus registros, ${who} concentram mais ultrapassagens da meta: ${rate}% dos dias, uma diferença de ${diff} pontos percentuais.`;
  }
  const latest = [...data.weights].sort((a, b) => a.date.localeCompare(b.date)).slice(-2);
  if (latest.length === 2) {
    const variation = latest[1].weight - latest[0].weight;
    const direction = variation < 0 ? 'caiu' : variation > 0 ? 'subiu' : 'ficou estável';
    const exercise = data.sessions.length ? 'Você também registrou treino nesse período, então vale observar a tendência junto com sua rotina.' : 'Registre um treino para comparar essa tendência com sua rotina de exercícios.';
    return `Entre ${prettyDate(latest[0].date)} e ${prettyDate(latest[1].date)}, seu peso ${direction} ${Math.abs(variation).toFixed(1)} kg. ${exercise}`;
  }
  const tracked = [...trainedDates].filter((date) => days.includes(date)).length;
  return `${tracked} ${tracked === 1 ? 'dia teve' : 'dias tiveram'} treino e refeição registrados ao mesmo tempo. Continue registrando para revelar padrões entre consumo e atividade.`;
}
function weekDates() { return Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - 6 + index); return date.toISOString().slice(0, 10); }); }
function field(label, name, type = 'text', options = {}) {
  const required = options.required === false ? '' : 'required';
  const min = options.min !== undefined ? `min="${options.min}"` : '';
  const max = options.max !== undefined ? `max="${options.max}"` : '';
  const step = options.step ? `step="${options.step}"` : '';
  const placeholder = options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : '';
  const value = options.value !== undefined ? `value="${escapeHtml(options.value)}"` : '';
  const extra = options.extra || '';
  if (type === 'select') return `<div class="field ${options.full ? 'full' : ''}"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${required}>${options.choices.map(([val, text]) => `<option value="${escapeHtml(val)}">${escapeHtml(text)}</option>`).join('')}</select></div>`;
  return `<div class="field ${options.full ? 'full' : ''}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" ${required} ${min} ${max} ${step} ${placeholder} ${value} ${extra}></div>`;
}
function formCard(title, formId, fields, submitText) { return `<section class="inline-form"><div class="panel-head"><div><h2>${title}</h2></div></div><form id="${formId}"><div class="form-grid">${fields}</div><div class="form-actions"><button class="btn" type="submit">${submitText}</button></div></form></section>`; }
function listRows(rows, emptyText, renderRow) { return rows.length ? `<div class="list">${rows.map(renderRow).join('')}</div>` : `<div class="empty-state">${emptyText}</div>`; }
function renderPage() {
  const context = { data, today, defaultMeals, dailyBalance, weekDates, strengthVolume, caloriesOn, makeInsight, heading, stat, panel, chartSvg, escapeHtml, safeNumber, prettyDate, field, formCard, listRows, progression, currentUser };
  switch (page) {
    case 'training': return renderTrainingPage(context);
    case 'diet': return renderDietPage(context);
    case 'progress': return renderProgressPage(context);
    case 'profile': return renderProfilePage(context);
    case 'demo':
    case 'home': return renderHome(context);
    default: return renderHome(context);
  }
}
function updateMetrics(exerciseId) {
  const exercise = data.exercises.find((item) => item.id === exerciseId);
  const container = document.querySelector('#exercise-metrics');
  if (!container || !exercise) return;
  container.className = 'field full';
  container.innerHTML = exercise.type === 'cardio'
    ? `<div class="form-grid">${field('Duração (min)', 'duration', 'number', { min: '.1', step: '.1' })}${field('Distância (km)', 'distance', 'number', { min: '.1', step: '.1', required: false })}</div>`
    : `<div class="form-grid">${field('Carga (kg)', 'load', 'number', { min: '.1', step: '.1' })}${field('Repetições', 'reps', 'number', { min: '1', step: '1' })}${field('Séries', 'sets', 'number', { min: '1', step: '1' })}</div>`;
}
function validForm(form) {
  if (!form.reportValidity()) return false;
  for (const input of form.querySelectorAll('input[type="number"][required]')) {
    const value = Number(input.value);
    const minimum = input.min === '' ? null : Number(input.min);
    if (!Number.isFinite(value) || (minimum === null && value <= 0) || (minimum !== null && value < minimum)) {
      input.setCustomValidity('Confira o valor informado.');
      input.reportValidity();
      input.setCustomValidity('');
      return false;
    }
  }
  for (const input of form.querySelectorAll('input[type="date"]')) if (input.value && input.value > today) { input.setCustomValidity('A data não pode ser futura.'); input.reportValidity(); input.setCustomValidity(''); return false; }
  return true;
}
function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }
function handleDataForm(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.id) return;
  if (form.id === 'auth-form') return handleAuth(event);
  if (!validForm(form)) { event.preventDefault(); return; }
  event.preventDefault();
  const values = formValues(form);
  if (form.id === 'workout-form' && !form.querySelector('input[name="exerciseIds"]:checked')) {
    showToast('Selecione ao menos um exercício para montar o treino.');
    return;
  }
  if (form.id === 'meal-form-data' && !data.foods.some((food) => food.id === values.foodId)) {
    showToast('Cadastre um alimento antes de registrar a refeição.');
    return;
  }
  if (form.id === 'profile-form') {
    data.profile = { weight: Number(values.weight), goalWeight: Number(values.goalWeight), calorieGoal: Number(values.calorieGoal) };
    const latest = data.weights.find((item) => item.date === today);
    if (latest) latest.weight = data.profile.weight; else data.weights.push({ id: uid(), date: today, weight: data.profile.weight });
    showToast('Perfil e metas atualizados.');
  } else if (form.id === 'exercise-form') {
    data.exercises.push({ id: uid(), name: values.name.trim(), group: values.group.trim(), type: values.type });
    showToast('Exercício cadastrado.');
  } else if (form.id === 'workout-form') {
    const exerciseIds = [...form.querySelectorAll('input[name="exerciseIds"]:checked')].map((input) => input.value);
    data.workouts.push({ id: uid(), name: values.name.trim(), exerciseIds });
    showToast('Treino criado.');
  } else if (form.id === 'session-form-data') {
    const exercise = data.exercises.find((item) => item.id === values.exerciseId);
    if (!exercise) { showToast('Cadastre um exercício primeiro.'); return; }
    const session = { id: uid(), exerciseId: exercise.id, date: values.date };
    if (exercise.type === 'cardio') Object.assign(session, { duration: Number(values.duration), distance: Number(values.distance || 0) });
    else Object.assign(session, { load: Number(values.load), reps: Number(values.reps), sets: Number(values.sets) });
    data.sessions.push(session);
    showToast('Execução registrada.');
  } else if (form.id === 'food-form') {
    data.foods.push({ id: uid(), name: values.name.trim(), calories: Number(values.calories), protein: Number(values.protein), carbs: Number(values.carbs), fat: Number(values.fat) });
    showToast('Alimento cadastrado.');
  } else if (form.id === 'meal-form-data') {
    data.foodLogs.push({ id: uid(), foodId: values.foodId, date: values.date, meal: values.meal, amount: Number(values.amount) });
    showToast('Refeição adicionada.');
  } else if (form.id === 'weight-form') {
    const existing = data.weights.find((item) => item.date === values.date);
    if (existing) existing.weight = Number(values.weight); else data.weights.push({ id: uid(), date: values.date, weight: Number(values.weight) });
    if (values.date === today) data.profile.weight = Number(values.weight);
    showToast('Peso registrado.');
  }
  saveData();
  renderApp();
}
function removeEntity(collection, id) {
  if (!data[collection]) return;
  data[collection] = data[collection].filter((item) => item.id !== id);
  if (collection === 'exercises') {
    data.sessions = data.sessions.filter((item) => item.exerciseId !== id);
    data.workouts = data.workouts.map((workout) => ({ ...workout, exerciseIds: workout.exerciseIds.filter((exerciseId) => exerciseId !== id) }));
  }
  if (collection === 'foods') data.foodLogs = data.foodLogs.filter((item) => item.foodId !== id);
  saveData(); renderApp(); showToast('Registro excluído.');
}
async function initFirebase() {
  if (!firebaseReady) return;
  try {
    const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
    const [appSdk, authSdk, storeSdk] = await Promise.all([import(`${base}/firebase-app.js`), import(`${base}/firebase-auth.js`), import(`${base}/firebase-firestore.js`)]);
    const fbApp = appSdk.initializeApp(firebaseConfig);
    const auth = authSdk.getAuth(fbApp);
    const db = storeSdk.getFirestore(fbApp);
    firebase = { ...authSdk, ...storeSdk, auth, db };
    authSdk.onAuthStateChanged(auth, async (user) => {
      if (!user) { if (!currentUser?.demo) { currentUser = null; if (page !== 'landing') renderAuth(); } return; }
      currentUser = { uid: user.uid, email: user.email, displayName: user.displayName, demo: false };
      loadLocalData();
      try {
        const snapshot = await storeSdk.getDoc(storeSdk.doc(db, 'users', user.uid, 'appData', 'main'));
        if (snapshot.exists()) { data = { ...emptyData(), ...snapshot.data() }; saveDataLocalOnly(); }
        else await storeSdk.setDoc(storeSdk.doc(db, 'users', user.uid, 'appData', 'main'), data);
      } catch (error) { showToast(`Firestore indisponível: ${error.message}`); }
      if (page === 'landing' || page === 'login' || page === 'register') {
        page = 'home';
        history.replaceState({ page }, '', pageFiles[page]);
      }
      renderApp();
    });
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    renderAuth();
    const errorNode = document.querySelector('#auth-error');
    if (errorNode) errorNode.textContent = 'Não foi possível conectar ao Firebase. Confira a configuração e a conexão.';
  }
}
function saveDataLocalOnly() { localStorage.setItem(cacheKey(), JSON.stringify(data)); }
async function handleAuth(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = formValues(form);
  const errorNode = document.querySelector('#auth-error');
  const submit = form.querySelector('button[type="submit"]');
  if (!firebaseReady || !firebase) {
    errorNode.textContent = 'Configure seu app Firebase em firebase-config.js. Para explorar agora, use a demonstração.';
    return;
  }
  submit.disabled = true;
  errorNode.textContent = '';
  try {
    if (mode === 'register') {
      const credential = await firebase.createUserWithEmailAndPassword(firebase.auth, values.email, values.password);
      await firebase.updateProfile(credential.user, { displayName: values.name.trim() });
      currentUser = { uid: credential.user.uid, email: credential.user.email, displayName: values.name.trim(), demo: false };
      data = emptyData(); saveData(); navigate('profile', true);
    } else await firebase.signInWithEmailAndPassword(firebase.auth, values.email, values.password);
  } catch (error) {
    errorNode.textContent = authErrorMessage(error.code);
    submit.disabled = false;
  }
}
function authErrorMessage(code = '') {
  const errors = { 'auth/email-already-in-use': 'Este e-mail já está cadastrado.', 'auth/invalid-email': 'Confira o formato do e-mail.', 'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.', 'auth/invalid-credential': 'E-mail ou senha incorretos.', 'auth/user-not-found': 'Não encontramos uma conta com este e-mail.', 'auth/wrong-password': 'E-mail ou senha incorretos.', 'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente novamente.', 'auth/operation-not-allowed': 'Ative Email/Password em Authentication > Sign-in method no Firebase Console.', 'auth/unauthorized-domain': 'Adicione este domínio em Authentication > Settings > Authorized domains.', 'auth/network-request-failed': 'Sem conexão com o Firebase. Confira sua rede e tente novamente.' };
  return errors[code] || 'Não foi possível autenticar. Verifique a conexão e a configuração do Firebase.';
}
function enterDemo() {
  currentUser = { uid: 'demo', email: 'demo@hacktoon.local', displayName: 'Atleta demo', demo: true };
  sessionStorage.setItem('hacktoon:demo', 'yes');
  loadLocalData();
  if (!data.exercises.length && !data.foods.length) { seedDemo(); saveData(); }
  navigate('demo', true);
}
function logout() {
  sessionStorage.removeItem('hacktoon:demo');
  if (currentUser?.demo) { currentUser = null; navigate('login', true); return; }
  if (firebase) firebase.signOut(firebase.auth).catch(() => showToast('Não foi possível sair da conta.'));
  currentUser = null; navigate('login', true);
}
app.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.mode) navigate(target.dataset.mode);
  if (target.id === 'demo-entry') enterDemo();
  if (target.id === 'logout-button' || target.id === 'logout-mobile') logout();
  if (target.dataset.nav === 'ai') { location.assign(pageFiles.ai); return; }
  if (target.dataset.nav) navigate(target.dataset.nav);
  if (target.dataset.delete) removeEntity(target.dataset.delete, target.dataset.id);
  if (target.dataset.scroll) document.querySelector(`#${target.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
app.addEventListener('submit', handleDataForm);
app.addEventListener('change', (event) => { if (event.target.name === 'exerciseId') updateMetrics(event.target.value); });

const menuToggle = document.querySelector('#menuToggle');
const navContainer = document.querySelector('#navContainer');
menuToggle?.addEventListener('click', () => {
  const isOpen = navContainer.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
navContainer?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    navContainer.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

window.addEventListener('popstate', () => {
  const file = location.pathname.split('/').pop();
  const nextPage = Object.keys(pageFiles).find((key) => pageFiles[key] === file) || document.body.dataset.page || 'home';
  page = nextPage;
  if (nextPage === 'login' || nextPage === 'register') { mode = nextPage; renderAuth(); }
  else if (currentUser) renderApp();
  else { mode = 'login'; renderAuth(); }
});

if (sessionStorage.getItem('hacktoon:demo') === 'yes') {
  currentUser = { uid: 'demo', email: 'demo@hacktoon.local', displayName: 'Atleta demo', demo: true };
  loadLocalData();
  if (!data.exercises.length && !data.foods.length) { seedDemo(); saveData(); }
  if (page === 'landing') {
    page = 'home';
    history.replaceState({ page }, '', pageFiles[page]);
  }
  renderApp();
} else if (page !== 'landing') renderAuth();
if (firebaseReady && sessionStorage.getItem('hacktoon:demo') !== 'yes') initFirebase();