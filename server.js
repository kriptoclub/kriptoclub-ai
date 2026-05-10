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
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 📉 Zdrava korekcija (Iskanje vstopne točke)
*   **Prva vstopna točka:** ${Math.round(fib0382)} USD
*   **Druga vstopna točka:** ${Math.round(fib0618)} USD
*   **Potrditev konca popravka:** Preboj nad ${Math.round(waveEnd)} USD

---

### 🔍 Faza popravka: Kje se skriva naslednja priložnost?

Trenutno se nahajamo v obdobju, ko se po močni rasti dogaja pričakovana in zdrava korekcija. To ni čas za negotovost, temveč za pripravo na optimalen vstop za nadaljevanje rastočega trenda. V tej fazi sta ključna dva nivoja, ki služita kot magnet za ceno in potencialno odskočišče.

**Ključni scenariji za odboj in nadaljevanje:**

1.  **Prvi nivo podpore pri ${Math.round(fib0382)} USD:** To je prva točka, kjer se pogosto ustavijo najmočnejši trendi. Že to, da instrument pokaže reakcijo na tem nivoju, je izjemno pozitiven znak, saj potrjuje, da trg spoštuje to ključno tehnično mejo. Odboj od te točke nakazuje na ohranitev močnega pritiska kupcev.
2.  **Druga vstopna točka pri ${Math.round(fib0618)} USD:** Če cena ne zadrži prvega nivoja, se fokus takoj preusmeri sem. To območje velja za tehnično najmočnejšo točko za vstop. Odboj od tod velja za izjemno konstruktivnega in je pogosto temelj za nove vrhove.
3.  **Potrditev konca popravka:** Če se cena odbije od enega izmed zgornjih nivojev in nato uspešno prebije predhodni vrh pri **${Math.round(waveEnd)} USD**, je s popravkom uradno konec. V tem primeru vstopamo v naslednji impulzni val rasti.

**Strategija opazovanja:**
Namesto nastavljanja naročil na slepo, je **na tej točki odpore** (oziroma podpore) priporočljivo opazovati odziv trga:

*   **Spremljanje nivojev:** Nastavite si opozorila za ceni ${Math.round(fib0382)} USD in ${Math.round(fib0618)} USD. Če prvi nivo pri ${Math.round(fib0382)} USD pade, je zelo verjetno, da bo cena potegnila vse do ${Math.round(fib0618)} USD.
*   **Iskanje potrditve:** Ko cena doseže nivo, opazujte graf. Formacija **zelenega 4-urnega svečnika** takoj po dotiku nivoja je prvi resen indikator, da so kupci ponovno prevzeli nadzor. To je precej varnejši signal za vstop kot zgolj čakanje na dotik cene.

**Obvladovanje tveganja:**
Dokler se cena zadržuje nad ${Math.round(fib0382)} USD, struktura trenda ostaja zelo agresivna. Nivo pri **${Math.round(fib0618)} USD** pa predstavlja zadnjo mejo, ki še ohranja bikovski scenarij veljaven. Vsak padec pod to mejo bi zahteval ponovno oceno celotne strukture gibanja.

