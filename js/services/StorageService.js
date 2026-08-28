export class StorageService {
  static WORKOUTS_KEY = 'alumy_run_workouts';
  static RACES_KEY = 'alumy_run_races';

  // --- WORKOUTS ---
  static getWorkouts() {
    try {
      const data = localStorage.getItem(this.WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static saveWorkouts(workouts) {
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  static addWorkout(workout) {
    const workouts = this.getWorkouts();
    workouts.push(workout);
    this.saveWorkouts(workouts);
  }

  static updateWorkout(updatedWorkout) {
    const workouts = this.getWorkouts();
    const index = workouts.findIndex(w => w.id === updatedWorkout.id);
    if (index !== -1) {
      workouts[index] = updatedWorkout;
      this.saveWorkouts(workouts);
    }
  }

  static deleteWorkout(id) {
    let workouts = this.getWorkouts();
    workouts = workouts.filter(w => w.id !== id);
    this.saveWorkouts(workouts);
  }

  static getSortedWorkouts(workouts = null) {
    const list = workouts || this.getWorkouts();
    const todayStr = new Date().toISOString().split('T')[0];

    const future = [];
    const past = [];

    list.forEach(w => {
      if (w.date >= todayStr) future.push(w);
      else past.push(w);
    });

    future.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { future, past, all: [...future, ...past] };
  }

  static calculatePace(distanceKm, timeStr) {
    if (!distanceKm || !timeStr) return '0:00';
    const cleanStr = timeStr.toString().trim();
    let totalSeconds = 0;

    if (!cleanStr.includes(':')) {
      const minutesOnly = parseFloat(cleanStr);
      if (isNaN(minutesOnly) || minutesOnly <= 0) return '0:00';
      totalSeconds = minutesOnly * 60;
    } else {
      const parts = cleanStr.split(':').map(Number);
      if (parts.some(isNaN)) return '0:00';
      if (parts.length === 3) totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      else if (parts.length === 2) totalSeconds = parts[0] * 60 + parts[1];
    }

    if (totalSeconds <= 0 || distanceKm <= 0) return '0:00';

    const paceSecTotal = totalSeconds / distanceKm;
    const paceMin = Math.floor(paceSecTotal / 60);
    const paceSec = Math.round(paceSecTotal % 60);

    return `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;
  }

  // --- PROVAS ---
  static getRaces() {
    try {
      const data = localStorage.getItem(this.RACES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static saveRaces(races) {
    localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
  }

  static addRace(race) {
    const races = this.getRaces();
    races.push(race);
    this.saveRaces(races);
  }

  static updateRace(updatedRace) {
    const races = this.getRaces();
    const index = races.findIndex(r => r.id === updatedRace.id);
    if (index !== -1) {
      races[index] = updatedRace;
      this.saveRaces(races);
    }
  }

  static deleteRace(id) {
    let races = this.getRaces();
    races = races.filter(r => r.id !== id);
    this.saveRaces(races);
  }

  static getNextRace() {
    const races = this.getRaces();
    const todayStr = new Date().toISOString().split('T')[0];

    const futureRaces = races
      .filter(r => r.date >= todayStr)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return futureRaces.length > 0 ? futureRaces[0] : null;
  }

  static getDaysRemaining(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const raceDate = new Date(dateStr + 'T00:00:00');
    const diffTime = raceDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // --- INJEÇÃO DA PLANILHA (RODA 1 VEZ) ---
  static seedTrainingPlan() {
    if (localStorage.getItem('plan_seeded_toca_raul_2026')) return;

    let workouts = this.getWorkouts();
    
    const plan = [
      { id: 'plan_2026_08_25', date: '2026-08-25', type: 'Descanso', status: 'rest', planned: { distance: 0, description: 'Descanso após meia maratona de 21,1 km.' } },
      { id: 'plan_2026_08_26', date: '2026-08-26', type: 'Descanso', status: 'rest', planned: { distance: 0, description: 'Descanso e recuperação pós-meia maratona.' } },
      { id: 'plan_2026_08_27', date: '2026-08-27', type: 'Regenerativo', status: 'planned', planned: { distance: 5, paceMin: '5:30', paceMax: '6:00', description: '5 km muito leves. Corrida regenerativa após a meia maratona.', objective: 'Recuperação ativa e retorno gradual à corrida.' } },
      { id: 'plan_2026_08_28', date: '2026-08-28', type: 'Rodagem leve', status: 'planned', planned: { distance: 5, paceMin: '5:20', paceMax: '5:45', description: '5 km leves e confortáveis.' } },
      { id: 'plan_2026_08_29', date: '2026-08-29', type: 'Descanso', status: 'rest', planned: { distance: 0 } },
      { id: 'plan_2026_08_30', date: '2026-08-30', type: 'Longão leve', status: 'planned', planned: { distance: 8, paceMin: '5:15', paceMax: '5:40', description: '8 km leves. Sem progressão e sem velocidade.', objective: 'Retomar resistência sem gerar fadiga excessiva.' } },
      { id: 'plan_2026_08_31', date: '2026-08-31', type: 'Rodagem leve', status: 'planned', planned: { distance: 6, paceMin: '5:15', paceMax: '5:40' } },
      { id: 'plan_2026_09_01', date: '2026-09-01', type: 'Intervalado', status: 'planned', planned: { distance: 8, isKeyWorkout: true, description: '2 km aquecimento\n5 × 800 m @ 3:55–4:00/km\n400 m trotando entre cada tiro\nDesaquecimento até completar aproximadamente 8 km.', objective: 'Começar a tornar o ritmo próximo de 3:55/km mais controlado.' } },
      { id: 'plan_2026_09_02', date: '2026-09-02', type: 'Recuperação', status: 'planned', planned: { distance: 5, paceMin: '5:30', paceMax: '6:00' } },
      { id: 'plan_2026_09_03', date: '2026-09-03', type: 'Limiar', status: 'planned', planned: { distance: 8, description: '2 km leve\n4 km @ 4:25–4:30/km\n2 km leve', objective: 'Desenvolver capacidade de sustentar ritmo forte de maneira controlada.' } },
      { id: 'plan_2026_09_04', date: '2026-09-04', type: 'Rodagem leve', status: 'planned', planned: { distance: 5, paceMin: '5:20', paceMax: '5:50' } },
      { id: 'plan_2026_09_05', date: '2026-09-05', type: 'Descanso', status: 'rest', planned: { distance: 0 } },
      { id: 'plan_2026_09_06', date: '2026-09-06', type: 'Longão progressivo', status: 'planned', planned: { distance: 11, description: 'Primeiros 8 km: 5:15–5:35/km\nÚltimos 3 km: 4:50–5:00/km', objective: 'Trabalhar resistência e capacidade de acelerar com fadiga.' } },
      { id: 'plan_2026_09_07', date: '2026-09-07', type: 'Rodagem leve', status: 'planned', planned: { distance: 6, paceMin: '5:15', paceMax: '5:40' } },
      { id: 'plan_2026_09_08', date: '2026-09-08', type: 'Intervalado', status: 'planned', planned: { distance: 9, isKeyWorkout: true, description: '2 km aquecimento\n5 × 1 km @ 3:55–4:00/km\n2 min de trote entre os tiros\nDesaquecimento', objective: 'Aumentar a capacidade de sustentar ritmos próximos ao ritmo de 5 km.' } },
      { id: 'plan_2026_09_09', date: '2026-09-09', type: 'Recuperação', status: 'planned', planned: { distance: 5, paceMin: '5:30', paceMax: '6:00' } },
      { id: 'plan_2026_09_10', date: '2026-09-10', type: 'Ritmo específico', status: 'planned', planned: { distance: 9, description: '2 km leve\n5 km @ 4:15–4:20/km\n2 km leve', objective: 'Aproximar gradualmente o corpo do ritmo necessário para os 7 km.' } },
      { id: 'plan_2026_09_11', date: '2026-09-11', type: 'Regenerativo', status: 'planned', planned: { distance: 5, paceMin: '5:30', paceMax: '6:00' } },
      { id: 'plan_2026_09_12', date: '2026-09-12', type: 'Descanso', status: 'rest', planned: { distance: 0 } },
      { id: 'plan_2026_09_13', date: '2026-09-13', type: 'Longão progressivo', status: 'planned', planned: { distance: 12, description: '7 km @ 5:20–5:30/km\n3 km @ 4:55–5:05/km\n2 km @ 4:35–4:45/km', objective: 'Desenvolver resistência e capacidade de acelerar sob fadiga.' } },
      { id: 'plan_2026_09_14', date: '2026-09-14', type: 'Rodagem leve', status: 'planned', planned: { distance: 6 } },
      { id: 'plan_2026_09_15', date: '2026-09-15', type: 'Intervalado', status: 'planned', planned: { distance: 9, isKeyWorkout: true, description: '2 km aquecimento\n6 × 800 m @ 3:50–3:55/km\n400 m trotando entre os tiros\nDesaquecimento', objective: 'Transformar o ritmo que anteriormente era limite em um ritmo mais familiar e controlado.' } },
      { id: 'plan_2026_09_16', date: '2026-09-16', type: 'Recuperação', status: 'planned', planned: { distance: 5, paceMin: '5:30', paceMax: '6:00' } },
      { id: 'plan_2026_09_17', date: '2026-09-17', type: 'Ritmo específico 7K', status: 'planned', planned: { distance: 9, isKeyWorkout: true, description: '2 km leve\n4 km @ 4:08–4:12/km\n3 km leve', objective: 'Treino específico para a meta de 29:00 nos 7 km.' } },
      { id: 'plan_2026_09_18', date: '2026-09-18', type: 'Rodagem leve', status: 'planned', planned: { distance: 5 } },
      { id: 'plan_2026_09_19', date: '2026-09-19', type: 'Descanso', status: 'rest', planned: { distance: 0 } },
      { id: 'plan_2026_09_20', date: '2026-09-20', type: 'Longão confortável', status: 'planned', planned: { distance: 10, paceMin: '5:10', paceMax: '5:30', description: 'Longão confortável. Sem progressão.', objective: 'Reduzir a carga e iniciar o período de polimento para as provas.' } },
      { id: 'plan_2026_09_21', date: '2026-09-21', type: 'Rodagem leve', status: 'planned', planned: { distance: 6, paceMin: '5:15', paceMax: '5:40' } },
      { id: 'plan_2026_09_22', date: '2026-09-22', type: 'Último estímulo de velocidade', status: 'planned', planned: { distance: 6.5, isKeyWorkout: true, description: '2 km leve\n3 × 1 km @ 3:55–4:05/km\n2 min de trote entre os tiros\nDesaquecimento', objective: 'Último estímulo antes das provas. NÃO DEVE GERAR EXAUSTÃO.' } },
      { id: 'plan_2026_09_23', date: '2026-09-23', type: 'Regenerativo', status: 'planned', planned: { distance: 5, paceMin: '5:30', paceMax: '6:00' } },
      { id: 'plan_2026_09_24', date: '2026-09-24', type: 'Rodagem + acelerações', status: 'planned', planned: { distance: 4, description: '4 km leve\n4 × 80–100 m de aceleração\nAs acelerações devem ser rápidas, porém controladas. Não são tiros máximos.', objective: 'Ativar a musculatura sem gerar fadiga.' } },
      { id: 'plan_2026_09_25', date: '2026-09-25', type: 'Descanso', status: 'rest', planned: { distance: 0, description: 'Descanso total. Guardar energia para a primeira prova.' } }
    ];

    // Injeta os treinos no array se eles não existirem (evitando duplicação)
    plan.forEach(p => {
      if (!workouts.some(w => w.id === p.id)) {
        workouts.push(p);
      }
    });

    this.saveWorkouts(workouts);
    localStorage.setItem('plan_seeded_toca_raul_2026', 'true');
  }
}
