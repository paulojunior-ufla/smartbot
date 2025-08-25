const axios = require('axios');
const crypto = require('crypto');
const { getCache, setCache } = require('./cache');
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

  // Gera hash do prompt
  const hash = crypto.createHash('sha256').update(prompt).digest('hex');

  // Tenta buscar no cache
  const cached = getCache(hash);
  if (cached) {
    return cached;
  }

  // Endpoint do Google Gemini
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0].text
    ) {
      const result = response.data.candidates[0].content.parts[0].text;
      setCache(hash, result);
      return result;
    }
    return "";
  } catch (error) {
    throw new Error('Erro ao consultar a IA: ' + (error.response?.data?.error?.message || error.message));
  }
}

module.exports = { get_results };
