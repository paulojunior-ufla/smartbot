const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { welcomeMessage, byeMessage } = require('./constants');
const { normalize } = require('./util');

const client = new Client({
	authStrategy: new LocalAuth()
});

// Estados possíveis
const ESTADOS = {
  INICIAL: 'inicial',
  AGUARDANDO_RESPOSTA: 'aguardando_resposta',
  ENCERRAMENTO: 'encerramento'
};

// Sessões dos usuários
const sessoes = {};

client.on('ready', () => {
	console.log('Client is ready!');
});

client.on('qr', qr => {
	qrcode.generate(qr, {small: true});
});

client.on('message', message => {
  // Função auxiliar para iniciar o timeout de encerramento
  function iniciarTimeoutEncerramento(userId) {
	sessoes[userId].timeout = setTimeout(() => {
	  client.sendMessage(userId, byeMessage);
	  sessoes[userId].estado = ESTADOS.ENCERRAMENTO;
	  sessoes[userId].timeout = null;
	}, 2 * 60 * 1000);
  }
  const userId = message.from;
  const body = message.body.trim();
  // Se não existe sessão ou sessão expirada, inicia nova sessão e pergunta o nome, mas não trata a mensagem inicial como nome
  if (!sessoes[userId] || sessoes[userId].estado === ESTADOS.ENCERRAMENTO) {
	sessoes[userId] = { estado: ESTADOS.AGUARDANDO_RESPOSTA, timeout: null };
	client.sendMessage(userId, welcomeMessage);
	iniciarTimeoutEncerramento(userId);
	return;
  }

  const sessao = sessoes[userId];

  if (sessao.estado === ESTADOS.AGUARDANDO_RESPOSTA) {
	if (sessao.timeout) clearTimeout(sessao.timeout);
	const resposta = normalize(body);
	if (resposta === '1' || resposta === 'sim') {
	  client.sendMessage(userId, 'Ótimo! Você pode começar a usar o SmartBot.');
	} else if (resposta === '2' || resposta === 'nao' || resposta === 'não') {
	  client.sendMessage(userId, byeMessage);
	  sessoes[userId].estado = ESTADOS.ENCERRAMENTO;
	  sessoes[userId].timeout = null;
	  return;
	} else {
	  client.sendMessage(userId, 'Por favor, responda com "1" para Sim ou "2" para Não.');
	  iniciarTimeoutEncerramento(userId);
	  return;
	}
	sessoes[userId].estado = ESTADOS.ENCERRAMENTO;
	sessoes[userId].timeout = null;
	return;
  }

  // Se já está em encerramento, pode ignorar ou reiniciar se desejar
});

client.initialize();
