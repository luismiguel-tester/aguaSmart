<template>
  <div class="app-clima">
    <div class="fondo-decoracion decoracion-1"></div>
    <div class="fondo-decoracion decoracion-2"></div>

    <main class="contenedor">
      <header class="encabezado">
        <div class="logo-clima">☀️</div>
        <h1>Clima<span>Now</span></h1>
        <p>Consulta y compara el clima de dos APIs</p>
      </header>

      <section class="buscador">
        <div class="campo-busqueda">
          <span class="icono-busqueda">📍</span>
          <input
            v-model="ciudad"
            placeholder="Escribe una ciudad..."
            aria-label="Nombre de la ciudad"
            @keyup.enter="obtenerClima"
          />
        </div>

        <button
          class="boton-buscar"
          @click="obtenerClima"
          :disabled="cargando"
        >
          {{ cargando ? 'Buscando...' : 'Comparar clima' }}
        </button>
      </section>

      <div v-if="cargando" class="estado carga">
        <div class="spinner"></div>
        <p>Consultando las dos APIs meteorológicas...</p>
      </div>

      <section
        v-if="!cargando && !climaOpenMeteo && !climaOpenWeather && !error && !errorOpenMeteo && !errorOpenWeather"
        class="bienvenida"
      >
        <div class="bienvenida-icono">🌤️</div>
        <h2>¿Qué clima hace hoy?</h2>
        <p>
          Escribe una ciudad para comparar los datos de Open-Meteo
          y OpenWeatherMap.
        </p>
      </section>

      <section
        v-if="ciudadConsultada && !cargando"
        class="comparacion"
      >
        <div class="titulo-seccion">
          <h2>Comparación del clima</h2>
          <p>{{ ciudadConsultada }}</p>
        </div>

        <div class="apis-grid">
          <article class="api-card">
            <div class="api-encabezado">
              <span class="api-icono">🌍</span>
              <div>
                <h3>Open-Meteo</h3>
                <span class="api-etiqueta">API 1</span>
              </div>
            </div>

            <div v-if="climaOpenMeteo" class="api-datos">
              <div class="icono-tiempo">{{ climaOpenMeteo.icono }}</div>
              <div class="api-temperatura">
                {{ climaOpenMeteo.temperatura }}<sup>°C</sup>
              </div>
              <p class="api-descripcion">{{ climaOpenMeteo.descripcion }}</p>

              <div class="api-detalle">
                <span>💨 Viento</span>
                <strong>{{ climaOpenMeteo.viento }} km/h</strong>
              </div>
              <div class="api-detalle">
                <span>🌡️ Sensación</span>
                <strong>{{ climaOpenMeteo.sensacion }} °C</strong>
              </div>
            </div>

            <p v-else-if="errorOpenMeteo" class="api-error">
              ⚠️ {{ errorOpenMeteo }}
            </p>
            <p v-else class="api-espera">No hay datos disponibles.</p>
          </article>

          <article class="api-card api-card-secundaria">
            <div class="api-encabezado">
              <span class="api-icono">🌦️</span>
              <div>
                <h3>OpenWeatherMap</h3>
                <span class="api-etiqueta api-etiqueta-2">API 2</span>
              </div>
            </div>

            <div v-if="climaOpenWeather" class="api-datos">
              <div class="icono-tiempo">{{ climaOpenWeather.icono }}</div>
              <div class="api-temperatura">
                {{ climaOpenWeather.temperatura }}<sup>°C</sup>
              </div>
              <p class="api-descripcion">{{ climaOpenWeather.descripcion }}</p>

              <div class="api-detalle">
                <span>💨 Viento</span>
                <strong>{{ climaOpenWeather.viento }} km/h</strong>
              </div>
              <div class="api-detalle">
                <span>💧 Humedad</span>
                <strong>{{ climaOpenWeather.humedad }}%</strong>
              </div>
              <div class="api-detalle">
                <span>🌡️ Sensación</span>
                <strong>{{ climaOpenWeather.sensacion }} °C</strong>
              </div>
            </div>

            <p v-else-if="errorOpenWeather" class="api-error">
              ⚠️ {{ errorOpenWeather }}
            </p>
            <p v-else class="api-espera">No hay datos disponibles.</p>
          </article>
        </div>

        <div
          v-if="climaOpenMeteo && climaOpenWeather"
          class="comparacion-final"
        >
          <span>📊 Diferencia de temperatura</span>
          <strong>
            {{ Math.abs(climaOpenMeteo.temperatura - climaOpenWeather.temperatura) }} °C
          </strong>
        </div>
      </section>

      <div v-if="error && !cargando" class="mensaje-error">
        <span>⚠️</span>
        <p>{{ error }}</p>
      </div>

      <footer class="pie">
        <p>Datos de Open-Meteo y OpenWeatherMap</p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const ciudad = ref('');
