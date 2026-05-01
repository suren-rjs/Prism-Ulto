export class Weather {
  constructor() {
    this.iconEl = document.getElementById('weatherIcon');
    this.tempEl = document.getElementById('weatherTemp');
  }

  init() {
    this.getLocation();
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.fetchWeather(pos.coords.latitude, pos.coords.longitude),
        (err) => console.warn('Weather: Location access denied or unavailable.')
      );
    }
  }

  async fetchWeather(lat, lon) {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      this.render(data.current_weather);
    } catch (e) {
      console.error('Weather fetch failed', e);
    }
  }

  render(weather) {
    const { temperature, weathercode } = weather;
    this.tempEl.textContent = `${Math.round(temperature)}°C`;
    
    // Clear previous classes
    this.iconEl.className = 'weather-icon';
    
    // Map WMO Weather interpretation codes (WW)
    // 0: Clear sky -> sunny
    // 1-3: Mainly clear, partly cloudy, and overcast -> cloudy
    // 51-67: Rain, Drizzle -> rainy
    // 71-86: Snow -> rainy (using rainy animation for simplicity or could add snow)
    
    if (weathercode === 0) {
      this.iconEl.classList.add('weather-sunny');
    } else if (weathercode >= 1 && weathercode <= 3) {
      this.iconEl.classList.add('weather-cloudy');
    } else if (weathercode >= 51 && weathercode <= 67) {
      this.iconEl.classList.add('weather-rainy');
    } else {
      this.iconEl.classList.add('weather-cloudy'); // default
    }
  }
}
