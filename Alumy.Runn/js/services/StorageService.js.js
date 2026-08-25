import { Athlete } from '../models/Athlete.js';
import { Workout } from '../models/Workout.js';

export class StorageService {
  static KEYS = {
    PROFILE: 'runner_profile_v2',
    WORKOUTS: 'runner_workouts_v2'
  };

  static init() {
    if (!localStorage.getItem(this.KEYS.PROFILE)) {
      const defaultAthlete = new Athlete({
        name: 'Rafael',
        records: {
          '5 km': '20:38',
          '10 km': '46:24',
          '21,1 km': '1:42:57'
        },
        weeklyVolume: 25,
        weeklyFrequency: 3,
        races: [
          { id: 'r1', date: '2026-09-26', distance: '7 km', targetTime: '30:00', label: 'Prova de 7k (Sub-30)' },
          { id: 'r2', date: '2026-09-27', distance: '5 km', targetTime: '20:00', label: 'Prova de 5k (Sub-20)' }
        ]
      });
      this.saveProfile(defaultAthlete);
    }

    if (!localStorage.getItem(this.KEYS.WORKOUTS)) {
      // Plano Inicial Estruturado (25/08/2026 até 27/09/2026)
      const defaultWorkouts = [
        {
          id: 'w_20260825',
          date: '2026-08-25',
          type: 'Rodagem leve',
          status: 'planned',
          planned: {
            distance: 6.0,
            targetPaceMin: '05:10',
            targetPaceMax: '05:25',
            description: '6 km contínuos em ritmo confortável.',
            objective: 'Manter a base aeróbica sem gerar fadiga.'
          }
        },
        {
          id: 'w_20260827',
          date: '2026-08-27',
          type: 'Intervalado',
          status: 'planned',
          planned: {
            distance: 8.0,
            targetPaceMin: '03:55',
            targetPaceMax: '04:05',
            description: '2 km aquecimento + 4 × 1 km @ 3:55–4:05/km (2 min rec) + 2 km desaquecimento.',
            objective: 'Desenvolver velocidade e VO2 máx.'
          }
        },
        {
          id: 'w_20260830',
          date: '2026-08-30',
          type: 'Longão',
          status: 'planned',
          planned: {
            distance: 12.0,
            targetPaceMin: '05:00',
            targetPaceMax: '05:15',
            description: '12 km ritmados e constantes.',
            objective: 'Resistência de longa duração.'
          }
        },
        {
          id: 'w_20260901',
          date: '2026-09-01',
          type: 'Limiar',
          status: 'planned',
          planned: {
            distance: 7.0,
            targetPaceMin: '04:20',
            targetPaceMax: '04:30',
            description: '2 km aquecimento + 4 km no limiar de lactato (4:20-4:30/km) + 1 km desaquecimento.',
            objective: 'Sustentar ritmo de prova.'
          }
        },
        {
          id: 'w_20260903',
          date: '2026-09-03',
          type: 'Rodagem leve',
          status: 'planned',
          planned: {
            distance: 5.0,
            targetPaceMin: '05:15',
            targetPaceMax: '05:30',
            description: '5 km regenerativos.',
            objective: 'Recuperação ativa.'
          }
        },
        {
          id: 'w_20260906',
          date: '2026-09-06',
          type: 'Ritmo de prova',
          status: 'planned',
          planned: {
            distance: 8.0,
            targetPaceMin: '04:15',
            targetPaceMax: '04:20',
            description: '2 km solto + 5 km em ritmo forte de prova + 1 km solto.',
            objective: 'Ajuste de ritmo e confiança.'
          }
        },
        {
          id: 'w_20260926',
          date: '2026-09-26',
          type: 'Ritmo de prova',
          status: 'planned',
          planned: {
            distance: 7.0,
            targetPaceMin: '04:15',
            targetPaceMax: '04:17',
            description: 'PROVA DE 7 KM - OBJETIVO SUB-30',
            objective: 'Concluir em menos de 30 minutos.'
          }
        },
        {
          id: 'w_20260927',
          date: '2026-09-27',
          type: 'Ritmo de prova',
          status: 'planned',
          planned: {
            distance: 5.0,
            targetPaceMin: '03:58',
            targetPaceMax: '04:00',
            description: 'PROVA DE 5 KM - OBJETIVO SUB-20',
            objective: 'Concluir em menos de 20 minutos.'
          }
        }
      ].map(w => new Workout(w));

      this.saveWorkouts(defaultWorkouts);
    }
  }

  static getProfile() {
    const raw = localStorage.getItem(this.KEYS.PROFILE);
    return raw ? Athlete.fromJSON(JSON.parse(raw)) : new Athlete();
  }

  static saveProfile(athlete) {
    localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(athlete));
  }

  static getWorkouts() {
    const raw = localStorage.getItem(this.KEYS.WORKOUTS);
    if (!raw) return [];
    return JSON.parse(raw).map(w => new Workout(w));
  }

  static saveWorkouts(workouts) {
    localStorage.setItem(this.KEYS.WORKOUTS, JSON.stringify(workouts));
  }

  static addWorkout(workout) {
    const list = this.getWorkouts();
    list.push(workout);
    this.saveWorkouts(list);
  }

  static updateWorkout(updated) {
    let list = this.getWorkouts();
    list = list.map(w => w.id === updated.id ? updated : w);
    this.saveWorkouts(list);
  }

  static deleteWorkout(id) {
    let list = this.getWorkouts();
    list = list.filter(w => w.id !== id);
    this.saveWorkouts(list);
  }
}