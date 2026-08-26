import { StorageService } from '../services/StorageService.js';

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
          <p class="card-subtext">Visão mensal dos treinos e eventos programados.</p>
        </div>
      </div>

      <div class="card">
        <div class="calendar-grid">
          <div class="calendar-day-head">DOM</div>
          <div class="calendar-day-head">SEG</div>
          <div class="calendar-day-head">TER</div>
          <div class="calendar-day-head">QUA</div>
          <div class="calendar-day-head">QUI</div>
          <div class="calendar-day-head">SEX</div>
          <div class="calendar-day-head">SÁB</div>
          <div id="calendar-cells" style="display: contents;"></div>
        </div>
      </div>
    `;

    this.renderGridCells(workouts);
  }

  renderGridCells(workouts) {
    const cellsEl = document.getElementById('calendar-cells');
    if (!cellsEl) return;

    // Renderiza um mês padrão limpo
    const daysInMonth = 31;
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';
      cell.innerHTML = `<div class="calendar-date-num">${day}</div><div class="calendar-events-container"></div>`;
      
      const dayFormatted = day < 10 ? `0${day}` : `${day}`;
      const dayWorkouts = workouts.filter(w => w.date.endsWith(`-${dayFormatted}`));
      
      const eventsContainer = cell.querySelector('.calendar-events-container');
      dayWorkouts.forEach(w => {
        cell.classList.add('has-workout');
        const isComp = w.status === 'completed';
        const ev = document.createElement('div');
        ev.className = `calendar-event ${isComp ? 'badge-completed' : 'badge-planned'}`;
        ev.innerHTML = `🏃 ${w.type}`;
        eventsContainer.appendChild(ev);
      });

      cellsEl.appendChild(cell);
    }
  }
}
