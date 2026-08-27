import { StorageService } from '../services/StorageService.js';
import { RaceModal } from '../components/RaceModal.js';

export class RacesView {
  render(container) {
    this.container = container;
    const races = StorageService.getRaces();

    races.sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Provas & Metas</h1>
          <p class="card-subtext">Acompanhe seus desafios, contagem regressiva e resultados reais.</p>
        </div>
        <button class="btn" id="btn-new-race">+ Nova Prova</button>
      </div>
      <div class="workouts-grid" id="races-list-grid"></div>
    `;

    document.getElementById('btn-new-race').onclick = () => {
      RaceModal.openCreateOrEdit(null, () => this.render(container));
    };

    const grid = document.getElementById('races-list-grid');

    if (races.length === 0) {
      grid.innerHTML = `<div class="card empty-state"><p>Nenhuma prova cadastrada no momento.</p></div>`;
      return;
    }

    races.forEach(race => {
      const card = document.createElement('div');
      card.className = 'card workout-card';

      const formattedDate = new Date(race.date + 'T00:00:00').toLocaleDateString('pt-BR');
      const isCompleted = race.status === 'completed';
      
      // STATUS DA PROVA (AGENDADA ou CONCLUÍDA)
      let headerBadge = '';
      if (isCompleted) {
        headerBadge = `<span class="status-badge status-completed">🟢 CONCLUÍDA</span>`;
      } else {
        headerBadge = `<span class="status-badge status-planned">🔵 AGENDADA</span>`;
      }

      // CORPO DO CARD
      let bodyHtml = '';
      if (isCompleted && race.resultTime && race.resultDistance) {
        
        // CÁLCULOS DO RITMO (PACE)
        const targetPace = StorageService.calculatePace(race.distance, race.targetTime);
        const actualPace = StorageService.calculatePace(race.resultDistance, race.resultTime);

        // COMPARAÇÃO COM A META DE TEMPO
        let diffHtml = '';
        if (race.targetTime && race.targetTime !== '0:00') {
          const targetSecs = this.parseTimeToSeconds(race.targetTime);
          const actualSecs = this.parseTimeToSeconds(race.resultTime);

          const diffSecs = actualSecs - targetSecs;
          const diffText = this.formatDiffText(Math.abs(diffSecs));

          if (diffSecs < 0) {
            // Abaixo da meta (Positivo)
            diffHtml = `
              <div style="color: #047857; background: #d1fae5; padding: 8px 12px; border-radius: var(--radius-sm); margin-top: 8px;">
                <span style="font-weight: 800; font-size: 1rem; display: block;">✅ ${diffText}</span>
                <span style="font-size: 0.85rem;">Abaixo da meta</span>
              </div>
            `;
          } else if (diffSecs > 0) {
            // Acima da meta (Negativo)
            diffHtml = `
              <div style="color: #b91c1c; background: #fee2e2; padding: 8px 12px; border-radius: var(--radius-sm); margin-top: 8px;">
                <span style="font-weight: 800; font-size: 1rem; display: block;">🔴 ${diffText}</span>
                <span style="font-size: 0.85rem;">Acima da meta</span>
              </div>
            `;
          } else {
            // Exatamente igual
            diffHtml = `
              <div style="color: #1d4ed8; background: #dbeafe; padding: 8px 12px; border-radius: var(--radius-sm); margin-top: 8px;">
                <span style="font-weight: 800; font-size: 1rem; display: block;">🎯 Exatamente na meta</span>
              </div>
            `;
          }
        }

        bodyHtml = `
          ${race.notes ? `<p class="workout-desc" style="margin-bottom: 16px;">${race.notes}</p>` : ''}
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.85rem;">
            <div>
              <strong style="color: var(--text-secondary); display: block; margin-bottom: 6px; letter-spacing: 0.05em; font-size: 0.75rem;">PLANEJADO</strong>
              <div>${race.distance.toFixed(2).replace('.', ',')} km</div>
              <div>Meta: ${race.targetTime || '--:--'}</div>
              <div>Ritmo alvo: ${targetPace}/km</div>
            </div>
            <div>
              <strong style="color: var(--primary); display: block; margin-bottom: 6px; letter-spacing: 0.05em; font-size: 0.75rem;">REALIZADO</strong>
              <div>${race.resultDistance.toFixed(2).replace('.', ',')} km</div>
              <div>Tempo: ${race.resultTime}</div>
              <div>Ritmo real: ${actualPace}/km</div>
            </div>
          </div>

          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--border);">
            <strong style="display: block; margin-bottom: 4px; font-size: 0.85rem;">RESULTADO</strong>
            ${diffHtml}
          </div>
        `;
      } else {
        // Exibição Padrão (Antes da Conclusão)
        bodyHtml = `
          <div class="workout-meta-row" style="margin-top: 8px;">
            <span>🎯 META DE TEMPO: <strong>${race.targetTime || 'Não informada'}</strong></span>
          </div>
          ${race.notes ? `<p class="workout-desc" style="margin-top: 6px;">${race.notes}</p>` : ''}
        `;
      }

      card.innerHTML = `
        <div class="workout-card-header">
          <div>
            <div class="workout-type">🏁 ${race.name}</div>
            <div class="workout-date">${formattedDate} • ${race.distance} km ${race.location ? `• 📍 ${race.location}` : ''}</div>
          </div>
          ${headerBadge}
        </div>

        <div class="workout-card-body">
          ${bodyHtml}
        </div>

        <div class="workout-card-footer">
          ${!isCompleted 
            ? `<button class="btn btn-sm btn-complete-race">🏁 Marcar como concluída</button>` 
            : `<button class="btn btn-sm btn-complete-race btn-secondary">Editar resultado</button>`
          }
          <button class="btn btn-sm btn-secondary btn-edit-race">Editar</button>
          <button class="btn btn-sm btn-danger btn-delete-race">Excluir</button>
        </div>
      `;

      // Eventos dos botões
      card.querySelector('.btn-complete-race').onclick = () => {
        RaceModal.openComplete(race, () => this.render(this.container));
      };

      card.querySelector('.btn-edit-race').onclick = () => {
        RaceModal.openCreateOrEdit(race, () => this.render(this.container));
      };

      card.querySelector('.btn-delete-race').onclick = () => {
        if (confirm(`Tem certeza que deseja excluir a prova "${race.name}"?`)) {
          StorageService.deleteRace(race.id);
          this.render(this.container);
        }
      };

      grid.appendChild(card);
    });
  }

  // --- Helpers Locais de Cálculo ---
  parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const cleanStr = timeStr.toString().trim();
    if (!cleanStr.includes(':')) {
      const mins = parseFloat(cleanStr);
      return isNaN(mins) ? 0 : mins * 60;
    }
    const parts = cleanStr.split(':').map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  }

  formatDiffText(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    let parts = [];
    if (m > 0) parts.push(`${m} minuto${m !== 1 ? 's' : ''}`);
    if (s > 0) parts.push(`${s} segundo${s !== 1 ? 's' : ''}`);
    return parts.join(' e ');
  }
}
