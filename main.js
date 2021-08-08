require('dotenv').config();

const express = require('express');
const app = express();

const wa = require('@open-wa/wa-automate');

wa.create().then((client) => start(client));

function start(client) {
  client.onMessage(async (message) => {
    await client.sendText(message.from, '👋 Hello!');
  });
}

app.get('/', function (req, res) {});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
