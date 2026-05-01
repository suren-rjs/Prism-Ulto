export class StudyTimer {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.timer = stateManager.get('timer');
    this.display = document.getElementById('timerDisplay');
    this.toggleBtn = document.getElementById('timerToggleBtn');
    this.resetBtn = document.getElementById('timerResetBtn');
    this.restBtn = document.getElementById('timerRestBtn');
    this.durationBtns = document.querySelectorAll('.timer-duration-btn');
    
    this.channel = new BroadcastChannel('timer_sync');
  }

  init() {
    this.setupListeners();
    this.handleInitialState();
    this.updateDisplay();
    
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Refresh state from storage when tab becomes visible
        this.timer = this.stateManager.get('timer');
        this.updateDisplay();
        if (this.timer.running && !this.timer.interval) {
            this.start(true); // resume UI interval
        }
      }
    });

    this.channel.onmessage = (msg) => {
      if (msg.data.type === 'SYNC') {
        this.timer = msg.data.timer;
        this.stateManager.state.timer = this.timer; // Update local state
        this.updateDisplay();
        this.handleSyncAction(msg.data.action);
      }
    };
  }

  setupListeners() {
    this.toggleBtn.addEventListener('click', () => {
        const action = this.timer.running ? 'pause' : 'start';
        this.timer.running ? this.pause() : this.start();
        this.broadcast('SYNC', action);
    });

    this.resetBtn.addEventListener('click', () => {
        this.reset();
        this.broadcast('SYNC', 'reset');
    });
    
    this.durationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.dataset.minutes);
        this.timer.mode = 'study';
        this.timer.remaining = mins * 60;
        this.setActiveDuration(btn);
        this.restBtn.classList.remove('active');
        this.reset(true);
        this.broadcast('SYNC', 'duration_change');
      });
    });

    this.restBtn.addEventListener('click', () => {
      this.timer.mode = 'rest';
      this.timer.remaining = 300; // 5 mins
      this.restBtn.classList.add('active');
      this.durationBtns.forEach(b => b.classList.remove('active'));
      this.reset(true);
      this.broadcast('SYNC', 'mode_change');
    });
  }

  handleInitialState() {
    if (this.timer.targetTime) {
      const remaining = Math.round((this.timer.targetTime - Date.now()) / 1000);
      if (remaining > 0) {
        this.start(true);
      } else {
        this.timer.remaining = 0;
        this.reset();
      }
    }

    if (this.timer.mode === 'rest') {
      this.restBtn.classList.add('active');
    } else {
        // Find button matching remaining time if possible
        const mins = Math.floor(this.timer.remaining / 60);
        this.durationBtns.forEach(b => {
            if (parseInt(b.dataset.minutes) === mins) b.classList.add('active');
        });
    }
  }

  setActiveDuration(activeBtn) {
    this.durationBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  handleSyncAction(action) {
    if (action === 'start') {
        this.start(true);
    } else if (action === 'pause') {
        this.pause(true);
    } else if (action === 'reset' || action === 'duration_change' || action === 'mode_change') {
        this.pause(true);
        this.updateDisplay();
        this.updateModeUI();
    }
  }

  updateModeUI() {
    if (this.timer.mode === 'rest') {
        this.restBtn.classList.add('active');
        this.durationBtns.forEach(b => b.classList.remove('active'));
    } else {
        this.restBtn.classList.remove('active');
        const mins = Math.floor(this.timer.remaining / 60);
        this.durationBtns.forEach(b => {
            if (parseInt(b.dataset.minutes) === mins) b.classList.add('active');
            else b.classList.remove('active');
        });
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

  start(isSync = false) {
    if (this.timer.running && this.timer.interval) return;
    this.timer.running = true;
    if (!isSync) {
        this.timer.targetTime = Date.now() + (this.timer.remaining * 1000);
    }
    this.toggleBtn.textContent = '⏸';
    if (!isSync) this.stateManager.save();
    
    clearInterval(this.timer.interval);
    this.timer.interval = setInterval(() => this.updateDisplay(), 1000);
  }

  pause(isSync = false) {
    this.timer.running = false;
    clearInterval(this.timer.interval);
    this.timer.interval = null;
    if (!isSync) {
        this.timer.targetTime = null;
    }
    this.toggleBtn.textContent = '▶';
    if (!isSync) this.stateManager.save();
  }

  reset(keepDuration = false) {
    this.pause();
    if (!keepDuration) {
        this.timer.remaining = this.timer.mode === 'study' ? 1500 : 300;
    }
    this.updateDisplay();
    this.stateManager.save();
  }

  broadcast(type, action) {
    this.channel.postMessage({ type, action, timer: this.timer });
  }

  stopAndNotify() {
    clearInterval(this.timer.interval);
    this.timer.interval = null;
    this.timer.running = false;
    this.timer.targetTime = null;
    this.toggleBtn.textContent = '▶';
    this.updateDisplay();
    this.stateManager.save();
    
    // Only notify if tab is active to avoid multiple alerts
    if (!document.hidden) {
        setTimeout(() => {
          alert(this.timer.mode === 'study' ? "Study session over! Time for a rest." : "Rest over! Ready to focus?");
          this.reset();
          this.broadcast('SYNC', 'reset');
        }, 100);
    }
  }
}
