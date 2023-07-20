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
const {algunaOtraPregunta, getRandomResponse} = require("./response");
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

  function ciudad(agent) {
    agent.add("Muchas gracias, ¿cómo puedo ayudarle?");
    sessionVars.ciudad = agent.parameters["location"].city;
  }

  function dudasTratamiento(agent) {
    agent.add("El tratamiento que realizamos en Arias Medical Clinic es la escleroterapia, que consiste en la aplicación de una espuma intravenosa que permite la reabsorción de las venas varicosas.");
    agent.add("El tratamiento no es doloroso, no requiere cirugía ni reposo y es mínimamente invasivo.");
    agent.add(algunaOtraPregunta());
  }

  function informesCausasVarices(agent) {
    agent.add("Las varices pueden tener varias causas, como predisposición genética, obesidad, embarazo, falta de actividad física, estar de pie o sentado durante largos períodos de tiempo, y daño en las válvulas venosas que impiden un flujo sanguíneo adecuado.");
    agent.add(algunaOtraPregunta());
  }

  function informesComplicacionesVaricesNoTratadas(agent) {
    agent.add("Si las varices no se tratan, pueden provocar complicaciones como úlceras venosas, flebitis (inflamación de las venas), sangrado e infecciones en la piel.");
    agent.add(algunaOtraPregunta());
  }

  function informesContraindicaciones(agent) {
    agent.add("Existen contraindicaciones para el tratamiento: El paciente tiene que poder caminar, no tener hemofilia y no estar embarazada en caso de ser mujer.");
    agent.add(algunaOtraPregunta());
  }

  function informesEscleroterapia(agent) {
    agent.add("La escleroterapia consiste en la aplicación de una espuma intravenosa que permite la reabsorción de la vena anormal.");
    agent.add("A continuación le dejo un enlace para que pueda visualizar como funciona el tratamiento.");
    agent.add("**https://www.facebook.com/reel/1334731977322595**");
    agent.add(algunaOtraPregunta());
  }

  function informesEspecialidadMedicos(agent) {
    agent.add("Le sugiero buscar al doctor Luis René Arias Villarroel en Google.");
    agent.add("**https://www.google.com/search?q=luis+ren%C3%A9+arias+villarroel**");
    agent.add(algunaOtraPregunta());
  }

  function informesEstudioDoppler(agent) {
    agent.add("El estudio Doppler es un ultrasonido que permite al médico ver y evaluar la circulación de la sangre a través de arterias y venas del cuerpo.");
    agent.add(algunaOtraPregunta());
  }

  function informesEstudiosParaValoracionDeLumbalgia(agent) {
    agent.add("Radiografía lumbar anteroposterior y lateral, menor a 30 días.");
    agent.add(algunaOtraPregunta());
  }

  function informesFacturacion(agent) {
    agent.add(getRandomResponse(["Es correcto, podemos emitirle la factura.", "Claro que sí. Podemos emitirle factura sin problema."]));
    agent.add(algunaOtraPregunta());
  }

  function informesFlebologia(agent) {
    agent.add("La flebología es una rama de la medicina que se enfoca en el estudio, diagnóstico y tratamiento de las enfermedades relacionadas con las venas, como las varices, las trombosis venosas y las úlceras venosas.");
    agent.add(algunaOtraPregunta());
  }

  function informesNumeroSesiones(agent) {
    agent.add("Cada caso es diferentes, todo depende del resultado de su evaluación con el médico.");
    agent.add(algunaOtraPregunta());
  }

  function informesOpcionesTratamientoVarices(agent) {
    agent.add("En Arias Medical Clinic trabajamos con Escleroterapia, que consiste en la aplicación de una espuma intravenosa que permite la reabsorción de las venas varicosas.");
    agent.add(algunaOtraPregunta());
  }

  function informesPosibilidadPrevenirVarices(agent) {
    agent.add("Si bien no se puede prevenir completamente la aparición de varices, puedes reducir el riesgo al mantener un peso saludable, hacer ejercicio regularmente, evitar estar de pie o sentado durante períodos prolongados.");
    agent.add(algunaOtraPregunta());
  }

  // Dar precio de acuerdo al lugar de donde nos escriba
  function informesPrecioConsulta(agent) {
    agent.add("Un momento, le comunico con alguien para que le de informes sobre el precio de la consulta.");
    agent.add(algunaOtraPregunta());
  }

  function informesQueIncluyeConsulta(agent) {
    agent.add("La consulta que incluye un estudio Doppler y de Transiluminación tiene un costo de $750 MXN.");
    agent.add(algunaOtraPregunta());
  }

  function informesReposoDespuesDelTratamiento(agent) {
    agent.add("El tratamiento es totalmente ambulatorio, es decir, no se requiere estar hospitalizado o en cama.");
    agent.add(algunaOtraPregunta());
  }

  function informesSeguridadDelTratamiento(agent) {
    agent.add("El tratamiento que realizamos es sin cirugía sin reposo con excelentes resultados con más de 30 años de experiencia.");
    agent.add(algunaOtraPregunta());
  }

  function informesSintomasVarices(agent) {
    agent.add("Los síntomas comunes de las varices son dolor o sensación de pesadez en las piernas, calambres musculares, comezón, hinchazón.");
    agent.add(algunaOtraPregunta());
  }

  function informesTiempoResultados(agent) {
    agent.add("El tiempo que tardan en desaparecer las várices por completo puede variar de una persona a otra.");
    agent.add("En la mayoría de los casos, las varices tratadas con escleroterapia comienzan a desvanecerse en unas pocas semanas.");
    agent.add(algunaOtraPregunta());
  }

  function informesTransiluminacion(agent) {
    agent.add("Transiluminación es el estudio que se hace con la ayuda de una lámpara especial que nos permite hacer un mapeo profundo de la vena.");
    agent.add(algunaOtraPregunta());
  }

  function informesTratamiento(agent) {
    agent.add("El tratamiento que realizamos se llama escleroterapia, consiste en la aplicación de una espuma intravenosa que permite la reabsorción de la vena anormal.");
    agent.add(algunaOtraPregunta());
  }

  function informesTriggerPoint(agent) {
    agent.add("Es una técnica terapéutica de punción basada en dos conceptos; en primer lugar busca reducir dolor y la sensibilidad y en segundo lugar busca tratar el factor desencadenante para lograr devolver la funcionalidad al músculo.");
    agent.add(algunaOtraPregunta());
  }

  // Mostrar una lista de las clínicas y devolver la ubicación con Google Maps de acuerdo a eso
  function informesUbicacionClinicas(agent) {
    agent.add("Por favor, elija una clínica: ");
  }

  // Default Fallback Intent
  function fallback(agent) {
    agent.add("Una disculpa, no le entendí bien. ¿Podría repetírmelo?");
  }

  const intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("ciudad", ciudad);
  intentMap.set("dudasTratamiento", dudasTratamiento);
  intentMap.set("informesCausasVarices", informesCausasVarices);
  intentMap.set("informesComplicacionesVaricesNoTratadas", informesComplicacionesVaricesNoTratadas);
  intentMap.set("informesContraindicaciones", informesContraindicaciones);
  intentMap.set("informesEscleroterapia", informesEscleroterapia);
  intentMap.set("informesEspecialidadMedicos", informesEspecialidadMedicos);
  intentMap.set("informesEstudioDoppler", informesEstudioDoppler);
  intentMap.set("informesEstudiosParaValoracionDeLumbalgia", informesEstudiosParaValoracionDeLumbalgia);
  intentMap.set("informesFacturacion", informesFacturacion);
  intentMap.set("informesFlebologia", informesFlebologia);
  intentMap.set("informesNumeroSesiones", informesNumeroSesiones);
  intentMap.set("informesOpcionesTratamientoVarices", informesOpcionesTratamientoVarices);
  intentMap.set("informesPosibilidadPrevenirVarices", informesPosibilidadPrevenirVarices);
  intentMap.set("informesPrecioConsulta", informesPrecioConsulta);
  intentMap.set("informesQueIncluyeConsulta", informesQueIncluyeConsulta);
  intentMap.set("informesReposoDespuesDelTratamiento", informesReposoDespuesDelTratamiento);
  intentMap.set("informesSeguridadDelTratamiento", informesSeguridadDelTratamiento);
  intentMap.set("informesSintomasVarices", informesSintomasVarices);
  intentMap.set("informesTiempoResultados", informesTiempoResultados);
  intentMap.set("informesTransiluminacion", informesTransiluminacion);
  intentMap.set("informesTratamiento", informesTratamiento);
  intentMap.set("informesTriggerPoint", informesTriggerPoint);
  intentMap.set("informesUbicacionClinicas", informesUbicacionClinicas);
  intentMap.set("Default Fallback Intent", fallback);

  agent.handleRequest(intentMap);
});

const production = true;

if (production) {
  exports.amcbot = onRequest(server);
} else {
  // Para ejecutar el servidor en local y hacer pruebas
  server.listen(PORT, () => {
    console.log("Servidor local funcionando!");
  });
}
