<template>
  <section class="panel product-panel">
    <div class="section-heading">
      <div><p class="eyebrow">KIT PARA TU PROYECTO</p><h2>Arma tu monitor inteligente</h2><p class="muted">Componentes para medir el nivel del agua y mostrarlo en pantalla.</p></div>
      <span class="product-badge">Kit de demostración</span>
    </div>
    <div class="product-layout">
      <div class="product-art" aria-label="Ilustración de los componentes del kit">
        <div class="board-art"><span>ESP32</span><div class="board-pins"></div><div class="chip"></div><div class="antenna"></div></div>
        <div class="sensor-art"><div class="sensor-eye"></div><div class="sensor-eye"></div><div class="sensor-label">HC-SR04</div></div>
        <div class="screen-art"><div class="screen-display"><span>AGUA</span><strong>68%</strong><i></i></div><div class="screen-label">IPS 1.54"</div></div>
      </div>
      <div class="product-info">
        <span class="product-stock"><i></i> Producto demostrativo</span>
        <h3>Kit AguaSmart ESP32</h3>
        <p>Incluye una placa ESP32, sensor ultrasónico HC-SR04 y pantalla TFT IPS de 1.54 pulgadas (240 × 240 px).</p>
        <ul><li>Lectura de distancia sin contacto</li><li>Visualización local en pantalla</li><li>Base para conexión futura a la web</li></ul>
        <div class="price-row"><div><span class="muted">Precio de demostración</span><strong class="product-price">$1,499.00 <small>MXN</small></strong></div><span class="secure-note">Pago de prueba con Stripe</span></div>
        <button class="btn btn-primary buy-button" :disabled="loading" @click="$emit('buy')">
          {{ loading ? 'Preparando pago…' : 'Comprar kit de demostración →' }}
        </button>
        <p class="muted tiny">El pago requiere configurar el backend y las claves de Stripe en modo de prueba. No se enviará ningún cargo real si se usan claves de prueba.</p>
      </div>
    </div>
  </section>
</template>
<script setup>
defineProps({ loading: { type: Boolean, default: false } })
defineEmits(['buy'])
</script>
