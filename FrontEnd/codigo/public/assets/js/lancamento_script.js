document.addEventListener("DOMContentLoaded", () => {
  carregarLancamentos();
});

function carregarLancamentos() {
  const tbody = document.getElementById("lancamentosTableBody");
  const totalReceitasEl = document.getElementById("totalReceitas");
  const totalDespesasEl = document.getElementById("totalDespesas");
  const saldoAtualEl = document.getElementById("saldoAtual");
  const balancoMensalEl = document.getElementById("balancoMensal");

  Promise.all([
    fetch("http://localhost:3001/lancamentos?tipo=receita").then(res => res.json()),
    fetch("http://localhost:3001/lancamentos?tipo=despesa").then(res => res.json())
  ]).then(([receitas, despesas]) => {
    tbody.innerHTML = "";

    let totalReceitas = 0;
    let totalDespesas = 0;

    [...receitas, ...despesas].forEach(item => {
      const valor = parseFloat(item.valor) || 0;

      if (item.tipo === "receita") totalReceitas += valor;
      else totalDespesas += valor;

      const situacaoIcon = item.tipo === "receita" 
        ? '<i class="bi bi-check-circle-fill text-success"></i>'
        : '<i class="bi bi-x-circle-fill text-danger"></i>';

      const row = `
        <tr>
          <td>${situacaoIcon}</td>
          <td>${item.descricao}</td>
          <td>${item.categoria}</td>
          <td>${item.id_carteira || "-"}</td>
          <td class="${item.tipo === 'receita' ? 'text-success' : 'text-danger'}">
            R$ ${valor.toFixed(2)}
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirLancamento(${item.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    const saldo = totalReceitas - totalDespesas;

    totalReceitasEl.textContent = `R$ ${totalReceitas.toFixed(2)}`;
    totalDespesasEl.textContent = `R$ ${totalDespesas.toFixed(2)}`;
    saldoAtualEl.textContent = `R$ ${saldo.toFixed(2)}`;
    balancoMensalEl.textContent = `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;
  }).catch(err => {
    console.error("Erro ao carregar lançamentos:", err);
  });
}

function excluirLancamento(id) {
  if (!confirm("Deseja realmente excluir este lançamento?")) return;

  fetch(`http://localhost:3001/lancamentos/${id}`, {
    method: "DELETE"
  })
    .then(response => {
      if (!response.ok) throw new Error("Erro ao excluir lançamento");
      alert("Lançamento excluído com sucesso!");
      carregarLancamentos(); // recarrega tabela
    })
    .catch(err => {
      console.error("Erro ao excluir lançamento:", err);
      alert("Erro ao excluir lançamento.");
    });
}
