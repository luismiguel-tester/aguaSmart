<template>
  <div class="app-shell">
    <section v-if="!user" class="login-screen">
      <div class="login-glow glow-one"></div><div class="login-glow glow-two"></div>
      <div class="login-card">
        <div class="brand-mark">A<span>·</span></div>
        <p class="eyebrow">INTERNET DE LAS COSAS · IoT</p>
        <h1>Agua<span>Smart</span></h1>
        <p class="login-description">Monitorea el nivel del agua, consulta el clima y explora nuestro kit inteligente desde un solo lugar.</p>
        <div class="feature-strip"><span>◉ Monitoreo</span><span>↗ Clima</span><span>◇ Kit IoT</span></div>
        <div class="login-divider"><span>Inicia sesión para continuar</span></div>

        <div v-if="!supabaseConfigured" class="setup-notice">
          <strong>Configuración pendiente</strong>
          <p>Completa las variables de <code>.env</code> para activar los proveedores de autenticación.</p>
        </div>
        <div class="google-wrap"><div id="google-button"></div></div>
        <button class="social-button github-button" :disabled="githubLoading || !supabaseConfigured" @click="loginOAuth('github')">
          <span class="social-icon github-icon">●</span>{{ githubLoading ? 'Conectando con GitHub…' : 'Continuar con GitHub' }}
        </button>
        <button class="social-button facebook-button" :disabled="facebookLoading || !supabaseConfigured" @click="loginOAuth('facebook')">
          <span class="social-icon facebook-icon">f</span>{{ facebookLoading ? 'Conectando con Facebook…' : 'Continuar con Facebook' }}
        </button>
        <p v-if="authError" class="error-message">{{ authError }}</p>
        <p class="login-footnote">Acceso protegido mediante los proveedores configurados en tu proyecto.</p>
      </div>
      <p class="login-bottom">AGUASMART · PROTOTIPO WEB</p>
    </section>

    <template v-else>
      <aside class="sidebar">
        <div class="sidebar-brand"><span class="brand-mark small-mark">A<span>·</span></span><span>AguaSmart</span></div>
        <p class="sidebar-label">MENÚ PRINCIPAL</p>
        <button v-for="item in navItems" :key="item.id" class="nav-item" :class="{ active: activeView === item.id }" @click="activeView = item.id">
          <span class="nav-symbol">{{ item.icon }}</span>{{ item.label }}
        </button>
        <div class="sidebar-bottom">
          <div class="connection-card"><span class="connection-dot"></span><div><strong>Modo demostración</strong><small>Sin hardware conectado</small></div></div>
          <div class="sidebar-user"><img v-if="user.picture" :src="user.picture" alt="" /><div v-else class="avatar-placeholder">{{ user.name?.charAt(0) || 'U' }}</div><div class="user-meta"><strong>{{ user.name }}</strong><small>{{ user.provider }}</small></div></div>
          <button class="logout-button" @click="signOut">Cerrar sesión ↗</button>
        </div>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div><p class="eyebrow">PANEL DE CONTROL</p><h1>{{ currentTitle }}</h1></div>
          <div class="topbar-right"><span class="live-pill"><i></i> Sistema activo</span><div class="topbar-avatar">{{ user.name?.charAt(0) || 'U' }}</div></div>
        </header>

        <section v-if="activeView === 'dashboard'" class="view-content">
          <div class="welcome-banner"><div><p class="eyebrow">BIENVENIDO DE NUEVO</p><h2>Hola, {{ firstName }} 👋</h2><p>Este es el resumen de tu sistema de monitoreo de agua.</p></div><div class="banner-water">〰</div></div>
          <TankMonitor />
          <ProductKit :loading="checkoutLoading" @buy="startCheckout" />
          <p v-if="checkoutError" class="error-message checkout-error">{{ checkoutError }}</p>
        </section>

        <section v-else-if="activeView === 'weather'" class="view-content weather-view">
          <div class="view-intro"><p>Consulta el clima y compara dos fuentes meteorológicas.</p></div>
          <WeatherView />
        </section>

        <section v-else-if="activeView === 'profile'" class="view-content two-column-view">
          <Aficiones :titulo="tituloCurso" :usuario-id="idActual" :mensaje="mensajePadre" @actualizarMensaje="responderAlHijo" />
          <Peliculas :titulo="tituloCurso" :usuario-id="idActual" :mensaje="mensajePadre" @actualizarMensaje="responderAlHijo" />
          <div class="panel parent-message"><p class="eyebrow">COMUNICACIÓN ENTRE COMPONENTES</p><h3>Mensaje del componente padre</h3><p>{{ mensajePadre }}</p></div>
        </section>

        <footer class="app-footer">AguaSmart · Proyecto demostrativo · Los niveles del tanque son simulados</footer>
      </main>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import TankMonitor from './components/TankMonitor.vue'
