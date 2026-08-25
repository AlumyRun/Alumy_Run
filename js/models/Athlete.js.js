export class Athlete {
  constructor(data = {}) {
    this.name = data.name || 'Rafael';
    this.records = data.records || {
      '5km': '20:38',
      '10km': '46:24',
      '21.1km': '1:42:57'
    };
    this.weeklyVolume = data.weeklyVolume || 25;
    this.weeklyFrequency = data.weeklyFrequency || 3;
    this.races = data.races || [];
  }

  static fromJSON(json) {
    return new Athlete(json);
  }

  toJSON() {
    return {
      name: this.name,
      records: this.records,
      weeklyVolume: this.weeklyVolume,
      weeklyFrequency: this.weeklyFrequency,
      races: this.races
    };
  }
}