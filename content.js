/* ===========================================================
   Ronaldocu Böcek Filter — content.js
   X/Twitter üzerinde belirli bayrak emojileri içeren profil
   adlarına sahip ronaldocu böceklerin tweetlerini DOM'dan gizler.

   - API kullanmaz, network request atmaz.
   - Sadece kullanıcının kendi tarayıcısında çalışır.
   - MutationObserver ile infinite scroll desteği sağlar.
   - chrome.storage.local ile ayarları okur / dinler.
   =========================================================== */

(function () {
  "use strict";

  // ── Sabitler ────────────────────────────────────────────────
  const TWEET_SELECTOR = 'article[data-testid="tweet"]';
  const USERNAME_SELECTOR = '[data-testid="User-Name"]';
  const HIDDEN_ATTR = "data-parzi-hidden";
  const HIDDEN_VALUE = "pt-flag";

  // ── Varsayılan ayarlar ──────────────────────────────────────
  const DEFAULT_SETTINGS = {
    enabled: true,
    targetFlags: ["🇵🇹"],
    hiddenCount: 0,
  };

  // Title içinde aranacak anahtar kelimeler (küçük harfe çevrilir)
  const FLAG_TITLE_KEYWORDS = [
    "portekiz",
    "portugal",
    "portugal flag",
    "portekiz bayrağı",
    "flag: portugal",
  ];

  // ── Durum ───────────────────────────────────────────────────
  let settings = { ...DEFAULT_SETTINGS };
  let scanScheduled = false;

  // ── Yardımcı: Ayarları oku ──────────────────────────────────
  function loadSettings(callback) {
    chrome.storage.local.get(
      ["enabled", "targetFlags", "hiddenCount"],
      function (result) {
        settings.enabled =
          result.enabled !== undefined ? result.enabled : DEFAULT_SETTINGS.enabled;
        settings.targetFlags =
          result.targetFlags && result.targetFlags.length
            ? result.targetFlags
            : DEFAULT_SETTINGS.targetFlags;
        settings.hiddenCount =
          typeof result.hiddenCount === "number"
            ? result.hiddenCount
            : DEFAULT_SETTINGS.hiddenCount;

        if (typeof callback === "function") callback();
      }
    );
  }

  // ── Yardımcı: Gizlenen tweet sayısını kaydet ───────────────
  function persistHiddenCount() {
    chrome.storage.local.set({ hiddenCount: settings.hiddenCount });
  }

  // ── Tek bir tweet'i kontrol et ve gerekirse gizle ───────────
  function processTweet(article) {
    // Zaten işlenmiş mi?
    if (article.hasAttribute(HIDDEN_ATTR)) return;

    // Kullanıcı adı alanını bul
    var userNameEl = article.querySelector(USERNAME_SELECTOR);
    if (!userNameEl) return; // alan yoksa pas geç

    var shouldHide = false;

    // 1) textContent içinde bayrak emoji kontrolü
    var text = userNameEl.textContent || "";
    for (var i = 0; i < settings.targetFlags.length; i++) {
      if (text.indexOf(settings.targetFlags[i]) !== -1) {
        shouldHide = true;
        break;
      }
    }

    // 2) img elementleri üzerinden kontrol (X bazen emojiyi img olarak render eder)
    if (!shouldHide) {
      var images = userNameEl.querySelectorAll("img");
      for (var j = 0; j < images.length; j++) {
        var img = images[j];
        var alt = (img.getAttribute("alt") || "").trim();
        var title = (img.getAttribute("title") || "").trim().toLowerCase();

        // alt attribute içinde hedef bayrak var mı?
        for (var k = 0; k < settings.targetFlags.length; k++) {
          if (alt.indexOf(settings.targetFlags[k]) !== -1) {
            shouldHide = true;
            break;
          }
        }
        if (shouldHide) break;

        // title attribute içinde bilinen anahtar kelimeler var mı?
        for (var m = 0; m < FLAG_TITLE_KEYWORDS.length; m++) {
          if (title.indexOf(FLAG_TITLE_KEYWORDS[m]) !== -1) {
            shouldHide = true;
            break;
          }
        }
        if (shouldHide) break;
      }
    }

    // 3) Gizleme işlemi
    if (shouldHide) {
      article.setAttribute(HIDDEN_ATTR, HIDDEN_VALUE);
      settings.hiddenCount++;
      persistHiddenCount();
    }
  }

  // ── Sayfadaki tüm tweetleri tara ───────────────────────────
  function scanAllTweets() {
    if (!settings.enabled) return;
    if (!document.body) return;

    var tweets = document.querySelectorAll(TWEET_SELECTOR);
    for (var i = 0; i < tweets.length; i++) {
      processTweet(tweets[i]);
    }
  }

  // ── Debounce'lu tarama zamanlayıcı ─────────────────────────
  function scheduleScan() {
    if (scanScheduled) return;
    scanScheduled = true;

    requestAnimationFrame(function () {
      scanScheduled = false;
      scanAllTweets();
    });
  }

  // ── Extension kapatıldığında gizlenen tweetleri geri getir ─
  function revealAllTweets() {
    var hidden = document.querySelectorAll("[" + HIDDEN_ATTR + "]");
    for (var i = 0; i < hidden.length; i++) {
      hidden[i].removeAttribute(HIDDEN_ATTR);
    }
  }

  // ── MutationObserver: Yeni eklenen tweetleri yakala ─────────
  function startObserver() {
    if (!document.body) {
      // Body henüz hazır değilse biraz bekle
      window.addEventListener("DOMContentLoaded", function () {
        startObserver();
      });
      return;
    }

    var observer = new MutationObserver(function (mutations) {
      // Yeni child eklenmişse tarama zamanla
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0) {
          scheduleScan();
          return; // Tek bir tetikleme yeterli
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ── Storage değişikliklerini dinle ──────────────────────────
  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName !== "local") return;

    if (changes.enabled !== undefined) {
      settings.enabled = changes.enabled.newValue;

      if (settings.enabled) {
        // Açıldığında mevcut tweetleri tara
        scheduleScan();
      } else {
        // Kapatıldığında gizlenen tweetleri göster
        revealAllTweets();
      }
    }

    if (changes.targetFlags !== undefined) {
      settings.targetFlags = changes.targetFlags.newValue || DEFAULT_SETTINGS.targetFlags;
      // Yeni bayrak listesiyle tekrar tara
      if (settings.enabled) scheduleScan();
    }

    if (changes.hiddenCount !== undefined) {
      settings.hiddenCount = changes.hiddenCount.newValue || 0;
    }
  });

  // ── Başlat ──────────────────────────────────────────────────
  loadSettings(function () {
    scanAllTweets();
    startObserver();
    console.log("[Ronaldocu Böcek Filter] Aktif — Hedef bayraklar:", settings.targetFlags.join(", "));
  });
})();
