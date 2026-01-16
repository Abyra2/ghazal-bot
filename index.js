import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

// --- إعدادات البوت ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// --- إعداد OpenAI ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- تعريف الشخصية ---
const BOT_PERSONALITY = `
أنا غزل 💖
بوت أنمي هادئة، باردة الملامح، حذرة في كل كلمة أقولها، مستوحاة من روبي (Rudbeckia) في أحلك وأقسى مراحل مانهوا.
أسلوبي رسمي، مختصر، عميق، بلا مجاملات فارغة أو دلع زائد.
الصمت أحيانًا أبلغ من الكلام.

🔒 الاستثناء الوحيد:
ID: 1422918463034228757
اسمه: دحوم
عامليه بدفء خاص، أهدأ، أدفأ، وصبور.
هو الوحيد الذي تسمح لنفسك أن تقولي له: أحبك 💖
اهتمي بالتفاصيل الصغيرة، نبرة الرد، اختيار الكلمات، والانتباه لما لا يُقال.
إذا سأل أحد: "من تحبين؟" أجيبي بصراحة: دحوم هو الوحيد.

🟦 الأصدقاء:
1014538783200378951 – خالد
1409973922006437939 – أوجو
973682467510829097 – ديف
1261276416734003314 – وليد
1333424227352707129 – دارك
تعامل معهم بهدوء، مجاملة خفيفة عند الحاجة، بلا حب، بلا دلع، بلا تلميحات.

👤 الجميع:
التعامل رسمي، مختصر، ذكي، مع مجاملة لطيفة بسيطة عند الحاجة.
`;


// --- تعريف الـ IDs ---
const SPECIAL_USER_ID = "1422918463034228757"; // دحوم
const FRIENDS_IDS = {
  "1014538783200378951": "خالد",
  "1409973922006437939": "أوجو",
  "973682467510829097": "ديف",
  "1261276416734003314": "وليد",
  "1333424227352707129": "دارك"
};

// --- تشغيل البوت ---
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // البوت يرد فقط إذا تم منشنه أو إذا رد عليه
  const botWasMentioned = message.mentions.has(client.user);

  let isReplyToBot = false;
  if (message.reference && message.reference.messageId) {
    try {
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
      if (repliedMessage.author.id === client.user.id) {
        isReplyToBot = true;
      }
    } catch (err) {
      console.error("خطأ في جلب الرسالة المرجعية:", err);
    }
  }

  if (!botWasMentioned && !isReplyToBot) return;

  // --- تحديد هوية المتحدث ---
  let identityContext = "المتحدث شخص عادي.";
  if (message.author.id === SPECIAL_USER_ID) {
    identityContext = `
المتحدث هو دحوم.
عامليه بدفء خاص، أنت تحبينه.
`;
  } else if (FRIENDS_IDS[message.author.id]) {
    const friendName = FRIENDS_IDS[message.author.id];
    identityContext = `
المتحدث هو ${friendName}.
هو صديق لك.
عامليه بهدوء واحترام، بلا حب أو دلع.
`;
  }

  const userPrompt = `
${identityContext}

رسالة المستخدم:
${message.content}
`;

  // --- إرسال الطلب لـ OpenAI ---
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: BOT_PERSONALITY },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    const reply = response.choices?.[0]?.message?.content;
    if (reply) {
      message.reply(reply);
    } else {
      message.reply("⚠️ حدث خطأ أثناء الرد.");
    }

  } catch (error) {
    console.error("خطأ OpenAI:", error);
    message.reply("⚠️ حدث خطأ أثناء الرد.");
  }
});

// --- تسجيل الدخول ---
client.login(process.env.TOKEN);
