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
//  HIBRIDNA FIB ANALIZA
// =========================

const waveStart = parseFloat(req.query.wave_start);
const waveEnd = parseFloat(req.query.wave_end);
const currentPrice = parseFloat(req.query.current_price);

if (isNaN(waveStart) || isNaN(waveEnd)) {
  return res.json({ error: "Manjkajo podatki (wave_start, wave_end)" });
}

// Inicializacija spremenljivk
let fib0382, fib0618, fib0786, fib1236;
let target1, target2, target3, target4, target5, target6, target7, target8, target9;

// 1. PRIMER: Rastoči trend (Logaritemski pogled)
// Kot si napisal: waveStart je zgoraj (višja cena), waveEnd je spodaj (nižja cena)
if (waveStart > waveEnd) {
    
    // Pomožna funkcija za logaritemski izračun
    const calcLog = (s, e, level) => {
        const logS = Math.log(s);
        const logE = Math.log(e);
        return Math.exp(logE - (logE - logS) * level);
    };

    fib0382 = calcLog(waveStart, waveEnd, 0.382);
    fib0618 = calcLog(waveStart, waveEnd, 0.618);
    fib0786 = calcLog(waveStart, waveEnd, 0.786);
    fib1236 = calcLog(waveStart, waveEnd, 1.236);

    target1 = calcLog(waveStart, waveEnd, 1.618);
    target2 = calcLog(waveStart, waveEnd, 2.618);
    target3 = calcLog(waveStart, waveEnd, 3.618);
    target4 = calcLog(waveStart, waveEnd, 4.236);
    target5 = calcLog(waveStart, waveEnd, 6.854);
    target6 = calcLog(waveStart, waveEnd, 11.09);
    target7 = calcLog(waveStart, waveEnd, 17.944);
    target8 = calcLog(waveStart, waveEnd, 29.029);
    target9 = calcLog(waveStart, waveEnd, 46.121);
} 

// 2. PRIMER: Padajoči trend (Navadni/Linearni pogled)
// Kot si napisal: waveStart je na dnu (nižja), waveEnd je na vrhu (višja)
else {
    
    const diff = waveEnd - waveStart;

    fib0382 = waveEnd + diff * 0.382;
    fib0618 = waveEnd + diff * 0.618;
    fib0786 = waveEnd + diff * 0.786;
    fib1236 = waveEnd + diff * 1.236;

    target1 = waveEnd + diff * 1.618;
    target2 = waveEnd + diff * 2.618;
    target3 = waveEnd + diff * 3.618;
    target4 = waveEnd + diff * 4.236;
    target5 = waveEnd + diff * 6.854;
    target6 = waveEnd + diff * 11.09;
    target7 = waveEnd + diff * 17.944;
    target8 = waveEnd + diff * 29.029;
    target9 = waveEnd + diff * 46.121;
}

// =========================
//  CURRENT WAVE (ZA INVALIDACIJO)
// =========================

// trenutni val = od waveEnd do currentPrice
const currentWaveLow = waveEnd;
const currentWaveHigh = currentPrice;

const invalidationLevel =
currentWaveHigh - (currentWaveHigh - currentWaveLow) * 0.618;;

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
Trenutno se odvija odbojni val, od katerega bo odvisno nadaljnje gibanje cene.
Obstajata dva ključna nivoja, kjer lahko pride do zavrnitve, zato je na njiju potrebno biti posebej pozoren. Prvi nivo se nahaja v višini 
${Math.round(fib0382)} USD in drugi nivo se nahaja v višini ${Math.round(fib0618)} USD.

Preboj prvega nivoja odpira prostor za nadaljevanje rasti proti drugemu nivoju, vendar oba predstavljata potencialno točko zavrnitve.
Ključnejši med njima je drugi nivo pri ${Math.round(fib0618)} USD. 
V primeru njegovega preboja se odpre prostor za rast proti predhodnemu vrhu, pri čemer je potrebno spremljati še nivo
 ${Math.round(fib0786)} USD. 
Nad tem nivojem se poveča verjetnost dviga do predhodnega vrha pri ${Math.round(waveStart)} USD. Če je ta vrh presežen, se lahko začne razvijati nov impulzni val s prvo tarčo rasti pri ${Math.round(target1)} USD.  

