# EXTRA MUROS OPDRACHT

## Project Omschrijving

Maak een werkende native app met behulp van AI. Deze bestaat uit 2
delen:

-   Backend voor leerkrachten

    -   Server Side Rendered

    -   Web-based

    -   Functie: opladen van content (tekst, audio en afbeeldingen)

-   Frontend voor leerlingen

    -   Native app: Android en iOS

    -   Functie : bekijken van content

    -   Offline modus (content downloaden)

## Tech Stack

De minimale stack bestaat uit:

### Backend + data

-   Firebase**:** Auth, Firestore, Storage

-   Geen extra servers, geen Cloud Functions (tenzij we later thumbnails
    willen, maar nu niet)

### Web (leerkrachten -- SSR)

-   Next.js (App Router) + TypeScript

-   TailwindCSS + DaisyUI (geen SCSS)

-   Forms: eenvoudige React-formulieren (optioneel React Hook Form, maar
    niet nodig)

-   Data-calls: fetch/Firebase SDK direct vanuit server actions/route
    handlers

-   Hosting: Vercel

### Mobile (leerlingen -- offline)

-   React Native met Expo

-   Expo Router

-   expo-file-system (media opslaan)

-   expo-sqlite (metadata/manifest lokaal)

-   expo-av (audio), expo-image (afbeeldingen)

-   Build & release: EAS Build/Submit (OTA updates optioneel)

## Folder Structuur

![Afbeelding met tekst, Lettertype, schermopname, zwart Door AI
gegenereerde inhoud is mogelijk
onjuist.](media/image1.png){width="4.722222222222222in"
height="0.875in"}

## Flow

**Leerkracht (web)**

-   Login → rol "teacher/admin" (SSR-beschermde routes).

-   Maak Trip → Modules → ContentItems.

-   Upload image/audio naar Storage (client) + pad bewaren in document.

-   Toggle published=true op items.

-   Klik "Publiceer manifest" → POST /api/manifest bouwt
    /manifests/{tripId} met lijstje URL's.

**Leerling (app)**

-   Kies trip → "Download offline".

-   App haalt manifest, downloadt alle media naar FileSystem en schrijft
    metadata naar SQLite.

-   Viewer toont lokaal; online checkt app of version in manifest
    gewijzigd is → dan alleen nieuwe/gewijzigde assets bijhalen.

## Methodologie

Er wordt gewerkt in een scrum omgeving. Volgende rollen moeten ingevuld:

-   Scrum master

-   Scrum leads (per verantwoordelijkheid)

Er wordt van thuis uit gewerkt. Wekelijks is een korte update nodig.

Opmaak wordt voorzien door GT. Hiervoor is coördinatie nodig.

We werken samen in **SLACK** en **CLICKUP**

## Stappenplan

-   Wireframe en scoping bepalen en uitwerken op basis van opdracht en
    bestaande Extra Muros brochure

-   Wireframe en scope voorleggen aan de klant (Mevr. Magalie De Meyer)

-   Project overleg met GT, via dhr. Gerben Gysels ; te bepalen:

    -   Deliverables

    -   Deadlines

-   Verdelen van de programmeertaken

-   Uitwerken van de prototypes voor web en native in Figma

-   Opzet code voor back- en frontend, met versie beheer in Github

-   Opvolging wekelijkse vooruitgang

-   Implementatie opmaak

-   Oplevering & presentatie bij de klant

## Samenvatting programmeerwerk

### Doelarchitectuur 

-   **Backend**: Firebase (Auth -- e-mail/wachtwoord, Firestore,
    Storage).

-   **Web admin (leerkrachten)**: Next.js (TypeScript), Tailwind +
    DaisyUI, client-side formulieren; SSR-shell met middleware op basis
    van Firebase session cookie.

-   **Mobile app (leerlingen)**: React Native via Expo. Offline:
    expo-file-system (media) + expo-sqlite (metadata).

-   **Manifest-flow**:

    -   Leerkracht klikt **Publiceer** → Next.js POST /api/manifest
        (server) bouwt en schrijft /manifests/{tripId} in Firestore.

    -   Mobile haalt manifest via GET /api/public/manifest?tripId=\...
        en downloadt assets.

Belangrijke keuzes om het simpel te houden:

-   Geen Zod, Sentry, telemetry, TanStack Query, Zustand, GSAP/Framer,
    i18n.

-   Geen Cloud Functions.

-   Rolcontrole via schooldomein in Security Rules (bv. \@myschool.be),
    géén custom claims.

### Stap-per-stap bouwplan voor het klassteam

#### 0) Repos & mappen aanmaken

-   GitHub-org extramuros met 2 repos:

    -   extramuros-web

    -   extramuros-mobile

-   Lokale structuur:

> extramuros/
>
> ├─ web/ -\> clone van extramuros-web
>
> └─ mobile/ -\> clone van extramuros-mobile

#### 1) Firebase project (1 uur)

-   Project extramuros.

