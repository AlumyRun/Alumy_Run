import { DashboardView } from './views/DashboardView.js';
import { CalendarView } from './views/CalendarView.js';
import { WorkoutsView } from './views/WorkoutsView.js';
import { EvolutionView } from './views/EvolutionView.js';
import { RecordsView } from './views/RecordsView.js';
import { RacesView } from './views/RacesView.js';
import { ProfileView } from './views/ProfileView.js';
import { StorageService } from './services/StorageService.js';

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
    this.bindSearch();
    this.switchView('dashboard');
  }

  bindEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.target;
        this.switchView(target);
      });
    });

    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleSidebar());
    }
  }

  bindSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.removeAttribute('readonly');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) return;

      const workouts = StorageService.getWorkouts();
      const results = workouts.filter(w => {
        return (
          w.type.toLowerCase().includes(query) ||
          w.date.includes(query) ||
          w.status.toLowerCase().includes(query) ||
          (w.planned.description && w.planned.description.toLowerCase().includes(query)) ||
          (w.planned.objective && w.planned.objective.toLowerCase().includes(query)) ||
          (w.planned.distance && w.planned.distance.toString().includes(query))
        );
      });

      // Ao pesquisar, redireciona para a view de treinos e aplica os resultados visuais
      if (this.currentView !== 'workouts') {
        this.switchView('workouts');
      }

      const gridFuture = document.getElementById('grid-future');
      const gridPast = document.getElementById('grid-past');
      if (gridFuture && gridPast) {
        const sorted = StorageService.getSortedWorkouts(results);
        this.views.workouts.renderWorkoutList('grid-future', sorted.future);
        this.views.workouts.renderWorkoutList('grid-past', sorted.past);
      }
    });
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
  window.app = new App();
  window.app.init();
});