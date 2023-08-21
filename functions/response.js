/* eslint-disable max-len */
module.exports = {
  getRandomResponse: getRandomResponse,
  algunaOtraPregunta: algunaOtraPregunta,
  sendEmail: sendEmail,
};

const nodemailer = require("nodemailer");

// Configuración de conexión SMTP
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // Servidor SMTP de Hotmail/Outlook
  port: 587, // Puerto para SMTP de Hotmail/Outlook (587 para TLS o 465 para SSL)
  secure: false, // true para 465, false para otros puertos (587)
  auth: {
    user: "animashorse3@hotmail.com", // Tu dirección de correo de Hotmail/Outlook
    pass: "220897C@rlos", // Tu contraseña de Hotmail/Outlook
  },
  tls: {
    ciphers: "SSLv3",
  },
});

/**
 * Método devolver una posible respuesta de manera aleatoria
 * @param {string} responses arreglo de posibles respuestas
 * @return {string} mensaje de respuesta
 */
function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Método para devolver una respuesta aleatoria para
 * confirmar si el usuario tiene alguna otra pregunta
 * @return {string} respuesta aleatoria
 */
function algunaOtraPregunta() {
  const preguntas = ["¿Tiene usted alguna otra pregunta?", "¿Hay algo más en lo que pueda ayudarle?", "¿Algo más que quiera saber?"];
  return getRandomResponse(preguntas);
}

/**
 * Método para enviar un correo electrónico de notificación al doctor para contactar a un paciente
 * @param {*} mailOptions Opciones del correo
 * @return {Promise} Promesa de correo enviado
 */
function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve("Con gusto, en un momento una persona se pondrá en contacto con usted.");
      }
    });
  });
}
