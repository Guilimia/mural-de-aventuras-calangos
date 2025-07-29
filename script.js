document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const mural = document.getElementById('mural');
    const formNovoChamado = document.getElementById('form-novo-chamado');
    const modalOverlay = document.getElementById('modal-jogadores');
    const modalFechar = document.querySelector('.modal-fechar');
    const formAdicionarJogador = document.getElementById('form-adicionar-jogador');
    const modalTituloAventura = document.getElementById('modal-titulo-aventura');
    const modalListaJogadores = document.getElementById('modal-lista-jogadores');
    const indicadorCarregando = document.getElementById('carregando');

    // --- 1. CONEXÃO COM O SUPABASE ---
    // Certifique-se de que suas chaves estão corretas aqui!
    const SUPABASE_URL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdm10YnFubm5rdmtsanN4ZnZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjYxODUsImV4cCI6MjA2OTQwMjE4NX0.jD5djgfWxdzQtT5dhbSQbHTpri9_thsw1mLSYZZm__Q';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdm10YnFubm5rdmtsanN4ZnZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyNjE4NSwiZXhwIjoyMDY5NDAyMTg1fQ.01b30c8m-A7g7H27rkWhAxOrKU1kzWbUFUIQcvjZYZk';

    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- ESTADO DA APLICAÇÃO ---
    let aventuraAtivaId = null;
    let aventuraAtivaJogadores = [];

    // --- FUNÇÕES PRINCIPAIS ---

    /**
     * Busca todas as aventuras no banco de dados e as renderiza no mural.
     */
    async function carregarAventuras() {
        indicadorCarregando.style.display = 'block';
        mural.innerHTML = '';

        const { data: aventuras, error } = await supabase
            .from('aventuras')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar aventuras:', error);
            indicadorCarregando.textContent = `Erro ao carregar as aventuras: ${error.message}`;
            return;
        }

        if (aventuras.length === 0) {
            indicadorCarregando.textContent = 'Nenhum chamado de aventura ainda. Crie o primeiro!';
        } else {
            aventuras.forEach(aventura => {
                const elementoAventura = criarElementoAventura(aventura);
                mural.appendChild(elementoAventura);
            });
            indicadorCarregando.style.display = 'none';
        }
    }

    /**
     * Cria o elemento HTML para uma única aventura.
     */
    function criarElementoAventura(aventura) {
        const chamadoDiv = document.createElement('div');
        chamadoDiv.className = 'chamado';
        chamadoDiv.dataset.id = aventura.id;
        const jogadores = aventura.jogadores || [];

        chamadoDiv.innerHTML = `
            <h3>${aventura.titulo}</h3>
            <p>${aventura.descricao}</p>
            <div class="info-adicional">
                <p><strong>Nível:</strong> ${aventura.nivel}</p>
                <p><strong>Mestre:</strong> ${aventura.mestre}</p>
            </div>
            <div class="lista-jogadores">
                <h4>Jogadores:</h4>
                <ul id="jogadores-${aventura.id}">
                    ${jogadores.map(nome => `<li>${nome}</li>`).join('')}
                </ul>
            </div>
        `;
        chamadoDiv.addEventListener('click', () => abrirModal(aventura));
        return chamadoDiv;
    }
    
    /**
     * Envia uma nova aventura para o banco de dados do Supabase.
     */
    formNovoChamado.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Publicando...';

        // CORREÇÃO: Pegando os valores diretamente pelo ID.
        const titulo = document.getElementById('input-titulo').value;
        const descricao = document.getElementById('input-descricao').value;
        const nivel = document.getElementById('input-nivel').value;
        const mestre = document.getElementById('input-mestre').value;

        const { data, error } = await supabase
            .from('aventuras')
            .insert({ titulo, descricao, nivel, mestre, jogadores: [] })
            .select();

        if (error) {
            console.error('Erro ao inserir aventura:', error);
            alert(`Não foi possível criar a aventura: ${error.message}`);
        } else {
            formNovoChamado.reset();
            await carregarAventuras();
        }
        btn.disabled = false;
        btn.textContent = 'Publicar Novo Chamado';
    });

    // --- LÓGICA DO MODAL ---

    function abrirModal(aventura) {
        aventuraAtivaId = aventura.id;
        aventuraAtivaJogadores = aventura.jogadores || [];
        modalTituloAventura.textContent = aventura.titulo;
        renderizarListaJogadoresModal(aventuraAtivaJogadores);
        modalOverlay.classList.add('visivel');
    }

    function fecharModal() {
        modalOverlay.classList.remove('visivel');
        aventuraAtivaId = null;
        aventuraAtivaJogadores = [];
    }
    
    function renderizarListaJogadoresModal(jogadores) {
        modalListaJogadores.innerHTML = '';
        jogadores.forEach(nome => {
            const item = document.createElement('div');
            item.className = 'jogador-item';
            item.innerHTML = `<span>${nome}</span><button class="remover-jogador" data-nome="${nome}">&times;</button>`;
            modalListaJogadores.appendChild(item);
        });
    }
    
    formAdicionarJogador.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputNome = document.getElementById('input-nome-jogador');
        const nomeJogador = inputNome.value.trim();
        
        if (nomeJogador && aventuraAtivaId !== null) {
            const novaListaJogadores = [...aventuraAtivaJogadores, nomeJogador];
            const { data, error } = await supabase
                .from('aventuras')
                .update({ jogadores: novaListaJogadores })
                .eq('id', aventuraAtivaId)
                .select();
            
            if (error) {
                console.error('Erro ao adicionar jogador:', error);
                alert(`Não foi possível adicionar o jogador: ${error.message}`);
            } else {
                aventuraAtivaJogadores = novaListaJogadores;
                renderizarListaJogadoresModal(aventuraAtivaJogadores);
                document.getElementById(`jogadores-${aventuraAtivaId}`).innerHTML = aventuraAtivaJogadores.map(nome => `<li>${nome}</li>`).join('');
                inputNome.value = '';
                inputNome.focus();
            }
        }
    });

    modalListaJogadores.addEventListener('click', async (e) => {
        if (e.target.classList.contains('remover-jogador')) {
            const nomeParaRemover = e.target.dataset.nome;
            const novaListaJogadores = aventuraAtivaJogadores.filter(j => j !== nomeParaRemover);

            const { data, error } = await supabase
                .from('aventuras')
                .update({ jogadores: novaListaJogadores })
                .eq('id', aventuraAtivaId)
                .select();

            if (error) {
                console.error('Erro ao remover jogador:', error);
                alert(`Não foi possível remover o jogador: ${error.message}`);
            } else {
                aventuraAtivaJogadores = novaListaJogadores;
                renderizarListaJogadoresModal(aventuraAtivaJogadores);
                document.getElementById(`jogadores-${aventuraAtivaId}`).innerHTML = aventuraAtivaJogadores.map(nome => `<li>${nome}</li>`).join('');
            }
        }
    });
    
    modalFechar.addEventListener('click', fecharModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) fecharModal(); });

    carregarAventuras();
});