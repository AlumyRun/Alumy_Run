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
    try {
      localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
    } catch (e) {
      console.error(e);
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

  // --- RACES ---
  static getRaces() {
    try {
      const data = localStorage.getItem(this.RACES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static saveRaces(races) {
    try {
      localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
    } catch (e) {
      console.error(e);
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Métodos vazios apenas para evitar erros se outras partes do app tentarem chamar
  static subscribeToRealtime() {}
  static notifyStatus() {}
}
