const MESSAGES = {
  welcome: `🤖 *Olá! Bem-vindo ao SmartBot!* 📚

Sou um chatbot que usa Inteligência Artificial para apoiar seu processo de ensino e aprendizagem! ✨

🎯 *O que posso fazer por você:*
• Gerar resumos de conteúdos didáticos 
• Criar roteiros de estudo personalizados 
• Desenvolver questionários interativos 

⚠️ *Importante:* Para usar o SmartBot, você precisa aceitar nossos termos de uso:
https://smartbot.com/termos-de-uso

Deseja continuar?

1 - Sim
2 - Não`,

  requestPdf: `✅ *Ótimo! Você aceitou os termos de uso.*

📋 Agora, por favor, envie o arquivo com o conteúdo didático para o qual você quer ajuda:
• Formato: PDF apenas 
• Tamanho máximo: 10MB
• Conteúdo: Material que você deseja estudar

📎 *Anexe seu arquivo PDF agora!*`,

  invalidResponse: 'Por favor, responda com "1" para Sim ou "2" para Não.',
  fileReceived: '✅ Arquivo recebido! Processando seu material...',
  requestPdfOnly: '📄 Por favor, envie um arquivo PDF com o conteúdo didático.',
  bye: '👋 Até logo! Estarei aqui novamente quando precisar.',
  pdfProcessError: '❌ Erro ao processar o PDF.',
  contentGeneratedError: '❌ Erro ao gerar conteúdo.',

  afterPdfProcessed: `✅ *Arquivo processado com sucesso!*

Agora, escolha o que deseja fazer agora com o conteúdo:

1 - Gerar um resumo
2 - Gerar um roteiro de estudo
3 - Gerar um quiz
4 - Enviar um novo arquivo
5 - Encerrar`,
};

const PROMPTS = {
  summary: `Escreva um resumo simples e direto do conteúdo da aula a seguir. O tom deve ser claro e acessível, considerando estudantes de graduação. Use formatação compatível com WhatsApp, seguindo estas regras: destaque títulos ou conceitos importantes em negrito, separe as ideias principais com quebras de linha curtas e não use tópicos nem listas longas.`
};

module.exports = { MESSAGES, PROMPTS };