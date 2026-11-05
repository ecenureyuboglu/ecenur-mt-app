# ✦ Gemini AI Çeviri Uygulaması (Level 3)

Google Gemini API (gemini-3.8-flash) kullanarak hazırlanan; modern, iki sütunlu (DeepL benzeri), mor-siyah temalı akıllı makine çevirisi uygulaması.

---

## 🚀 Hızlı Başlangıç (Yeni Başlayanlar İçin Adım Adım)

### 1. Bağımlılıkları Yükleyin
Proje klasöründe bir komut satırı (CMD veya Terminal) açıp şu komutu çalıştırın:
```bash
npm install
```
*(Windows PowerShell kısıtlaması yaşarsanız `cmd.exe /c "npm install"` komutunu kullanabilirsiniz.)*

---

### 2. Gemini API Anahtarınızı Ekleyin
1. Proje ana klasöründeki `.env` dosyasını Not Defteri veya kullandığınız kod editörü ile açın.
2. `GEMINI_API_KEY=` kısmının karşısına tırnak işareti olmadan anahtarınızı yapıştırın:
   ```env
   GEMINI_API_KEY=AIzaSyD-örnek-anahtarınız-buraya
   PORT=3000
   ```
3. Dosyayı kaydedip kapatın.

---

### 3. Sunucuyu Başlatın
Aynı terminalde şu komutu yazarak uygulamayı başlatın:
```bash
npm start
```
Terminalde şu mesajı göreceksiniz:
```
===============================================
 Çeviri Uygulaması Başarıyla Çalışıyor!
 Tarayıcınızda açın: http://localhost:3000
===============================================
```

---

### 4. Tarayıcınızda Açın
Tarayıcınızı (Chrome, Edge vb.) açın ve adres çubuğuna şunu yazın:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🌟 Özellikler ve Kullanım

- **Kaynak & Hedef Dil Seçimi:** İngilizce, Türkçe, Almanca, İspanyolca, Fransızca, İtalyanca ve Rusça arasında çift yönlü çeviri yapabilir; ortadaki `⇄` butonuyla kaynak ve hedefi anında tersine çevirebilirsiniz.
- **Alan (Domain) Seçimi:**
  - Genel
  - Hukuk
  - Tıp
  - Teknik
  - Edebi
- **Üslup (Tone) Seçimi:**
  - Resmi
  - Gündelik / Samimi
- **Terimce (Glossary):**
  - "Terimce (Glossary)" butonuna tıklayın.
  - Her satıra `kaynak terim = hedef terim` formatında kural yazın:
    ```text
    Prompt engineering = İstek mühendisliği
    token = jeton
    pipeline = veri hattı
    ```
  - Gemini bu terimleri çeviride mutlaka belirttiğiniz şekilde kullanacaktır.
- **Tek Tıkla Kopyalama:** Çeviri kutusunun sağ üstündeki **"📋 Kopyala"** butonu ile sonucu anında panoya kopyalayın.
- **Hızlı Kısayol:** Metin kutusundayken `Ctrl + Enter` tuşlarına basarak fareye dokunmadan hızlıca çevirebilirsiniz.
- **Türkçe Hata Yönetimi:** API anahtarı girilmediğinde, kota dolduğunda veya ağ hatasında anlaşılır Türkçe yönlendirmeler ekranda görünür.
- **Mor & Siyah Tasarım + Mobil Uyumlu:** Telefon, tablet veya masaüstü ekranlarda kusursuz çalışır.