`;

  } else if (currentPrice < fib0618) {

    analysis = `
Odbojni val se nadaljuje, vendar se približujemo ključni točki, kjer bomo lahko začeli govoriti o začetku novega impulzivnega vala. Ta bi lahko najprej pripeljal do ponovnega testa predhodnega vrha pri  ${Math.round(waveStart)} USD, v primeru preboja pa bi sledil nadaljnji dvig proti ${Math.round(target1)} USD.

Glavni nivo, ki ga je potrebno spremljati, se nahaja pri ${Math.round(fib0618)} USD.
Gre za izjemno občutljivo območje, kjer lahko pride do zavrnitve, zato je potrebna povečana previdnost.

Preden bi cena dosegla predhodni vrh, je pomembno spremljati še nivo pri ${Math.round(fib0786)} USD.
Preboj tega nivoja bi potrdil scenarij nadaljevanja rasti, kot je opisan zgoraj.

Kot vedno pa moramo upoštevati tudi alternativni scenarij. V primeru padca pod ${Math.round(invalidationLevel)} USD se scenarij rasti razveljavi.
`;

 } else if (currentPrice < fib0786) {

    analysis = `
Val, v katerem se nahaja ${pairInput}, se nadaljuje in postaja vse bolj zanimivo. Do potrditve nadaljevanja rasti manjka le še odločen preboj nivoja ${Math.round(fib0786)} USD.

V primeru uspešnega preboja se odpre prostor za dvig do predhodnega vrha pri ${Math.round(waveStart)} USD. Če bo tudi ta nivo presežen, lahko pričakujemo nadaljevanje rasti proti prvi pomembnejši prodajni tarči pri ${Math.round(target1)} USD. (ostale bodo sledile če bo ta tarča presežena)

Pomembno je spremljati razvoj gibanja nivo za nivojem, saj vsak izmed njih poleg potenciala za nadaljevanje rasti predstavlja tudi možno točko zavrnitve. Ob dosegu posameznih nivojev je smiselno analizirati situacijo na krajših časovnih intervalih, kjer se najprej pokaže, ali se scenarij dodatnega nadaljevanja trenutnega trenda  potrjuje ali zavrača.

Ko bodo ti nivoji pri ${Math.round(fib0786)} USD, ${Math.round(waveStart)} USD in pri ${Math.round(target1)} USD doseženi, bova ponovno pregledala sliko na krajših intervalih in preverila bova kaj se glede dodatne rasti mora dogoditi in kaj se ne sme dogoditi. 

Kot vedno pa moramo upoštevati tudi alternativni scenarij. V primeru padca pod ${Math.round(invalidationLevel)} USD se scenarij rasti razveljavi.
`;
 } else if (currentPrice < waveStart) {

    analysis = `
    Zgodil se je pomemben premik in cena se trenutno nahaja v neposredni bližini ${Math.round(waveStart)} USD. Na tem območju je potrebna povečana previdnost, saj obstajata dva možna scenarija.

1. Scenarij – dvojni vrh
Obstaja možnost oblikovanja dvojnega vrha. Tudi če pride do rahlo višjega ali nižjega vrha in nato zavrnitve, to še vedno ohranja veljavnost tega vzorca.
Vzorec je potrjen šele s padcem pod ${Math.round(waveEnd)} USD.

2. Scenarij – preboj navzgor
Če bo nivo ${Math.round(waveStart)} USD odločno presežen, se lahko začne razvijati nov impulzivni val. Prva pomembna tarča se nahaja pri ${Math.round(target1)} USD.
Pred tem pa je potrebno spremljati še nivo ${Math.round(fib1236)} USD, ki predstavlja zadnjo pomembno oviro pred nadaljevanjem rasti.

Kot vedno pa moramo upoštevati tudi alternativni scenarij. V primeru padca pod ${Math.round(invalidationLevel)} USD se scenarij rasti razveljavi.
`;
 } else if (currentPrice < fib1236) {

    analysis = `
Preboj je potrjen in trg kaže moč.

Odpre se možnost nadaljevanja rasti proti ${Math.round(target1)} USD, vendar je ključno spremljati dogajanje pri nivoju ${Math.round(fib1236)} USD.
Preboj tega nivoja odpira vrata nadaljnjemu dvigu proti omenjeni tarči.

