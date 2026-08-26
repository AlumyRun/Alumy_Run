export class Workout {
  constructor(data = {}) {
    this.id = data.id || `tr_${Date.now()}`;
    this.externalId = data.externalId || null;
    this.source = data.source || 'manual';
    this.date = data.date;
    this.type = data.type; // Rodagem leve, Intervalado, Longão, etc.
    this.status = data.status || 'planned'; // planned, completed, partial, missed, rest

    this.planned = {
      distance: data.planned?.distance || 0,
      targetPaceMin: data.planned?.targetPaceMin || '',
      targetPaceMax: data.planned?.targetPaceMax || '',
      description: data.planned?.description || '',
      objective: data.planned?.objective || '',
      notes: data.planned?.notes || ''
    };

    this.completed = data.completed ? {
      distance: data.completed.distance || 0,
      time: data.completed.time || '',
      pace: data.completed.pace || '--:--',
      avgHR: data.completed.avgHR || null,
      maxHR: data.completed.maxHR || null,
      elevation: data.completed.elevation || null,
      calories: data.completed.calories || null,
      feeling: data.completed.feeling || '😐 Moderado',
      notes: data.completed.notes || ''
    } : null;
  }

  static calculatePace(distKm, timeStr) {
    if (!distKm || distKm <= 0 || !timeStr) return '--:--';
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    else return '--:--';

    if (seconds <= 0) return '--:--';
    const paceSeconds = seconds / distKm;
    const pMin = Math.floor(paceSeconds / 60);
    const pSec = Math.round(paceSeconds % 60);
    return `${pMin}:${pSec < 10 ? '0' : ''}${pSec}`;
  }

  static getEvaluation(workout) {
    if (workout.status !== 'completed' || !workout.completed) return null;
    
    const plannedDist = workout.planned.distance;
    const realDist = workout.completed.distance;
    const diffKm = Math.abs(realDist - plannedDist);

    if (diffKm <= 0.5) {
      return { status: ' Dentro da meta', color: 'var(--accent-green)' };
    } else if (realDist < plannedDist) {
      return { status: '⚠️ Abaixo do planejado', color: 'var(--accent-yellow)' };
    } else {
      return { status: '🔥 Acima do planejado', color: 'var(--accent-blue)' };
    }
  }
}