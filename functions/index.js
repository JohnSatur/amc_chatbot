/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
"use strict";

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
*/

// Librerías
const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
const express = require("express");
const path = require("path");
const {WebhookClient} = require("dialogflow-fulfillment");
const serviceAccount = require("./config/amc-chatbot-hxqi-a17e81df7024.json");
const admin = require("firebase-admin");

// Configuración del servidor
const server = express();
server.use(express.urlencoded({extended: true}));
server.use(express.json());
server.use("/img", express.static(path.join(__dirname, "/img")));

// Inicializar cuenta de servicio de Firebase
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.log("Error de inicialización de la cuenta de servicio de Firebase: " + error);
}

// Si alguien quiere acceder al directorio raiz (método GET)
server.get("/", (req, res) => {
  return res.json("Buenas tardes, le saluda el asistente virtual de Arias Medical Clinic. Esta no es la forma correcta de interactuar conmigo. Si necesita información sobre el tratamiento puede hacerlo desde WhatsApp o Messenger.");
});

// Acceso correcto al agente (método POST)
server.post("/amcbot", (req, res) => {
  const agent = new WebhookClient({request: req, response: res});

  // Default Welcome Intent
  function welcome(agent) {
    agent.add("Saludos cordiales de parte del Dr. Luis René Arias Villarroel. Soy un asistente virtual listo para resolver sus dudas.");
    agent.add("Si tiene alguna pregunta sobre el tratamiento, información sobre nuestros servicios o desea agendar una cita, Estoy para servirle.");
  }

  // Default Fallback Intent
  function fallback(agent) {
    agent.add("Una disculpa, no le entendí bien. ¿Podría repetírmelo?");
  }

  const intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);

  agent.handleRequest(intentMap);
});

const production = true;

if (production) {
  exports.amcbot = onRequest(server);
} else {
  // Para ejecutar el servidor en local y hacer pruebas
  server.listen(process.env.PORT || 8000, () => {
    console.log("Servidor local funcionando!");
  });
}
