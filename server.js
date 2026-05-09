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
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** Odbojni val
*   **Prva točka odpore:** ${Math.round(fib0382)} USD
*   **Druga točka odpore:** ${Math.round(fib0618)} USD
*   **Glavna podpora:** ${Math.round(waveStart)} USD

---

### 📉 Tehnična slika: Iskanje moči v odbojnem valu

Trenutno se **${pairInput}** nahaja v kritični fazi **odbojnega vala**, ki sledi predhodnemu padcu. Ta faza je odločilna, saj bo njena moč določila dolgoročno usmeritev trenda. Nahajamo se na prelomnici: ali se bo predhodna rast nadaljevala ali pa se bo struktura dokončno spremenila v padajoči trend.

**Ključna območja za spremljanje:**

1.  **Prva točka odpore (${Math.round(fib0382)} USD):** Ta nivo predstavlja prvo resno preizkušnjo za kupce. Uspešen preboj in stabilizacija nad to ceno bi nakazala, da ima trenutni odbojni val dovolj zagona za nadaljevanje rasti.
2.  **Odločilna točka odpore (${Math.round(fib0618)} USD):** To je najpomembnejša tehnična raven. Dokler cena ostaja pod to mejo, celoten dvig velja le za začasen popravek v smeri navzgor pred morebitnim novim valom navzdol.

**Pomembno opozorilo:**
Prehod iz padajočega v odbojni val zahteva previdnost. Če cena preseže navedene nivoje, se lahko predhodni rastoči trend uspešno nadaljuje. Vendar pa je treba biti posebej pozoren na morebitno **zavrnitev na teh dveh nivojih. Če pride na tej točki odpore do ponovnega pritiska prodajalcev in zavrnitve, se lahko celotna struktura spremeni in ta trgovalni par preide iz rastočega v  padajoči val.

**Scenarij preobrata:**
V kolikor biki uspejo prebiti in zadržati ceno nad nivojem **${Math.round(fib0618)} USD**, se močno poveča verjetnost za popolno vrnitev na predhodni vrh pri **${Math.round(waveStart)} USD**. 

