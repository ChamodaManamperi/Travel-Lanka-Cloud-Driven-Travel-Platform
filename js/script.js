/* ==========================================================
   Travel Lanka – live weather (WeatherAPI.com)
   Paste your private key below (don't publish it publicly).
   ========================================================== */

const BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';

/* WeatherAPI returns protocol-less icon URLs like //cdn.weatherapi.com/... */
function iconUrl(path) {
  return path.startsWith('//') ? `https:${path}` : path;
}

function setIcon(img, path, description) {
  img.src = iconUrl(path);
  img.alt = description;
  img.hidden = false;
}

async function loadWeather(card) {
  const { lat, lon, city } = card.dataset;

  /* One request per district: current weather + 3-day forecast
     (3 days is the maximum on the free plan). */
  const url = `${BASE_URL}?key=${encodeURIComponent(API_KEY)}&q=${lat},${lon}&days=3&aqi=no&alerts=no`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      const error = new Error(`Error ${data.error ? data.error.code : res.status}`);
      error.detail = data.error ? data.error.message : '';
      throw error;
    }

    /* ----- Weather Today ----- */
    const current = data.current;
    card.querySelector('.w-temp').textContent = `${current.temp_c.toFixed(1)}°C`;
    card.querySelector('.w-cond').textContent = current.condition.text.trim();
    setIcon(card.querySelector('.w-icon'), current.condition.icon, current.condition.text);

    /* ----- 3-day forecast tiles ----- */
    const tiles = card.querySelectorAll('.tile');
    data.forecast.forecastday.slice(0, 3).forEach((day, i) => {
      const tile = tiles[i];
      if (!tile) return;

      const dayName = new Date(`${day.date}T00:00:00Z`).toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      });

      tile.querySelector('.day').textContent = dayName;
      tile.querySelector('.temp').textContent = `${Math.round(day.day.avgtemp_c)}ºC`;
      setIcon(tile.querySelector('.icon'), day.day.condition.icon, day.day.condition.text);
    });
  } catch (err) {
    console.error(`Weather load failed for ${city}:`, err.message, err.detail || '');
    card.querySelector('.w-temp').textContent = 'N/A';
    card.querySelector('.w-cond').textContent = err.message || 'Unavailable';
  }
}

document.querySelectorAll('.card[data-lat]').forEach(loadWeather);