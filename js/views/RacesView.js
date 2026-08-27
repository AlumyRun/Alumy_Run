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
          <p class="card-subtext">Acompanhe seus desafios, contagem regressiva e resultados oficiais de provas.</p>
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
      const daysRemaining = StorageService.getDaysRemaining(race.date);

      let countdownBadge = '';
      if (race.status === 'completed') {
        countdownBadge = `<span class="status-badge status-completed">PROVA CONCLUÍDA</span>`;
      } else if (daysRemaining > 0) {
        countdownBadge = `<span class="status-badge status-planned">FALTAM ${daysRemaining} DIAS</span>`;
      } else if (daysRemaining === 0) {
        countdownBadge = `<span class="status-badge status-planned" style="background:#fef3c7; color:#b45309;">É HOJE!</span>`;
      } else {
        countdownBadge = `<span class="status-badge status-missed">REALIZADA</span>`;
      }

      // Lógica de Comparação da Meta vs Realizado
      let comparisonHtml = '';
      if (race.status === 'completed' && race.resultTime) {
        let diffHtml = '';
        
        if (race.targetTime && race.targetTime !== '0:00') {
          const targetSecs = this.parseTimeToSeconds(race.targetTime);
          const resultSecs = this.parseTimeToSeconds(race.resultTime);

          if (targetSecs > 0 && resultSecs > 0) {
            const diff = resultSecs - targetSecs;
            const diffAbs = Math.abs(diff);
            const diffMins = Math.floor(diffAbs / 60);
            const diffSecsRem = diffAbs % 60;
            const diffStr = `${diffMins}m ${diffSecsRem < 10 ? '0' : ''}${diffSecsRem}s`;

            if (diff < 0) {
              // Tempo Realizado foi MENOR que a Meta (Excelente!)
              diffHtml = `<span style="color: #10b981; font-weight: 700;">🔥 -${diffStr} (Abaixo da meta!)</span>`;
            } else if (diff > 0) {
              // Tempo Realizado foi MAIOR que a Meta
              diffHtml = `<span style="color: #ef4444; font-weight: 700;">+${diffStr} (Acima da meta)</span>`;
            } else {
              // Exatamente cravado
              diffHtml = `<span style="color: #3b82f6; font-weight: 700;">Na mosca! (Exatamente na meta)</span>`;
            }
          }
        }

        comparisonHtml = `
          <div class="workout-comparison-box" style="margin-top: 12px; border-left-color: #10b981;">
            <div class="comp-title" style="color: #047857;">RESULTADO OFICIAL</div>
            <div class="comp-details" style="margin-bottom: 6px;">
              <span><strong>${race.resultDistance} km</strong></span> | 
              <span>Tempo: <strong>${race.resultTime}</strong></span> | 
              <span>Pace: <strong>${StorageService.calculatePace(race.resultDistance, race.resultTime)}/km</strong></span>
            </div>
            ${diffHtml ? `<div style="font-size: 0.8rem; background: var(--background); padding: 6px 8px; border-radius: 4px; display: inline-block;">Comparação: ${diffHtml}</div>` : ''}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="workout-card-header">
          <div>
            <div class="workout-type">🏁 ${race.name}</div>
            <div class="workout-date">${formattedDate} • ${race.distance} km ${race.location ? `• 📍 ${race.location}` : ''}</div>
          </div>
          ${countdownBadge}
        </div>

        <div class="workout-card-body">
          <div class="workout-meta-row" style="margin-top: 8px;">
            <span>🎯 META DE TEMPO: <strong>${race.targetTime || 'Não informada'}</strong></span>
          </div>
          ${race.notes ? `<p class="workout-desc" style="margin-top: 6px;">${race.notes}</p>` : ''}
          
          ${comparisonHtml}
        </div>

        <div class="workout-card-footer">
          <button class="btn btn-sm btn-complete-race">${race.status === 'completed' ? 'Editar Resultado' : 'Registrar Resultado'}</button>
          <button class="btn btn-sm btn-secondary btn-edit-race">Editar</button>
          <button class="btn btn-sm btn-danger btn-delete-race">Excluir</button>
        </div>
      `;

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

  // Função auxiliar para calcular a diferença de tempo de forma limpa
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
}
