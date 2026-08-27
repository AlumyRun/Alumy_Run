import { StorageService } from '../services/StorageService.js';

export class EvolutionView {
  constructor() {
    this.currentPeriod = 'all'; // '7', '30', '90', 'all'
    this.kmChart = null;
    this.paceChart = null;
  }

  render(container) {
    this.container = container;
    const rawWorkouts = StorageService.getWorkouts();
    
    // Filtrar somente treinos CONCLUÍDOS
    const completedWorkouts = rawWorkouts
      .filter(w => w.status === 'completed' && w.completed)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordenação cronológica

    // Filtragem por período
    const filteredWorkouts = this.filterByPeriod(completedWorkouts, this.currentPeriod);

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Evolução e Desempenho</h1>
          <p class="card-subtext">Análise detalhada do seu histórico de treinos concluídos.</p>
        </div>
        
        <!-- SELETOR DE PERÍODO -->
        <div class="period-selector">
          <button class="btn-period ${this.currentPeriod === '7' ? 'active' : ''}" data-period="7">7 dias</button>
          <button class="btn-period ${this.currentPeriod === '30' ? 'active' : ''}" data-period="30">30 dias</button>
          <button class="btn-period ${this.currentPeriod === '90' ? 'active' : ''}" data-period="90">90 dias</button>
          <button class="btn-period ${this.currentPeriod === 'all' ? 'active' : ''}" data-period="all">Tudo</button>
        </div>
      </div>

      <div id="evolution-content"></div>
    `;

    // Eventos dos botões de período
    container.querySelectorAll('.btn-period').forEach(btn => {
      btn.onclick = (e) => {
        this.currentPeriod = e.currentTarget.dataset.period;
        this.render(container);
      };
    });

    const contentDiv = document.getElementById('evolution-content');

    // ESTADO VAZIO
    if (filteredWorkouts.length === 0) {
      contentDiv.innerHTML = `
        <div class="card empty-state" style="padding: 40px; text-align: center;">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">📈</span>
          <h3 style="margin-bottom: 6px;">Sem dados de evolução</h3>
          <p class="card-subtext">Você ainda não possui treinos realizados suficientes para gerar sua evolução no período selecionado.</p>
        </div>
      `;
      return;
    }

    // CÁLCULOS PRINCIPAIS
    const stats = this.calculateStats(filteredWorkouts);

    contentDiv.innerHTML = `
      <!-- CARDS DE MÉRICA (4 LADO A LADO NO DESKTOP) -->
      <div class="dash-metrics-row" style="margin-bottom: 20px;">
        <div class="dash-card">
          <div class="dash-card-title">KM TOTAL</div>
          <div class="dash-card-value">${stats.totalKm.toFixed(1)} <small>km</small></div>
          <div class="dash-card-subtext">Distância percorrida</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-title">TREINOS</div>
          <div class="dash-card-value">${stats.totalCount}</div>
          <div class="dash-card-subtext">Sessões concluídas</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-title">TEMPO TOTAL</div>
          <div class="dash-card-value" style="font-size: 1.25rem;">${stats.totalTimeFormatted}</div>
          <div class="dash-card-subtext">Horas acumuladas</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-title">PACE MÉDIO</div>
          <div class="dash-card-value">${stats.avgPace} <small>/km</small></div>
          <div class="dash-card-subtext">Melhor pace: ${stats.bestPace}/km</div>
        </div>
      </div>

      <!-- SEGUNDA LINHA DE METRICAS ADICIONAIS -->
      <div class="dash-bottom-row" style="margin-bottom: 20px;">
        <div class="dash-block" style="padding: 14px 20px;">
          <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">DISTÂNCIA MÉDIA / TREINO</span>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${stats.avgDistance.toFixed(1)} km</div>
        </div>
        <div class="dash-block" style="padding: 14px 20px;">
          <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">MELHOR PACE REGISTRADO</span>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary); margin-top: 4px;">${stats.bestPace} /km</div>
        </div>
      </div>

      <!-- GRÁFICOS LADO A LADO -->
      <div class="evolution-charts-grid">
        <div class="card chart-card">
          <h3 class="chart-title">Quilometragem por Semana</h3>
          <div class="chart-container">
            <canvas id="chart-km-week"></canvas>
          </div>
        </div>

        <div class="card chart-card">
          <h3 class="chart-title">Evolução do Pace</h3>
          <div class="chart-container">
            <canvas id="chart-pace-history"></canvas>
          </div>
        </div>
      </div>

      <!-- HISTÓRICO RECENTE DE TREINOS -->
      <div class="card" style="margin-top: 20px;">
        <div class="block-header" style="margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
          <h3>Últimos Treinos Realizados</h3>
        </div>
        <div class="recent-completed-list">
          ${stats.recentWorkouts.map(w => `
            <div class="upcoming-item" style="justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="upcoming-date">${new Date(w.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                <div class="upcoming-info">
                  <strong>${w.type}</strong>
                  <small>Tempo: ${w.completed.time || '--'}</small>
                </div>
              </div>
              <div style="text-align: right;">
                <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">${w.completed.distance} km</strong>
                <small style="color: var(--primary-dark); font-weight: 700;">${w.completed.pace}/km</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Renderizar Gráficos via Chart.js
    this.renderKmChart(filteredWorkouts);
    this.renderPaceChart(filteredWorkouts);
  }

  filterByPeriod(workouts, period) {
    if (period === 'all') return workouts;
    const days = parseInt(period, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);

    return workouts.filter(w => new Date(w.date + 'T00:00:00') >= cutoff);
  }

  calculateStats(workouts) {
    let totalKm = 0;
    let totalSeconds = 0;
    let bestPaceSec = Infinity;
    let bestPaceStr = '--:--';

    workouts.forEach(w => {
      const dist = parseFloat(w.completed.distance) || 0;
      totalKm += dist;

      // Cálculo de segundos totais do tempo
      if (w.completed.time) {
        const parts = w.completed.time.toString().split(':').map(Number);
        let secs = 0;
        if (parts.length === 3) secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) secs = parts[0] * 60 + parts[1];
        else if (parts.length === 1) secs = parts[0] * 60;
        totalSeconds += secs;

        // Identificação do Melhor Pace
        if (dist > 0 && secs > 0) {
          const paceSec = secs / dist;
          if (paceSec < bestPaceSec) {
            bestPaceSec = paceSec;
            const pMin = Math.floor(paceSec / 60);
            const pSec = Math.round(paceSec % 60);
            bestPaceStr = `${pMin}:${pSec < 10 ? '0' : ''}${pSec}`;
          }
        }
      }
    });

    // Tempo total formatado (ex: "10h 42min")
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalTimeFormatted = totalHours > 0 
      ? `${totalHours}h ${totalMinutes}min` 
      : `${totalMinutes} min`;

    // Pace Médio Geral
    let avgPaceStr = '--:--';
    if (totalKm > 0 && totalSeconds > 0) {
      const avgPaceSec = totalSeconds / totalKm;
      const pMin = Math.floor(avgPaceSec / 60);
      const pSec = Math.round(avgPaceSec % 60);
      avgPaceStr = `${pMin}:${pSec < 10 ? '0' : ''}${pSec}`;
    }

    const avgDistance = workouts.length > 0 ? (totalKm / workouts.length) : 0;
    
    // Lista ordenada do mais recente para o mais antigo
    const recentWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      totalKm,
      totalCount: workouts.length,
      totalTimeFormatted,
      avgPace: avgPaceStr,
      avgDistance,
      bestPace: bestPaceStr,
      recentWorkouts
    };
  }

  renderKmChart(workouts) {
    const ctx = document.getElementById('chart-km-week');
    if (!ctx) return;

    if (this.kmChart) this.kmChart.destroy();

    // Agrupar por semana
    const weeksMap = {};
    workouts.forEach(w => {
      const dateObj = new Date(w.date + 'T00:00:00');
      // Identificador da semana (Ano + Número da semana)
      const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
      const pastDaysOfYear = (dateObj - firstDayOfYear) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      const weekKey = `Sem ${weekNum}`;

      weeksMap[weekKey] = (weeksMap[weekKey] || 0) + (parseFloat(w.completed.distance) || 0);
    });

    const labels = Object.keys(weeksMap);
    const data = Object.values(weeksMap);

    this.kmChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length > 0 ? labels : ['Semana Atual'],
        datasets: [{
          label: 'Km Realizados',
          data: data.length > 0 ? data : [0],
          backgroundColor: '#2563eb',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  renderPaceChart(workouts) {
    const ctx = document.getElementById('chart-pace-history');
    if (!ctx) return;

    if (this.paceChart) this.paceChart.destroy();

    const labels = [];
    const paceDataInMinutes = [];

    workouts.forEach(w => {
      if (w.completed.pace) {
        labels.push(new Date(w.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        const parts = w.completed.pace.toString().split(':').map(Number);
        if (parts.length === 2) {
          const paceDecimal = parts[0] + (parts[1] / 60);
          paceDataInMinutes.push(paceDecimal);
        }
      }
    });

    this.paceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['--/--'],
        datasets: [{
          label: 'Pace (min/km)',
          data: paceDataInMinutes.length > 0 ? paceDataInMinutes : [0],
          borderColor: '#1e3a8a',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.raw;
                const min = Math.floor(val);
                const sec = Math.round((val - min) * 60);
                return `Pace: ${min}:${sec < 10 ? '0' : ''}${sec} /km`;
              }
            }
          }
        },
        scales: {
          y: {
            reverse: true, // Pace menor fica no topo do gráfico
            grid: { color: '#e2e8f0' },
            ticks: {
              callback: (value) => {
                const min = Math.floor(value);
                const sec = Math.round((value - min) * 60);
                return `${min}:${sec < 10 ? '0' : ''}${sec}`;
              }
            }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
}
