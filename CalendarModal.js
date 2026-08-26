export class CalendarModal {
  static openDetails(workout) {
    this.close();

    const formattedDate = new Date(workout.date + 'T00:00:00').toLocaleDateString('pt-BR');
    const isCompleted = workout.status === 'completed';

    const statusMap = {
      planned: { label: 'PLANEJADO', class: 'status-planned' },
      completed: { label: 'CONCLUÍDO', class: 'status-completed' },
      partial: { label: 'PARCIAL', class: 'status-partial' },
      missed: { label: 'NÃO REALIZADO', class: 'status-missed' }
    };

    const st = statusMap[workout.status] || statusMap.planned;

    const modalHtml = `
      <div class="modal-backdrop" id="calendar-modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>🏃 ${workout.type}</h3>
            <button class="modal-close-btn" id="cal-modal-close">✕</button>
          </div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">📅 ${formattedDate}</span>
            <span class="status-badge ${st.class}">${st.label}</span>
          </div>

          <div style="background:var(--background); padding:14px; border-radius:var(--radius-sm); margin-bottom:14px;">
            <div style="font-size:0.75rem; font-weight:800; color:var(--text-secondary); margin-bottom:6px;">PLANEJADO</div>
            <div style="font-size:0.85rem; color:var(--text-primary); margin-bottom:4px;">Distância: <strong>${workout.planned.distance} km</strong></div>
            <div style="font-size:0.85rem; color:var(--text-primary); margin-bottom:4px;">Pace Alvo: <strong>${workout.planned.paceMin ? `${workout.planned.paceMin}–${workout.planned.paceMax || workout.planned.paceMin}/km` : 'Não informado'}</strong></div>
            ${workout.planned.description ? `<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:6px;">${workout.planned.description}</p>` : ''}
            ${workout.planned.objective ? `<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;"><strong>Objetivo:</strong> ${workout.planned.objective}</p>` : ''}
          </div>

          ${isCompleted && workout.completed ? `
            <div style="background:var(--background); padding:14px; border-radius:var(--radius-sm); border-left:3px solid var(--primary);">
              <div style="font-size:0.75rem; font-weight:800; color:var(--primary-dark); margin-bottom:6px;">REALIZADO</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.85rem;">
                <div>Distância: <strong>${workout.completed.distance} km</strong></div>
                <div>Tempo: <strong>${workout.completed.time}</strong></div>
                <div>Pace Real: <strong>${workout.completed.pace}/km</strong></div>
                <div>Sensação: <strong>${workout.completed.feeling || '--'}</strong></div>
                ${workout.completed.avgHR ? `<div>FC Média: <strong>${workout.completed.avgHR} bpm</strong></div>` : ''}
                ${workout.completed.maxHR ? `<div>FC Máxima: <strong>${workout.completed.maxHR} bpm</strong></div>` : ''}
              </div>
              ${workout.completed.notes ? `<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:8px;"><strong>Obs:</strong> ${workout.completed.notes}</p>` : ''}
            </div>
          ` : ''}

          <div class="modal-footer" style="margin-top:20px;">
            <button class="btn" id="cal-modal-ok">Fechar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('cal-modal-close').onclick = () => this.close();
    document.getElementById('cal-modal-ok').onclick = () => this.close();
  }

  static close() {
    const backdrop = document.getElementById('calendar-modal-backdrop');
    if (backdrop) backdrop.remove();
  }
}
