import { StorageService } from '../services/StorageService.js';
import { CalendarModal } from '../components/CalendarModal.js';

export class CalendarView {
  constructor() {
    this.currentDate = new Date();
  }

  render(container) {
    this.container = container;
    
    // Busca os treinos e as provas no LocalStorage
    const workouts = StorageService.getWorkouts();
    const races = StorageService.getRaces();

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Calendário de Treinos</h1>
          <p class="card-subtext">Visualize seu planejamento e histórico de treinamento.</p>
        </div>
        <div class="calendar-controls">
          <button class="btn btn-secondary" id="cal-prev">←</button>
          <button class="btn btn-secondary" id="cal-today">Hoje</button>
          <button class="btn btn-secondary" id="cal-next">→</button>
          <strong class="calendar-month-title">${monthNames[month]} ${year}</strong>
        </div>
      </div>

      <div class="card calendar-card">
        <div class="calendar-header-grid">
          <div class="cal-head">DOM</div>
          <div class="cal-head">SEG</div>
          <div class="cal-head">TER</div>
          <div class="cal-head">QUA</div>
          <div class="cal-head">QUI</div>
          <div class="cal-head">SEX</div>
          <div class="cal-head">SÁB</div>
        </div>
        <div class="calendar-body-grid" id="calendar-days-container"></div>
      </div>
    `;

    document.getElementById('cal-prev').onclick = () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render(container);
    };

    document.getElementById('cal-next').onclick = () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render(container);
    };

    document.getElementById('cal-today').onclick = () => {
      this.currentDate = new Date();
      this.render(container);
    };

    // Passamos também as provas (races) para a montagem do grid
    this.renderCalendarGrid(year, month, workouts, races);
  }

  renderCalendarGrid(year, month, workouts, races) {
    const grid = document.getElementById('calendar-days-container');
    grid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;

    // Células vazias do início do mês
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell cal-day-empty';
      grid.appendChild(emptyCell);
    }

    // Células com os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';

      // Destaque para o dia de hoje
      if (isCurrentMonthView && today.getDate() === day) {
        cell.classList.add('cal-day-today');
      }

      const dayNumStr = day < 10 ? `0${day}` : `${day}`;
      const monthNumStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
      const dateIso = `${year}-${monthNumStr}-${dayNumStr}`;

      cell.innerHTML = `
        <div class="cal-day-number">${day}</div>
        <div class="cal-events-list"></div>
      `;

      const eventsListEl = cell.querySelector('.cal-events-list');

      // 1. RENDERIZAR PROVAS (Aparecem primeiro, no topo do dia)
      const dayRaces = races.filter(r => r.date === dateIso);
      dayRaces.forEach(r => {
        const eventTag = document.createElement('div');
        eventTag.className = 'cal-event-tag';
        
        // Estilo de destaque dourado/âmbar para a Prova
        eventTag.style.background = '#fef3c7';
        eventTag.style.color = '#b45309';
        eventTag.style.borderLeft = '3px solid #f59e0b';

        eventTag.innerHTML = `
          <strong>🏁 ${r.name}</strong>
          <span>${r.distance} km</span>
        `;
        
        eventsListEl.appendChild(eventTag);
      });

      // 2. RENDERIZAR TREINOS
      const dayWorkouts = workouts.filter(w => w.date === dateIso);
      dayWorkouts.forEach(w => {
        const eventTag = document.createElement('div');

        const statusClassMap = {
          planned: 'event-status-planned',
          completed: 'event-status-completed',
          partial: 'event-status-partial',
          missed: 'event-status-missed'
        };

        eventTag.className = `cal-event-tag ${statusClassMap[w.status] || 'event-status-planned'}`;
        eventTag.innerHTML = `
          <strong>${w.type}</strong>
          <span>${w.planned.distance} km</span>
        `;

        eventTag.onclick = (e) => {
          e.stopPropagation();
          CalendarModal.openDetails(w);
        };

        eventsListEl.appendChild(eventTag);
      });

      grid.appendChild(cell);
    }
  }
}