**Zaključek:** 
Ohranite fokus na ključnih cenah. Trg nam ponuja priložnost za vstop po ugodnejših vrednostih. Ključno vprašanje ostaja, kateri nivo bo služil kot dokončni odriv za preboj nad predhodni vrh pri **${Math.round(waveEnd)} USD**.
`;

} else if (currentPrice > fib0618) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 📉 Odločilni popravek (Območje zlatega reza)
*   **Ključni nivo za odboj:** ${Math.round(fib0618)} USD
*   **Potrditev nadaljevanja trenda:** Preboj nad ${Math.round(waveEnd)} USD
*   **Kritična meja stabilnosti:** ${Math.round(fib0618)} USD (zaključek svečnika)

---

### ⚖️ Iskanje ravnovesja: Bitka za nivo ${Math.round(fib0618)} USD

Instrument **${pairInput}** se trenutno nahaja v fazi poglobljenega popravka. Potem ko je cena prebila prvo območje podpore, se zdaj ves fokus preusmerja proti ceni **${Math.round(fib0618)} USD**. To območje v teoriji trgovanja velja za "zlati rez" – prostor, kjer se naravni zakoni matematike srečajo s psihologijo množic.

**Zakaj je ta nivo tako pomemben?**
Definicija zdravega rastočega trenda pravi, da mora biti popravek omejen. Nivo pri **${Math.round(fib0618)} USD** predstavlja zadnjo mejo t.i. "konstruktivnega popravka". 
*   **Absolutni odboj:** Od tega nivoja potrebujemo silovit in jasen odboj. Če se cena tukaj ustavi in odrazi navzgor, obstajajo statistično izjemno visoke možnosti, da se bo predhodni rastoči trend ne le nadaljeval, temveč dosegel povsem nove vrhove.
*   **Psihologija kupcev:** Tu se ločijo priložnostni trgovci od tistih, ki trend razumejo strateško. Večina algoritmov in institucionalnih kupcev ima na tej ceni nastavljene alarme, saj velja pravilo: če trend preživi test pri **${Math.round(fib0618)} USD**, je njegova struktura neuničljiva.

**Taktična navodila za ukrepanje:**
**Na tej točki odpore** (ki zdaj deluje kot ključna podpora) ne smemo hiteti. Namesto tega iščemo potrditev:
1.  **Spremljajte 4-urni interval:** Če se cena dotakne **${Math.round(fib0618)} USD** in se na tej ravni izoblikuje močan zeleni 4-urni svečnik z dolgo spodnjo senco (wick), je to jasen signal, da so kupci stopili v bran in agresivno kupujejo "popust".
2.  **Alarm na ${Math.round(fib0618)} USD:** To je nivo, kjer se ne trguje na podlagi ugibanja, temveč na podlagi reakcije. Čisti odboj od te točke bi bil prvi korak k ponovnemu napadu na nivo **${Math.round(waveEnd)} USD**.

**Opozorilo (Invalidacija):**
Moramo biti realni – če cena ne pokaže nobene reakcije in se dnevni svečnik zaključi pod **${Math.round(fib0618)} USD**, se narava gibanja spremeni. V tem primeru ne govorimo več o zdravem popravku, temveč o resnem slabljenju trenda, kar bi lahko vodilo v dolgotrajnejše obdobje padanja ali celo v strukturni preobrat.

**Zaključek:** 
Nahajamo se na najpomembnejši postaji celotnega gibanja. Uspešen in odločen odboj od **${Math.round(fib0618)} USD** bi bil dokončni dokaz, da biki še niso rekli zadnje besede in da je pot proti novim vrhovom še vedno na mizi.
`;

} else if (currentPrice > fib0786) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** ⚠️ Kritična faza (Zadnja linija obrambe)
*   **Ključni nivo za preobrat:** ${Math.round(fib0786)} USD
*   **Možnost formacije dvojnega dna:** ${Math.round(waveStart)} USD
*   **Potencialna spodnja tarča:** ${Math.round(target1)} USD (v primeru padca pod prejšnje dno)

---

### 🛡️ Zadnja linija obrambe: Bitka za nivo ${Math.round(fib0786)} USD

Razmere na trgu za instrument **${pairInput}** so se opazno zaostrile. Dejstvo, da cena ni zdržala nad ključnim območjem pri **${Math.round(fib0618)} USD**, je močan tehnični signal, da popravek prehaja v globljo slabitev momentuma. Ta nivo pri **${Math.round(fib0786)} USD** predstavlja zadnjo točko, kjer biki še lahko upajo na strukturni preobrat in ohranitev rastočega scenarija.

**Pomen izgube prejšnje podpore:**
V tehnični analizi velja pravilo, da dokler se cena drži nad nivojem 0.618, kupci ohranjajo relativno kontrolo nad trendom. Padec pod to mejo pa psihološko zamaje prepričanje o hitrem nadaljevanju rasti. Trenutno trg krčevito išče dno, da bi preprečil popoln zlom strukture, ki je bila zgrajena v prejšnjem valu.

