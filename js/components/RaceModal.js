import { StorageService } from '../services/StorageService.js';

export class RaceModal {
  static openCreateOrEdit(raceToEdit = null, onSaveCallback) {
    this.close();

    const isEdit = !!raceToEdit;
    const race = raceToEdit || {
      name: '', date: new Date().toISOString().split('T')[0], distance: '', targetTime: '00:30:00', location: '', notes: '', status: 'planned', resultTime: '', resultDistance: ''
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
                <label>DISTÂNCIA (km) *</label>
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
            
            <div id="r-error-msg" style="color: #ef4444; font-size: 0.8rem; margin-top: 8px; display: none;"></div>

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

    document.getElementById('race-form').onsubmit = async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('r-error-msg');
      const saveBtn = document.getElementById('btn-save-race');
      errEl.style.display = 'none';
      saveBtn.innerText = 'Salvando...';
      saveBtn.disabled = true;

      const newRace = {
        id: isEdit ? race.id : `race_${Date.now()}`,
        name: document.getElementById('r-name').value,
        date: document.getElementById('r-date').value,
        distance: parseFloat(document.getElementById('r-distance').value) || 0,
        targetTime: document.getElementById('r-targettime').value,
        location: document.getElementById('r-location').value,
        notes: document.getElementById('r-notes').value,
        status: race.status || 'planned',
        resultTime: race.resultTime || null,
        resultDistance: race.resultDistance || null
      };

      try {
        if (isEdit) {
          await StorageService.updateRace(newRace);
        } else {
          await StorageService.addRace(newRace);
        }
        this.close();
        if (onSaveCallback) onSaveCallback();
      } catch (err) {
        saveBtn.innerText = 'Salvar Prova';
        saveBtn.disabled = false;
        errEl.innerText = err.message || 'Erro ao sincronizar com servidor.';
        errEl.style.display = 'block';
      }
    };
  }

  static openComplete(race, onSaveCallback) {
    this.close();

    const comp = {
      distance: race.resultDistance || race.distance || '',
      time: race.resultTime || '',
      status: race.status === 'planned' ? 'completed' : race.status
    };

    const modalHtml = `
      <div class="modal-backdrop" id="race-modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Registrar Resultado — ${race.name}</h3>
            <button class="modal-close-btn" id="race-modal-close">✕</button>
          </div>
          <form id="complete-race-form">
            <div class="form-row">
              <div class="form-group">
                <label>Status da Prova *</label>
                <select id="cr-status" required>
                  <option value="completed" ${comp.status === 'completed' ? 'selected' : ''}>Concluída</option>
                  <option value="planned" ${comp.status === 'planned' ? 'selected' : ''}>Planejada</option>
                  <option value="missed" ${comp.status === 'missed' ? 'selected' : ''}>Não Realizada</option>
                </select>
              </div>
              <div class="form-group">
                <label>Distância realizada (km) *</label>
                <input type="number" step="0.01" id="cr-dist" value="${comp.distance}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tempo Oficial (HH:MM:SS ou MM:SS) *</label>
                <input type="text" id="cr-time" value="${comp.time}" placeholder="Ex: 20:38" required>
              </div>
              <div class="form-group">
                <label>Pace Médio (Calculado)</label>
                <input type="text" id="cr-pace" value="" readonly class="input-readonly">
              </div>
            </div>

            <div id="cr-error-msg" style="color: #ef4444; font-size: 0.8rem; margin-top: 8px; display: none;"></div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="race-modal-cancel">Cancelar</button>
              <button type="submit" class="btn" id="btn-save-race-result">Salvar Resultado</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const distInput = document.getElementById('cr-dist');
    const timeInput = document.getElementById('cr-time');
    const paceInput = document.getElementById('cr-pace');

    const updateCalculatedPace = () => {
      const dist = parseFloat(distInput.value) || 0;
      const time = timeInput.value;
      if (dist > 0 && time) {
        const calculatedPace = StorageService.calculatePace(dist, time);
        paceInput.value = calculatedPace !== '0:00' ? `${calculatedPace}/km` : '0:00/km';
      } else {
        paceInput.value = '0:00/km';
      }
    };

    distInput.oninput = updateCalculatedPace;
    timeInput.oninput = updateCalculatedPace;
    updateCalculatedPace();

    document.getElementById('race-modal-close').onclick = () => this.close();
    document.getElementById('race-modal-cancel').onclick = () => this.close();

    document.getElementById('complete-race-form').onsubmit = async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('cr-error-msg');
      const saveBtn = document.getElementById('btn-save-race-result');
      errEl.style.display = 'none';
      saveBtn.innerText = 'Sincronizando...';
      saveBtn.disabled = true;

      const dist = parseFloat(distInput.value) || 0;
      let timeRaw = timeInput.value.trim();

      if (!timeRaw.includes(':') && !isNaN(parseFloat(timeRaw))) {
        timeRaw = `${timeRaw}:00`;
      }

      race.status = document.getElementById('cr-status').value;
      race.resultDistance = dist;
      race.resultTime = timeRaw;

      try {
        await StorageService.updateRace(race);
        this.close();
        if (onSaveCallback) onSaveCallback();
      } catch (err) {
        saveBtn.innerText = 'Salvar Resultado';
        saveBtn.disabled = false;
        errEl.innerText = err.message || 'Erro ao sincronizar resultado com o servidor.';
        errEl.style.display = 'block';
      }
    };
  }

  static close() {
    const backdrop = document.getElementById('race-modal-backdrop');
    if (backdrop) backdrop.remove();
  }
}