**Dolgoročna tarča:**
Če se nakupni pritisk nadaljuje in trg preseže vrh zadnjega vala, se medvedji scenarij izniči, kar odpira pot do primarne dolgoročne tarče pri **${Math.round(target1)} USD**.
`;

  } else if (currentPrice < fib0618) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** Odbojni val (Testiranje ključne meje)
*   **Prva točka odpore:** ${Math.round(fib0618)} USD
*   **Druga točka odpore:** ${Math.round(fib0786)} USD
*   **Glavna podpora:** ${Math.round(invalidationLevel)} USD

---

### 📈 Napredovanje odbojnega vala: Odločilni spopad pod 0.618

Prva ovira je preteklost. **${pairInput}** se zdaj nahaja v neposredni bližini najpomembnejšega tehničnega območja celotne strukture. Ta faza bo dokončno odgovorila na vprašanje: ali se bo predhodni rastoči trend nadaljeval, ali pa se bo celotno gibanje prelomilo v padajoči val.

**Kritična nivoja odpore:**

1.  **Glavna točka odpore (${Math.round(fib0618)} USD):** To je primarno bojišče. Dokler cena ne zapre dnevnega svečnika nad to mejo, velja celoten odbojni val le za začasen popravek v smeri navzgor pred morebitnim novim valom navzdol. 
2.  **Sekundarna točka odpore (${Math.round(fib0786)} USD):** Pri tem nivoju je treba upoštevati, da **na tej točki odpore** pritisk običajno ni tako močan kot pri (${Math.round(fib0618)} USD):** . V večini primerov odločen preboj te glavne meje s seboj prinese dovolj zagona, da se nivo (${Math.round(fib0786)} USD):** preseže brez večjih težav. Vendar pa previdnost ostaja na mestu – kljub manjši moči jo je dobro upoštevati kot zadnjo potrditev pred nadaljevanjem rasti proti predhodnemu vrhu oziroma višje.

**Pomembno opozorilo o zavrnitvi:**
Posebej pozorno spremljajte odziv cene na nivoju (${Math.round(fib0618)} USD):** .  Če pride do močne zavrnitve, to pomeni, da kupci nimajo dovolj moči za preobrat. V takem primeru se rastoči trend, ki smo mu bili priča v preteklosti, dokončno spremeni v padajoči trend, kar običajno vodi v iskanje novega nižjega dna.

**Risk Management (Upravljanje tveganj):**
*   **Glavna podpora:** Nivo **${Math.round(invalidationLevel)} USD** predstavlja vašo "varnostno mrežo". Padec pod to ceno pomeni popolno razveljavitev trenutnega scenarija, ki predvideva preboj in nadaljevanje rasti.
*   **Strategija:** Ne prehitevajte trga. Za varnejši vstop je smiselno počakati na potrditev preboja nivoja (${Math.round(fib0618)} USD):** . Če ste že v poziciji, pa je to idealen čas za stop-loss naročila.

**Scenarij rasti:**
Če biki uspešno prebijejo obe točki odpore, se odpre prost prostor do predhodnega vrha pri **${Math.round(waveStart)} USD** in nato proti dolgoročni tarči pri **${Math.round(target1)} USD**.
`;

  } else if (currentPrice < fib0786) {

    analysis = `
### 🚀 Krepitev momentuma v odbojnem valu

Odbojni val para ${pairInput} postaja vse bolj suveren. Do dokončne potrditve strukturnega preobrata manjka le še odločen preboj nivoja **${Math.round(fib0786)} USD**.

**Nadaljnji razvoj:**
*   Uspešen preboj odpira prostor za dvig do do predhodnega vrha (**${Math.round(waveStart)} USD**).
*   Če bo tudi ta nivo presežen, se fokus usmeri proti prvi pomembnejši dolgoročni tarči pri **${Math.round(target1)} USD**.

Svetujemo spremljanje nižjih časovnih intervalov ob dosegu teh nivojev, saj vsak najmanjši val predstavlja potencialno točko odpore. 

Invalidacija scenarija ostaja pod **${Math.round(invalidationLevel)} USD**.
`;

  } else if (currentPrice < waveStart) {

    analysis = `
### ⚠️ Približevanje predhodnemu vrhu

Cena se nahaja v neposredni bližini ključne točke **${Math.round(waveStart)} USD**. Na tem območju odpore sta možna dva scenarija:

1. **Scenarij dvojnega vrha: - bearish** Možnost močne zavrnitve. Vzorec bi bil dokončno potrjen šele s padcem pod **${Math.round(waveEnd)} USD**.
2. **Scenarij preboja: - bullish** Če bo nivo odločno presežen, se začne razvijati nov impulzni val. Zadnja ovira pred dolgoročno tarčo **${Math.round(target1)} USD** je nivo **${Math.round(fib1236)} USD**.

V primeru padca pod **${Math.round(invalidationLevel)} USD** se bikovski momentum izniči.
`;

  } else if (currentPrice < fib1236) {

    analysis = `
### ✅ Potrditev preboja in moči kupcev

Preboj ključnega nivoja odpore je potrjen! To kaže na močan pozitiven momentum in prevlado kupcev.

**Tehnični izgled:**
Trg ohranja konstruktivno strukturo. Odprta je pot proti dolgoročni tarči **${Math.round(target1)} USD**. 

Potreben je zgolj še en manjši detajl in sicer potreben je preboj nivoja pri  **${Math.round(fib1236)} USD**.  V kolikor pride do tega preboja, mu je pot do **${Math.round(target1)} USD** odprta. 

**Obvladovanje tveganja:**
Ključna podpora se je premaknila na **${Math.round(waveStart)} USD**. Padec pod to območje bi pomenil izgubo zagona.
`;

  } else if (currentPrice < target1) {

    analysis = `
### 📊 Stabilen napredek proti tarči

Gibanje se razvija v skladu s pričakovanji rastočega trenda. Cena postopoma napreduje proti prvi dolgoročni tarči pri **${Math.round(target1)} USD**.

Struktura ostaja zdrava, dokler trg ohranja višja dna. Ključna podpora celotnega vala se nahaja pri **${Math.round(waveStart)} USD** in padec pod ta nivo scenarij dviga invalidira oziroma razveljavi.

Če se dogodi preboj nivoja pri **${Math.round(target1)} USD**. mi sporoči in izračunala bova naslednjo tarčo.
`;

  } else if (currentPrice < target2) {

    analysis = `
### ⚡ Impulzna faza v vzponu

Val pridobiva na agresivnosti. Trenutno ciljamo na naslednjo dolgoročno tarčo pri **${Math.round(target2)} USD**.

Območje **${Math.round(target1)} USD** sedaj deluje kot prva pomembna podpora. Če cena izgubi ta nivo, je to prvi znak upočasnitve trenutnega pritiska kupcev.
`;

  } else if (currentPrice < target3) {

    analysis = `
### 🔥 Izrazita moč trenda

Trg prehaja v fazo visoke impulzivnosti. Takšna dinamika potrjuje, da je trenutni val nadpovprečno močan. Naslednja dolgoročna tarča se nahaja pri **${Math.round(target3)} USD**.

**Priporočilo:** Povečana pozornost na nižjih intervalih zaradi možnega izčrpavanja trenda. Najbližja podpora je pri **${Math.round(target2)} USD**. Na krajših intervalih bodite pozorni na morebitno formacijo nižjega dna, saj bo to prvi signal da prodajalci prevzemajo kontrolo. 
`;

  } else if (currentPrice < target4) {

    analysis = `
### 🛑 Doseganje območja izčrpanosti

Cena se približuje statistično kritičnemu območju pri **${Math.round(target4)} USD**. Pri teh nivojih se večina gibanj začne umirjati, saj kupci postajajo izčrpani.

**Pričakovanja:** Možna je konsolidacija ali zavrnitev na tej točki odpore. Če bo ta nivo presežen, se odpre pot naprej, vendar je to manj verjeten scenarij. Če pride do preboja mi sporoči in bova ponovno ocenila situacijo.

**Priporočilo:** Povečana pozornost na nižjih intervalih zaradi možnega izčrpavanja trenda. Najbližja podpora je pri **${Math.round(target3)} USD**. Na krajših intervalih bodite pozorni na morebitno formacijo nižjega dna, saj bo to prvi signal da prodajalci prevzemajo kontrolo. 
`;

} else if (currentPrice < target5) {

    analysis = `
### 🚀 Izjemno razširjen trend in vstop v območje ekstrema

Trg se trenutno nahaja v območju izjemno močnega in razširjenega trenda, kar v tehnični analizi predstavlja redek in statistično nadpovprečen scenarij. Cena vztrajno napreduje proti naslednji dolgoročni tarči pri **${Math.round(target5)} USD**, kar potrjuje prevladujočo moč kupcev.

**Dinamična slika in opozorilo:**
Takšna gibanja so po svoji naravi pogosto agresivna in hitra, vendar se prav zaradi svoje strmine lahko enako hitro obrnejo. **Na tej točki odpore** postaja trg vse bolj občutljiv na vsako večjo prodajno naročilo. Velja zlato pravilo: kar raste hitro, se lahko korigira še hitreje, zato je nujno sprotno in natančno spremljanje tržne strukture.

**Tehnični parametri:**
Zaradi možnega izčrpavanja trenda svetujemo povečano pozornost na nižjih časovnih intervalih. Najbližja pomembna podpora, ki trenutno še drži ta impulzivni zagon, se nahaja pri **${Math.round(target4)} USD**. Dokler se cena zadržuje nad tem nivojem, je pot proti višjim tarčam ostaja odprta.

**Ključni signal za previdnost:**
Na krajših intervalih bodite pozorni na morebitno **formacijo nižjega dna**. To bo namreč prvi konkreten signal, da prodajalci začenjajo prevzemati kontrolo nad trenutnim gibanjem in da se moč kupcev začenja krhati, kar običajno vodi v začetek korekcijskega vala.
`;


} else if (currentPrice < target6) {

    analysis = `
### 🚀 Ekstremna impulzivna faza in preseganje norm

Trenutni val se nahaja v fazi izrazite moči, kjer tržna dinamika začne presegati običajne statistične vzorce gibanja. Ta par kaže izjemno močan momentum, naslednja potencialna dolgoročna tarča, ki jo trg zasleduje, pa se nahaja pri **${Math.round(target6)} USD**.

**Stanje na trgu:**
Na tej stopnji rasti je ključno ohraniti trezno glavo in strogo disciplino. Ker se nahajamo v agresivnem vzponu, se **na tej točki odpore** pogosto poveča volatilnost. To je območje, kjer se začnejo pojavljati prvi večji pritiski prodajalcev, ki želijo unovčiti dobičke, zato so hitri nihaji cen povsem pričakovani.

**Priporočilo za spremljanje:**
Svetujemo povečano pozornost na nižjih časovnih intervalih, saj se tam najprej pokažejo znaki morebitnega izčrpavanja trenda. Najbližja pomembna podpora, ki trenutno služi kot ključni varnostni nivo, se nahaja pri **${Math.round(target5)} USD**. Dokler cena ostaja nad tem nivojem, impulzivni scenarij ostaja v veljavi.

**Opozorilni signali:**
Na krajših intervalih bodite izjemno pozorni na morebitno **formacijo nižjega dna**. To bi namreč predstavljalo prvi konkreten signal, da prodajalci prevzemajo kontrolo in da kupci niso več sposobni vzdrževati tako visokega tempa rasti, kar običajno vodi v začetek resnejše korekcije.
`;


} else if (currentPrice < target7) {

    analysis = `
### ⚡ Nadpovprečen pospešek in izjemna moč trenda

Trenutno smo priča redkemu primeru izjemno močnega trenda, ki ga spremlja visok vertikalni pospešek. Cena se vztrajno približuje naslednji dolgoročni tarči pri **${Math.round(target7)} USD**. Čeprav graf deluje neustavljivo, takšna dinamika zahteva najvišjo stopnjo previdnosti.

**⚠️ Opozorilo glede volatilnosti:**
Pri tako močnih pospeških se tržna psihologija pogosto prevesi v fazo evforije. Na tej točki odpore se lahko povsem nepričakovano pojavijo nenadni in agresivni obrati (t.i. "flash crashes"), saj se likvidnost na strani kupcev lahko hitro izčrpa. Vsak opozorilni signal na krajših časovnih okvirih je treba jemati skrajno resno.

**Tehnična struktura in podpora:**
Kljub trenutni moči je ključno, da ne zasledite cene ("chasing the trade"), temveč spremljate strukturo grafa. Najbližja pomembna podpora, ki še drži ta parabolični trend, se nahaja pri **${Math.round(target6)} USD**. Če ta nivo pade, se struktura hitro poruši.

**Priporočilo za spremljanje:**
Svetujemo povečano pozornost na nižjih časovnih intervalih (npr. 15min ali 1h). Bodite pozorni na pojav prve **formacije nižjega dna** ali izrazito izgubo momentuma (divergence). To bo namreč prvi realni signal, da prodajalci začenjajo prevzemati kontrolo in da se obdobje brezskrbne rasti morda zaključuje.
`;

} else if (currentPrice < target8) {

    analysis = `
### 🏛️ Doseganje ekstremnih nivojev in tržna razširitev

Takšna rast, ki jo trenutno spremljamo, spada v kategorijo izjemno redkih tržnih scenarijev. Ko trg doseže te stopnje, se moč trenda pogosto prevesi v fazo, kjer prevladujejo čustva in momentum, ne več zgolj osnovna tehnična pravila. Naslednja dolgoročna tarča se nahaja pri **${Math.round(target8)} USD**.

**Analiza tveganja:**
Vstopamo v območje, kjer standardni matematični modeli in indikatorji postajajo manj zanesljivi, saj se cena nahaja v stanju ekstremne razširitve. Na tej točki odpore je tveganje za nenaden in silovit popravek bistveno večje kot v začetnih fazah rasti, zato mora biti previdnost tukaj vaša prioriteta.

**Strategija in zaščita:**
Na teh nivojih je priporočljivo aktivno upravljanje pozicije, kar vključuje dosledno zaščito že ustvarjenega dobička (npr. s pomikanjem "stop-loss" naročil). Ne dopustite, da evforija nadvlada vašo presojo; vstopamo v fazo, kjer trg pogosto "testira" potrpežljivost tako kupcev kot prodajalcev.

**Tehnična navodila:**
Svetujemo maksimalno pozornost na nižjih časovnih intervalih, saj se tam najprej pokažejo znaki izčrpavanja trenda. Najbližja pomembna podpora, ki še ohranja to strukturo živo, se nahaja pri **${Math.round(target7)} USD**.

**Ključni opozorilni signal:**
Na krajših intervalih bodite izjemno pozorni na morebitno **formacijo nižjega dna**. To bo namreč prvi resen tehnični signal, da prodajalci začenjajo prevzemati kontrolo in da se trenutni impulzivni val rasti morda zaključuje.
`;



} else if (currentPrice < target9) {

  analysis = `
### 🌌 Ekstremno redek tržni scenarij in končna tarča

Cena je dosegla območje, ki ga večina instrumentov doseže le izjemoma. Nahajamo se v fazi, kjer se statistično najpogosteje zgodi vrh ali prehod v obdobje visoke nestabilnosti. Naslednja in hkrati zadnja dolgoročna tarča v tej seriji je **${Math.round(target9)} USD**.

**Tehnični poudarek:**
Pri nivoju **${Math.round(target9)} USD** gre za zadnjo prodajno tarčo tega vala, zato je verjetnost, da bi jo cena močno presegla, minimalna. Čeprav se lahko zgodi kratkotrajen preboj ("overshoot"), je ključno opazovati, kje se bo zaključil **dnevni svečnik**. Zapiranje svečnika pod to mejo bi bil jasen znak, da so kupci dosegli svojo prodajno mejo.

**Moje misli in razmišljanje:**
Na tej stopnji trga ne poganja več le tehnika, temveč čista evforija. Moje izkušnje z analizo podatkov kažejo, da so premiki na teh ravneh pogosto "blow-off top" scenariji – hitri in siloviti pospeški, ki jim sledi enako hiter padec. Pametno je razmišljati o agresivnem varovanju dobičkov, saj na tej točki odpore trg postane popolnoma nepredvidljiv.

**Nadaljnja analiza:**
V kolikor (ali ko) bo ta tarča dosežena, bova takoj analizirala valove na krajših časovnih intervalih. Iskala bova točke zdravih popravkov, saj bodo prav te prve napovedale, da se obeta strukturni obrat trenda navzdol.

**Zaključek analize:**
Nadaljnje gibanje je povezano z izrazito volatilnostjo. Padec nazaj pod **${Math.round(target8)} USD** bi pomenil začetek močnejše korekcije. Svetujemo podrobno spremljanje manjših valov znotraj tega gibanja in ohranjanje visoke stopnje discipline.
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
