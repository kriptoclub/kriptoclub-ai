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

const isUptrend = waveStart < waveEnd;
const isDowntrend = waveStart > waveEnd;

if (isNaN(waveStart) || isNaN(waveEnd))  {
  return res.json({ error: "Manjkajo podatki (wave_start, wave_end)" });
}

// razlika (vedno pozitivna)
const diff = Math.abs(waveStart - waveEnd);

// smer vala
let fib0382, fib0618, fib0786;
let target1, target2, target3, target4;

// 🟢 RAST → korekcija dol
if (waveStart < waveEnd) {

  const diff = waveEnd - waveStart;

  fib0382 = waveEnd - diff * 0.382;
  fib0618 = waveEnd - diff * 0.618;
  fib0786 = waveEnd - diff * 0.786;

  target1 = waveEnd - diff * 1.618;
  target2 = waveEnd - diff * 2.618;
  target3 = waveEnd - diff * 3.618;
  target4 = waveEnd - diff * 4.236;

}

// 🔴 PADEC → odboj gor
else {

  const diff = waveStart - waveEnd;

  fib0382 = waveEnd + diff * 0.382;
  fib0618 = waveEnd + diff * 0.618;
  fib0786 = waveEnd + diff * 0.786;

  target1 = waveEnd + diff * 1.618;
  target2 = waveEnd + diff * 2.618;
  target3 = waveEnd + diff * 3.618;
  target4 = waveEnd + diff * 4.236;

}

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
if (isUptrend) {

if (currentPrice > fib0382) {

  analysis = `
Trenutno poteka zdrava korekcija po predhodni rasti.

Dokler cena ostaja nad ${Math.round(fib0382)} USD, ostaja struktura trenda stabilna in obstaja verjetnost nadaljevanja rasti.

Scenarij se razveljavi ob padcu pod ${Math.round(fib0618)} USD.
`;

} else if (currentPrice > fib0618) {

  analysis = `
Trenutno smo v fazi popravka.

Cena je že padla pod prvo pomembnejšo območje, kar odpira prostor za nadaljevanje gibanja proti ${Math.round(fib0618)} USD.

To območje predstavlja ključno mejo, kjer se odloča ali se trend nadaljuje ali začne slabiti.

Scenarij se razveljavi ob padcu pod ${Math.round(fib0618)} USD.
`;

} else if (currentPrice > fib0786) {

  analysis = `
Cena je padla pod 0.618 nivo (${Math.round(fib0618)} USD).

To je pomemben signal slabitve trenda.

Če se cena približa območju ${Math.round(waveStart)} USD, obstaja možnost oblikovanja dvojnega dna.

V primeru preboja tega nivoja se poveča verjetnost padca proti ${Math.round(target1)} USD (1.618 Fibonacci).
`;

} else if (currentPrice > waveStart) {

  analysis = `
Cena se nahaja tik nad prejšnjim dnom pri ${Math.round(waveStart)} USD.

Gre za kritično območje, kjer lahko pride do kratkoročnega odboja, vendar je statistično verjetnejši nadaljnji padec.

V primeru izgube tega nivoja se odpre prostor za padec proti ${Math.round(target1)} USD.

Scenarij se razveljavi ob vrnitvi nad ${Math.round(fib0786)} USD.
`;

} else {

  analysis = `
Prejšnje dno je bilo izgubljeno, kar potrjuje prehod v padajoč trend.

S tem se odpre prostor za nadaljevanje padca proti ${Math.round(target1)} USD, z možnostjo dosega tudi ${Math.round(target2)} USD.

Scenarij se razveljavi ob vrnitvi nad ${Math.round(waveStart)} USD.
`;
}

} else if (isDowntrend) {

  if (currentPrice < fib0382) {

    analysis = `
Trenutno se odvija odbojni val in od tega kako se bo ta odbojni val odvijal, bo odvisno nadaljevanje. 

Obstajata dva nivoja pri katerih lahko pride do zavrnitve in na njiju je potrebno biti pozoren. Prvi nivo se nahaja v višini 
${Math.round(fib0382)} USD in drugi nivo se nahaja v višini ${Math.round(fib0618)} USD.

Preboj prvega nivoja odpira vrata dvigu do drugega nivoja, kot rečeno pa je na njiju potrebno biti pozoren, saj predstavljata tudi morebitno zavrnitveno točko.
Najbolj ključen od obeh nivojev je drugi nivo pri ${Math.round(fib0618)} USD. in če se dogodi preboj tega nivoja lahko sledi dvig do predhodnega vrha,
pri čemer bo potrebno paziti še na nivo ${Math.round(fib0786)} USD. Nad tem nivojem je torej možen dvig do predhodnega vrha in v kolikor pa ta vrh presežen, se bo pričel razvijati naslednji impulzivni val.  

`;

  } else if (currentPrice < fib0618) {

    analysis = `
Odboj je dosegel pomembnejše območje, kjer lahko pride do zavrnitve.

To je ključna cona, kjer se lahko trend nadaljuje navzdol ali pa začne prehajati v obrat.

Scenarij se razveljavi ob preboju nad ${Math.round(fib0618)} USD.
`;

  } else {

    analysis = `
Cena je presegla ključno območje odboja, kar lahko nakazuje začetek spremembe trenda.

V tem primeru se povečuje verjetnost nadaljevanja rasti proti ${Math.round(target1)} USD.

Scenarij se razveljavi ob padcu nazaj pod ${Math.round(fib0618)} USD.
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
