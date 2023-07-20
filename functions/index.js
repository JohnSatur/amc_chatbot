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
// const google = require("googleapis");

// local
const {algunaOtraPregunta} = require("./response");
const sessionVars = {};

// Configuración del servidor
const server = express();
const PORT = process.env.PORT || 8000;

// *Google Calendar*
// const oauth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URL,
// );

// const scopes = ["https://www.googleapis.com/auth/calendar"];

// server.get("/google", (req, res) => {
//   const url = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: scopes,
//   });

//   res.redirect(url);
// });

// server.get("/google/redirect", (req, res) => {
//   res.send("It's working!");
// });

// *Google Calendar 16:44*

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
    agent.add("Saludos cordiales de parte del Dr. Luis René Arias Villarroel. Soy un asistente virtual listo para ayudarle a sus dudas.");
    agent.add("Si tiene alguna pregunta sobre el tratamiento, información sobre nuestros servicios o desea agendar una cita, Estoy para servirle.");
    agent.add("¿De qué ciudad nos escribe?");

    agent.context.set({
      name: "session-vars",
      lifespan: 50,
    });
  }

  // ciudad
  function ciudad(agent) {
    agent.add("Muchas gracias, ¿cómo puedo ayudarle?");
    sessionVars.ciudad = agent.parameters["location"].city;
  }

  function dudasTratamiento(agent) {
    agent.add("El tratamiento que realizamos en Arias Medical Clinic es la escleroterapia, que consiste en la aplicación de una espuma intravenosa que permite la reabsorción de las venas varicosas.");
    agent.add("El tratamiento no es doloroso, no requiere cirugía ni reposo y es mínimamente invasivo.");
    agent.add(algunaOtraPregunta());
  }

  // Default Fallback Intent
  function fallback(agent) {
    agent.add("Una disculpa, no le entendí bien. ¿Podría repetírmelo?");
  }

  const intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("ciudad", ciudad);
  intentMap.set("dudas_tratamiento", dudasTratamiento);
  intentMap.set("Default Fallback Intent", fallback);

  agent.handleRequest(intentMap);
});

const production = false;

if (production) {
  exports.amcbot = onRequest(server);
} else {
  // Para ejecutar el servidor en local y hacer pruebas
  server.listen(PORT, () => {
    console.log("Servidor local funcionando!");
  });
}
