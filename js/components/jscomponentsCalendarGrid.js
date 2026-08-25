export class CalendarGrid {
  static render(workouts, onCellClick) {
    const gridHeaderHtml = `
      <div class="calendar-grid">
        <div class="calendar-day-head">DOM</div>
        <div class="calendar-day-head">SEG</div>
        <div class="calendar-day-head">TER</div>
        <div class="calendar-day-head">QUA</div>
        <div class="calendar-day-head">QUI</div>
        <div class="calendar-day-head">SEX</div>
        <div class="calendar-day-head">SÁB</div>
      </div>
    `;

    let cellsHtml = '<div class="calendar-grid" style="margin-top: 8px;">';

    // Gera o grid de 30 dias para Setembro/2026
    for (let day = 1; day <= 30; day++) {
      const dayFormatted = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `2026-09-${dayFormatted}`;
      const workout = workouts.find(w => w.date === dateStr);

      let eventContent = '';
      let cellClass = 'calendar-cell';

      if (workout) {
        cellClass += ' has-workout';
        let badgeStyle = 'background: rgba(59, 130, 246, 0.15); color: var(--accent-blue);';
        let statusIcon = '🔵';

        if (workout.status === 'completed') {
          badgeStyle = 'background: rgba(16, 185, 129, 0.15); color: var(--accent-green);';
          statusIcon = '🟢';
        }

        eventContent = `
          <div class="calendar-event" style="${badgeStyle}">
            <strong>${statusIcon} ${workout.type}</strong><br>
            <small>${workout.completed ? workout.completed.distance : workout.planned.distance} km</small>
          </div>
        `;
      }

      cellsHtml += `
        <div class="${cellClass}" data-date="${dateStr}">
          <div class="calendar-date-num">${day} Set</div>
          ${eventContent}
        </div>
      `;
    }

    cellsHtml += '</div>';

    setTimeout(() => {
      document.querySelectorAll('.calendar-cell.has-workout').forEach(cell => {
        cell.onclick = () => {
          const d = cell.dataset.date;
          const w = workouts.find(item => item.date === d);
          if (w) onCellClick(w);
        };
      });
    }, 50);

    return gridHeaderHtml + cellsHtml;
  }
}
