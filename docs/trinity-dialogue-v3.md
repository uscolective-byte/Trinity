# Trinity Dialogue v3 — vývojová integrácia

Konverzačná vrstva pre existujúci Cloudflare Worker, aktivovaná cez `POST /api/ai/command` (spätná kompatibilita) alebo `POST /api/ai/dialogue`. Obe cesty vyžadujú serverové prihlásenie. API vracia `response`, `engine`, `mode`, `conversation_id` a `persistence`.

## Nové správanie

- Prirodzená slovenčina, krátka história rozhovoru, explicitná identifikácia neúspešného volania modelu namiesto vymyslených úspechov.
- Pripravovanie nasadenia musí obsahovať názov služby, prostredie a konkrétnu verziu / commit.
- Schvaľovanie bez ručného ID: „Schvaľujem“, „Potvrdzujem“, „Áno“, „Zamietam“. Pri viacerých čakajúcich návrhoch „Schvaľujem trinity-gateway“.
- Žiadosť je platná 15 minút a viazaná na konkrétneho prihláseného používateľa aj konverzáciu.
- **Schválenie iba zmení stav návrhu. Neexistuje tu vykonávač deploymentu.** Žiadne nasadenie sa nespustí len na základe správy v chate.

## D1 je potrebná pre trvalé schvaľovanie

Na produkčnej Cloudflare službe vytvorte alebo určte existujúcu D1 databázu, pridajte binding s názvom `TRINITY_DB` a aplikujte SQL zo súboru `migrations/0001_trinity_dialogue.sql`. Identifikátor databázy sa nastavuje výhradne podľa skutočnej konfigurácie, nie podľa náhodného príkladu. Bez migrácie alebo bindingu beží iba prechodný konverzačný režim; systém **neprijíma schválenia**.

Konfigurácia GEMINI kľúča používa Cloudflare secret `GEMINI_API_KEY` (tiež toleruje staršie názvy). Nikdy nevkladajte kľúče do klientského kódu.

## Bezpečnosť pred produkciou

Základný repozitár má ukážkové prihlasovacie údaje v zdrojovom kóde a nestále sessions. **Nezapájajte reálny deploy executor, kým nebude autentifikácia prepracovaná**, prednostne cez Cloudflare Access s presne obmedzenými oprávneniami. Treba ďalej zabezpečiť audit a vykonávanie iba schválených nezmeniteľných commitov.

## Overenie

`npm test` spustí testy spracovania slovenčiny, kontextu, zlyhania AI, izolácie session, schvaľovania, zamietnutia, viacnásobných návrhov a expirácie.
