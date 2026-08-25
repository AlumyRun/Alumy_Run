import { StorageService } from '../services/StorageService.js';

export class RecordsView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const profile = StorageService.getProfile();

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Meus Recordes Pessoais (RPs)</h1>
          <p class="card-subtext">Suas melhores marcas registradas.</p>
        </div>
        <button class="btn" id="btn-add-rp"><i data-feather="plus"></i> Adicionar RP</button>
      </div>

      <div class="grid-metrics" id="rp-container">
        ${Object.entries(profile.records).map(([dist, time]) => `
          <div class="card">
            <div class="card-title">${dist}</div>
            <div class="card-value" style="color: var(--accent-primary);">${time}</div>
            <div class="card-subtext">Recorde Pessoal Atual</div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('btn-add-rp').onclick = () => {
      const dist = prompt('Informe a distância (Ex: 15 km):');
      const time = prompt('Informe o seu tempo (Ex: 1:12:00):');
      if (dist && time) {
        profile.records[dist] = time;
        StorageService.saveProfile(profile);
        this.app.reloadCurrentView();
      }
    };
  }
}