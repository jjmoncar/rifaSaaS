require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Inicializar Firebase Admin (Asegúrate de configurar las credenciales o usar ADC)
// Si no provees un service account, intentará usar Application Default Credentials.
// En producción, es recomendable proveer tus credenciales de serviceAccountKey.json
try {
  admin.initializeApp();
} catch (error) {
  console.log("Firebase admin ya estaba inicializado o falló la inicialización.");
}

const app = express();
const PORT = process.env.PORT || 3001;

// Usamos body-parser para parsear el JSON de PayPal
app.use(bodyParser.json());

// Endpoint del Webhook de PayPal
app.post('/webhook/paypal', async (req, res) => {
  const event = req.body;
  console.log('Webhook de PayPal recibido:', event.event_type);

  try {
    // Escuchar cuando una suscripción se activa
    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscription = event.resource;
      const userId = subscription.custom_id;
      const planId = subscription.plan_id;

      console.log(`Suscripción activada para el usuario ${userId} con el plan ${planId}`);

      let nuevoTier = 'Free';
      // Mapear los IDs de Planes reales (A reemplazar con tus verdaderos IDs)
      if (planId === 'P-MEDIUM123') nuevoTier = 'Medium';
      if (planId === 'P-PRO456') nuevoTier = 'Pro';
      if (planId === 'P-ENTERPRISE789') nuevoTier = 'Enterprise';

      if (userId) {
        await admin.firestore().collection('users').doc(userId).update({
          tier: nuevoTier,
          paypalSubscriptionId: subscription.id,
          subscriptionStatus: 'active'
        });
        console.log(`Tier de usuario ${userId} actualizado a ${nuevoTier}.`);
      }
    }

    // Escuchar cuando una suscripción se cancela o expira
    if (
      event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ||
      event.event_type === 'BILLING.SUBSCRIPTION.EXPIRED' ||
      event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED'
    ) {
      const subscription = event.resource;
      const userId = subscription.custom_id;

      if (userId) {
        await admin.firestore().collection('users').doc(userId).update({
          tier: 'Free',
          subscriptionStatus: 'cancelled'
        });
        console.log(`Suscripción cancelada. Usuario ${userId} regresado al plan Free.`);
      }
    }

    res.status(200).send('Webhook procesado con éxito');
  } catch (error) {
    console.error('Error procesando el webhook de PayPal:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de Webhooks escuchando en el puerto ${PORT}`);
  console.log('Puedes usar ngrok (ngrok http 3001) para exponer este puerto y configurarlo en PayPal Developer.');
});
