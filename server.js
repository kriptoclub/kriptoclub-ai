import cors from "cors";   
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors()); 

app.get("/analyze", async (req, res) => {
  try {
    let pairInput = req.query.pair || "BTC/USDT";

// 🔥 NORMALIZACIJA (KLJUČNO)
pairInput = pairInput.toUpperCase();

if (!pairInput.includes("/")) {
  if (pairInput.endsWith("USDT")) {
    pairInput = pairInput.replace("USDT", "/USDT");
  }
}
    // =========================
    // 1. COINGECKO PODATKI
    // =========================

    // podpora za osnovne coine
    const map = {
      BTC: "bitcoin",
      ETH: "ethereum",
      SOL: "solana",
      XRP: "ripple",
      ADA: "cardano",
      DOGE: "dogecoin"
    };

    const base = pairInput.split("/")[0].toUpperCase();
    const coinId = map[base];

    if (!coinId) {
      return res.json({
        error: "Nepodprt par (zaenkrat): " + pairInput
      });
    }

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;

    const response = await fetch(url);

if (!response.ok) {
  return res.json({
    error: "CoinGecko HTTP napaka",
    status: response.status
  });
}

const data = await response.json();

console.log("CoinGecko DATA:", data);

    if (!data.prices || data.prices.length === 0) {
  return res.json({
    error: "CoinGecko ni vrnil cen",
    details: data
  });
}

    const closes = data.prices.map(p => p[1]);
    const price = closes[closes.length - 1];

    // =========================
    // 2. RSI
    // =========================
    function calculateRSI(data, period = 14) {
      let gains = 0, losses = 0;

      for (let i = data.length - period; i < data.length - 1; i++) {
        const diff = data[i + 1] - data[i];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }

      const rs = gains / losses || 1;
      return 100 - (100 / (1 + rs));
    }

    const rsi = calculateRSI(closes).toFixed(2);

    // =========================
    // 3. EMA
    // =========================
    function calculateEMA(data, period) {
      const k = 2 / (period + 1);
      let ema = data[0];

      for (let i = 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
      }

      return ema;
    }

    const ema20 = calculateEMA(closes, 20).toFixed(0);
    const ema50 = calculateEMA(closes, 50).toFixed(0);
    const ema200 = calculateEMA(closes, 100).toFixed(0);

    // =========================
    // 4. MARKET STRUCTURE
    // =========================
    const last = closes.slice(-10);
    const trend =
      last[last.length - 1] > last[0] ? "higher highs" : "lower lows";

    // =========================
    // 5. PROMPT
    // =========================
    const prompt = `
Analiziraj kripto par ${pairInput}.

Podatki:
Cena: ${price}
RSI: ${rsi}
EMA20: ${ema20}
EMA50: ${ema50}
EMA200: ${ema200}
Struktura: ${trend}

Napiši profesionalno tehnično analizo v slovenščini:
- kratek povzetek
- trend
- ključni nivoji
- momentum
- scenariji
- zaključek
`;

    // =========================
    // 6. AI KLIC
    // =========================
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiData = await aiRes.json();

console.log("OpenAI response:", aiData);

// če NI pravilnega odgovora
if (!aiData.choices || !aiData.choices[0]) {
  return res.json({
    error: "Napaka pri OpenAI API",
    details: aiData
  });
}

// če je OK
res.json({
  analysis: aiData.choices[0].message.content
});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running"));
