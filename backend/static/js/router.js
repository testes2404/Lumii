// router.js - Sistema de Roteamento SPA para Área do Candidato
class CandidateRouter {
    constructor() {
        this.routes = {
            '/candidato': this.renderDashboard.bind(this),
            '/candidato/': this.renderDashboard.bind(this),
            '/candidato/perfil': this.renderPerfil.bind(this),
            '/candidato/vagas': this.renderVagas.bind(this),
            '/candidato/estudos': this.renderEstudos.bind(this)
        };
        
        this.mainContent = null;
        this.init();
    }

    init() {
        this.mainContent = document.getElementById('mainContentArea');
        
        // Escuta mudanças na URL
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        
        // Intercepta cliques nos botões de navegação
        this.setupNavigation();
        
        // Verifica se há uma rota desejada armazenada
        const desiredRoute = sessionStorage.getItem('desired_route');
        if (desiredRoute) {
            sessionStorage.removeItem('desired_route');
            // Atualiza a URL e navega para a rota desejada
            history.replaceState(null, '', desiredRoute);
            this.handleRoute();
        } else {
            // Rota inicial
            this.handleRoute();
        }
    }

    setupNavigation() {
        // Intercepta cliques nos botões da navbar (exceto currículo e desenvolvimento)
        const navButtons = {
            'meuPerfilBtn': '/candidato/perfil',
            'minhasVagasBtn': '/candidato/vagas',
            'meusEstudosBtn': '/candidato/estudos'
        };

        Object.entries(navButtons).forEach(([buttonId, route]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateTo(route);
                });
            }
        });

        // Botões que abrem em nova aba (não interceptados pelo router)
        // Usar setTimeout para garantir que estes listeners sejam adicionados por último
        setTimeout(() => {
            const curriculoBtn = document.getElementById('curriculoBtn');
            if (curriculoBtn) {
                // Remove qualquer listener existente
                curriculoBtn.removeEventListener('click', this.handleCurriculoClick);
                
                // Adiciona novo listener com alta prioridade
                curriculoBtn.addEventListener('click', this.handleCurriculoClick, true);
            }

            const desenvolvimentoBtn = document.getElementById('meuDesenvolvimentoBtn');
            if (desenvolvimentoBtn) {
                // Remove qualquer listener existente
                desenvolvimentoBtn.removeEventListener('click', this.handleDesenvolvimentoClick);
                
                // Adiciona novo listener com alta prioridade
                desenvolvimentoBtn.addEventListener('click', this.handleDesenvolvimentoClick, true);
            }
        }, 100);
    }

    handleCurriculoClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('Abrindo currículo em nova aba');
        window.open('/candidato/curriculo-melhor.html', '_blank');
        return false;
    }

    handleDesenvolvimentoClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('Abrindo entrevistas em nova aba');
        window.open('/candidato/entrevistas.html', '_blank');
        return false;
    }

    navigateTo(route) {
        // Atualiza a URL sem recarregar a página
        history.pushState(null, '', route);
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname;
        const route = this.routes[path];
        
        if (route) {
            route();
        } else {
            // Rota não encontrada, redireciona para dashboard
            this.navigateTo('/candidato');
        }
    }

    // Rota: /candidato (Dashboard principal)
    async renderDashboard() {
        const email = localStorage.getItem('candidateEmail');
        if (!email) {
            window.location.href = '/index.html';
            return;
        }

        try {
            // Importa Firebase apenas quando necessário
            const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
            
            const perfilRef = collection(window.db, 'profiles');
            const perfilQ = query(perfilRef, where('email', '==', email));
            const snap = await getDocs(perfilQ);
            
            if (snap.empty) {
                this.mainContent.innerHTML = this.createPageContainer(
                    'Dashboard',
                    '<h1>Erro: perfil não encontrado.</h1>'
                );
            } else {
                const d = snap.docs[0].data();
                this.mainContent.innerHTML = this.createPageContainer(
                    'Dashboard',
                    `
                    <div style="text-align: center; padding: 2rem;">
                        <h1>Olá, ${d.full_name}!</h1>
                        <p><strong>E-mail:</strong> ${d.email}</p>
                        <p><strong>CPF:</strong> ${d.cpf || '–'}</p>
                        <p><strong>Data de nascimento:</strong> ${d.birth_date || '–'}</p>
                        <p><strong>Cidade:</strong> ${d.city || '–'} — <strong>Estado:</strong> ${d.state || '–'}</p>
                        
                        <div style="margin-top: 3rem;">
                            <h2>Acesso Rápido</h2>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 2rem;">
                                <div class="quick-access-card" onclick="candidateRouter.navigateTo('/candidato/perfil')">
                                    <h3>👤 Meu Perfil</h3>
                                    <p>Editar currículo e biografia</p>
                                </div>
                                <div class="quick-access-card" onclick="candidateRouter.navigateTo('/candidato/vagas')">
                                    <h3>💼 Minhas Vagas</h3>
                                    <p>Explorar oportunidades</p>
                                </div>
                                <div class="quick-access-card" onclick="candidateRouter.navigateTo('/candidato/estudos')">
                                    <h3>📚 Meus Estudos</h3>
                                    <p>Materiais de aprendizado</p>
                                </div>
                                <div class="quick-access-card" onclick="candidateRouter.navigateTo('/candidato/desenvolvimento')">
                                    <h3>🚀 Desenvolvimento</h3>
                                    <p>Progresso e entrevistas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    `
                );
            }
        } catch (error) {
            this.mainContent.innerHTML = this.createPageContainer(
                'Dashboard',
                '<h1>Erro ao carregar perfil.</h1>'
            );
        }
    }

    // Rota: /candidato/perfil
    renderPerfil() {
        this.mainContent.innerHTML = this.createPageContainer(
            'Meu Perfil',
            `
            <main class="container-principal">
              <div class="coluna coluna-esquerda">
                <h1>Criador de Currículo</h1>
                <form id="form-curriculo">
                  <h2>Dados Pessoais</h2>
                  <input type="text" name="nome" placeholder="Nome Completo" required>
                  <input type="email" name="email" placeholder="Seu E-mail" required>
                  <input type="tel" name="telefone" placeholder="Telefone / WhatsApp">
                  <input type="text" name="linkedin" placeholder="URL do LinkedIn">
                  <input type="text" name="portfolio" placeholder="URL do Portfólio">

                  <h2>Resumo Profissional</h2>
                  <textarea name="resumo" placeholder="Um parágrafo sobre sua carreira"></textarea>

                  <h2>Experiência Profissional</h2>
                  <div id="experiencias-container"></div>
                  <button type="button" id="add-experiencia">+ Adicionar Experiência</button>

                  <h2>Formação Acadêmica</h2>
                  <div id="formacao-container"></div>
                  <button type="button" id="add-formacao">+ Adicionar Formação</button>

                  <h2>Habilidades</h2>
                  <textarea name="habilidades" placeholder="Liste suas habilidades, separadas por vírgula"></textarea>

                  <button type="submit" class="botao-principal">Salvar Currículo</button>
                </form>
              </div>
              <div class="coluna coluna-direita">
                <h1>Sua Biografia</h1>
                <p>Escreva um texto autêntico sobre você. (Colar e Desfazer desativados)</p>
                <textarea id="bio-textarea"></textarea>
              </div>
            </main>
            `
        );
        
        // Reativa os event listeners do formulário
        if (window.setupProfileFormListeners) {
            window.setupProfileFormListeners();
        }
    }

    // Rota: /candidato/vagas
    async renderVagas() {
        this.mainContent.innerHTML = this.createPageContainer(
            'Minhas Vagas',
            `
            <div class="filters" style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
              <input id="filterTitle" type="text" placeholder="Filtrar por título…" style="flex: 1; min-width: 200px; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #FFF; backdrop-filter: blur(8px);" />
              <input id="filterCompany" type="text" placeholder="Filtrar por empresa…" style="flex: 1; min-width: 200px; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #FFF; backdrop-filter: blur(8px);" />
              <input id="filterSalary" type="number" placeholder="Salário mínimo" style="flex: 1; min-width: 150px; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #FFF; backdrop-filter: blur(8px);" />
            </div>
            
            <div id="listaVagas" style="max-height: 600px; overflow-y: auto;"></div>
            `
        );

        // Reativa os filtros e carrega as vagas
        if (window.setupVagasFilters) {
            window.setupVagasFilters();
        }
        if (window.loadVagasInterna) {
            await window.loadVagasInterna();
        }
    }

    // Rota: /candidato/estudos
    async renderEstudos() {
        if (window.loadPageContent) {
            await window.loadPageContent('estudos.html', 'Meus Estudos');
        } else {
            this.mainContent.innerHTML = this.createPageContainer(
                'Erro',
                '<p>Função de carregamento não encontrada.</p>'
            );
        }
    }

    // Utility: Cria container padronizado para páginas
    createPageContainer(title, content) {
        return `
          <div class="page-container">
            <div class="section-header">
              <h1>${title}</h1>
            </div>
            
            <div class="section-content">
              ${content}
            </div>
          </div>
        `;
    }

    // Método executeScripts removido - não necessário para nova aba
}

// Instância global do router
window.candidateRouter = null;