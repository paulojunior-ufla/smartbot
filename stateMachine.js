const { MESSAGES } = require('./constants');
const { normalize } = require('./util');

// Estados possíveis
const ESTADOS = {
  INICIAL: 'inicial',
  AGUARDANDO_ACEITE_TERMOS: 'aguardando_aceite_termos',
  AGUARDANDO_ARQUIVO_PDF: 'aguardando_arquivo_pdf',
  ENCERRAMENTO: 'encerramento'
};

// Sessões dos usuários
const sessoes = {};

// Função auxiliar para enviar mensagem com delay aleatório
function sendMessageWithDelay(client, userId, message) {
  const delay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // 2-5 segundos
  setTimeout(() => {
    client.sendMessage(userId, message);
  }, delay);
}

// Função auxiliar para iniciar o timeout de encerramento
function iniciarTimeoutEncerramento(userId, client) {
  sessoes[userId].timeout = setTimeout(() => {
    sendMessageWithDelay(client, userId, MESSAGES.bye);
    sessoes[userId].estado = ESTADOS.ENCERRAMENTO;
    sessoes[userId].timeout = null;
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
    sessoes[userId].timeout = null;
  } else if (resposta === '2' || resposta === 'nao' || resposta === 'não') {
    sendMessageWithDelay(client, userId, MESSAGES.bye);
    sessoes[userId].estado = ESTADOS.ENCERRAMENTO;
    sessoes[userId].timeout = null;
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
    const media = message.downloadMedia();
    // Aqui você pode processar o arquivo PDF
    sendMessageWithDelay(client, userId, MESSAGES.fileReceived);
    // TODO: Implementar processamento do PDF
    sessoes[userId].estado = ESTADOS.ENCERRAMENTO;
    sessoes[userId].timeout = null;
  } else {
    sendMessageWithDelay(client, userId, MESSAGES.requestPdfOnly);
    iniciarTimeoutEncerramento(userId, client);
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
