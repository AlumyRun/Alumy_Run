export class CalendarView {
  render(container) {
    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Calendário de Treinos</h1>
          <p class="card-subtext">Seu planejamento mensal de treinos aparecerá aqui.</p>
        </div>
      </div>
      <div class="card"><p style="color: var(--text-secondary);">Módulo em desenvolvimento para a próxima etapa.</p></div>
    `;
  }
}