**Strategija na nivoju ${Math.round(fib0786)} USD:**
Nivo pri **${Math.round(fib0786)} USD** velja za zadnjo resno priložnost za stabilizacijo cene. 
*   **Reakcija kupcev:** **Na tej točki odpore** (ki trenutno deluje kot ključna podpora) je nujna takojšnja aktivacija kupcev. Če cena tukaj ne najde opore, se verjetnost za ohranitev rastočega trenda v prvotni obliki znatno zmanjša.
*   **Možnost dvojnega dna:** V kolikor cena zdrsne še nekoliko nižje, proti izhodišču vala pri **${Math.round(waveStart)} USD**, postane glavni fokus formacija "dvojnega dna". To bi bila zadnja priložnost za vzpostavitev ravnovesja, preden instrument morebiti preide v dolgotrajnejši medvedji trend.

**Kaj pričakovati v primeru neuspeha?**
Če nivo pri **${Math.round(fib0786)} USD** dokončno popusti in se dnevni svečnik zapre pod to mejo, se odpre prostor proti spodnjim nivojem. V primeru padca pod prejšnje dno postane povsem realna naslednja potencialna spodnja tarča pri **${Math.round(target1)} USD**.

**Navodilo za spremljanje:**
*   **Spremljajte 4-urni graf:** Bodite pozorni na močne zavrnitve (dolge spodnje sence svečnikov) prav pri ceni **${Math.round(fib0786)} USD**.
*   **Potrditev odboja:** Prvi znak stabilizacije bi bil močan zeleni svečnik, ki bi nakazal na absorpcijo prodajnega pritiska na tej ključni ravni.

**Zaključek:** 
Nahajamo se na prelomnici. Nivo pri **${Math.round(fib0786)} USD** je odločilna tehnična bariera, ki loči trenutni popravek od globljega strukturnega zloma. Vsak premik pri instrumentu **${pairInput}** na tem nivoju je zdaj ključnega pomena za prihodnjo smer gibanja.
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

### 📈 Napredovanje odbojnega vala: Odločilni spopad pod ${Math.round(fib0618)} USD

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
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** Odbojni val (Zadnja odpora pred spremembo v rastoči trend)
*   **Točka odpore:** ${Math.round(fib0786)} USD
*   **Naslednji cilj (Vrh):** ${Math.round(waveStart)} USD
*   **Glavna podpora:** ${Math.round(invalidationLevel)} USD

---

### 🚀 Odločilni preboj pri ${Math.round(fib0786)} USD: Je popravek končan?

Instrument **${pairInput}** kaže izjemno suverenost. Potem ko smo uspešno prebili predhodno oviro pri ${Math.round(fib0618)} USD, se zdaj soočamo z zadnjo tehnično oviro pred samim vrhom predhodnega vala. Nahajamo se v fazi, kjer se odloča o dokončni spremembi razpoloženja na trgu.

**Zadnja obramba medvedov:**
Nivo pri **${Math.round(fib0786)} USD** v teoriji ni tako masiven kot tisti, ki smo ga presegli pri ${Math.round(fib0618)} USD, vendar ga ne smemo podcenjevati. Predstavlja namreč **zadnjo obrambo prodajalcev** oziroma medvedov. To je točka, kjer tisti, ki še vedno verjamejo v padec, poskušajo ustaviti rast in preprečiti popoln preobrat.

**Konec popravka in sprememba trenda:**
Preboj nivoja **${Math.round(fib0786)} USD** bo ponudil zelo zanimivo dogajanje, saj pomeni **popolno spremembo trenutne slike**. Če smo do zdaj govorili o tem, da smo le v odbojnem valu (popravku) po padcu, preboj te cene uradno naznani, da je popravek končan. Na tej točki odpore se status odboja začne prelivati v nov, močan rastoči val. 

**Kaj pričakovati po preboju?**
*   **Psihološki premik:** Ko prodajalci izgubijo to linijo, običajno pride do hitrejšega pospeška proti predhodnemu vrhu (**${Math.round(waveStart)} USD**), saj se vsi preostali pesimistični scenariji začnejo rušiti.
*   **Dolgoročna tarča:** Uspešen zaključek nad tem nivojem na dnevni ravni na široko odpre pot proti primarnemu cilju pri **${Math.round(target1)} USD**.

