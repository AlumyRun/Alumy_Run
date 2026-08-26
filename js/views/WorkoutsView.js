import { StorageService } from '../services/StorageService.js';
import { ModalManager } from '../components/ModalManager.js';
import { Workout } from '../models/Workout.js';

export class WorkoutsView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const rawWorkouts = StorageService.getWorkouts();
    // ORDENAÇÃO AUTOMÁTICA OBRIGATÓRIA POR DATA
    const workouts = Workout.sortWorkouts(rawWorkouts);

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Treinos Agendados & Histórico</h1>
          <p class="card-subtext">Listagem ordenada por data (Futuros $\rightarrow$ Passados).</p>
        </div>
        <button class="btn" id="workouts-btn-add"><i data-feather="plus"></i> Novo Treino</button>
      </div>

      <div id="workouts-list" style="display: flex; flex-direction: column; gap: 16px;"></div>
    `;

    document.getElementById('workouts-btn-add').onclick = () => {
      ModalManager.openAddWorkoutModal((newW) => {
        StorageService.addWorkout(newW);
        this.app.reloadCurrentView();
      });
    };

    const listEl = document.getElementById('workouts-list');
    
    if (workouts.length === 0) {
      listEl.innerHTML = `<div class="card" style="text-align:center; color: var(--text-muted);">Nenhum treino cadastrado.</div>`;
      return;
    }

    workouts.forEach(w => {
      const isCompleted = w.status === 'completed';
      const badgeClass = isCompleted ? 'badge-completed' : 'badge-planned';
      const evalObj = Workout.getEvaluation(w);

      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-id', w.id);
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <span class="badge ${badgeClass}">${isCompleted ? '🟢 Concluído' : '🔵 Planejado'}</span>
            <h3 style="margin-top: 6px; font-size: 1.1rem; color: var(--text-primary);">${w.type}</h3>
            <p style="font-size: 0.825rem; color: var(--text-secondary);">Data: <strong>${w.date}</strong></p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-edit"><i data-feather="edit-2"></i> ${isCompleted ? 'Editar' : 'Concluir'}</button>
            <button class="btn btn-danger btn-delete"><i data-feather="trash-2"></i></button>
          </div>
        </div>

        <div class="comparison-box">
          <div class="comp-col">
            <h5>Planejado</h5>
            <div class="comp-val">${w.planned.distance} km</div>
            <div style="font-size:0.75rem; color: var(--text-muted);">Pace: ${w.planned.targetPaceMin}-${w.planned.targetPaceMax}/km</div>
          </div>
          <div class="comp-col">
            <h5>Realizado</h5>
            <div class="comp-val" style="color: ${isCompleted ? 'var(--success)' : 'var(--text-muted)'};">
              ${isCompleted ? `${w.completed.distance} km` : '--'}
            </div>
            <div style="font-size:0.75rem; color: var(--text-muted);">Pace: ${isCompleted ? `${w.completed.pace}/km` : '--'}</div>
          </div>
          <div class="comp-col">
            <h5>Resultado</h5>
            <div class="comp-val" style="color: ${evalObj ? evalObj.color : 'var(--text-muted)'};">
              ${evalObj ? evalObj.status : '--'}
            </div>
            <div style="font-size:0.75rem; color: var(--text-muted);">${isCompleted ? `Sensação: ${w.completed.feeling}` : 'Pendente'}</div>
          </div>
        </div>
      `;

      card.querySelector('.btn-edit').onclick = () => {
        ModalManager.openCompleteWorkoutModal(w, (updatedW) => {
          StorageService.updateWorkout(updatedW);
          this.app.reloadCurrentView();
        });
      };

      card.querySelector('.btn-delete').onclick = () => {
        if (confirm(`Deseja realmente excluir o treino de ${w.date}?`)) {
          StorageService.deleteWorkout(w.id);
          this.app.reloadCurrentView();
        }
      };

      listEl.appendChild(card);
    });
  }
}
