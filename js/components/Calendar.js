import { AuthService } from '../services/AuthService.js';

export class Calendar {
  constructor(onIdentityRequired) {
    this.container = document.getElementById('calendarEvents');
    this.onIdentityRequired = onIdentityRequired;
  }

  async init(passedToken) {
    const token = passedToken || await AuthService.getAuthToken(false);
    
    if (!token) {
      this.container.innerHTML = '<button id="connectGoogleBtn" class="btn-minimal">Connect Google</button>';
      document.getElementById('connectGoogleBtn').onclick = () => {
        if (this.onIdentityRequired) this.onIdentityRequired();
      };
      return;
    }

    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + new Date().toISOString() + '&maxResults=5&singleEvents=true&orderBy=startTime', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      this.renderEvents(data.items || []);
    } catch (e) {
      this.container.innerHTML = '<p class="status-msg">Failed to load calendar</p>';
    }
  }

  renderEvents(events) {
    if (events.length === 0) {
      this.container.innerHTML = '<p class="status-msg">No upcoming events</p>';
      return;
    }
    this.container.innerHTML = events.map(e => {
      const start = e.start.dateTime || e.start.date;
      const time = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="event-item">
          <div style="font-weight:500">${e.summary}</div>
          <div style="color:var(--text-secondary); font-size: 0.8rem;">${time}</div>
        </div>
      `;
    }).join('');
  }
}
