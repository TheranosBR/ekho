import { createMachine, assign } from 'xstate';

const createChatMachine = (from) =>
  createMachine(
    {
      id: `chat-${from}`,
      initial: 'start',
      context: {
        retries: 0,
        date: '',
      },
      states: {
        start: {
          on: {
            SCHEDULE_EXAM: 'scheduleExam_identify',
          },
        },
        scheduleExam_identify: {
          on: {
            OLD_USER: 'scheduleExam_collect',
          },
        },
        scheduleExam_collect: {
          on: {
            ON_HOME: 'scheduleExam_homeAddress',
          },
        },
        scheduleExam_homeAddress: {
          on: {
            GOT_ADRESS: 'scheduleExam_homeDate',
          },
        },
        scheduleExam_homeDate: {
          on: {
            GOT_DATE: {
              target: 'scheduleExam_homeTime',
              actions: ['setDate'],
            },
          },
        },
        scheduleExam_homeTime: {
          on: {
            GOT_TIME: {
              target: 'scheduleExam_homeDone',
            },
          },
        },
        scheduleExam_homeDone: {
          on: {},
        },
      },
    },
    {
      actions: {
        setDate: assign((context, event) => {
          console.log('event :>> ', event);
          context.date = event.date;
        }),
      },
    }
  );

export default createChatMachine;
