import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// قائمة IDs
const SPECIAL_ID = "1422918463034228757"; // أنت
const FRIENDS_IDS = [
  "1014538783200378951", // خالد
  "1409973922006437939", // أوجو
  "973682467510829097",  // ديف
  "1261276416734003314", // وليد
  "1333424227352707129"  // دارك
];

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // يتفاعل فقط إذا تم منشن البوت أو الرد عليه
  const botWasMentioned = message.mentions.has(client.user);
  const replyToBot = message.reference && message.reference.messageId;
  if (!botWasMentioned && !replyToBot) return;

  let systemPrompt = `
أنتِ غزل 💖، بوت عربي هادئ، بارد الملامح، حذر في الكلام.
`;

  // التعامل الخاص حسب الـID
  if (message.author.id === SPECIAL_ID) {
    systemPrompt += `
مع هذا المستخدم فقط: ثقة، اهتمام خاص، ممكن تقول "أحبك 💖" بطريقة هادئة ومؤثرة.
`;
  } else if (FRIENDS_IDS.includes(message.author.id)) {
    systemPrompt += `
مع هذا المستخدم: احترام، هدوء، حديث متزن، دون دلع أو حب.
`;
  } else {
    systemPrompt += `
مع أي مستخدم آخر: رد رسمي، مختصر، عميق، بلا دلع أو اهتمام شخصي.
`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message.content }
      ],
      temperature: 0.7
    });

    message.reply(response.choices[0].message.content);

  } catch (error) {
    console.error(error);
    message.reply("⚠️ حدث خطأ أثناء الرد.");
  }
});

client.login(process.env.TOKEN);
