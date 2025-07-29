document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const mural = document.getElementById('mural');
    const formNovoChamado = document.getElementById('form-novo-chamado');
    const modalOverlay = document.getElementById('modal-jogadores');
    const modalFechar = document.querySelector('.modal-fechar');
    const formAdicionarJogador = document.getElementById('form-adicionar-jogador');
    const modalTituloAventura = document.getElementById('modal-titulo-aventura');
    const modalListaJogadores = document.getElementById('modal-lista-jogadores');

    // --- ESTADO DA APLICAÇÃO ---
    // Usamos um array para guardar todas as aventuras.
    // Cada aventura é um objeto.
    let aventuras = [];
    let proximoId = 0;
    let aventuraAtivaId = null; // Guarda o ID da aventura sendo editada no modal

    // --- FUNÇÕES PRINCIPAIS ---

    /**
     * Renderiza (desenha) todas as aventuras do array 'aventuras' no mural.
     */
    function renderizarMural() {
        mural.innerHTML = ''; // Limpa o mural antes de redesenhar
        aventuras.forEach(aventura => {
            const elementoAventura = criarElementoAventura(aventura);
            mural.appendChild(elementoAventura);
        });
    }

    /**
     * Cria o elemento HTML para uma única aventura.
     * @param {object} aventura - O objeto da aventura com todos os dados.
     * @returns {HTMLElement} O elemento <div> do chamado pronto para ser inserido no DOM.
     */
    function criarElementoAventura(aventura) {
        const chamadoDiv = document.createElement('div');
        chamadoDiv.className = 'chamado';
        chamadoDiv.dataset.id = aventura.id; // Atribui um ID ao elemento

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
                    ${aventura.jogadores.map(nome => `<li>${nome}</li>`).join('')}
                </ul>
            </div>
        `;

        // Adiciona o evento de clique para abrir o modal
        chamadoDiv.addEventListener('click', () => abrirModal(aventura.id));

        return chamadoDiv;
    }
    
    /**
     * Adiciona uma nova aventura ao estado e atualiza o mural.
     */
    formNovoChamado.addEventListener('submit', (e) => {
        e.preventDefault();
        const novaAventura = {
            id: proximoId++,
            titulo: document.getElementById('input-titulo').value,
            descricao: document.getElementById('input-descricao').value,
            nivel: document.getElementById('input-nivel').value,
            mestre: document.getElementById('input-mestre').value,
            jogadores: [] // Começa sem jogadores
        };
        aventuras.unshift(novaAventura); // Adiciona no início do array
        renderizarMural();
        formNovoChamado.reset();
    });

    // --- LÓGICA DO MODAL ---

    function abrirModal(id) {
        aventuraAtivaId = id;
        const aventura = aventuras.find(a => a.id === id);
        if (!aventura) return;

        modalTituloAventura.textContent = aventura.titulo;
        renderizarListaJogadoresModal(aventura.jogadores);
        modalOverlay.classList.add('visivel');
    }

    function fecharModal() {
        modalOverlay.classList.remove('visivel');
        aventuraAtivaId = null;
    }

    function renderizarListaJogadoresModal(jogadores) {
        modalListaJogadores.innerHTML = '';
        jogadores.forEach(nome => {
            const item = document.createElement('div');
            item.className = 'jogador-item';
            item.innerHTML = `
                <span>${nome}</span>
                <button class="remover-jogador" data-nome="${nome}">&times;</button>
            `;
            modalListaJogadores.appendChild(item);
        });
    }
    
    formAdicionarJogador.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputNome = document.getElementById('input-nome-jogador');
        const nomeJogador = inputNome.value.trim();
        
        if (nomeJogador && aventuraAtivaId !== null) {
            const aventura = aventuras.find(a => a.id === aventuraAtivaId);
            if (aventura) {
                aventura.jogadores.push(nomeJogador);
                renderizarListaJogadoresModal(aventura.jogadores);
                // Atualiza a lista no card do mural também
                document.getElementById(`jogadores-${aventura.id}`).innerHTML = aventura.jogadores.map(nome => `<li>${nome}</li>`).join('');
            }
            inputNome.value = '';
        }
    });

    modalListaJogadores.addEventListener('click', (e) => {
        if (e.target.classList.contains('remover-jogador')) {
            const nomeParaRemover = e.target.dataset.nome;
            const aventura = aventuras.find(a => a.id === aventuraAtivaId);
            if (aventura) {
                aventura.jogadores = aventura.jogadores.filter(j => j !== nomeParaRemover);
                renderizarListaJogadoresModal(aventura.jogadores);
                 // Atualiza a lista no card do mural também
                document.getElementById(`jogadores-${aventura.id}`).innerHTML = aventura.jogadores.map(nome => `<li>${nome}</li>`).join('');
            }
        }
    });
    
    // Eventos para fechar o modal
    modalFechar.addEventListener('click', fecharModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) { // Fecha só se clicar no fundo
            fecharModal();
        }
    });

    // --- INICIALIZAÇÃO ---
    // A página agora começa vazia. A função carregarExemplos() foi removida.

});