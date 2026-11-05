// Ortam değişkenlerini (.env dosyasını) yüklüyoruz
require('dotenv').config();

const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// JSON verilerini ve statik dosyaları (frontend) sunabilmek için ara yazılımlar
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Çeviri API Uç Noktası (Endpoint)
app.post('/api/translate', async (req, res) => {
  try {
    const { sourceLang, targetLang, text, domain, tone, glossary } = req.body;

    // Temel girdi kontrolü
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Lütfen çevrilecek bir metin girin.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(500).json({
        error: 'API anahtarı bulunamadı! Lütfen projenin ana dizinindeki .env dosyasına geçerli bir GEMINI_API_KEY ekleyin ve sunucuyu yeniden başlatın.'
      });
    }

    // Google Generative AI istemcisini başlat
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    // Alan (Domain) ve Üslup (Tone) açıklamaları
    const domainMap = {
      general: 'Genel günlük içerik',
      legal: 'Hukuki metin (resmi terimler ve hukuki kesinlik gözetilmeli)',
      medical: 'Tıbbi / Medikal metin (tıbbi terminoloji ve hassasiyet gözetilmeli)',
      technical: 'Teknik / Mühendislik / Bilişim metni (teknik terminolojiye sadık kalınmalı)',
      literary: 'Edebi metin (anlatım zenginliği, akıcılık ve sanatsal üslup korunmalı)'
    };

    const toneMap = {
      formal: 'Resmi, kurumsal ve mesafeli bir dil',
      informal: 'Samimi, gündelik ve konuşma dili tarzında'
    };

    const selectedDomain = domainMap[domain] || domainMap.general;
    const selectedTone = toneMap[tone] || toneMap.formal;

    // Terimce (Glossary) çözümleme
    let glossaryInstructions = '';
    if (glossary && glossary.trim()) {
      const lines = glossary
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.includes('='));

      if (lines.length > 0) {
        glossaryInstructions = `\nZORUNLU TERİMCE (GLOSSARY):\nMetinde geçen aşağıdaki terimleri MUTLAKA belirtilen karşılıklarıyla çevir:\n` +
          lines.map(l => `- ${l}`).join('\n') + '\n';
      }
    }

    // Modele verilecek kesin sistem talimatı
    const systemInstruction = `Sen profesyonel bir çevirmensin.
Görevin: Verilen metni "${sourceLang}" dilinden "${targetLang}" diline çevirmektir.

ÇEVİRİ KURALLARI:
1. Alan / Bağlam: ${selectedDomain}.
2. Üslup / Ton: ${selectedTone}.
${glossaryInstructions}
3. ÇIKIŞ FORMATI KURALLARI (ÇOK ÖNEMLİ):
- YALNIZCA çevrilen hedef metni döndür.
- Asla "İşte çeviri:", "Çeviri:", tırnak işaretleri, selamlama, özet veya herhangi bir açıklama ekleme.
- Metin markdown veya kod içeriyorsa biçimlendirmeyi koru ama kendi yorumunu ekleme.`;

    // Gemini 3.8 Flash modeli ile yapılandırma
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.2 // Çeviride tutarlılık ve doğruluğu artırmak için düşük sıcaklık
      }
    });

    const result = await model.generateContent(text);
    const response = await result.response;
    const translatedText = response.text() ? response.text().trim() : '';

    return res.json({ translation: translatedText });

  } catch (err) {
    console.error('Gemini API Hatası:', err);

    const errorMessage = err.message || '';
    let userFriendlyError = 'Çeviri yapılırken bir hata oluştu.';

    // Hata türüne göre kullanıcıya anlaşılır çözümler sunalım
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid api key') || errorMessage.includes('403')) {
      userFriendlyError = 'API Anahtarı Geçersiz: .env dosyasına yapıştırdığınız GEMINI_API_KEY hatalı veya yetkisiz. Lütfen Google AI Studio üzerinden aldığınız anahtarı kontrol edin.';
    } else if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429') || errorMessage.includes('quota')) {
      userFriendlyError = 'API Kotası Doldu: Gemini API istek limitiniz aşıldı. Lütfen bir süre bekleyip tekrar deneyin veya API kotanızı kontrol edin.';
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
      userFriendlyError = 'Bağlantı Hatası: İnternet bağlantınızı kontrol edin. Gemini sunucularına erişilemiyor.';
    } else {
      userFriendlyError = `Beklenmeyen bir hata oluştu: ${errorMessage}`;
    }

    return res.status(500).json({ error: userFriendlyError });
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`===============================================`);
  console.log(` Çeviri Uygulaması Başarıyla Çalışıyor!`);
  console.log(` Tarayıcınızda açın: http://localhost:${port}`);
  console.log(`===============================================`);
});
