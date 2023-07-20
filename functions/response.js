/* eslint-disable max-len */
module.exports = {
  getRandomResponse: getRandomResponse,
  algunaOtraPregunta: algunaOtraPregunta,
};

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
