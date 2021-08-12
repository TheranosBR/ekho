/* eslint-disable no-fallthrough */
import { ChatId, Client, create, Message } from '@open-wa/wa-automate';
import { interpret, Interpreter } from 'xstate';

import createChatMachine from './machine';
import { isValidCPF } from './validarCPF';

class Session {
  public chatID: ChatId;
  private client: Client;
  private machine: any;
  private service: Interpreter<any>;

  constructor({ from, client }: any) {
    this.chatID = from;
    this.client = client;
    this.machine = createChatMachine(from);
    this.service = interpret(this.machine);

    this.service.onTransition((...args) => this.onTransition(...args));
    this.service.start();

    this.client.onMessage((message) => {
      if (message.from !== this.chatID) {
        return;
      }

      this.onMessage(message);
    });
  }

  async onMessage(message: Message) {
    const currentState = this.service.state.value;

    switch (currentState) {
      case 'start': {
        if (message.content === '1') {
          this.service.send({ type: 'SCHEDULE_EXAM' });
          break;
        }
      }

      case 'scheduleExam_identify': {
        if (isValidCPF(message.content)) {
          await this.client.sendText(
            this.chatID,
            'Você já é cadastrado em nosso sistema!'
          );
          this.service.send({ type: 'OLD_USER' });

          break;
        }
        await this.client.sendText(
          this.chatID,
          'Por favor insira uma opção válida!'
        );
        break;
      }

      case 'scheduleExam_collect': {
        if (message.content === '1') {
          this.service.send({ type: 'ON_HOME' });
          break;
        }

        await this.client.sendText(this.chatID, 'Essa opção não é válida');
        break;
      }

      case 'scheduleExam_homeAddress': {
        if (message.content.length < 16) {
          await this.client.sendText(
            this.chatID,
            'Por favor insira um endereço válido!'
          );
          break;
        }

        this.service.send({ type: 'GOT_ADRESS' });
        break;
      }

      case 'scheduleExam_homeDate': {
        this.service.send({ type: 'GOT_DATE', date: message.content } as any);
        break;
      }

      case 'scheduleExam_homeTime': {
        this.service.send({ type: 'GOT_TIME' });
      }

      default:
        this.onTransition(this.service.state, null);
        break;
    }
  }

  onTransition(state: any, event: any) {
    console.info(state.value);

    switch (state.value) {
      case 'start': {
        this.client.sendText(
          this.chatID,
          'Seja bem-vindo(a) ao nosso atendimento virtual! Em que posso te ajudar hoje?\n\n' +
            ' 1 - Marcação de Exames (Inclusive coleta domiciliar)\n' +
            ' 2 - Resultado de Exame\n' +
            ' 3 - Horários e endereços das unidades\n' +
            ' 4 - Informações sobre exames\n' +
            ' 5 - Outros\n'
        );
        break;
      }

      case 'scheduleExam_identify': {
        this.client.sendText(
          this.chatID,
          'Para agilizarmos o atendimento, por favor informe o seu CPF'
        );
        break;
      }

      case 'scheduleExam_collect': {
        this.client.sendText(
          this.chatID,
          'Onde você gostaria de fazer seu exame?\n\n' +
            ' 1 - Coleta Domiciliar\n' +
            ' 2 - Coleta na Unidade'
        );
        break;
      }

      case 'scheduleExam_homeAddress': {
        this.client.sendText(this.chatID, 'Qual o endereço da coleta?');
        break;
      }

      case 'scheduleExam_homeDate': {
        this.client.sendText(
          this.chatID,
          'Em qual dia você gostaria de realizar a coleta?'
        );
        break;
      }

      case 'scheduleExam_homeTime': {
        const date = this.service.state.context.date;

        this.client.sendText(
          this.chatID,
          'Qual dos seguintes horários você gostaria de ser atendido?\n\n' +
            ` 1) ${date} às 09:15\n` +
            ` 2) ${date} às 10:20\n` +
            ` 3) ${date} às 10:30\n` +
            ` 4) ${date} às 12:40\n`
        );
        break;
      }

      default:
        break;
    }
  }
}

const sessions: Array<Session> = [];

create().then((client) => {
  client.onMessage(async (message) => {
    const hasSession = sessions.some(
      (session) => session.chatID === message.from
    );

    if (message.from.includes('@g.us')) {
      return;
    }

    console.log('hasSession :>> ', hasSession);
    if (hasSession) {
      return;
    }

    const newSession = new Session({ from: message.from, client });
    sessions.push(newSession);
  });
});
