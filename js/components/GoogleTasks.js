import { AuthService } from '../services/AuthService.js';

export class GoogleTasks {
  constructor() {
    this.listEl = document.getElementById('tasksList');
  }

  async init(passedToken) {
    const token = passedToken || await AuthService.getAuthToken(false);
    
    if (!token) {
      this.listEl.innerHTML = '<p class="status-msg">Click avatar to connect</p>';
      return;
    }

    try {
      const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listsData = await listsRes.json();
      const defaultList = listsData.items?.[0]?.id;

      if (defaultList) {
        const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${defaultList}/tasks?showCompleted=false`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const tasksData = await tasksRes.json();
        this.renderTasks(tasksData.items || []);
      } else {
        this.listEl.innerHTML = '<p class="status-msg">No task lists found</p>';
      }
    } catch (e) {
      this.listEl.innerHTML = '<p class="status-msg">Failed to load tasks</p>';
    }
  }

  renderTasks(tasks) {
    if (tasks.length === 0) {
      this.listEl.innerHTML = '<p class="status-msg">All caught up!</p>';
      return;
    }
    this.listEl.innerHTML = tasks.map(t => `
      <div class="task-item">
        <span>${t.title}</span>
      </div>
    `).join('');
  }
}
