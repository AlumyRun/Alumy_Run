export class ProfileView {
  render(container) {
    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Perfil do Atleta</h1>
          <p class="card-subtext">Suas configurações de perfil e objetivos aparecerão aqui.</p>
        </div>
      </div>
      <div class="card"><p style="color: var(--text-secondary);">Módulo em desenvolvimento para a próxima etapa.</p></div>
    `;
  }
}
