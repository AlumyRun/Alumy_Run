import { StorageService } from '../services/StorageService.js';
import { Workout } from '../models/Workout.js';

export class RacesView {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    const profile = StorageService.getProfile();
    const races = profile.races || [];

    // ORDENAÇÃO AUTOMÁTICA DAS PROVAS POR DATA
    races.sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Provas & Metas</h1>
          <p class="card-subtext">Calendário de corridas oficiais e cálculo automático de pace.</p>
        </div>
        <button class="btn" id="btn-add-race"><i data-feather="plus"></i> Adicionar Prova</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;" id="races-list"></div>
    `;

    document.getElementById('btn-add-race').onclick = () => this.openRaceModal();

    const listEl = document.getElementById('races-list');

    if (races.length === 0) {
      listEl.innerHTML = `<div class="card" style="text-align:center; color: var(--text-muted);">Nenhuma prova cadastrada.</div>`;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    races.forEach(r => {
      const parts = r.date.split('-');
      const raceDate = new Date(parts[0], parts[1] - 1, parts[2]);
      raceDate.setHours(0, 0, 0, 0);

      const diffTime = raceDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let countdownText = `🏁 FALTAM ${diffDays} DIAS`;
      if (diffDays === 0) countdownText = 'É HOJE! 🏁';
      if (diffDays < 0) countdownText = 'PROVA CONCLUÍDA';

      const distNum = parseFloat(r.distance) || 0;
      const requiredPace = Workout.calculatePace(distNum, r.targetTime);

      const card = document.createElement('div');
      card.className = 'card card-dark-feature';
      card.setAttribute('data-id', r.id);
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <span class="badge badge-planned" style="background: rgba(255,255,255,0.15); color: #ffffff;">${countdownText}</span>
            <h3 style="margin-top: 8px; font-size: 1.25rem; color: #ffffff;">${r.label}</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">📅 ${r.date} • 📍 ${r.location || 'Brasil'} • 📏 ${r.distance}</p>
          </div>
          <div style="text-align: right;">
            <div class="card-title" style="color: #94a3b8;">Meta de Tempo</div>
            <div class="card-value" style="color: #10b981;">${r.targetTime}</div>
            <div style="font-size: 0.8rem; color: #60a5fa; margin-top: 2px;">Pace Alvo: <strong>${requiredPace}/km</strong></div>
          </div>
        </div>

        ${r.completed ? `
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; color: #10b981;">
            ✅ <strong>Resultado Registrado:</strong> Tempo Realizado: ${r.result.time} | Pace Real: ${r.result.pace}/km
          </div>
        ` : ''}

        <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: flex-end;">
          ${!r.completed ? `<button class="btn btn-secondary btn-complete-race"><i data-feather="check-circle"></i> Registrar Resultado</button>` : ''}
          <button class="btn btn-secondary btn-edit-race"><i data-feather="edit"></i> Editar</button>
          <button class="btn btn-danger btn-delete-race"><i data-feather="trash-2"></i> Excluir</button>
        </div>
      `;

      card.querySelector('.btn-edit-race').onclick = () => this.openRaceModal(r);

      card.querySelector('.btn-delete-race').onclick = () => {
        if (confirm(`Tem certeza que deseja excluir a prova "${r.label}"?`)) {
          profile.races = profile.races.filter(item => item.id !== r.id);
          StorageService.saveProfile(profile);
          this.app.reloadCurrentView();
        }
      };

      if (card.querySelector('.btn-complete-race')) {
        card.querySelector('.btn-complete-race').onclick = () => this.openResultModal(r);
      }

