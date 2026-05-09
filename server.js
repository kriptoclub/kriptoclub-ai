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
//  FIB ANALIZA (LOGARITEMSKA SKALA)
// =========================

const waveStart = parseFloat(req.query.wave_start);
const waveEnd = parseFloat(req.query.wave_end);
const currentPrice = parseFloat(req.query.current_price);

if (isNaN(waveStart) || isNaN(waveEnd)) {
  return res.json({ error: "Manjkajo podatki (wave_start, wave_end)" });
}

// Pomožna funkcija za logaritemski izračun Fibonacci nivojev
// TradingView formula: exp(ln(end) - (ln(end) - ln(start)) * level)
const calcLogFib = (start, end, level) => {
  const logStart = Math.log(start);
  const logEnd = Math.log(end);
  return Math.exp(logEnd - (logEnd - logStart) * level);
};

// Definiramo nivoje in cilje
// Ker uporabljamo logaritemsko razmerje med start in end, 
// se smer (uptrend/downtrend) v formuli upošteva samodejno.
const fib0382 = calcLogFib(waveStart, waveEnd, 0.382);
const fib0618 = calcLogFib(waveStart, waveEnd, 0.618);
const fib0786 = calcLogFib(waveStart, waveEnd, 0.786);
const fib1236 = calcLogFib(waveStart, waveEnd, 1.236);

const target1 = calcLogFib(waveStart, waveEnd, 1.618);
const target2 = calcLogFib(waveStart, waveEnd, 2.618);
const target3 = calcLogFib(waveStart, waveEnd, 3.618);
const target4 = calcLogFib(waveStart, waveEnd, 4.236);
const target5 = calcLogFib(waveStart, waveEnd, 6.854);
const target6 = calcLogFib(waveStart, waveEnd, 11.09);
const target7 = calcLogFib(waveStart, waveEnd, 17.944);
const target8 = calcLogFib(waveStart, waveEnd, 29.029);
const target9 = calcLogFib(waveStart, waveEnd, 46.121);

