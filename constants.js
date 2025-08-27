const MESSAGES = {
  welcome: `🤖 *Olá! Bem-vindo ao SmartBot!* 📚

Sou um chatbot que usa Inteligência Artificial para apoiar seu processo de ensino e aprendizagem! ✨

🎯 *O que posso fazer por você:*
• Gerar resumos de conteúdos didáticos 
• Criar roteiros de estudo personalizados 
• Desenvolver questionários interativos 

⚠️ *Importante:* Para usar o SmartBot, você precisa aceitar nossos termos de uso:
https://github.com/paulojunior-ufla/smartbot/blob/main/terms-of-use.md

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
  wppStyle: `Formate o texto gerado usando o estilo de formatação do WhatsApp, onde asteriscos (*) deixam palavras ou frases em negrito e underscores (_) deixam em itálico. Não use listas numeradas ou com marcadores. No caso de um quiz, não use formatação nas alternativas. `,
  summary: `Com base no conteúdo da aula a seguir, escreva um resumo simples contendo no máximo 10 sentenças. `,
  studyGuide: `Com base no conteúdo da aula a seguir, escreva um roteiro de estudo, contendo: tema principal, objetivos do texto, assuntos que precisam ser aprendidos e o que o estudante deve ser capaz de saber após a leitura. `,
  quiz: `Com base no conteúdo da aula a seguir, elabore um quiz com 5 perguntas de múltipla escolha, cada uma com 4 alternativas (A, B, C, D). Diversifique as alternativas corretas de forma balanceada. Ao final, forneça as respostas corretas para cada pergunta separadamente. `
};

module.exports = { MESSAGES, PROMPTS };