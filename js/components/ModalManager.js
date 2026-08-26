import { StorageService } from '../services/StorageService.js';

export class SearchManager {
  static init(app) {
    this.app = app;
    this.input = document.querySelector('.search-input');
    this.container = document.querySelector('.header-search');

    if (!this.input || !this.container) return;

    this.createDropdown();
    this.bindEvents();
  }

  static createDropdown() {
    let dropdown = document.getElementById('search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'search-dropdown';
      dropdown.className = 'search-dropdown';
      dropdown.style.display = 'none';
      this.container.appendChild(dropdown);
    }
    this.dropdown = dropdown;

    let clearBtn = document.getElementById('search-clear-btn');
    if (!clearBtn) {
      clearBtn = document.createElement('button');
      clearBtn.id = 'search-clear-btn';
      clearBtn.className = 'search-clear-btn';
      clearBtn.innerHTML = '✕';
      clearBtn.style.display = 'none';
      this.container.appendChild(clearBtn);
    }
    this.clearBtn = clearBtn;
  }

  static bindEvents() {
    this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));
    
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      } else if (e.key === 'Enter') {
        const firstResult = this.dropdown.querySelector('.search-result-item');
        if (firstResult) {
          firstResult.click();
        }
      }
    });

    this.clearBtn.addEventListener('click', () => this.clearSearch());

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.dropdown.style.display = 'none';
      }
    });
  }

  static clearSearch() {
    this.input.value = '';
    this.dropdown.style.display = 'none';
    this.clearBtn.style.display = 'none';
  }

  static handleSearch(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
      this.clearSearch();
      return;
    }

    this.clearBtn.style.display = 'block';

    const workouts = StorageService.getWorkouts();
    const profile = StorageService.getProfile();
    const races = profile.races || [];
    const records = profile.records || [];

    const results = [];

    // Busca em Treinos
    workouts.forEach(w => {
      const textToSearch = `${w.type} ${w.date} ${w.planned.distance}km ${w.status} ${w.completed.feeling || ''}`.toLowerCase();
      if (textToSearch.includes(q)) {
        results.push({
          type: 'workout',
          title: `🏃 ${w.type}`,
          subtitle: `${w.date} • ${w.planned.distance} km • ${w.status === 'completed' ? 'Concluído' : 'Planejado'}`,
          id: w.id,
          view: 'workouts'
        });
      }
    });

    // Busca em Provas
    races.forEach(r => {
      const textToSearch = `${r.label} ${r.date} ${r.distance} ${r.location || ''}`.toLowerCase();
      if (textToSearch.includes(q)) {
        results.push({
          type: 'race',
          title: `🏁 ${r.label}`,
          subtitle: `${r.date} • ${r.distance} • Meta: ${r.targetTime}`,
          id: r.id,
          view: 'races'
        });
      }
    });

    // Busca em RPs
    records.forEach(rec => {
      const textToSearch = `rp ${rec.distance} ${rec.time} ${rec.date}`.toLowerCase();
      if (textToSearch.includes(q)) {
        results.push({
          type: 'record',
          title: `🏆 RP - ${rec.distance}`,
          subtitle: `Tempo: ${rec.time} (${rec.date})`,
          id: rec.distance,
          view: 'records'
        });
      }
    });

    this.renderDropdown(results);
  }

  static renderDropdown(results) {
    if (results.length === 0) {
      this.dropdown.innerHTML = `<div class="search-no-results">Nenhum resultado encontrado.</div>`;
    } else {
      this.dropdown.innerHTML = results.map(r => `
        <div class="search-result-item" data-view="${r.view}" data-id="${r.id}">
          <div class="search-res-title">${r.title}</div>
          <div class="search-res-sub">${r.subtitle}</div>
        </div>
      `).join('');

      this.dropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.onclick = () => {
          const view = item.dataset.view;
          const id = item.dataset.id;
          this.clearSearch();
          this.app.switchView(view);

          // Efeito visual de destaque no card selecionado
          setTimeout(() => {
            const cardEl = document.querySelector(`[data-id="${id}"]`) || document.getElementById(id);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              cardEl.classList.add('highlight-card');
              setTimeout(() => cardEl.classList.remove('highlight-card'), 2000);
            }
          }, 100);
        };
      });
    }

    this.dropdown.style.display = 'block';
  }
}
