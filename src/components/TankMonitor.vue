<template>
  <section class="panel tank-panel">
    <div class="section-heading">
      <div>
        <p class="eyebrow">MONITOREO DEL DEPÓSITO</p>
        <h2>Nivel de agua</h2>
        <p class="muted">Actualización automática cada 2.5 segundos</p>
      </div>
      <span class="simulation-pill"><span class="pulse-dot"></span> Modo simulación</span>
    </div>

    <div class="tank-layout">
      <div class="tank-visual-wrap">
        <div class="tank-visual" aria-label="Representación visual del tanque">
          <div class="tank-cap"></div>
          <div class="tank-body">
            <div class="water" :style="{ height: `${level}%` }">
              <div class="wave wave-one"></div>
              <div class="wave wave-two"></div>
            </div>
            <div class="tank-scale">
              <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
            </div>
            <div class="tank-level-label">{{ level }}%</div>
          </div>
          <div class="tank-foot"></div>
        </div>
        <p class="tank-caption">Tanque de referencia · {{ capacity.toLocaleString('es-MX') }} L</p>
      </div>

      <div class="tank-stats">
        <article class="metric-card primary-metric">
          <div class="metric-top"><span>Volumen estimado</span><span class="metric-icon">◉</span></div>
          <strong>{{ liters.toLocaleString('es-MX') }} <small>L</small></strong>
          <div class="progress-track"><div class="progress-value" :style="{ width: `${level}%` }"></div></div>
          <p>{{ level }}% de capacidad</p>
        </article>
        <article class="metric-card">
          <div class="metric-top"><span>Distancia simulada</span><span class="metric-icon">↕</span></div>
          <strong>{{ distance.toFixed(1) }} <small>cm</small></strong>
          <p>Desde el sensor hasta el agua</p>
        </article>
        <article class="metric-card">
          <div class="metric-top"><span>Estado del depósito</span><span class="metric-icon">◈</span></div>
          <strong class="status-text" :class="statusClass">{{ status }}</strong>
          <p>Última lectura: {{ lastUpdated }}</p>
        </article>
      </div>
    </div>

    <div class="chart-area">
      <div class="chart-heading">
        <div><h3>Historial reciente</h3><p class="muted">Nivel de agua en los últimos registros</p></div>
        <span class="chart-legend"><i></i> Nivel (%)</span>
      </div>
      <svg class="history-chart" viewBox="0 0 700 180" role="img" aria-label="Gráfica simulada del nivel de agua">
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#24c8e5" stop-opacity=".32" />
            <stop offset="100%" stop-color="#24c8e5" stop-opacity="0" />
          </linearGradient>
        </defs>
        <g class="chart-grid">
          <line v-for="n in [25,50,75,100]" :key="n" x1="34" :y1="160 - n * 1.35" x2="690" :y2="160 - n * 1.35" />
        </g>
        <polygon :points="chartAreaPoints" fill="url(#chartFill)" />
        <polyline :points="chartPoints" fill="none" stroke="#25c6e3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <text v-for="n in [0,25,50,75,100]" :key="n" x="2" :y="164 - n * 1.35" class="chart-label">{{ n }}</text>
      </svg>
    </div>

    <div class="simulation-controls">
      <div><strong>Controles de demostración</strong><p class="muted">Cambia el nivel manualmente; la simulación seguirá actualizándose.</p></div>
      <div class="control-buttons">
        <button class="btn btn-secondary" @click="adjust(-10)">− Vaciar 10%</button>
        <button class="btn btn-secondary" @click="adjust(10)">＋ Llenar 10%</button>
        <button class="btn btn-quiet" @click="resetSimulation">Reiniciar</button>
      </div>
    </div>
    <p class="disclaimer">Estos valores son ficticios para probar la interfaz. No provienen de un ESP32 ni de un sensor físico.</p>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const capacity = 1000
const tankDepthCm = 120
const level = ref(68)
const history = ref(Array.from({ length: 22 }, (_, i) => Math.max(10, Math.min(95, 64 + Math.sin(i / 3) * 8 + (i % 4) * 1.5))))
const lastUpdated = ref('--:--:--')
let timer = null

const liters = computed(() => Math.round(capacity * level.value / 100))
const distance = computed(() => (tankDepthCm * (100 - level.value) / 100))
const status = computed(() => level.value <= 20 ? 'Nivel bajo' : level.value >= 90 ? 'Casi lleno' : 'Normal')
const statusClass = computed(() => level.value <= 20 ? 'status-low' : level.value >= 90 ? 'status-high' : 'status-ok')
const chartPoints = computed(() => history.value.map((v, i) => `${34 + i * (656 / Math.max(history.value.length - 1, 1))},${160 - v * 1.35}`).join(' '))
const chartAreaPoints = computed(() => `34,160 ${chartPoints.value} 690,160`)

function stamp() {
  lastUpdated.value = new Date().toLocaleTimeString('es-MX')
}
function pushReading(value) {
  level.value = Math.max(0, Math.min(100, Math.round(value)))
  history.value = [...history.value.slice(-29), level.value]
  stamp()
}
function tick() {
  // Movimiento pequeño y gradual para simular cambios del nivel.
  const delta = Math.random() > 0.52 ? Math.random() * 2.4 : -Math.random() * 2.0
  pushReading(level.value + delta)
}
function adjust(delta) { pushReading(level.value + delta) }
function resetSimulation() {
  history.value = Array(22).fill(68)
  pushReading(68)
}
onMounted(() => {
  stamp()
  timer = window.setInterval(tick, 2500)
})
onUnmounted(() => window.clearInterval(timer))
</script>
