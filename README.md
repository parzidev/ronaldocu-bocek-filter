# 🪳 Ronaldocu Böcek Filter

X/Twitter'da profil adında belirli bayrak emojileri bulunan ronaldocu böceklerin tweetlerini **kendi tarayıcınızda** otomatik olarak gizleyen Chrome eklentisi.

> **Kimseyi engellemez, API kullanmaz, veri göndermez.**  
> Sadece sizin tarayıcınızda DOM üzerinden tweetleri `display:none` yapar.

---

## ✨ Özellikler

- 🔍 Profil adındaki bayrak emojilerini otomatik tespit eder
- 🧩 Hem text (`🇵🇹`) hem de img render (`<img alt="🇵🇹">`) desteği
- ➕ Popup üzerinden istediğiniz emoji/bayrağı ekleyin veya kaldırın
- 🔄 X/Twitter'ın infinite scroll yapısına uyumlu (MutationObserver)
- ⚡ `requestAnimationFrame` ile debounce — performans dostu
- 💾 Ayarlar `chrome.storage.local` ile saklanır
- 🔁 Eklenti kapatılınca gizlenen tweetler anında geri gelir
- 🌐 `x.com` ve `twitter.com` üzerinde çalışır

---

## 📦 Kurulum

### Chrome Web Store'dan
> Henüz yayınlanmadı.

### Manuel Kurulum (Geliştirici Modu)

1. Bu repoyu klonlayın:
   ```bash
   git clone https://github.com/kullanici/ronaldocu-bocek-filter.git
   ```
2. Chrome'da `chrome://extensions` adresine gidin
3. Sağ üstten **Geliştirici modu**'nu açın
4. **Paketlenmemiş öğe yükle** butonuna tıklayın
5. `x-flag-filter` klasörünü seçin
6. Eklenti yüklenecek — adres çubuğunun yanında ikonu belirecek

---

## 🎮 Kullanım

1. **x.com** veya **twitter.com**'a gidin
2. Eklenti otomatik olarak çalışmaya başlar
3. Araç çubuğundaki eklenti ikonuna tıklayarak popup'ı açın:
   - **Toggle** ile filtreyi açıp kapatın
   - **Emoji/bayrak ekleyin** — input alanına yapıştırıp "Ekle" butonuna basın
   - Eklenen bayrakları **×** butonu ile kaldırın
   - **Gizlenen tweet sayısını** takip edin
   - **Sayacı sıfırlayın**

---

## 🗂️ Dosya Yapısı

```
x-flag-filter/
├─ manifest.json   # Manifest V3 yapılandırması
├─ content.js      # Tweet tarama + MutationObserver mantığı
├─ style.css       # Gizleme CSS'i (sadece işaretlenen tweetler)
├─ popup.html      # Popup arayüzü
├─ popup.js        # Popup mantığı (toggle, bayrak yönetimi, sayaç)
└─ popup.css       # Popup stilleri (X temasıyla uyumlu koyu tasarım)
```

---

## ⚙️ Nasıl Çalışır

```
Sayfa yüklenir
    │
    ▼
content.js başlar → ayarları chrome.storage'dan okur
    │
    ▼
MutationObserver → yeni DOM değişikliklerini izler
    │
    ▼
Her yeni tweet için:
    ├─ article[data-testid="tweet"] bulunur
    ├─ [data-testid="User-Name"] içinde hedef emoji aranır
    │   ├─ textContent kontrolü
    │   ├─ img[alt] kontrolü
    │   └─ img[title] kontrolü
    │
    ├─ Eşleşme varsa → data-parzi-hidden="pt-flag" eklenir
    │   └─ CSS ile display:none uygulanır
    │
    └─ Eşleşme yoksa → tweet'e dokunulmaz
```

---

## 🔒 Gizlilik & Güvenlik

| Konu | Durum |
|---|---|
| API kullanımı | ❌ Yok |
| Network isteği | ❌ Yok |
| Veri toplama | ❌ Yok |
| Otomatik tıklama | ❌ Yok |
| Gerçek engelleme/mute | ❌ Yok |
| İzinler | Sadece `storage` |

Eklenti **yalnızca sizin tarayıcınızda** çalışır. Hiçbir kullanıcıyı gerçekten engellemez, hiçbir yere veri göndermez, X/Twitter API'sine erişmez.

---

## 🛠️ Geliştirme

Herhangi bir build tool, framework veya npm paketi gerekmez. Saf JavaScript, HTML ve CSS.

Değişiklik yaptıktan sonra `chrome://extensions` → eklentideki 🔄 ikonuna basarak yeniden yükleyin.