-   Zet aan:

    -   Authentication: Email/Password.

    -   Firestore: production mode.

    -   Storage: standaard bucket.

-   Maak leraaraccounts aan.

-   Service account key → opslaan als firebase-service-account.json.

#### 2) Security Rules (15 min)

-   Domein aanpassen (myschool.be).

-   Firestore Rules → enkel leerkrachten schrijven, iedereen lezen
    (behalve unpublished content).

-   Storage Rules → images/audio: lezen voor iedereen, schrijven enkel
    voor leerkrachten.

-   Deploy rules via Console.

#### 3) Web admin (Next.js) (2 uur)

-   Init project: Next.js + Tailwind + DaisyUI.

-   Firebase setup: client + admin SDK, env-vars in .env.local.

-   Auth: login met e-mail/wachtwoord, sessie-cookie in middleware.

-   Dashboard skeleton: CRUD voor trips, modules, contentItems; upload
    images/audio; toggle published.

-   Manifest routes:

    -   POST /api/manifest: bouwt manifest en schrijft naar Firestore.

    -   GET /api/public/manifest: geeft manifest terug.

-   Deploy: naar Vercel, environment vars instellen.

#### 4) Mobile app (Expo) (2 uur)

-   Init project: Expo blank + libs (expo-file-system, expo-sqlite,
    expo-av).

-   Offline storage: SQLite schema + download-flow.

-   UI:

    -   Home: invoer tripId + knop Download.

    -   Viewer: lijst items → toon text/image/audio.

-   Build: OTA voor dev; later EAS builds voor stores.

#### 5) Content-workflow testen (45 min)

-   Web: login → trip maken → 3 items (text/image/audio) → published =
    true → Publiceer manifest.

-   Mobile: tripId invoeren → downloaden → vliegtuigmodus → alles werkt
    offline.

-   Definition of Done: offline werkt zonder netwerk.

#### 6) Teamverdeling

-   **Fase 1**: setup Firebase, web skeleton, mobile skeleton.

-   **Fase 2**: CRUD, uploads, manifest endpoints, offline download.

-   **Fase 3**: End-to-end test, bugfixes, polish.

#### 7) Minimale datastructuur (Firestore)

-   **trips**: { title, coverImageStoragePath? }

-   **modules**: { tripId, title }

-   **contentItems**: { tripId, moduleId, type, title, body?,
    storagePath?, published, updatedAt }

-   **manifests**: { tripId, version, items: \[{ id, type, title,
    locale:\"nl\", url? }\] }

-   **Storage**

    -   images/{tripId}/{itemId}.jpg

    -   audio/{tripId}/{itemId}.mp3

#### 8) Checklist voor release

-   Rules live.

-   Minstens 1 demo-trip met 3 items.

-   Manifest gebouwd en bereikbaar via GET.

-   Mobile download + offline playback werkt.

-   Vercel URL gedeeld met mobile team (BASE_URL).

### Uitleg: Manifest & Trip-data

-   Trip-data = ruwe brondata in Firestore: trips, modules,
    contentItems. Hier beheren leerkrachten de inhoud (ook unpublished).

-   Manifest = "gepubliceerde snapshot" van één trip.

    -   Bevat enkel published items.

    -   Wordt door Next.js server samengesteld en in Firestore gezet bij
        Publiceer.

    -   Mobile app leest enkel manifest, niet de ruwe content.

    -   Zo garanderen we dat mobile altijd een complete, offline-ready
        bundel heeft.

#### Kort:

-   Leerkrachten → CRUD op trips/modules/items.

-   Publiceer → schrijft manifest (een bevroren versie).

-   Leerlingen-app → leest enkel manifest → downloadt assets → gebruikt
    alles offline.

## Planning

-   In overleg!

## Evaluatie

-   Kwaliteit werk

-   Individuele contributies

-   Samenwerking & timing

-   Presentatie (in het Engels)

## Theoretisch kader : te kennen

Elk zoekt deze begrippen op, en legt uit in een presentatie:

1.  SSR vs. CSR

2.  SEO

3.  Native app vs. Web app

4.  WPA

5.  DRY

6.  Atomic Design

7.  Offline-first (manifests, cache, sync, conflict handling)

8.  Data-modellering (document vs relationeel; in Firebase:
    collections/subcollections)

9.  EAS builds en OTA updates

10. Vercel

11. Expo en Expo Router

12. Firebase SDK

13. Typescript

14. Tailwind CSS en DaisyUI

15. "Manifest" en "Trip" in data

16. Middleware

17. Zod, Sentry, telemetry, TanStack Query, Zustand, GSAP/Framer, i18n

Een presentatie omvat minimaal:

1)  Wat?

2)  Waarvoor dient het en/of wat zijn mogelijke voordelen?

3)  Hoe werkt het technisch gezien?

4)  Voorbeelden die je hebt gevonden om te illustreren

5)  Eventuele nadelen of gekende bugs (verifieer je bronnen!)
