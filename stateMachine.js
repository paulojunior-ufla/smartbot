
const fs = require('fs');
const pdf = require('pdf-parse');
const { MESSAGES, PROMPTS } = require('./constants');
const { get_results } = require('./ia_gen');
const { normalize } = require('./util');

// Estados possíveis
const ESTADOS = {
  INICIAL: 'inicial',
  AGUARDANDO_ACEITE_TERMOS: 'aguardando_aceite_termos',
  AGUARDANDO_ARQUIVO_PDF: 'aguardando_arquivo_pdf',
  AGUARDANDO_ACAO_CONTEUDO: 'aguardando_acao_conteudo',
  ENCERRAMENTO: 'encerramento'
};

// Sessões dos usuários
const sessoes = {};

// Função para encerrar e limpar a sessão do usuário
function encerrarSessao(userId) {
  sessoes[userId].estado = ESTADOS.ENCERRAMENTO;
  sessoes[userId].timeout = null;
  sessoes[userId].content = null;
  // Adicione aqui outros campos que desejar limpar futuramente
}

// Função auxiliar para enviar mensagem com delay aleatório
function sendMessageWithDelay(client, userId, message) {
  const delay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // 2-5 segundos
  return new Promise((resolve) => {
    setTimeout(async () => {
      await client.sendMessage(userId, message);
      resolve();
    }, delay);
  });
}

// Função auxiliar para iniciar o timeout de encerramento
function iniciarTimeoutEncerramento(userId, client) {
  sessoes[userId].timeout = setTimeout(() => {
    sendMessageWithDelay(client, userId, MESSAGES.bye);
    encerrarSessao(userId);
  }, 2 * 60 * 1000);
}

// Handler para estado inicial/encerramento
function handleEstadoInicial(userId, client) {
  sessoes[userId] = { estado: ESTADOS.AGUARDANDO_ACEITE_TERMOS, timeout: null };
  sendMessageWithDelay(client, userId, MESSAGES.welcome);
  iniciarTimeoutEncerramento(userId, client);
}

// Handler para aguardando aceite dos termos
function handleAguardandoAceiteTermos(userId, body, client) {
  const sessao = sessoes[userId];

  if (sessao.timeout) clearTimeout(sessao.timeout);

  const resposta = normalize(body);

  if (resposta === '1' || resposta === 'sim') {
    sendMessageWithDelay(client, userId, MESSAGES.requestPdf);
    sessoes[userId].estado = ESTADOS.AGUARDANDO_ARQUIVO_PDF;
    iniciarTimeoutEncerramento(userId, client);
  } else if (resposta === '2' || resposta === 'nao' || resposta === 'não') {
    sendMessageWithDelay(client, userId, MESSAGES.bye);
    encerrarSessao(userId);
  } else {
    sendMessageWithDelay(client, userId, MESSAGES.invalidResponse);
    iniciarTimeoutEncerramento(userId, client);
  }
}

// Handler para aguardando arquivo PDF
function handleAguardandoArquivoPdf(userId, body, client, message) {
  const sessao = sessoes[userId];

  if (sessao.timeout) clearTimeout(sessao.timeout);

  // Verifica se a mensagem tem anexo
  if (message.hasMedia) {
    message.downloadMedia()
      .then(async (media) => {
        if (media.mimetype === 'application/pdf') {
          const dataBuffer = Buffer.from(media.data, 'base64');
          pdf(dataBuffer).then(function (data) {
            sessoes[userId].content = data.text;
            sendMessageWithDelay(client, userId, MESSAGES.afterPdfProcessed);
            sessoes[userId].estado = ESTADOS.AGUARDANDO_ACAO_CONTEUDO;
            iniciarTimeoutEncerramento(userId, client);
          }).catch((err) => {
            console.log(`err: ${err.message}`);
            sendMessageWithDelay(client, userId, MESSAGES.pdfProcessError);
            encerrarSessao(userId);
          });
        } else {
          sendMessageWithDelay(client, userId, MESSAGES.requestPdfOnly);
          iniciarTimeoutEncerramento(userId, client);
        }
      })
      .catch((err) => {
        console.log(`err: ${err.message}`);
        sendMessageWithDelay(client, userId, MESSAGES.pdfProcessError);
        encerrarSessao(userId);
      });
  } else {
    sendMessageWithDelay(client, userId, MESSAGES.requestPdfOnly);
    iniciarTimeoutEncerramento(userId, client);
  }
}

