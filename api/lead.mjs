// Shanghai Trailer: secure Telegram relay for Vercel Functions.
// Only set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Vercel project settings.
// No npm dependencies needed. No secrets should ever appear in index.html.
const json = (data, status = 200) =>
  Response.json(data, {status, headers: {'Cache-Control':'no-store'}});

const clean = (value, max = 120) =>
  (typeof value === 'string' ? value : '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);

const MODELS = new Set(['bortli','tentli','lowbed','avtovoz','samosval','sisterna']);

export async function POST(request) {
  // Browsers submit from the same origin; no cross-origin form access is needed.
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return json({ok:false,code:'FORBIDDEN'},403);
      }
    } catch {
      return json({ok:false,code:'FORBIDDEN'},403);
    }
  }
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return json({ok:false,code:'UNSUPPORTED_MEDIA'},415);
  }
  if (Number(request.headers.get('content-length')||0)>8192) {
    return json({ok:false,code:'TOO_LARGE'},413);
  }
  let data;
  try {
    const raw=await request.text();
    if(raw.length>8192) return json({ok:false,code:'TOO_LARGE'},413);
    data=JSON.parse(raw);
  } catch {
    return json({ok:false,code:'BAD_JSON'},400);
  }
  if(!data || typeof data!=='object' || Array.isArray(data)) return json({ok:false,code:'INVALID_DATA'},400);
  // Hidden anti-spam input. Return the same harmless result without sending.
  if(clean(data.website,200))return json({ok:true});
  const name=clean(data.name,70);
  const digits=clean(data.phone,30).replace(/\D/g,'');
  const phone=digits.length===12 && digits.startsWith('998') ? '+'+digits : '';
  if(name.length<2 || !phone || !/^\+998\d{9}$/.test(phone)) {
    return json({ok:false,code:'INVALID_DATA'},422);
  }
  const token=process.env.TELEGRAM_BOT_TOKEN;
  const chatId=process.env.TELEGRAM_CHAT_ID;
  if(!token || !chatId) return json({ok:false,code:'NOT_CONFIGURED'},503);

  const key=clean(data.model_key,20);
  const model=MODELS.has(key)?clean(data.model,80):'Tanlanmagan';
  const language=clean(data.language,5)==='ru'?'RU':'UZ';
  const utmSource=clean(data.utm_source,80)||'—';
  const utmCampaign=clean(data.utm_campaign,80)||'—';
  const utmMedium=clean(data.utm_medium,80)||'—';
  const message=[
    '🚛 SHANGHAI TRAILER — YANGI LID',
    '',
    '👤 Ism: '+name,
    '📞 Telefon: '+phone,
    '🚚 Pritsep: '+model,
    '🌐 Til: '+language,
    '📣 Manba: '+utmSource,
    '📊 Kanal: '+utmMedium,
    '📋 Kampaniya: '+utmCampaign,
    '🕐 Vaqt: '+new Date().toLocaleString('uz-UZ',{timeZone:'Asia/Tashkent'})+' (Toshkent)',
    '🔗 Landing: Shanghai Trailer',
  ].join('\n');
  try {
    const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:chatId,text:message,disable_web_page_preview:true}),
      signal:AbortSignal.timeout(8000),
    });
    const result=await response.json().catch(()=>null);
    if(!response.ok || result?.ok!==true) {
      // Do not log names, numbers, bot tokens or Telegram API response data.
      console.error('Telegram delivery failed; HTTP status:',response.status);
      return json({ok:false,code:'TELEGRAM_ERROR'},502);
    }
    return json({ok:true});
  } catch {
    console.error('Telegram network request failed');
    return json({ok:false,code:'NETWORK_ERROR'},502);
  }
}
