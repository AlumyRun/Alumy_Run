export class StorageService {
  static STORAGE_KEY_WORKOUTS = 'runner_workouts';
  static STORAGE_KEY_PROFILE = 'runner_profile';

  static init() {
    if (!localStorage.getItem(this.STORAGE_KEY_WORKOUTS)) {
      const defaultWorkouts = [
        {
          id: 'w_1',
          date: '2026-08-27',
          type: 'Intervalado',
          status: 'planned',
          planned: { distance: 8, targetPaceMin: '3:55', targetPaceMax: '4:05' },
          completed: { distance: 0, time: '', pace: '', feeling: '' }
        },
        {
          id: 'w_2',
          date: '2026-08-28',
          type: 'Limiar',
          status: 'planned',
          planned: { distance: 10, targetPaceMin: '4:15', targetPaceMax: '4:25' },
          completed: { distance: 0, time: '', pace: '', feeling: '' }
        },
        {
          id: 'w_3',
          date: '2026-08-25',
          type: 'Rodagem Leve',
          status: 'completed',
          planned: { distance: 6, targetPaceMin: '4:40', targetPaceMax: '4:50' },
          completed: { distance: 6.1, time: '28:30', pace: '4:40', feeling: 'Ótimo' }
        }
      ];
      localStorage.setItem(this.STORAGE_KEY_WORKOUTS, JSON.stringify(defaultWorkouts));
    }

    if (!localStorage.getItem(this.STORAGE_KEY_PROFILE)) {
      const defaultProfile = {
        name: 'Rafael',
        weeklyGoalKm: 40,
        records: [
          { distance: '5 km', time: '20:38', date: '2026-05-10' },
          { distance: '10 km', time: '46:24', date: '2026-06-15' },
          { distance: '21.1 km', time: '1:42:57', date: '2026-03-20' }
        ],
        races: [
          {
            id: 'r_1',
            label: 'Prova 7k (Sub-30)',
            date: '2026-09-26',
            distance: '7 km',
            targetTime: '30:00',
            completed: false
          }
        ]
      };
      localStorage.setItem(this.STORAGE_KEY_PROFILE, JSON.stringify(defaultProfile));
    }
  }

  static getWorkouts() {
    const data = localStorage.getItem(this.STORAGE_KEY_WORKOUTS) || localStorage.getItem('alumy_workouts');
    return data ? JSON.parse(data) : [];
  }

  static saveWorkouts(workouts) {
    localStorage.setItem(this.STORAGE_KEY_WORKOUTS, JSON.stringify(workouts));
    localStorage.setItem('alumy_workouts', JSON.stringify(workouts));
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

  static getProfile() {
    const data = localStorage.getItem(this.STORAGE_KEY_PROFILE) || localStorage.getItem('alumy_profile');
    return data ? JSON.parse(data) : {};
  }

  static saveProfile(profile) {
    localStorage.setItem(this.STORAGE_KEY_PROFILE, JSON.stringify(profile));
    localStorage.setItem('alumy_profile', JSON.stringify(profile));
  }
}
