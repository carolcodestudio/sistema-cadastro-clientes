// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================

const SUPABASE_URL = "https://qwuizejxvxuxozlftaxn.supabase.co";

// IMPORTANTE:
// coloque aqui a MESMA chave SUPABASE_KEY
// que já estava funcionando no seu projeto
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

            // Salva a sessão do usuário
            localStorage.setItem(
                'supabase_access_token',
                data.access_token
            );

            localStorage.setItem(
                'supabase_refresh_token',
                data.refresh_token
            );

            alert('Login realizado com sucesso! 🎉');

            window.location.href = "dashboard.html";

        } else {

            alert('E-mail ou senha incorretos.');

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
// 2. VERIFICAR SESSÃO
// ==========================================

async function verificarSessao() {

    const token = localStorage.getItem(
        'supabase_access_token'
    );

    if (!token) {

        window.location.href = "login.html";
        return false;
    }

    try {

        const response = await fetch(
            `${SUPABASE_URL}/auth/v1/user`,
            {
                method: 'GET',
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            localStorage.removeItem(
                'supabase_access_token'
            );

            localStorage.removeItem(
                'supabase_refresh_token'
            );

            window.location.href = "login.html";

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );

        return false;
    }
}


// ==========================================
// 3. SAIR DO SISTEMA
// ==========================================

async function sair() {

    const token = localStorage.getItem(
        'supabase_access_token'
    );

    try {

        if (token) {

            await fetch(
                `${SUPABASE_URL}/auth/v1/logout`,
                {
                    method: 'POST',
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
        }

    } catch (error) {

        console.error(
            "Erro ao encerrar sessão:",
            error
        );
    }

    localStorage.removeItem(
        'supabase_access_token'
    );

    localStorage.removeItem(
        'supabase_refresh_token'
    );

    window.location.replace("login.html");
}

// ==========================================
// 4. QUANDO A PÁGINA CARREGAR
// ==========================================

document.addEventListener(
    'DOMContentLoaded',
    async function() {

        const paginaAtual =
            window.location.pathname
                .split('/')
                .pop();


        // ==================================
        // PROTEGER PÁGINAS INTERNAS
        // ==================================

        const paginasProtegidas = [
            'dashboard.html',
            'cadastro.html',
            'consulta.html',
            'relatorio.html'
        ];

        if (
            paginasProtegidas.includes(
                paginaAtual
            )
        ) {

            const sessaoValida =
                await verificarSessao();

            if (!sessaoValida) {
                return;
            }
        }


        // ==================================
        // BOTÃO SAIR
        // ==================================

        const linksLogin =
            document.querySelectorAll(
                'a[href="login.html"]'
            );

        linksLogin.forEach(link => {

            if (paginaAtual !== 'login.html') {

                link.addEventListener(
                    'click',
                    function(event) {

                        event.preventDefault();

                        sair();
                    }
                );
            }
        });


        // ==================================
        // CADASTRO
        // ==================================

        const formCadastro =
            document.getElementById(
                'formCadastro'
            );

        if (formCadastro) {

            formCadastro.addEventListener(
                'submit',
                async function(event) {

                    event.preventDefault();

                    const nome =
                        document.getElementById(
                            'nome'
                        ).value;

                    const email =
                        document.getElementById(
                            'emailCliente'
                        ).value;

                    const telefone =
                        document.getElementById(
                            'telefone'
                        ).value;

                    try {

                        const token =
                            localStorage.getItem(
                                'supabase_access_token'
                            );

                        const response =
                            await fetch(
                                `${SUPABASE_URL}/rest/v1/clientes`,
                                {
                                    method: 'POST',

                                    headers: {
                                        "apikey":
                                            SUPABASE_KEY,

                                        "Authorization":
                                            `Bearer ${token}`,

                                        "Content-Type":
                                            "application/json",

                                        "Prefer":
                                            "return=minimal"
                                    },

                                    body:
                                        JSON.stringify({
                                            nome: nome,
                                            email: email,
                                            telefone:
                                                telefone
                                        })
                                }
                            );

                        if (response.ok) {

                            alert(
                                'Cliente cadastrado com sucesso na Nuvem! 🎉'
                            );

                            formCadastro.reset();

                        } else {

                            const errData =
                                await response
                                    .json()
                                    .catch(
                                        () => ({})
                                    );

                            alert(
                                'Erro ao salvar: ' +
                                (
                                    errData.message ||
                                    response.statusText
                                )
                            );
                        }

                    } catch (error) {

                        console.error(
                            "Erro na requisição:",
                            error
                        );

                        alert(
                            'Erro de conexão com a base de dados.'
                        );
                    }
                }
            );
        }


        // ==================================
        // CONSULTA
        // ==================================

        if (
            document.getElementById(
                'corpoTabela'
            )
        ) {
            listarClientes();
        }


        // ==================================
        // RELATÓRIOS
        // ==================================

        if (
            document.getElementById(
                'totalClientes'
            )
        ) {
            carregarRelatorios();
        }


        // ==================================
        // DASHBOARD
        // ==================================

        if (
            document.getElementById(
                'totalClientesDashboard'
            ) ||

            document.getElementById(
                'cadastrosHojeDashboard'
            ) ||

            document.getElementById(
                'metaClientesDashboard'
            )
        ) {
            carregarDashboard();
        }
    }
);


// ==========================================
// 5. LISTAR CLIENTES
// ==========================================

async function listarClientes() {

    const corpoTabela =
        document.getElementById(
            'corpoTabela'
        );

    if (!corpoTabela) return;

    try {

        const token =
            localStorage.getItem(
                'supabase_access_token'
            );

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/clientes?select=*`,
            {
                method: 'GET',

                headers: {
                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                'Erro ao procurar dados'
            );
        }

        const listaClientes =
            await response.json();

        corpoTabela.innerHTML = '';

        if (
            !listaClientes ||
            listaClientes.length === 0
        ) {

            corpoTabela.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        style="
                            text-align: center;
                            color: #777;
                        ">
                        Nenhum cliente cadastrado ainda.
                    </td>
                </tr>
            `;

            return;
        }

        listaClientes.forEach(
            cliente => {

                corpoTabela.innerHTML += `
                    <tr>
                        <td>${cliente.nome}</td>
                        <td>${cliente.email}</td>
                        <td>${cliente.telefone}</td>

                        <td>
                            <button
                                class="btn-action"
                                onclick="
                                    excluirCliente(
                                        ${cliente.id},
                                        '${cliente.nome}'
                                    )
                                ">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            }
        );

    } catch (error) {

        console.error(
            "Erro ao listar:",
            error
        );
    }
}


// ==========================================
// 6. EXCLUIR CLIENTE
// ==========================================

async function excluirCliente(
    id,
    nome
) {

    if (
        confirm(
            `Tem certeza que deseja excluir o cliente ${nome}?`
        )
    ) {

        try {

            const token =
                localStorage.getItem(
                    'supabase_access_token'
                );

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/clientes?id=eq.${id}`,
                    {
                        method: 'DELETE',

                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );

            if (response.ok) {

                listarClientes();

            } else {

                alert(
                    'Erro ao excluir o cliente.'
                );
            }

        } catch (error) {

            console.error(
                "Erro ao eliminar:",
                error
            );
        }
    }
}


// ==========================================
// 7. FILTRAR CLIENTES
// ==========================================

function filtrarClientes() {

    const termoBusca =
        document
            .getElementById('busca')
            .value
            .toLowerCase();

    const linhas =
        document.querySelectorAll(
            '#corpoTabela tr'
        );

    linhas.forEach(linha => {

        if (
            linha.textContent
                .toLowerCase()
                .includes(termoBusca)
        ) {

            linha.style.display = '';

        } else {

            linha.style.display = 'none';
        }
    });
}


// ==========================================
// 8. RELATÓRIOS
// ==========================================

async function carregarRelatorios() {

    const elementoTotal =
        document.getElementById(
            'totalClientes'
        );

    if (!elementoTotal) return;

    try {

        const token =
            localStorage.getItem(
                'supabase_access_token'
            );

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/clientes?select=*`,
            {
                method: 'GET',

                headers: {
                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                'Erro ao carregar relatórios'
            );
        }

        const listaClientes =
            await response.json();

        const total =
            listaClientes.length;

        elementoTotal.textContent =
            total;

        const meta = 150;

        const porcentagem =
            Math.min(
                Math.round(
                    (total / meta) * 100
                ),
                100
            );

        const barra =
            document.getElementById(
                'barraProgresso'
            );

        const textoMeta =
            document.getElementById(
                'porcentagemMeta'
            );

        if (
            barra &&
            textoMeta
        ) {

            barra.style.width =
                `${porcentagem}%`;

            textoMeta.textContent =
                `Progresso: ${porcentagem}% da meta atingida`;
        }

    } catch (error) {

        console.error(
            "Erro ao carregar relatórios:",
            error
        );
    }
}


// ==========================================
// 9. DASHBOARD
// ==========================================

async function carregarDashboard() {

    const totalClientesDashboard =
        document.getElementById(
            'totalClientesDashboard'
        );

    const cadastrosHojeDashboard =
        document.getElementById(
            'cadastrosHojeDashboard'
        );

    const metaClientesDashboard =
        document.getElementById(
            'metaClientesDashboard'
        );

    try {

        const token =
            localStorage.getItem(
                'supabase_access_token'
            );

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/clientes?select=id,created_at`,
            {
                method: 'GET',

                headers: {
                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                'Erro ao carregar dados do Dashboard'
            );
        }

        const clientes =
            await response.json();


        // TOTAL DE CLIENTES
        const total =
            clientes.length;

        if (
            totalClientesDashboard
        ) {

            totalClientesDashboard
                .textContent = total;
        }


        // CADASTROS DE HOJE
        const hoje =
            new Date();

        const cadastrosHoje =
            clientes.filter(
                cliente => {

                    const dataCadastro =
                        new Date(
                            cliente.created_at
                        );

                    return (
                        dataCadastro
                            .getFullYear() ===
                            hoje.getFullYear() &&

                        dataCadastro
                            .getMonth() ===
                            hoje.getMonth() &&

                        dataCadastro
                            .getDate() ===
                            hoje.getDate()
                    );
                }
            );

        if (
            cadastrosHojeDashboard
        ) {

            cadastrosHojeDashboard
                .textContent =
                cadastrosHoje.length;
        }


        // META DE CLIENTES
        const meta = 150;

        let porcentagemMeta =
            Math.round(
                (total / meta) * 100
            );

        if (
            total > 0 &&
            porcentagemMeta < 1
        ) {

            porcentagemMeta = 1;
        }

        porcentagemMeta =
            Math.min(
                porcentagemMeta,
                100
            );

        if (
            metaClientesDashboard
        ) {

            metaClientesDashboard
                .textContent =
                `${porcentagemMeta}%`;
        }

    } catch (error) {

        console.error(
            "Erro ao carregar Dashboard:",
            error
        );

        if (
            totalClientesDashboard
        ) {
            totalClientesDashboard
                .textContent = "0";
        }

        if (
            cadastrosHojeDashboard
        ) {
            cadastrosHojeDashboard
                .textContent = "0";
        }

        if (
            metaClientesDashboard
        ) {
            metaClientesDashboard
                .textContent = "0%";
        }
    }
}