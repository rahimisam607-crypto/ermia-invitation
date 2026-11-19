export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return new Response("Server is not configured", { status: 500 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const clean = (value, max = 700) =>
    String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);

  const place = clean(data.place, 120);
  const date = clean(data.date, 30);
  const time = clean(data.time, 30);
  const mood = clean(data.mood, 300);
  const message = clean(data.message, 700);

  if (!place || !date || !time) {
    return new Response("Missing required fields", { status: 400 });
  }

  const text = [
    "☀️ پاسخ دعوت‌نامه A Little Ray of Sunshine",
    "",
    `📍 کجا: ${place}`,
    `📅 تاریخ: ${date}`,
    `🕰 ساعت: ${time}`,
    `🤍 حال‌وهوای قرار: ${mood || "ثبت نشده"}`,
    "",
    `💌 پیام مهدیه: ${message || "پیامی ننوشته"}`
  ].join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  if (!telegramResponse.ok) {
    return new Response("Telegram delivery failed", { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
