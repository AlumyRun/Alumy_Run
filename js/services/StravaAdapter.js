export class StravaAdapter {
  constructor() {
    this.isConnected = false;
  }

  // Módulo MOCK/Interface para futura integração sem requisições reais
  async syncActivities() {
    console.warn('StravaAdapter: Módulo em modo de espera para futura integração API.');
    return {
      success: false,
      message: 'Integração com o Strava estará disponível em etapas futuras.'
    };
  }

  mapStravaToWorkout(stravaActivity) {
    return {
      externalId: stravaActivity.id,
      source: 'strava',
      completed: {
        distance: stravaActivity.distance / 1000,
        time: stravaActivity.moving_time,
        avgHR: stravaActivity.average_heartrate,
        maxHR: stravaActivity.max_heartrate,
        elevation: stravaActivity.total_elevation_gain
      }
    };
  }
}
