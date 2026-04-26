export class Notes {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.panel = document.getElementById('notesPanel');
    this.toggleBtn = document.getElementById('notesToggleBtn');
    this.closeBtn = document.getElementById('closeNotesBtn');
    this.area = document.getElementById('notesArea');
  }

  init() {
    this.area.value = this.stateManager.get('notes');

    this.toggleBtn.addEventListener('click', () => this.panel.classList.toggle('open'));
    this.closeBtn.addEventListener('click', () => this.panel.classList.remove('open'));
    
    this.area.addEventListener('input', () => {
      this.stateManager.set('notes', this.area.value);
    });
  }
}
