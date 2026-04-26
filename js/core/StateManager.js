import { StorageService } from '../services/StorageService.js';

export class StateManager {
  constructor() {
    this.state = {
      user: { name: 'Friend', avatar: null },
      settings: { theme: 'dark', searchProvider: 'google' },
      dailyFocus: '',
      notes: '',
      timer: { mode: 'study', remaining: 1500, running: false, interval: null, targetTime: null },
      links: this.getDefaultLinks()
    };
  }

  getDefaultLinks() {
    return [
      { name: 'Gmail', url: 'https://mail.google.com', icon: '📧', category: 'Google' },
      { name: 'NotebookLM', url: 'https://notebooklm.google.com', category: 'Google' },
      { name: 'Google Firebase', url: 'https://firebase.google.com', category: 'Google' },
      { name: 'GCP', url: 'https://console.cloud.google.com', category: 'Google' },
      { name: 'Grow with Google', url: 'https://grow.google', category: 'Google' },
      { name: 'Gemini', url: 'https://gemini.google.com', category: 'AI' },
      { name: 'Instagram', url: 'https://instagram.com', category: 'Social' },
      { name: 'Netflix', url: 'https://netflix.com', category: 'Social' },
      { name: 'Leetcode', url: 'https://leetcode.com', category: 'Learning' },
      { name: 'Coursera', url: 'https://coursera.org', category: 'Learning' },
      { name: 'Algo Monster', url: 'https://algomonster.com', category: 'Learning' }
    ];
  }

  async load() {
    const keys = ['user', 'settings', 'dailyFocus', 'notes', 'links', 'timer'];
    const data = await StorageService.getLocal(keys);
    
    if (data.user) this.state.user = data.user;
    if (data.settings) this.state.settings = data.settings;
    if (data.dailyFocus) this.state.dailyFocus = data.dailyFocus;
    if (data.notes) this.state.notes = data.notes;
    if (data.links) this.state.links = data.links;
    if (data.timer) {
      this.state.timer = { 
        ...this.state.timer, 
        ...data.timer, 
        running: false, 
        interval: null 
      };
    }

    // Ensure we have some default links if empty
    if (!this.state.links || this.state.links.length === 0) {
      this.state.links = this.getDefaultLinks();
      await this.save();
    }
  }

  async save() {
    await StorageService.setLocal({
      user: this.state.user,
      settings: this.state.settings,
      dailyFocus: this.state.dailyFocus,
      notes: this.state.notes,
      links: this.state.links,
      timer: {
        mode: this.state.timer.mode,
        remaining: this.state.timer.remaining,
        targetTime: this.state.timer.targetTime
      }
    });
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.save();
  }

  update(key, partialValue) {
    this.state[key] = { ...this.state[key], ...partialValue };
    this.save();
  }
}
