/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
"use strict";
// ola mundo desde git

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
let fallbackContador = 0;

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
  console.log("Conectado a la BD");
} catch (error) {
  console.log("Error de inicialización de la cuenta de servicio de Firebase: " + error);
}

// Base de datos
// const db = admin.firestore();

// Si alguien quiere acceder al directorio raiz (método GET)
server.get("/", (req, res) => {
  return res.json("Buenas tardes, le saluda el asistente virtual de Arias Medical Clinic. Esta no es la forma correcta de interactuar conmigo. Si necesita información sobre el tratamiento puede hacerlo desde WhatsApp o Messenger.");
});

// Acceso correcto al agente (método POST)
server.post("/amcbot", (req, res) => {
  const agent = new WebhookClient({request: req, response: res});

  function PruebaWindowsLocation(agent) {
    agent.add("Claro que sí. Para hablar con el doctor, por favor ingrese al siguiente enlace: ");
    agent.add("https://api.whatsapp.com/send?phone=59168184000&text=Quisiera%20Hablar%20Con%20Alguien%C3%ADa");
  }

  // Default Welcome Intent
  function welcome(agent) {
    agent.add("Saludos cordiales de parte de Arias Medical Clinic. Soy un asistente virtual listo para ayudarle a resolver sus dudas.");
    agent.add("Si tiene alguna pregunta sobre el tratamiento, información sobre nuestros servicios o desea agendar una cita, Estoy para servirle.");
    agent.add("¿De qué ciudad nos escribe?");

    agent.context.set({
      name: "session-vars",
      lifespan: 50,
    });
  }

  function ciudad(agent) {
    agent.add("Muchas gracias por escribirnos de "+agent.parameters["location"].city);
    agent.add("¿Cómo puedo ayudarle?");

    sessionVars.ciudad = agent.parameters["location"].city;
  }

  function contactarHumano(agent) {
    agent.add("Con gusto, en un momento una persona se pondrá en contacto con usted.");
  }

  function dudasTratamiento(agent) {
    agent.add("En Arias Medical Clinic hacemos tratamientos de:\n\n👉 Rehabilitación vascular\n\n👉 Rehabilitación de columna\n\n👉 Flebología\n\n👉 Linfología");
    agent.add(algunaOtraPregunta());
  }

  function dolorDeColumna(agent) {
    const alturaEspalda = agent.parameters["alturaEspalda"];

    agent.add("Entiendo, así que tiene dolor en la zona " + alturaEspalda + ".");
    agent.add("¿Tiene usted radiografías? (tienen que ser de al menos 30 días)");

    agent.context.set({
      name: "preguntar-por-radiografias",
      lifespan: 3,
    });
  }

  function dolorDeColumnaRadiografiasVigentes(agent) {
    agent.context.get("preguntar-por-radiografias");

    agent.add("Perfecto. ¿Ha sufrido usted un accidente recientemente?");

    agent.context.set({
      name: "preguntar-por-accidente",
      lifespan: 3,
    });
  }

  function dolorDeColumnaNoRadiografiasVigentes(agent) {
    agent.context.get("preguntar-por-radiografias");

    agent.add("Será necesario que saque radiografías.");
    agent.add("¿Ha sufrido usted un accidente recientemente?");

    agent.context.set({
      name: "preguntar-por-accidente",
      lifespan: 3,
    });
  }

  function dolorDeColumnaAccidente(agent) {
    agent.add("Entiendo. En un momento el doctor se pondrá en contacto con usted para dar seguimiento a su caso.");
  }

  function dolorDeColumnaNoAccidente(agent) {
    agent.add("Entiendo. En un momento el doctor se pondrá en contacto con usted para dar seguimiento a su caso.");
  }

  function informesGeneral(agent) {
    agent.add("En ARIAS MEDICAL CLINIC atendemos las siguientes áreas:\n\n👉 Flebología y Linfología para pacientes con varices, úlcera varicosa y linfedema.\n\n👉 Rehabilitación y manejo ambulatorio en pacientes con problemas de columna como: lumbalgia, ciatica, dorsalgia, cervicalgia así como  también  pacientes con dolor de cuello y adormecimiento en las manos.\n\n👉 Rehabilitación física.");
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
    agent.add("https://www.facebook.com/reel/1334731977322595");
    agent.add(algunaOtraPregunta());
  }

  function informesDolorEscleroterapia(agent) {
    agent.context.get("escleroterapia");
    agent.add("El dolor es mínimo, pero los resultados son realmente gratificantes.");
    agent.add(algunaOtraPregunta());
  }

  function informesEspecialidadMedicos(agent) {
    agent.add("Son médicos cirujanos especializados en rehabilitación física y vascular con larga trayectoria en flebología y linfología. Le sugiero buscar al doctor Luis René Arias Villarroel en Google.");
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
    agent.add("Cada caso es diferente, todo depende del resultado de su evaluación con el médico.");
    agent.add(algunaOtraPregunta());
  }

  function informesOpcionesTratamientoVarices(agent) {
    agent.add("En Arias Medical Clinic trabajamos con Escleroterapia, que consiste en la aplicación de una espuma intravenosa que permite la reabsorción de las venas varicosas.");
    agent.add(algunaOtraPregunta());

    agent.context.set({
      name: "escleroterapia",
      lifespan: 5,
    });
  }

  function informesPosibilidadPrevenirVarices(agent) {
    agent.add("Si bien no se puede prevenir completamente la aparición de varices, puedes reducir el riesgo al mantener un peso saludable, hacer ejercicio regularmente, evitar estar de pie o sentado durante períodos prolongados.");
    agent.add(algunaOtraPregunta());
  }

  // Dar precio de acuerdo al lugar de donde nos escriba
  function informesPrecioConsulta(agent) {
    agent.add("El precio de la consulta es de $1500 MXN o $200 BOB. Incluye un estudio Doppler y de Transiluminación.");
    agent.add("Le gustaría agendar una cita");
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
    agent.add("El resultado se ve en tres días después de la primera sesión.");
    agent.add("El tiempo que tardan en desaparecer las várices por completo puede variar de una persona a otra.");
    agent.add(algunaOtraPregunta());
  }

  function informesTransiluminacion(agent) {
    agent.add("Transiluminación es el estudio que se hace con la ayuda de una lámpara especial que nos permite hacer un mapeo profundo de la vena.");
    agent.add(algunaOtraPregunta());
  }

  function informesTriggerPoint(agent) {
    agent.add("Es una técnica terapéutica de punción basada en dos conceptos; en primer lugar busca reducir dolor y la sensibilidad y en segundo lugar busca tratar el factor desencadenante para lograr devolver la funcionalidad al músculo.");
    agent.add(algunaOtraPregunta());
  }

  // Mostrar una lista de las clínicas y devolver la ubicación con Google Maps de acuerdo a eso
  function informesUbicacionClinicas(agent) {
    agent.add("Por favor, indique una clínica: \n 1-Xalapa\n 2-Boca\n 3-Puebla\n 4-Cochabamba\n 5-Santa Cruz\n");

    agent.context.set({
      name: "esperando-clinica",
      lifespan: 2,
    });
  }

  function ubicacionBoca(agent) {
    agent.context.get("esperando-clinica");

    agent.add("Plaza Santa Ana, Local 15, Boca del Río, Ver.");
    agent.add("Frente a plaza Américas");
    agent.add("https://maps.app.goo.gl/DHaEDFQAEhkcro1J8");
  }

  function ubicacionXalapa(agent) {
    agent.context.get("esperando-clinica");

    agent.add("C. Coatzacoalcos, C. Priv. de las Palmas 21, Esquina, Veracruz, 91020 Xalapa");
    agent.add("https://goo.gl/maps/Nqre41X3LvH1fQ3Q7");
  }

  function ubicacionPuebla(agent) {
    agent.context.get("esperando-clinica");

    agent.add("Anillo Perif. Ecológico 3507 Torre 1 piso 9 consultorio 917 Tlaxcalancingo, 72821 Puebla, Pue");
    agent.add("https://goo.gl/maps/XCFNNwunKBFHp8Hr5");
  }

  function ubicacionCochabamba(agent) {
    agent.context.get("esperando-clinica");

    agent.add("Calle Colombia E-950 Esquina, C. 16 de Julio, Cochabamba, Bolivia");
    agent.add("https://goo.gl/maps/BUXdEVHDfaeqMpdDA");
  }

  function ubicacionSantacruz(agent) {
    agent.context.get("esperando-clinica");

    agent.add("Centro médico niño Jesús. Av. Cañoto sexto piso consultorio 609. Santa Cruz de la Sierra.");
  }

  function especialidadLumbalgia(agent) {
    agent.add("El doctor Arias es un médico cirujano con doctorado en manejo de columna.");
  }

  function pacienteConPadecimientoValoracion(agent) {
    agent.add("Es necesario que acuda a valoración.");
    agent.add("¿Gusta que se le agende una cita?");

    agent.context.set({
      name: "confirmacion-agendar-cita",
      lifespan: 3,
    });
  }

  function padecimientosNoAtendibles(agent) {
    const padecimiento = agent.parameters["padecimientosNoAtendibles"];

    if (padecimiento == "varicocele") {
      agent.add("Si usted sufre de varicocele, necesita acudir a un urólogo.");
    } else if (padecimiento == "hemorroides") {
      agent.add("Si usted sufre de hemorroides, le sugiero que acuda al proctólogo.");
    } else {
      agent.add("Disculpe, no le entendí bien...");
    }
  }

  // Enviar correo al doctor para notificar que alguién quiere agendar cita
  function agendarCita(agent) {
    agent.add("Claro que sí. Para hablar con el doctor, por favor ingrese al siguiente enlace: ");
    agent.add("https://api.whatsapp.com/send?phone=59168184000&text=Quisiera%20Hablar%20Con%20Alguien");
  }

  // Default Fallback Intent
  function fallback(agent) {
    let mensaje = "";
    fallbackContador ++;

    if (fallbackContador < 3) {
      mensaje = "Una disculpa, no le entendí bien. ¿Podría repetírmelo?";
    } else {
      mensaje = "Disculpe, no estoy entendiendo. Le sugiero acceder al siguiente enlace y una persona se pondrá en contacto con usted.\n\nhttps://api.whatsapp.com/send?phone=59168184000&text=Quisiera%20Hablar%20Con%20Alguien";
      fallbackContador = 0;
    }

    agent.add(mensaje);
  }

  const intentMap = new Map();
  intentMap.set("PruebaWindowsLocation", PruebaWindowsLocation);
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("ciudad", ciudad);
  intentMap.set("contactarHumano", contactarHumano);
  intentMap.set("dudasTratamiento", dudasTratamiento);
  intentMap.set("dolorDeColumna", dolorDeColumna);
  intentMap.set("dolorDeColumna - radiografiasVigentes", dolorDeColumnaRadiografiasVigentes);
  intentMap.set("dolorDeColumna - noRadiografiasVigentes", dolorDeColumnaNoRadiografiasVigentes);
  intentMap.set("dolorDeColumna - accidente", dolorDeColumnaAccidente);
  intentMap.set("dolorDeColumna - noAccidente", dolorDeColumnaNoAccidente);
  intentMap.set("informesGeneral", informesGeneral);
  intentMap.set("informesCausasVarices", informesCausasVarices);
  intentMap.set("informesComplicacionesVaricesNoTratadas", informesComplicacionesVaricesNoTratadas);
  intentMap.set("informesContraindicaciones", informesContraindicaciones);
  intentMap.set("informesEscleroterapia", informesEscleroterapia);
  intentMap.set("informesDolorEscleroterapia", informesDolorEscleroterapia);
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
  intentMap.set("informesTriggerPoint", informesTriggerPoint);
  intentMap.set("informesUbicacionClinicas", informesUbicacionClinicas);
  intentMap.set("informesUbicacionClinicas - boca", ubicacionBoca);
  intentMap.set("informesUbicacionClinicas - xalapa", ubicacionXalapa);
  intentMap.set("informesUbicacionClinicas - puebla", ubicacionPuebla);
  intentMap.set("informesUbicacionClinicas - Cochabamba", ubicacionCochabamba);
  intentMap.set("informesUbicacionClinicas - santacruz", ubicacionSantacruz);
  intentMap.set("especialidadLumbalgia", especialidadLumbalgia);
  intentMap.set("pacienteConPadecimientoValoracion", pacienteConPadecimientoValoracion);
  intentMap.set("padecimientosNoAtendibles", padecimientosNoAtendibles);
  intentMap.set("agendarCita", agendarCita);
  intentMap.set("Default Fallback Intent", fallback);

  agent.handleRequest(intentMap);
});

const production = true; // aqui nodemon

if (production) {
  exports.amcbot = onRequest(server);
} else {
  // Para ejecutar el servidor en local y hacer pruebas
  server.listen(PORT, () => {
    console.log("Servidor local funcionando!");
  });
}
