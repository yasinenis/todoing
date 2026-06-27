export type Lang = "tr" | "en";

/**
 * Uygulama metinleri (TR/EN). Düz anahtarlar; `{deg}` yer tutucuları
 * `t(key, { deg })` ile doldurulur. Eksik anahtarlar TR'ye, o da yoksa
 * anahtarın kendisine düşer.
 */
type Dict = Record<string, string>;

const tr: Dict = {
  "app.name": "TodoIng",

  // Ortak
  "common.save": "Kaydet",
  "common.cancel": "Vazgeç",
  "common.delete": "Sil",
  "common.edit": "Düzenle",
  "common.close": "Kapat",
  "common.all": "Hepsi",
  "common.confirm": "Onayla",
  "common.signOut": "Çıkış yap",

  // Navigasyon
  "nav.dashboard": "Panel",
  "nav.tasks": "Görevler",
  "nav.timer": "Sayaç",
  "nav.goals": "Hedefler",
  "nav.habits": "Alışkanlıklar",
  "nav.calendar": "Takvim",
  "nav.leaderboard": "Liderlik",
  "nav.categories": "Kategoriler",
  "nav.settings": "Ayarlar",

  // Üst bar / menü
  "topbar.fullscreenTimer": "Tam ekran sayaç",
  "topbar.menu": "Menü",

  // Giriş / kayıt
  "auth.tagline": "Görevlerin, hedeflerin ve alışkanlıkların tek yerde.",
  "auth.username": "Kullanıcı adı",
  "auth.usernamePlaceholder": "ornek_kullanici",
  "auth.email": "E-posta",
  "auth.password": "Parola",
  "auth.passwordConfirm": "Parola (tekrar)",
  "auth.signin": "Giriş yap",
  "auth.signup": "Kayıt ol",
  "auth.pleaseWait": "Lütfen bekle…",
  "auth.noAccount": "Hesabın yok mu? ",
  "auth.haveAccount": "Zaten hesabın var mı? ",
  "auth.usernameTaken": "Bu kullanıcı adı alınmış.",
  "auth.usernameInvalid": "3-20 karakter; harf, rakam ve alt çizgi.",
  "auth.usernameAvailable": "Uygun ✓",
  "auth.usernameHint": "3-20 karakter; harf, rakam ve alt çizgi.",
  "auth.pickUsername": "Lütfen uygun bir kullanıcı adı seç.",
  "auth.passwordMismatch": "Parolalar eşleşmiyor.",
  "auth.signupSuccess":
    "Kayıt oluşturuldu! E-postanı doğrulaman gerekebilir, sonra giriş yap.",
  "auth.genericError": "Bir şeyler ters gitti.",
  "auth.language": "Dil",

  // Ayarlar
  "settings.title": "Ayarlar",
  "settings.desc": "Görünüm ve hesap tercihlerin.",
  "settings.appearance": "Görünüm",
  "settings.theme.light": "Açık",
  "settings.theme.dark": "Koyu",
  "settings.theme.system": "Sistem",
  "settings.colorTheme": "Renk teması",
  "settings.language": "Dil",
  "settings.languageDesc": "Uygulama dilini seç.",
  "settings.sound": "Ses",
  "settings.appSounds": "Uygulama sesleri",
  "settings.appSoundsDesc":
    "Görev/alışkanlık tamamlama, sayaç ve dokunma sesleri.",
  "settings.download": "Uygulamayı indir",
  "settings.downloadDesc":
    "Windows, Linux, macOS veya Android (.apk) sürümünü indir. Hepsi web ile aynı veriyi kullanır, senkron çalışır.",
  "settings.updates": "Uygulama güncellemeleri",
  "settings.updateReady": "Yeni sürüm hazır",
  "settings.autoUpdateOn": "Otomatik güncelleme açık",
  "settings.updateDesc":
    "Yeni sürüm yayınlanınca otomatik indirilir; kapatınca kurulur.",
  "settings.updateNow": "Şimdi güncelle",
  "settings.checking": "Denetleniyor…",
  "settings.checkUpdates": "Güncellemeleri denetle",
  "settings.account": "Hesap",
  "settings.signedIn": "Giriş yapıldı",

  // Görevler
  "tasks.title": "Görevler",
  "tasks.desc": "Yapılacaklarını yönet, sayaç ile süreni kaydet.",
  "tasks.new": "Yeni görev",
  "tasks.filter.active": "Aktif",
  "tasks.filter.done": "Tamamlanan",
  "tasks.filter.all": "Hepsi",
  "tasks.allCategories": "Tüm kategoriler",
  "tasks.noCategory": "Kategorisiz",
  "tasks.emptyTitle": "Görev yok",
  "tasks.emptyDesc": "Bu görünümde görev yok. Yeni bir görev ekleyerek başla.",
  "tasks.section.today": "Bugün",
  "tasks.section.week": "Bu hafta",
  "tasks.section.month": "Bu ay",
  "tasks.section.later": "Daha sonra",
  "tasks.section.none": "Tarihsiz",
  "tasks.deleted": "Görev silindi",
  "tasks.deleteFailed": "Silme başarısız",
  "tasks.deleteTitle": '"{title}" silinsin mi?',
  "tasks.deleteDesc": "Bu görev ve kayıtlı süreleri kalıcı olarak silinir.",

  // Liderlik
  "lb.title": "Liderlik",
  "lb.desc": "En çok çalışanlar.",
  "lb.daily": "Günlük",
  "lb.weekly": "Haftalık",
  "lb.monthly": "Aylık",
  "lb.yearly": "Yıllık",
  "lb.emptyTitle": "Henüz sıralama yok",
  "lb.emptyDesc":
    "Bu dönemde kayıtlı çalışma yok. Sayaçla çalışınca burada görünürsün.",
  "lb.you": "sen",
  "lb.anon": "Anonim",

  // Alışkanlık ısı haritası
  "heatmap.prevMonth": "Önceki ay",
  "heatmap.nextMonth": "Sonraki ay",
  "heatmap.less": "az",
  "heatmap.more": "çok",
  "heatmap.wd0": "Pzt",
  "heatmap.wd1": "Sal",
  "heatmap.wd2": "Çar",
  "heatmap.wd3": "Per",
  "heatmap.wd4": "Cum",
  "heatmap.wd5": "Cmt",
  "heatmap.wd6": "Paz",

  // Sayaç odak modu
  "focus.mode": "Odak modu",
  "focus.task": "Görev",
  "focus.completed": "Tamamlandı 🎉",
  "focus.targetDone": "{min} dk hedef doldu · geçen {elapsed}",
  "focus.remaining": "kalan · hedef {min} dk",
  "focus.pausedSuffix": "· duraklatıldı",
  "focus.running": "Çalışıyor",
  "focus.pausedShort": "Duraklatıldı",
  "focus.totalOnTopic": "bu konuda toplam {total}",
  "focus.blockDoneToast": "Blok tamamlandı 🎉",
  "focus.blockDoneDesc": "{min} dakikalık odak süresi doldu.",
  "focus.blockDoneBody": "Odak süresi doldu",
  "focus.confirmTitle": "Sayacı bitirmek istediğine emin misin?",
  "focus.confirmDesc": "Geçen süre göreve kaydedilecek.",
  "focus.confirmStop": "Evet, bitir",
  "focus.pause": "Duraklat",
  "focus.resume": "Devam et",
  "focus.stop": "Bitir",
  "focus.hint":
    'Odak modu yalnızca "Bitir" ile kapanır. Süre kaydedilir; görevin toplam süresi korunur.',

  // Panel
  "dash.hello": "Merhaba",
  "dash.helloName": "Merhaba, {name}",
  "dash.statWorkToday": "Bugün çalışma",
  "dash.statDoneToday": "Bugün tamamlanan",
  "dash.hintTask": "görev",
  "dash.statBestStreak": "En uzun aktif seri",
  "dash.hintDay": "gün",
  "dash.statActiveGoals": "Aktif hedef",
  "dash.longTerm": "Uzun vadeli hedefler",
  "dash.longTermEmptyTitle": "Uzun vadeli hedef yok",
  "dash.longTermEmptyDesc":
    "3 aylık veya yıllık bir hedef ekle; burada hep göz önünde olsun.",
  "dash.todayHabits": "Bugünün alışkanlıkları",
  "dash.markDone": "Yaptım",
  "dash.decrease": "Azalt",
  "dash.increase": "Artır",

  // Grafikler
  "chart.workHours": "Çalışma saatleri",
  "chart.daily": "Günlük",
  "chart.weekly": "Haftalık",
  "chart.yearly": "Yıllık",
  "chart.all": "Tüm",
  "chart.uncategorized": "Kategorisiz",
  "chart.hoursAbbr": "sa",
  "chart.total": "Toplam",
  "chart.taskDistribution": "Görev dağılımı",
  "chart.noTasks": "Henüz görev yok.",
  "chart.tasksUnit": "görev",

  "common.add": "Ekle",

  // Öncelik
  "priority.low": "Düşük",
  "priority.medium": "Orta",
  "priority.high": "Yüksek",

  // Durum
  "status.todo": "Yapılacak",
  "status.inProgress": "Devam ediyor",
  "status.done": "Tamamlandı",

  // Görev kartı / formu
  "taskCard.completed": "Tamamlandı",
  "taskCard.pause": "Duraklat",
  "taskCard.startTimer": "Sayacı başlat",
  "taskCard.more": "Daha fazla",
  "taskForm.editTitle": "Görevi düzenle",
  "taskForm.newTitle": "Yeni görev",
  "taskForm.title": "Başlık",
  "taskForm.titlePlaceholder": "ör. Sunumu hazırla",
  "taskForm.notes": "Not (opsiyonel)",
  "taskForm.notesPlaceholder": "Detaylar…",
  "taskForm.category": "Kategori",
  "taskForm.priority": "Öncelik",
  "taskForm.plannedDay": "Planlanan gün",
  "taskForm.dueDate": "Son tarih",
  "taskForm.linkGoal": "Hedefe bağla (opsiyonel)",
  "taskForm.noGoal": "Hedefe bağlı değil",
  "taskForm.updated": "Görev güncellendi",
  "taskForm.created": "Görev eklendi",
  "taskForm.failed": "İşlem başarısız",

  // Sayaç sayfası
  "timer.title": "Sayaç",
  "timer.desc": "Bir göreve odaklan; süreni kaydet, kaldığın yerden devam et.",
  "timer.nowOn": "Şu an üzerinde",
  "timer.thisSession": "bu oturum {s}",
  "timer.pageHint":
    '"Bitir" oturumu kaydeder; görevin toplam süresi korunur. Başka bir görev başlatırsan bu görev otomatik kaydedilir.',
  "timer.emptyTitle": "Sayaç için görev yok",
  "timer.emptyDesc": "Önce bir görev ekle; sonra buradan sayacı başlat.",
  "timer.mode": "Sayaç modu",
  "timer.modeFreeLabel": "Serbest (ileri):",
  "timer.modeFreeDesc":
    " yukarı sayar, her tam saatte ufak bir uyarı sesi verir. ",
  "timer.modeBlockLabel": "Süre / Özel:",
  "timer.modeBlockDesc": " seçtiğin kadar geri sayım yapar; dolunca uyarır. ",
  "timer.modeLocked": "Mod, sayaç başlatıldıktan sonra değişmez",
  "timer.modeLockedDesc": " — başlamadan önce seç.",
  "timer.pickTask": "Başlatmak için bir görev seç:",
  "timer.total": "Toplam {s}",
  "timer.manageHint": "Tüm görevleri Görevler sayfasından yönetebilirsin.",
  "timer.modeFree": "Serbest (ileri)",
  "timer.modeCustom": "Özel",
  "timer.minSuffix": "dk",
  "timer.minPlaceholder": "dk",
  "timer.set": "Ayarla",
  "timer.pausedNotif": "{s} · duraklatıldı",
  "timer.errStart": "Sayaç başlatılamadı.",
  "timer.errPause": "Duraklatılamadı.",
  "timer.errResume": "Devam ettirilemedi.",
  "timer.errStop": "Bitirilemedi.",

  "common.create": "Oluştur",

  // Zaman dilimi
  "timeframe.daily": "Günlük",
  "timeframe.weekly": "Haftalık",
  "timeframe.monthly": "Aylık",
  "timeframe.quarterly": "3 Aylık",
  "timeframe.yearly": "Yıllık",

  // Hedefler
  "goals.title": "Hedefler",
  "goals.desc":
    "Günlük, aylık, 3 aylık ve yıllık hedeflerini hep göz önünde tut.",
  "goals.new": "Yeni hedef",
  "goals.emptyTitle": "Henüz hedef yok",
  "goals.emptyDesc":
    "İlk hedefini belirle; ne kadar sürede gerçekleştireceğini seç ve ilerlemeni izle.",
  "goals.deleted": "Hedef silindi",
  "goals.deleteDesc":
    "Hedef silinir; bağlı görevler kalır (hedef bağlantısı kaldırılır).",
  "goalCard.daysLeft": "{n} gün kaldı",
  "goalCard.lastDay": "Bugün son gün",
  "goalCard.overdue": "{n} gün gecikti",
  "goalCard.target": "Hedef: {date}",
  "goalForm.editTitle": "Hedefi düzenle",
  "goalForm.newTitle": "Yeni hedef",
  "goalForm.titlePlaceholder": "ör. 12 kitap oku",
  "goalForm.desc": "Açıklama (opsiyonel)",
  "goalForm.modePreset": "Hazır süre",
  "goalForm.modeCustom": "Tarih aralığı",
  "goalForm.timeframe": "Zaman dilimi",
  "goalForm.start": "Başlangıç",
  "goalForm.days": "Kaç gün? (1-7)",
  "goalForm.endTarget": "Bitiş (hedef)",
  "goalForm.invalidEnd": "Bitiş tarihini seç (başlangıçtan sonra olmalı).",
  "goalForm.targetDate": "Hedef tarihi:",
  "goalForm.autoProgress": "Otomatik ilerleme",
  "goalForm.autoProgressDesc":
    "İlerlemeyi bağlı görevlerin tamamlanmasından hesapla",
  "goalForm.updated": "Hedef güncellendi",
  "goalForm.created": "Hedef oluşturuldu",

  "common.percent": "%{n}",

  // Alışkanlıklar
  "habits.title": "Alışkanlıklar",
  "habits.desc":
    "Her alışkanlık kendi renginde — serini büyüt, günlük takip et.",
  "habits.new": "Yeni alışkanlık",
  "habits.emptyTitle": "Henüz alışkanlık yok",
  "habits.emptyDesc":
    "İlk alışkanlığını ekle; her gün işaretle ve renkli katkı grafiğinde serini izle.",
  "habits.deleted": "Alışkanlık silindi",
  "habits.deleteDesc":
    "Alışkanlık ve tüm günlük kayıtları kalıcı olarak silinir.",
  "habitCard.dailyTarget": "Günlük hedef: {n}",
  "habitCard.markToday": "Bugünü işaretle",
  "habitCard.statStreak": "Seri",
  "habitCard.statBest": "En iyi",
  "habitCard.statLast30": "Son 30g",
  "habitCard.daysValue": "{n} gün",
  "habitForm.editTitle": "Alışkanlığı düzenle",
  "habitForm.newTitle": "Yeni alışkanlık",
  "habitForm.name": "Ad",
  "habitForm.namePlaceholder": "ör. Su iç, Spor, Oku",
  "habitForm.dailyTarget": "Günlük hedef",
  "habitForm.targetHint":
    "Örn. günde 8 bardak su için 8 yaz. Tek seferlikse 1 bırak.",
  "habitForm.color": "Renk",
  "habitForm.updated": "Alışkanlık güncellendi",
  "habitForm.created": "Alışkanlık oluşturuldu",

  // Takvim
  "calendar.title": "Takvim",
  "calendar.desc": "Planlarını gör, her güne değerlendirme ve fotoğraf ekle.",
  "calendar.newPlan": "Yeni plan",
  "calendar.today": "Bugün",

  // Gün detayı
  "dayDetail.goal": "Hedef: {title}",
  "dayDetail.rateDay": "Günü puanla",
  "dayDetail.stars": "{n} yıldız",
  "dayDetail.mood": "Mod",
  "dayDetail.reflection": "Günün değerlendirmesi",
  "dayDetail.reflectionPlaceholder":
    "Bugün nasıldı? Ne öğrendin, neye minnettarsın?",
  "dayDetail.photo": "Günün fotoğrafı",
  "dayDetail.addPhoto": "Fotoğraf ekle",
  "dayDetail.removePhoto": "Fotoğrafı kaldır",
  "dayDetail.saved": "Gün kaydedildi",
  "dayDetail.saveFailed": "Kaydetme başarısız",
  "dayDetail.saving": "Kaydediliyor…",

  // Plan dönemleri
  "period.1d": "1 gün",
  "period.3d": "3 gün",
  "period.1w": "1 hafta",
  "period.1m": "1 ay",
  "period.1y": "1 yıl",

  // Plan formu
  "planForm.title": "Yeni plan",
  "planForm.titlePlaceholder": "ör. Proje sprinti, Tatil",
  "planForm.duration": "Süre",
  "planForm.startDay": "Başlangıç günü",
  "planForm.added": "Plan takvime eklendi",

  // Kategoriler
  "categories.title": "Kategoriler",
  "categories.desc": "Görev, hedef ve planlarını renkli kategorilerle düzenle.",
  "categories.new": "Yeni kategori",
  "categories.emptyTitle": "Henüz kategori yok",
  "categories.emptyDesc":
    "İlk kategorini oluştur; görev ve hedeflerini düzenli tut.",
  "categoryForm.editTitle": "Kategoriyi düzenle",
  "categoryForm.newTitle": "Yeni kategori",
  "categoryForm.namePlaceholder": "ör. İş, Spor, Okuma",
  "categoryForm.updated": "Kategori güncellendi",
  "categoryForm.created": "Kategori oluşturuldu",
  "categoryDelete.checking": "Kontrol ediliyor…",
  "categoryDelete.usage":
    "Bu kategoriye bağlı {tasks} görev, {goals} hedef ve {plans} plan var.",
  "categoryDelete.usageNote":
    'Silersen bunlar "Kategorisiz" olarak kalır (kayıtlar silinmez). Devam edilsin mi?',
  "categoryDelete.noUsage":
    "Bu kategoriye bağlı kayıt yok. Güvenle silebilirsin.",
  "categoryDelete.deleting": "Siliniyor…",
  "categoryDelete.deleted": "Kategori silindi",

  // Profil
  "profile.title": "Profil",
  "profile.loading": "Yükleniyor…",
  "profile.changePhoto": "Fotoğraf değiştir",
  "profile.uploading": "Yükleniyor…",
  "profile.shownOnLeaderboard": "Liderlik tablosunda görünür.",
  "profile.usernamePlaceholder": "kullanici_adi",
  "profile.setUsernameHint":
    "Liderlik tablosunda görünmek için bir kullanıcı adı belirle.",
  "profile.photoUpdated": "Profil fotoğrafı güncellendi",
  "profile.uploadFailed": "Yükleme başarısız",
  "profile.usernameSaved": "Kullanıcı adı kaydedildi",
  "profile.saveFailed": "Kaydedilemedi",

  // Renk seçici
  "colorPicker.aria": "Renk {color}",

  // Tema / indirme / güncelleme
  "common.toggleTheme": "Temayı değiştir",
  "download.dialogDesc":
    "Platformunu seç; indirme hemen başlar. Veriler web ile senkron çalışır.",
  "download.yourDevice": "senin cihazın",
  "download.unsigned":
    'İmzasız kurulum olduğundan sistem "bilinmeyen yayıncı" uyarısı gösterebilir; güvenle kurabilirsin.',
  "download.allReleases": "Tüm sürümler",
  "update.foundTitle": "Güncelleme bulundu",
  "update.foundDesc": "Sürüm {version} indiriliyor…",
  "update.readyTitle": "Güncelleme hazır 🎉",
  "update.readyDesc": "Sürüm {version} indirildi. Şimdi kurabilirsin.",
  "update.installNow": "Şimdi güncelle",
  "update.checkFailedTitle": "Güncelleme denetlenemedi",
  "update.checkFailedDesc":
    "Bu kurulum türünde otomatik güncelleme desteklenmiyor olabilir.",
  "update.openReleases": "Sürümleri aç",
  "update.upToDate": "Uygulaman güncel ✓",

  // Supabase kurulum ekranı
  "setup.title": "Supabase kurulumu gerekli",
  "setup.intro":
    "Uygulamanın çalışması için bir Supabase projesi bağlamalısın. Aşağıdaki adımları izle:",
  "setup.step1": "Şuradan ücretsiz bir proje oluştur:",
  "setup.step2": "SQL Editor'da şu klasördeki SQL'i çalıştır:",
  "setup.step3": "Proje köküne şu dosyayı ekle:",
  "setup.restart": "Ardından geliştirme sunucusunu yeniden başlat.",

  // Renk paletleri
  "palette.professional.name": "Profesyonel",
  "palette.professional.desc": "Nötr, sakin — herkese uygun",
  "palette.masculine.name": "Okyanus",
  "palette.masculine.desc": "Koyu mavi & teal, güçlü",
  "palette.feminine.name": "Gül",
  "palette.feminine.desc": "Pembe & lavanta, yumuşak",
  "palette.emerald.name": "Zümrüt",
  "palette.emerald.desc": "Doğal yeşil, dengeli",
};

