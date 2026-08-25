import { StorageService } from '../services/StorageService.js';
import { CalendarGrid } from '../components/CalendarGrid.js';
import { ModalManager } from '../components/ModalManager.js';

export class CalendarView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const workouts = StorageService.getWorkouts();

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Calendário de Treinos</h1>
          <p class="card-subtext">Setembro / 2026 — Planejamento Mensal</p>
        </div>
      </div>
      <div class="card" id="calendar-wrapper">
        ${CalendarGrid.render(workouts, (workout) => {
          ModalManager.openCompleteWorkoutModal(workout, (updatedW) => {
            StorageService.updateWorkout(updatedW);
            this.app.reloadCurrentView();
          });
        })}
      </div>
    `;
  }
}