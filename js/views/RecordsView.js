export class RecordsView {
  render(container) {
    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Recordes Pessoais (RPs)</h1>
          <p class="card-subtext">Seus melhores tempos por distância aparecerão aqui.</p>
        </div>
      </div>
      <div class="card"><p style="color: var(--text-secondary);">Módulo em desenvolvimento para a próxima etapa.</p></div>
    `;
  }
}
