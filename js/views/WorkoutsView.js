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
          <button class="btn-filter ${this.currentFilterStatus === 'partial' ? 'active' : ''}" data-status="partial">Parciais</button>
          <button class="btn-filter ${this.currentFilterStatus === 'missed' ? 'active' : ''}" data-status="missed">Não Realizados</button>
        </div>

        <div class="filter-group">
          <span>Tipo:</span>
          <select id="filter-type-select" class="filter-select">
            <option value="all">Todos os tipos</option>
            ${['Rodagem', 'Longão', 'Intervalado', 'Tiros', 'Tempo Run', 'Regenerativo', 'Fartlek', 'Subida', 'Ritmo de prova', 'Outro']
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
    grid.innerHTML = '';

    const filtered = list.filter(w => {
      const matchStatus = this.currentFilterStatus === 'all' || w.status === this.currentFilterStatus;
      const matchType = this.currentFilterType === 'all' || w.type === this.currentFilterType;
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
      const paceText = w.planned.paceMin && w.planned.paceMax 
        ? `${w.planned.paceMin}–${w.planned.paceMax}/km` 
        : (w.planned.paceMin ? `${w.planned.paceMin}/km` : 'Pace não informado');

      const statusMap = {
        planned: { label: 'PLANEJADO', class: 'status-planned' },
        completed: { label: 'CONCLUÍDO', class: 'status-completed' },
        partial: { label: 'PARCIAL', class: 'status-partial' },
        missed: { label: 'NÃO REALIZADO', class: 'status-missed' }
      };

      const st = statusMap[w.status] || statusMap.planned;

      card.innerHTML = `
        <div class="workout-card-header">
          <div>
            <div class="workout-type">${w.type}</div>
            <div class="workout-date">${formattedDate}</div>
          </div>
          <span class="status-badge ${st.class}">${st.label}</span>
        </div>

        <div class="workout-card-body">
          <div class="workout-meta-row">
            <span>📏 Planejado: <strong>${w.planned.distance} km</strong></span>
            <span>🎯 Pace: <strong>${paceText}</strong></span>
          </div>

          ${w.planned.description ? `<p class="workout-desc">${w.planned.description}</p>` : ''}
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
          <button class="btn btn-sm btn-complete">${w.status === 'completed' ? 'Editar Resultado' : 'Marcar como Concluído'}</button>
          <button class="btn btn-sm btn-secondary btn-edit">Editar</button>
          <button class="btn btn-sm btn-danger btn-delete">Excluir</button>
        </div>
      `;

      card.querySelector('.btn-complete').onclick = () => {
        WorkoutModal.openComplete(w, () => this.render(this.container));
      };

      card.querySelector('.btn-edit').onclick = () => {
        WorkoutModal.openCreateOrEdit(w, () => this.render(this.container));
      };

      card.querySelector('.btn-delete').onclick = () => {
        if (confirm('Tem certeza que deseja excluir este treino?')) {
          StorageService.deleteWorkout(w.id);
          this.render(this.container);
        }
      };

      grid.appendChild(card);
    });
  }
}
