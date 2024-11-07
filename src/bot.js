require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.use(Telegraf.log());
bot.use(
  session({
    defaultSession: () => ({
      step: "awaitingNewEvent",
    }),
  })
);

const HOW_IT_WORKS = `It's very simple - if you go somewhere with your friends and you plan to constantly pay each other (one paid the bill at a restaurant, a second home, a third car, etc.), you won't have to figure out who owes whom and how much!

Just add me your general chat, click "New trip", add your friends and let's go!
You only need to carry your wires each time, and at the end I will tell you who and how much to transfer. I promise, each participant will make no more than one transfer!

A nice bonus is the fact that I will write everything down in detail and, if necessary, provide you with detailed information about your expenses.`;

bot.start((ctx) =>
  ctx.reply("So, what`s next?", {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      Markup.button.callback("How does it work?", "howItWorks"),
      Markup.button.callback("New event", "newEvent"),
    ]),
  })
);

bot.action("howItWorks", (ctx) => {
  return ctx.reply(HOW_IT_WORKS);
});

bot.action("newEvent", async (ctx) => {
  console.log(ctx.session);
  if (!ctx.session.eventData && ctx.session.step === "awaitingNewEvent") {
    ctx.session.eventData = {
      name: null,
      members: [],
    };
    console.log(ctx.session);
    ctx.session.step = "awaitingEventName";
    await ctx.reply("Please, enter the name of your event");
  } else {
    await ctx.reply(
      "Oops... Looks like you have unfinished event. What do you want to do?"
    );
    // Keyboard with options "finish current and start a new one", "continue with current event"
  }
});

bot.on("text", async (ctx) => {
  if (ctx.session.step === "awaitingEventName") {
    ctx.session.eventData.name = ctx.message.text;
    ctx.session.step = "awaitingMembers";
    await ctx.reply(
      "Great! Now send me the names of all event members. Please be careful, each name should be unique and start from a new line."
    );
  } else if (ctx.session.step === "awaitingMembers") {
    const members = ctx.message.text
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name !== "");
    ctx.session.eventData.members = members;
    ctx.session.step = "completed";

    await ctx.reply(
      `Event "${
        ctx.session.eventData.name
      }" created with members:\n${members.join(
        ", "
      )}. Now you can put down your costs or something else. What should we do next?`,
      {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          Markup.button.callback("Put down costs", "putCosts"),
          Markup.button.callback("Rename event", "renameEvent"),
          Markup.button.callback("Edit users", "editUsers"), // should be next keyboard with add, remove, edit name options
          Markup.button.callback("Complete event", "completeEvent"),
        ]),
      }
    );
  } else if (ctx.session.step === "awaitingCosts") {
  } else {
    ctx.reply(
      "Sorry, but I'm not waiting any info from you now. Please, use one of the options from the keyboard to continue"
    );
    // Show the keyboard with options depending on step
  }
});

bot.action("putCosts", async (ctx) => {
  ctx.session.step = "awaitingCosts";
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
