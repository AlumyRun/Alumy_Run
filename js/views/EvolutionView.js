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
      .filter(w => w.status === 'completed' && w.completed && parseFloat(w.completed.distance) > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const filteredWorkouts = this.filterByPeriod(completedWorkouts, this.currentPeriod);

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">📈 Evolução</h1>
          <p class="card-subtext">Acompanhe seu progresso e desempenho com base nos treinos concluídos.</p>
        </div>
        <div class="period-selector">
          <button class="btn-period ${this.currentPeriod === '7' ? 'active' : ''}" data-period="7">7 DIAS</button>
          <button class="btn-period ${this.currentPeriod === '30' ? 'active' : ''}" data-period="30">30 DIAS</button>
          <button class="btn-period ${this.currentPeriod === '90' ? 'active' : ''}" data-period="90">90 DIAS</button>
          <button class="btn-period ${this.currentPeriod === 'all' ? 'active' : ''}" data-period="all">TUDO</button>
        </div>
      </div>

      <div id="evolution-content"></div>
    `;

    container.querySelectorAll('.btn-period').forEach(btn => {
      btn.onclick = (e) => {
        this.currentPeriod = e.currentTarget.dataset.period;
        this.render(container);
      };
    });

    const contentDiv = document.getElementById('evolution-content');

    if (filteredWorkouts.length === 0) {
      contentDiv.innerHTML = `
        <div class="card empty-state" style="padding: 40px; text-align: center; margin-top: 10px;">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">📈</span>
          <h3 style="margin-bottom: 6px; font-size: 1.1rem; color: var(--text-primary);">Você ainda não possui treinos realizados suficientes para gerar sua evolução.</h3>
          <p class="card-subtext">Conclua alguns treinos para começar a acompanhar sua evolução.</p>
        </div>
      `;
      return;
    }

    const stats = this.calculateStats(filteredWorkouts);
    const comparison = this.calculateWeeklyComparison(completedWorkouts);

    contentDiv.innerHTML = `
      <div class="dash-metrics-row" style="margin-bottom: 20px;">
        <div class="dash-card">
          <div class="dash-card-title">KM TOTAL</div>
          <div class="dash-card-value">${stats.totalKm.toFixed(1).replace('.', ',')} <small>km</small></div>
        </div>
        <div class="dash-card">
          <div class="dash-card-title">TREINOS REALIZADOS</div>
          <div class="dash-card-value">${stats.totalCount}</div>
        </div>
        <div class="dash-card">
          <div class="dash-card-title">TEMPO TOTAL</div>
          <div class="dash-card-value" style="font-size: 1.25rem;">${stats.totalTimeFormatted}</div>
        </div>
        <div class="dash-card">
          <div class="dash-card-title">PACE MÉDIO</div>
          <div class="dash-card-value">${stats.avgPace} <small>/km</small></div>
        </div>
      </div>

      <div class="dash-bottom-row" style="margin-bottom: 20px;">
        <div class="dash-block" style="padding: 16px 20px;">
          <span style="font-size: 0.725rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">DISTÂNCIA MÉDIA</span>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
            ${stats.avgDistance.toFixed(1).replace('.', ',')} km <small style="font-size:0.8rem; font-weight:500; color:var(--text-secondary);">/ treino</small>
          </div>
        </div>
        <div class="dash-block" style="padding: 16px 20px;">
          <span style="font-size: 0.725rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">MELHOR PACE</span>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary); margin-top: 4px;">
            ${stats.bestPace} /km
          </div>
        </div>
        <div class="dash-block" style="padding: 16px 20px;">
          <span style="font-size: 0.725rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">COMPARAÇÃO SEMANAL</span>
          <div style="font-size: 0.85rem; color: var(--text-primary); margin-top: 6px;">
            ${comparison.hasEnoughData ? `
              <div style="display:flex; gap:12px; font-weight:700;">
                <span style="color: ${comparison.kmDiff >= 0 ? '#10b981' : '#ef4444'};">${comparison.kmDiff >= 0 ? '+' : ''}${comparison.kmPercent}% km</span>
                <span style="color: ${comparison.countDiff >= 0 ? '#10b981' : '#ef4444'};">${comparison.countDiff >= 0 ? '+' : ''}${comparison.countDiff} treino(s)</span>
              </div>
            ` : `<span style="color: var(--text-muted); font-weight: 500;">Dados insuficientes para comparação.</span>`}
          </div>
        </div>
      </div>

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
                <small style="color: var(--primary); font-weight: 700;">${w.completed.pace}/km</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

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
    let totalKm = 0; let totalSeconds = 0; let bestPaceSec = Infinity; let bestPaceStr = '--:--';

    workouts.forEach(w => {
      const dist = parseFloat(w.completed.distance) || 0;
      totalKm += dist;

      const secs = this.parseTimeToSeconds(w.completed.time);
      totalSeconds += secs;

      let paceStr = w.completed.pace;
      if ((!paceStr || paceStr === '0:00') && dist > 0 && secs > 0) {
        paceStr = StorageService.calculatePace(dist, w.completed.time);
      }

      if (dist > 0 && secs > 0) {
        const paceSec = secs / dist;
        if (paceSec < bestPaceSec) {
          bestPaceSec = paceSec;
          bestPaceStr = paceStr;
        }
      }
    });

    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalTimeFormatted = totalHours > 0 ? `${totalHours}h ${totalMinutes}min` : `${totalMinutes} min`;

    let avgPaceStr = '--:--';
    if (totalKm > 0 && totalSeconds > 0) {
      const avgPaceSec = totalSeconds / totalKm;
      const pMin = Math.floor(avgPaceSec / 60);
      const pSec = Math.round(avgPaceSec % 60);
      avgPaceStr = `${pMin}:${pSec < 10 ? '0' : ''}${pSec}`;
    }

    const avgDistance = workouts.length > 0 ? (totalKm / workouts.length) : 0;
    const recentWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

    return { totalKm, totalCount: workouts.length, totalTimeFormatted, avgPace: avgPaceStr, avgDistance, bestPace: bestPaceStr, recentWorkouts };
  }

  calculateWeeklyComparison(allCompletedWorkouts) {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0,0,0,0);

    const prevWeekStart = new Date(currentWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(currentWeekStart);

    const currentWeekWorkouts = allCompletedWorkouts.filter(w => new Date(w.date + 'T00:00:00') >= currentWeekStart);
    const prevWeekWorkouts = allCompletedWorkouts.filter(w => {
      const d = new Date(w.date + 'T00:00:00');
      return d >= prevWeekStart && d < prevWeekEnd;
    });

    if (currentWeekWorkouts.length === 0 || prevWeekWorkouts.length === 0) return { hasEnoughData: false };

    const curKm = currentWeekWorkouts.reduce((acc, w) => acc + (parseFloat(w.completed.distance) || 0), 0);
    const prevKm = prevWeekWorkouts.reduce((acc, w) => acc + (parseFloat(w.completed.distance) || 0), 0);

    const kmDiff = curKm - prevKm;
    const kmPercent = prevKm > 0 ? Math.round((kmDiff / prevKm) * 100) : 0;
    const countDiff = currentWeekWorkouts.length - prevWeekWorkouts.length;

    return { hasEnoughData: true, kmDiff, kmPercent, countDiff };
  }

  parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const cleanStr = timeStr.toString().trim();
    if (!cleanStr.includes(':')) {
      const mins = parseFloat(cleanStr);
      return isNaN(mins) ? 0 : mins * 60;
    }
    const parts = cleanStr.split(':').map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  }

  renderKmChart(workouts) {
    const ctx = document.getElementById('chart-km-week');
    if (!ctx) return;
    if (this.kmChart) this.kmChart.destroy();

    const weeksMap = {};
    workouts.forEach(w => {
      const dateObj = new Date(w.date + 'T00:00:00');
      const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
      const pastDaysOfYear = (dateObj - firstDayOfYear) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      const weekKey = `Sem ${weekNum}`;
      weeksMap[weekKey] = (weeksMap[weekKey] || 0) + (parseFloat(w.completed.distance) || 0);
    });

    this.kmChart = new window.Chart(ctx, {
      type: 'bar',
      data: { labels: Object.keys(weeksMap), datasets: [{ label: 'Km Realizados', data: Object.values(weeksMap), backgroundColor: '#2563eb', borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#e2e8f0' } }, x: { grid: { display: false } } } }
    });
  }

  renderPaceChart(workouts) {
    const ctx = document.getElementById('chart-pace-history');
    if (!ctx) return;
    if (this.paceChart) this.paceChart.destroy();

    const labels = [];
    const paceDataInMinutes = [];

    workouts.forEach(w => {
      let paceStr = w.completed.pace;
      const dist = parseFloat(w.completed.distance) || 0;
      if ((!paceStr || paceStr === '0:00') && dist > 0) paceStr = StorageService.calculatePace(dist, w.completed.time);
      if (paceStr) {
        labels.push(new Date(w.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        const parts = paceStr.split(':').map(Number);
        if (parts.length === 2) paceDataInMinutes.push(parts[0] + (parts[1] / 60));
      }
    });

    this.paceChart = new window.Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: [{ label: 'Pace (min/km)', data: paceDataInMinutes, borderColor: '#1e3a8a', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#2563eb' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => { const val = context.raw; const min = Math.floor(val); const sec = Math.round((val - min) * 60); return `Pace: ${min}:${sec < 10 ? '0' : ''}${sec} /km`; } } } }, scales: { y: { reverse: true, grid: { color: '#e2e8f0' }, ticks: { callback: (value) => { const min = Math.floor(value); const sec = Math.round((value - min) * 60); return `${min}:${sec < 10 ? '0' : ''}${sec}`; } } }, x: { grid: { display: false } } } }
    });
  }
}
