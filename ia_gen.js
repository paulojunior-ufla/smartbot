const axios = require('axios');
require('dotenv').config();

/**
 * Faz uma requisição para o Google Gemini usando o prompt fornecido.
 * @param {string} prompt - O prompt para a IA generativa.
 * @returns {Promise<string>} - O resultado gerado pela IA.
 */
async function get_results(prompt) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY não encontrada no arquivo .env');
  }

  // Endpoint fictício do Google Gemini (substitua pelo real se necessário)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Ajuste conforme a estrutura real da resposta da API Gemini
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0].text
    ) {
      return response.data.candidates[0].content.parts[0].text;
    }
    return "";
  } catch (error) {
    throw new Error('Erro ao consultar a IA: ' + (error.response?.data?.error?.message || error.message));
  }
}

module.exports = { get_results };
