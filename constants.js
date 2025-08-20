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
  bye: '👋 Até logo! Estarei aqui novamente quando precisar.'
};

module.exports = { MESSAGES };