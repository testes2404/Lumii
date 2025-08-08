// router.js - Sistema de Roteamento SPA para Área do Candidato
class CandidateRouter {
    constructor() {
        this.routes = {
            '/candidato': this.renderDashboard.bind(this),
            '/candidato/': this.renderDashboard.bind(this),
            '/candidato/perfil': this.renderPerfil.bind(this),
            '/candidato/vagas': this.renderVagas.bind(this),
            '/candidato/estudos': this.renderEstudos.bind(this),
            '/candidato/curriculo': this.renderCurriculo.bind(this),
            '/candidato/desenvolvimento': this.renderDesenvolvimento.bind(this)
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
        // Remove todos os listeners existentes primeiro
        this.removeAllListeners();
        
        // Intercepta cliques nos botões da navbar
        const navButtons = {
            'meuPerfilBtn': '/candidato/perfil',
            'minhasVagasBtn': '/candidato/vagas',
            'meusEstudosBtn': '/candidato/estudos',
            'curriculoBtn': '/candidato/curriculo',
            'meuDesenvolvimentoBtn': '/candidato/desenvolvimento'
        };

        Object.entries(navButtons).forEach(([buttonId, route]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                // Remove qualquer onclick e href que possa existir
                button.removeAttribute('onclick');
                button.removeAttribute('href');
                
                // Force override do comportamento
                button.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    this.navigateTo(route);
                    return false;
                };
                
                // Remove listeners existentes e adiciona o novo com captura
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    this.navigateTo(route);
                    return false;
                }, true);
            }
        });
    }

    removeAllListeners() {
        // Remove listeners antigos clonando e substituindo elementos
        const navButtons = [
            'meuPerfilBtn', 'minhasVagasBtn', 'meusEstudosBtn', 
            'curriculoBtn', 'meuDesenvolvimentoBtn'
        ];
        
        navButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                const newButton = button.cloneNode(true);
                // Remove qualquer atributo que possa causar navegação
                newButton.removeAttribute('onclick');
                newButton.removeAttribute('href');
                newButton.removeAttribute('target');
                button.parentNode.replaceChild(newButton, button);
            }
        });
        
        // Especial para o botão de desenvolvimento - recriar completamente
        const devBtn = document.getElementById('meuDesenvolvimentoBtn');
        if (devBtn) {
            const newDevBtn = document.createElement('button');
            newDevBtn.id = 'meuDesenvolvimentoBtn';
            newDevBtn.className = 'btn';
            newDevBtn.type = 'button';
            newDevBtn.textContent = 'Meu Desenvolvimento';
            devBtn.parentNode.replaceChild(newDevBtn, devBtn);
        }
    }


    navigateTo(route) {
        // Atualiza a URL sem recarregar a página
        history.pushState(null, '', route);
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname;
        const route = this.routes[path];
        
        // Limpa estados específicos de páginas
        this.mainContent.classList.remove('curriculo-mode', 'entrevistas-mode');
        
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
                                    <h3>🚀 Meu Desenvolvimento</h3>
                                    <p>Entrevistas e progresso</p>
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
        
        // Reativa os event listeners do formulário após delay
        setTimeout(() => {
            if (window.setupProfileFormListeners) {
                window.setupProfileFormListeners();
            }
            
            // Carrega dados existentes após configurar listeners
            if (window.loadExistingCurriculo) {
                window.loadExistingCurriculo();
            }
        }, 100);
        
        // Verifica novamente após mais tempo para garantir
        setTimeout(() => {
            if (window.setupProfileFormListeners) {
                window.setupProfileFormListeners();
            }
            
            // Tenta carregar novamente se não carregou antes
            if (window.loadExistingCurriculo) {
                window.loadExistingCurriculo();
            }
        }, 500);
    }

    // Rota: /candidato/vagas
    async renderVagas() {
        this.mainContent.innerHTML = this.createPageContainer(
            'Minhas Vagas',
            `
            <div class="vagas-layout" style="display: grid; grid-template-columns: 1fr 400px; gap: 2rem; height: 70vh;">
                <div class="vagas-list-container" style="display: flex; flex-direction: column;">
                    <div class="filters" style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
                      <input id="filterTitle" type="text" placeholder="Filtrar por título…" style="flex: 1; min-width: 200px; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #FFF; backdrop-filter: blur(8px);" />
                      <input id="filterCompany" type="text" placeholder="Filtrar por empresa…" style="flex: 1; min-width: 200px; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #FFF; backdrop-filter: blur(8px);" />
                      <input id="filterSalary" type="number" placeholder="Salário mínimo" style="flex: 1; min-width: 150px; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #FFF; backdrop-filter: blur(8px);" />
                    </div>
                    
                    <div id="listaVagas" style="flex: 1; overflow-y: auto; padding-right: 1rem;"></div>
                </div>
                
                <div class="vaga-details-container" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1); overflow-y: auto;">
                    <div id="vagaDetailsPanel">
                        <div style="text-align: center; color: #888; padding: 4rem 0;">
                            <h3>Selecione uma vaga</h3>
                            <p>Clique em uma vaga à esquerda para ver os detalhes e se candidatar</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
            @media (max-width: 1024px) {
                .vagas-layout {
                    grid-template-columns: 1fr !important;
                    grid-template-rows: 1fr auto;
                    height: auto !important;
                }
                .vaga-details-container {
                    max-height: 400px;
                }
            }
            </style>
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

    // Rota: /candidato/curriculo
    async renderCurriculo() {
        try {
            // Carrega o HTML completo da página de currículo
            const response = await fetch('/candidato/curriculo-melhor.html');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Carrega os CSS necessários dinamicamente
            await this.loadCurriculumStyles(doc);
            
            // Extrai apenas o conteúdo da div .page (sem header)
            const pageDiv = doc.querySelector('.page');
            const pageContent = pageDiv ? pageDiv.outerHTML : doc.body.innerHTML;
            
            // Adiciona classe para modificar estilos do container principal
            this.mainContent.classList.add('curriculo-mode');
            
            // Usa o container padrão como outras seções
            this.mainContent.innerHTML = this.createPageContainer(
                'Comparativo de Currículo',
                `<div class="curriculo-page">${pageContent}</div>`
            );
            
            // Aguarda window.db estar disponível antes de executar scripts
            this.aguardarDBEExecutarScripts(doc);
            
            // Configura os botões após execução dos scripts
            setTimeout(() => {
                if (window.setupCurriculoButtons) {
                    window.setupCurriculoButtons();
                }
            }, 500);
            
        } catch (error) {
            this.mainContent.innerHTML = this.createPageContainer(
                'Erro',
                `<p>Erro ao carregar página de currículo: ${error.message}</p>`
            );
        }
    }

    // Rota: /candidato/desenvolvimento
    async renderDesenvolvimento() {
        try {
            // Carrega o HTML completo da página de entrevistas
            const response = await fetch('/candidato/entrevistas.html');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Carrega os CSS necessários dinamicamente
            await this.loadEntrevistasStyles(doc);
            
            // Extrai o conteúdo principal (sem header)
            const containerDiv = doc.querySelector('.container');
            const containerContent = containerDiv ? containerDiv.outerHTML : doc.body.innerHTML;
            
            // Adiciona classe para modificar estilos do container principal
            this.mainContent.classList.add('entrevistas-mode');
            
            // Usa o container padrão como outras seções
            this.mainContent.innerHTML = this.createPageContainer(
                'Meu Desenvolvimento',
                `<div class="entrevistas-page">${containerContent}</div>`
            );
            
            // Aguarda DOM estar pronto antes de executar scripts
            this.waitForDOMAndExecuteScripts(doc);
            
        } catch (error) {
            this.mainContent.innerHTML = this.createPageContainer(
                'Erro',
                `<p>Erro ao carregar página de desenvolvimento: ${error.message}</p>`
            );
        }
    }

    // Carrega os estilos CSS necessários para o currículo
    async loadCurriculumStyles(doc) {
        // CSS específicos que o currículo precisa
        const requiredCssFiles = [
            '/css/base.css',
            '/css/components/buttons.css', 
            '/css/pages/curriculo.css'
        ];
        
        const loadPromises = [];
        
        for (const cssPath of requiredCssFiles) {
            const id = 'curriculum-' + cssPath.split('/').pop().replace('.css', '');
            
            // Verifica se o CSS já foi carregado
            if (!document.getElementById(id)) {
                const promise = new Promise((resolve, reject) => {
                    const linkElement = document.createElement('link');
                    linkElement.id = id;
                    linkElement.rel = 'stylesheet';
                    linkElement.href = cssPath;
                    linkElement.onload = () => resolve();
                    linkElement.onerror = () => reject();
                    document.head.appendChild(linkElement);
                });
                loadPromises.push(promise);
            }
        }
        
        // Aguarda todos os CSS carregarem
        if (loadPromises.length > 0) {
            try {
                await Promise.all(loadPromises);
                // Pequeno delay para garantir que os estilos sejam aplicados
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                // Erro ao carregar alguns CSS
            }
        }
    }

    // Carrega os estilos CSS necessários para as entrevistas
    async loadEntrevistasStyles(doc) {
        // CSS específicos que as entrevistas precisam
        const requiredCssFiles = [
            '/css/base.css',
            '/css/components/buttons.css',
            '/css/components/forms.css', 
            '/css/pages/entrevistas.css'
        ];
        
        const loadPromises = [];
        
        for (const cssPath of requiredCssFiles) {
            const id = 'entrevistas-' + cssPath.split('/').pop().replace('.css', '');
            
            // Verifica se o CSS já foi carregado
            if (!document.getElementById(id)) {
                const promise = new Promise((resolve, reject) => {
                    const linkElement = document.createElement('link');
                    linkElement.id = id;
                    linkElement.rel = 'stylesheet';
                    linkElement.href = cssPath;
                    linkElement.onload = () => resolve();
                    linkElement.onerror = () => reject();
                    document.head.appendChild(linkElement);
                });
                loadPromises.push(promise);
            }
        }
        
        // Aguarda todos os CSS carregarem
        if (loadPromises.length > 0) {
            try {
                await Promise.all(loadPromises);
                // Pequeno delay para garantir que os estilos sejam aplicados
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                // Erro ao carregar alguns CSS
            }
        }
    }

    // Aguarda window.db estar disponível e executa scripts
    async aguardarDBEExecutarScripts(doc) {
        // Aguarda window.db estar disponível (máximo 3 segundos)
        let tentativas = 0;
        const maxTentativas = 10;
        
        while (!window.db && tentativas < maxTentativas) {
            await new Promise(resolve => setTimeout(resolve, 300));
            tentativas++;
        }
        
        if (window.db) {
            this.executeScripts(doc);
        } else {
            // Executa scripts mesmo assim, mas pode falhar
            this.executeScripts(doc);
        }
    }

    // Aguarda DOM estar pronto e executa scripts
    async waitForDOMAndExecuteScripts(doc) {
        // Aguarda um pouco para o DOM ser totalmente renderizado
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verifica se elementos fundamentais estão presentes antes de prosseguir
        let domReady = false;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!domReady && attempts < maxAttempts) {
            // Verifica se há pelo menos alguns elementos esperados no DOM
            const hasBasicElements = document.querySelector('.entrevistas-page') || 
                                   document.querySelector('.curriculo-page') ||
                                   document.getElementById('mainContentArea');
            
            if (hasBasicElements) {
                domReady = true;
            } else {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        if (domReady) {
            this.executeScripts(doc);
        } else {
            this.executeScripts(doc);
        }
    }

    // Executa scripts de uma página carregada
    executeScripts(doc) {
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                // Script externo
                const newScript = document.createElement('script');
                newScript.src = script.src;
                document.head.appendChild(newScript);
            } else if (script.textContent) {
                // Script inline
                try {
                    // Wrap do script para tornar firebase disponível se necessário
                    let scriptCode = script.textContent;
                    
                    // Se o script menciona firebase, cria uma versão compatível
                    if (scriptCode.includes('firebase.')) {
                        scriptCode = `
                        (function() {
                            // Wrapper para getElementById que não quebra e verifica se existe
                            const originalGetElementById = document.getElementById;
                            document.getElementById = function(id) {
                                try {
                                    const element = originalGetElementById.call(document, id);
                                    if (!element) {
                                        return null;
                                    }
                                    return element;
                                } catch (e) {
                                    return null;
                                }
                            };
                            
                            // Cria firebase stub completo apenas para este contexto
                            const firebase = window.firebase || {
                                initializeApp: function(config) {
                                    return { name: '[DEFAULT]' };
                                },
                                apps: [],
                                firestore: function() {
                                    // Retorna window.db se disponível, senão cria stub completo
                                    if (window.db) {
                                        // Adapta Firebase v9 para compat API
                                        return {
                                            collection: function(name) {
                                                return {
                                                    add: async function(data) {
                                                        const { addDoc, collection } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
                                                        return await addDoc(collection(window.db, name), data);
                                                    },
                                                    doc: function(id) {
                                                        return {
                                                            set: async function(data, options) {
                                                                const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
                                                                return await setDoc(doc(window.db, name, id), data, options || {});
                                                            },
                                                            get: async function() {
                                                                const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
                                                                const docSnap = await getDoc(doc(window.db, name, id));
                                                                return {
                                                                    exists: () => docSnap.exists(),
                                                                    data: () => docSnap.data()
                                                                };
                                                            }
                                                        };
                                                    },
                                                    where: function(field, op, value) {
                                                        // Armazena condições where para encadeamento
                                                        const whereConditions = [{ field, op, value }];
                                                        
                                                        const createQueryBuilder = (conditions) => ({
                                                            where: function(field2, op2, value2) {
                                                                const newConditions = [...conditions, { field: field2, op: op2, value: value2 }];
                                                                return createQueryBuilder(newConditions);
                                                            },
                                                            limit: function(num) {
                                                                return {
                                                                    get: async function() {
                                                                        try {
                                                                            const { collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
                                                                            
                                                                            // Cria query com todas as condições where
                                                                            const whereConstraints = conditions.map(c => where(c.field, c.op, c.value));
                                                                            const q = query(collection(window.db, name), ...whereConstraints, limit(num));
                                                                            const snapshot = await getDocs(q);
                                                                            
                                                                            return {
                                                                                empty: snapshot.empty,
                                                                                docs: snapshot.docs.map(doc => ({
                                                                                    id: doc.id,
                                                                                    data: () => doc.data(),
                                                                                    ref: {
                                                                                        set: async function(data, options) {
                                                                                            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
                                                                                            return await setDoc(doc(window.db, name, doc.id), data, options || {});
                                                                                        }
                                                                                    }
                                                                                }))
                                                                            };
                                                                        } catch (error) {
                                                                            console.warn('Erro na query Firebase:', error);
                                                                            return { empty: true, docs: [] };
                                                                        }
                                                                    }
                                                                };
                                                            },
                                                            get: async function() {
                                                                try {
                                                                    const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
                                                                    
                                                                    const whereConstraints = conditions.map(c => where(c.field, c.op, c.value));
                                                                    const q = query(collection(window.db, name), ...whereConstraints);
                                                                    const snapshot = await getDocs(q);
                                                                    
                                                                    return {
                                                                        empty: snapshot.empty,
                                                                        docs: snapshot.docs.map(doc => ({
                                                                            id: doc.id,
                                                                            data: () => doc.data()
                                                                        }))
                                                                    };
                                                                } catch (error) {
                                                                    console.warn('Erro na query Firebase:', error);
                                                                    return { empty: true, docs: [] };
                                                                }
                                                            }
                                                        });
                                                        
                                                        return createQueryBuilder(whereConditions);
                                                    }
                                                };
                                            }
                                        };
                                    } else {
                                        // Stub básico se window.db não estiver disponível
                                        return {
                                            collection: function() { 
                                                return {
                                                    add: async () => ({ id: 'stub-id' }),
                                                    doc: () => ({
                                                        set: async () => {},
                                                        get: async () => ({ exists: () => false, data: () => null })
                                                    }),
                                                    where: () => ({
                                                        limit: () => ({
                                                            get: async () => ({ empty: true, docs: [] })
                                                        })
                                                    })
                                                };
                                            }
                                        };
                                    }
                                }
                            };
                            
                            // Adiciona propriedades estáticas do firestore
                            firebase.firestore.FieldValue = {
                                serverTimestamp: () => new Date()
                            };
                            firebase.firestore.Timestamp = {
                                fromDate: (date) => date
                            };
                            ${scriptCode}
                        })();
                        `;
                    }
                    
                    const scriptFunction = new Function(scriptCode);
                    scriptFunction.call(window);
                } catch (error) {
                    // Ignora erros conhecidos do Firebase e DOM
                    if (error.message && (
                        error.message.includes('firebase.initializeApp is not a function') ||
                        error.message.includes('firebase is not defined') ||
                        error.message.includes('duplicate-app') ||
                        error.message.includes('Cannot set properties of null') ||
                        error.message.includes('Cannot read properties of null') ||
                        error.message.includes('textContent') ||
                        error.message.includes('innerHTML') ||
                        error.message.includes('db.collection is not a function') ||
                        error.message.includes('addEventListener')
                    )) {
                        return;
                    }
                    console.error('Erro ao executar script:', error);
                    console.error('Stack trace:', error.stack);
                    // Não impede outros scripts de executar
                }
            }
        });
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

// Inicialização com delay para garantir que todos os outros scripts executem primeiro
document.addEventListener('DOMContentLoaded', () => {
    // Delay para garantir que outros scripts sejam processados primeiro
    setTimeout(() => {
        if (!window.candidateRouter) {
            window.candidateRouter = new CandidateRouter();
        }
    }, 200);
});

// Fallback caso o router não seja inicializado automaticamente
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.candidateRouter) {
            window.candidateRouter = new CandidateRouter();
        }
    }, 500);
});