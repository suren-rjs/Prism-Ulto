export class DailyFocus {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.input = document.getElementById('dailyFocusInput');
    this.display = document.getElementById('dailyFocusDisplay');
    this.text = this.display.querySelector('.focus-text');
    this.clearBtn = document.getElementById('clearFocusBtn');
  }

  init() {
    this.setupListeners();
    this.render();
  }

  setupListeners() {
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.input.value.trim()) {
        this.stateManager.set('dailyFocus', this.input.value.trim());
        this.render();
      }
    });

    this.clearBtn.addEventListener('click', () => {
      this.stateManager.set('dailyFocus', '');
      this.render();
    });
  }

  render() {
    const focus = this.stateManager.get('dailyFocus');
    if (focus) {
      this.input.parentElement.style.display = 'none';
      this.display.style.display = 'flex';
      this.text.textContent = focus;
    } else {
      this.input.parentElement.style.display = 'block';
      this.display.style.display = 'none';
      this.input.value = '';
    }
  }
}