**Risk Management (Upravljanje tveganj):**
Kljub optimizmu je potrebna previdnost, dokler nivo ni odločno presežen. Vedno obstaja možnost zadnjega poskusa zavrnitve, ki bi rastoči val spremenil nazaj v padajočega.
*   Spremljajte manjše valove na krajših intervalih – vsak znak šibkosti pod tem nivojem bi lahko nakazal na formiranje dvojnega vrha.
*   **Invalidacija:** Scenarij nadaljevanja rasti ostaja veljaven le, dokler se cena drži nad ključno podporo pri **${Math.round(invalidationLevel)} USD**.

**Zaključek:** 
Smo na pragu potrditve novega rastočega trenda. Preboj **${Math.round(fib0786)} USD** bi bil končni dokaz, da so kupci v celoti prevzeli nadzor nad instrumentom **${pairInput}**.
`;

  } else if (currentPrice < waveStart) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** ⚠️ Rastoči val (Faza odločilne potrditve)
*   **Točka odpore (Vrh):** ${Math.round(waveStart)} USD
*   **Zadnja bariera pred prebojem:** ${Math.round(fib1236)} USD
*   **Kritična podpora:** ${Math.round(invalidationLevel)} USD

---

### ⚔️ Bitka za Preobrat: Na pragu velikega preboja

Instrument **${pairInput}** se nahaja v izjemno vznemirljivi fazi. Uradno smo prešli v **rastoči val**, vendar smo se znašli na odločilni prelomnici. Smo v neposredni bližini predhodnega vrha pri **${Math.round(waveStart)} USD**. To je trenutek resnice, ki bo pokazal, ali imajo kupci dovolj sape za nov dolgoročni vzpon, ali pa gre le za zadnji izdihljaj trenutnega zagona.

**⚠️ Scenarij 1: Nevarnost Dvojnega Vrha (Bearish)**
Čeprav graf trenutno deluje optimistično, se ne smemo prepustiti nepazljivosti. **Na tej točki odpore (${Math.round(waveStart)} USD)** se namreč skriva ena najbolj zahrbtnih pasti – **formacija dvojnega vrha**. To je območje, kjer prodajalci običajno zberejo vse preostale moči za obrambo svojega teritorija.

*   **Pozor:** Scenarij dvojnega vrha bi rastoči val hitro spremenil nazaj v padajočega. Ta negativni vzorec bi bil dokončno potrjen šele, če bi cena od tukaj padla pod **${Math.round(waveEnd)} USD**. Dokler se to ne zgodi, so biki še vedno v igri, vendar je previdnost nujna.

**🚀 Scenarij 2: Odločen preboj navzgor (Bullish)**
Če biki ohranijo agresijo in nivo pri **${Math.round(waveStart)} USD** odločno pade, se pred nami odpre povsem nova pokrajina. V tem primeru nas čaka le še zadnja tehnična ovira pri **${Math.round(fib1236)} USD**. Če prebijemo tudi to ceno, bo pot do dolgoročne tarče (**${Math.round(target1)} USD**) praktično brez večjih ovir, saj bodo prodajalci prisiljeni v kapitulacijo.

**Risk Management (Upravljanje tveganj):**
Pri trgovanju na vrhovih velja pravilo: ni končano, dokler ni končano!
*   **Invalidacija:** Če cena na tej točki odpore popusti in zdrsne pod **${Math.round(invalidationLevel)} USD**, se bikovski momentum izniči, tveganje za globlji padec pa se močno poveča.
*   **Potrditev:** Za pravo varnost potrebujemo zaprtje dnevnega svečnika nad vrhom. Vse ostalo so lahko le kratkotrajni preboji, ki služijo kot pasti za neprevidne kupce.

**Zaključek:** 
Finale je pred nami. Ali bo **${pairInput}** zbral dovolj moči, da prebije ledeno zaveso prodajalcev, ali pa bomo priča umiku? Bodite pozorni na vsako podrobnost – prava drama se šele začenja!
`;

} else if (currentPrice < fib1236) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 📈 Rastoči val (Učvrstitev impulznega trenda)
*   **Zadnja tehnična bariera:** ${Math.round(fib1236)} USD
*   **Primarna dolgoročna tarča:** ${Math.round(target1)} USD
*   **Nova ključna podpora:** ${Math.round(waveStart)} USD

---

### ✅ Premik nad predhodni vrh: Preboj ali zgolj testiranje likvidnosti?

