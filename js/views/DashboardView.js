import { StorageService } from '../services/StorageService.js';

export class DashboardView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const workouts = StorageService.getWorkouts();
    const profile = StorageService.getProfile();

    const completed = workouts.filter(w => w.status === 'completed');
    const planned = workouts.filter(w => w.status === 'planned');

    const totalKm = completed.reduce((acc, w) => acc + (parseFloat(w.completed.distance) || 0), 0);
    const nextWorkout = planned.length > 0 ? planned[0] : null;

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Olá, ${profile.name || 'Rafael'} 👋</h1>
          <p class="card-subtext">Vamos para mais um treino? Confira seu resumo de performance.</p>
        </div>
      </div>

      <!-- CARDS DE METRICAS -->
      <div class="grid-metrics">
        <div class="card">
          <div class="card-title">Volume Total</div>
          <div class="card-value">${totalKm.toFixed(1)} km</div>
          <div class="card-subtext">Distância percorrida acumulada</div>
        </div>
        <div class="card">
          <div class="card-title">Treinos Concluídos</div>
          <div class="card-value">${completed.length} / ${workouts.length}</div>
          <div class="card-subtext">Meta da semana em andamento</div>
        </div>
        <div class="card">
          <div class="card-title">Pace Médio Recente</div>
          <div class="card-value">${completed.length > 0 ? completed[0].completed.pace : '4:40'}/km</div>
          <div class="card-subtext">Última sessão de treino</div>
        </div>
        <div class="card">
          <div class="card-title">Próxima Prova</div>
          <div class="card-value">26 SET</div>
          <div class="card-subtext">Sub-30 (7 km)</div>
        </div>
      </div>

      <!-- CARD HERO DE PROXIMO TREINO -->
      ${nextWorkout ? `
        <div class="hero-workout">
          <div class="hero-info">
            <span class="badge badge-planned">🔵 Próximo Treino Agendado</span>
            <h3>${nextWorkout.type} — ${nextWorkout.planned.distance} km</h3>
            <p style="color: #94a3b8; font-size: 0.9rem;">Data: ${nextWorkout.date}</p>
            <div class="hero-meta">
              <span>🎯 Pace Alvo: ${nextWorkout.planned.targetPaceMin} - ${nextWorkout.planned.targetPaceMax}/km</span>
              <span>🏃 Modalidade: Corrida de Rua</span>
            </div>
          </div>
          <div>
            <button class="btn" id="btn-hero-complete">Marcar como Concluído</button>
          </div>
        </div>
      ` : `
        <div class="card" style="margin-bottom: 24px; text-align: center; color: var(--text-muted);">
          Nenhum treino futuro agendado no momento.
        </div>
      `}
    `;

    const btnHero = document.getElementById('btn-hero-complete');
    if (btnHero && nextWorkout) {
      btnHero.onclick = () => {
        this.app.switchView('workouts');
      };
    }
  }
}
