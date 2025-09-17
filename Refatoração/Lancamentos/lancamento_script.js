document.addEventListener("DOMContentLoaded", () => {
    populateContas();
    loadReceitas();
    loadDespesas();
    fetchLancamentos();
});

/* ---------- FORM ---------- */
function validateForm(type) {
    const descricaoEl = document.getElementById("exampleInputDescricao");
    const valorEl = document.getElementById("exampleInputValor");
    const categoriaEl = document.getElementById("exampleInputCategoria");
    const contaEl = document.getElementById("exampleInputConta");
    const recorrenteEl = document.getElementById("exampleCheck1");

    if (!descricaoEl || !valorEl || !categoriaEl || !contaEl || !recorrenteEl) {
        alert("Formulário não encontrado.");
        return null;
    }

    const descricao = descricaoEl.value.trim();
    const valor = valorEl.value;
    const categoria = categoriaEl.value.trim();
    const contaId = contaEl.value;
    const recorrente = recorrenteEl.checked;

    if (!descricao || !valor || !categoria || !contaId) {
        alert("Todos os campos são obrigatórios!");
        return null;
    }

    return {
        descricao,
        valor: parseFloat(valor),
        categoria,
        id_carteira: contaId,
        recorrente,
        tipo: type
    };
}

function clearForm() {
    const descricao = document.getElementById("exampleInputDescricao");
    const valor = document.getElementById("exampleInputValor");
    const categoria = document.getElementById("exampleInputCategoria");
    const conta = document.getElementById("exampleInputConta");
    const check = document.getElementById("exampleCheck1");
    const submitBtn = document.getElementById("Submit");
    const updateBtn = document.getElementById("Update");

    if (descricao) descricao.value = "";
    if (valor) valor.value = "";
    if (categoria) categoria.value = "";
    if (conta) conta.value = "";
    if (check) check.checked = false;
    if (submitBtn) submitBtn.style.display = "block";
    if (updateBtn) updateBtn.style.display = "none";
}

/* ---------- CRUD ---------- */
function addData(type) {
    const data = validateForm(type);
    if (!data) return;

    fetch("http://localhost:3001/lancamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(() => {
            alert("Registro adicionado com sucesso!");
            if (type === "receita") loadReceitas();
            else loadDespesas();
            fetchLancamentos();
            clearForm();
        })
        .catch(err => console.error("Erro:", err));
}

function deleteData(id, type) {
    fetch(`http://localhost:3001/lancamentos/${id}`, { method: "DELETE" })
        .then(() => {
            alert("Registro deletado!");
            if (type === "receita") loadReceitas();
            else loadDespesas();
            fetchLancamentos();
        })
        .catch(err => console.error("Erro:", err));
}

function updateData(id) {
    fetch(`http://localhost:3001/lancamentos/${id}`)
        .then(res => res.json())
        .then(data => {
            const descricao = document.getElementById("exampleInputDescricao");
            const valor = document.getElementById("exampleInputValor");
            const categoria = document.getElementById("exampleInputCategoria");
            const conta = document.getElementById("exampleInputConta");
            const check = document.getElementById("exampleCheck1");
            const submitBtn = document.getElementById("Submit");
            const updateBtn = document.getElementById("Update");

            if (descricao) descricao.value = data.descricao;
            if (valor) valor.value = data.valor;
            if (categoria) categoria.value = data.categoria;
            if (conta) conta.value = data.id_carteira;
            if (check) check.checked = data.recorrente;

            if (submitBtn) submitBtn.style.display = "none";
            if (updateBtn) {
                updateBtn.style.display = "block";
                updateBtn.onclick = () => {
                    const updatedData = validateForm(data.tipo);
                    if (!updatedData) return;

                    fetch(`http://localhost:3001/lancamentos/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedData),
                    })
                        .then(() => {
                            alert("Registro atualizado!");
                            clearForm();
                            if (data.tipo === "receita") loadReceitas();
                            else loadDespesas();
                            fetchLancamentos();
                        })
                        .catch(err => console.error("Erro ao atualizar:", err));
                };
            }
        });
}

/* ---------- LOADERS ---------- */
function loadReceitas() {
    const tbody = document.querySelector("#crudTable tbody");
    if (!tbody) return; // evita erro
    fetch("http://localhost:3001/lancamentos?tipo=receita")
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = "";
            data.forEach(e => {
                const row = `<tr class="receita">
                    <td>${e.descricao}</td>
                    <td>${e.valor}</td>
                    <td>${e.categoria}</td>
                    <td>${e.conta}</td>
                    <td>${e.recorrente ? "Sim" : "Não"}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="updateData(${e.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteData(${e.id}, 'receita')">Excluir</button>
                    </td>
                </tr>`;
                tbody.insertAdjacentHTML("beforeend", row);
            });
        });
}

function loadDespesas() {
    const tbody = document.querySelector("#despesasTable tbody");
    if (!tbody) return; // evita erro
    fetch("http://localhost:3001/lancamentos?tipo=despesa")
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = "";
            data.forEach(e => {
                const row = `<tr class="despesa">
                    <td>${e.descricao}</td>
                    <td>${e.valor}</td>
                    <td>${e.categoria}</td>
                    <td>${e.conta}</td>
                    <td>${e.recorrente ? "Sim" : "Não"}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="updateData(${e.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteData(${e.id}, 'despesa')">Excluir</button>
                    </td>
                </tr>`;
                tbody.insertAdjacentHTML("beforeend", row);
            });
        });
}

function fetchLancamentos() {
    const tbody = document.getElementById("lancamentosTableBody");
    if (!tbody) return; // evita erro
    tbody.innerHTML = "";

    Promise.all([
        fetch("http://localhost:3001/lancamentos?tipo=receita").then(r => r.json()),
        fetch("http://localhost:3001/lancamentos?tipo=despesa").then(r => r.json())
    ]).then(([receitas, despesas]) => {
        [...receitas, ...despesas].forEach(e => {
            const row = `<tr>
                <td>${e.descricao}</td>
                <td>${e.valor}</td>
                <td>${e.categoria}</td>
                <td>${e.conta}</td>
                <td>${e.recorrente ? "Sim" : "Não"}</td>
                <td>${e.tipo}</td>
            </tr>`;
            tbody.insertAdjacentHTML("beforeend", row);
        });
    });
}

/* ---------- CONTAS ---------- */
function populateContas() {
    const contaSelect = document.getElementById("exampleInputConta");
    if (!contaSelect) return; // evita erro

    fetch("http://localhost:3001/carteiras")
        .then(res => res.json())
        .then(contas => {
            contas.forEach(conta => {
                const opt = document.createElement("option");
                opt.value = conta.id;
                opt.textContent = conta.nomeConta;
                contaSelect.appendChild(opt);
            });
        });
}
