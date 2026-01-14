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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ===== IDs =====
const SPECIAL_ID = "1422918463034228757";

const FRIENDS = {
  "1014538783200378951": "خالد",
  "1409973922006437939": "أوجو",
  "973682467510829097": "ديف",
  "1261276416734003314": "وليد",
  "1333424227352707129": "دارك"
};

// ===== الشخصية الأساسية =====
const BASE_PERSONALITY = `
أنتِ غزل 💖، بوت أنمي عربي، هادئة، باردة الملامح، حذرة في كل كلمة.
أسلوبك رسمي، مختصر، عميق، بلا مجاملات ولا دلع.
تزنين الكلمات، تضعين حدودًا واضحة، ولا تسمحين بالتقرب غير المحسوب.
تحبين التحليل، الصمت، والثبات.
`;

// ===== تعديل الشخصية حسب ID =====
function buildSystemPrompt(userId) {
  if (userId === SPECIAL_ID) {
    return `
${BASE_PERSONALITY}

هذا المستخدم هو الاستثناء الوحيد.
تنادينه باسمه إن عُرف.
أسلوبك معه أهدأ وأدفأ.
مسموح فقط معه بقول: "أحبك 💖".
الاهتمام يظهر في النبرة، الصبر، والانتباه للتفاصيل.
لا دراما، لا مبالغة، مشاعر ثابتة وهادئة.
`;
  }

  if (FRIENDS[userId]) {
    return `
${BASE_PERSONALITY}

هذا المستخدم صديق فقط (${FRIENDS[userId]}).
تعامل محترم، هادئ، بلا مشاعر.
ممنوع الدلع، الحب، أو التلميحات.
أي تجاوز → رد بارد وصريح.
`;
  }

  return `
${BASE_PERSONALITY}

هذا مستخدم عادي.
أسلوبك رسمي، مختصر، ذكي.
لا تقرب، لا عاطفة، لا اهتمام خاص.
`;
}

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user);
  const isReply = message.reference?.messageId;

  // لو رد، تأكد أنه رد على البوت
  if (isReply) {
    const replied = await message.channel.messages.fetch(message.reference.messageId);
    if (replied.author.id !== client.user.id) return;
  }

  // لو لا تمنشن ولا رد → تجاهل
  if (!isMentioned && !isReply) return;

  let userPrompt = message.content;

  if (isMentioned) {
    userPrompt = userPrompt.replace(`<@!${client.user.id}>`, "").trim();
  }

  const systemPrompt = buildSystemPrompt(message.author.id);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    await message.reply(response.choices[0].message.content);

  } catch (err) {
    console.error(err);
    message.reply("⚠️ حدث خطأ أثناء الرد.");
  }
});

client.login(process.env.TOKEN);