Pri instrumentu **${pairInput}** smo zabeležili premik nad predhodni vrh pri **${Math.round(waveStart)} USD**. Čeprav se tehnična slika na prvi pogled zdi izrazito bikovska, je na tej stopnji nujna trezna presoja. Dejstvo, da je cena presegla vrh, še ne pomeni, da je nevarnost končana – nasprotno, prav tukaj se pogosto odloča o usodi "velike slike".

**⚠️ Previdnost pri vzorcu dvojnega vrha:**
Pomembno je razumeti, da se na večjih časovnih intervalih še vedno lahko izriše vzorec **dvojnega vrha**. V tehnični analizi sence svečnikov (wicki) ne štejejo veliko, če jim ne sledi konkretna potrditev. Če cena zgolj "pokuka" čez vrh in se nato hitro vrne pod njega, to ne velja za preboj, temveč za t.i. "fakeout" ali lažni signal.

Šele v primeru **konkretnega in čistega preboja** telesa svečnika nad ta nivo bomo lahko z gotovostjo govorili o nadaljevanju dolgoročnega rastočega trenda. Dokler se cena ne stabilizira nad to mejo, možnost zavrnitve na veliki sliki ostaja odprta.

**Vloga zadnje ovire pri ${Math.round(fib1236)} USD:**
Nivo pri **${Math.round(fib1236)} USD** v tem trenutku služi kot končni filter. **Na tej točki odpore** bomo dobili odgovor, ali je bil premik nad prejšnji vrh le začasen ali pa ima instrument dejansko dovolj moči za dosego končnega cilja. Preboj te točke bi dokončno izničil scenarij dvojnega vrha in potrdil prehod v območje proti glavnemu tarčnemu območju.

**Tehnični izgled in Risk Management:**
Trg je trenutno v fazi dokazovanja. Čeprav struktura kaže na moč kupcev, je treba spremljati, kako se bo cena odzvala na povečan prodajni pritisk, ki je običajen pri testiranju vrhov. 
*   **Nova meja podpore:** Območje **${Math.round(waveStart)} USD** zdaj deluje kot naša primarna podpora. Dokler se cena uspešno zadržuje nad njo, bikovski scenarij ohranja prednost. 
*   **Opozorilni signali:** Če bi se cena hitro vrnila pod podporo, bi to nakazovalo na izgubo momentuma in potrditev prodajnega pritiska na veliki sliki.

**Zaključek:** 
Preboj vrha je pomemben korak, vendar drama še ni končana. Ključno bo spremljati zaključek svečnikov in odziv na nivoju **${Math.round(fib1236)} USD**, ki bo podal končno sodbo o tem, ali se trend nadaljuje ali pa nas čaka strukturni obrat.
`;

} else if (currentPrice < target1) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 📊 Približevanje primarni dolgoročni tarči 
*   **Dolgoročna tarča:** ${Math.round(target1)} USD
*   **Taktični fokus:** Spremljanje krajših časovnih intervalov

---

### 📊 Odločilna faza: Približevanje ključni prodajni tarči pri ${Math.round(target1)} USD

Gibanje instrumenta **${pairInput}** se razvija v skladu s pričakovanji, vendar vstopamo v območje najvišje stopnje previdnosti. Nivo pri **${Math.round(target1)} USD** predstavlja najpomembnejšo tehnično točko celotne strukture, kjer se običajno določi usoda trenutnega trenda.

**Statistika unovčevanja dobičkov:**
Pomembno je razumeti, da nivo pri **${Math.round(target1)} USD** v svetu profesionalnega trgovanja velja za primarno območje za unovčevanje dobičkov (profit-taking). Statistični podatki kažejo, da pri več kot 80 % primerov **na tej točki odpore** pride do močne zavrnitve. Večina institucionalnih trgovcev ima na tej ravni nastavljena prodajna naročila, kar ustvari močan pritisk na ceno.

**Strategija in obvladovanje tveganja na krajših intervalih:**
Ker je prejšnji vrh pri ${Math.round(waveStart)} USD za učinkovito invalidacijo zdaj preveč oddaljen, je ključno, da svojo pozornost preusmerite na krajše časovne intervale (npr. 1h ali 4h).

*   **Identifikacija šibkosti:** Na teh krajših intervalih bodite pozorni na strukturo gibanja. Prvi jasen znak, da se trend obrača navzdol, bo formacija **prvega nižjega dna**. To bo prvi realni signal, da kupci izgubljajo moč in da prodajalci začenjajo prevzemati nadzor nad ceno.
*   **Spremljanje volumna:** Bodite izjemno pozorni na dogajanje v neposredni bližini **${Math.round(target1)} USD**. Vsaka nenadna sprememba volumna ali neuspešen poskus preboja bo služil kot zgodnji signal za naslednjo večjo potezo.

**Scenarij ekstremnega pospeška:**
Kljub temu da 80 % trgovcev na tej točki unovčuje dobičke, obstaja manjša verjetnost za silovit preboj. V kolikor trg nivo pri **${Math.round(target1)} USD** preseže z izrazito agresijo, se lahko gibanje cene izjemno pospeši. V takšnem primeru dobimo t.i. parabolični pospešek, kjer prodajalci dokončno kapitulirajo.

**Zaključek:**
Nahajamo se na nivoju, ki zahteva maksimalno zbranost. Če se dogodi preboj nivoja pri **${Math.round(target1)} USD**, mi sporoči in izračunala bova naslednjo tarčo, saj v tem primeru vstopamo v fazo ekstremnega tržnega zagona.
`;

} else if (currentPrice < target2) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** ⚡ Ekstremna impulzna faza (FOMO faza)
*   **Naslednja dolgoročna tarča:** ${Math.round(target2)} USD
*   **Glavna podpora (Prejšnja tarča):** ${Math.round(target1)} USD
*   **Taktični fokus:** Spremljanje strukturnih obratov na 1h in 4h intervalih

