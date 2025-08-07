// onboarding.js - Sistema de Onboarding para Candidatos
// O tour é mostrado apenas uma vez por usuário e é cacheado no localStorage
// Chave: lumii_tour_completed_{email_do_usuario}
class CandidateOnboarding {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.hasShownModal = false;
        this.steps = [
            {
                target: '#meuPerfilBtn',
                title: 'Meu Perfil',
                content: 'Aqui você pode criar e editar seu currículo, além de personalizar sua biografia profissional.',
                position: 'bottom'
            },
            {
                target: '#minhasVagasBtn',
                title: 'Minhas Vagas',
                content: 'Explore todas as vagas disponíveis e candidate-se às que mais combinam com seu perfil.',
                position: 'bottom'
            },
            {
                target: '#meusEstudosBtn',
                title: 'Meus Estudos',
                content: 'Acesse materiais de estudo e recursos para aprimorar suas habilidades.',
                position: 'bottom'
            },
            {
                target: '#meuDesenvolvimentoBtn',
                title: 'Meu Desenvolvimento',
                content: 'Acompanhe seu progresso e participe de processos de entrevista.',
                position: 'bottom'
            },
            {
                target: '#curriculoBtn',
                title: 'Currículo',
                content: 'Visualize e baixe seu currículo em diferentes formatos.',
                position: 'bottom'
            },
            {
                target: '#mainContentArea',
                title: 'Área Principal',
                content: 'Esta é sua área principal onde você verá informações do seu perfil e conteúdos das seções.',
                position: 'top'
            }
        ];
        this.init();
    }

    init() {
        this.createStyles();
        this.createElements();
        this.bindEvents();
        this.checkFirstVisit();
    }

    createStyles() {
        const styles = `
            .onboarding-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9998;
                display: none;
            }
            
            .onboarding-spotlight {
                position: absolute;
                background: transparent;
                border: 3px solid #39ff14;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(57, 255, 20, 0.5);
                pointer-events: none;
                transition: all 0.3s ease;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 20px rgba(57, 255, 20, 0.5); }
                50% { box-shadow: 0 0 30px rgba(57, 255, 20, 0.8); }
            }
            
            .onboarding-tooltip {
                position: absolute;
                max-width: 300px;
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                border: 1px solid rgba(57, 255, 20, 0.3);
                border-radius: 12px;
                padding: 20px;
                color: #fff;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                z-index: 9999;
            }
            
            .onboarding-tooltip::before {
                content: '';
                position: absolute;
                width: 0; height: 0;
                border: 10px solid transparent;
            }
            
            .onboarding-tooltip.bottom::before {
                top: -20px; left: 20px;
                border-bottom-color: rgba(57, 255, 20, 0.3);
            }
            
            .onboarding-tooltip.top::before {
                bottom: -20px; left: 20px;
                border-top-color: rgba(57, 255, 20, 0.3);
            }
            
            .onboarding-tooltip h3 {
                margin: 0 0 10px 0;
                color: #39ff14;
                font-size: 1.1rem;
            }
            
            .onboarding-tooltip p {
                margin: 0 0 15px 0;
                line-height: 1.5;
                color: #ccc;
            }
            
            .onboarding-controls {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .onboarding-step-info {
                color: #888;
                font-size: 0.9rem;
                text-align: center;
                order: 2;
            }
            
            .onboarding-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
                order: 1;
            }
            
            .onboarding-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .onboarding-btn.primary {
                background: #39ff14;
                color: #000;
            }
            
            .onboarding-btn.primary:hover {
                background: #32e012;
                transform: translateY(-1px);
            }
            
            .onboarding-btn.secondary {
                background: transparent;
                color: #39ff14;
                border: 1px solid #39ff14;
            }
            
            .onboarding-btn.secondary:hover {
                background: rgba(57, 255, 20, 0.1);
            }
            
            .welcome-modal {
                position: fixed;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                max-width: 500px;
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                border: 1px solid rgba(57, 255, 20, 0.3);
                border-radius: 16px;
                padding: 30px;
                z-index: 10000;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            }
            
            .welcome-modal h2 {
                color: #39ff14;
                margin-bottom: 15px;
                font-size: 1.8rem;
            }
            
            .welcome-modal p {
                color: #ccc;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            
            .highlight-element {
                position: relative;
                animation: highlightPulse 3s ease-in-out;
            }
            
            @keyframes highlightPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createElements() {
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'onboarding-overlay';
        document.body.appendChild(this.overlay);
        
        // Spotlight
        this.spotlight = document.createElement('div');
        this.spotlight.className = 'onboarding-spotlight';
        document.body.appendChild(this.spotlight);
        
        // Tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'onboarding-tooltip';
        document.body.appendChild(this.tooltip);
        
        // Welcome Modal
        this.welcomeModal = document.createElement('div');
        this.welcomeModal.className = 'welcome-modal';
        this.welcomeModal.innerHTML = `
            <h2>Bem-vindo à Lumii!</h2>
            <p>Olá! Seja bem-vindo à sua área de candidato. Vamos fazer um tour rápido para você conhecer todas as funcionalidades disponíveis?</p>
            <div class="onboarding-buttons">
                <button class="onboarding-btn secondary" id="skipTour">Pular Tour</button>
                <button class="onboarding-btn primary" id="startTour">Começar Tour</button>
            </div>
        `;
        document.body.appendChild(this.welcomeModal);
    }

    bindEvents() {
        document.getElementById('startTour').addEventListener('click', () => {
            this.startTour();
        });
        
        document.getElementById('skipTour').addEventListener('click', () => {
            this.skipTour();
        });
        
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.endTour();
            }
        });
        
        // Clique em qualquer lugar do overlay encerra o tour
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.endTour();
            }
        });
    }

    checkFirstVisit() {
        // Cria uma chave específica por usuário (se disponível)
        const userEmail = localStorage.getItem('candidateEmail') || 'guest';
        const visitKey = `lumii_tour_completed_${userEmail}`;
        const hasVisited = localStorage.getItem(visitKey);
        
        console.log('🎯 Onboarding Debug:', {
            userEmail,
            visitKey,
            hasVisited,
            localStorage: Object.keys(localStorage).filter(key => key.includes('lumii'))
        });
        
        // Só mostra o tour se nunca foi visitado
        if (!hasVisited || hasVisited === 'null' || hasVisited === '') {
            console.log('📝 Mostrando tour pela primeira vez para:', userEmail);
            this.showWelcomeModal();
        } else {
            console.log('✅ Tour já foi completado para:', userEmail);
            // Verifica se é um JSON válido
            try {
                const data = JSON.parse(hasVisited);
                console.log('📄 Dados do tour:', data);
            } catch (e) {
                console.log('⚠️ Dados do tour inválidos, limpando cache');
                localStorage.removeItem(visitKey);
                this.showWelcomeModal();
            }
        }
    }

    showWelcomeModal() {
        // Previne múltiplas chamadas
        if (this.hasShownModal) {
            console.log('⚠️ Modal já foi mostrado, ignorando chamada duplicada');
            return;
        }
        
        this.hasShownModal = true;
        this.overlay.style.display = 'block';
        this.welcomeModal.style.display = 'block';
        console.log('📋 Modal de boas-vindas exibido');
    }

    startTour() {
        this.welcomeModal.style.display = 'none';
        this.isActive = true;
        this.currentStep = 0;
        this.showStep(this.currentStep);
        
        // Marca o tour como concluído para este usuário
        const userEmail = localStorage.getItem('candidateEmail') || 'guest';
        const visitKey = `lumii_tour_completed_${userEmail}`;
        const tourData = {
            completed: true,
            completedAt: new Date().toISOString(),
            userEmail: userEmail
        };
        localStorage.setItem(visitKey, JSON.stringify(tourData));
        console.log('💾 Tour iniciado e salvo:', { visitKey, tourData });
    }

    skipTour() {
        this.cleanup();
        
        // Marca o tour como pulado para este usuário
        const userEmail = localStorage.getItem('candidateEmail') || 'guest';
        const visitKey = `lumii_tour_completed_${userEmail}`;
        const tourData = {
            completed: false,
            skippedAt: new Date().toISOString(),
            userEmail: userEmail
        };
        localStorage.setItem(visitKey, JSON.stringify(tourData));
        console.log('⏭️ Tour pulado e salvo:', { visitKey, tourData });
    }

    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.endTour();
            return;
        }

        const step = this.steps[stepIndex];
        const targetElement = document.querySelector(step.target);
        
        if (!targetElement) {
            this.nextStep();
            return;
        }

        this.positionSpotlight(targetElement);
        this.positionTooltip(targetElement, step);
        this.highlightElement(targetElement);
    }

    positionSpotlight(element) {
        const rect = element.getBoundingClientRect();
        this.spotlight.style.display = 'block';
        this.spotlight.style.left = (rect.left - 10) + 'px';
        this.spotlight.style.top = (rect.top - 10) + 'px';
        this.spotlight.style.width = (rect.width + 20) + 'px';
        this.spotlight.style.height = (rect.height + 20) + 'px';
    }

    positionTooltip(element, step) {
        const rect = element.getBoundingClientRect();
        const tooltip = this.tooltip;
        
        tooltip.className = `onboarding-tooltip ${step.position}`;
        tooltip.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.content}</p>
            <div class="onboarding-controls">
                <div class="onboarding-buttons">
                    ${this.currentStep > 0 ? '<button class="onboarding-btn secondary" onclick="candidateOnboarding.previousStep()">Anterior</button>' : ''}
                    <button class="onboarding-btn secondary" onclick="candidateOnboarding.endTour()">Pular</button>
                    <button class="onboarding-btn primary" onclick="candidateOnboarding.nextStep()">${this.currentStep === this.steps.length - 1 ? 'Finalizar' : 'Próximo'}</button>
                </div>
                <span class="onboarding-step-info">${this.currentStep + 1} de ${this.steps.length}</span>
            </div>
        `;
        
        tooltip.style.display = 'block';
        
        if (step.position === 'bottom') {
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 15) + 'px';
        } else {
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 15) + 'px';
        }
    }

    highlightElement(element) {
        element.classList.add('highlight-element');
        setTimeout(() => {
            element.classList.remove('highlight-element');
        }, 3000);
    }

    nextStep() {
        this.currentStep++;
        this.showStep(this.currentStep);
    }

    previousStep() {
        this.currentStep--;
        this.showStep(this.currentStep);
    }

    endTour() {
        this.isActive = false;
        this.currentStep = 0;
        
        // Oculta todos os elementos do onboarding
        if (this.overlay) this.overlay.style.display = 'none';
        if (this.spotlight) this.spotlight.style.display = 'none';
        if (this.tooltip) this.tooltip.style.display = 'none';
        if (this.welcomeModal) this.welcomeModal.style.display = 'none';
        
        // Remove qualquer classe de highlight
        document.querySelectorAll('.highlight-element').forEach(el => {
            el.classList.remove('highlight-element');
        });
        
        // Mostra mensagem de sucesso apenas se o tour foi completado
        if (this.currentStep > 0) {
            this.showCompletionMessage();
        }
    }

    showCompletionMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #39ff14, #32e012);
            color: #000;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(57, 255, 20, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        message.textContent = 'Tour concluído! Bem-vindo à Lumii!';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 4000);
    }

    // Método público para reiniciar o tour
    restartTour() {
        this.cleanup();
        
        // Remove o cache específico do usuário atual
        const userEmail = localStorage.getItem('candidateEmail') || 'guest';
        const visitKey = `lumii_tour_completed_${userEmail}`;
        localStorage.removeItem(visitKey);
        
        // Remove também a chave antiga para compatibilidade
        localStorage.removeItem('lumii_candidate_visited');
        
        this.showWelcomeModal();
    }
    
    // Método para limpeza completa
    cleanup() {
        this.isActive = false;
        this.currentStep = 0;
        
        if (this.overlay) this.overlay.style.display = 'none';
        if (this.spotlight) this.spotlight.style.display = 'none';
        if (this.tooltip) this.tooltip.style.display = 'none';
        if (this.welcomeModal) this.welcomeModal.style.display = 'none';
        
        document.querySelectorAll('.highlight-element').forEach(el => {
            el.classList.remove('highlight-element');
        });
    }
    
    // Método para verificar se o usuário já completou o tour
    hasCompletedTour() {
        const userEmail = localStorage.getItem('candidateEmail') || 'guest';
        const visitKey = `lumii_tour_completed_${userEmail}`;
        const tourData = localStorage.getItem(visitKey);
        
        if (!tourData) return false;
        
        try {
            const data = JSON.parse(tourData);
            return data.completed === true || data.skippedAt;
        } catch (e) {
            return false;
        }
    }
}

