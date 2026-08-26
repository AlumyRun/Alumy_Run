import { StorageService } from '../services/StorageService.js';
import { ModalManager } from '../components/ModalManager.js';
import { Workout } from '../models/Workout.js';

export class DashboardView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const profile = StorageService.getProfile();
    const workouts = StorageService.getWorkouts();

    const completed = workouts.filter(w => w.status === 'completed');
    const totalKm = completed.reduce((acc, curr) => acc + (curr.completed?.distance || 0), 0);
    const completionRate = workouts.length > 0 ? Math.round((completed.length / workouts.length) * 100) : 0;

    // Próximo treino planejado
    const nextWorkout = workouts.find(w => w.status === 'planned');

    // Próxima Prova
    const nextRace = profile.races.length > 0 ? profile.races[0] : null;

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Olá, ${profile.name} 👋</h1>
          <p class="card-subtext">Painel geral de treinamento e métricas de desempenho.</p>
        </div>
        <button class="btn" id="dash-btn-add"><i data-feather="plus"></i> Novo Treino</button>
      </div>

      <!-- CARDS DE MÉTRICAS PRINCIPAIS -->
      <div class="grid-metrics">
        <div class="card">
          <div class="card-title">Km Realizados</div>
          <div class="card-value">${totalKm.toFixed(1)} km</div>
          <div class="card-subtext">Meta Semanal: ${profile.weeklyVolume} km</div>
        </div>
        <div class="card">
          <div class="card-title">Treinos Concluídos</div>
          <div class="card-value">${completed.length}/${workouts.length}</div>
          <div class="card-subtext">Taxa de Conclusão: ${completionRate}%</div>
        </div>
        <div class="card">
          <div class="card-title">Próxima Prova</div>
          <div class="card-value">${nextRace ? nextRace.distance : '--'}</div>
          <div class="card-subtext">Meta: ${nextRace ? nextRace.targetTime : '--'}</div>
        </div>
        <div class="card">
          <div class="card-title">Frequência Semanal</div>
          <div class="card-value">${completed.length} treinos</div>
          <div class="card-subtext">Meta: ${profile.weeklyFrequency} treinos/sem</div>
        </div>
      </div>

      <!-- HERO: PRÓXIMO TREINO -->
      <div class="card-title" style="margin-bottom: 12px;">Próximo Treino Agendado</div>
      ${nextWorkout ? `
        <div class="hero-workout">
          <div class="hero-info">
            <span class="badge badge-planned">🔵 Treino Planejado</span>
            <h3>${nextWorkout.type}</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem;">${nextWorkout.planned.objective}</p>
            <div class="hero-meta">
              <span>📅 Data: <strong>${nextWorkout.date}</strong></span>
              <span>📏 Distância: <strong>${nextWorkout.planned.distance} km</strong></span>
              <span>⏱️ Pace Alvo: <strong>${nextWorkout.planned.targetPaceMin} - ${nextWorkout.planned.targetPaceMax}/km</strong></span>
            </div>
          </div>
          <div>
            <button class="btn" id="btn-hero-complete"><i data-feather="check-circle"></i> Marcar como Concluído</button>
          </div>
        </div>
      ` : `
        <div class="card" style="text-align: center; color: var(--text-muted); padding: 32px;">
          Nenhum treino pendente no plano atual! 🎉
        </div>
      `}
    `;

    document.getElementById('dash-btn-add').onclick = () => {
      ModalManager.openAddWorkoutModal((newW) => {
        StorageService.addWorkout(newW);
        this.app.reloadCurrentView();
      });
    };

    if (nextWorkout) {
      document.getElementById('btn-hero-complete').onclick = () => {
        ModalManager.openCompleteWorkoutModal(nextWorkout, (updatedW) => {
          StorageService.updateWorkout(updatedW);
          this.app.reloadCurrentView();
        });
      };
    }
  }
}