export class Search {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.input = document.getElementById('mainSearch');
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.input.value.trim()) {
        chrome.search.query({
          text: this.input.value.trim(),
          disposition: 'CURRENT_TAB'
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.input) {
        e.preventDefault();
        this.input.focus();
      }
    });
  }
}
