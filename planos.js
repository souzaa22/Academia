const DEFAULT_GOAL = {
  initialWeight: 85,
  currentWeight: 80,
  targetWeight: 72,
  weeklyPace: 0.8
};

function getGoalSettings() {
  try {
    const stored = localStorage.getItem('user_goal_settings');
    return stored ? { ...DEFAULT_GOAL, ...JSON.parse(stored) } : { ...DEFAULT_GOAL };
  } catch {
    return { ...DEFAULT_GOAL };
  }
}

function saveGoalSettings(event) {
  event.preventDefault();
  const goal = {
    initialWeight: Number(document.getElementById('initialWeightInput').value),
    currentWeight: Number(document.getElementById('currentWeightInput').value),
    targetWeight: Number(document.getElementById('targetWeightInput').value),
    weeklyPace: Number(document.getElementById('paceSelect').value)
  };
  localStorage.setItem('user_goal_settings', JSON.stringify(goal));
  updatePlanDashboard();
}

function updatePlanDashboard() {
  const goal = getGoalSettings();
  const { initialWeight: initial, currentWeight: current, targetWeight: target, weeklyPace: pace } = goal;
  const totalToChange = Math.abs(initial - target);
  const changedSoFar = Math.abs(initial - current);
  const remainingToChange = Math.abs(current - target);
  const percent = totalToChange ? Math.min(100, Math.max(0, changedSoFar / totalToChange * 100)) : 0;

  document.getElementById('lblInitial').textContent = `${initial.toFixed(1)} kg`;
  document.getElementById('lblCurrent').textContent = `${current.toFixed(1)} kg`;
  document.getElementById('lblTarget').textContent = `${target.toFixed(1)} kg`;
  document.getElementById('progressPercentText').textContent = `${percent.toFixed(1)}%`;
  document.getElementById('progressBar').style.width = `${percent}%`;
  document.getElementById('remainingKgText').textContent = `${remainingToChange.toFixed(1)} kg`;

  const weeksNeeded = pace > 0 ? Math.ceil(remainingToChange / pace) : 0;
  document.getElementById('estimatedWeeksText').textContent = `${weeksNeeded} Semanas`;
  const dailyCalorieAdjustment = Math.round(pace * 7700 / 7);
  const modeText = target < current ? 'Déficit' : 'Superávit';
  document.getElementById('dailyCalorieKcalText').textContent = `${modeText} ${dailyCalorieAdjustment} kcal/dia`;

  generateFunComparison(changedSoFar, remainingToChange);
  renderProjectionTable(current, target, pace, weeksNeeded);
}

function generateFunComparison(changedKg, remainingKg) {
  const element = document.getElementById('funComparisonText');
  if (!element) return;

  let text = `Já alteraste o teu peso em <strong>${changedKg.toFixed(1)} kg</strong>! `;
  if (changedKg >= 1) {
    text += `Isso equivale a cerca de <strong>${Math.round(changedKg / 0.2)} pacotes de manteiga (200g)</strong> ou <strong>${changedKg.toFixed(1)} garrafas de água de 1 litro</strong>. `;
  } else {
    text += 'Estás nos primeiros passos da tua jornada de transformação. ';
  }
  text += remainingKg > 0
    ? `<br>Faltam <strong>${remainingKg.toFixed(1)} kg</strong> para atingir o teu objetivo. Mantém uma rotina sustentável.`
    : '<br><strong>Objetivo atingido.</strong>';
  element.innerHTML = text;
}

function renderProjectionTable(currentWeight, targetWeight, pace, totalWeeks) {
  const body = document.getElementById('projectionTableBody');
  body.replaceChildren();
  const losing = targetWeight < currentWeight;
  let projectedWeight = currentWeight;
  const displayWeeks = Math.min(totalWeeks, 12);

  for (let week = 1; week <= displayWeeks; week += 1) {
    projectedWeight = losing ? Math.max(targetWeight, projectedWeight - pace) : Math.min(targetWeight, projectedWeight + pace);
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + week * 7);
    const row = document.createElement('tr');
    row.innerHTML = `<td>Semana ${week}</td><td>${projectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</td><td>${projectedWeight.toFixed(1)} kg</td><td>${losing ? '-' : '+'}${Math.abs(projectedWeight - currentWeight).toFixed(1)} kg</td><td>No caminho</td>`;
    body.appendChild(row);
    if (projectedWeight === targetWeight) break;
  }
}

const goalForm = document.getElementById('goalForm');
if (goalForm) {
  const savedGoal = getGoalSettings();
  document.getElementById('initialWeightInput').value = savedGoal.initialWeight;
  document.getElementById('currentWeightInput').value = savedGoal.currentWeight;
  document.getElementById('targetWeightInput').value = savedGoal.targetWeight;
  document.getElementById('paceSelect').value = savedGoal.weeklyPace;
  goalForm.addEventListener('submit', saveGoalSettings);
  updatePlanDashboard();
}

window.lucide?.createIcons();
