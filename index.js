const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { processMessage } = require('./stateMachine');

const client = new Client({
	authStrategy: new LocalAuth()
});

client.on('ready', () => {
	console.log('Client is ready!');
});

client.on('qr', qr => {
	qrcode.generate(qr, {small: true});
});

client.on('message', message => {
  const userId = message.from;
  const body = message.body.trim();
  
  processMessage(userId, body, client, message);
});

client.initialize();
