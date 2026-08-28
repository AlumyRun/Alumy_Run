import { StorageService } from '../services/StorageService.js';

export class EvolutionView {
  async render(container) {
    this.container = container;
    
    let workouts = [];
    try {
      workouts = await StorageService.getWorkouts();
    } catch (e) {
      console.warn("Erro ao buscar treinos no Supabase em EvolutionView:", e);
      workouts = [];
    }

    const completedWorkouts = (workouts || []).filter(w => w && w.status === 'completed' && w.completed);
    
    // Cálculo do volume total rodado
    const totalKm = completedWorkouts.reduce((acc, w) => {
      const km = parseFloat(w.completed.distance) || 0;
      return acc + km;
    }, 0);

    // Média de pace geral
    let avgPaceStr = '--:--';
    if (completedWorkouts.length > 0) {
      let totalPaceSeconds = 0;
      let countPace = 0;

      completedWorkouts.forEach(w => {
        if (w.completed && w.completed.pace) {
          const parts = w.completed.pace.toString().split(':');
          if (parts.length === 2) {
            totalPaceSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
            countPace++;
          }
        }
      });

      if (countPace > 0) {
        const avgSec = Math.round(totalPaceSeconds / countPace);
        const min = Math.floor(avgSec / 60);
        const sec = avgSec % 60;
        avgPaceStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;
      }
    }

    // Agrupamento por mês para histórico de volume
    const monthlyData = {};
    completedWorkouts.forEach(w => {
      if (w.date) {
        const monthKey = w.date.substring(0, 7); // AAAA-MM
        const km = parseFloat(w.completed.distance) || 0;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + km;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Evolução & Métricas</h1>
          <p class="card-subtext">Análise detalhada do seu volume de treino e métricas de desempenho.</p>
        </div>
      </div>

      <div class="dash-metrics-row">
        <div class="dash-card">
          <div class="dash-card-title">VOLUME TOTAL ACUMULADO</div>
          <div class="dash-card-value">${totalKm.toFixed(1)} <small>km</small></div>
          <div class="dash-card-subtext">Histórico geral da conta</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-title">TREINOS REALIZADOS</div>
          <div class="dash-card-value">${completedWorkouts.length}</div>
          <div class="dash-card-subtext">Atividades registradas</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-title">PACE MÉDIO GERAL</div>
          <div class="dash-card-value">${avgPaceStr} <small>/km</small></div>
          <div class="dash-card-subtext">Média de todos os treinos</div>
        </div>
      </div>

      <div class="card" style="margin-top: 24px; padding: 24px;">
        <h3 style="margin-bottom: 16px; color: var(--text-primary);">Histórico de Volume Mensal</h3>
        
        ${sortedMonths.length > 0 ? `
          <div class="summary-list">
            ${sortedMonths.map(mKey => {
              const [year, month] = mKey.split('-');
              const dateObj = new Date(year, month - 1, 1);
              const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
              const km = monthlyData[mKey];
              return `
                <div class="summary-item" style="padding: 12px 0; border-bottom: 1px solid var(--border);">
                  <span style="text-transform: capitalize; font-weight: 600;">${monthName}</span>
                  <strong style="color: var(--primary); font-size: 1.05rem;">${km.toFixed(1)} km</strong>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <p>Nenhum treino concluído registrado para gerar o histórico mensal.</p>
          </div>
        `}
      </div>
    `;
  }
}