      listEl.appendChild(card);
    });
  }

  openRaceModal(raceToEdit = null) {
    const profile = StorageService.getProfile();
    const isEdit = !!raceToEdit;

    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');

    container.innerHTML = `
      <div class="modal-header">
        <h3>${isEdit ? 'Editar Prova' : 'Adicionar Nova Prova'}</h3>
        <button class="header-icon-btn" id="modal-close">✕</button>
      </div>
      <form id="race-form">
        <div class="form-group">
          <label>Nome da Prova *</label>
          <input type="text" class="form-control" id="race-label" value="${raceToEdit ? raceToEdit.label : ''}" required placeholder="Ex: Corrida Internacional de São Paulo">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Data da Prova *</label>
            <input type="date" class="form-control" id="race-date" value="${raceToEdit ? raceToEdit.date : ''}" required>
          </div>
          <div class="form-group">
            <label>Distância *</label>
            <input type="text" class="form-control" id="race-distance" value="${raceToEdit ? raceToEdit.distance : '7 km'}" required placeholder="Ex: 7 km">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Meta de Tempo *</label>
            <input type="text" class="form-control" id="race-target" value="${raceToEdit ? raceToEdit.targetTime : '30:00'}" required placeholder="Ex: 30:00">
          </div>
          <div class="form-group">
            <label>Local da Prova</label>
            <input type="text" class="form-control" id="race-location" value="${raceToEdit ? raceToEdit.location || '' : ''}" placeholder="Ex: São Paulo - SP">
          </div>
        </div>
        <div style="display:flex; justify-content: flex-end; gap: 10px; margin-top: 18px;">
          <button type="button" class="btn btn-secondary" id="race-cancel">Cancelar</button>
          <button type="submit" class="btn">Salvar Prova</button>
        </div>
      </form>
    `;

    overlay.classList.add('active');

    const closeModal = () => overlay.classList.remove('active');
    document.getElementById('modal-close').onclick = closeModal;
    document.getElementById('race-cancel').onclick = closeModal;

    document.getElementById('race-form').onsubmit = (e) => {
      e.preventDefault();
      const label = document.getElementById('race-label').value;
      const date = document.getElementById('race-date').value;
      const distance = document.getElementById('race-distance').value;
      const targetTime = document.getElementById('race-target').value;
      const location = document.getElementById('race-location').value;

      if (isEdit) {
        const idx = profile.races.findIndex(item => item.id === raceToEdit.id);
        if (idx !== -1) {
          profile.races[idx] = { ...profile.races[idx], label, date, distance, targetTime, location };
        }
      } else {
        profile.races.push({
          id: `r_${Date.now()}`,
          label, date, distance, targetTime, location,
          completed: false, result: null
        });
      }

      StorageService.saveProfile(profile);
      closeModal();
      this.app.reloadCurrentView();
    };
  }

  openResultModal(race) {
    const profile = StorageService.getProfile();
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');

    container.innerHTML = `
      <div class="modal-header">
        <h3>Registrar Resultado: ${race.label}</h3>
        <button class="header-icon-btn" id="modal-close">✕</button>
      </div>
      <form id="result-form">
        <div class="form-row">
          <div class="form-group">
            <label>Tempo Realizado *</label>
            <input type="text" class="form-control" id="res-time" required placeholder="Ex: 29:42">
          </div>
          <div class="form-group">
            <label>Distância Percorrida (km) *</label>
            <input type="number" step="0.01" class="form-control" id="res-dist" value="${parseFloat(race.distance)}" required>
          </div>
        </div>
        <div style="display:flex; justify-content: flex-end; gap: 10px; margin-top: 18px;">
          <button type="button" class="btn btn-secondary" id="res-cancel">Cancelar</button>
          <button type="submit" class="btn">Salvar Resultado</button>
        </div>
      </form>
    `;

    overlay.classList.add('active');

    const closeModal = () => overlay.classList.remove('active');
    document.getElementById('modal-close').onclick = closeModal;
    document.getElementById('res-cancel').onclick = closeModal;

    document.getElementById('result-form').onsubmit = (e) => {
      e.preventDefault();
      const time = document.getElementById('res-time').value;
      const dist = parseFloat(document.getElementById('res-dist').value);

      const calculatedPace = Workout.calculatePace(dist, time);

      const idx = profile.races.findIndex(item => item.id === race.id);
      if (idx !== -1) {
        profile.races[idx].completed = true;
        profile.races[idx].result = { time, distance: dist, pace: calculatedPace };
      }

      StorageService.saveProfile(profile);
      closeModal();
      this.app.reloadCurrentView();
    };
  }
}
