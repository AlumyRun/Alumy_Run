import { StorageService } from '../services/StorageService.js';

export class RaceModal {
  static openCreateOrEdit(raceToEdit = null, onSaveCallback) {
    this.close();

    const isEdit = !!raceToEdit;
    const race = raceToEdit || {
      name: '',
      date: new Date().toISOString().split('T')[0],
      distance: '',
      targetTime: '00:30:00',
      location: '',
      notes: '',
      status: 'planned'
    };

    const modalHtml = `
      <div class="modal-backdrop" id="race-modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>${isEdit ? 'Editar Prova' : 'Nova Prova'}</h3>
            <button class="modal-close-btn" id="race-modal-close">✕</button>
          </div>
          <form id="race-form">
            <div class="form-group">
              <label>NOME DA PROVA *</label>
              <input type="text" id="r-name" value="${race.name}" placeholder="Ex: Corrida Toca Raul 2026" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>DATA *</label>
                <input type="date" id="r-date" value="${race.date}" required>
              </div>
              <div class="form-group">
                <label>DISTÂNCIA PLANEJADA (km) *</label>
                <input type="number" step="0.1" id="r-distance" value="${race.distance}" placeholder="7" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>LOCAL</label>
                <input type="text" id="r-location" value="${race.location || ''}" placeholder="Caieiras/SP">
              </div>
              <div class="form-group">
                <label>META DE TEMPO (HH:MM:SS ou MM:SS)</label>
                <input type="text" id="r-targettime" value="${race.targetTime || ''}" placeholder="00:30:00">
              </div>
            </div>
            <div class="form-group">
              <label>OBSERVAÇÕES</label>
              <textarea id="r-notes" placeholder="Detalhes ou objetivo da prova...">${race.notes || ''}</textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="race-modal-cancel">Cancelar</button>
              <button type="submit" class="btn" id="btn-save-race">Salvar Prova</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('race-modal-close').onclick = () => this.close();
    document.getElementById('race-modal-cancel').onclick = () => this.close();

    document.getElementById('race-form').onsubmit = (e) => {
      e.preventDefault();

      const newRace = {
        id: isEdit ? race.id : `race_${Date.now()}`,
        name: document.getElementById('r-name').value,
        date: document.getElementById('r-date').value,
        distance: parseFloat(document.getElementById('r-distance').value) || 0,
        targetTime: document.getElementById('r-targettime').value,
        location: document.getElementById('r-location').value,
        notes: document.getElementById('r-notes').value,
        status: race.status || 'planned',
        resultDistance: race.resultDistance || null,
        resultTime: race.resultTime || null
      };

      if (isEdit) {
        StorageService.updateRace(newRace);
      } else {
        StorageService.addRace(newRace);
      }

      this.close();
      if (onSaveCallback) onSaveCallback();
    };
  }

  static openComplete(race, onSaveCallback) {
    this.close();

    // Traz os dados reais caso já exista (modo edição de resultado), se não, sugere o planejado
    const dist = race.resultDistance || race.distance || '';
    const time = race.resultTime || '';

    const modalHtml = `
      <div class="modal-backdrop" id="race-modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>🏁 Concluir prova</h3>
            <button class="modal-close-btn" id="race-modal-close">✕</button>
          </div>
          
          <div style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border);">
            <strong style="font-size: 1.1rem; color: var(--text-primary);">${race.name}</strong>
          </div>

          <form id="complete-race-form">
            <div class="form-group">
              <label>Distância realizada (km)</label>
              <input type="number" step="0.01" id="cr-dist" value="${dist}" placeholder="Ex: 7.12" required>
            </div>
            <div class="form-group" style="margin-top: 16px;">
              <label>Tempo realizado (HH:MM:SS ou MM:SS)</label>
              <input type="text" id="cr-time" value="${time}" placeholder="Ex: 29:35" required>
            </div>
            
            <div class="modal-footer" style="margin-top: 24px;">
              <button type="button" class="btn btn-secondary" id="race-modal-cancel">Cancelar</button>
              <button type="submit" class="btn" id="btn-save-race-result">Salvar resultado</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('race-modal-close').onclick = () => this.close();
    document.getElementById('race-modal-cancel').onclick = () => this.close();

    document.getElementById('complete-race-form').onsubmit = (e) => {
      e.preventDefault();

      const distVal = parseFloat(document.getElementById('cr-dist').value);
      let timeVal = document.getElementById('cr-time').value.trim();

      if (!distVal || distVal <= 0) {
        alert("A distância deve ser maior que zero.");
        return;
      }

      // Converte MM:SS puro para formato com zeros se necessário, mas o script aceita ambos
      if (!timeVal.includes(':') && !isNaN(parseFloat(timeVal))) {
        timeVal = `${timeVal}:00`; 
      }

      // Atualiza o objeto no LocalStorage
      race.status = 'completed';
      race.resultDistance = distVal;
      race.resultTime = timeVal;

      StorageService.updateRace(race);

      this.close();
      if (onSaveCallback) onSaveCallback();
    };
  }

  static close() {
    const backdrop = document.getElementById('race-modal-backdrop');
    if (backdrop) backdrop.remove();
  }
}
