export class RacesView {
  render(container) {
    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Provas & Metas</h1>
          <p class="card-subtext">Suas provas alvo e metas de tempo aparecerão aqui.</p>
        </div>
      </div>
      <div class="card"><p style="color: var(--text-secondary);">Módulo em desenvolvimento para a próxima etapa.</p></div>
    `;
  }
}