// Adiciona animação CSS
const additionalStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

const additionalStyleSheet = document.createElement('style');
additionalStyleSheet.textContent = additionalStyles;
document.head.appendChild(additionalStyleSheet);

// Instância global (será definida como window.candidateOnboarding)

// Função de debug global para limpar cache do tour
window.clearTourCache = function() {
    const userEmail = localStorage.getItem('candidateEmail') || 'guest';
    const visitKey = `lumii_tour_completed_${userEmail}`;
    localStorage.removeItem(visitKey);
    localStorage.removeItem('lumii_candidate_visited'); // compatibilidade
    console.log('🗑️ Cache do tour limpo para:', userEmail);
    console.log('Recarregue a página para ver o tour novamente.');
};

// Função de debug global para verificar status do tour
window.checkTourStatus = function() {
    const userEmail = localStorage.getItem('candidateEmail') || 'guest';
    const visitKey = `lumii_tour_completed_${userEmail}`;
    const tourData = localStorage.getItem(visitKey);
    console.log('📊 Status do tour:', {
        userEmail,
        visitKey,
        tourData: tourData ? JSON.parse(tourData) : null,
        hasCompleted: window.candidateOnboarding ? window.candidateOnboarding.hasCompletedTour() : 'Onboarding não inicializado'
    });
};