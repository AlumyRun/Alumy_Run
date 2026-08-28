import { supabase } from '../config/supabase.js';

export class StorageService {
  static WORKOUTS_KEY = 'alumy_run_workouts';
  static RACES_KEY = 'alumy_run_races';
  static realtimeChannel = null;
  static isRealtimeApplying = false;

  static async getCurrentUser() {
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session ? data.session.user : null;
    } catch (e) { return null; }
  }

  // --- WORKOUTS ---
  static async getWorkouts() {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        this.notifyStatus('syncing', '🟡 A Sincronizar...');
        const { data, error } = await supabase.from('workouts').select('*').eq('user_id', user.id);
        if (!error && data) {
          localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(data));
          this.notifyStatus('synced', '🟢 Sincronizado');
          return data;
        }
      }
    } catch (e) {
      this.notifyStatus('offline', '⚪ Offline (Modo Local)');
    }
    return this.getWorkoutsLocalCache();
  }

  static getWorkoutsLocalCache() {
    try {
      const data = localStorage.getItem(this.WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  }

  static async addWorkout(workout) {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        this.notifyStatus('syncing', '🟡 A Sincronizar...');
        const { error } = await supabase.from('workouts').insert([{
          id: workout.id, user_id: user.id, date: workout.date, type: workout.type,
          status: workout.status, planned: workout.planned, completed: workout.completed
        }]);
        if (error) throw new Error('Falha ao sincronizar.');
        this.notifyStatus('synced', '🟢 Sincronizado');
      }
    } catch (e) { if (e.message.includes('sincronizar')) throw e; }
    const workouts = this.getWorkoutsLocalCache();
    workouts.push(workout);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  static async updateWorkout(updatedWorkout) {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        this.notifyStatus('syncing', '🟡 A Sincronizar...');
        const { error } = await supabase.from('workouts').update({
          date: updatedWorkout.date, type: updatedWorkout.type, status: updatedWorkout.status,
          planned: updatedWorkout.planned, completed: updatedWorkout.completed, updated_at: new Date().toISOString()
        }).eq('id', updatedWorkout.id).eq('user_id', user.id);
        if (error) throw new Error('Falha ao atualizar na nuvem.');
        this.notifyStatus('synced', '🟢 Sincronizado');
      }
    } catch (e) { if (e.message.includes('nuvem')) throw e; }
    const workouts = this.getWorkoutsLocalCache();
    const index = workouts.findIndex(w => w.id === updatedWorkout.id);
    if (index !== -1) {
      workouts[index] = updatedWorkout;
      localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
    }
  }

  static async deleteWorkout(id) {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        this.notifyStatus('syncing', '🟡 A Sincronizar...');
        const { error } = await supabase.from('workouts').delete().eq('id', id).eq('user_id', user.id);
        if (error) throw new Error('Falha ao excluir na nuvem.');
        this.notifyStatus('synced', '🟢 Sincronizado');
      }
    } catch (e) { if (e.message.includes('nuvem')) throw e; }
    let workouts = this.getWorkoutsLocalCache();
    workouts = workouts.filter(w => w.id !== id);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  // --- RACES (PROVAS) ---
  static async getRaces() {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        const { data, error } = await supabase.from('races').select('*').eq('user_id', user.id);
        if (!error && data) {
          const mappedRaces = data.map(r => ({
            id: r.id,
            name: r.name,
            date: r.date,
            distance: parseFloat(r.distance),
            targetTime: r.target_time,
            location: r.location,
            notes: r.notes,
            status: r.status || 'planned',
            resultTime: r.actual_time || null,
            resultDistance: r.actual_distance ? parseFloat(r.actual_distance) : null
          }));
          localStorage.setItem(this.RACES_KEY, JSON.stringify(mappedRaces));
          return mappedRaces;
        }
      }
    } catch (e) { console.warn('Lendo cache local de provas.'); }
    return this.getRacesLocalCache();
  }

  static getRacesLocalCache() {
    try {
      const data = localStorage.getItem(this.RACES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  }

  static async addRace(race) {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        this.notifyStatus('syncing', '🟡 A Sincronizar...');
        const { error } = await supabase.from('races').insert([{
          id: race.id, user_id: user.id, name: race.name, date: race.date, distance: race.distance,
          target_time: race.targetTime, location: race.location, notes: race.notes,
          status: race.status || 'planned', actual_time: race.resultTime || null, actual_distance: race.resultDistance || null
        }]);
        if (error) throw new Error('Erro ao sincronizar prova.');
        this.notifyStatus('synced', '🟢 Sincronizado');
      }
    } catch (e) { if (e.message.includes('sincronizar')) throw e; }
    const races = this.getRacesLocalCache();
    races.push(race);
    localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
  }

  static async updateRace(updatedRace) {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        this.notifyStatus('syncing', '🟡 A Sincronizar...');
        const { error } = await supabase.from('races').update({
          name: updatedRace.name, date: updatedRace.date, distance: updatedRace.distance,
          target_time: updatedRace.targetTime, location: updatedRace.location, notes: updatedRace.notes,
          status: updatedRace.status || 'planned', actual_time: updatedRace.resultTime || null, 
          actual_distance: updatedRace.resultDistance || null, updated_at: new Date().toISOString()
        }).eq('id', updatedRace.id).eq('user_id', user.id);
        if (error) throw new Error('Erro ao atualizar prova.');
        this.notifyStatus('synced', '🟢 Sincronizado');
      }
    } catch (e) { if (e.message.includes('atualizar')) throw e; }
    const races = this.getRacesLocalCache();
    const index = races.findIndex(r => r.id === updatedRace.id);
    if (index !== -1) {
      races[index] = updatedRace;
      localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
    }
  }

  static async deleteRace(id) {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        this.notifyStatus('syncing', '🟡 A Sincronizar...');
        const { error } = await supabase.from('races').delete().eq('id', id).eq('user_id', user.id);
        if (error) throw new Error('Erro ao excluir prova.');
        this.notifyStatus('synced', '🟢 Sincronizado');
      }
    } catch (e) { if (e.message.includes('excluir')) throw e; }
    let races = this.getRacesLocalCache();
    races = races.filter(r => r.id !== id);
    localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
  }

  // --- MIGRAÇÃO & REALTIME ---
  static async checkMigrationStatus(user) {
    if (!user) return true;
    return localStorage.getItem(`migration_status_${user.id}`) === 'completed';
  }

  static async markMigrationCompleted(userId) {
    if (userId) localStorage.setItem(`migration_status_${userId}`, 'completed');
  }

  static async migrateLocalDataToSupabase(userId) {
    if (!supabase || !userId) return;
    const localWorkouts = this.getWorkoutsLocalCache();
    const localRaces = this.getRacesLocalCache();

    try {
      // Migrar treinos
      for (const w of localWorkouts) {
        const { data } = await supabase.from('workouts').select('id').eq('id', w.id).eq('user_id', userId);
        if (!data || data.length === 0) {
          await supabase.from('workouts').insert([{
            id: w.id, user_id: userId, date: w.date, type: w.type,
            status: w.status, planned: w.planned, completed: w.completed
          }]);
        }
      }
      // Migrar provas
      for (const r of localRaces) {
        const { data } = await supabase.from('races').select('id').eq('id', r.id).eq('user_id', userId);
        if (!data || data.length === 0) {
          await supabase.from('races').insert([{
            id: r.id, user_id: userId, name: r.name, date: r.date, distance: r.distance,
            target_time: r.targetTime, location: r.location, notes: r.notes,
            status: r.status || 'planned', actual_time: r.resultTime || null, actual_distance: r.resultDistance || null
          }]);
        }
      }
      await this.markMigrationCompleted(userId);
    } catch (err) { throw new Error('Falha ao sincronizar dados offline com a nuvem.'); }
  }

  static async subscribeToRealtime(onUpdateCallback) {
    if (!supabase) return;
    try {
      const user = await this.getCurrentUser();
      if (!user) return;
      if (this.realtimeChannel) supabase.removeChannel(this.realtimeChannel);

      this.realtimeChannel = supabase
        .channel(`user-sync-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts', filter: `user_id=eq.${user.id}` }, async () => {
          if (!this.isRealtimeApplying) { this.isRealtimeApplying = true; if (onUpdateCallback) await onUpdateCallback(); this.isRealtimeApplying = false; }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'races', filter: `user_id=eq.${user.id}` }, async () => {
          if (!this.isRealtimeApplying) { this.isRealtimeApplying = true; if (onUpdateCallback) await onUpdateCallback(); this.isRealtimeApplying = false; }
        })
        .subscribe();
    } catch (e) { console.warn('Realtime offline.'); }
  }

  static notifyStatus(type, message) {
    const badge = document.getElementById('sync-status-indicator');
    if (badge) {
      badge.innerText = message;
      badge.className = `sync-indicator-badge sync-${type}`;
    }
  }

  // --- HELPERS AUXILIARES ---
  static getSortedWorkouts(workouts) {
    const list = workouts || [];
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

  static async getNextRace() {
    const races = await this.getRaces();
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
}
