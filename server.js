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
pairInput = pairInput.toUpperCase().replace("-", "/");

if (!pairInput.includes("/")) {
  if (pairInput.endsWith("USDT")) {
    pairInput = pairInput.replace("USDT", "/USDT");
  } else if (pairInput.endsWith("USD")) {
    pairInput = pairInput.replace("USD", "/USD");
  }
}

if (!pairInput.includes("/")) {
  if (pairInput.endsWith("USDT")) {
    pairInput = pairInput.replace("USDT", "/USDT");
  }
}
// =========================
// 🔥 FIB ANALIZA (TVOJ SISTEM)
// =========================

const waveStart = parseFloat(req.query.wave_start);
const waveEnd = parseFloat(req.query.wave_end);
const currentPrice = parseFloat(req.query.current_price);

if (!waveStart || !waveEnd) {
  return res.json({ error: "Manjkajo podatki (wave_start, wave_end)" });
}

// razlika (vedno pozitivna)
const diff = Math.abs(waveStart - waveEnd);

// smer vala
const isCorrection = waveStart > waveEnd; // padec → korekcija (bull trend)
const isImpulse = waveStart < waveEnd;    // rast → impulz (zdaj korekcija)

// FIB LEVELS
const fib0618 = waveEnd + diff * 0.618;
const fib0382 = waveEnd + diff * 0.382;
const target1 = waveEnd + diff * 1.618;
const target2 = waveEnd + diff * 2.618;
const target3 = waveEnd + diff * 3.618;
const target4 = waveEnd + diff * 4.236;

    // =========================
// 🔥 CURRENT WAVE (ZA INVALIDACIJO)
// =========================

// trenutni val = od waveEnd do currentPrice
const currentWaveLow = waveEnd;
const currentWaveHigh = currentPrice;

// 0.618 retracement trenutnega vala
const currentFib618 = Math.round(
  currentWaveHigh - (currentWaveHigh - currentWaveLow) * 0.618
);

// =========================
// 🧠 LOGIKA
// =========================

let analysis = "";

// =========================
// 🟢 KOREKCIJA (tvoj primer 1,2,3)
// =========================
if (isCorrection) {

  if (currentPrice < fib0618) {

    analysis = `
Trenutno se odvija korekcija znotraj rastočega trenda.

Ključna nivoja:
- ${Math.round(fib0382)} USD
- ${Math.round(fib0618)} USD

Na teh območjih lahko pride do reakcije trga.

Preboj nad ${Math.round(fib0618)} USD bi potrdil zaključek korekcije in odprl prostor za rast proti ${Math.round(target1)} USD.
`;

  } else if (currentPrice < waveStart) {

    analysis = `
Cena se približuje prejšnjemu vrhu pri ${Math.round(waveStart)} USD.

Možna scenarija:
- zavrnitev → dvojni vrh
- preboj → začetek impulznega vala

V primeru preboja se odpre prostor proti ${Math.round(target1)} USD.
`;

  } else {

    analysis = `
Prejšnji vrh pri ${Math.round(waveStart)} USD je bil presežen.

To pomeni začetek impulznega vala.

Cilji:
- ${Math.round(target1)} USD
- ${Math.round(target2)} USD

Scenarij se razveljavi ob padcu pod ${currentFib618} USD.
`;

  }

}

// =========================
// 🔴 IMPULZ (tvoj primer 4)
// =========================
else {

  const fib0382_down = waveStart + (waveEnd - waveStart) * 0.382;
  const fib0618_down = waveStart + (waveEnd - waveStart) * 0.618;

  if (currentPrice > fib0618_down) {

    analysis = `
Trenutno poteka korekcija po rasti.

Ključna nivoja:
- ${Math.round(fib0382_down)} USD
- ${Math.round(fib0618_down)} USD

Na teh nivojih lahko pride do zavrnitve.

Če se cena obrne navzdol, obstaja verjetnost nadaljevanja padca proti ${Math.round(waveStart)} USD.
`;

  } else {

    analysis = `
Popravek je presegel 0.618 nivo.

To pomeni povečano verjetnost spremembe trenda.

Če cena izgubi ${Math.round(waveStart)} USD, se odpre prostor za padec proti ${Math.round(target1)} USD.
`;

  }

}

// =========================
// 📤 OUTPUT
// =========================

res.json({
  pair: pairInput,
  currentPrice,
  key_level: Math.round(fib0618),
  target1: Math.round(target1),
  target2: Math.round(target2),
  target3: Math.round(target3),
  target4: Math.round(target4),
  analysis
});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running"));
