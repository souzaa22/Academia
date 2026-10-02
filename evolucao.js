// Renderização do gráfico SVG simples
function generateChartSvg(values) {
  if (!values || values.length === 0) {
    return `<div class="chart-empty">Adicione registros para visualizar seu histórico.</div>`;
  }

  if (values.length === 1) {
    return `
      <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--neon-green, #639151); font-weight:600;">
        Último peso registrado: ${values[0]} kg
      </div>`;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 300;
  const height = 120;

  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * (width - 20) + 10;
    const y = height - 10 - ((val - min) / range) * (height - 30);
    return `${x},${y}`;
  }).join(' ');

  return `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:140px; overflow:visible;">
      <polyline fill="none" stroke="#639151" stroke-width="3" points="${points}" />
      ${values.map((val, idx) => {
        const x = (idx / (values.length - 1)) * (width - 20) + 10;
        const y = height - 10 - ((val - min) / range) * (height - 30);
        return `<circle cx="${x}" cy="${y}" r="4" fill="#639151" />`;
      }).join('')}
    </svg>
  `;
}

// Renderização da interface e atualização dos dados
function renderWeightData() {
  const weightsHistory = JSON.parse(localStorage.getItem('weightsHistory') || '[]');
  const chartWrap = document.querySelector('.chart-wrap');
  const historyList = document.getElementById('weight-history-list');

  // Ordena por data (mais recente primeiro)
  weightsHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 1. Atualiza o painel do gráfico
  if (chartWrap) {
    const values = weightsHistory.map(item => item.weight).reverse();
    chartWrap.innerHTML = generateChartSvg(values);
  }

  // 2. Atualiza a lista do histórico
  if (historyList && weightsHistory.length > 0) {
    historyList.innerHTML = weightsHistory.map(entry => `
      <div class="list-row">
        <div class="row-main">
          <div class="row-title">${entry.date.split('-').reverse().join('/')}</div>
          <div class="row-meta">Registrado via sistema</div>
        </div>
        <div class="row-value">${Number(entry.weight).toFixed(1)} kg</div>
      </div>
    `).join('');
  }
}

// Evento principal ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  const weightForm = document.getElementById('weight-form');
  const weightInput = document.getElementById('weight-input');
  const dateInput = document.getElementById('weight-date');

  // Define a data de hoje no input se estiver vazio
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Carrega os dados existentes no arranque
  renderWeightData();

  // Escuta o salvamento do formulário
  if (weightForm) {
    weightForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const weight = parseFloat(weightInput.value);
      const date = dateInput.value;

      if (!weight || weight <= 0) {
        alert('Por favor, informe um peso válido.');
        return;
      }

      if (!date) {
        alert('Por favor, selecione uma data.');
        return;
      }

      // Adiciona o novo registo
      const weightsHistory = JSON.parse(localStorage.getItem('weightsHistory') || '[]');
      weightsHistory.push({ id: Date.now(), weight, date });
      localStorage.setItem('weightsHistory', JSON.stringify(weightsHistory));

      // Limpa os campos e atualiza a tela
      weightInput.value = '';
      dateInput.value = date;

      renderWeightData();
    });
  }
});