Kar se invalidacije tiče:
Pozornost se sedaj premakne na nivo ${Math.round(waveStart)} USD.
Padec pod ta nivo ni zaželen, saj lahko ogrozi scenarij rasti.

Na nižjih časovnih intervalih  bodi posebej pozoren na strukturo dna – prvo nižje dno je lahko zgodnji opozorilni signal.
`;

} else if (currentPrice < target1) {

    analysis = `
Gibanje se razvija zelo konstruktivno in pot do ${Math.round(target1)} USD je odprta.

Če bo ta nivo presežen, se ponovno oglasi, da izračunava naslednje tarče.

Scenarij rasti ostaja veljaven, dokler cena ostaja nad ${Math.round(waveStart)} USD.
`;

} else if (currentPrice < target2) {

    analysis = `
    Val postaja izrazito impulziven.

Obstaja možnost nadaljevanja rasti proti ${Math.round(target2)} USD.
Bodi pozoren na nivo ${Math.round(target1)} USD, saj lahko padec pod ta nivo nakaže prve znake slabitve.

Invalidacija scenarija ostaja vezana na nivo ${Math.round(waveStart)} USD.
`;

} else if (currentPrice < target3) {

    analysis = `
    Takšna dinamika v enem valu je redka, vendar jo trg trenutno potrjuje.

Naslednja tarča se nahaja pri ${Math.round(target3)} USD.

Na tej točki spremljaj:

nižje časovne intervale
pojav prvega nižjega dna (zgodnji opozorilni signal)

Glavna podpora se trenutno nahaja pri ${Math.round(target2)} USD.
`;

} else if (currentPrice < target4) {

    analysis = `
    Približujemo se izjemno občutljivemu območju pri ${Math.round(target4)} USD.

Statistično gledano večina valut na tem nivoju doživi zavrnitev, saj gre za zelo močan impulzni val.
Če pa pride do preboja, se odpre prostor za bistveno višje tarče – vendar na to ni priporočljivo računati vnaprej.

Glavna podpora:

${Math.round(target3)} USD
ob izgubi → možen padec proti ${Math.round(target2)} USD
`;
} else if (currentPrice < target5) {

    analysis = `
To je že izjemno močan in redek scenarij.

Naslednja tarča se nahaja pri ${Math.round(target5)} USD, vendar bodi previden – takšna gibanja se pogosto hitro obrnejo.

Kar gre hitro gor, gre lahko hitro tudi dol. 
`;
} else if (currentPrice < target6) {

    analysis = `
Val je izjemno impulziven.

Naslednja tarča: ${Math.round(target6)} USD

Ne dovoli, da te rast zaslepi – spremljaj nižje intervale in bodi pozoren na prvo nižje dno na krajših intervalih. Če se pojavi, ustrezno ukrepaj.  
`;
} else if (currentPrice < target7) {

    analysis = `
To je redek primer izjemno močnega trenda.

Naslednja tarča: ${Math.round(target7)} USD

Ponovno: pozornost na strukturo grafa in prvo nižje dno na nižjih intervalih bo prvo opozorilo, da se lahko trend obrne v obratno smer. 
`;
} else if (currentPrice < target8) {

    analysis = `
Takšna rast se pojavi zelo redko.

Naslednja tarča: ${Math.round(target8)} USD

Če bo ta nivo presežen, se oglasi za nadaljnjo analizo. 
`;
} else if (currentPrice < target9) {

    analysis = `
Če sva prišla do sem – čestitke.

Gre za ekstremno redek scenarij, kjer večina valut doseže svoj maksimum.
Naslednja tarča se nahaja pri ${Math.round(target9)} USD.

Če pride do preboja:

možno nadaljevanje
vendar zelo nestabilno

Ključni signal:
Padec nazaj pod ${Math.round(target8)} USD lahko pomeni začetek močnejšega popravka. 

ZAKLJUČEK

Če spremljaš ta val, bodi izjemno pozoren na dogajanje na nižjih časovnih okvirih.

Zelo smiselno je analizirati tudi manjše valove znotraj tega gibanja.
Če želiš, lahko skupaj pogledava strukturo na nižjih intervalih in poskusiva ujeti vrh.
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
