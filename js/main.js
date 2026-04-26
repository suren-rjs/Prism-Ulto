import { StateManager } from './core/StateManager.js';
import { Clock } from './components/Clock.js';
import { StudyTimer } from './components/StudyTimer.js';
import { Notes } from './components/Notes.js';
import { Identity } from './components/Identity.js';
import { GoogleTasks } from './components/GoogleTasks.js';
import { Calendar } from './components/Calendar.js';
import { DailyFocus } from './components/DailyFocus.js';
import { QuickLinks } from './components/QuickLinks.js';
import { Search } from './components/Search.js';

class App {
  constructor() {
    this.stateManager = new StateManager();
    this.components = {};
  }

  async init() {
    await this.stateManager.load();
    this.initTheme();
    this.initComponents();
  }

  initTheme() {
    const settings = this.stateManager.get('settings');
    document.documentElement.setAttribute('data-theme', settings.theme);
  }

  initComponents() {
    // 1. Independent Components
    new Clock().init();
    new DailyFocus(this.stateManager).init();
    new QuickLinks(this.stateManager).init();
    new Search(this.stateManager).init();
    new Notes(this.stateManager).init();
    new StudyTimer(this.stateManager).init();

    // 2. Auth-Dependent Components
    const tasks = new GoogleTasks();
    const calendar = new Calendar(() => {
        // Callback if identity is required but missing
        // (Handled by AuthService.getAuthToken(true) via Identity component)
    });

    const identity = new Identity(this.stateManager, (token) => {
      // Re-init auth components when token is fetched
      tasks.init(token);
      calendar.init(token);
    });

    identity.init();
    tasks.init();
    calendar.init();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
