export class WorkoutsView {
  render(container) {
    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Treinos</h1>
          <p class="card-subtext">Sua lista de treinos agendados e histórico aparecerá aqui.</p>
        </div>
      </div>
      <div class="card"><p style="color: var(--text-secondary);">Módulo em desenvolvimento para a próxima etapa.</p></div>
    `;
  }
}
