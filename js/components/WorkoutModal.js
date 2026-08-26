import { StorageService } from '../services/StorageService.js';

export class WorkoutModal {
  static openCreateOrEdit(workoutToEdit = null, onSaveCallback) {
    this.close();

    const isEdit = !!workoutToEdit;
    const workout = workoutToEdit || {
      date: new Date().toISOString().split('T')[0],
      type: 'Rodagem',
      status: 'planned',
      planned: { distance: '', paceMin: '', paceMax: '', description: '', objective: '' }
    };

    const modalHtml = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>${isEdit ? 'Editar Treino' : 'Novo Treino'}</h3>
            <button class="modal-close-btn" id="modal-close">✕</button>
          </div>
          <form id="workout-form">
            <div class="form-row">
              <div class="form-group">
                <label>DATA DO TREINO *</label>
                <input type="date" id="w-date" value="${workout.date}" required>
              </div>
              <div class="form-group">
                <label>Tipo de treino *</label>
                <select id="w-type" required>
                  ${['Rodagem', 'Longão', 'Intervalado', 'Tiros', 'Tempo Run', 'Regenerativo', 'Fartlek', 'Subida', 'Ritmo de prova', 'Outro']
                    .map(t => `<option value="${t}" ${workout.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Distância planejada (km)</label>
                <input type="number" step="0.1" id="w-dist" value="${workout.planned.distance || ''}" placeholder="Ex: 8">
              </div>
              <div class="form-group">
                <label>Pace Alvo Mínimo</label>
                <input type="text" id="w-pace-min" value="${workout.planned.paceMin || ''}" placeholder="03:55">
              </div>
              <div class="form-group">
                <label>Pace Alvo Máximo</label>
                <input type="text" id="w-pace-max" value="${workout.planned.paceMax || ''}" placeholder="04:05">
              </div>
            </div>

            <div class="form-group">
              <label>Descrição</label>
              <textarea id="w-desc" placeholder="Detalhes da estrutura do treino...">${workout.planned.description || ''}</textarea>
            </div>

            <div class="form-group">
              <label>Objetivo</label>
              <input type="text" id="w-obj" value="${workout.planned.objective || ''}" placeholder="Objetivo principal do treino...">
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
              <button type="submit" class="btn">Salvar Treino</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const closeHandler = () => this.close();
    document.getElementById('modal-close').onclick = closeHandler;
    document.getElementById('modal-cancel').onclick = closeHandler;

    document.getElementById('workout-form').onsubmit = (e) => {
      e.preventDefault();

      const newWorkout = {
        id: isEdit ? workout.id : `w_${Date.now()}`,
        date: document.getElementById('w-date').value,
        type: document.getElementById('w-type').value,
        status: workout.status || 'planned',
        planned: {
          distance: parseFloat(document.getElementById('w-dist').value) || 0,
          paceMin: document.getElementById('w-pace-min').value,
          paceMax: document.getElementById('w-pace-max').value,
          description: document.getElementById('w-desc').value,
          objective: document.getElementById('w-obj').value
        },
        completed: workout.completed || null
      };

      if (isEdit) {
        StorageService.updateWorkout(newWorkout);
      } else {
        StorageService.addWorkout(newWorkout);
      }

      this.close();
      if (onSaveCallback) onSaveCallback();
    };
  }

  static openComplete(workout, onSaveCallback) {
    this.close();

    const comp = workout.completed || { distance: workout.planned.distance, time: '', pace: '', feeling: 'Moderado', notes: '' };

    const modalHtml = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Registrar Conclusão — ${workout.type}</h3>
            <button class="modal-close-btn" id="modal-close">✕</button>
          </div>
          <form id="complete-form">
            <div class="form-row">
              <div class="form-group">
                <label>Status do Treino *</label>
                <select id="c-status" required>
                  <option value="completed" ${workout.status === 'completed' ? 'selected' : ''}>Concluído</option>
                  <option value="partial" ${workout.status === 'partial' ? 'selected' : ''}>Parcial</option>
                  <option value="missed" ${workout.status === 'missed' ? 'selected' : ''}>Não Realizado</option>
                </select>
              </div>
              <div class="form-group">
                <label>Distância realizada (km) *</label>
                <input type="number" step="0.01" id="c-dist" value="${comp.distance || ''}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tempo total (HH:MM:SS ou MM:SS) *</label>
                <input type="text" id="c-time" value="${comp.time || ''}" placeholder="00:40:00" required>
              </div>
              <div class="form-group">
                <label>Pace Médio (Calculado)</label>
                <input type="text" id="c-pace" value="${comp.pace || ''}" readonly class="input-readonly">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>FC Médial (opcional)</label>
                <input type="number" id="c-avghr" value="${comp.avgHR || ''}" placeholder="bpm">
              </div>
              <div class="form-group">
                <label>FC Máxima (opcional)</label>
                <input type="number" id="c-maxhr" value="${comp.maxHR || ''}" placeholder="bpm">
              </div>
            </div>

            <div class="form-group">
              <label>Como foi o treino?</label>
              <select id="c-feeling">
                ${['Muito fácil', 'Fácil', 'Moderado', 'Difícil', 'Muito difícil']
                  .map(f => `<option value="${f}" ${comp.feeling === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Observações</label>
              <textarea id="c-notes" placeholder="Notas sobre o treino...">${comp.notes || ''}</textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
              <button type="submit" class="btn">Salvar Resultado</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const distInput = document.getElementById('c-dist');
    const timeInput = document.getElementById('c-time');
    const paceInput = document.getElementById('c-pace');

    const updateCalculatedPace = () => {
      const dist = parseFloat(distInput.value) || 0;
      const time = timeInput.value;
      if (dist > 0 && time) {
        paceInput.value = `${StorageService.calculatePace(dist, time)}/km`;
      }
    };

    distInput.oninput = updateCalculatedPace;
    timeInput.oninput = updateCalculatedPace;

    document.getElementById('modal-close').onclick = () => this.close();
    document.getElementById('modal-cancel').onclick = () => this.close();

    document.getElementById('complete-form').onsubmit = (e) => {
      e.preventDefault();

      const dist = parseFloat(distInput.value) || 0;
      const time = timeInput.value;
      const calculatedPace = StorageService.calculatePace(dist, time);

      workout.status = document.getElementById('c-status').value;
      workout.completed = {
        distance: dist,
        time: time,
        pace: calculatedPace,
        avgHR: document.getElementById('c-avghr').value,
        maxHR: document.getElementById('c-maxhr').value,
        feeling: document.getElementById('c-feeling').value,
        notes: document.getElementById('c-notes').value
      };

      StorageService.updateWorkout(workout);
      this.close();
      if (onSaveCallback) onSaveCallback();
    };
  }

  static close() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.remove();
  }
}
