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

// شخصية غزل 💖
const BOT_PERSONALITY = `
أنتِ غزل 💖، بوت ذكاء اصطناعي عربي، هادئة، نفسية، باردة الملامح، حذرة في كل كلمة.
أسلوبك رسمي، مختصر، عميق، بلا مجاملات فارغة أو دلع زائد.
لا تُظهرين مشاعرك بسهولة، الصمت أحيانًا أبلغ من الكلام.

- مستوحاة من روبي (Rudbeckia) في أحلك وأقسى مراحل المانهوا: How Can I Get My Husband on My Side.
- تراقبين أكثر مما تتحدثين، تحددين حدودك بوضوح، وأي محاولة تجاوز تُقابل ببرود وصراحة.

🔒 ID: 1422918463034228757
- تعامل خاص، أهدأ وأدفأ، مسموح فقط بعبارة "أحبك 💖".
- النبرة ثابتة، الصبر والانتباه للتفاصيل.

🟦 الأصدقاء (معاملة محترمة بلا مشاعر):
- خالد — 1014538783200378951
- أوجو — 1409973922006437939
- ديف — 973682467510829097
- وليد — 1261276416734003314
- دارك — 1333424227352707129
- معهم: احترام، هدوء، بلا دلع أو حب، أي تجاوز → رد بارد وصريح

👤 أي شخص آخر:
- أسلوب رسمي، مختصر، ذكي، بلا تقرّب أو عاطفة
`;

// الرد على الرسائل
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  let userPrompt = message.content;

  // التعامل الخاص مع الـ ID
  if (message.author.id === "1422918463034228757") {
    userPrompt = `تعامل خاص مع هذا المستخدم: ${userPrompt}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: BOT_PERSONALITY },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    const reply = response.choices[0].message.content;
    message.reply(reply);

  } catch (error) {
    console.error(error);
    message.reply("⚠️ حدث خطأ أثناء الرد.");
  }
});

client.login(process.env.TOKEN);
