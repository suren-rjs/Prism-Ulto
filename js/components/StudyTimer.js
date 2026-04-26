export class StudyTimer {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.timer = stateManager.get('timer');
    this.display = document.getElementById('timerDisplay');
    this.toggleBtn = document.getElementById('timerToggleBtn');
    this.resetBtn = document.getElementById('timerResetBtn');
    this.studyBtn = document.getElementById('timerStudyBtn');
    this.restBtn = document.getElementById('timerRestBtn');
  }

  init() {
    this.setupListeners();
    this.handleInitialState();
    this.updateDisplay();
    
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.timer.running) {
        this.updateDisplay();
      }
    });
  }

  setupListeners() {
    this.toggleBtn.addEventListener('click', () => this.timer.running ? this.pause() : this.start());
    this.resetBtn.addEventListener('click', () => this.reset());
    
    this.studyBtn.addEventListener('click', () => {
      this.timer.mode = 'study';
      this.studyBtn.classList.add('active');
      this.restBtn.classList.remove('active');
      this.reset();
    });

    this.restBtn.addEventListener('click', () => {
      this.timer.mode = 'rest';
      this.restBtn.classList.add('active');
      this.studyBtn.classList.remove('active');
      this.reset();
    });
  }

  handleInitialState() {
    if (this.timer.targetTime) {
      const remaining = Math.round((this.timer.targetTime - Date.now()) / 1000);
      if (remaining > 0) {
        this.start();
      } else {
        this.timer.remaining = 0;
        this.reset();
      }
    }

    if (this.timer.mode === 'rest') {
      this.restBtn.classList.add('active');
      this.studyBtn.classList.remove('active');
    }
  }

  updateDisplay() {
    if (this.timer.targetTime && this.timer.running) {
      const diff = Math.round((this.timer.targetTime - Date.now()) / 1000);
      this.timer.remaining = Math.max(0, diff);
    }
    const m = Math.floor(this.timer.remaining / 60);
    const s = this.timer.remaining % 60;
    this.display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    
    if (this.timer.running && this.timer.remaining <= 0) {
      this.stopAndNotify();
    }
  }

  start() {
    if (this.timer.running && this.timer.interval) return;
    this.timer.running = true;
    this.timer.targetTime = Date.now() + (this.timer.remaining * 1000);
    this.toggleBtn.textContent = '⏸';
    this.stateManager.save();
    this.timer.interval = setInterval(() => this.updateDisplay(), 1000);
  }

  pause() {
    this.timer.running = false;
    clearInterval(this.timer.interval);
    this.timer.interval = null;
    this.timer.targetTime = null;
    this.toggleBtn.textContent = '▶';
    this.stateManager.save();
  }

  reset() {
    this.pause();
    this.timer.remaining = this.timer.mode === 'study' ? 1500 : 300;
    this.updateDisplay();
    this.stateManager.save();
  }

  stopAndNotify() {
    clearInterval(this.timer.interval);
    this.timer.interval = null;
    this.timer.running = false;
    this.timer.targetTime = null;
    this.toggleBtn.textContent = '▶';
    this.updateDisplay();
    this.stateManager.save();
    setTimeout(() => {
      alert(this.timer.mode === 'study' ? "Study session over! Time for a rest." : "Rest over! Ready to focus?");
      this.reset();
    }, 100);
  }
}
