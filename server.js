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

const diff = waveStart - waveEnd;

// FIB LEVELS
const fib0618 = waveEnd + diff * 0.618;
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

if (currentPrice && currentPrice < fib0618) {

  analysis = `
Trenutno se odvija odbojni val znotraj korekcije. Cena še ni presegla ključnega nivoja ${Math.round(fib0618)} USD, kar pomeni, da popravek še vedno traja.

Za potrditev zaključka korekcije bo moral trg najprej prebiti območje ${Math.round(fib0618)} USD. V tem primeru se odpre prostor za nadaljevanje gibanja proti ${Math.round(target1)} USD.

V primeru povečane moči se lahko gibanje razširi tudi proti ${Math.round(target2)} USD ali višje.

Če se od trenutne cene pri ${Math.round(currentPrice)} USD pojavi zavrnitev in se padec nadaljuje, potem bo preboj pod ${currentFib618} USD razveljavil scenarij rasti proti ${Math.round(target1)} USD.

V tem primeru obstaja povečana verjetnost oblikovanja dvojnega dna ali novega nižjega dna.

Pomembno: v primeru nadaljnje rasti nad ${Math.round(currentPrice)} USD se bo tudi invalidacijski nivo (${currentFib618} USD) ustrezno premaknil.
`;

} else {

  analysis = `
Cena je že presegla ključni nivo ${Math.round(fib0618)} USD, kar nakazuje, da je korekcija najverjetneje zaključena.

Trenutno se odpira prostor za nadaljevanje rasti proti ${Math.round(target1)} USD.

Če se momentum ohrani, se lahko gibanje razširi tudi proti ${Math.round(target2)} USD ali višje.

Scenarij se razveljavi v primeru padca pod ${currentFib618} USD.
`;
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