---

### ⚡ Impulzna faza v polnem vzponu: Vstop v območje evforije

Instrument **${pairInput}** se je prebil v območje, ki ga v svetu trgovanja vidimo le redko. Statistični podatki so jasni: ko je enkrat presežen predhodni vrh in dosežena prva resna tarča pri **${Math.round(target1)} USD**, je manj kot 20 % valutnih parov sposobnih ohraniti takšen zagon in nadaljevati pot navzgor. Ker se nahajamo v tej elitni kategoriji, smo priča izjemno konkretnemu nakupnemu pospešku.

**Psihologija trgovanja in pojav FOMO:**
Na tej stopnji se narava trgovanja korenito spremeni. Racionalne odločitve, podprte s podatki, zamenja **FOMO** (strah pred zamujeno priložnostjo). Kupci v tej fazi ne trgujejo več na podlagi analize, temveč na podlagi močnih čustev in miseleč, da bodo kaj zamudili, če takoj ne vstopijo. 

Ta kolektivna psihologija ustvarja močan pritisk navzgor, vendar pa so vstopi pri takšnih nivojih povezani z **izjemnim tveganjem**. Ker trg poganjajo čustva, se lahko kadarkoli v tej fazi zgodi nenadna in huda sprememba smeri, ki običajno preseneti nepripravljene kupce.

**Navodila za imetnike pozicij:**
Če ste že v poziciji, je ključno ohraniti disciplino in ne podleči vsesplošni evforiji. 
*   **Spremljanje intervalov:** Zaščita dobička mora postati vaša prioriteta. Svetujemo, da preklopite na krajše časovne intervale, kot sta **1h ali 4h**. 
*   **Signal za spremembo smeri:** **Na tej točki odpore**, ko se gibljemo proti ${Math.round(target2)} USD, bodite pozorni na morebitne znake spremembe smeri navzdol. To se bo najprej pokazalo v obliki **prvega nižjega dna** na omenjenih intervalih. To je prvi realni signal, da prodajalci prevzemajo kontrolo in da se impulz izčrpava.

**Tehnična podpora:**
Najpomembnejša podpora se je zdaj uradno premaknila na nivo **${Math.round(target1)} USD**. Dokler cena ostaja nad to mejo, impulzivni scenarij živi, vendar vsaka izguba tega nivoja pomeni konec trenutne evforije in prehod v globljo korekcijo.

