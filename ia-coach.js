/* ==========================================================================
   IA COACH - FUNÇÕES DE VISÃO COMPUTACIONAL E CÁLCULOS LOCAIS
   ========================================================================== */

let currentUploadedImageBase64 = null;

// 1. CARREGAR IMAGEM DO PRATO
function handlePlateImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    currentUploadedImageBase64 = reader.result;
    document.getElementById('scannedImg').src = currentUploadedImageBase64;
    document.getElementById('aiScanPreview').style.display = 'block';
    document.getElementById('uploadStatusText').textContent = file.name;
    document.getElementById('scanResultBox').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// 2. ANALISAR PRATO COM IA
function analyzePlateWithAI() {
  if (!currentUploadedImageBase64) return;

  const resultBox = document.getElementById('scanResultBox');
  const button = document.getElementById('btnAnalyzePlate');
  button.disabled = true;
  button.innerHTML = '<i data-lucide="loader" class="spin"></i> Escaneando Prato...';
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    button.disabled = false;
    button.innerHTML = '<i data-lucide="sparkles"></i> Analisar Prato com IA';
    if (window.lucide) lucide.createIcons();
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
        <strong style="color: #00ff87;">Prato Identificado: Refeição Fitness Fit</strong>
        <span style="font-size: 0.75rem; color: #00e5ff; border: 1px solid #00e5ff; padding: 2px 6px; border-radius: 6px;">Confiança: 96%</span>
      </div>
      <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.8rem;">
        Alimentos detectados: Peito de frango grelhado (~120g), Arroz integral (~100g) e Salada verde mista.
      </p>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; font-size: 0.8rem; text-align: center;">
        <div style="background: rgba(255,255,255,0.05); padding: 0.4rem; border-radius: 8px;"><div style="color: #94a3b8;">Calorias</div><strong style="color: #fff;">~380 kcal</strong></div>
        <div style="background: rgba(255,255,255,0.05); padding: 0.4rem; border-radius: 8px;"><div style="color: #94a3b8;">Proteína</div><strong style="color: #00e5ff;">38g</strong></div>
        <div style="background: rgba(255,255,255,0.05); padding: 0.4rem; border-radius: 8px;"><div style="color: #94a3b8;">Carbos</div><strong style="color: #ffbd2e;">28g</strong></div>
        <div style="background: rgba(255,255,255,0.05); padding: 0.4rem; border-radius: 8px;"><div style="color: #94a3b8;">Gordura</div><strong style="color: #ff3366;">5g</strong></div>
      </div>`;
  }, 1500);
}

// 3. CALCULAR SUBSTITUIÇÃO
function calculateSubstitution() {
  const originalSelect = document.getElementById('substOriginalSelect');
  const targetSelect = document.getElementById('substTargetSelect');
  if (!originalSelect || !targetSelect) return;

  const original = originalSelect.value;
  const target = targetSelect.value;
  const resultBox = document.getElementById('substResultText');

  const rates = {
    'frango-patinho': '100g de Frango -> <strong>105g de Patinho Moído</strong> (Mesmo teor proteico, +1.5g de gordura).',
    'frango-tilapia': '100g de Frango -> <strong>120g de Filé de Tilápia</strong> (Proteína equivalente com menos gordura).',
    'arroz-mandioca': '100g de Arroz -> <strong>90g de Mandioca Cozida</strong> (Equivalência de carboidratos).',
    'arroz-aveia': '100g de Arroz -> <strong>40g de Farinha de Aveia</strong> (Maior quantidade de fibras).',
    'batata-mandioca': '100g de Batata Doce -> <strong>70g de Mandioca Cozida</strong>.',
    'ovo-tilapia': '1 Ovo Inteiro -> <strong>35g de Tilápia + 1/2 colher de azeite</strong> (Equilibra proteína e gordura).'
  };

  resultBox.innerHTML = rates[`${original}-${target}`] || `Para substituir o alimento selecionado, utilize aproximadamente <strong>100g a 110g de ${targetSelect.selectedOptions[0].textContent}</strong> como referência.`;
  resultBox.style.display = 'block';
}

function handleSendChatMessage(event) {
  event?.preventDefault();
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  appendChatMessage('user', message);
  input.value = '';
  setTimeout(() => appendChatMessage('ai', generateAIResponse(message)), 500);
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('chatInput');
  input.value = promptText;
  handleSendChatMessage();
}

function appendChatMessage(sender, text) {
  const box = document.getElementById('chatMessagesBox');
  const message = document.createElement('div');
  message.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'ai-msg'}`;
  const author = document.createElement('div');
  author.className = 'msg-author';
  author.textContent = sender === 'user' ? 'Você' : 'Cyber-Coach IA';
  message.append(author, document.createTextNode(text));
  box.appendChild(message);
  box.scrollTop = box.scrollHeight;
}

function generateAIResponse(userText) {
  const text = userText.toLocaleLowerCase('pt-BR');
  if (text.includes('pré-treino') || text.includes('energia')) {
    return 'Uma opção simples de pré-treino é banana com aveia, cerca de 30 a 45 minutos antes. Ajuste a quantidade às suas necessidades.';
  }
  if (text.includes('proteína') || text.includes('meta')) {
    return 'Você pode distribuir fontes de proteína ao longo das refeições. Ovos, frango, peixes, leguminosas e laticínios são algumas opções.';
  }
  if (text.includes('inchaço') || text.includes('água')) {
    return 'Manter uma boa hidratação e moderar alimentos muito salgados pode ajudar. Se o inchaço persistir ou for intenso, procure um profissional de saúde.';
  }
  return 'Posso ajudar com orientações gerais sobre alimentação e treino. Para recomendações personalizadas, converse com um nutricionista ou profissional de saúde.';
}

function clearChatHistory() {
  const box = document.getElementById('chatMessagesBox');
  box.replaceChildren();
  appendChatMessage('ai', 'Histórico limpo. Como posso ajudar agora?');
}

window.lucide?.createIcons();