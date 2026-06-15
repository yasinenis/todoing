# TodoIng

Görevlerini, hedeflerini ve alışkanlıklarını tek yerde toplayan; her gün motive eden,
**tatlı ve estetik** bir kişisel üretkenlik uygulaması. Mobil uyumlu (PWA — telefona
kurulabilir), açık/koyu pastel tema.

## Özellikler

- **Görevler + Sayaç** — Her görevin süresini tutan, **duraklatıp kaldığı yerden devam
  eden** kalıcı sayaç. Tek aktif sayaç; tüm sayfalarda görünen yüzen widget.
- **Hedefler** — Günlük (1–7 gün), aylık, 3 aylık, yıllık. Süreyi sen seçersin; ilerleme
  manuel ya da bağlı görevlerden otomatik. Uzun vadeli hedefler panelde hep göz önünde.
- **Alışkanlıklar** — GitHub tarzı **renkli katkı grafiği** (her alışkanlık kendi
  renginde), seri (streak) ve tamamlanma oranı.
- **Takvim & Planlama** — 1 gün / 3 gün / 1 hafta / 1 ay / 1 yıl planları otomatik
  takvime yerleşir. Her gün için **değerlendirme** (puan, mood, not) ve **günün
  fotoğrafı**.
- **Kategoriler** — Renkli kategoriler; silerken kaç görev/hedef/plan etkilendiğini
  gösterir ve onları "Kategorisiz" yapar.
- **Panel (Dashboard)** — Çalışma saati bar grafikleri (**günlük / haftalık / yıllık /
  tüm yıllar**), kategori dağılımı, istatistikler ve günün motivasyon sözü.

## Teknoloji

React + TypeScript · Vite · Tailwind CSS · shadcn/ui · TanStack Query · Recharts ·
Supabase (PostgreSQL + Auth + Storage) · PWA (vite-plugin-pwa).

## Kurulum

### 1. Supabase projesi

1. [supabase.com](https://supabase.com/dashboard) üzerinden ücretsiz bir proje aç.
2. **SQL Editor**'da sırayla çalıştır:
   - `supabase/migrations/0001_init.sql` (tablolar, RLS, trigger'lar)
   - `supabase/migrations/0002_storage.sql` (gün fotoğrafları için Storage bucket'ı)
3. **Authentication → Providers → Email**'i etkin tut. (Geliştirmede
   "Confirm email" kapatılırsa kayıt sonrası direkt giriş yapılabilir.)

### 2. Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyala ve doldur:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

(Project Settings → API bölümünden alınır.)

### 3. Çalıştır

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # üretim derlemesi
npm run preview  # üretim derlemesini önizle
```

## Deploy

SPA olduğu için tüm yollar `index.html`'e yönlendirilmeli. Yapılandırmalar hazır:

- **Vercel** — `vercel.json` ile rewrite kuralı hazır. Build command: `npm run build`,
  output: `dist`. Ortam değişkenlerini panelden ekle.
- **Netlify** — `public/_redirects` ile SPA fallback hazır. Build: `npm run build`,
  publish: `dist`.

## Telefona kurma (PWA)

Üretim derlemesini bir HTTPS adresine deploy et; tarayıcıdan aç ve "Ana ekrana ekle"
de. Uygulama tam ekran açılır ve offline kabuk desteğiyle çalışır.

## Masaüstü uygulaması (Electron)

Masaüstü sürümü, dağıtılan web adresini bir pencere içinde yükler → web/PWA ile **aynı
Supabase'i** kullanır, otomatik senkron kalır. Adres `electron/main.cjs` içinde
(`TODOING_URL`) ayarlıdır.

```bash
npm run electron:dev          # geliştirme (yerel Vite + Electron penceresi)
npm run electron:build:linux  # Linux installer (.AppImage, .deb) → release/
npm run electron:build:win    # Windows installer (.exe)  → release/
```

### Sürüm yayınlama (otomatik installer + indirme butonu)

`.github/workflows/desktop.yml`, bir `v*` etiketi push'lanınca **Windows + Linux +
macOS** için installer üretir ve bunları **GitHub Release**'e yükler. Web uygulamasındaki
"Masaüstü uygulamasını indir" butonu bu release'in sabit adlı dosyalarına bağlanır
(`releases/latest/download/TodoIng-windows.exe` vb.) → tek tıkla indirir.

Yeni sürüm çıkarmak:

```bash
git tag v1.0.0
git push origin v1.0.0      # Actions tetiklenir → 3 OS derlenir → Release yayınlanır
```

Gereksinimler:
- Repo **Public** olmalı (release dosyaları girişsiz indirilebilsin; Actions ücretsiz).
- Settings → Actions → General → Workflow permissions = **Read and write**.
- İmzasız kurulumda sistem "bilinmeyen yayıncı" uyarısı gösterebilir (kişisel kullanımda
  geçilebilir). macOS dmg imzasız ve Apple Silicon (arm64) içindir.

## Proje yapısı

```
src/
  app/          # router, provider'lar (tema, auth, sayaç), korumalı route
  components/   # ortak UI + shadcn/ui (ui/), layout, yardımcı bileşenler
  features/     # tasks, timer, goals, habits, calendar, planning, categories,
                # dashboard, auth, settings — her biri api.ts + sayfa + bileşenler
  lib/          # supabase istemcisi, tipler, tarih/renk yardımcıları, query anahtarları
supabase/migrations/  # SQL şema + RLS + storage
```

## Lisans

[MIT](LICENSE) © 2026 Yasin Enis

Bu yazılım Yasin Enis tarafından geliştirilmiştir. Kullanan, kopyalayan veya
dağıtan herkes telif/lisans bildirimini (yani bu krediyi) korumak zorundadır.

