// ==========================================
// CONFIGURAÇÃO OFICIAL DO SUPABASE 🚀
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

function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    if (email === 'carol@email.com' && senha === '12345') {
        alert('Seja bem-vinda, Carol!');
        window.location.href = "dashboard.html";
    } else {
        alert('Ops! E-mail ou senha incorretos.');
    }
}

// ==========================================
// 2. SISTEMA DE CADASTRO (SALVAR NA NUVEM VIA FETCH)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const formCadastro = document.getElementById('formCadastro');
    
    if (formCadastro) {
        formCadastro.addEventListener('submit', async function(event) {
            event.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('emailCliente').value;
            const telefone = document.getElementById('telefone').value;

            try {
                // Requisição direta contornando restrições do navegador
                const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes`, {
                    method: 'POST',
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify({ nome: nome, email: email, telefone: telefone })
                });

                if (response.ok) {
                    alert('Cliente cadastrado com sucesso na Nuvem! 🎉');
                    formCadastro.reset();
                } else {
                    const errData = await response.json().catch(() => ({}));
                    alert('Erro ao salvar: ' + (errData.message || response.statusText));
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert('Erro de conexão com a base de dados.');
            }
        });
    }

    if (document.getElementById('corpoTabela')) {
        listarClientes();
    }

    if (document.getElementById('totalClientes')) {
        carregarRelatorios();
    }
});

// ==========================================
// 3. SISTEMA DE CONSULTA (LISTAR E EXCLUIR)
// ==========================================
async function listarClientes() {
    const corpoTabela = document.getElementById('corpoTabela');
    if (!corpoTabela) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes?select=*`, {
            method: 'GET',
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) throw new Error('Erro ao procurar dados');
        const listaClientes = await response.json();

        corpoTabela.innerHTML = '';

        if (!listaClientes || listaClientes.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #777;">Nenhum cliente cadastrado ainda.</td></tr>`;
            return;
        }

        listaClientes.forEach((cliente) => {
            corpoTabela.innerHTML += `
                <tr>
                    <td>${cliente.nome}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.telefone}</td>
                    <td>
                        <button class="btn-action" onclick="excluirCliente(${cliente.id}, '${cliente.nome}')">🗑️</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao listar:", error);
    }
}

async function excluirCliente(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            });

            if (response.ok) {
                listarClientes(); // Atualiza a tabela
            } else {
                alert('Erro ao excluir o cliente.');
            }
        } catch (error) {
            console.error("Erro ao eliminar:", error);
        }
    }
}

function filtrarClientes() {
    const termoBusca = document.getElementById('busca').value.toLowerCase();
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
// 4. SISTEMA DE RELATÓRIOS (ESTATÍSTICAS REAIS)
// ==========================================
async function carregarRelatorios() {
    const elementoTotal = document.getElementById('totalClientes');
    if (!elementoTotal) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes?select=*`, {
            method: 'GET',
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar relatórios');
        const listaClientes = await response.json();

        const total = listaClientes.length;
        elementoTotal.textContent = total;

        const meta = 150;
        const porcentagem = Math.min(Math.round((total / meta) * 100), 100);

        const barra = document.getElementById('barraProgresso');
        const textoMeta = document.getElementById('porcentagemMeta');
        
        if (barra && textoMeta) {
            barra.style.width = `${porcentagem}%`;
            textoMeta.textContent = `Progresso: ${porcentagem}% da meta atingida`;
        }
    } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
    }
}