const ciudadConsultada = ref('');
const climaOpenMeteo = ref(null);
const climaOpenWeather = ref(null);
const error = ref('');
const errorOpenMeteo = ref('');
const errorOpenWeather = ref('');
const cargando = ref(false);

// DEMO: pega aquí tu clave real de OpenWeatherMap entre las comillas.
const API_KEY_OPENWEATHER = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

const obtenerDescripcion = (codigo) => {
  const condiciones = {
    0: { descripcion: 'Despejado', icono: '☀️' },
    1: { descripcion: 'Mayormente despejado', icono: '🌤️' },
    2: { descripcion: 'Parcialmente nublado', icono: '⛅' },
    3: { descripcion: 'Nublado', icono: '☁️' },
    45: { descripcion: 'Niebla', icono: '🌫️' },
    48: { descripcion: 'Niebla con escarcha', icono: '🌫️' },
    51: { descripcion: 'Llovizna ligera', icono: '🌦️' },
    53: { descripcion: 'Llovizna moderada', icono: '🌦️' },
    55: { descripcion: 'Llovizna intensa', icono: '🌧️' },
    61: { descripcion: 'Lluvia ligera', icono: '🌦️' },
    63: { descripcion: 'Lluvia moderada', icono: '🌧️' },
    65: { descripcion: 'Lluvia intensa', icono: '🌧️' },
    71: { descripcion: 'Nieve ligera', icono: '🌨️' },
    73: { descripcion: 'Nieve moderada', icono: '❄️' },
    75: { descripcion: 'Nieve intensa', icono: '❄️' },
    80: { descripcion: 'Chubascos ligeros', icono: '🌦️' },
    81: { descripcion: 'Chubascos moderados', icono: '🌧️' },
    82: { descripcion: 'Chubascos intensos', icono: '⛈️' },
    95: { descripcion: 'Tormenta eléctrica', icono: '⛈️' },
    96: { descripcion: 'Tormenta con granizo', icono: '⛈️' },
    99: { descripcion: 'Tormenta intensa con granizo', icono: '⛈️' }
  };

  return condiciones[codigo] || {
    descripcion: 'Condiciones variables',
    icono: '🌤️'
  };
};

const consultarOpenMeteo = async (latitude, longitude) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('No se pudieron obtener los datos de Open-Meteo.');
  }

  const data = await response.json();
  const actual = data.current;
  const condicion = obtenerDescripcion(actual.weather_code);

  return {
    temperatura: Math.round(actual.temperature_2m),
    sensacion: Math.round(actual.apparent_temperature),
    viento: Math.round(actual.wind_speed_10m),
    descripcion: condicion.descripcion,
    icono: condicion.icono
  };
};

