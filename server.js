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

if (isNaN(waveStart) || isNaN(waveEnd))  {
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
// 🟢 KOREKCIJA
// =========================
if (isCorrection) {

  // (tvoj obstoječi blok pusti kot je)

}

// =========================
// 🔴 IMPULZ (FIXED)
// =========================
else if (isImpulse) {

  const diffImpulse = waveEnd - waveStart;

  const fib0382 = waveEnd - diffImpulse * 0.382;
  const fib0618 = waveEnd - diffImpulse * 0.618;
  const fib0786 = waveEnd - diffImpulse * 0.786;

  if (currentPrice > fib0382) {

    analysis = `
Trenutno poteka zdrava korekcija po rasti.

Dokler cena ostaja nad ${Math.round(fib0382)} USD, je struktura še vedno močna in obstaja velika verjetnost nadaljevanja rasti.
`;

  } else if (currentPrice > fib0618) {

    analysis = `
Trenutno smo v fazi popravka.

Cena je padla pod prvo pomembnejšo točko pri ${Math.round(fib0382)} USD, kar odpira prostor za nadaljevanje korekcije proti ${Math.round(fib0618)} USD (0.618).
`;

  } else if (currentPrice > fib0786) {

    analysis = `
Cena je padla pod 0.618 nivo (${Math.round(fib0618)} USD).

To je prvi resnejši signal slabitve trenda.

Naslednja ključna obrambna točka se nahaja pri ${Math.round(fib0786)} USD (0.786).
`;

  } else if (currentPrice > waveStart) {

    analysis = `
Popravek je presegel tudi 0.786 nivo.

Cena se lahko premakne proti prejšnjemu dnu pri ${Math.round(waveStart)} USD, kjer obstaja možnost dvojnega dna.
`;

  } else {

    analysis = `
Prejšnje dno je bilo izgubljeno.

V negativnem scenariju se odpre prostor za padec proti ${Math.round(target1)} USD (1.618 Fibonacci ekstenzija).
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
