export class StorageService {
  static WORKOUTS_KEY = 'alumy_run_workouts';
  static RACES_KEY = 'alumy_run_races';

  // --- WORKOUTS (100% OFFLINE) ---
  static async getWorkouts() {
    try {
      const data = localStorage.getItem(this.WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static async saveWorkouts(workouts) {
    try {
      localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
    } catch (e) {
      console.error(e);
    }
  }

  static async addWorkout(workout) {
    const workouts = await this.getWorkouts();
    workouts.push(workout);
    await this.saveWorkouts(workouts);
  }

  static async updateWorkout(updatedWorkout) {
    const workouts = await this.getWorkouts();
    const index = workouts.findIndex(w => w.id === updatedWorkout.id);
    if (index !== -1) {
      workouts[index] = updatedWorkout;
      await this.saveWorkouts(workouts);
    }
  }

  static async deleteWorkout(id) {
    let workouts = await this.getWorkouts();
    workouts = workouts.filter(w => w.id !== id);
    await this.saveWorkouts(workouts);
  }

  // --- PROVAS (100% OFFLINE) ---
  static async getRaces() {
    try {
      const data = localStorage.getItem(this.RACES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static async saveRaces(races) {
    try {
      localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
    } catch (e) {
      console.error(e);
    }
  }

  static async addRace(race) {
    const races = await this.getRaces();
    races.push(race);
    await this.saveRaces(races);
  }

  static async updateRace(updatedRace) {
    const races = await this.getRaces();
    const index = races.findIndex(r => r.id === updatedRace.id);
    if (index !== -1) {
      races[index] = updatedRace;
      await this.saveRaces(races);
    }
  }

  static async deleteRace(id) {
    let races = await this.getRaces();
    races = races.filter(r => r.id !== id);
    await this.saveRaces(races);
  }

  static async getNextRace() {
    const races = await this.getRaces();
    const todayStr = new Date().toISOString().split('T')[0];

    const futureRaces = races
      .filter(r => r.date >= todayStr)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return futureRaces.length > 0 ? futureRaces[0] : null;
  }

  // --- FUNÇÕES AUXILIARES ---
  static getSortedWorkouts(workouts = []) {
    const todayStr = new Date().toISOString().split('T')[0];
    const future = [];
    const past = [];

    workouts.forEach(w => {
      if (w.date >= todayStr) future.push(w);
      else past.push(w);
    });

    future.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { future, past, all: [...future, ...past] };
  }

  static getDaysRemaining(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const raceDate = new Date(dateStr + 'T00:00:00');
    return Math.ceil((raceDate - today) / (1000 * 60 * 60 * 24));
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

  // Funções vazias apenas para impedir que o app quebre se tentar chamar algo da nuvem
  static async subscribeToRealtime() {}
  static notifyStatus() {}
}
