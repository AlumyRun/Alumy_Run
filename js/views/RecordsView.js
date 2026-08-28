import { StorageService } from '../services/StorageService.js';

export class RecordsView {
  async render(container) {
    this.container = container;
    
    let workouts = [];
    let races = [];
    
    try {
      workouts = await StorageService.getWorkouts();
      races = await StorageService.getRaces();
    } catch (e) {
      console.warn("Erro ao buscar dados do Supabase na RecordsView:", e);
    }

    const completedWorkouts = (workouts || []).filter(w => w && w.status === 'completed' && w.completed);
    const completedRaces = (races || []).filter(r => r && r.status === 'completed' && r.resultTime && r.resultDistance);

    // Unifica treinos e provas concluídas
    const allActivities = [
      ...completedWorkouts.map(w => ({
        id: w.id,
        name: w.type || 'Treino',
        date: w.date,
        distance: parseFloat(w.completed.distance) || 0,
        time: w.completed.time || '00:00:00',
        pace: w.completed.pace || StorageService.calculatePace(parseFloat(w.completed.distance), w.completed.time),
        type: 'workout'
      })),
      ...completedRaces.map(r => ({
        id: r.id,
        name: r.name,
        date: r.date,
        distance: parseFloat(r.resultDistance) || 0,
        time: r.resultTime || '00:00:00',
        pace: StorageService.calculatePace(parseFloat(r.resultDistance), r.resultTime),
        type: 'race'
      }))
    ];

    const distancesDef = [
      { key: '5k', label: '5 KM', targetKm: 5, tolerance: 0.6 },
      { key: '10k', label: '10 KM', targetKm: 10, tolerance: 0.8 },
      { key: '21k', label: '21 KM (MEIA MARATONA)', targetKm: 21.097, tolerance: 1.2 },
      { key: '42k', label: '42 KM (MARATONA)', targetKm: 42.195, tolerance: 2.0 }
    ];

    container.innerHTML = `
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Recordes Pessoais (RPs)</h1>
          <p class="card-subtext">Seus melhores tempos históricos validados por provas e treinos.</p>
        </div>
      </div>

      <div class="records-grid" id="records-cards-container"></div>
    `;

    const grid = document.getElementById('records-cards-container');
    grid.innerHTML = '';

    distancesDef.forEach(def => {
      // Busca atividades que se enquadram na tolerância da distância
      const matches = allActivities.filter(a => Math.abs(a.distance - def.targetKm) <= def.tolerance);

      let bestRecord = null;
      let bestSeconds = Infinity;

      matches.forEach(act => {
        const secs = this.parseTimeToSeconds(act.time);
        if (secs > 0 && secs < bestSeconds) {
          bestSeconds = secs;
          bestRecord = act;
        }
      });

      const card = document.createElement('div');
      card.className = 'card record-card';

      if (bestRecord) {
        const formattedDate = new Date(bestRecord.date + 'T00:00:00').toLocaleDateString('pt-BR');
        const badgeType = bestRecord.type === 'race' ? '🏁 PROVA' : '🏃 TREINO';

        card.innerHTML = `
          <div class="record-card-header">
            <span class="record-distance-title">${def.label}</span>
            <span class="status-badge status-completed">${badgeType}</span>
          </div>
          <div class="record-time-highlight">${bestRecord.time}</div>
          <div class="record-pace-sub">Pace Médio: <strong>${bestRecord.pace}/km</strong></div>
          
          <div style="border-top: 1px dashed var(--border); padding-top: 12px; margin-top: 12px;">
            <div class="record-detail-line">
              <span>Atividade:</span>
              <strong>${bestRecord.name}</strong>
            </div>
            <div class="record-detail-line">
              <span>Distância Real:</span>
              <strong>${bestRecord.distance.toFixed(2).replace('.', ',')} km</strong>
            </div>
            <div class="record-detail-line">
              <span>Data Conquista:</span>
              <strong>${formattedDate}</strong>
            </div>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="record-card-header">
            <span class="record-distance-title">${def.label}</span>
            <span class="status-badge" style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1;">PENDENTE</span>
          </div>
          <div class="record-time-highlight" style="color: var(--text-muted);">--:--:--</div>
          <div class="record-pace-sub">Pace Médio: <strong>--/km</strong></div>
          <div class="record-sub-comparison">
            <span>Nenhuma atividade registrada próximo a esta distância.</span>
          </div>
        `;
      }

      grid.appendChild(card);
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
}
