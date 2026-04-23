# 🕹️ Color Mix: RGB Arcade Project

Moj projekt arkadne igre, ki temelji na fiziki odbijanja žogice, a z umazanim trikom: **barvno logiko**. Ni dovolj, da samo zadeneš opeko; tvoja žogica mora biti usklajena s spektrom opeke, sicer se igra obrne proti tebi.

## 🛠 Tehnični pregled

Igra teče na **HTML5 Canvas** z uporabo čistega **JavaScripta** za fiziko trkov in gibanja. Za vmesnike in obvestila sem uporabil jQuery ter SweetAlert2, ker sta hitra in učinkovita za upravljanje stanj igre.

### Ključne rešitve:
* **Persistenčni sistem po igralcu:** Vsak igralec ima svoj profil. Napredek (odklenjeni nivoji) se shranjuje v `localStorage` pod unikatnim ključem glede na vpisano ime (npr. `maxNivo_Janez`).
* **Logika penalizacije (Sive opeke):** Če opeko zadaneš z napačno barvo, se ta ne uniči, ampak sproži "sivi zamik" — opeka postane za 6 sekund siva in neuničljiva.
* **Dinamično mešanje barv:** Implementiran sistem sledenja pritisnjenih tipk (key-state tracking), ki omogoča ustvarjanje sekundarnih barv (Rumena, Cian, Magenta) s hkratnim držanjem dveh tipk.
* **Sistem točkovanja:** Lokalni JSON sistem za shranjevanje TOP 5 rezultatov, ki beleži točke in čas preigravanja.

## 🎮 Navodila za igranje

1.  **Prijava:** Vpišeš ime (brez tega so naprednejši nivoji zaklenjeni).
2.  **Kontrole:**
    * `Levo / Desno` – premikanje loparja.
    * `1` (Rdeča), `2` (Zelena), `3` (Modra) – osnovni barvni preklop.
    * **Kombinacije** (npr. `1+2`) – mešanje barv za napredne opeke.
    * `Space` – Pavza.
3.  **Cilj:** Uniči vse opeke na zaslonu. Žogica prevzame barvo loparja ob vsakem odboju.

## 📂 Struktura datotek

* `index.html` – Okostje projekta in UI logika za preklop med meniji.
* `js/code.js` – Glavni engine (fizika, odboji, barvni filtri in shranjevanje).
* `css/style.css` – Vizualna podoba, animacije ozadja in postavitev elementov.

## 📝 Opombe pri razvoju

Pri razvoju sem se osredotočil na to, da lahko na isti napravi tekmuje več ljudi. Če zamenjaš ime v vnosnem polju, se gumbi za nivoje takoj osvežijo in prikažejo napredek, ki pripada temu imenu. Fizika je nastavljena tako, da je ključen trenutek odboja od loparja — takrat se določi usoda naslednjega napada na opeke.

---
**Avtor:** Teja Marc  
**Leta:** 2026
---

## 👤 Avtor
**Teja Marc** *Projekt je nastal kot del učenja razvoja interaktivnih spletnih iger.*
