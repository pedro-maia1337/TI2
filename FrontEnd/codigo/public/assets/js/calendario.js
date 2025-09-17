// ============================
// Variáveis globais
// ============================
const API_URL = 'http://localhost:3001/lembretes';

const modalOverlay = document.getElementById('modalOverlay'); // Modal de criação
const formLembrete = document.getElementById('formLembrete');
const modalDetalhes = document.getElementById('modalDetalhesOverlay'); // Modal de detalhes
const detalhesContent = document.getElementById('modalDetalhesContent');

const calendarioDiv = document.getElementById('calendario');
const mesAnoDiv = document.getElementById('mesAno');

let dataAtual = dayjs();
let dataSelecionada = null;
let lembreteSelecionado = null;

// ============================
// Abrir/fechar modal de criação
// ============================
function abrirModal(data) {
  modalOverlay.classList.add('show');
  modalOverlay.classList.remove('hidden');
  document.getElementById('data').value = data;
  dataSelecionada = data;
}

function fecharModal() {
  modalOverlay.classList.remove('show');
  modalOverlay.classList.add('hidden');
  formLembrete.reset();
  dataSelecionada = null;
}

// ============================
// Buscar lembretes no servidor
// ============================
async function buscarLembretes() {
  try {
    const resp = await fetch(API_URL);
    if (!resp.ok) throw new Error('Erro ao buscar lembretes');
    return await resp.json();
  } catch (err) {
    console.error('Falha ao buscar lembretes:', err);
    return [];
  }
}

// ============================
// Gerar calendário
// ============================
async function gerarCalendario() {
  const mesAtual = dataAtual.month();
  const anoAtual = dataAtual.year();
  const lembretes = await buscarLembretes();

  const primeiroDiaSemana = dayjs(new Date(anoAtual, mesAtual, 1)).day();
  const ultimoDia = dayjs(new Date(anoAtual, mesAtual + 1, 0)).date();

  calendarioDiv.innerHTML = '';
  mesAnoDiv.textContent = dataAtual.format('MMMM [de] YYYY');

  // Dias vazios antes do primeiro dia
  for (let i = 0; i < primeiroDiaSemana; i++) {
    const divVazia = document.createElement('div');
    calendarioDiv.appendChild(divVazia);
  }

  // Gerar os dias
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const dateISO = dayjs(new Date(anoAtual, mesAtual, dia)).format('YYYY-MM-DD');
    const hojeISO = dayjs().format('YYYY-MM-DD');

    // Filtrar lembretes do dia
    const lembretesDoDia = lembretes.filter(l => l.data === dateISO);

    // Definir a cor do quadrado baseado nos lembretes
    let corDia = 'bg-gray-50'; // padrão sem lembrete
    if (lembretesDoDia.length > 0) {
      const todosPagos = lembretesDoDia.every(l => l.status === true);
      const algumPendente = lembretesDoDia.some(l => l.status === false);

      if (todosPagos) {
        corDia = 'bg-green-200'; // todos pagos
      } else if (algumPendente) {
        corDia = 'bg-red-200'; // algum pendente
      }
    }

    const divDia = document.createElement('div');
    divDia.className = `
      p-3 rounded-xl text-center relative cursor-pointer transition border
      ${hojeISO === dateISO ? 'border-blue-400 font-bold' : 'border-gray-300'}
      ${corDia} hover:bg-opacity-80
    `;

    // Número do dia
    const numero = document.createElement('div');
    numero.className = 'font-semibold';
    numero.textContent = dia;
    divDia.appendChild(numero);

    // Adiciona títulos dos lembretes (opcional, pequenos textos dentro do quadrado)
    if (lembretesDoDia.length > 0) {
      const lembContainer = document.createElement('div');
      lembContainer.className = 'mt-2 space-y-1 text-left';

      lembretesDoDia.forEach(l => {
        const item = document.createElement('div');
        item.className = 'text-xs truncate cursor-pointer text-gray-900 font-medium';
        item.textContent = l.titulo;

        // Clique no lembrete abre modal de detalhes
        item.addEventListener('click', (ev) => {
          ev.stopPropagation();
          abrirModalDetalhes(l);
        });

        lembContainer.appendChild(item);
      });

      divDia.appendChild(lembContainer);
    }

    // Clique no quadrado abre modal para criar novo lembrete
    divDia.addEventListener('click', () => abrirModal(dateISO));

    calendarioDiv.appendChild(divDia);
  }
}

// ============================
// Modal de detalhes
// ============================
function abrirModalDetalhes(lembrete) {
  lembreteSelecionado = lembrete;

  detalhesContent.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Detalhes do Lembrete</h2>
    <p><strong>Nome:</strong> ${lembrete.titulo}</p>
    <p><strong>Descrição:</strong> ${lembrete.descricao}</p>
    <p><strong>Valor:</strong> R$${(lembrete.valor || 0).toFixed(2)}</p>
    <p><strong>Data:</strong> ${dayjs(lembrete.data).format('DD/MM/YYYY')}</p>
    <p><strong>Pago:</strong> ${lembrete.status ? 'Sim' : 'Não'}</p>
    <p><strong>Frequência:</strong> ${lembrete.frequencia}</p>
    <div class="mt-4 flex space-x-2">
      <button onclick="excluirLembrete(${lembrete.id})"
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
        Excluir
      </button>
      <button onclick="fecharModalDetalhes()"
        class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition">
        Fechar
      </button>
    </div>
  `;

  modalDetalhes.classList.add('show');
  modalDetalhes.classList.remove('hidden');
}

function fecharModalDetalhes() {
  modalDetalhes.classList.remove('show');
  modalDetalhes.classList.add('hidden');
  detalhesContent.innerHTML = '';
  lembreteSelecionado = null;
}

// ============================
// Excluir lembrete
// ============================
async function excluirLembrete(id) {
  if (!confirm('Tem certeza que deseja excluir este lembrete?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao excluir lembrete');

    alert('Lembrete excluído com sucesso!');
    fecharModalDetalhes();
    gerarCalendario();
  } catch (erro) {
    console.error('Erro ao excluir lembrete:', erro);
    alert('Não foi possível excluir o lembrete.');
  }
}

// ============================
// Salvar novo lembrete
// ============================
formLembrete.addEventListener('submit', async (event) => {
  event.preventDefault();

  const dadosLembrete = {
    titulo: document.getElementById('titulo').value,
    descricao: document.getElementById('descricao').value,
    valor: parseFloat(document.getElementById('valor').value),
    data: dataSelecionada,
    status: document.getElementById('status').checked, // true ou false
    frequencia: document.getElementById('frequencia').value
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosLembrete),
    });

    if (!response.ok) throw new Error('Erro ao salvar no servidor');

    alert('Lembrete salvo com sucesso!');
    fecharModal();
    gerarCalendario();
  } catch (erro) {
    console.error('Erro ao salvar lembrete:', erro);
    alert('Falha ao salvar o lembrete.');
  }
});

// ============================
// Navegar entre meses
// ============================
function mudarMes(incremento) {
  dataAtual = dataAtual.add(incremento, 'month');
  gerarCalendario();
}

// ============================
// Inicializar
// ============================
window.addEventListener('DOMContentLoaded', gerarCalendario);
