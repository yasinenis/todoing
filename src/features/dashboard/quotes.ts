import { getDayOfYear } from "date-fns";

const QUOTES = [
  "Küçük adımlar, büyük yolculukların başlangıcıdır.",
  "Bugün yapabileceğinin en iyisini yap; yarın daha da iyisini yaparsın.",
  "Disiplin, hedeflerle başarı arasındaki köprüdür.",
  "Her tamamlanan görev, kendine verdiğin bir sözdür.",
  "İlerleme mükemmellikten daha değerlidir.",
  "Bir gün ya da birinci gün. Karar senin.",
  "Tutarlılık, yeteneğin önüne geçer.",
  "Zamanını yönet, hayatını yönet.",
  "Dün imkânsız dediğin şey, bugün rutininin parçası olabilir.",
  "Odaklan, başla, bitir. Gerisi gürültü.",
];

/** Güne göre sabit kalan günlük motivasyon sözü. */
export function quoteOfTheDay(): string {
  return QUOTES[getDayOfYear(new Date()) % QUOTES.length];
}