// Função para gerar resumo usando IA
async function generateContent(userId, client, sessao, prompt) {
  try {
    const resultado = await get_results(prompt);
    await sendMessageWithDelay(client, userId, `${resultado}`);
    sendMessageWithDelay(client, userId, MESSAGES.afterPdfProcessed);
    sessoes[userId].estado = ESTADOS.AGUARDANDO_ACAO_CONTEUDO;
    iniciarTimeoutEncerramento(userId, client);
  } catch (err) {
    sendMessageWithDelay(client, userId, MESSAGES.contentGeneratedError);
    encerrarSessao(userId);
  }
}

// Handler para aguardando ação sobre o conteúdo
async function handleAguardandoAcaoConteudo(userId, body, client) {
  const sessao = sessoes[userId];
  if (sessao.timeout) clearTimeout(sessao.timeout);
  // Aqui você pode tratar as opções do usuário (1 a 5)
  const resposta = normalize(body);
  let prompt = `\n\nTipo de formatação: ${PROMPTS.wppStyle}\n\nConteúdo da aula:\n${sessao.content}`;
  switch (resposta) {
    case '1':
      await sendMessageWithDelay(client, userId, '🔎 Gerando resumo do conteúdo...');
      prompt = `${PROMPTS.summary}${prompt}`;
      generateContent(userId, client, sessao, prompt);
      break;
    case '2':
      await sendMessageWithDelay(client, userId, '📝 Gerando roteiro de estudo...');
      prompt = `${PROMPTS.studyGuide}${prompt}`;
      generateContent(userId, client, sessao, prompt);
      break;
    case '3':
      await sendMessageWithDelay(client, userId, '❓ Gerando quiz...');
      prompt = `${PROMPTS.quiz}${prompt}`;
      generateContent(userId, client, sessao, prompt);
      break;
    case '4':
      sendMessageWithDelay(client, userId, MESSAGES.requestPdf);
      sessao.estado = ESTADOS.AGUARDANDO_ARQUIVO_PDF;
      iniciarTimeoutEncerramento(userId, client);
      break;
    case '5':
      sendMessageWithDelay(client, userId, MESSAGES.bye);
      encerrarSessao(userId);
      break;
    default:
      sendMessageWithDelay(client, userId, 'Por favor, escolha uma opção válida (1 a 5).');
      iniciarTimeoutEncerramento(userId, client);
      break;
  }
}

// Função principal da máquina de estados
function processMessage(userId, body, client, message = null) {
  // Se não existe sessão ou sessão expirada, inicia nova sessão
  if (!sessoes[userId] || sessoes[userId].estado === ESTADOS.ENCERRAMENTO) {
    handleEstadoInicial(userId, client);
    return;
  }

  const sessao = sessoes[userId];

  switch (sessao.estado) {
    case ESTADOS.AGUARDANDO_ACEITE_TERMOS:
      handleAguardandoAceiteTermos(userId, body, client);
      break;
    case ESTADOS.AGUARDANDO_ARQUIVO_PDF:
      handleAguardandoArquivoPdf(userId, body, client, message);
      break;
    case ESTADOS.AGUARDANDO_ACAO_CONTEUDO:
      handleAguardandoAcaoConteudo(userId, body, client);
      break;
    default:
      // Estado não reconhecido, reinicia
      handleEstadoInicial(userId, client);
      break;
  }
}

module.exports = {
  ESTADOS,
  processMessage,
  sessoes
};
