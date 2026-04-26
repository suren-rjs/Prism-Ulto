export class Search {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.input = document.getElementById('mainSearch');
    this.providerBtn = document.getElementById('searchProviderBtn');
    this.providerDropdown = document.getElementById('providerDropdown');
    this.currentProviderIcon = document.getElementById('currentProviderIcon');

    this.providers = {
      google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico' },
      bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'https://www.bing.com/favicon.ico' },
      duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'https://duckduckgo.com/favicon.ico' }
    };
  }

  init() {
    const settings = this.stateManager.get('settings');
    const currentProvider = settings.searchProvider || 'google';
    this.updateProvider(currentProvider);
    this.setupListeners();
  }

  setupListeners() {
    this.providerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.providerDropdown.classList.toggle('open');
    });

    document.querySelectorAll('.provider-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const p = opt.getAttribute('data-provider');
        this.updateProvider(p);
        this.providerDropdown.classList.remove('open');
      });
    });

    document.addEventListener('click', () => this.providerDropdown.classList.remove('open'));

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.input.value.trim()) {
        const settings = this.stateManager.get('settings');
        const provider = this.providers[settings.searchProvider || 'google'];
        window.location.href = `${provider.url}${encodeURIComponent(this.input.value.trim())}`;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.input) {
        e.preventDefault();
        this.input.focus();
      }
    });
  }

  updateProvider(p) {
    const provider = this.providers[p];
    this.currentProviderIcon.src = provider.icon;
    this.input.placeholder = `Search ${provider.name}...`;
    
    const settings = this.stateManager.get('settings');
    settings.searchProvider = p;
    this.stateManager.set('settings', settings);
  }
}
