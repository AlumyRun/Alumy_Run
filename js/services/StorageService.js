import { supabase } from '../config/supabase.js';

export class StorageService {
  static WORKOUTS_KEY = 'alumy_run_workouts';
  static RACES_KEY = 'alumy_run_races';
  static realtimeChannel = null;
  static isRealtimeApplying = false;

  // OBTÉM O USUÁRIO AUTENTICADO DIRETO DA SESSÃO DO SUPABASE
  static async getCurrentUser() {
    if (!supabase) return null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session ? session.user : null;
    } catch (e) {
      return null;
    }
  }

  // --- LEITURA DE WORKOUTS ---
  static async getWorkouts() {
    const user = await this.getCurrentUser();

    if (user) {
      this.notifyStatus('syncing', '🟡 Sincronizando...');
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // Atualiza o cache local somente após retorno confirmado do servidor
        localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(data || []));
        this.notifyStatus('synced', '🟢 Sincronizado');
        return data || [];
      } catch (e) {
        console.error('Falha ao obter treinos do Supabase:', e.message);
        this.notifyStatus('offline', 'Dados locais — aguardando sincronização');
      }
    } else {
      this.notifyStatus('offline', '⚪ Offline (Modo Local)');
    }

    // Leitura fallback de cache se offline ou sem sessão (sem criar treinos fictícios)
    try {
      const data = localStorage.getItem(this.WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // --- ESCRITA DE WORKOUTS (SUPABASE PRIMEIRO -> CACHE DEPOIS) ---
  static async addWorkout(workout) {
    const user = await this.getCurrentUser();

    if (user) {
      this.notifyStatus('syncing', '🟡 Sincronizando...');
      const { error } = await supabase.from('workouts').insert([{
        id: workout.id,
        user_id: user.id,
        date: workout.date,
        type: workout.type,
        status: workout.status,
        planned: workout.planned,
        completed: workout.completed
      }]);

      if (error) {
        console.error('Erro no Supabase INSERT:', error.message);
        this.notifyStatus('error', '🔴 Erro de sincronização');
        throw new Error('Não foi possível sincronizar o treino. Verifique sua conexão e tente novamente.');
      }
      this.notifyStatus('synced', '🟢 Sincronizado');
    }

    const workouts = await this.getWorkoutsLocalCache();
    workouts.push(workout);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  static async updateWorkout(updatedWorkout) {
    const user = await this.getCurrentUser();

    if (user) {
      this.notifyStatus('syncing', '🟡 Sincronizando...');
      const { error } = await supabase.from('workouts').update({
        date: updatedWorkout.date,
        type: updatedWorkout.type,
        status: updatedWorkout.status,
        planned: updatedWorkout.planned,
        completed: updatedWorkout.completed,
        updated_at: new Date()
      }).eq('id', updatedWorkout.id).eq('user_id', user.id);

      if (error) {
        console.error('Erro no Supabase UPDATE:', error.message);
        this.notifyStatus('error', '🔴 Erro de sincronização');
        throw new Error('Não foi possível atualizar o treino na nuvem. Alteração cancelada.');
      }
      this.notifyStatus('synced', '🟢 Sincronizado');
    }

    const workouts = await this.getWorkoutsLocalCache();
    const index = workouts.findIndex(w => w.id === updatedWorkout.id);
    if (index !== -1) {
      workouts[index] = updatedWorkout;
      localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
    }
  }

  static async deleteWorkout(id) {
    const user = await this.getCurrentUser();

    if (user) {
      this.notifyStatus('syncing', '🟡 Sincronizando...');
      const { error } = await supabase.from('workouts').delete().eq('id', id).eq('user_id', user.id);

      if (error) {
        console.error('Erro no Supabase DELETE:', error.message);
        this.notifyStatus('error', '🔴 Erro de sincronização');
        throw new Error('Não foi possível excluir o treino do servidor.');
      }
      this.notifyStatus('synced', '🟢 Sincronizado');
    }

    let workouts = await this.getWorkoutsLocalCache();
    workouts = workouts.filter(w => w.id !== id);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  // --- LEITURA E ESCRITA DE PROVAS (RACES) ---
  static async getRaces() {
    const user = await this.getCurrentUser();

    if (user) {
      try {
        const { data, error } = await supabase
          .from('races')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const mappedRaces = (data || []).map(r => ({
          id: r.id,
          name: r.name,
          date: r.date,
          distance: parseFloat(r.distance),
          targetTime: r.target_time,
          location: r.location,
          notes: r.notes
        }));

        localStorage.setItem(this.RACES_KEY, JSON.stringify(mappedRaces));
        return mappedRaces;
      } catch (e) {
        console.error('Falha ao ler provas do Supabase:', e.message);
      }
    }

    // Fallback estrito: lê apenas o cache local existente, sem injetar provas automaticamente
    try {
      const data = localStorage.getItem(this.RACES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static async addRace(race) {
    const user = await this.getCurrentUser();

    if (user) {
      this.notifyStatus('syncing', '🟡 Sincronizando...');
      const { error } = await supabase.from('races').insert([{
        id: race.id,
        user_id: user.id,
        name: race.name,
        date: race.date,
        distance: race.distance,
        target_time: race.targetTime,
        location: race.location,
        notes: race.notes
      }]);

      if (error) {
        this.notifyStatus('error', '🔴 Erro de sincronização');
        throw new Error('Não foi possível sincronizar a prova com o servidor.');
      }
      this.notifyStatus('synced', '🟢 Sincronizado');
    }

    const races = await this.getRacesLocalCache();
    races.push(race);
    localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
  }

  static async updateRace(updatedRace) {
    const user = await this.getCurrentUser();

    if (user) {
      this.notifyStatus('syncing', '🟡 Sincronizando...');
      const { error } = await supabase.from('races').update({
        name: updatedRace.name,
        date: updatedRace.date,
        distance: updatedRace.distance,
        target_time: updatedRace.targetTime,
        location: updatedRace.location,
        notes: updatedRace.notes,
        updated_at: new Date()
      }).eq('id', updatedRace.id).eq('user_id', user.id);

      if (error) {
        this.notifyStatus('error', '🔴 Erro de sincronização');
        throw new Error('Não foi possível atualizar a prova no servidor.');
      }
      this.notifyStatus('synced', '🟢 Sincronizado');
    }

    const races = await this.getRacesLocalCache();
    const index = races.findIndex(r => r.id === updatedRace.id);
    if (index !== -1) {
      races[index] = updatedRace;
      localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
    }
  }

  static async deleteRace(id) {
    const user = await this.getCurrentUser();

    if (user) {
      this.notifyStatus('syncing', '🟡 Sincronizando...');
      const { error } = await supabase.from('races').delete().eq('id', id).eq('user_id', user.id);
      if (error) {
        this.notifyStatus('error', '🔴 Erro de sincronização');
        throw new Error('Não foi possível excluir a prova do servidor.');
      }
      this.notifyStatus('synced', '🟢 Sincronizado');
    }

    let races = await this.getRacesLocalCache();
    races = races.filter(r => r.id !== id);
    localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
  }

  // --- MIGRAÇÃO SEGURA, ATÔMICA E ANTI-DUPLICAÇÃO POR USER_ID ---
  static async checkMigrationStatus(user) {
    if (!user) return true;
    const migrationKey = `migration_status_${user.id}`;
    return localStorage.getItem(migrationKey) === 'completed';
  }

  static async markMigrationCompleted(userId) {
    if (!userId) return;
    localStorage.setItem(`migration_status_${userId}`, 'completed');
  }

  static async migrateLocalDataToSupabase(userId) {
    if (!supabase || !userId) return;

    this.notifyStatus('syncing', '🟡 Sincronizando...');

    const localWorkouts = JSON.parse(localStorage.getItem(this.WORKOUTS_KEY) || '[]');
    const localRaces = JSON.parse(localStorage.getItem(this.RACES_KEY) || '[]');

    try {
      // 1. Migração de Treinos
      for (const w of localWorkouts) {
        const { data, error: selectErr } = await supabase
          .from('workouts')
          .select('id')
          .eq('id', w.id)
          .eq('user_id', userId);

        if (selectErr) throw selectErr;

        if (!data || data.length === 0) {
          const { error: insertErr } = await supabase.from('workouts').insert([{
            id: w.id,
            user_id: userId,
            date: w.date,
            type: w.type,
            status: w.status,
            planned: w.planned,
            completed: w.completed
          }]);

          if (insertErr) throw insertErr;
        }
      }

      // 2. Migração de Provas
      for (const r of localRaces) {
        const { data, error: selectErr } = await supabase
          .from('races')
          .select('id')
          .eq('id', r.id)
          .eq('user_id', userId);

        if (selectErr) throw selectErr;

        if (!data || data.length === 0) {
          const { error: insertErr } = await supabase.from('races').insert([{
            id: r.id,
            user_id: userId,
            name: r.name,
            date: r.date,
            distance: r.distance,
            target_time: r.targetTime,
            location: r.location,
            notes: r.notes
          }]);

          if (insertErr) throw insertErr;
        }
      }

      await this.markMigrationCompleted(userId);
      this.notifyStatus('synced', '🟢 Sincronizado');
    } catch (err) {
      console.error('Erro durante a migração para o Supabase:', err.message);
      this.notifyStatus('error', '🔴 Erro de sincronização');
      throw new Error('Não foi possível sincronizar todos os dados. Nenhum dado local foi apagado. Tente novamente.');
    }
  }

  // --- REALTIME SUBSCRIPTION COM FILTRO DE USER_ID ---
  static async subscribeToRealtime(onUpdateCallback) {
    if (!supabase) return;

    const user = await this.getCurrentUser();
    if (!user) return;

    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }

    this.realtimeChannel = supabase
      .channel(`user-sync-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workouts',
        filter: `user_id=eq.${user.id}`
      }, async () => {
        if (!this.isRealtimeApplying) {
          this.isRealtimeApplying = true;
          if (onUpdateCallback) await onUpdateCallback();
          this.isRealtimeApplying = false;
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'races',
        filter: `user_id=eq.${user.id}`
      }, async () => {
        if (!this.isRealtimeApplying) {
          this.isRealtimeApplying = true;
          if (onUpdateCallback) await onUpdateCallback();
          this.isRealtimeApplying = false;
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.notifyStatus('synced', '🟢 Sincronizado');
        } else if (status === 'CHANNEL_ERROR') {
          this.notifyStatus('error', '🔴 Erro de sincronização');
        }
      });
  }

  static notifyStatus(type, message) {
    const badge = document.getElementById('sync-status-indicator');
    if (badge) {
      badge.innerText = message;
      badge.className = `sync-indicator-badge sync-${type}`;
    }
  }

  // HELPERS AUXILIARES LOCAIS
  static async getWorkoutsLocalCache() {
    try {
      return JSON.parse(localStorage.getItem(this.WORKOUTS_KEY) || '[]');
    } catch (e) { return []; }
  }

  static async getRacesLocalCache() {
    try {
      return JSON.parse(localStorage.getItem(this.RACES_KEY) || '[]');
    } catch (e) { return []; }
  }

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
    const diffTime = raceDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
}
