import { StorageService } from './services/StorageService.js';
import { DashboardView } from './views/DashboardView.js';
import { CalendarView } from './views/CalendarView.js';
import { WorkoutsView } from './views/WorkoutsView.js';
import { EvolutionView } from './views/EvolutionView.js';
import { RecordsView } from './views/RecordsView.js';
import { RacesView } from './views/RacesView.js';
import { ProfileView } from './views/ProfileView.js';

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.views = {};
    this.isSidebarCollapsed = false;
  }

  init() {
    // 1. Inicializa o LocalStorage com os dados do atleta e treinos
    StorageService.init();

    // 2. Instancia as Views
    this.views = {
      dashboard: new DashboardView(this),
      calendar: new CalendarView(this),
      workouts: new WorkoutsView(this),
      evolution: new EvolutionView(this),
      records: new RecordsView(this),
      races: new RacesView(this),
      profile: new ProfileView(this)
    };

    // 3. Registra eventos de navegação, rotas e estado do Sidebar
    this.bindEvents();
    this.initSidebarState();

    // 4. Carrega a view inicial e atualiza marcas
    this.updateSidebarInfo();
    this.switchView('dashboard');
  }

  bindEvents() {
    // Eventos de clique do Menu Lateral e Navegação Mobile
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetView = e.currentTarget.dataset.target;
        this.switchView(targetView);
      });
    });

    // Evento do Botão de Recolher/Expandir Sidebar
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleSidebar());
    }
  }

  // Persistência exclusiva do estado do Sidebar
  initSidebarState() {
    const savedState = localStorage.getItem('alumy_sidebar_collapsed');
    if (savedState === 'true') {
      this.setSidebarState(true);
    } else {
      this.setSidebarState(false);
    }
  }

  toggleSidebar() {
    this.setSidebarState(!this.isSidebarCollapsed);
  }

  setSidebarState(collapsed) {
    this.isSidebarCollapsed = collapsed;
    localStorage.setItem('alumy_sidebar_collapsed', collapsed ? 'true' : 'false');

    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleBtn = document.getElementById('sidebar-toggle');

    if (collapsed) {
      sidebar?.classList.add('collapsed');
      mainContent?.classList.add('expanded');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', 'Expandir menu');
        toggleBtn.innerHTML = '<i data-feather="chevron-right"></i>';
      }
    } else {
      sidebar?.classList.remove('collapsed');
      mainContent?.classList.remove('expanded');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', 'Recolher menu');
        toggleBtn.innerHTML = '<i data-feather="chevron-left"></i>';
      }
    }

    if (window.feather) feather.replace();
    
    // Dispara evento para redimensionar gráficos automaticamente caso a view ativa seja 'evolution'
    if (this.currentView === 'evolution') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 260);
    }
  }

  switchView(viewName) {
    if (!this.views[viewName]) return;

    this.currentView = viewName;

    // Oculta todas as seções e remove classe active
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Ativa a view solicitada
    const targetElement = document.getElementById(`view-${viewName}`);
    if (targetElement) {
      targetElement.style.display = 'block';
      this.views[viewName].render(targetElement);
    }

    // Marca o menu ativo
    document.querySelectorAll(`.nav-item[data-target="${viewName}"]`).forEach(el => el.classList.add('active'));

    // Recarrega ícones feather
    if (window.feather) feather.replace();
  }

  reloadCurrentView() {
    this.updateSidebarInfo();
    this.switchView(this.currentView);
  }

  updateSidebarInfo() {
    const profile = StorageService.getProfile();
    const el = document.getElementById('sidebar-athlete-name');
    if (el && profile) el.innerText = profile.name;
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