**Zaključek:** 
Uživajte v moči trenda, a ohranite profesionalno distanco. Naslednja dolgoročna tarča pri **${Math.round(target2)} USD** je cilj, vendar je pot do tja zdaj bolj odvisna od psihologije množic kot od same tehnike.
`;

} else if (currentPrice < target3) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 🔥 Ekstremna impulzna faza (Faza visoke volatilnosti)
*   **Naslednja dolgoročna tarča:** ${Math.round(target3)} USD
*   **Glavna podpora (Prejšnja tarča):** ${Math.round(target2)} USD
*   **Taktični fokus:** Spremljanje strukturnih obratov na 1h in 4h intervalih

---

### 🔥 Izrazita moč trenda: Približevanje območju Tarče 3

Instrument **${pairInput}** trenutno prehaja v fazo izrazite impulzivnosti, ki jo poganja močan tržni zagon. Doseganje in testiranje nivoja pri **${Math.round(target3)} USD** predstavlja statistično redek dogodek, kjer tržna struktura postane nadpovprečno strma, s tem pa se znatno poveča tudi tveganje za nenadne popravke.

**Psihološki vidik in vrhunec FOMO pojava:**
V tej fazi se na trgu pogosto pojavi prevlada čustvenih odločitev nad racionalnimi. To je trenutek, ko tržni sentiment doseže ekstreme in v gibanje vstopajo udeleženci, ki jih vodi izključno strah pred zamujeno priložnostjo (**FOMO**). 

Takšen pritisk ustvari "vertikalni pospešek", vendar so vstopi na teh nivojih tehnično zelo izpostavljeni. Evforija je na tej stopnji visoka, trg pa postane ranljiv za hitre spremembe smeri, saj se likvidnost pri teh ekstremnih vrednostih lahko hitro spremeni. Več se ne trguje na podlagi realnih vrednotenj, temveč na podlagi trenutnega zagona, ki ga narekujejo zadnji kupci v trendu.

**⚠️ Operativno opozorilo in Risk Management:**
Za tiste, ki so že v poziciji, je zdaj ključno, da svojo pozornost usmerijo na natančno spremljanje tržne strukture.
*   **Spremljanje intervalov:** Dnevni grafi postanejo premalo odzivni, zato svetujemo uporabo **1h in 4h intervalov**. 
*   **Signal za izčrpanost trenda:** **Na tej točki odpore**, ko se približujemo ${Math.round(target3)} USD, je formacija **prvega nižjega dna** na krajših intervalih ključen opozorilni znak. To je prvi realni signal, da se je moč kupcev izčrpala in da prodajalci začenjajo prevzemati kontrolo nad gibanjem. Popravki so v takšnih fazah običajno hitri in agresivni.

**Tehnična podpora:**
Glavna podpora se zdaj nahaja pri **${Math.round(target2)} USD**. To območje služi kot ključni filter; dokler se cena zadržuje nad njim, trend ohranja svoj impulz. Padec pod ta nivo pa bi pomenil konec trenutne faze rasti in prehod v globljo korekcijo.

**Zaključek:** 
Nahajamo se v območju, kjer sta nujna maksimalna previdnost in dosledno spoštovanje trgovalne strategije. Naslednja dolgoročna tarča pri **${Math.round(target3)} USD** je na vidiku, vendar zahteva trezno glavo in hitro odzivnost na morebitne spremembe v strukturi cene.
`;
    
  } else if (currentPrice < target4) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 🛑 Območje statistične izčrpanosti
*   **Primarna zadnja tarča:** ${Math.round(target4)} USD
*   **Naslednja morebitna ekstremna tarča:** Izračun po preboju
*   **Glavna podpora (Prejšnja tarča):** ${Math.round(target3)} USD

---

### 🛑 Doseganje območja izčrpanosti: Statistična prelomnica pri ${Math.round(target4)} USD

Instrument **${pairInput}** se hitro približuje nivoju, ki v tehnični analizi predstavlja kritično območje izčrpanosti. Podobno kot velja za prvo tarčo, kjer je zavrnjenih okoli 80 % gibanj, se podobna slika ponovi tukaj. Tarča 4 pri **${Math.round(target4)} USD** je nivo, ki ga le redki valutni pari uspešno presežejo v enem samem impulzu.

