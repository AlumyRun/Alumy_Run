import { StorageService } from '../services/StorageService.js';

export class DashboardView {
  render(container) {
    const workouts = StorageService.getWorkouts();
    const sorted = StorageService.getSortedWorkouts(workouts);

    // Métricas Reais
    const completedWorkouts = workouts.filter(w => w.status === 'completed');
    
    // Somatório de KM Realizados
    const totalKm = completedWorkouts.reduce((acc, w) => acc + (parseFloat(w.completed?.distance) || 0), 0);

    // Próximo treino agendado (futuro mais próximo com status 'planned')
    const nextWorkout = sorted.future.find(w => w.status === 'planned');

    // Treinos concluídos na semana atual
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0,0,0,0);

    const weeklyCompletedCount = completedWorkouts.filter(w => {
      const wDate = new Date(w.date + 'T00:00:00');
      return wDate >= startOfWeek;
    }).length;

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Olá, Rafael 👋</h1>
          <p class="card-subtext">Painel geral de treinamento e métricas de desempenho.</p>
        </div>
      </div>

      <div class="grid-metrics">
        <div class="card">
          <div class="card-title">KM REALIZADOS</div>
          <div class="card-value">${totalKm.toFixed(1)} km</div>
          <div class="card-subtext">Meta semanal: 25 km</div>
        </div>
        <div class="card">
          <div class="card-title">TREINOS CONCLUÍDOS</div>
          <div class="card-value">${completedWorkouts.length}/${workouts.length}</div>
          <div class="card-subtext">Taxa: ${workouts.length > 0 ? Math.round((completedWorkouts.length / workouts.length) * 100) : 0}%</div>
        </div>
        <div class="card">
          <div class="card-title">PRÓXIMA PROVA</div>
          <div class="card-value">—</div>
          <div class="card-subtext">Nenhuma prova cadastrada</div>
        </div>
        <div class="card">
          <div class="card-title">FREQUÊNCIA SEMANAL</div>
          <div class="card-value">${weeklyCompletedCount} treinos</div>
          <div class="card-subtext">Meta: 3 treinos/sem</div>
        </div>
      </div>

      <div class="hero-workout">
        ${nextWorkout ? `
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #60a5fa; font-weight: 700;">
              PRÓXIMO TREINO AGENDADO
            </span>
            <h3>${nextWorkout.type} — ${nextWorkout.planned.distance} km</h3>
            <p>Data: ${new Date(nextWorkout.date + 'T00:00:00').toLocaleDateString('pt-BR')} | Pace Alvo: ${nextWorkout.planned.paceMin ? `${nextWorkout.planned.paceMin}/km` : 'Livre'}</p>
          </div>
          <button class="btn btn-secondary" id="btn-view-next-workout">Ver treino</button>
        ` : `
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #60a5fa; font-weight: 700;">
              PRÓXIMO TREINO AGENDADO
            </span>
            <h3>Nenhum treino programado</h3>
            <p>Seus próximos treinos aparecerão aqui.</p>
          </div>
        `}
      </div>
    `;

    const btnNext = document.getElementById('btn-view-next-workout');
    if (btnNext) {
      btnNext.onclick = () => window.app.switchView('workouts');
    }
  }
}
