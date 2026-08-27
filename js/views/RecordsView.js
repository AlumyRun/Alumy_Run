import { StorageService } from '../services/StorageService.js';

export class RecordsView {
  constructor() {
    // Novas distâncias de referência exigidas
    this.targetDistances = [
      { label: '1 KM', distance: 1 },
      { label: '5 KM', distance: 5 },
      { label: '10 KM', distance: 10 },
      { label: '15 KM', distance: 15 },
      { label: '21,1 KM', distance: 21.1 },
      { label: '30 KM', distance: 30 },
      { label: '42,2 KM', distance: 42.2 }
    ];
  }

  render(container) {
    this.container = container;

    const workouts = StorageService.getWorkouts();
    const races = StorageService.getRaces();

    const recordsMap = this.calculatePersonalRecords(workouts, races);

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">🏆 Recordes Pessoais</h1>
          <p class="card-subtext">Seus melhores resultados e passagens calculados a partir dos treinos e provas.</p>
        </div>
      </div>

      <div class="records-grid" id="records-cards-grid"></div>

      <div class="card" style="margin-top: 24px;">
        <div class="block-header" style="margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
          <h3>Histórico de Recordes e Superações</h3>
        </div>
        <div id="records-history-list" class="recent-completed-list"></div>
      </div>
    `;

    this.renderRecordsCards(recordsMap);
    this.renderRecordsHistory(recordsMap);
  }

  calculatePersonalRecords(workouts, races) {
    const recordsMap = {};

    this.targetDistances.forEach(item => {
      recordsMap[item.label] = {
        distanceNum: item.distance,
        overallBest: null,
        workoutBest: null,
        raceBest: null,
        history: []
      };
    });

    // 1. PROCESSAR TREINOS (Com extrapolação de distâncias menores)
    workouts.forEach(w => {
      if (w.status === 'completed' && w.completed && parseFloat(w.completed.distance) > 0 && w.completed.time) {
        const dist = parseFloat(w.completed.distance);
        const timeSecs = this.parseTimeToSeconds(w.completed.time);

        if (timeSecs <= 0) return;

        const paceSecs = timeSecs / dist; // Segundos por km
        const paceStr = w.completed.pace && w.completed.pace !== '0:00' 
            ? w.completed.pace 
            : StorageService.calculatePace(dist, w.completed.time);

        // Se o treino tem distância MAIOR ou IGUAL a um RP, ele calcula a passagem
        this.targetDistances.forEach(target => {
          if (dist >= target.distance) {
            // Calcula o tempo proporcional para essa marca
            const extrapolatedTimeSecs = Math.round(target.distance * paceSecs);

            const recordEntry = {
              id: w.id,
              type: 'workout',
              sourceLabel: '🏃 Treino',
              title: dist === target.distance ? w.type : `${w.type} (Passagem em ${dist} km)`,
              date: w.date,
              distance: target.distance,
              timeStr: this.formatSecondsToTime(extrapolatedTimeSecs),
              timeSecs: extrapolatedTimeSecs,
              paceStr: paceStr
            };

            const recKey = target.label;
            const group = recordsMap[recKey];

            if (!group.workoutBest || extrapolatedTimeSecs < group.workoutBest.timeSecs) {
              group.workoutBest = recordEntry;
            }
            group.history.push(recordEntry);
          }
        });
      }
    });

    // 2. PROCESSAR PROVAS (Utilizando apenas 'resultTime' para ignorar as Metas)
    races.forEach(r => {
      if (r.resultTime && r.date) {
        const dist = parseFloat(r.distance);
        const timeSecs = this.parseTimeToSeconds(r.resultTime);

        if (timeSecs <= 0) return;

        const paceSecs = timeSecs / dist;
        const paceStr = StorageService.calculatePace(dist, r.resultTime);

        this.targetDistances.forEach(target => {
          if (dist >= target.distance) {
            const extrapolatedTimeSecs = Math.round(target.distance * paceSecs);

            const recordEntry = {
              id: r.id,
              type: 'race',
              sourceLabel: '🏁 Prova',
              title: dist === target.distance ? r.name : `${r.name} (Passagem em ${dist} km)`,
              location: r.location,
              date: r.date,
              distance: target.distance,
              timeStr: this.formatSecondsToTime(extrapolatedTimeSecs),
              timeSecs: extrapolatedTimeSecs,
              paceStr: paceStr
            };

            const recKey = target.label;
            const group = recordsMap[recKey];

            if (!group.raceBest || extrapolatedTimeSecs < group.raceBest.timeSecs) {
              group.raceBest = recordEntry;
            }
            group.history.push(recordEntry);
          }
        });
      }
    });

    // 3. DETERMINAR RP GERAL E MONTA HISTÓRICO
    Object.keys(recordsMap).forEach(key => {
      const group = recordsMap[key];

      group.history.sort((a, b) => new Date(a.date) - new Date(b.date));

      let currentBestSecs = Infinity;
      const progression = [];

      group.history.forEach(entry => {
        if (entry.timeSecs < currentBestSecs) {
          if (currentBestSecs !== Infinity) {
            const diffSecs = currentBestSecs - entry.timeSecs;
            progression.push({
              distanceLabel: key,
              previousTime: this.formatSecondsToTime(currentBestSecs),
              newTime: entry.timeStr,
              diffSecs: diffSecs,
              date: entry.date,
              title: entry.title,
              sourceLabel: entry.sourceLabel
            });
          }
          currentBestSecs = entry.timeSecs;
        }
      });

      group.progression = progression;

      if (group.workoutBest && group.raceBest) {
        group.overallBest = group.workoutBest.timeSecs <= group.raceBest.timeSecs 
          ? group.workoutBest 
          : group.raceBest;
      } else {
        group.overallBest = group.workoutBest || group.raceBest || null;
      }
    });

    return recordsMap;
  }

  renderRecordsCards(recordsMap) {
    const grid = document.getElementById('records-cards-grid');
    grid.innerHTML = '';

    let hasAnyRecord = false;

    this.targetDistances.forEach(item => {
      const group = recordsMap[item.label];
      const card = document.createElement('div');
      card.className = 'card record-card';

      if (group.overallBest) {
        hasAnyRecord = true;
        const best = group.overallBest;
        const formattedDate = new Date(best.date + 'T00:00:00').toLocaleDateString('pt-BR');

        const isRace = best.type === 'race';

        card.innerHTML = `
          <div class="record-card-header">
            <span class="record-distance-title">${item.label}</span>
            <span class="status-badge ${isRace ? 'status-completed' : 'status-planned'}">
              ${best.sourceLabel}
            </span>
          </div>

          <div class="record-card-main">
            <div class="record-time-highlight">🏆 ${best.timeStr}</div>
            <div class="record-pace-sub">Pace ${best.paceStr}/km</div>
          </div>

          <div class="record-card-details">
            <div class="record-detail-line">
              <span>Melhor resultado:</span> <strong>${best.title}</strong>
            </div>
            <div class="record-detail-line">
              <span>Data:</span> <strong>${formattedDate}</strong>
            </div>
          </div>

          <div class="record-sub-comparison">
            <div class="sub-comp-item">
              <span>RP Treino:</span>
              <strong>${group.workoutBest ? group.workoutBest.timeStr : '—'}</strong>
            </div>
            <div class="sub-comp-item">
              <span>RP Prova:</span>
              <strong>${group.raceBest ? group.raceBest.timeStr : '—'}</strong>
            </div>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="record-card-header">
            <span class="record-distance-title">${item.label}</span>
            <span class="status-badge status-missed">—</span>
          </div>

          <div class="record-card-main" style="padding: 18px 0; text-align: center;">
            <div class="record-time-empty" style="font-size: 1.5rem; color: var(--text-muted); font-weight: 700;">—</div>
            <div class="record-pace-sub" style="color: var(--text-muted);">Sem resultado registrado</div>
          </div>

          <div class="record-card-details" style="border-top: 1px dashed var(--border); padding-top: 8px;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">Conclua um treino ou prova de ${item.label} ou mais para registrar seu RP.</span>
          </div>
        `;
      }

      grid.appendChild(card);
    });

    if (!hasAnyRecord) {
      grid.insertAdjacentHTML('beforebegin', `
        <div class="card empty-state" style="margin-bottom: 20px; padding: 24px; text-align: center;">
          <p style="font-size: 0.9rem; color: var(--text-secondary);">
            Seus recordes aparecerão aqui conforme você registrar seus treinos e provas concluídos.
          </p>
        </div>
      `);
    }
  }

  renderRecordsHistory(recordsMap) {
    const historyListEl = document.getElementById('records-history-list');
    historyListEl.innerHTML = '';

    const allProgressions = [];

    Object.keys(recordsMap).forEach(key => {
      if (recordsMap[key].progression) {
        allProgressions.push(...recordsMap[key].progression);
      }
    });

    if (allProgressions.length === 0) {
      historyListEl.innerHTML = `
        <p class="empty-text">Nenhuma superação de recorde registrada até o momento.</p>
      `;
      return;
    }

    allProgressions.sort((a, b) => new Date(b.date) - new Date(a.date));

    allProgressions.forEach(prog => {
      const formattedDate = new Date(prog.date + 'T00:00:00').toLocaleDateString('pt-BR');
      const item = document.createElement('div');
      item.className = 'upcoming-item';
      item.style.justifyContent = 'space-between';

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="upcoming-date" style="background: #10b981;">🏆 ${prog.distanceLabel}</div>
          <div class="upcoming-info">
            <strong>🎉 NOVO RECORDE PESSOAL!</strong>
            <small>${prog.sourceLabel}: ${prog.title} • ${formattedDate}</small>
          </div>
        </div>
        <div style="text-align: right;">
          <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">
            ${prog.previousTime} ➔ <span style="color: #047857;">${prog.newTime}</span>
          </strong>
          <small style="color: #047857; font-weight: 700;">Melhoria de ${prog.diffSecs} segundos</small>
        </div>
      `;

      historyListEl.appendChild(item);
    });
  }

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

  formatSecondsToTime(totalSeconds) {
    if (!totalSeconds || totalSeconds <= 0) return '00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);

    const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const sStr = seconds < 10 ? `0${seconds}` : `${seconds}`;

    if (hours > 0) {
      const hStr = hours < 10 ? `0${hours}` : `${hours}`;
      return `${hStr}:${mStr}:${sStr}`;
    }

    return `${mStr}:${sStr}`;
  }
}
