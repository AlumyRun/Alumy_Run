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
    StorageService.init();

    this.views = {
      dashboard: new DashboardView(this),
      calendar: new CalendarView(this),
      workouts: new WorkoutsView(this),
      evolution: new EvolutionView(this),
      records: new RecordsView(this),
      races: new RacesView(this),
      profile: new ProfileView(this)
    };

    this.bindEvents();
    this.initSidebarState();

    this.updateSidebarInfo();
    this.switchView('dashboard');
  }

  bindEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetView = e.currentTarget.dataset.target;
        this.switchView(targetView);
      });
    });

    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSidebar();
      });
    }
  }

  initSidebarState() {
    const savedState = localStorage.getItem('sidebarCollapsed');
    this.setSidebarState(savedState === 'true');
  }

  toggleSidebar() {
    this.setSidebarState(!this.isSidebarCollapsed);
  }

  setSidebarState(collapsed) {
    this.isSidebarCollapsed = collapsed;
    localStorage.setItem('sidebarCollapsed', collapsed ? 'true' : 'false');

    const toggleBtn = document.getElementById('sidebar-toggle');

    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Expandir menu');
    } else {
      document.body.classList.remove('sidebar-collapsed');
      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Recolher menu');
    }

    this.updateToggleIcon();

    if (this.currentView === 'evolution') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 260);
    }
  }

  updateToggleIcon() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (!toggleBtn) return;

    toggleBtn.innerHTML = this.isSidebarCollapsed ? '<i data-feather="chevron-right"></i>' : '<i data-feather="chevron-left"></i>';
    if (window.feather) feather.replace();
  }

  switchView(viewName) {
    if (!this.views[viewName]) return;

    this.currentView = viewName;

    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const targetElement = document.getElementById(`view-${viewName}`);
    if (targetElement) {
      targetElement.style.display = 'block';
      this.views[viewName].render(targetElement);
    }

    document.querySelectorAll(`.nav-item[data-target="${viewName}"]`).forEach(el => el.classList.add('active'));

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

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
