const { get_results } = require('./ia_gen');

(async () => {
  try {
    const resultado = await get_results('Teste de prompt para o Gemini');
    console.log('Resultado da IA:', resultado);
  } catch (err) {
    console.error('Erro:', err.message);
  }
})();