import ProductKit from './components/ProductKit.vue'
import WeatherView from './components/WeatherView.vue'
import Aficiones from './components/Aficiones.vue'
import Peliculas from './components/Peliculas.vue'
import { supabase, supabaseConfigured } from './lib/supabase'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const user = ref(null)
const authError = ref('')
const githubLoading = ref(false)
const facebookLoading = ref(false)
const checkoutLoading = ref(false)
const checkoutError = ref('')
const activeView = ref('dashboard')
const tituloCurso = ref('Mi página web en Vue.js')
const idActual = ref(101)
const mensajePadre = ref('Texto original del Padre')
let authSubscription = null

const navItems = [
  { id: 'dashboard', label: 'Monitoreo', icon: '◉' },
  { id: 'weather', label: 'Clima', icon: '☼' },
  { id: 'profile', label: 'Aficiones y películas', icon: '▧' }
]
const firstName = computed(() => (user.value?.name || 'usuario').split(' ')[0])
const currentTitle = computed(() => navItems.find(item => item.id === activeView.value)?.label || 'Monitoreo')

function setSupabaseUser(supabaseUser) {
  const metadata = supabaseUser.user_metadata || {}
  const provider = supabaseUser.app_metadata?.provider || supabaseUser.identities?.[0]?.provider || 'OAuth'
  user.value = {
    id: supabaseUser.id,
    name: metadata.full_name || metadata.name || metadata.user_name || supabaseUser.email || `Usuario de ${provider}`,
    email: supabaseUser.email || '',
    picture: metadata.avatar_url || metadata.picture || '',
    provider: provider.charAt(0).toUpperCase() + provider.slice(1)
  }
}
function handleGoogleCredential(response) {
  try {
    const parts = response.credential.split('.')
    const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))))
    user.value = { id: payload.sub, name: payload.name || 'Usuario de Google', email: payload.email || '', picture: payload.picture || '', provider: 'Google' }
  } catch {
    authError.value = 'No se pudo leer la respuesta de Google. Verifica la configuración del cliente.'
  }
}
async function loginOAuth(provider) {
  authError.value = ''
  if (!supabaseConfigured || !supabase) {
    authError.value = 'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env, reinicia npm run dev y vuelve a intentarlo.'
    return
  }
  if (provider === 'github') githubLoading.value = true
  if (provider === 'facebook') facebookLoading.value = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/',
        scopes: provider === 'github' ? 'read:user user:email' : 'public_profile,email',
        queryParams: provider === 'github' ? { allow_signup: 'true' } : { auth_type: 'reauthenticate' }
      }
    })
    if (error) throw error
  } catch (error) {
    authError.value = error.message || `No se pudo iniciar sesión con ${provider}.`
    githubLoading.value = false
    facebookLoading.value = false
  }
}
async function signOut() {
  authError.value = ''
  if (user.value?.provider !== 'Google' && supabase) {
    const { error } = await supabase.auth.signOut()
    if (error) {
      authError.value = `No se pudo cerrar sesión: ${error.message}`
      return
    }
  }
  user.value = null
  activeView.value = 'dashboard'
  window.google?.accounts?.id?.disableAutoSelect()
  await nextTick()
  googleRenderAttempts = 0
  renderGoogleButton()
}
function responderAlHijo(nuevoTexto) { mensajePadre.value = nuevoTexto }

let googleRenderAttempts = 0
function renderGoogleButton() {
  if (user.value || !document.getElementById('google-button')) return
  if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
    const target = document.getElementById('google-button')
    if (target && !target.hasChildNodes()) {
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential })
      window.google.accounts.id.renderButton(target, { type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 300 })
    }
  } else if (googleRenderAttempts++ < 50) {
    window.setTimeout(renderGoogleButton, 100)
  }
}

async function startCheckout() {
  checkoutError.value = ''
  checkoutLoading.value = true
  try {
    const apiBase = (import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3000').replace(/\/$/, '')
    const response = await fetch(`${apiBase}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'aguasmart-kit' })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo iniciar el pago.')
    if (!data.url) throw new Error('Stripe no devolvió la URL de pago.')
    window.location.href = data.url
  } catch (error) {
    checkoutError.value = `${error.message || 'Error al iniciar el pago.'} Comprueba que el backend esté ejecutándose y que Stripe esté configurado.`
  } finally {
    checkoutLoading.value = false
  }
}

onMounted(async () => {
  if (supabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession()
    if (data?.session?.user) setSupabaseUser(data.session.user)
    const { data: authData } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) setSupabaseUser(session.user)
      else if (event === 'SIGNED_OUT' && user.value?.provider !== 'Google') user.value = null
    })
    authSubscription = authData.subscription
  }

  renderGoogleButton()

  // Stripe vuelve a la aplicación tras checkout; mostrar resultado claro.
  const params = new URLSearchParams(window.location.search)
  if (params.get('payment') === 'success') {
    checkoutError.value = '¡Stripe reportó el regreso de una sesión de pago completada! Verifica el estado en el Dashboard de Stripe.'
    window.history.replaceState({}, '', window.location.pathname)
  } else if (params.get('payment') === 'cancelled') {
    checkoutError.value = 'El pago fue cancelado; no se completó la compra.'
    window.history.replaceState({}, '', window.location.pathname)
  }
})
onUnmounted(() => authSubscription?.unsubscribe())
</script>
