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
    this.views = {
      dashboard: new DashboardView(),
      calendar: new CalendarView(),
      workouts: new WorkoutsView(),
      evolution: new EvolutionView(),
      records: new RecordsView(),
      races: new RacesView(),
      profile: new ProfileView()
    };
    this.isCollapsed = false;
  }

  init() {
    this.bindEvents();
    this.switchView('dashboard');
  }

  bindEvents() {
    // Navegação entre abas
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.target;
        this.switchView(target);
      });
    });

    // Botão de recolher/expandir sidebar
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleSidebar());
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    const icon = document.querySelector('.toggle-icon');

    if (this.isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
      if (icon) icon.innerText = '▶';
    } else {
      document.body.classList.remove('sidebar-collapsed');
      if (icon) icon.innerText = '◀';
    }
  }

  switchView(viewName) {
    if (!this.views[viewName]) return;

    this.currentView = viewName;

    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.style.display = 'block';
      this.views[viewName].render(target);
    }

    const activeNav = document.querySelector(`.nav-item[data-target="${viewName}"]`);
    if (activeNav) activeNav.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});