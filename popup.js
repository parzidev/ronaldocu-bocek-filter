/* ===========================================================
   Ronaldocu Böcek Filter — popup.js
   Popup açıldığında ayarları okur, toggle, sayaç ve
   özel bayrak/emoji ekleme-silme yönetir.
   =========================================================== */

(function () {
  "use strict";

  // ── DOM Referansları ────────────────────────────────────────
  var toggleEl = document.getElementById("toggleEnabled");
  var statusText = document.getElementById("statusText");
  var hiddenCountEl = document.getElementById("hiddenCount");
  var flagTagsEl = document.getElementById("flagTags");
  var flagInput = document.getElementById("flagInput");
  var addFlagBtn = document.getElementById("addFlagBtn");
  var resetBtn = document.getElementById("resetBtn");

  // ── Varsayılan ayarlar ──────────────────────────────────────
  var DEFAULT = {
    enabled: true,
    targetFlags: ["\u{1F1F5}\u{1F1F9}"], // 🇵🇹
    hiddenCount: 0,
  };

  // ── Mevcut flags (yerel kopya) ──────────────────────────────
  var currentFlags = [];

  // ── UI güncelle ─────────────────────────────────────────────
  function updateUI(enabled, hiddenCount, targetFlags) {
    toggleEl.checked = enabled;

    if (enabled) {
      statusText.textContent = "Aktif";
      statusText.className = "status-text status-on";
    } else {
      statusText.textContent = "Kapalı";
      statusText.className = "status-text status-off";
    }

    hiddenCountEl.textContent = hiddenCount;
    currentFlags = targetFlags;
    renderFlagTags(targetFlags);
  }

  // ── Bayrak tag'lerini render et ─────────────────────────────
  function renderFlagTags(flags) {
    flagTagsEl.innerHTML = "";

    for (var i = 0; i < flags.length; i++) {
      var tag = document.createElement("span");
      tag.className = "flag-tag";

      var emoji = document.createElement("span");
      emoji.className = "flag-tag-emoji";
      emoji.textContent = flags[i];

      var removeBtn = document.createElement("button");
      removeBtn.className = "flag-tag-remove";
      removeBtn.type = "button";
      removeBtn.textContent = "×";
      removeBtn.title = "Kaldır";
      removeBtn.setAttribute("data-flag", flags[i]);
      removeBtn.addEventListener("click", handleRemoveFlag);

      tag.appendChild(emoji);
      tag.appendChild(removeBtn);
      flagTagsEl.appendChild(tag);
    }

    // Liste boşsa bilgi mesajı göster
    if (flags.length === 0) {
      var empty = document.createElement("span");
      empty.className = "flag-tags-empty";
      empty.textContent = "Henüz filtre yok";
      flagTagsEl.appendChild(empty);
    }
  }

  // ── Bayrak silme ────────────────────────────────────────────
  function handleRemoveFlag(e) {
    var flagToRemove = e.currentTarget.getAttribute("data-flag");
    var newFlags = [];
    for (var i = 0; i < currentFlags.length; i++) {
      if (currentFlags[i] !== flagToRemove) {
        newFlags.push(currentFlags[i]);
      }
    }
    chrome.storage.local.set({ targetFlags: newFlags }, function () {
      loadAndRender();
    });
  }

  // ── Bayrak ekleme ───────────────────────────────────────────
  function addFlag() {
    var value = (flagInput.value || "").trim();
    if (!value) return;

    // Zaten var mı kontrol et
    for (var i = 0; i < currentFlags.length; i++) {
      if (currentFlags[i] === value) {
        flagInput.value = "";
        shakeInput();
        return;
      }
    }

    var newFlags = currentFlags.slice();
    newFlags.push(value);
    chrome.storage.local.set({ targetFlags: newFlags }, function () {
      flagInput.value = "";
      loadAndRender();
    });
  }

  // ── Input'u salla (duplikat uyarısı) ────────────────────────
  function shakeInput() {
    flagInput.classList.add("shake");
    setTimeout(function () {
      flagInput.classList.remove("shake");
    }, 400);
  }

  // ── Ayarları yükle ──────────────────────────────────────────
  function loadAndRender() {
    chrome.storage.local.get(
      ["enabled", "targetFlags", "hiddenCount"],
      function (result) {
        var enabled =
          result.enabled !== undefined ? result.enabled : DEFAULT.enabled;
        var flags =
          result.targetFlags && result.targetFlags.length
            ? result.targetFlags
            : DEFAULT.targetFlags;
        var count =
          typeof result.hiddenCount === "number"
            ? result.hiddenCount
            : DEFAULT.hiddenCount;

        updateUI(enabled, count, flags);
      }
    );
  }

  // ── Toggle değişikliği ──────────────────────────────────────
  toggleEl.addEventListener("change", function () {
    var newValue = toggleEl.checked;
    chrome.storage.local.set({ enabled: newValue }, function () {
      loadAndRender();
    });
  });

  // ── Ekle butonu ─────────────────────────────────────────────
  addFlagBtn.addEventListener("click", function () {
    addFlag();
  });

  // ── Enter tuşu ile ekle ─────────────────────────────────────
  flagInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addFlag();
    }
  });

  // ── Sayacı sıfırla ─────────────────────────────────────────
  resetBtn.addEventListener("click", function () {
    chrome.storage.local.set({ hiddenCount: 0 }, function () {
      loadAndRender();
    });
  });

  // ── Storage değişikliklerini dinle (popup açıkken güncelle) ─
  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === "local") {
      loadAndRender();
    }
  });

  // ── Başlat ──────────────────────────────────────────────────
  loadAndRender();
})();
