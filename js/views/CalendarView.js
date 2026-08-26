import { StorageService } from '../services/StorageService.js';

export class CalendarView {
  constructor(app) {
    this.app = app;
    this.currentDate = new Date(); // Inicia no mês/ano atual do sistema
  }

  render(container) {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Calendário de Treinos</h1>
          <p class="card-subtext">Visão mensal dinâmica de treinos e provas agendadas.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn btn-secondary" id="cal-btn-today">Hoje</button>
          <div class="calendar-nav-controls">
            <button class="btn btn-secondary" id="cal-btn-prev">←</button>
            <strong style="font-size: 1.1rem; min-width: 160px; text-align: center;">
              ${monthNames[month]} / ${year}
            </strong>
            <button class="btn btn-secondary" id="cal-btn-next">→</button>
          </div>
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

    this.bindControls();
    this.renderGridCells(year, month);
  }

  bindControls() {
    document.getElementById('cal-btn-prev').onclick = () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.app.reloadCurrentView();
    };

    document.getElementById('cal-btn-next').onclick = () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.app.reloadCurrentView();
    };

    document.getElementById('cal-btn-today').onclick = () => {
      this.currentDate = new Date();
      this.app.reloadCurrentView();
    };
  }

  renderGridCells(year, month) {
    const cellsEl = document.getElementById('calendar-cells');
    const workouts = StorageService.getWorkouts();
    const profile = StorageService.getProfile();
    const races = profile.races || [];

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();

    // Células vazias iniciais
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-cell empty';
      cellsEl.appendChild(emptyCell);
    }

    // Células do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayFormatted = day < 10 ? `0${day}` : `${day}`;
      const monthFormatted = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
      const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;

      const cell = document.createElement('div');
      cell.className = 'calendar-cell';

      // Destaque do dia atual
      if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) {
        cell.classList.add('today-cell');
      }

      cell.innerHTML = `<div class="calendar-date-num">${day}</div><div class="calendar-events-container"></div>`;

      const eventsContainer = cell.querySelector('.calendar-events-container');

      // Associa Treinos
      const dayWorkouts = workouts.filter(w => w.date === dateStr);
      dayWorkouts.forEach(w => {
        cell.classList.add('has-workout');
        const isComp = w.status === 'completed';
        const ev = document.createElement('div');
        ev.className = `calendar-event ${isComp ? 'badge-completed' : 'badge-planned'}`;
        ev.innerHTML = `🏃 ${w.type} (${w.planned.distance}k)`;
        eventsContainer.appendChild(ev);
      });

      // Associa Provas
      const dayRaces = races.filter(r => r.date === dateStr);
      dayRaces.forEach(r => {
        cell.classList.add('has-workout');
        const ev = document.createElement('div');
        ev.className = 'calendar-event badge-missed';
        ev.style.background = '#1e3a8a';
        ev.style.color = '#ffffff';
        ev.innerHTML = `🏁 ${r.label}`;
        eventsContainer.appendChild(ev);
      });

      cellsEl.appendChild(cell);
    }
  }
}
      </div>
    `;
  }
}
