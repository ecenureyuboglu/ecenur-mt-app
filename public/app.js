// DOM Elemanlarını Seçelim
const sourceText = document.getElementById('sourceText');
const targetText = document.getElementById('targetText');
const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');
const swapLangBtn = document.getElementById('swapLangBtn');
const domainSelect = document.getElementById('domainSelect');
const toneSelect = document.getElementById('toneSelect');
const translateBtn = document.getElementById('translateBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const charCount = document.getElementById('charCount');
const statusInfo = document.getElementById('statusInfo');

// Terimce Elemanları
const toggleGlossaryBtn = document.getElementById('toggleGlossaryBtn');
const glossaryPanel = document.getElementById('glossaryPanel');
const closeGlossaryBtn = document.getElementById('closeGlossaryBtn');
const glossaryInput = document.getElementById('glossaryInput');
const glossaryBadge = document.getElementById('glossaryBadge');

// Hata Bildirim Elemanları
const errorBanner = document.getElementById('errorBanner');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const dismissError = document.getElementById('dismissError');

// Karakter Sayacı Güncelleme
sourceText.addEventListener('input', () => {
  const count = sourceText.value.length;
  charCount.textContent = `${count} karakter`;
});

// Metin Temizleme Butonu
clearBtn.addEventListener('click', () => {
  sourceText.value = '';
  targetText.value = '';
  charCount.textContent = '0 karakter';
  statusInfo.textContent = 'Hazır';
  hideError();
  sourceText.focus();
});

// Dil Değiştirme (Swap) Butonu
swapLangBtn.addEventListener('click', () => {
  const tempLang = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = tempLang;

  // Kutulardaki metinleri de yer değiştir
  const tempText = sourceText.value;
  sourceText.value = targetText.value;
  targetText.value = tempText;

  charCount.textContent = `${sourceText.value.length} karakter`;
});

// Terimce (Glossary) Paneli Açma / Kapama
toggleGlossaryBtn.addEventListener('click', () => {
  glossaryPanel.classList.toggle('hidden');
  if (!glossaryPanel.classList.contains('hidden')) {
    glossaryInput.focus();
  }
});

closeGlossaryBtn.addEventListener('click', () => {
  glossaryPanel.classList.add('hidden');
});

// Terimce Rozetindeki Sayıyı Güncelleme
glossaryInput.addEventListener('input', () => {
  const lines = glossaryInput.value
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.includes('=') && l.split('=')[0].trim() && l.split('=')[1].trim());
  glossaryBadge.textContent = lines.length;
});

// Hata Kutusunu Göster
function showError(title, msg) {
  errorTitle.textContent = title;
  errorMessage.textContent = msg;
  errorBanner.classList.remove('hidden');
}

// Hata Kutusunu Gizle
function hideError() {
  errorBanner.classList.add('hidden');
}

dismissError.addEventListener('click', hideError);

// Tek Tıkla Kopyalama Fonksiyonu
copyBtn.addEventListener('click', async () => {
  const text = targetText.value;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    const originalHtml = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span>✓</span> Kopyalandı!';
    copyBtn.classList.add('copied');

    setTimeout(() => {
      copyBtn.innerHTML = originalHtml;
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch (err) {
    // Güvenli olmayan ortamlarda fallback
    targetText.select();
    document.execCommand('copy');
    statusInfo.textContent = 'Kopyalandı!';
    setTimeout(() => { statusInfo.textContent = 'Tamamlandı'; }, 2000);
  }
});

// Çeviri İsteği Gönderme
async function performTranslation() {
  const text = sourceText.value.trim();

  if (!text) {
    showError('Boş Metin', 'Lütfen çevirmek istediğiniz bir metin girin.');
    sourceText.focus();
    return;
  }

  // Diller aynı seçilmişse uyaralım
  if (sourceLang.value === targetLang.value) {
    showError('Aynı Diller Seçildi', 'Kaynak dil ile hedef dil aynı olamaz. Lütfen farklı bir dil seçin.');
    return;
  }

  hideError();

  // Yükleniyor durumuna geç
  translateBtn.disabled = true;
  spinner.classList.remove('hidden');
  btnText.textContent = 'Çevriliyor...';
  statusInfo.textContent = 'Gemini çeviriyor...';

  try {
    const payload = {
      sourceLang: sourceLang.value,
      targetLang: targetLang.value,
      text: text,
      domain: domainSelect.value,
      tone: toneSelect.value,
      glossary: glossaryInput.value
    };

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sunucudan geçersiz bir yanıt alındı.');
    }

    // Başarılı çeviri
    targetText.value = data.translation;
    statusInfo.textContent = 'Çeviri tamamlandı ✓';

  } catch (err) {
    console.error('Hata:', err);
    targetText.value = '';
    statusInfo.textContent = 'Hata oluştu ✕';
    showError('Çeviri Başarısız', err.message || 'Bilinmeyen bir hata oluştu. Lütfen bağlantınızı ve API anahtarınızı kontrol edin.');
  } finally {
    // Butonu tekrar aktif hale getir
    translateBtn.disabled = false;
    spinner.classList.add('hidden');
    btnText.textContent = 'Çevir ➔';
  }
}

// Butona tıklandığında çevir
translateBtn.addEventListener('click', performTranslation);

// Ctrl + Enter (veya Cmd + Enter) kısayolu ile hızlı çeviri
sourceText.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    performTranslation();
  }
});

