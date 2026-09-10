// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================

const SUPABASE_URL = "https://qwuizejxvxuxozlftaxn.supabase.co";
const SUPABASE_KEY = "sb_publishable_xUN9lkY4Sm6uO_BtJ12iXw_UNUB7JMj";


// ==========================================
// 1. SISTEMA DE LOGIN
// ==========================================

function mostrarSenha() {
    const inputSenha = document.getElementById('senha');

    if (inputSenha && inputSenha.type === 'password') {
        inputSenha.type = 'text';
    } else if (inputSenha) {
        inputSenha.type = 'password';
    }
}

async function fazerLogin() {

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {

        const response = await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
                method: 'POST',
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: senha
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert('Login realizado com sucesso! 🎉');
            window.location.href = "dashboard.html";

        } else {

            alert(
                'E-mail ou senha incorretos.'
            );

            console.error(data);
        }

    } catch (error) {

        console.error("Erro no login:", error);

        alert(
            'Erro de conexão ao tentar fazer login.'
        );
    }
}


// ==========================================
// 2. QUANDO A PÁGINA CARREGAR
// ==========================================

document.addEventListener('DOMContentLoaded', function() {

    // CADASTRO
    const formCadastro = document.getElementById('formCadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', async function(event) {

            event.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('emailCliente').value;
            const telefone = document.getElementById('telefone').value;

            try {

                const response = await fetch(
                    `${SUPABASE_URL}/rest/v1/clientes`,
                    {
                        method: 'POST',
                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${SUPABASE_KEY}`,
                            "Content-Type": "application/json",
                            "Prefer": "return=minimal"
                        },
                        body: JSON.stringify({
                            nome: nome,
                            email: email,
                            telefone: telefone
                        })
                    }
                );

                if (response.ok) {
                    alert('Cliente cadastrado com sucesso na Nuvem! 🎉');
                    formCadastro.reset();
                } else {
                    const errData = await response
                        .json()
                        .catch(() => ({}));

                    alert(
                        'Erro ao salvar: ' +
                        (errData.message || response.statusText)
                    );
                }

            } catch (error) {
                console.error("Erro na requisição:", error);
                alert('Erro de conexão com a base de dados.');
            }
        });
    }


    // CONSULTA
    if (document.getElementById('corpoTabela')) {
        listarClientes();
    }


    // RELATÓRIOS
    if (document.getElementById('totalClientes')) {
        carregarRelatorios();
    }


    // DASHBOARD
    if (
        document.getElementById('totalClientesDashboard') ||
        document.getElementById('cadastrosHojeDashboard') ||
        document.getElementById('metaClientesDashboard')
    ) {
        carregarDashboard();
    }

});


// ==========================================
// 3. LISTAR CLIENTES
// ==========================================

async function listarClientes() {

    const corpoTabela = document.getElementById('corpoTabela');

    if (!corpoTabela) return;

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/clientes?select=*`,
            {
                method: 'GET',
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Erro ao procurar dados');
        }

        const listaClientes = await response.json();

        corpoTabela.innerHTML = '';

        if (!listaClientes || listaClientes.length === 0) {

            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #777;">
                        Nenhum cliente cadastrado ainda.
                    </td>
                </tr>
            `;

            return;
        }

        listaClientes.forEach((cliente) => {

            corpoTabela.innerHTML += `
                <tr>
                    <td>${cliente.nome}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.telefone}</td>
                    <td>
                        <button
                            class="btn-action"
                            onclick="excluirCliente(${cliente.id}, '${cliente.nome}')">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Erro ao listar:", error);
    }
}


// ==========================================
// 4. EXCLUIR CLIENTE
// ==========================================

async function excluirCliente(id, nome) {

    if (confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) {

        try {

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/clientes?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`
                    }
                }
            );

            if (response.ok) {
                listarClientes();
            } else {
                alert('Erro ao excluir o cliente.');
            }

        } catch (error) {
            console.error("Erro ao eliminar:", error);
        }
    }
}


// ==========================================
// 5. FILTRAR CLIENTES
// ==========================================

function filtrarClientes() {

    const termoBusca = document
        .getElementById('busca')
        .value
        .toLowerCase();

    const linhas = document.querySelectorAll('#corpoTabela tr');

    linhas.forEach(linha => {

        if (linha.textContent.toLowerCase().includes(termoBusca)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }

    });
}


// ==========================================
// 6. RELATÓRIOS
// ==========================================

async function carregarRelatorios() {

    const elementoTotal = document.getElementById('totalClientes');

    if (!elementoTotal) return;

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/clientes?select=*`,
            {
                method: 'GET',
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Erro ao carregar relatórios');
        }

        const listaClientes = await response.json();

        const total = listaClientes.length;

        elementoTotal.textContent = total;

        const meta = 150;

        const porcentagem = Math.min(
            Math.round((total / meta) * 100),
            100
        );

        const barra = document.getElementById('barraProgresso');
        const textoMeta = document.getElementById('porcentagemMeta');

        if (barra && textoMeta) {
            barra.style.width = `${porcentagem}%`;
            textoMeta.textContent =
                `Progresso: ${porcentagem}% da meta atingida`;
        }

    } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
    }
}


// ==========================================
// 7. DASHBOARD
// ==========================================

async function carregarDashboard() {

    const totalClientesDashboard =
        document.getElementById('totalClientesDashboard');

    const cadastrosHojeDashboard =
        document.getElementById('cadastrosHojeDashboard');

    const metaClientesDashboard =
        document.getElementById('metaClientesDashboard');

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/clientes?select=id,created_at`,
            {
                method: 'GET',
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Erro ao carregar dados do Dashboard');
        }

        const clientes = await response.json();


        // TOTAL DE CLIENTES
        const total = clientes.length;

        if (totalClientesDashboard) {
            totalClientesDashboard.textContent = total;
        }


        // CADASTROS REALIZADOS HOJE
        const hoje = new Date();

        const cadastrosHoje = clientes.filter(cliente => {

            const dataCadastro = new Date(cliente.created_at);

            return (
                dataCadastro.getFullYear() === hoje.getFullYear() &&
                dataCadastro.getMonth() === hoje.getMonth() &&
                dataCadastro.getDate() === hoje.getDate()
            );
        });

        if (cadastrosHojeDashboard) {
            cadastrosHojeDashboard.textContent =
                cadastrosHoje.length;
        }


        // META DE CLIENTES
        const meta = 150;

        let porcentagemMeta = Math.round(
            (total / meta) * 100
        );

        if (total > 0 && porcentagemMeta < 1) {
            porcentagemMeta = 1;
        }

        porcentagemMeta = Math.min(
            porcentagemMeta,
            100
        );

        if (metaClientesDashboard) {
            metaClientesDashboard.textContent =
                `${porcentagemMeta}%`;
        }

    } catch (error) {

        console.error(
            "Erro ao carregar Dashboard:",
            error
        );

        if (totalClientesDashboard) {
            totalClientesDashboard.textContent = "0";
        }

        if (cadastrosHojeDashboard) {
            cadastrosHojeDashboard.textContent = "0";
        }

        if (metaClientesDashboard) {
            metaClientesDashboard.textContent = "0%";
        }
    }
}