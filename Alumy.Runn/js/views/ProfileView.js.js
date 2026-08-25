import { StorageService } from '../services/StorageService.js';

export class ProfileView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const profile = StorageService.getProfile();

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Perfil do Atleta</h1>
          <p class="card-subtext">Edite suas metas e informações pessoais.</p>
        </div>
      </div>

      <div class="card" style="max-width: 600px;">
        <form id="form-profile">
          <div class="form-group">
            <label>Nome Completo</label>
            <input type="text" id="p-name" class="form-control" value="${profile.name}" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Volume Semanal Alvo (km)</label>
              <input type="number" id="p-vol" class="form-control" value="${profile.weeklyVolume}" required>
            </div>
            <div class="form-group">
              <label>Frequência Semanal (Treinos)</label>
              <input type="number" id="p-freq" class="form-control" value="${profile.weeklyFrequency}" required>
            </div>
          </div>

          <button type="submit" class="btn" style="margin-top: 12px;">Salvar Perfil</button>
        </form>
      </div>
    `;

    document.getElementById('form-profile').onsubmit = (e) => {
      e.preventDefault();
      profile.name = document.getElementById('p-name').value;
      profile.weeklyVolume = parseFloat(document.getElementById('p-vol').value);
      profile.weeklyFrequency = parseInt(document.getElementById('p-freq').value);

      StorageService.saveProfile(profile);
      alert('Perfil atualizado com sucesso!');
      this.app.reloadCurrentView();
    };
  }
}