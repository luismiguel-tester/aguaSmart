<template>
  <section class="panel small-content-panel">
    <p class="eyebrow">PERFIL</p><h2>{{ titulo }}</h2>
    <p>Este espacio conserva la sección de aficiones de tu proyecto Vue.</p>
    <div class="hobby-tags"><span>💻 Tecnología</span><span>💧 IoT</span><span>🌦️ Clima</span></div>
    <p class="muted">Usuario de referencia: {{ usuarioId }}</p>
    <button class="btn btn-secondary" @click="$emit('actualizarMensaje', 'El componente Aficiones envió un mensaje al componente padre.')">Enviar mensaje al padre</button>
    <p class="muted">{{ mensaje }}</p>
  </section>
</template>
<script setup>
defineProps({ titulo: String, usuarioId: Number, mensaje: String })
defineEmits(['actualizarMensaje'])
</script>
