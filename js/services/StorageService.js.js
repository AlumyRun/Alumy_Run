export class StorageService {
  static WORKOUTS_KEY = 'alumy_run_workouts';
  static RACES_KEY = 'alumy_run_races';

  // --- WORKOUTS ---
  static getWorkouts() {
    try {
      const data = localStorage.getItem(this.WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler Workouts do LocalStorage', e);
      return [];
    }
  }

  static saveWorkouts(workouts) {
    try {
      localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
    } catch (e) {
      console.error('Erro ao salvar Workouts no LocalStorage', e);
    }
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
      if (w.date >= todayStr) {
        future.push(w);
      } else {
        past.push(w);
      }
    });

    future.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { future, past, all: [...future, ...past] };
  }

  static calculatePace(distanceKm, timeStr) {
    if (!distanceKm || !timeStr) return '0:00';
    const parts = timeStr.split(':').map(Number);
    let totalSeconds = 0;

    if (parts.length === 3) {
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      totalSeconds = parts[0] * 60 + parts[1];
    } else {
      return '0:00';
    }

    if (totalSeconds <= 0 || distanceKm <= 0) return '0:00';

    const paceSecTotal = totalSeconds / distanceKm;
    const paceMin = Math.floor(paceSecTotal / 60);
    const paceSec = Math.round(paceSecTotal % 60);

    return `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;
  }

  // --- RACES (PROVAS) ---
  static getRaces() {
    this.initRaces();
    try {
      const data = localStorage.getItem(this.RACES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler Races do LocalStorage', e);
      return [];
    }
  }

  static saveRaces(races) {
    try {
      localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
    } catch (e) {
      console.error('Erro ao salvar Races no LocalStorage', e);
    }
  }

  static initRaces() {
    let races = [];
    try {
      const data = localStorage.getItem(this.RACES_KEY);
      if (data) races = JSON.parse(data);
    } catch (e) {
      races = [];
    }

    const defaultRaces = [
      {
        id: 'race_toca_raul_2026',
        name: 'Corrida Toca Raul 2026',
        date: '2026-09-26',
        distance: 7,
        targetTime: '00:30:00',
        location: 'Caieiras/SP',
        notes: 'Prova de 7 km — objetivo Sub-30.'
      },
      {
        id: 'race_climb_city_2026',
        name: 'CLIMB THE CITY RUN 2026',
        date: '2026-09-27',
        distance: 5,
        targetTime: '00:20:00',
        location: 'Francisco Morato/SP',
        notes: 'Prova de 5 km — objetivo Sub-20.'
      }
    ];

    let hasChanges = false;
    defaultRaces.forEach(defRace => {
      const exists = races.some(r => r.name === defRace.name || r.id === defRace.id);
      if (!exists) {
        races.push(defRace);
        hasChanges = true;
      }
    });

    if (hasChanges || !localStorage.getItem(this.RACES_KEY)) {
      this.saveRaces(races);
    }
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}