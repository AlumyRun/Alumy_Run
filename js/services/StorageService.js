export class StorageService {
  // Suporte e leitura segura para chaves antigas e novas
  static getWorkouts() {
    try {
      const data = localStorage.getItem('runner_workouts') || localStorage.getItem('alumy_workouts');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Erro ao ler treinos do LocalStorage:', e);
    }
    return [];
  }

  static saveWorkouts(workouts) {
    try {
      const json = JSON.stringify(workouts);
      localStorage.setItem('runner_workouts', json);
      localStorage.setItem('alumy_workouts', json);
    } catch (e) {
      console.error('Erro ao salvar treinos no LocalStorage:', e);
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

  static getProfile() {
    try {
      const data = localStorage.getItem('runner_profile') || localStorage.getItem('alumy_profile');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Erro ao ler perfil do LocalStorage:', e);
    }
    return {
      name: 'Rafael',
      weeklyGoalKm: 40,
      records: [
        { distance: '5 km', time: '20:38', date: '2026-05-10' },
        { distance: '10 km', time: '46:24', date: '2026-06-15' },
        { distance: '21.1 km', time: '1:42:57', date: '2026-03-20' }
      ],
      races: [
        { id: 'r1', label: 'Prova 7k', date: '2026-09-26', distance: '7 km', targetTime: '30:00', completed: false }
      ]
    };
  }

  static saveProfile(profile) {
    try {
      const json = JSON.stringify(profile);
      localStorage.setItem('runner_profile', json);
      localStorage.setItem('alumy_profile', json);
    } catch (e) {
      console.error('Erro ao salvar perfil no LocalStorage:', e);
    }
  }

  static init() {
    // Garante inicialização sem sobrescrever dados do usuário
    const workouts = this.getWorkouts();
    if (!workouts || workouts.length === 0) {
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
        }
      ];
      this.saveWorkouts(defaultWorkouts);
    }

    const profile = this.getProfile();
    this.saveProfile(profile);
  }
}