const en: Dict = {
  "app.name": "TodoIng",

  // Common
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.close": "Close",
  "common.all": "All",
  "common.confirm": "Confirm",
  "common.signOut": "Sign out",

  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.tasks": "Tasks",
  "nav.timer": "Timer",
  "nav.goals": "Goals",
  "nav.habits": "Habits",
  "nav.calendar": "Calendar",
  "nav.leaderboard": "Leaderboard",
  "nav.categories": "Categories",
  "nav.settings": "Settings",

  // Topbar / menu
  "topbar.fullscreenTimer": "Fullscreen timer",
  "topbar.menu": "Menu",

  // Sign in / sign up
  "auth.tagline": "Your tasks, goals and habits in one place.",
  "auth.username": "Username",
  "auth.usernamePlaceholder": "example_user",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordConfirm": "Password (again)",
  "auth.signin": "Sign in",
  "auth.signup": "Sign up",
  "auth.pleaseWait": "Please wait…",
  "auth.noAccount": "Don't have an account? ",
  "auth.haveAccount": "Already have an account? ",
  "auth.usernameTaken": "This username is taken.",
  "auth.usernameInvalid": "3-20 chars; letters, numbers and underscore.",
  "auth.usernameAvailable": "Available ✓",
  "auth.usernameHint": "3-20 chars; letters, numbers and underscore.",
  "auth.pickUsername": "Please pick a valid username.",
  "auth.passwordMismatch": "Passwords don't match.",
  "auth.signupSuccess":
    "Account created! You may need to verify your email, then sign in.",
  "auth.genericError": "Something went wrong.",
  "auth.language": "Language",

  // Settings
  "settings.title": "Settings",
  "settings.desc": "Your appearance and account preferences.",
  "settings.appearance": "Appearance",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.theme.system": "System",
  "settings.colorTheme": "Color theme",
  "settings.language": "Language",
  "settings.languageDesc": "Choose the app language.",
  "settings.sound": "Sound",
  "settings.appSounds": "App sounds",
  "settings.appSoundsDesc": "Task/habit completion, timer and tap sounds.",
  "settings.download": "Download the app",
  "settings.downloadDesc":
    "Download the Windows, Linux, macOS or Android (.apk) version. They all use the same data as the web and stay in sync.",
  "settings.updates": "App updates",
  "settings.updateReady": "New version ready",
  "settings.autoUpdateOn": "Auto-update on",
  "settings.updateDesc":
    "New versions download automatically and install on close.",
  "settings.updateNow": "Update now",
  "settings.checking": "Checking…",
  "settings.checkUpdates": "Check for updates",
  "settings.account": "Account",
  "settings.signedIn": "Signed in",

  // Tasks
  "tasks.title": "Tasks",
  "tasks.desc": "Manage your to-dos, track time with the timer.",
  "tasks.new": "New task",
  "tasks.filter.active": "Active",
  "tasks.filter.done": "Completed",
  "tasks.filter.all": "All",
  "tasks.allCategories": "All categories",
  "tasks.noCategory": "Uncategorized",
  "tasks.emptyTitle": "No tasks",
  "tasks.emptyDesc": "No tasks in this view. Add a new task to get started.",
  "tasks.section.today": "Today",
  "tasks.section.week": "This week",
  "tasks.section.month": "This month",
  "tasks.section.later": "Later",
  "tasks.section.none": "No date",
  "tasks.deleted": "Task deleted",
  "tasks.deleteFailed": "Delete failed",
  "tasks.deleteTitle": 'Delete "{title}"?',
  "tasks.deleteDesc":
    "This task and its tracked time will be permanently deleted.",

  // Leaderboard
  "lb.title": "Leaderboard",
  "lb.desc": "Top workers.",
  "lb.daily": "Daily",
  "lb.weekly": "Weekly",
  "lb.monthly": "Monthly",
  "lb.yearly": "Yearly",
  "lb.emptyTitle": "No ranking yet",
  "lb.emptyDesc":
    "No tracked work in this period. Work with the timer to appear here.",
  "lb.you": "you",
  "lb.anon": "Anonymous",

  // Habit heatmap
  "heatmap.prevMonth": "Previous month",
  "heatmap.nextMonth": "Next month",
  "heatmap.less": "less",
  "heatmap.more": "more",
  "heatmap.wd0": "Mon",
  "heatmap.wd1": "Tue",
  "heatmap.wd2": "Wed",
  "heatmap.wd3": "Thu",
  "heatmap.wd4": "Fri",
  "heatmap.wd5": "Sat",
  "heatmap.wd6": "Sun",

  // Timer focus mode
  "focus.mode": "Focus mode",
  "focus.task": "Task",
  "focus.completed": "Completed 🎉",
  "focus.targetDone": "{min} min target reached · elapsed {elapsed}",
  "focus.remaining": "remaining · target {min} min",
  "focus.pausedSuffix": "· paused",
  "focus.running": "Running",
  "focus.pausedShort": "Paused",
  "focus.totalOnTopic": "{total} total on this topic",
  "focus.blockDoneToast": "Block complete 🎉",
  "focus.blockDoneDesc": "{min}-minute focus block finished.",
  "focus.blockDoneBody": "Focus block finished",
  "focus.confirmTitle": "Are you sure you want to stop the timer?",
  "focus.confirmDesc": "The elapsed time will be saved to the task.",
  "focus.confirmStop": "Yes, stop",
  "focus.pause": "Pause",
  "focus.resume": "Resume",
  "focus.stop": "Stop",
  "focus.hint":
    'Focus mode only closes with "Stop". Time is saved; the task\'s total time is preserved.',

  // Dashboard
  "dash.hello": "Hello",
  "dash.helloName": "Hello, {name}",
  "dash.statWorkToday": "Worked today",
  "dash.statDoneToday": "Completed today",
  "dash.hintTask": "tasks",
  "dash.statBestStreak": "Longest active streak",
  "dash.hintDay": "days",
  "dash.statActiveGoals": "Active goals",
  "dash.longTerm": "Long-term goals",
  "dash.longTermEmptyTitle": "No long-term goals",
  "dash.longTermEmptyDesc":
    "Add a 3-month or yearly goal; keep it in sight here.",
  "dash.todayHabits": "Today's habits",
  "dash.markDone": "Done",
  "dash.decrease": "Decrease",
  "dash.increase": "Increase",

  // Charts
  "chart.workHours": "Work hours",
  "chart.daily": "Daily",
  "chart.weekly": "Weekly",
  "chart.yearly": "Yearly",
  "chart.all": "All",
  "chart.uncategorized": "Uncategorized",
  "chart.hoursAbbr": "h",
  "chart.total": "Total",
  "chart.taskDistribution": "Task distribution",
  "chart.noTasks": "No tasks yet.",
  "chart.tasksUnit": "tasks",

  "common.add": "Add",

  // Priority
  "priority.low": "Low",
  "priority.medium": "Medium",
  "priority.high": "High",

  // Status
  "status.todo": "To do",
  "status.inProgress": "In progress",
  "status.done": "Completed",

  // Task card / form
  "taskCard.completed": "Completed",
  "taskCard.pause": "Pause",
  "taskCard.startTimer": "Start timer",
  "taskCard.more": "More",
  "taskForm.editTitle": "Edit task",
  "taskForm.newTitle": "New task",
  "taskForm.title": "Title",
  "taskForm.titlePlaceholder": "e.g. Prepare the presentation",
  "taskForm.notes": "Notes (optional)",
  "taskForm.notesPlaceholder": "Details…",
  "taskForm.category": "Category",
  "taskForm.priority": "Priority",
  "taskForm.plannedDay": "Planned day",
  "taskForm.dueDate": "Due date",
  "taskForm.linkGoal": "Link to goal (optional)",
  "taskForm.noGoal": "Not linked to a goal",
  "taskForm.updated": "Task updated",
  "taskForm.created": "Task added",
  "taskForm.failed": "Operation failed",

  // Timer page
  "timer.title": "Timer",
  "timer.desc": "Focus on a task; track your time and resume where you left off.",
  "timer.nowOn": "Currently on",
  "timer.thisSession": "this session {s}",
  "timer.pageHint":
    '"Stop" saves the session; the task\'s total time is preserved. Starting another task auto-saves this one.',
  "timer.emptyTitle": "No task for the timer",
  "timer.emptyDesc": "Add a task first, then start the timer here.",
  "timer.mode": "Timer mode",
  "timer.modeFreeLabel": "Free (count up):",
  "timer.modeFreeDesc": " counts up and chimes softly every full hour. ",
  "timer.modeBlockLabel": "Duration / Custom:",
  "timer.modeBlockDesc":
    " counts down for the chosen time and alerts when done. ",
  "timer.modeLocked": "The mode can't change after the timer starts",
  "timer.modeLockedDesc": " — choose before starting.",
  "timer.pickTask": "Pick a task to start:",
  "timer.total": "Total {s}",
  "timer.manageHint": "You can manage all tasks on the Tasks page.",
  "timer.modeFree": "Free (count up)",
  "timer.modeCustom": "Custom",
  "timer.minSuffix": "min",
  "timer.minPlaceholder": "min",
  "timer.set": "Set",
  "timer.pausedNotif": "{s} · paused",
  "timer.errStart": "Couldn't start the timer.",
  "timer.errPause": "Couldn't pause.",
  "timer.errResume": "Couldn't resume.",
  "timer.errStop": "Couldn't stop.",

  "common.create": "Create",

  // Timeframe
  "timeframe.daily": "Daily",
  "timeframe.weekly": "Weekly",
  "timeframe.monthly": "Monthly",
  "timeframe.quarterly": "Quarterly",
  "timeframe.yearly": "Yearly",

  // Goals
  "goals.title": "Goals",
  "goals.desc":
    "Keep your daily, monthly, quarterly and yearly goals in sight.",
  "goals.new": "New goal",
  "goals.emptyTitle": "No goals yet",
  "goals.emptyDesc":
    "Set your first goal; choose its timeframe and track your progress.",
  "goals.deleted": "Goal deleted",
  "goals.deleteDesc":
    "The goal is deleted; linked tasks remain (their goal link is removed).",
  "goalCard.daysLeft": "{n} days left",
  "goalCard.lastDay": "Last day today",
  "goalCard.overdue": "{n} days overdue",
  "goalCard.target": "Target: {date}",
  "goalForm.editTitle": "Edit goal",
  "goalForm.newTitle": "New goal",
  "goalForm.titlePlaceholder": "e.g. Read 12 books",
  "goalForm.desc": "Description (optional)",
  "goalForm.modePreset": "Preset duration",
  "goalForm.modeCustom": "Date range",
  "goalForm.timeframe": "Timeframe",
  "goalForm.start": "Start",
  "goalForm.days": "How many days? (1-7)",
  "goalForm.endTarget": "End (target)",
  "goalForm.invalidEnd": "Pick an end date (must be after the start).",
  "goalForm.targetDate": "Target date:",
  "goalForm.autoProgress": "Auto progress",
  "goalForm.autoProgressDesc":
    "Calculate progress from completion of linked tasks",
  "goalForm.updated": "Goal updated",
  "goalForm.created": "Goal created",

  "common.percent": "{n}%",

  // Habits
  "habits.title": "Habits",
  "habits.desc": "Each habit in its own color — grow your streak, track daily.",
  "habits.new": "New habit",
  "habits.emptyTitle": "No habits yet",
  "habits.emptyDesc":
    "Add your first habit; check it daily and watch your streak in the colorful contribution chart.",
  "habits.deleted": "Habit deleted",
  "habits.deleteDesc":
    "The habit and all its daily logs will be permanently deleted.",
  "habitCard.dailyTarget": "Daily target: {n}",
  "habitCard.markToday": "Mark today",
  "habitCard.statStreak": "Streak",
  "habitCard.statBest": "Best",
  "habitCard.statLast30": "Last 30d",
  "habitCard.daysValue": "{n} days",
  "habitForm.editTitle": "Edit habit",
  "habitForm.newTitle": "New habit",
  "habitForm.name": "Name",
  "habitForm.namePlaceholder": "e.g. Drink water, Workout, Read",
  "habitForm.dailyTarget": "Daily target",
  "habitForm.targetHint":
    "E.g. write 8 for 8 glasses of water a day. Leave 1 if it's once.",
  "habitForm.color": "Color",
  "habitForm.updated": "Habit updated",
  "habitForm.created": "Habit created",

  // Calendar
  "calendar.title": "Calendar",
  "calendar.desc": "See your plans, add a review and photo to each day.",
  "calendar.newPlan": "New plan",
  "calendar.today": "Today",

  // Day detail
  "dayDetail.goal": "Goal: {title}",
  "dayDetail.rateDay": "Rate the day",
  "dayDetail.stars": "{n} stars",
  "dayDetail.mood": "Mood",
  "dayDetail.reflection": "Day's reflection",
  "dayDetail.reflectionPlaceholder":
    "How was today? What did you learn, what are you grateful for?",
  "dayDetail.photo": "Photo of the day",
  "dayDetail.addPhoto": "Add photo",
  "dayDetail.removePhoto": "Remove photo",
  "dayDetail.saved": "Day saved",
  "dayDetail.saveFailed": "Save failed",
  "dayDetail.saving": "Saving…",

  // Plan periods
  "period.1d": "1 day",
  "period.3d": "3 days",
  "period.1w": "1 week",
  "period.1m": "1 month",
  "period.1y": "1 year",

  // Plan form
  "planForm.title": "New plan",
  "planForm.titlePlaceholder": "e.g. Project sprint, Vacation",
  "planForm.duration": "Duration",
  "planForm.startDay": "Start day",
  "planForm.added": "Plan added to calendar",

  // Categories
  "categories.title": "Categories",
  "categories.desc":
    "Organize your tasks, goals and plans with colorful categories.",
  "categories.new": "New category",
  "categories.emptyTitle": "No categories yet",
  "categories.emptyDesc":
    "Create your first category; keep your tasks and goals organized.",
  "categoryForm.editTitle": "Edit category",
  "categoryForm.newTitle": "New category",
  "categoryForm.namePlaceholder": "e.g. Work, Sports, Reading",
  "categoryForm.updated": "Category updated",
  "categoryForm.created": "Category created",
  "categoryDelete.checking": "Checking…",
  "categoryDelete.usage":
    "This category has {tasks} tasks, {goals} goals and {plans} plans linked.",
  "categoryDelete.usageNote":
    'If you delete it, they will become "Uncategorized" (records aren\'t deleted). Continue?',
  "categoryDelete.noUsage":
    "No records are linked to this category. You can safely delete it.",
  "categoryDelete.deleting": "Deleting…",
  "categoryDelete.deleted": "Category deleted",

  // Profile
  "profile.title": "Profile",
  "profile.loading": "Loading…",
  "profile.changePhoto": "Change photo",
  "profile.uploading": "Uploading…",
  "profile.shownOnLeaderboard": "Shown on the leaderboard.",
  "profile.usernamePlaceholder": "username",
  "profile.setUsernameHint": "Set a username to appear on the leaderboard.",
  "profile.photoUpdated": "Profile photo updated",
  "profile.uploadFailed": "Upload failed",
  "profile.usernameSaved": "Username saved",
  "profile.saveFailed": "Couldn't save",

  // Color picker
  "colorPicker.aria": "Color {color}",

  // Theme / download / update
  "common.toggleTheme": "Toggle theme",
  "download.dialogDesc":
    "Choose your platform; the download starts immediately. Data stays in sync with the web.",
  "download.yourDevice": "your device",
  "download.unsigned":
    'Since the install is unsigned, the system may show an "unknown publisher" warning; it\'s safe to install.',
  "download.allReleases": "All releases",
  "update.foundTitle": "Update found",
  "update.foundDesc": "Downloading version {version}…",
  "update.readyTitle": "Update ready 🎉",
  "update.readyDesc": "Version {version} downloaded. You can install it now.",
  "update.installNow": "Update now",
  "update.checkFailedTitle": "Couldn't check for updates",
  "update.checkFailedDesc":
    "Auto-update may not be supported for this install type.",
  "update.openReleases": "Open releases",
  "update.upToDate": "Your app is up to date ✓",

  // Supabase setup screen
  "setup.title": "Supabase setup required",
  "setup.intro":
    "To run the app you need to connect a Supabase project. Follow these steps:",
  "setup.step1": "Create a free project at:",
  "setup.step2": "In the SQL Editor, run the SQL from this folder:",
  "setup.step3": "Add this file to the project root:",
  "setup.restart": "Then restart the dev server.",

  // Color palettes
  "palette.professional.name": "Professional",
  "palette.professional.desc": "Neutral and calm — for everyone",
  "palette.masculine.name": "Ocean",
  "palette.masculine.desc": "Deep blue & teal, strong",
  "palette.feminine.name": "Rose",
  "palette.feminine.desc": "Pink & lavender, soft",
  "palette.emerald.name": "Emerald",
  "palette.emerald.desc": "Natural green, balanced",
};

export const translations: Record<Lang, Dict> = { tr, en };
