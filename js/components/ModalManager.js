import { Workout } from '../models/Workout.js';

export class ModalManager {
  static openCompleteWorkoutModal(workout, onSave) {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');

    const isEditing = workout.status === 'completed';

    container.innerHTML = `
      <div class="modal-header">
        <h3>${isEditing ? 'Editar Registros do Treino' : 'Concluir Treino'}</h3>
        <button class="btn-secondary" id="btn-close-modal" style="border:none; cursor:pointer;"><i data-feather="x"></i></button>
      </div>

      <div class="card" style="margin-bottom: 16px; background: rgba(10, 14, 23, 0.5);">
        <div class="card-title">Treino Planejado</div>
        <strong>${workout.type} (${workout.date})</strong>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${workout.planned.distance} km | Target: ${workout.planned.targetPaceMin} - ${workout.planned.targetPaceMax}/km</p>
        <p style="font-size: 0.8rem; margin-top: 4px;">${workout.planned.description}</p>
      </div>

      <form id="form-complete-workout">
        <div class="form-row">
          <div class="form-group">
            <label>Distância Realizada (km)</label>
            <input type="number" step="0.01" id="m-dist" class="form-control" value="${workout.completed?.distance || workout.planned.distance}" required>
          </div>
          <div class="form-group">
            <label>Tempo Total (hh:mm:ss ou mm:ss)</label>
            <input type="text" id="m-time" class="form-control" placeholder="Ex: 35:20" value="${workout.completed?.time || ''}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Pace Médio (Auto)</label>
            <input type="text" id="m-pace" class="form-control" placeholder="--:--" value="${workout.completed?.pace || '--:--'}" readonly>
          </div>
          <div class="form-group">
            <label>Sensação do Treino</label>
            <select id="m-feeling" class="form-control">
              <option value="🔥 Muito fácil" ${workout.completed?.feeling === '🔥 Muito fácil' ? 'selected' : ''}>🔥 Muito fácil</option>
              <option value="🙂 Fácil" ${workout.completed?.feeling === '🙂 Fácil' ? 'selected' : ''}>🙂 Fácil</option>
              <option value="😐 Moderado" ${workout.completed?.feeling === '😐 Moderado' || !workout.completed ? 'selected' : ''}>😐 Moderado</option>
              <option value="😣 Difícil" ${workout.completed?.feeling === '😣 Difícil' ? 'selected' : ''}>😣 Difícil</option>
              <option value="😫 Muito difícil" ${workout.completed?.feeling === '😫 Muito difícil' ? 'selected' : ''}>😫 Muito difícil</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>FC Média (bpm)</label>
            <input type="number" id="m-hr" class="form-control" placeholder="Ex: 154" value="${workout.completed?.avgHR || ''}">
          </div>
          <div class="form-group">
            <label>FC Máxima (bpm)</label>
            <input type="number" id="m-max-hr" class="form-control" placeholder="Ex: 172" value="${workout.completed?.maxHR || ''}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Elevação (m)</label>
            <input type="number" id="m-elev" class="form-control" placeholder="Ex: 45" value="${workout.completed?.elevation || ''}">
          </div>
          <div class="form-group">
            <label>Calorias (kcal)</label>
            <input type="number" id="m-cal" class="form-control" placeholder="Ex: 520" value="${workout.completed?.calories || ''}">
          </div>
        </div>

        <div class="form-group">
          <label>Observações</label>
          <textarea id="m-notes" class="form-control" rows="2" placeholder="Notas sobre o treino...">${workout.completed?.notes || ''}</textarea>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button type="submit" class="btn" style="flex:1;">Salvar Registro</button>
        </div>
      </form>
    `;

    overlay.classList.add('active');
    if (window.feather) feather.replace();

    // Auto calculate pace
    const distEl = document.getElementById('m-dist');
    const timeEl = document.getElementById('m-time');
    const paceEl = document.getElementById('m-pace');

    const updatePace = () => {
      const d = parseFloat(distEl.value);
      const t = timeEl.value;
      paceEl.value = Workout.calculatePace(d, t);
    };

    distEl.addEventListener('input', updatePace);
    timeEl.addEventListener('input', updatePace);

    document.getElementById('btn-close-modal').onclick = () => overlay.classList.remove('active');

    document.getElementById('form-complete-workout').onsubmit = (e) => {
      e.preventDefault();
      const dist = parseFloat(distEl.value);
      const time = timeEl.value;
      const pace = Workout.calculatePace(dist, time);

      workout.status = 'completed';
      workout.completed = {
        distance: dist,
        time: time,
        pace: pace,
        feeling: document.getElementById('m-feeling').value,
        avgHR: parseInt(document.getElementById('m-hr').value) || null,
        maxHR: parseInt(document.getElementById('m-max-hr').value) || null,
        elevation: parseInt(document.getElementById('m-elev').value) || null,
        calories: parseInt(document.getElementById('m-cal').value) || null,
        notes: document.getElementById('m-notes').value
      };

      overlay.classList.remove('active');
      onSave(workout);
    };
  }

  static openAddWorkoutModal(onSave) {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');

    container.innerHTML = `
      <div class="modal-header">
        <h3>Agendar Novo Treino</h3>
        <button class="btn-secondary" id="btn-close-modal" style="border:none; cursor:pointer;"><i data-feather="x"></i></button>
      </div>

      <form id="form-add-workout">
        <div class="form-row">
          <div class="form-group">
            <label>Data</label>
            <input type="date" id="add-date" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Tipo de Treino</label>
            <select id="add-type" class="form-control" required>
              <option value="Rodagem leve">Rodagem leve</option>
              <option value="Recuperação">Recuperação</option>
              <option value="Longão">Longão</option>
              <option value="Limiar">Limiar</option>
              <option value="Intervalado">Intervalado</option>
              <option value="Progressivo">Progressivo</option>
              <option value="Ritmo de prova">Ritmo de prova</option>
              <option value="Regenerativo">Regenerativo</option>
              <option value="Descanso">Descanso</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Distância Planejada (km)</label>
            <input type="number" step="0.1" id="add-dist" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Pace Alvo (ex: 04:20-04:30)</label>
            <input type="text" id="add-pace" class="form-control" placeholder="04:20-04:30" required>
          </div>
        </div>

        <div class="form-group">
          <label>Estrutura / Descrição</label>
          <input type="text" id="add-desc" class="form-control" placeholder="Ex: 2km aquec + 4x1km + 2km desaquec" required>
        </div>

        <div class="form-group">
          <label>Objetivo</label>
          <input type="text" id="add-obj" class="form-control" placeholder="Ex: Manter resistência" required>
        </div>

        <button type="submit" class="btn" style="width: 100%; margin-top: 12px;">Agendar Treino</button>
      </form>
    `;

    overlay.classList.add('active');
    if (window.feather) feather.replace();

    document.getElementById('btn-close-modal').onclick = () => overlay.classList.remove('active');

    document.getElementById('form-add-workout').onsubmit = (e) => {
      e.preventDefault();
      const paceParts = document.getElementById('add-pace').value.split('-');
      
      const newW = new Workout({
        date: document.getElementById('add-date').value,
        type: document.getElementById('add-type').value,
        status: 'planned',
        planned: {
          distance: parseFloat(document.getElementById('add-dist').value),
          targetPaceMin: paceParts[0] || '04:00',
          targetPaceMax: paceParts[1] || '04:30',
          description: document.getElementById('add-desc').value,
          objective: document.getElementById('add-obj').value
        }
      });

      overlay.classList.remove('active');
      onSave(newW);
    };
  }
}
