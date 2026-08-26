export class StorageService {
  static STORAGE_KEY = 'alumy_run_workouts';

  static getWorkouts() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler LocalStorage', e);
      return [];
    }
  }

  static saveWorkouts(workouts) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workouts));
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage', e);
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

  // Utilitário de ordenação de treinos
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

    // Futuros: mais próximo -> mais distante
    future.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Passados: mais recente -> mais antigo
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { future, past, all: [...future, ...past] };
  }

  // Cálculo automático de Pace Médio Real
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
}