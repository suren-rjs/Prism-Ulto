import { AuthService } from '../services/AuthService.js';

export class Identity {
  constructor(stateManager, onIdentityChanged) {
    this.stateManager = stateManager;
    this.onIdentityChanged = onIdentityChanged;
    this.greetingEl = document.getElementById('greetingText');
    this.avatarEl = document.getElementById('userAvatar');
  }

  async init() {
    this.updateGreeting();
    this.updateAvatar();

    const token = await AuthService.getAuthToken(false);
    if (token) {
      this.fetchUserInfo(token);
    } else {
      this.avatarEl.addEventListener('click', () => {
        AuthService.getAuthToken(true).then(t => t && this.fetchUserInfo(t));
      });
    }
  }

  async fetchUserInfo(token) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      const user = this.stateManager.get('user');
      if (data.name) user.name = data.given_name || data.name.split(' ')[0];
      if (data.picture) user.avatar = data.picture;
      
      this.stateManager.set('user', user);
      this.updateGreeting();
      this.updateAvatar();
      
      if (this.onIdentityChanged) {
        this.onIdentityChanged(token);
      }
    } catch (e) {
      console.error("Identity fetch failed", e);
    }
  }

  updateGreeting() {
    const user = this.stateManager.get('user');
    const hour = new Date().getHours();
    let g = 'Good morning';
    if (hour >= 12 && hour < 17) g = 'Good afternoon';
    if (hour >= 17) g = 'Good evening';
    this.greetingEl.textContent = `${g}, ${user.name}`;
  }

  updateAvatar() {
    const user = this.stateManager.get('user');
    if (user.avatar) {
      this.avatarEl.innerHTML = `<img src="${user.avatar}" alt="Avatar">`;
    } else {
      this.avatarEl.textContent = user.name[0].toUpperCase();
    }
  }
}
