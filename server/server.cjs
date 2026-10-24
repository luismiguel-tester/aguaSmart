require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Stripe = require('stripe')

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

const PORT = process.env.PORT || 3000
const PRODUCT = {
  id: 'aguasmart-kit',
  name: 'Kit AguaSmart ESP32 + HC-SR04 + pantalla IPS 1.54"',
  // Precio fijo del servidor (1499.00 MXN). Cambiar aquí y en ProductKit.vue si hace falta.
  priceInCents: 149900,
  currency: 'mxn'
}

app.get('/', (_req, res) => {
  res.json({ status: 'online', service: 'AguaSmart Checkout', stripeMode: 'test' })
})

app.post('/api/create-checkout-session', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    return res.status(503).json({ error: 'Configura STRIPE_SECRET_KEY con una clave secreta de prueba sk_test_ en server/.env.' })
  }

  const { productId } = req.body || {}
  if (productId !== PRODUCT.id) {
    return res.status(400).json({ error: 'Producto no válido.' })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: PRODUCT.currency,
          product_data: {
            name: PRODUCT.name,
            description: 'Kit demostrativo para proyecto de monitoreo de nivel de agua.'
          },
          unit_amount: PRODUCT.priceInCents
        },
        quantity: 1
      }],
      success_url: `${frontendUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/?payment=cancelled`,
      metadata: { product_id: PRODUCT.id }
    })
    res.json({ url: session.url })
  } catch (error) {
    console.error('Stripe Checkout error:', error.message)
    res.status(500).json({ error: 'No se pudo crear la sesión de pago. Revisa la clave de Stripe y la consola del backend.' })
  }
})

app.listen(PORT, () => {
  console.log(`AguaSmart checkout backend en http://localhost:${PORT}`)
  console.log('Stripe debe configurarse con una clave secreta de PRUEBA en server/.env')
})
