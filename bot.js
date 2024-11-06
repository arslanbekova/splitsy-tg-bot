
require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(Telegraf.log())

const HOW_IT_WORKS = `It's very simple - if you go somewhere with your friends and you plan to constantly pay each other (one paid the bill at a restaurant, a second home, a third car, etc.), you won't have to figure out who owes whom and how much!

Just add me your general chat, click "New trip", add your friends and let's go!
You only need to carry your wires each time, and at the end I will tell you who and how much to transfer. I promise, each participant will make no more than one transfer!

A nice bonus is the fact that I will write everything down in detail and, if necessary, provide you with detailed information about your expenses.`

bot.start((ctx) => ctx.reply('So, what`s next?', {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([
    Markup.button.callback('How does it work?', 'howItWorks'),
    Markup.button.callback('New event', 'newEvent')
  ])}
));

bot.action('howItWorks', (ctx) => {
  return ctx.reply(HOW_IT_WORKS)
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
