import { StorageService } from '../services/StorageService.js';

export class RacesView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const profile = StorageService.getProfile();

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Provas & Metas</h1>
          <p class="card-subtext">Calendário de provas com contagem regressiva.</p>
        </div>
        <button class="btn" id="btn-add-race"><i data-feather="plus"></i> Adicionar Prova</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${profile.races.map(r => {
          const today = new Date();
          const raceDate = new Date(r.date);
          const diffDays = Math.ceil((raceDate - today) / (1000 * 60 * 60 * 24));

          return `
            <div class="card card-dark-feature" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
              <div>
                <span class="badge badge-planned" style="background: rgba(255,255,255,0.15); color: #ffffff;">🏁 Faltam ${diffDays > 0 ? diffDays : 0} dias</span>
                <h3 style="margin-top: 8px; font-size: 1.2rem;">${r.label}</h3>
                <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">Data: ${r.date} | Distância: ${r.distance}</p>
              </div>
              <div style="text-align: right;">
                <div class="card-title" style="color: #94a3b8;">Meta de Tempo</div>
                <div class="card-value" style="color: #10b981;">${r.targetTime}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-add-race').onclick = () => {
      const label = prompt('Nome da Prova:');
      const date = prompt('Data (AAAA-MM-DD):');
      const distance = prompt('Distância (Ex: 10 km):');
      const targetTime = prompt('Meta de Tempo (Ex: 45:00):');

      if (label && date && distance && targetTime) {
        profile.races.push({
          id: `r_${Date.now()}`,
          label, date, distance, targetTime
        });
        StorageService.saveProfile(profile);
        this.app.reloadCurrentView();
      }
    };
  }
}
