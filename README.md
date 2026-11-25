# SHANGHAI TRAILER — Vercel + Telegram lid formasi

Landing sahifaning butun dizayni/CSS/JS birgina `index.html` faylda. Telegram tokenini xavfsiz saqlash uchun yagona qoʻshimcha server funksiyasi: `api/lead.mjs`.

## 1. Telegram bot yarating

1. Telegramda rasmiy `@BotFather` ni oching. `/newbot` bilan bot yarating va **bot tokenini begonalarga yubormang**.
2. Botni lid keladigan Telegram guruhiga qoʻshing. Botga xabar yuborish uchun zarur ruxsatni bering (odatda administrator qilish qulay).
3. Guruhning **chat ID** qiymatini aniqlang. Odatda shaxsiy superguruh uchun `-100...` shaklida boʻladi. Ochiq guruh uchun ayrim hollarda `@publicgroupusername` ishlaydi.
   - Chat ID ni olish uchun guruhga `/start@SizningBotingiz` yuboring, keyin shaxsiy kompyuteringizda Telegram `getUpdates` javobidagi `chat.id` ni tekshiring. Tokenni ommaviy saytda yoki chatda e’lon qilmang. Agar botda webhook ulangan boʻlsa, `getUpdates` ishlamasligi mumkin.

## 2. Vercel’ga joylash

1. ZIP arxivini oching va uchta fayldan iborat tuzilmani GitHub repository ga yuklang yoki Vercel CLI bilan papkani deploy qiling.
2. Vercel > Add New > Project > Git repository ni tanlang. **Framework Preset: Other**. Build Command va Output Directory ni standart (boʻsh) qoldiring.
3. Project > Settings > Environment Variables da ikkalasini qoʻshing:

   `TELEGRAM_BOT_TOKEN` = BotFather bergan bot tokeni

   `TELEGRAM_CHAT_ID` = Telegram guruh chat ID (`-100...` yoki mavjud boʻlsa `@username`)

   Ikkalasini ham kamida **Production** muhitiga kiriting; preview’da tekshirmoqchi boʻlsangiz **Preview** muhitiga ham kiriting.
4. Environment Variables kiritilgach, **Redeploy** qiling. Muhit qiymatlari eski deploymentlarda avtomatik yangilanmaydi.
5. Deploy boʻlgan saytda haqiqiy test ariza yuboring. Telegram guruhida ism, telefon, tanlangan model va UTM maʼlumotlar kelganini tekshiring.

## Fayl tuzilmasi

```
index.html
api/
  lead.mjs
README.md
```

## Muhim

- Saytni kompyuterda `index.html` deb bevosita ochganda forma Telegramga yuborilmaydi. `/api/lead` manzili faqat Vercel deploymentida yoki shunga mos lokal serverda ishlaydi.
- Telegramga borish muvaffaqiyatli tasdiqlanmaguncha forma «yuborildi» deb koʻrsatmaydi.
- Bot tokenini **HTML, GitHub yoki JavaScript client-kodiga kiritmang**. Tokenni faqat Vercel Environment Variables ga kiriting.
- Forma oddiy honeypot yordamida qisman spamdan himoyalangan. Katta trafikli reklamada Cloudflare Turnstile va mustahkam rate-limiting qoʻshish foydali.
- Meta Pixel `Lead` eventi faqat haqiqiy yuborilganda chaqiriladi (agar Meta Pixel oldindan ulangan boʻlsa).
