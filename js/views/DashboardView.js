import { StorageService } from '../services/StorageService.js';

export class DashboardView {
  render(container) {
    const workouts = StorageService.getWorkouts();
    const sorted = StorageService.getSortedWorkouts(workouts);

    const completedWorkouts = workouts.filter(w => w.status === 'completed');
    const totalKm = completedWorkouts.reduce((acc, w) => acc + (parseFloat(w.completed?.distance) || 0), 0);
    const nextWorkout = sorted.future.find(w => w.status === 'planned');

    // Leitura dinâmica da próxima prova cadastrada
    const nextRace = StorageService.getNextRace();
    let nextRaceText = '—';
    let nextRaceSubtext = 'Nenhuma prova cadastrada';

    if (nextRace) {
      const days = StorageService.getDaysRemaining(nextRace.date);
      const daysText = days > 0 ? `Faltam ${days} dias` : (days === 0 ? 'É hoje!' : 'Realizada');
      nextRaceText = `${nextRace.name.split(' ')[0]} (${nextRace.distance}k)`;
      nextRaceSubtext = `${nextRace.location || ''} • ${daysText}`;
    }

    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyCompletedCount = completedWorkouts.filter(w => {
      const wDate = new Date(w.date + 'T00:00:00');
      return wDate >= startOfWeek;
    }).length;

    const upcomingList = sorted.future.slice(0, 3);

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Olá, Rafael 👋</h1>
          <p class="card-subtext">Painel geral de treinamento e métricas de desempenho.</p>
        </div>
      </div>

      <!-- TOP METRICS GRID HORIZONTAL -->
      <div class="dash-metrics-row">
        <div class="dash-card">
          <div class="dash-card-title">KM REALIZADOS</div>
          <div class="dash-card-value">${totalKm.toFixed(1)} <small>km</small></div>
          <div class="dash-card-subtext">Meta semanal: 25 km</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-title">TREINOS CONCLUÍDOS</div>
          <div class="dash-card-value">${completedWorkouts.length}/${workouts.length}</div>
          <div class="dash-card-subtext">Taxa: ${workouts.length > 0 ? Math.round((completedWorkouts.length / workouts.length) * 100) : 0}%</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-title">PRÓXIMA PROVA</div>
          <div class="dash-card-value" style="font-size: 1.15rem; font-weight: 800;">${nextRace ? nextRace.name : '—'}</div>
          <div class="dash-card-subtext">${nextRace ? `${nextRace.distance} km • ${nextRace.location} • ${nextRaceSubtext.split('•')[1] || ''}` : 'Nenhuma prova cadastrada'}</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-title">FREQUÊNCIA SEMANAL</div>
          <div class="dash-card-value">${weeklyCompletedCount} <small>treinos</small></div>
          <div class="dash-card-subtext">Meta: 3 treinos/sem</div>
        </div>
      </div>

      <!-- HERO PRÓXIMO TREINO -->
      <div class="dash-hero-card">
        ${nextWorkout ? `
          <div class="hero-left">
            <span class="hero-badge">PRÓXIMO TREINO AGENDADO</span>
            <h3>${nextWorkout.type} — ${nextWorkout.planned.distance} km</h3>
            <p>Data: ${new Date(nextWorkout.date + 'T00:00:00').toLocaleDateString('pt-BR')} | Pace Alvo: ${nextWorkout.planned.paceMin ? `${nextWorkout.planned.paceMin}/km` : 'Livre'}</p>
          </div>
          <button class="btn btn-secondary" id="btn-view-next-workout">Ver treino</button>
        ` : `
          <div class="hero-left">
            <span class="hero-badge">PRÓXIMO TREINO AGENDADO</span>
            <h3>Nenhum treino programado</h3>
            <p>Seus próximos treinos aparecerão aqui assim que forem cadastrados.</p>
          </div>
        `}
      </div>

      <!-- BLOCOS INFERIORES LADO A LADO -->
      <div class="dash-bottom-row">
        <div class="dash-block">
          <div class="block-header">
            <h3>Resumo da Semana</h3>
          </div>
          <div class="summary-list">
            <div class="summary-item">
              <span>Volume Total</span>
              <strong>${totalKm.toFixed(1)} km / 25 km</strong>
            </div>
            <div class="summary-item">
              <span>Treinos Realizados</span>
              <strong>${weeklyCompletedCount} treinos</strong>
            </div>
            <div class="summary-item">
              <span>Progresso da Meta</span>
              <strong>${Math.min(100, Math.round((totalKm / 25) * 100))}%</strong>
            </div>
          </div>
        </div>

        <div class="dash-block">
          <div class="block-header">
            <h3>Próximos Treinos</h3>
          </div>
          <div class="upcoming-list">
            ${upcomingList.length > 0 ? upcomingList.map(w => `
              <div class="upcoming-item">
                <div class="upcoming-date">
                  <span>${new Date(w.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                </div>
                <div class="upcoming-info">
                  <strong>${w.type}</strong>
                  <small>${w.planned.distance} km ${w.planned.paceMin ? `• Pace: ${w.planned.paceMin}/km` : ''}</small>
                </div>
              </div>
            `).join('') : '<p class="empty-text">Nenhum próximo treino agendado.</p>'}
          </div>
        </div>
      </div>
    `;

    const btnNext = document.getElementById('btn-view-next-workout');
    if (btnNext) {
      btnNext.onclick = () => window.app.switchView('workouts');
    }
  }
}
