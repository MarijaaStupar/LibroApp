# 📖 Libro

Libro je mobilna aplikacija za praćenje čitanja knjiga, razvijena kao seminarski rad iz predmeta **RMAS** (Razvoj mobilnih aplikacija i sistema).

Aplikacija korisniku omogućava da vodi evidenciju o knjigama koje čita, postavlja ciljeve čitanja, vodi dnevnik čitanja, organizuje knjige u kolekcije i deli svoje omiljene naslove sa drugima.

## Sadržaj

- [Funkcionalnosti](#funkcionalnosti)
- [Korišćene tehnologije](#korišćene-tehnologije)
- [Native funkcionalnosti uređaja](#native-funkcionalnosti-uređaja)
- [Struktura projekta](#struktura-projekta)
- [Pokretanje aplikacije](#pokretanje-aplikacije)
- [Build (EAS)](#build-eas)

## Funkcionalnosti

- Registracija i prijava korisnika, čuvanje korisničke sesije (Supabase Auth)
- Onboarding ekrani za nove korisnike
- Pretraga i istraživanje knjiga (Explore)
- Biblioteka korisnika sa statusima knjiga (za čitanje, trenutno čita, pročitano)
- Detaljan prikaz knjige (opis, ocena, žanrovi, broj strana)
- Reading Room — praćenje napretka čitanja u realnom vremenu
- Dnevnik čitanja (Reading Diary) po knjizi
- Kolekcije — grupisanje knjiga po sopstvenim listama
- Ciljevi čitanja i statistika (Journey)
- Profil korisnika sa profilnom slikom, bio opisom i podešavanjima
- Deljenje knjige sa drugima (native Share)
- Podsetnik za čitanje (lokalne notifikacije)
- Indikatori učitavanja i obrada grešaka kroz celu aplikaciju

## Korišćene tehnologije

- [React Native](https://reactnative.dev/) (0.86) + [Expo](https://expo.dev/) (SDK 57)
- [Expo Router](https://docs.expo.dev/router/introduction/) — file-based navigacija
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) — autentifikacija i baza podataka (PostgreSQL)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — lokalno čuvanje podataka na uređaju
- `expo-image`, `expo-image-picker`, `expo-notifications`, `expo-constants`
- Google Fonts: Cormorant Garamond i Inter

## Native funkcionalnosti uređaja

Aplikacija koristi tri native funkcionalnosti mobilnog uređaja:

1. **Kamera i galerija** — korisnik može da slika ili izabere sliku iz galerije za profilnu sliku (`expo-image-picker`).
2. **Lokalne notifikacije** — dnevni podsetnik za čitanje u odabrano vreme (`expo-notifications`). Napomena: zbog ograničenja Expo Go aplikacije na Androidu (SDK 53+), notifikacije rade samo u pravom (EAS) build-u aplikacije, ne u Expo Go razvojnom režimu — u Expo Go korisnik dobija jasnu poruku da funkcija zahteva build.
3. **Deljenje (native Share)** — deljenje trenutno pročitane knjige preko sistemskog menija za deljenje (React Native `Share` API).

## Struktura projekta

```
src/
  app/            Ekrani aplikacije (Expo Router — file-based navigacija)
    auth/         Login, Signup
    onboarding/   Onboarding ekrani (step1-3)
    tabs/         Glavna tab navigacija (Home, Explore, Library, Journey, Profile)
    book/         Detalji knjige
    reading-room/ Praćenje čitanja u toku
    diary/        Dnevnik čitanja
    collections/  Kolekcije knjiga
  components/     Deljene UI komponente
  constants/      Teme, boje, fontovi, storage ključevi
  services/       Komunikacija sa Supabase-om i poslovna logika (books, collections, diary, profile, notifications...)
  hooks/          Custom React hooks
```

## Pokretanje aplikacije

### Preduslovi

- [Node.js](https://nodejs.org/) (18+)
- [Expo Go](https://expo.dev/go) aplikacija na telefonu (Android/iOS), ili Android/iOS emulator
- Supabase projekat (URL i anon key)

### Koraci

1. Kloniraj repozitorijum i instaliraj zavisnosti:

   ```bash
   git clone <URL_REPOZITORIJUMA>
   cd Libro
   npm install
   ```

2. Napravi `.env` fajl u root folderu projekta (na osnovu `.env.example`) i popuni Supabase podatke:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://tvoj-projekat.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tvoj-anon-key
   ```

3. Pokreni razvojni server:

   ```bash
   npx expo start
   ```

4. Skeniraj QR kod Expo Go aplikacijom na telefonu, ili pokreni na emulatoru (`npx expo start --android` / `--ios`).

## Build (EAS)

Za produkcionu/preview verziju aplikacije koristi se [Expo EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

Link ka preview build-u će biti dodat ovde nakon završenog build-a.