// Pomožne spremenljivke za smer (če jih potrebuješ v nadaljevanju kode)
const isUptrend = waveStart < waveEnd;
const isDowntrend = waveStart > waveEnd;

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
Cena je padla pod zelo pomemben nivo pri (${Math.round(fib0618)} USD) in potrebna je pazljivost, saj se lahko padanje nadaljuje.

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

} else if (currentPrice > target1) {

  analysis = `
Prejšnje dno je bilo prebito, kar potrjuje prehod trga v padajočo fazo.

S tem se struktura trenda spremeni, pritisk prodajalcev pa ostaja izrazit. Trenutno gibanje nakazuje na nadaljevanje padca proti območju ${Math.round(target1)} USD.

V primeru nadaljnjega stopnjevanja pritiska se odpre prostor tudi za dosego naslednje tarče pri ${Math.round(target2)} USD.

Za ohranitev scenarija padanja je pomembno, da cena ostane pod ${Math.round(waveStart)} USD. Vrnitev nad ta nivo bi lahko nakazala oslabitev trenutnega trenda in možnost prehoda v konsolidacijo ali obrat.
`;
  
} else if (currentPrice > target2) {

  analysis = `
Padanje se nadaljuje z naraščajočo dinamiko, kar potrjuje, da trg ostaja pod močnim vplivom prodajalcev.

Cena se približuje naslednji pomembni tarči pri ${Math.round(target2)} USD. To območje lahko kratkoročno deluje kot točka umiritve ali začasnega odboja, vendar struktura trenutno še vedno podpira nadaljevanje padanja.

V primeru preboja tega nivoja se odpre prostor za nadaljevanje proti ${Math.round(target3)} USD.

Ključno je spremljati odziv cene na posameznih nivojih ter strukturo na nižjih časovnih intervalih, kjer se pogosto najprej pokažejo znaki morebitnega obrata.
`;

} else if (currentPrice > target3) {

  analysis = `
Trg vstopa v fazo izrazitejšega padanja, kjer se dinamika gibanja še dodatno povečuje.

Doseganje območja okoli ${Math.round(target3)} USD kaže na močan impulzni val, v katerem so odboji običajno kratkotrajni in omejeni.

Če se pritisk prodajalcev nadaljuje, obstaja verjetnost nadaljnjega padca proti ${Math.round(target4)} USD.

Na tej točki je priporočljivo še posebej pozorno spremljati nižje časovne intervale, saj se lahko prvi znaki upočasnitve ali obrata pojavijo prav tam – pogosto v obliki prvega višjega dna ali izgube momentuma.
`;

  } else if (currentPrice > target4) {

  analysis = `
Cena se nahaja v območju, ki v večini primerov predstavlja končno fazo trenutnega padajočega vala.

Nivo pri ${Math.round(target4)} USD pogosto deluje kot območje izčrpanosti trenda, kjer se prodajni pritisk postopoma zmanjšuje in trg začne iskati ravnotežje.

V večini primerov se na tem območju oblikuje dno vala ali vsaj pomembnejši kratkoročni obrat.

Če pa pride do nadaljnjega padca tudi pod ta nivo, gre za redek in izrazito impulziven scenarij. V tem primeru priporočam, da poskusiš identificirati nov, manjši val na nižjih časovnih intervalih.

Vsak večji val je namreč sestavljen iz podvalov, zato lahko z analizo teh manjših struktur natančneje določiva naslednje potencialne tarče in območje končnega dna.
`;
  
}

} else if (isDowntrend) {


  if (currentPrice < fib0382) {

    analysis = `
### 📉 Tehnična slika: Iskanje moči v korektivnem odboju

Trenutno se BTC nahaja v fazi **korektivnega odboja**, ki je ključen za določitev kratkoročne usode trenda. Trg se trenutno sooča z dvema kritičnima območjema, kjer se bo odločalo o nadaljnji smeri:

1.  **Prva meja upora (${Math.round(fib0382)} USD):** Ta nivo predstavlja prvo resno oviro za kupce. Uspešen preboj in stabilizacija nad to ceno bi nakazala, da ima trenutni odboj dovolj zagona za resnejši preizkus višjih ravni.
2.  **Odločilna točka preobrata (${Math.round(fib0618)} USD):** To je najpomembnejša tehnična raven znotraj trenutnega padca. Dokler cena ostaja pod to mejo, tržna struktura ostaja pod kontrolo prodajalcev, vsak dvig pa velja le za začasen popravek.

**Scenarij preobrata:**
V kolikor biki uspejo prebiti in zadržati ceno nad nivojem **${Math.round(fib0618)} USD**, se močno poveča verjetnost za popolno vrnitev na predhodni vrh pri **${Math.round(waveStart)} USD**. 

**Dolgoročni cilj:**
Če se kupni pritisk nadaljuje in trg preseže vrh zadnjega vala, se medvedji scenarij izniči. V tem primeru se odpre pot za razvoj novega naraščajočega trenda s primarno tarčo pri **${Math.round(target1)} USD**.
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
Preboj ključnega nivoja je potrjen, kar kaže na prisotnost moči kupcev in nadaljevanje pozitivnega momentuma.

Trg trenutno ohranja konstruktivno strukturo, pri čemer se odpira prostor za nadaljnjo rast proti ${Math.round(target1)} USD. Kljub temu ostaja nivo ${Math.round(fib1236)} USD pomembna referenčna točka – uspešno zadrževanje nad njim dodatno potrjuje veljavnost scenarija.

Kar se tiče tveganja:
Ključni invalidacijski nivo ostaja pri ${Math.round(waveStart)} USD. Padec pod to območje bi lahko pomenil izgubo momentuma in povečal verjetnost globlje korekcije.

Na nižjih časovnih intervalih spremljaj strukturo gibanja – pojav prvega nižjega dna je pogosto eden prvih opozorilnih signalov, da se trend začenja umirjati.
`;

} else if (currentPrice < target1) {

  analysis = `
Gibanje se razvija stabilno in v skladu s pričakovanji rastočega trenda.

Cena postopoma napreduje proti območju ${Math.round(target1)} USD, kar trenutno predstavlja naslednji pomemben cilj. Struktura ostaja zdrava, dokler trg ohranja višja dna in konstanten pritisk kupcev.

V primeru preboja tega nivoja se odpre prostor za nadaljevanje rasti proti višjim tarčam.

Scenarij ostaja veljaven, dokler cena ostaja nad ${Math.round(waveStart)} USD, kjer se nahaja ključna podpora celotnega vala.
`;

} else if (currentPrice < target2) {

  analysis = `
Val postopoma pridobiva na moči, kar se odraža v vse bolj impulzivni strukturi gibanja.

Trenutno obstaja realna možnost nadaljevanja rasti proti ${Math.round(target2)} USD. Ob tem je smiselno spremljati območje ${Math.round(target1)} USD, ki lahko ob morebitnem padcu deluje kot prva pomembna podpora.

Če cena izgubi ta nivo, se lahko pojavijo prvi znaki slabitve trenutnega momentuma.

Invalidacija širšega scenarija še vedno ostaja pri ${Math.round(waveStart)} USD.
`;

} else if (currentPrice < target3) {

  analysis = `
Trg prehaja v fazo izrazite impulzivnosti, kar pomeni, da je trenutni val nadpovprečno močan.

Takšna dinamika v enem samem valu ni pogosta, vendar jo trenutna struktura jasno potrjuje. Naslednja ključna tarča se nahaja pri ${Math.round(target3)} USD.

Na tej točki je priporočljivo povečati pozornost, predvsem na nižjih časovnih intervalih, kjer se lahko najprej pojavijo znaki izčrpavanja trenda.

Posebej bodi pozoren na:
– izgubo momentuma
– pojav prvega nižjega dna

Območje ${Math.round(target2)} USD trenutno predstavlja najbližjo pomembno podporo.
`;

} else if (currentPrice < target4) {

  analysis = `
Cena se približuje izjemno pomembnemu in občutljivemu območju pri ${Math.round(target4)} USD.

Statistično gledano se večina gibanj na tej ravni začne umirjati, saj gre za razširjen impulzni val, kjer pogosto pride do izčrpanosti kupcev.

Možen je scenarij zavrnitve ali vsaj začasne konsolidacije.

Če pa pride do preboja tudi tega nivoja, se odpre prostor za nadaljevanje rasti proti bistveno višjim tarčam – vendar tak scenarij velja za manj verjeten in zahteva dodatno potrditev.

Ključna podpora:
${Math.round(target3)} USD

V primeru izgube tega nivoja:
možen povratek proti ${Math.round(target2)} USD.
`;
    
} else if (currentPrice < target5) {

  analysis = `
Trg se nahaja v območju izjemno močnega in razširjenega trenda, kar predstavlja redek scenarij.

Cena se približuje naslednji tarči pri ${Math.round(target5)} USD, vendar je na tej točki potrebna povečana previdnost.

Takšna gibanja so pogosto hitra in agresivna, vendar se lahko prav tako hitro obrnejo.

Pomembno pravilo:
kar raste hitro, se lahko enako hitro tudi korigira.

Zato je ključno sprotno spremljanje strukture in odziva cene na nižjih intervalih.
`;
    
} else if (currentPrice < target6) {

  analysis = `
Val prehaja v ekstremno impulzivno fazo, kjer trg presega običajne vzorce gibanja.

Naslednja potencialna tarča se nahaja pri ${Math.round(target6)} USD.

Na tej stopnji je pomembno ohraniti disciplino in ne podleči evforiji, saj so takšna gibanja pogosto nestabilna.

Spremljaj:
– nižje časovne intervale
– prve znake izgube momentuma
– pojav nižjega dna

Ti signali lahko nakazujejo začetek korekcije.
`;
    
} else if (currentPrice < target7) {

  analysis = `
Gre za redek primer izjemno močnega trenda, kjer trg kaže nadpovprečno stopnjo pospeška.

Naslednja tarča se nahaja pri ${Math.round(target7)} USD.

Kljub moči gibanja ostaja ključno spremljati strukturo grafa, saj se prav v takšnih fazah pogosto pojavijo nenadni obrati.

Prvi resen opozorilni signal:
pojav nižjega dna na nižjih časovnih intervalih.
`;
    
} else if (currentPrice < target8) {

  analysis = `
Takšna rast spada med izjemno redke tržne scenarije, kjer cena dosega ekstremne razširitve.

Naslednja tarča se nahaja pri ${Math.round(target8)} USD.

Na tej točki je priporočljivo razmišljati tudi o upravljanju pozicije in zaščiti dobička.

Če pride do preboja tega nivoja, se oglasi za nadaljnjo analizo, saj vstopamo v območje, kjer standardni modeli postajajo manj zanesljivi.
`;
    
} else if (currentPrice < target9) {

  analysis = `
Če je cena dosegla to območje, se nahajamo v ekstremno redkem scenariju tržnega gibanja.

Večina instrumentov na tej stopnji doseže svoj vrh ali preide v fazo močne nestabilnosti.

Naslednja tarča se nahaja pri ${Math.round(target9)} USD, vendar je nadaljnje gibanje težje predvidljivo.

V primeru dodatnega preboja:
možno je nadaljevanje rasti,
vendar običajno z izrazito povečano volatilnostjo.

Ključni opozorilni signal:
padec nazaj pod ${Math.round(target8)} USD lahko pomeni začetek močnejše korekcije.

Zaključek:
Na tej točki je smiselno podrobno spremljati nižje časovne intervale in analizirati tudi manjše valove znotraj trenutnega gibanja.

Če želiš, lahko skupaj pogledava strukturo in poskusiva natančneje določiti potencialni vrh.
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
