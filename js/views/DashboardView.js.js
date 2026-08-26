export class DashboardView {
  render(container) {
    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Olá, Rafael 👋</h1>
          <p class="card-subtext">Painel geral de treinamento e métricas de desempenho.</p>
        </div>
        <button class="btn">+ Novo Treino</button>
      </div>

      <div class="grid-metrics">
        <div class="card">
          <div class="card-title">KM REALIZADOS</div>
          <div class="card-value">0.0 km</div>
          <div class="card-subtext">Meta semanal: 25 km</div>
        </div>
        <div class="card">
          <div class="card-title">TREINOS CONCLUÍDOS</div>
          <div class="card-value">0/0</div>
          <div class="card-subtext">Taxa de conclusão: 0%</div>
        </div>
        <div class="card">
          <div class="card-title">PRÓXIMA PROVA</div>
          <div class="card-value">—</div>
          <div class="card-subtext">Nenhuma prova cadastrada</div>
        </div>
        <div class="card">
          <div class="card-title">FREQUÊNCIA SEMANAL</div>
          <div class="card-value">0 treinos</div>
          <div class="card-subtext">Meta: 3 treinos/sem</div>
        </div>
      </div>

      <div class="hero-workout">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #60a5fa; font-weight: 700;">
            PRÓXIMO TREINO AGENDADO
          </span>
          <h3>Nenhum treino programado</h3>
          <p>Seus próximos treinos aparecerão aqui.</p>
        </div>
      </div>
    `;
  }
}