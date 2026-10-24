<template>
  <section class="panel small-content-panel">
    <p class="eyebrow">CONTENIDO EXTRA</p><h2>Películas favoritas</h2>
    <p>Se conserva una sección sencilla para tu práctica de componentes padre-hijo.</p>
    <div class="hobby-tags"><span>🎬 Ciencia ficción</span><span>🚀 Aventuras</span><span>🤖 Tecnología</span></div>
    <button class="btn btn-secondary" @click="$emit('actualizarMensaje', 'El componente Películas envió un mensaje al componente padre.')">Enviar mensaje al padre</button>
    <p class="muted">{{ mensaje }}</p>
  </section>
</template>
<script setup>
defineProps({ titulo: String, usuarioId: Number, mensaje: String })
defineEmits(['actualizarMensaje'])
</script>
