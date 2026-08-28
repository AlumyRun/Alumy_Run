import { DashboardView } from './views/DashboardView.js';
import { WorkoutsView } from './views/WorkoutsView.js';
import { CalendarView } from './views/CalendarView.js';
import { RacesView } from './views/RacesView.js';
import { RecordsView } from './views/RecordsView.js';
import { EvolutionView } from './views/EvolutionView.js';
import { ProfileView } from './views/ProfileView.js';

class App {
  constructor() {
    this.routes = {
      dashboard: new DashboardView(),
      workouts: new WorkoutsView(),
      calendar: new CalendarView(),
      races: new RacesView(),
      records: new RecordsView(),
      evolution: new EvolutionView(),
      profile: new ProfileView()
    };
    
    this.mainContainer = document.getElementById('app-content') || document.querySelector('main');
    this.currentView = null;
  }

  init() {
    this.setupNavigation();
    this.setupMobileMenu();
    
    // Captura a rota inicial da URL ou padrão para 'dashboard'
    const initialView = window.location.hash.replace('#', '') || 'dashboard';
    this.switchView(initialView);
  }

  setupNavigation() {
    // Event listener para links da barra lateral (desktop) e botoes com data-target / data-view
    document.addEventListener('click', (e) => {
      const targetEl = e.target.closest('[data-target], [data-view], .nav-item, a[href^="#"]');
      if (targetEl) {
        let viewName = targetEl.dataset.target || targetEl.dataset.view;
        
        if (!viewName && targetEl.getAttribute('href')) {
          viewName = targetEl.getAttribute('href').replace('#', '');
        }

        if (viewName && this.routes[viewName]) {
          e.preventDefault();
          this.switchView(viewName);
        }
      }
    });

    // Detecta mudança de Hash na URL
    window.addEventListener('hashchange', () => {
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (this.currentView !== viewName) {
        this.switchView(viewName);
      }
    });
  }

  setupMobileMenu() {
    // Suporte ao botão hambúrguer / recolher sidebar se existente
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }
  }

  async switchView(viewName) {
    const targetView = this.routes[viewName] ? viewName : 'dashboard';
    const view = this.routes[targetView];
    this.currentView = targetView;

    // Atualiza estado ativo nos elementos de navegação (Sidebar e Mobile)
    document.querySelectorAll('.nav-item, [data-target], [data-view]').forEach(el => {
      const elTarget = el.dataset.target || el.dataset.view || el.getAttribute('href')?.replace('#', '');
      if (elTarget === targetView) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Atualiza URL sem recarregar a página
    if (window.location.hash !== `#${targetView}`) {
      history.pushState(null, '', `#${targetView}`);
    }

    // Renderiza a view de forma assíncrona aguardando o banco de dados
    if (this.mainContainer) {
      this.mainContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 200px; color: var(--text-secondary); font-weight: 500;">
          <span>Carregando dados...</span>
        </div>
      `;

      try {
        await view.render(this.mainContainer);
      } catch (error) {
        console.error(`Erro ao renderizar a view "${targetView}":`, error);
        this.mainContainer.innerHTML = `
          <div class="card empty-state" style="padding: 32px; text-align: center;">
            <h3 style="color: #ef4444; margin-bottom: 8px;">Erro de Carregamento</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Não foi possível carregar os dados deste módulo. Tente recarregar a página.</p>
          </div>
        `;
      }
    }
  }
}

// Inicialização segura quando o DOM estiver totalmente carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
  });
} else {
  window.app = new App();
  window.app.init();
}
