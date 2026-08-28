import { StorageService } from '../services/StorageService.js';
import { WorkoutModal } from '../components/WorkoutModal.js';

export class WorkoutsView {
  constructor() {
    this.currentFilterStatus = 'all';
    this.currentFilterType = 'all';
  }

  render(container) {
    this.container = container;
    const workouts = StorageService.getWorkouts();
    const sorted = StorageService.getSortedWorkouts(workouts);

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Treinos</h1>
          <p class="card-subtext">Planeje, acompanhe e registre seus treinos.</p>
        </div>
        <button class="btn" id="btn-new-workout">+ Novo Treino</button>
      </div>

      <div class="card filter-bar">
        <div class="filter-group">
          <span>Status:</span>
          <button class="btn-filter ${this.currentFilterStatus === 'all' ? 'active' : ''}" data-status="all">Todos</button>
          <button class="btn-filter ${this.currentFilterStatus === 'planned' ? 'active' : ''}" data-status="planned">Planejados</button>
          <button class="btn-filter ${this.currentFilterStatus === 'completed' ? 'active' : ''}" data-status="completed">Concluídos</button>
          <button class="btn-filter ${this.currentFilterStatus === 'rest' ? 'active' : ''}" data-status="rest">Descanso</button>
        </div>

        <div class="filter-group">
          <span>Tipo:</span>
          <select id="filter-type-select" class="filter-select">
            <option value="all">Todos os tipos</option>
            ${['Rodagem leve', 'Regenerativo', 'Intervalado', 'Limiar', 'Ritmo específico', 'Longão leve', 'Descanso', 'Outro']
              .map(t => `<option value="${t}" ${this.currentFilterType === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="workouts-section-title">TREINOS AGENDADOS</div>
      <div class="workouts-grid" id="grid-future"></div>

      <div class="workouts-section-title" style="margin-top: 32px;">HISTÓRICO DE TREINOS</div>
      <div class="workouts-grid" id="grid-past"></div>
    `;

    document.getElementById('btn-new-workout').onclick = () => {
      WorkoutModal.openCreateOrEdit(null, () => this.render(container));
    };

    document.getElementById('filter-type-select').onchange = (e) => {
      this.currentFilterType = e.target.value;
      this.render(container);
    };

    container.querySelectorAll('.btn-filter').forEach(btn => {
      btn.onclick = (e) => {
        this.currentFilterStatus = e.currentTarget.dataset.status;
        this.render(container);
      };
    });

    this.renderWorkoutList('grid-future', sorted.future);
    this.renderWorkoutList('grid-past', sorted.past);
  }

  renderWorkoutList(targetId, list) {
    const grid = document.getElementById(targetId);
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = list.filter(w => {
      const matchStatus = this.currentFilterStatus === 'all' || w.status === this.currentFilterStatus;
      const matchType = this.currentFilterType === 'all' || w.type.includes(this.currentFilterType) || this.currentFilterType === 'all';
      return matchStatus && matchType;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="card empty-state"><p>Nenhum treino nesta seção.</p></div>`;
      return;
    }

    filtered.forEach(w => {
      const card = document.createElement('div');
      card.className = 'card workout-card';

      const formattedDate = new Date(w.date + 'T00:00:00').toLocaleDateString('pt-BR');
      
      const paceText = w.status === 'rest' ? '--' : (w.planned.paceMin && w.planned.paceMax 
        ? `${w.planned.paceMin}–${w.planned.paceMax}/km` 
        : (w.planned.paceMin ? `${w.planned.paceMin}/km` : 'Livre'));

      let statusBadge = '';
      if (w.status === 'completed') statusBadge = '<span class="status-badge status-completed">CONCLUÍDO</span>';
      else if (w.status === 'rest') statusBadge = '<span class="status-badge" style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1;">DESCANSO</span>';
      else if (w.status === 'partial') statusBadge = '<span class="status-badge status-partial">PARCIAL</span>';
      else statusBadge = '<span class="status-badge status-planned">PLANEJADO</span>';

      const formattedDesc = w.planned.description ? w.planned.description.replace(/\n/g, '<br>') : '';
      const keyBadge = w.planned.isKeyWorkout ? `<div style="background: #fef3c7; color: #b45309; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; display: inline-block; margin-bottom: 8px;">⭐ TREINO-CHAVE</div>` : '';

      card.innerHTML = `
        <div class="workout-card-header">
          <div>
            ${keyBadge}
            <div class="workout-type">${w.type}</div>
            <div class="workout-date">${formattedDate}</div>
          </div>
          ${statusBadge}
        </div>

        <div class="workout-card-body">
          <div class="workout-meta-row">
            <span>📏 Planejado: <strong>${w.status === 'rest' ? '--' : w.planned.distance + ' km'}</strong></span>
            <span>🎯 Pace: <strong>${paceText}</strong></span>
          </div>

          ${formattedDesc ? `<p class="workout-desc" style="line-height: 1.5;">${formattedDesc}</p>` : ''}
          ${w.planned.objective ? `<p class="workout-obj"><strong>Objetivo:</strong> ${w.planned.objective}</p>` : ''}

          ${w.completed ? `
            <div class="workout-comparison-box">
              <div class="comp-title">REALIZADO</div>
              <div class="comp-details">
                <span><strong>${w.completed.distance} km</strong></span> | 
                <span>Tempo: <strong>${w.completed.time}</strong></span> | 
                <span>Pace: <strong>${w.completed.pace}/km</strong></span>
              </div>
              ${w.completed.feeling ? `<div class="comp-feeling">Percepção: ${w.completed.feeling}</div>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="workout-card-footer">
          ${w.status !== 'rest' ? `<button class="btn btn-sm btn-complete">${w.status === 'completed' ? 'Editar Resultado' : 'Marcar como Concluído'}</button>` : ''}
          <button class="btn btn-sm btn-secondary btn-edit">Editar</button>
          <button class="btn btn-sm btn-danger btn-delete">Excluir</button>
        </div>
      `;

      if (w.status !== 'rest') {
        card.querySelector('.btn-complete').onclick = () => {
          WorkoutModal.openComplete(w, () => this.render(this.container));
        };
      }

      card.querySelector('.btn-edit').onclick = () => {
        WorkoutModal.openCreateOrEdit(w, () => this.render(this.container));
      };

      card.querySelector('.btn-delete').onclick = () => {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
          StorageService.deleteWorkout(w.id);
          this.render(this.container);
        }
      };

      grid.appendChild(card);
    });
  }
}
