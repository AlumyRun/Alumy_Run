import { StorageService } from '../services/StorageService.js';

export class EvolutionView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const workouts = StorageService.getWorkouts();
    const completed = workouts.filter(w => w.status === 'completed');

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Evolução & Gráficos</h1>
          <p class="card-subtext">Acompanhamento visual do seu progresso em corrida.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        <div class="card">
          <div class="card-title">Volume de Distância Realizado (km)</div>
          <canvas id="chart-volume" height="200"></canvas>
        </div>
        <div class="card">
          <div class="card-title">Evolução de Pace em Treinos Concluídos</div>
          <canvas id="chart-pace" height="200"></canvas>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.renderCharts(completed);
    }, 50);
  }

  renderCharts(completedWorkouts) {
    // Chart 1: Volume por treino concluído
    const ctxVol = document.getElementById('chart-volume')?.getContext('2d');
    if (ctxVol) {
      const labels = completedWorkouts.map(w => w.date);
      const dataKm = completedWorkouts.map(w => w.completed.distance);

      new Chart(ctxVol, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['Sem dados'],
          datasets: [{
            label: 'Distância (km)',
            data: dataKm.length > 0 ? dataKm : [0],
            backgroundColor: '#ff5500',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: '#23314d' }, ticks: { color: '#8e9bb0' } },
            x: { grid: { display: false }, ticks: { color: '#8e9bb0' } }
          }
        }
      });
    }

    // Chart 2: Evolução de Pace Médio
    const ctxPace = document.getElementById('chart-pace')?.getContext('2d');
    if (ctxPace) {
      const labelsPace = completedWorkouts.map(w => w.date);
      const dataPace = completedWorkouts.map(w => {
        const parts = w.completed.pace.split(':').map(Number);
        return parts.length === 2 ? parts[0] + parts[1] / 60 : 0;
      });

      new Chart(ctxPace, {
        type: 'line',
        data: {
          labels: labelsPace.length > 0 ? labelsPace : ['Sem dados'],
          datasets: [{
            label: 'Pace Médio (min/km)',
            data: dataPace.length > 0 ? dataPace : [0],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: '#23314d' }, ticks: { color: '#8e9bb0' } },
            x: { grid: { display: false }, ticks: { color: '#8e9bb0' } }
          }
        }
      });
    }
  }
}
