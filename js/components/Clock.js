export class Clock {
  constructor() {
    this.display = document.getElementById('clockDisplay');
  }

  init() {
    this.update();
    setInterval(() => this.update(), 1000);
  }

  update() {
    const now = new Date();
    this.display.textContent = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  }
}
