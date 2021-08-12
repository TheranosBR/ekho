# Ekho

A solução é baseada no uso do [wa-automate](https://github.com/open-wa/wa-automate-nodejs) para a criacação do chatbot.

Para a implementação real do chatbot, começou a ser implementado um modelo utilizando Maquinas de Estado Finito, solução baseada nesse artigo https://link.springer.com/chapter/10.1007/978-3-030-49435-3_13

## Requerimentos do Sistema

- Node.js 14.x
- yarn 1.x

## Como rodar

Instalar as dependencias:

```bash
yarn install
```

Rodar o projeto:

```bash
yarn run start
```

Apos isso ler o codigo QR Code para conectar no chatbot. Ele logara como um whatsapp web no seu dispositivo e sera capaz de enviar e receber mensagens.
