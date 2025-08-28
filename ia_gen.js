const axios = require('axios');
const crypto = require('crypto');
const { getCache, setCache } = require('./cache');
require('dotenv').config();

async function get_results_external(prompt, apiKey) {
  if (!apiKey) {
    throw new Error('API_KEY não encontrada no arquivo .env');
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
      return result;
    }
    return "";
  } catch (error) {
    throw new Error('Erro ao consultar a IA: ' + (error.response?.data?.error?.message || error.message));
  }
}

async function get_results_local(prompt, localProviderUrl, localProviderModel) {
  const url = `${localProviderUrl}/api/chat`;

  try {
    const payload = {
      model: localProviderModel,
      stream: false,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      options: {
        num_ctx: 8192,
        num_keep: 512,
        temperature: 0.2,
        top_p: 0.9,
        repeat_penalty: 1.1
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // O Ollama retorna o texto gerado em response.data.message.content
    if (response.data && response.data.message && response.data.message.content) {
      return response.data.message.content;
    }
    return "";
  } catch (error) {
    throw new Error('Erro ao consultar a IA local (Ollama): ' + (error.response?.data?.error?.message || error.message));
  }
}

function use_cache() {
  const result = process.env.USE_CACHE;
  return result && result.toLowerCase() === 'true';
}


/**
 * Faz uma requisição para o Google Gemini usando o prompt fornecido.
 * @param {string} prompt - O prompt para a IA generativa.
 * @returns {Promise<string>} - O resultado gerado pela IA.
 */
async function get_results(prompt) {
  if (use_cache()) {
    // Gera hash do prompt
    const hash = crypto.createHash('sha256').update(prompt).digest('hex');

    // Verifica se já existe no cache
    const cached = getCache(hash);
    if (cached) {
      return cached;
    }
  }

  const aiProvider = process.env.AI_PROVIDER || 'external';

  if (aiProvider === 'external') {
    result = await get_results_external(prompt, process.env.API_KEY);
  } else {
    result = await get_results_local(prompt, process.env.LOCAL_PROVIDER_URL, process.env.LOCAL_PROVIDER_MODEL);
  }

  if (use_cache()) {
    setCache(hash, result);
  }

  return result;
}

module.exports = { get_results };
