const apiUrlCarteiras = 'http://localhost:3001/carteiras';
const apiUrlLancamentos = 'http://localhost:3001/lancamentos';
let originalData = []; // Dados das carteiras
let lancamentos = []; // Dados dos lançamentos
let chart; // Variável do gráfico

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Carregar as carteiras e os lançamentos
    const responseCarteiras = await fetch(apiUrlCarteiras);
    if (!responseCarteiras.ok) throw new Error('Erro ao carregar as carteiras.');
    originalData = await responseCarteiras.json();

    const responseLancamentos = await fetch(apiUrlLancamentos);
    if (!responseLancamentos.ok) throw new Error('Erro ao carregar os lançamentos.');
    lancamentos = await responseLancamentos.json();

    // Calcular o saldo para cada conta
    calculateSaldo();

    // Populando os filtros
    populateFilters();

    // Renderizar o gráfico com as carteiras
    renderChart(originalData);

    // Aplicar filtros ao clicar no botão
    document.getElementById('apply-filters').addEventListener('click', applyFilters);

    // Configuração dos dropdowns para os filtros
    setupDropdowns();

  } catch (error) {
    console.error('Erro:', error);
  }
});

// Configuração dos filtros (dropdowns)
function setupDropdowns() {
  const toggleName = document.getElementById('toggle-name');
  const toggleType = document.getElementById('toggle-type');
  const filterName = document.getElementById('filter-name');
  const filterType = document.getElementById('filter-type');

  toggleName.addEventListener('click', () => {
    filterName.style.display = filterName.style.display === 'block' ? 'none' : 'block';
    filterType.style.display = 'none';
  });

  toggleType.addEventListener('click', () => {
    filterType.style.display = filterType.style.display === 'block' ? 'none' : 'block';
    filterName.style.display = 'none';
  });

  document.addEventListener('click', (event) => {
    if (!toggleName.contains(event.target) && !filterName.contains(event.target)) {
      filterName.style.display = 'none';
    }
    if (!toggleType.contains(event.target) && !filterType.contains(event.target)) {
      filterType.style.display = 'none';
    }
  });
}

// Populando os filtros com os nomes e tipos únicos
function populateFilters() {
  const nameContainer = document.getElementById('filter-name');
  const typeContainer = document.getElementById('filter-type');

  const uniqueNames = [...new Set(originalData.map(item => item.nomeConta))];
  const uniqueTypes = [...new Set(originalData.map(item => item.tipo))];

  uniqueNames.forEach(name => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" value="${name}">
      ${name}
    `;
    nameContainer.appendChild(label);
  });

  uniqueTypes.forEach(type => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" value="${type}">
      ${type}
    `;
    typeContainer.appendChild(label);
  });
}

// Função para aplicar os filtros
function applyFilters() {
  const selectedNames = Array.from(document.querySelectorAll('#filter-name input:checked')).map(input => input.value);
  const selectedTypes = Array.from(document.querySelectorAll('#filter-type input:checked')).map(input => input.value);

  const filteredData = originalData.filter(item => {
    const matchesName = !selectedNames.length || selectedNames.includes(item.nomeConta);
    const matchesType = !selectedTypes.length || selectedTypes.includes(item.tipo);
    return matchesName && matchesType;
  });

  renderChart(filteredData);
}

// Função para renderizar o gráfico de donuts
function renderChart(data) {
  const ctx = document.getElementById('donutChart').getContext('2d');

  // Labels para o gráfico (nomes das contas)
  const labels = data.map(item => item.nomeConta);

  // Valores do gráfico (saldo final das contas)
  const values = data.map(item => item.saldo);

  // Cores de fundo para o gráfico
  const backgroundColors = data.map(item => item.id_cor);

  if (chart) {
    chart.destroy();
  }

  // Gerando o gráfico
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const value = tooltipItem.raw;
              return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }
          }
        },
        title: {
          display: true,
          text: `Total: R$ ${values.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        }
      }
    }
  });
}

// Função para calcular o saldo final de cada conta
function calculateSaldo() {
  originalData.forEach(account => {
    // Inicializa o saldo com o saldo inicial da conta
    let saldoFinal = account.saldoInicial || 0;

    // Filtra os lançamentos que pertencem a esta conta
    const accountLancamentos = lancamentos.filter(lancamento => lancamento.id_carteira === account.id);

    // Somar as receitas e subtrair as despesas
    accountLancamentos.forEach(lancamento => {
      if (lancamento.tipo === 'receita') {
        saldoFinal += lancamento.valor;  // Adiciona a receita
      } else if (lancamento.tipo === 'despesa') {
        saldoFinal -= lancamento.valor;  // Subtrai a despesa
      }
    });

    // Atualiza o saldo final da conta
    account.saldo = saldoFinal;
  });
}