const consultarOpenWeather = async (latitude, longitude) => {
  if (!API_KEY_OPENWEATHER || API_KEY_OPENWEATHER === 'PEGA_AQUI_TU_API_KEY') {
    throw new Error('Configura VITE_OPENWEATHER_API_KEY en el archivo .env para consultar esta API.');
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY_OPENWEATHER}&units=metric&lang=es`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message
        ? `OpenWeatherMap: ${data.message}`
        : 'No se pudieron obtener los datos de OpenWeatherMap.'
    );
  }

  const iconos = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Smoke: '🌫️',
    Haze: '🌫️',
    Dust: '🌫️',
    Fog: '🌫️',
    Sand: '🌫️',
    Ash: '🌫️',
    Squall: '💨',
    Tornado: '🌪️'
  };

  return {
    temperatura: Math.round(data.main.temp),
    sensacion: Math.round(data.main.feels_like),
    viento: Math.round(data.wind.speed * 3.6),
    humedad: data.main.humidity,
    descripcion: data.weather?.[0]?.description || 'Condiciones variables',
    icono: iconos[data.weather?.[0]?.main] || '🌤️'
  };
};

const obtenerClima = async () => {
  error.value = '';
  errorOpenMeteo.value = '';
  errorOpenWeather.value = '';
  climaOpenMeteo.value = null;
  climaOpenWeather.value = null;
  ciudadConsultada.value = '';

  if (!ciudad.value.trim()) {
    error.value = 'Por favor, ingresa el nombre de una ciudad.';
    return;
  }

  cargando.value = true;

  try {
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad.value.trim())}&count=1&language=es&format=json`;

    const geoRes = await fetch(geoUrl);

    if (!geoRes.ok) {
      throw new Error('No se pudo buscar la ciudad. Intenta nuevamente.');
    }

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('No encontramos esa ciudad. Revisa el nombre.');
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    ciudadConsultada.value = `${name}, ${country}`;

    // Promise.allSettled permite mostrar una API aunque la otra falle.
    const [resultadoMeteo, resultadoWeather] = await Promise.allSettled([
      consultarOpenMeteo(latitude, longitude),
      consultarOpenWeather(latitude, longitude)
    ]);

    if (resultadoMeteo.status === 'fulfilled') {
      climaOpenMeteo.value = resultadoMeteo.value;
    } else {
      errorOpenMeteo.value =
        resultadoMeteo.reason instanceof Error
          ? resultadoMeteo.reason.message
          : 'Error al consultar Open-Meteo.';
    }

    if (resultadoWeather.status === 'fulfilled') {
      climaOpenWeather.value = resultadoWeather.value;
    } else {
      errorOpenWeather.value =
        resultadoWeather.reason instanceof Error
          ? resultadoWeather.reason.message
          : 'Error al consultar OpenWeatherMap.';
    }

    if (!climaOpenMeteo.value && !climaOpenWeather.value) {
      error.value = 'Ninguna API pudo devolver datos. Revisa la conexión y la configuración de la segunda API.';
      ciudadConsultada.value = '';
    }
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Ocurrió un error al consultar el clima.';
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app-clima {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 35px 18px;
  font-family: 'Segoe UI', Arial, sans-serif;
  color: #ffffff;
  background: linear-gradient(145deg, #102c54 0%, #175a91 48%, #56a8d5 100%);
}

.fondo-decoracion {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.07);
  filter: blur(2px);
}

.decoracion-1 {
  width: 380px;
  height: 380px;
  top: -150px;
  right: -100px;
}

.decoracion-2 {
  width: 300px;
  height: 300px;
  bottom: -130px;
  left: -100px;
}

.contenedor {
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
}

.encabezado {
  text-align: center;
  margin-bottom: 30px;
}

.logo-clima {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 34px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.encabezado h1 {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
}

.encabezado h1 span {
  color: #9ee7ff;
}

.encabezado p {
  margin: 9px 0 0;
  color: #d6edff;
  font-size: 14px;
}

.buscador {
  display: flex;
  gap: 10px;
  margin-bottom: 22px;
}

.campo-busqueda {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
}

.icono-busqueda {
  font-size: 18px;
}

.campo-busqueda input {
  width: 100%;
  min-width: 0;
  padding: 15px 0;
  color: #ffffff;
  font-size: 14px;
  border: none;
  outline: none;
  background: transparent;
}

.campo-busqueda input::placeholder {
  color: #d4e9f8;
}

.boton-buscar {
  padding: 0 19px;
  border: none;
  border-radius: 15px;
  background: #ffffff;
  color: #175a91;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.boton-buscar:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #dff5ff;
}

.boton-buscar:disabled {
  opacity: 0.7;
  cursor: wait;
}

.tarjeta-clima,
.bienvenida,
.estado,
.mensaje-error {
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 55px rgba(4, 24, 49, 0.2);
}

.tarjeta-clima {
  padding: 26px;
  animation: aparecer 0.4s ease;
}

.ubicacion {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icono-ubicacion {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  font-size: 19px;
}

.ubicacion h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.ubicacion p {
  margin: 5px 0 0;
  color: #d5edff;
  font-size: 12px;
}

.clima-principal {
  padding: 25px 0 20px;
  text-align: center;
}

.icono-tiempo {
  font-size: 76px;
  line-height: 1.2;
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.12));
}

.temperatura {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 5px;
}

.temperatura span {
  font-size: 88px;
  line-height: 1;
  font-weight: 300;
  letter-spacing: -5px;
}

.temperatura sup {
  margin: 8px 0 0 5px;
  font-size: 28px;
  font-weight: 400;
}

.descripcion {
  margin: 12px 0 0;
  font-size: 18px;
  font-weight: 600;
  color: #e2f5ff;
}

.separador {
  height: 1px;
  background: rgba(255, 255, 255, 0.22);
  margin: 5px 0 22px;
}

.detalles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.detalle {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  min-width: 0;
}

.detalle-icono {
  font-size: 25px;
}

.detalle p {
  margin: 0 0 5px;
  color: #d5edff;
  font-size: 12px;
}

.detalle strong {
  font-size: 15px;
  overflow-wrap: anywhere;
}

.actualizacion {
  margin: 20px 0 0;
  color: #c9e5f8;
  font-size: 10px;
  text-align: center;
}

.bienvenida {
  padding: 32px 25px;
  text-align: center;
}

.bienvenida-icono {
  font-size: 60px;
  margin-bottom: 14px;
}

.bienvenida h2 {
  margin: 0 0 10px;
  font-size: 22px;
}

.bienvenida p {
  max-width: 300px;
  margin: 0 auto;
  color: #d5edff;
  font-size: 14px;
  line-height: 1.7;
}

.estado {
  padding: 30px;
  text-align: center;
}

.estado p {
  margin-bottom: 0;
  color: #e1f3ff;
}

.spinner {
  width: 38px;
  height: 38px;
  margin: 0 auto;
  border: 4px solid rgba(255, 255, 255, 0.25);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

.mensaje-error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: #ffffff;
  background: rgba(156, 35, 49, 0.35);
  border-color: rgba(255, 190, 190, 0.35);
}

.mensaje-error span {
  font-size: 24px;
}

.mensaje-error p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.pie {
  margin-top: 25px;
  text-align: center;
}

.pie p {
  margin: 0;
  color: #c5e4f7;
  font-size: 11px;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

@keyframes aparecer {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 420px) {
  .app-clima {
    padding: 25px 13px;
  }

  .encabezado h1 {
    font-size: 31px;
  }

  .buscador {
    gap: 7px;
  }

  .campo-busqueda {
    padding: 0 10px;
  }

  .campo-busqueda input {
    font-size: 12px;
  }

  .boton-buscar {
    padding: 0 13px;
    font-size: 12px;
  }

  .tarjeta-clima {
    padding: 20px 16px;
  }

  .temperatura span {
    font-size: 76px;
  }

  .icono-tiempo {
    font-size: 65px;
  }

  .detalles {
    gap: 8px;
  }

  .detalle {
    padding: 12px 8px;
    gap: 7px;
  }

  .detalle-icono {
    font-size: 21px;
  }

  .detalle strong {
    font-size: 13px;
  }
}

/* Comparación de las dos APIs */
.titulo-seccion {
  text-align: center;
  margin: 8px 0 20px;
}

.titulo-seccion h2 {
  margin: 0;
  font-size: 24px;
}

.titulo-seccion p {
  margin: 8px 0 0;
  color: #d5edff;
  font-size: 14px;
}

.apis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.api-card {
  min-width: 0;
  padding: 20px 15px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(18px);
  box-shadow: 0 15px 35px rgba(4, 24, 49, 0.15);
  animation: aparecer 0.4s ease;
}

.api-card-secundaria {
  background: rgba(255, 255, 255, 0.19);
}

.api-encabezado {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.api-icono {
  font-size: 27px;
}

.api-encabezado h3 {
  margin: 0;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.api-etiqueta {
  display: inline-block;
  margin-top: 5px;
  padding: 3px 8px;
  border-radius: 20px;
  color: #d9f4ff;
  background: rgba(31, 174, 255, 0.25);
  font-size: 10px;
  font-weight: 700;
}

.api-etiqueta-2 {
  color: #fff0c9;
  background: rgba(255, 204, 102, 0.25);
}

.api-datos {
  padding-top: 17px;
  text-align: center;
}

.api-card .icono-tiempo {
  font-size: 48px;
}

.api-temperatura {
  margin-top: 8px;
  font-size: 43px;
  font-weight: 300;
  letter-spacing: -2px;
}

.api-temperatura sup {
  font-size: 17px;
  vertical-align: top;
  letter-spacing: 0;
}

.api-descripcion {
  min-height: 38px;
  margin: 8px 0 17px;
  color: #e2f5ff;
  font-size: 13px;
  text-transform: capitalize;
}

.api-detalle {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 11px;
}

.api-detalle strong {
  text-align: right;
  overflow-wrap: anywhere;
}

.api-error,
.api-espera {
  margin: 18px 0 5px;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.api-error {
  color: #ffe0e0;
}

.comparacion-final {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
  padding: 16px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.13);
  font-size: 13px;
}

.comparacion-final strong {
  font-size: 19px;
  white-space: nowrap;
}

@media (max-width: 420px) {
  .apis-grid {
    grid-template-columns: 1fr;
  }

  .api-card {
    padding: 20px;
  }

  .api-encabezado h3 {
    font-size: 16px;
  }

  .api-temperatura {
    font-size: 52px;
  }
}

</style>
