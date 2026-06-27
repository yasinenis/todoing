import { getDayOfYear } from "date-fns";
import type { Lang } from "@/i18n/translations";

const QUOTES: Record<Lang, string[]> = {
  tr: [
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
  ],
  en: [
    "Small steps are the beginning of great journeys.",
    "Do your best today; you'll do even better tomorrow.",
    "Discipline is the bridge between goals and achievement.",
    "Every completed task is a promise kept to yourself.",
    "Progress is worth more than perfection.",
    "Someday or day one. The choice is yours.",
    "Consistency beats talent.",
    "Manage your time, manage your life.",
    "What felt impossible yesterday can be part of your routine today.",
    "Focus, start, finish. The rest is noise.",
  ],
};

/** Güne göre sabit kalan günlük motivasyon sözü. */
export function quoteOfTheDay(lang: Lang = "tr"): string {
  const list = QUOTES[lang] ?? QUOTES.tr;
  return list[getDayOfYear(new Date()) % list.length];
}
