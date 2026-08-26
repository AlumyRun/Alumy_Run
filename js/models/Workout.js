export class Workout {
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

    const paceSecondsTotal = totalSeconds / distanceKm;
    const paceMinutes = Math.floor(paceSecondsTotal / 60);
    const paceSeconds = Math.round(paceSecondsTotal % 60);

    const formattedSeconds = paceSeconds < 10 ? `0${paceSeconds}` : `${paceSeconds}`;
    return `${paceMinutes}:${formattedSeconds}`;
  }

  static getEvaluation(workout) {
    if (workout.status !== 'completed') return null;

    const targetMinParts = workout.planned.targetPaceMin.split(':').map(Number);
    const targetMaxParts = workout.planned.targetPaceMax.split(':').map(Number);
    const actualParts = workout.completed.pace.split(':').map(Number);

    const minSec = targetMinParts[0] * 60 + (targetMinParts[1] || 0);
    const maxSec = targetMaxParts[0] * 60 + (targetMaxParts[1] || 0);
    const actualSec = actualParts[0] * 60 + (actualParts[1] || 0);

    if (actualSec >= minSec && actualSec <= maxSec) {
      return { status: '🟢 Dentro da meta', color: 'var(--success)' };
    } else if (actualSec < minSec) {
      return { status: '⚡ Mais rápido', color: 'var(--primary-light)' };
    } else {
      return { status: '🟡 Abaixo da meta', color: 'var(--warning)' };
    }
  }

  // ORDENAÇÃO AUTOMÁTICA DE TREINOS POR DATA
  static sortWorkouts(workouts) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseDate = (dateStr) => {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
      return new Date(dateStr);
    };

    const future = [];
    const past = [];

    workouts.forEach(w => {
      const wDate = parseDate(w.date);
      wDate.setHours(0, 0, 0, 0);

      if (wDate >= today) {
        future.push({ ...w, _time: wDate.getTime() });
      } else {
        past.push({ ...w, _time: wDate.getTime() });
      }
    });

    // Futuros: mais próximo -> mais distante
    future.sort((a, b) => a._time - b._time);

    // Passados: mais recente -> mais antigo
    past.sort((a, b) => b._time - a._time);

    return [...future, ...past].map(({ _time, ...w }) => w);
  }
}
