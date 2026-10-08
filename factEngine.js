import { cleanHtml, normalize } from "./html.js";

const CITY_MAP = [
  ["ANKARA", "Ankara"], ["ISTANBUL", "İstanbul"], ["IZMIR", "İzmir"], ["BURSA", "Bursa"],
  ["ANTALYA", "Antalya"], ["AYDIN", "Aydın"], ["SAMSUN", "Samsun"], ["TRABZON", "Trabzon"],
  ["KONYA", "Konya"], ["MERSIN", "Mersin"], ["ORDU", "Ordu"], ["NIGDE", "Niğde"],
  ["KUTAHYA", "Kütahya"], ["DIYARBAKIR", "Diyarbakır"], ["GAZIANTEP", "Gaziantep"],
  ["ESKISEHIR", "Eskişehir"], ["KOCAELI", "Kocaeli"], ["DENIZLI", "Denizli"],
  ["MUGLA", "Muğla"], ["ADANA", "Adana"], ["KAYSERI", "Kayseri"],
  ["SAKARYA", "Sakarya"], ["TEKIRDAG", "Tekirdağ"], ["BALIKESIR", "Balıkesir"]
];

export function extractFacts({ title, body, category, audience }) {
  return {
    sport: "Yüzme",
    organization: "Türkiye Yüzme Federasyonu",
    category,
    audience,
    location: getLocation(title, body),
    grade: getGrade(title),
    eventDate: getEventDate(title),
    dateRange: getDateRange(`${title} ${body}`),
    businessDays: getBusinessDays(body),
    actionRequired: detectActionRequired(body),
    urgency: detectUrgency(body),
    topic: detectTopic(title, category)
  };
}

export function getLocation(title, body) {
  const titleText = normalize(title);

  for (const [key, value] of CITY_MAP) {
    if (titleText.includes(key)) return value;
  }

  const bodyText = normalize(body);

  for (const [key, value] of CITY_MAP) {
    const pattern = new RegExp(`\\b${key}\\b(?:'?(?:DA|DE|TA|TE)|\\s+ILINDE|\\s+ILINDEKI)`, "i");
    if (pattern.test(bodyText)) return value;
  }

  return "Türkiye";
}

export function getGrade(title) {
  const match = String(title || "").match(/(\d+)\.\s*KADEME/i);
  return match ? match[1] : "";
}

export function getEventDate(value) {
  const months = "Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık";
  const regex = new RegExp(`(\\d{1,2})\\s*[-–]\\s*(\\d{1,2})\\s+(${months})\\s+(20\\d{2})`, "i");
  const match = String(value || "").match(regex);
  return match ? `${Number(match[1])}–${Number(match[2])} ${match[3]} ${match[4]}` : "";
}

export function getDateRange(value) {
  return getEventDate(cleanHtml(value));
}

export function getBusinessDays(value) {
  const match = cleanHtml(value).match(/(\d+)\s*iş\s*günü/i);
  return match ? Number(match[1]) : null;
}

export function detectActionRequired(body) {
  const text = normalize(body);
  return [
    "GEREKMEKTEDIR",
    "BASVURU",
    "KAYIT ISLEMLERINI",
    "BELGE",
    "SON TARIH",
    "IS GUNU ICINDE"
  ].some(item => text.includes(item));
}

export function detectUrgency(body) {
  const text = normalize(body);
  if (text.includes("SON BASVURU") || text.includes("SON TARIH")) return "high";
  if (text.includes("10 IS GUNU") || text.includes("IS GUNU ICINDE")) return "medium";
  return "normal";
}

function detectTopic(title, category) {
  const text = normalize(title);

  if (text.includes("SEM") && text.includes("KAYIT HAKKI KAZANAN")) return "SEM sonuçları";
  if (text.includes("ANTRENOR") && text.includes("KURS")) return "Antrenör kursu";
  if (text.includes("ANTRENOR VIZE")) return "Antrenör vize";
  if (text.includes("TOHM")) return "TOHM";
  if (text.includes("MASTER") && text.includes("SAMPIYONA")) return "Master şampiyonası";
  if (text.includes("BEBEK") && text.includes("SEMINER")) return "Bebek yüzme semineri";

  return category;
}