**Analiza verjetnosti in strateški premislek:**
Statistično gledano se na tej stopnji večina rastočih trendov umiri, saj kupci, ki so vstopili na nižjih nivojih, množično zapirajo svoje pozicije. **Na tej točki odpore** je zato povsem racionalno razmisliti o delnem ali popolnem vnovčevanju dobičkov. Gre za območje, kjer tveganje za nenaden in globok popravek močno presega potencial za takojšnjo nadaljnjo rast.

**Kaj če se rast nadaljuje?**
Čeprav so primeri, ko cena prebije Tarčo 4, redki, niso nemogoči. Če se to zgodi, vstopimo v zadnjo, najbolj evforično fazo trenda, ki presega vse običajne tehnične okvirje. 
*   **Brez skrbi glede zamujenega:** Če bo nivo pri **${Math.round(target4)} USD** odločno presežen in se bo cena nad njim stabilizirala, bo še vedno dovolj časa za "ulov naslednjega vlaka". Takšen preboj bi namreč nakazal na ekstremno močan sentiment, ki bi odprl pot proti povsem novim, še višjim ciljem.

**Operativno spremljanje in znaki za izstop:**
Ker smo v območju visoke negotovosti, je pasivno spremljanje nevarno. Vaša pozornost mora biti usmerjena na strukturne spremembe:
*   **Ključni intervali:** Osredotočite se na **1h in 4h intervale**. Vsak znak šibkosti pri teh cenah je treba jemati resno.
*   **Prvo nižje dno:** To je vaš najpomembnejši signal. Če na omenjenih intervalih opazite formacijo prvega nižjega dna, je to jasen znak, da so prodajalci prevzeli nadzor in da se je trend na tej točki odpore zlomil.

**Tehnična podpora:**
Najbližja pomembna podpora se nahaja pri **${Math.round(target3)} USD**. Padec pod ta nivo bi pomenil dokončno potrditev, da je bila Tarča 4 vrh trenutnega vala, in bi sprožil proces globlje korekcije.

**Zaključek:**
Nahajamo se na nivoju, kjer se v večini primerov zgodba trenutnega impulza zaključi. Svetujemo trezno presojo in zaščito ustvarjenih dobičkov. V kolikor pa nas trg preseneti z odločnim prebojem nad **${Math.round(target4)} USD**, mi sporoči – v tem primeru bova ponovno ocenila situacijo in določila parametre za zadnjo fazo evforije.
`;
    
} else if (currentPrice < target5) {

    analysis = `
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 🚀 Izjemno razširjen trend (Vstop v območje ekstrema)
*   **Naslednja dolgoročna tarča:** ${Math.round(target5)} USD
*   **Glavna podpora (Prejšnja tarča):** ${Math.round(target4)} USD
*   **Taktični fokus:** Spremljanje strukturnih obratov na 1h in 4h intervalih

---
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
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 🚀 Ekstremna impulzivna faza (Preseganje norm)
*   **Naslednja dolgoročna tarča:** ${Math.round(target6)} USD
*   **Glavna podpora (Prejšnja tarča):** ${Math.round(target5)} USD
*   **Taktični fokus:** Zavarovanje dobičkov na 1h in 4h intervalih

---

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
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** ⚡ Nadpovprečen pospešek (Parabolično gibanje)
*   **Naslednja dolgoročna tarča:** ${Math.round(target7)} USD
*   **Glavna podpora (Prejšnja tarča):** ${Math.round(target6)} USD
*   **Taktični fokus:** Povečana pozornost na nenadne obrate (Flash-crash)

---

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
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 🏛️ Ekstremna tržna razširitev (Visoko tveganje)
*   **Naslednja dolgoročna tarča:** ${Math.round(target8)} USD
*   **Glavna podpora (Prejšnja tarča):** ${Math.round(target7)} USD
*   **Taktični fokus:** Aktivno in agresivno upravljanje pozicij

---

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
**GLAVNI NIVOJI IN STATUS:**
*   **Status:** 🌌 Končna ekstremna tarča (Vrhunec celotnega vala)
*   **Zadnja tarča:** ${Math.round(target9)} USD
*   **Glavna podpora (Prejšnja tarča):** ${Math.round(target8)} USD
*   **Taktični fokus:** Iskanje končnega obrata (Blow-off top)

---

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
