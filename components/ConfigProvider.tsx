"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { products as initialProductsData, Product, Collection, VacationMode, ALL_STONES, Coupon } from '@/lib/data';

export interface ExtraService {
    id: string;
    name: string;
    desc: string;
    price: string;
    price2?: string;
    category: 'casting' | 'digital' | 'workshop' | 'specialty';
    icon?: string;
}

export interface GalleryItem {
    url: string;
    description: string;
}

export interface CustomJewelryCategory {
    id: string;
    title: string;
    description: string;
    images: GalleryItem[];
    isFeatured?: boolean;
}

export interface ShippingSettings {
    foxpostEnabled: boolean;
    foxpostPrice: number;
    mplHomeEnabled: boolean;
    mplHomePrice: number;
    mplBoxEnabled: boolean;
    mplBoxPrice: number;
    localPickupEnabled: boolean;
    localPickupPrice: number;
}

type Currency = 'HUF';
type Language = 'HU' | 'EN';

interface ConfigContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    language: Language;
    setLanguage: (l: Language) => void;
    formatPrice: (priceHuf: number | undefined | null) => string;
    t: (key: string) => string;
    products: Product[];
    setProducts: (p: Product[]) => void;
    translations: Record<Language, Record<string, string>>;
    updateTranslation: (lang: Language, key: string, value: string) => void;
    saveProduct: (p: Product) => void;
    deleteProduct: (id: string) => void;
    collections: Collection[];
    saveCollection: (c: Collection) => void;
    deleteCollection: (id: string) => void;
    vacationMode: VacationMode;
    setVacationMode: (v: VacationMode) => void;
    availableStones: string[];
    setAvailableStones: (s: string[]) => void;
    allStonesMaster: string[];
    stonePrices: Record<string, number>;
    addStone: (huName: string, enName: string, price: number) => void;
    updateStonePrice: (key: string, price: number) => void;
    deleteStone: (key: string) => void;
    notifications: any[];
    addNotification: (n: any) => void;
    coupons: Coupon[];
    saveCoupon: (c: Coupon) => void;
    deleteCoupon: (code: string) => void;
    ankerPrices: Record<string, number>;
    barbaraPrices: Record<string, number>;
    updateChainPrice: (type: 'anker' | 'barbara', length: string, price: number) => void;
    globalEnamelColors: string[];
    updateGlobalEnamelColors: (colors: string[]) => void;
    extraServices: ExtraService[];
    saveExtraService: (service: ExtraService) => void;
    updateExtraServices: (services: ExtraService[]) => void;
    deleteExtraService: (id: string) => void;
    isLoaded: boolean;
    premiumBoxPrice: number;
    updatePremiumBoxPrice: (price: number) => void;
    imageSettings: Record<string, string>;
    updateImageSetting: (key: string, value: string) => void;
    customJewelry: CustomJewelryCategory[];
    updateCustomJewelry: (categories: CustomJewelryCategory[]) => void;
    shippingSettings: ShippingSettings;
    updateShippingSettings: (settings: ShippingSettings) => void;
}

const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
    foxpostEnabled: true,
    foxpostPrice: 1500,
    mplHomeEnabled: true,
    mplHomePrice: 3000,
    mplBoxEnabled: true,
    mplBoxPrice: 3000,
    localPickupEnabled: true,
    localPickupPrice: 0
};

const DEFAULT_ANKER_PRICES = {
    '40': 13000,
    '42': 14000,
    '45': 15000,
    '50': 17000,
    '55': 19000
};

const DEFAULT_BARBARA_PRICES = {
    '40': 13000,
    '42': 14000,
    '45': 15000,
    '50': 17000,
    '55': 19000
};

const DEFAULT_EXTRA_SERVICES: ExtraService[] = [
    { id: 'cast_1', category: 'casting', name: 'Ezüst', desc: '925 Sterling ezüst öntés kiváló felületi minőséggel.', price: 'Kalkuláció alatt', icon: 'Gem' },
    { id: 'cast_2', category: 'casting', name: 'Arany', desc: '14k és 18k sárga, fehér és vörös arany öntés.', price: 'Napi ár alapján' },
    { id: 'cast_3', category: 'casting', name: 'Szilícium Bronz', desc: 'Művészeti és dísztárgyak precíziós bronz öntése.', price: 'Érdeklődésre', icon: 'Activity' },
    { id: 'dig_1', category: 'digital', name: '3D Ékszer Tervezés', desc: 'Fotorealisztikus látványtervek és precíz 3D modellezés.', price: 'Hamarosan', icon: 'Cpu' },
    { id: 'dig_2', category: 'digital', name: '3D Print (Viasz/Gyanta)', desc: 'Nagy felbontású 3D nyomtatás közvetlen öntéshez.', price: 'Hamarosan', icon: 'Layers' },
    { id: 'dig_3', category: 'digital', name: 'Printmarás', desc: 'Precíziós CNC marás viaszból vagy fémből.', price: 'Hamarosan', icon: 'Cog' },
    { id: 'dig_4', category: 'digital', name: 'Tárgy Gumizás', desc: 'Szilikon horganyzás és gumi szerszám készítés szériagyártáshoz.', price: 'Hamarosan', icon: 'Shield' },
    { id: 'work_1', category: 'workshop', name: 'Forrasztás & Összeállítás', desc: 'Precíziós láng és lézer forrasztás minden nemesfémhez.', price: 'Érdeklődésre', icon: 'Workflow' },
    { id: 'work_2', category: 'workshop', name: 'Polírozás & Tisztítás', desc: 'Magasfényű polírozás és ultrahangos tisztítás.', price: 'Érdeklődésre', icon: 'Sparkles' },
    { id: 'work_3', category: 'workshop', name: 'Ékszer Javítás & Felújítás', desc: 'Törött ékszerek javítása, kőpótlás és teljeskörű felújítás.', price: 'Vizuális felmérés', icon: 'Hammer' },
    { id: 'spec_1', category: 'specialty', name: 'Aranyozás & Ezüstözés', desc: 'Galvanikus felületkezelés 24k arany és 999 ezüst bevonattal.', price: 'Napi ár alapján', icon: 'Database' },
    { id: 'spec_2', category: 'specialty', name: 'Egyházi kegytárgyak restaurálása', desc: 'Antik és egyházi fémkeresztek, kelyhek, oltárdíszek restaurálása.', price: 'Egyedi ajánlat', icon: 'Cross' }
];

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    HU: {
        'cart': 'Kosár',
        'account': 'Fiókom',
        'search_placeholder': 'Keresés az ékszerek között...',
        'search_label': 'Keresés',
        'categories': 'Kategóriák',
        'all_jewelry': 'Összes Ékszer',
        'add_to_cart': 'Kosárba',
        'added': 'Hozzáadva!',
        'checkout': 'Pénztár',
        'total': 'Összesen',
        'shipping': 'Szállítás',
        'product_count': 'termék található',
        'no_results': 'Sajnos nem találtunk a keresésnek megfelelő ékszert.',
        'search_results': 'Keresési eredmények',
        'subtotal': 'Részösszeg',
        'shipping_placeholder': 'A következő lépésben választható',
        'go_to_checkout': 'Tovább a pénztárhoz',
        'checkout_title': 'Pénztár és Szállítás',
        'personal_data': 'Személyes Adatok',
        'shipping_method': 'Szállítási Mód',
        'payment_method': 'Fizetési Mód',
        'order_summary': 'Összesítés',
        'place_order': 'Rendelés leadása',
        'success_title': 'Sikeres megrendelés',
        'success_desc': 'Köszönjük bizalomát! Megerősítő e-mailt küldtünk a rendelés adataival.',
        'slogan': 'Szkíta-Hun-Magyar tradicionális ékszerek',
        'est': 'Alapítva: 2002',
        'choose_category': 'Válasszon kategóriát',
        'tradition': 'Tradíció • Minőség • Ötvösművészet',
        'description': 'Leírás',
        'size': 'Méret',
        'chain_request': 'Kér hozzá láncot?',
        'chain_length': 'Lánc hossza',
        'wrist_size': 'Csukló méret (cm)',
        'no_customization': 'Ennél a terméknél nem szükséges méretet megadni.',
        'clear_data': 'Adatok törlése',
        'back_to_catalog': 'Vissza a válogatáshoz',
        'back_to_products': 'Vissza a termékekhez',
        'open_hours': 'nyitvatartás',
        'about': 'bemutatkozás',
        'gallery': 'egyedi ékszerek',
        'contact': 'elérhetőség',
        'privacy': 'adatvédelem',
        'terms': 'rendelési feltételek',
        'mission': 'egyéb szolgáltatásaink',
        'reference': 'Amire büszkék vagyunk',
        'accessory_type': 'Kiegészítő típusa',
        'accessory_chain': 'Lánc',
        'accessory_leather': 'Bőr',
        'accessory_length': 'Lánc hossza',
        'accessory_none': 'Csak a medál',
        'accessory_none_desc': 'Nincs tartozék',
        'chain_included_short': 'Lánc az árban',
        'length_40': '40 cm',
        'length_45': '45 cm',
        'length_50': '50 cm',
        'enamel_title': 'Zománc színek',
        'enamel_colors_label': 'Elérhető színek (vesszővel elválasztva)',
        'enamel_selection_mode': 'Színválasztás módja',
        'enamel_1_color': '1 szín választása',
        'enamel_2_colors': '2 szín választása',
        'select_enamel_colors_1': 'Kérjük, válassz 1 zománc színt!',
        'select_enamel_colors_2': 'Kérjük, válassz 2 zománc színt!',
        'price_base': 'Alapár',
        'price_with_accessory': 'Választott kiegészítővel',
        'collection_title': 'A kollekció további darabjai',
        'sorting': 'Rendezés:',
        'default_sort': 'Alapértelmezett',
        'price_asc': 'Ár szerint növekvő',
        'price_desc': 'Ár szerint csökkenő',
        'handcrafted_collection': 'Egyedi kézműves kollekció',
        'coming_soon': 'Hamarosan érkezik...',
        'delete': 'Törlés',
        'empty_cart': 'A kosár üres',
        'look_around': 'Nézz körül különleges ékszereink között!',
        'workshop_security': 'Tradicionális Műhely & Biztonságos Fizetés',
        'home': 'Főoldal',
        'sku': 'Cikkszám',
        'weight': 'Súly',
        'history_title': 'Eredete és Története',
        'cat_medalok-es-talizmanok': 'Medálok és talizmánok',
        'cat_noi-lancok': 'Női láncok és bőrök',
        'cat_fulbevalok': 'Fülbevalók',
        'cat_karkotok': 'Karkötők',
        'cat_karperecek': 'Karperecek',
        'cat_gyuruk': 'Gyűrűk',
        'cat_eljegyzesi-es-karikagyuruk': 'Karikagyűrűk',
        'cat_eljegyzesi-gyuruk': 'Eljegyzési gyűrűk',
        'cat_szobrok-es-disztargyak': 'Szobrok és dísztárgyak',
        'cat_modern-ekszerek': 'Modern ékszerek',
        'order_gold': 'Szeretném aranyból',
        'quote_request_button': 'Ajánlatot kérek e-mailben',
        'quote_only': 'Egyedi árajánlat alapján',
        'lab_diamond_size': 'Lab Diamond mérete',
        'gold_color': 'Arany színe',
        'gold_white': 'Fehér arany',
        'gold_yellow': 'Sárga arany',
        'gold_rose': 'Rozé arany',
        'gold_request_title': 'Arany Ékszer Megrendelés',
        'full_name': 'Az Ön neve',
        'send_request': 'Kérés küldése e-mailben',
        'gold_template_intro': 'Tisztelt MagyarÉkszer!',
        'gold_template_body': 'Szeretném megrendelni az alábbi terméket arany kivitelben:',
        'gold_template_outro': 'Kérem vegyék fel velem a kapcsolatot a megadott e-mail címen a részletekkel és az árajánlattal kapcsolatban.',
        'message_label': 'Üzenet tartalma',
        'product_label': 'Termék',
        'standard_size': 'Standard',
        'best_regards': 'Üdvözlettel,',
        'choose_size': 'Válasszon méretet',
        'lifetime_warranty': 'Örök Garancia',
        'cert_origin': 'Eredetigazolás',
        'cart_title_hu': 'Kosár',
        'cart_subtitle_hu': 'Tartalma',
        'back_to_cart': 'Vissza a kosárhoz',
        'shipping_mpl_home': 'MPL Házhozszállítás',
        'shipping_mpl_home_desc': 'Házhozszállítás (Fizetés átvételkor készpénzzel vagy kártyával)',
        'shipping_mpl_box': 'MPL Csomagautomata',
        'shipping_mpl_box_desc': 'Vedd át a legközelebbi automatánál.',
        'shipping_foxpost_box': 'Foxpost Csomagautomata',
        'shipping_foxpost_box_desc': 'Vedd át a kiválasztott Foxpost automatánál.',
        'shipping_local': 'Átvétel helyben',
        'shipping_local_desc': 'Ingyenes átvétel az üzletünkben.',
        'shipping_mpl_box_select': 'Csomagautomata kiválasztása',
        'shipping_mpl_box_selected': 'Kiválasztott automata',
        'payment_cod': 'Utánvét (Készpénz vagy Kártya átvételkor)',
        'payment_cod_desc': 'Fizessen a futárnak vagy az átvételi ponton.',
        'payment_card': 'Bankkártyás fizetés',
        'payment_card_desc': 'Biztonságos online fizetés bankkártyával.',
        'payment_apple_pay': 'Apple Pay',
        'payment_apple_pay_desc': 'Gyors és biztonságos fizetés Apple eszközzel.',
        'payment_google_pay': 'Google Pay',
        'payment_google_pay_desc': 'Gyors és biztonságos fizetés Google fiókkal.',
        'payment_transfer': 'Banki utalás',
        'payment_transfer_desc': 'Fizetés közvetlen banki átutalással.',
        'payment_inperson': 'Személyes fizetés (üzletben)',
        'payment_inperson_desc': 'Az üzletünkben személyesen fizet átvételkor.',
        'payment_revolut': 'Revolut Pay (QR kód)',
        'payment_revolut_desc': 'Fizetés Revoluton keresztül QR kód beolvasásával.',
        'revolut_tag': 'martinsbt',
        'free_label': 'INGYENES',
        'full_name_placeholder': 'Teljes név',
        'email_placeholder': 'E-mail cím',
        'phone_placeholder': 'Telefonszám',
        'address_placeholder': 'Irányítószám, Város, Utca, házszám',
        'postcode': 'Irányítószám',
        'city': 'Település',
        'street_address': 'Utca, házszám',
        'billing_details': 'Számlázási Adatok',
        'shipping_details': 'Szállítási Adatok',
        'billing_matches_shipping': 'A számlázási adatok megegyeznek a szállításival',
        'company_billing': 'Céges számlázás',
        'tax_number': 'Adószám',
        'billing_name': 'Számlázási név (Név vagy Cégnév)',
        'products_label': 'Termékek',
        'back_to_home': 'Vissza a kezdőlapra',
        'not_found': 'Nem található.',
        'mon_thu': 'Hétfő - Csütörtök',
        'friday': 'Péntek',
        'tradition_footer': '"A múltunk a jelenünkben él tovább. Szkíta, Hun és Magyar honfoglalás kori ékszerek tradicionális ötvösműhelyünkből."',
        'artisan_title': 'Az Ötvösség Művészete',
        'artisan_description': 'Minden ékszerünk egy-egy darabka történelem. Műhelyünkben az ősi Szkíta, Hun és Magyar motívumokat keltjük életre, a legnemesebb fémek felhasználásával és generációkon átívelő szaktudással.',
        'stone_selection': 'Válasszon követ',
        'stone_price_extra': '+3 000 Ft / db',
        'stone_none': 'Kő nélkül',
        'stone_solyomszem': 'Sólyomszem',
        'stone_granat': 'Gránát',
        'stone_holdko': 'Holdkő',
        'stone_hegyikristaly': 'Hegyikristály',
        'stone_borostyan': 'Borostyán',
        'stone_olivin': 'Olivin',
        'stone_igazgyongy': 'Igazgyöngy',
        'casting_title': 'Precíziós Öntés',
        'page_about_content': 'Családi vállalkozásunk 2002-ben indult azzal a küldetéssel, hogy a Kárpát-medence ősi ékszerkultúráját a modern ötvösművészettel ötvözve hozzuk el a mának.',
        'page_terms_content': '1. Az Eladó Magyarékszer\nA vásárolt áruk eladója Martin\'s Bt. \nSzékhely: 1056 Budapest Molnár utca 23 Adószám: 28110143-2-41\nGKM EKH nyilvántartási szám: 01-06-013358 \nTelefonszám: 06-1-2669292\nE-mail: magyarekszer@gmail.com\n\n2. Személyes adatok\nA résztvevők személyes adatainak felhasználása az Adatvédelmi törvény hatályos szabályozásának értelmében történik. Minden résztvevőnek joga van helyesbíteni vagy törölni bármely, akár az összes általa megadott információt. Az Eladó a vásárlók adatait a szerződés teljesítése, és a szerződés feltételeinek későbbi bizonyítása érdekében tárolja, illetve alvállalkozóinak átadja. Az alvállalkozók az Eladó által átadott személyes adatokat semmilyen módon nem jogosultak megőrizni, felhasználni, illetve további személyeknek átadni. Vásárló külön rendelkezés hiányában beleegyezik, hogy az Eladó a regisztrációnál megadott e-mail címen a későbbiekben tájékoztathasson akcióiról és újdonságairól. \n\n3. Elállás vagy csere\nÖn az átvételtől számított nyolc napon belül indoklás nélkül elállhat a szerződéstől. Ez esetben a visszaszolgáltatási költségeket Ön köteles állni, az eladó pedig köteles az Ön által kifizetett összeget haladéktalanul, de legkésőbb a visszaszolgáltatást követő 30 (harminc) napon belül visszafizetni. Ez esetben vagy méretcsere esetén a termékeket postai úton, ajánlott-tértivevényes formában fogadunk csak el.\nAz elállás joga nem illeti meg azt, aki a vásárolt termék csomagolását az átvételt követően felbontotta! Csak bontatlan csomagolású termék esetén gyakorolható a fenti jogosultság. \n\n4. Szállítási és fizetési feltételek\nA Magyarékszer weboldalán történt rendeléssel minden vásárló kijelenti, hogy elfogadja jelen üzletszabályzatot, tisztában van a rendelés menetével. A weboldalon történt vásárlást követően a vásárló a szállítással kapcsolatos lehetőségek közül választja ki a számára megfelelőt. A vásárlást csak akkor tudjuk elfogadottnak tekinteni, illetve regisztrálni, ha a rendelési adatokat ( név, pontos cím , telefonszám, a megrendelt termék adatai, méret, választható fém, kövek), elektronikusan, telefonon, ill. személyesen megadja. Ennek elmulasztásából eredő károkért, illetve a folyamat közben felmerülő technikai problémákért felelősséget nem vállalunk. A szállítási költség Magyarországon belül: 2 kg-ig 2000,.-tól Ft. A nemzetközi szállítás esetén előre egyeztetett díjszabás történik. A vevő köteles a kiszállítás időpontjában a csomagot tételesen ellenőrizni és hiánytalan teljesítés esetén az átvételi elismervényt aláírni. Ezt követően hiányosságokra vonatkozó reklamációkat nem áll módunkban elfogadni. A megrendelt termékek személyes átvétele is lehetséges, üzletünkben. \n\n5. Egyéb feltételek\nMindent megteszünk annak érdekében, hogy a weboldalunkon szereplő árak és egyéb adatok megfeleljenek a valóságnak, az esetlegesen szereplő hibákért ugyanakkor felelősséget nem vállalunk. Amennyiben a megrendelt termék árában vagy elérhetőségében változás következett be, a megrendelőt erről e-mailben értesítjük. A termékekről feltüntetett képek egyes esetekben eltérhetnek a termék valódi külsejétől. Kérdések esetén örömmel állunk rendelkezésére:magyarekszer@gmail.com',
        'page_privacy_content': 'ADATKEZELÉSI TÁJÉKOZTATÓ\n\n1. Bevezetés\nA Martin\'s Bt. (Székhely: 1056 Budapest, Molnár utca 23., Adószám: 28110143-2-41, továbbiakban: Adatkezelő) a magyarekszer.hu weboldal (továbbiakban: Weboldal) üzemeltetése során a Weboldalra látogatók, ott regisztrálók és vásárlók (továbbiakban: Érintett) adatait kezeli. Jelen tájékoztató célja, hogy az Érintettek megfelelő tájékoztatást kapjanak adataik kezeléséről a GDPR (Általános Adatvédelmi Rendelet) és az Információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény alapján.\n\n2. Az Adatkezelő adatai\nNév: Martin\'s Bt.\nSzékhely: 1056 Budapest, Molnár utca 23.\nE-mail: magyarekszer@gmail.com\nTelefonszám: +36 1 266 9292, +36 20 807 4841\n\n3. Kezelt adatok köre, célja és jogalapja\na) Kapcsolatfelvétel, ajánlatkérés\nKezelt adatok: név, e-mail cím, telefonszám, üzenet tartalma.\nCél: válaszadás, kapcsolattartás.\nJogalap: az Érintett hozzájárulása (GDPR 6. cikk (1) bekezdés a) pont).\nMegőrzési idő: a cél megvalósulásáig, vagy a hozzájárulás visszavonásáig.\n\nb) Webshopos vásárlás és számlázás\nKezelt adatok: név (számlázási és szállítási), lakcím, e-mail cím, telefonszám, céges vásárlás esetén adószám.\nCél: a megrendelés teljesítése, kiszállítás, számlázás.\nJogalap: szerződés teljesítése (GDPR 6. cikk (1) bekezdés b) pont) és jogszabályi kötelezettség (Számviteli tv.).\nMegőrzési idő: a számviteli törvény értelmében a számlákat és a bizonylatokat 8 évig kötelesek vagyunk megőrizni.\n\n4. Adattovábbítás, adatfeldolgozók\nAz Adatkezelő a megrendelések teljesítése érdekében az alábbi adatfeldolgozókat veszi igénybe:\n- Tárhelyszolgáltató: a weboldal működésének biztosítása.\n- Futárszolgálat (Magyar Posta / MPL, Foxpost Zrt.): név, szállítási cím és telefonszám átadása a csomagok kézbesítése céljából.\n- Könyvelés: a számlák feldolgozása törvényi előírás alapján.\nAz adatok harmadik országba (EU-n kívülre) nem kerülnek továbbításra.\n\n5. Sütik (Cookies) kezelése\nA weboldal az alapvető működéshez (pl. kosár tartalma, nyelv kiválasztása) nélkülözhetetlen munkamenet (session) sütiket használ. Ezek a böngésző bezárásával törlődnek. Az oldal nem használ harmadik féltől származó marketing vagy követő (tracking) sütiket a felhasználók kifejezett beleegyezése nélkül.\n\n6. Az Érintett jogai\nAz Érintett jogosult:\n- Tájékoztatást kérni adatai kezeléséről (hozzáférés joga).\n- Kérni pontatlan adatainak helyesbítését.\n- Kérni adatainak törlését ("elfeledtetéshez való jog"), kivéve, ha az adatkezelés jogszabályi kötelezettségen alapul (pl. számlák).\n- Kérni az adatkezelés korlátozását.\n- Tiltakozni személyes adatainak kezelése ellen.\n- Az adathordozhatósághoz, ha az adatkezelés automatizált módon történik.\n\n7. Jogorvoslati lehetőségek\nAmennyiben úgy véli, hogy adatkezelésünk nem felel meg a jogszabályi előírásoknak, panaszával a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH, 1055 Budapest, Falk Miksa utca 9-11., www.naih.hu) fordulhat, vagy bírósági utat vehet igénybe.',
        'page_shipping_content': 'A kiszállítás MPL futárszolgálattal történik 2-5 munkanapon belül. Az eheti öntés időpontjáról kérjük érdeklődjön telefonon!',
        'page_mission_content': 'Hiszünk abban, hogy ékszereink nem csak kiegészítők, hanem identitásunk és múltunk hordozói. Műhelyünkben a tradicionális ötvösművészetet ötvözzük a modern technológiával, hogy maradandót alkossunk.',
        'page_reference_content': 'Büszkék vagyunk azokra az egyedi alkotásokra, amelyek a műhelyünkből kerültek ki. Minden darab egy-egy különleges történetet mesél el.',
        'page_contact_content': 'Keressen minket bizalommal az alábbi elérhetőségeken: +36 20 807 4841, magyarekszer@gmail.com',
        'page_open_hours_content': 'Hétfő - Csütörtök: 10:00 - 18:00\nPéntek: 10:00 - 16:00\nEbédidő: 12:00 - 12:30\nSzombat - Vasárnap: Zárva',
        'contact_email_1': 'magyarekszer@gmail.com',
        'contact_email_2': '',
        'contact_phone_1': '+36 20 807 4841',
        'contact_phone_2': '',
        'contact_address': '1056 Budapest, Molnár u. 23.',
        'contact_location_hint': 'Cég: MARTIN\'S BT. • 1056 Bp. Molnár u. 23.',
        'bank_name': 'K&H Bank Zrt.',
        'bank_account': '10404089-50526774-52721009',
        'bank_iban': 'HU62 1040 4089 5052 6774 5272 1009',
        'bank_swift': 'OKHBHUHB',
        'custom_size': 'Egyedi méret',
        'custom_size_placeholder': 'Írja be a méretet',
        'order_comment': 'Megjegyzés a rendeléshez (Gravírozás, vésés)',
        'order_comment_placeholder': 'Írja ide, ha gravíroztatni vagy vésetni akar...',
        'checkout_error_mpl': 'Kérjük, válassz ki egy átvételi pontot!',
        'checkout_error_terms': 'A vásárláshoz el kell fogadnod az Általános Szerződési Feltételeket és az Adatkezelési Tájékoztatót!',
        'checkout_error_card': 'Kérjük, adja meg helyesen a bankkártya adatait!',
        'checkout_processing_card': 'Tranzakció feldolgozása biztonságos kapcsolaton keresztül...',
        'checkout_processing_mobile': 'Fizetés feldolgozása, kérjük erősítse meg a telefonján...',
        'success_vacation_title': 'Figyelem! Jelenleg szabadságon vagyunk.',
        'success_vacation_desc': 'A megrendelt ékszerek elkészítését leghamarabb {date} napon kezdjük el.',
        'success_info_title': 'Fontos információ:',
        'success_info_desc': 'Minden ékszert egyedileg, kézzel készítünk el. A gyártási idő a megrendeléstől számítva maximum 10 munkanap.',
        'success_info_casting': 'Az eheti öntés pontos időpontjáról kérjük érdeklődjön telefonon!',
        'transfer_details_title': 'Utaláshoz szükséges adatok:',
        'transfer_name': 'Név:',
        'transfer_bank': 'Bank:',
        'transfer_account': 'Számlaszám:',
        'transfer_email_info': 'A visszaigazoló e-mailt hamarosan megkapja a megadott címre.',
        'success_payment_title': 'Sikeres {method} tranzakció!',
        'success_payment_desc': 'A fizetést sikeresen feldolgoztuk a {method} rendszerén keresztül. Köszönjük!',
        'vacation_banner_text': 'SZABADSÁGON VAGYUNK. A RENDELÉSEK FELDOLGOZÁSÁT LEGHAMARABB {date} NAPON TUDJUK ELKEZDENI.'
    },
    EN: {
        'cart': 'Cart',
        'account': 'My Account',
        'search_placeholder': 'Search for jewelry...',
        'search_label': 'Search',
        'categories': 'Categories',
        'all_jewelry': 'All Jewelry',
        'add_to_cart': 'Add to Cart',
        'added': 'Added!',
        'checkout': 'Checkout',
        'total': 'Total',
        'shipping': 'Shipping',
        'product_count': 'products found',
        'no_results': 'Sorry, we couldn\'t find any jewelry matching your search.',
        'search_results': 'Search Results',
        'subtotal': 'Subtotal',
        'shipping_placeholder': 'Select in next step',
        'go_to_checkout': 'Proceed to Checkout',
        'checkout_title': 'Checkout & Shipping',
        'personal_data': 'Personal Details',
        'shipping_method': 'Shipping Method',
        'payment_method': 'Payment Method',
        'order_summary': 'Order Summary',
        'place_order': 'Place Order',
        'success_title': 'Order Successful',
        'success_desc': 'Thank you for your trust! We have sent a confirmation email with your order details.',
        'slogan': 'Scythian-Hun-Hungarian Traditional Jewelry',
        'est': 'Established: 2002',
        'choose_category': 'Choose a Category',
        'tradition': 'Tradition • Quality • Goldsmith Art',
        'description': 'Description',
        'size': 'Size',
        'chain_request': 'Add a chain?',
        'chain_length': 'Chain Length',
        'wrist_size': 'Wrist size (cm)',
        'no_customization': 'No size selection required for this item.',
        'clear_data': 'Clear Data',
        'back_to_catalog': 'Back to catalog',
        'back_to_products': 'Back to products',
        'open_hours': 'opening hours',
        'about': 'about us',
        'gallery': 'custom jewelry',
        'contact': 'contact',
        'privacy': 'privacy policy',
        'terms': 'terms & conditions',
        'mission': 'other services',
        'reference': 'reference',
        'accessory_type': 'Accessory type',
        'accessory_chain': 'Chain',
        'accessory_leather': 'Leather',
        'accessory_length': 'Chain length',
        'accessory_none': 'Pendant only',
        'accessory_none_desc': 'No accessory',
        'chain_included_short': 'Chain included',
        'length_40': '40 cm',
        'length_45': '45 cm',
        'length_50': '50 cm',
        'price_base': 'Base price',
        'price_with_accessory': 'With selected accessory',
        'collection_title': 'Further pieces from the collection',
        'sorting': 'Sort:',
        'default_sort': 'Default',
        'price_asc': 'Price: Low to High',
        'price_desc': 'Price: High to Low',
        'handcrafted_collection': 'Exclusive Handcrafted Collection',
        'coming_soon': 'Coming soon...',
        'delete': 'Delete',
        'empty_cart': 'Your cart is empty',
        'look_around': 'Browse our unique collections!',
        'workshop_security': 'Traditional Workshop & Secure Payment',
        'home': 'Home',
        'sku': 'SKU',
        'weight': 'Weight',
        'history_title': 'Origin & History',
        'cat_medalok-es-talizmanok': 'Pendants & Talismans',
        'cat_noi-lancok': 'Ladies\' Chains & Leathers',
        'cat_fulbevalok': 'Earrings',
        'cat_karkotok': 'Bracelets',
        'cat_karperecek': 'Bangles',
        'cat_gyuruk': 'Rings',
        'cat_eljegyzesi-es-karikagyuruk': 'Wedding Rings',
        'cat_eljegyzesi-gyuruk': 'Engagement Rings',
        'cat_szobrok-es-disztargyak': 'Sculptures & Decor',
        'cat_modern-ekszerek': 'Modern Jewelry',
        'order_gold': 'Request in Gold',
        'quote_request_button': 'Request Quote via Email',
        'quote_only': 'Custom Quote Required',
        'lab_diamond_size': 'Lab Diamond Size',
        'gold_color': 'Gold Color',
        'gold_white': 'White Gold',
        'gold_yellow': 'Yellow Gold',
        'gold_rose': 'Rose Gold',
        'gold_request_title': 'Order in Gold',
        'full_name': 'Your Name',
        'send_request': 'Send Request via Email',
        'gold_template_intro': 'Dear MagyarÉkszer!',
        'gold_template_body': 'I would like to order the following product in gold:',
        'gold_template_outro': 'Please contact me regarding the details and a price quote.',
        'message_label': 'Message Content',
        'product_label': 'Product',
        'standard_size': 'Standard',
        'best_regards': 'Best regards,',
        'choose_size': 'Choose size',
        'lifetime_warranty': 'Lifetime Warranty',
        'cert_origin': 'Certificate of Origin',
        'cart_title_hu': 'Your',
        'cart_subtitle_hu': 'Cart',
        'back_to_cart': 'Back to Cart',
        'shipping_mpl_home': 'MPL Home Delivery',
        'shipping_mpl_home_desc': 'Home delivery (Pay on delivery with cash or card)',
        'shipping_mpl_box': 'MPL Parcel Locker',
        'shipping_mpl_box_desc': 'Pick up at the nearest parcel locker.',
        'shipping_mpl_box_select': 'Select Parcel Locker',
        'shipping_mpl_box_selected': 'Selected Parcel Locker',
        'shipping_local': 'Local Pickup',
        'shipping_local_desc': 'Free pickup at our store.',
        'payment_cod': 'Cash/Card on Delivery',
        'payment_cod_desc': 'Pay at the courier or pickup point.',
        'payment_card': 'Credit Card Payment',
        'payment_card_desc': 'Secure online credit card payment.',
        'payment_apple_pay': 'Apple Pay',
        'payment_apple_pay_desc': 'Fast and secure payment with Apple device.',
        'payment_google_pay': 'Google Pay',
        'payment_google_pay_desc': 'Fast and secure payment with Google account.',
        'payment_transfer_desc': 'Pay via direct bank transfer.',
        'payment_revolut': 'Revolut Pay (QR Code)',
        'payment_revolut_desc': 'Pay via Revolut by scanning a QR code.',
        'revolut_tag': 'martinsbt',
        'free_label': 'FREE',
        'full_name_placeholder': 'Full Name',
        'email_placeholder': 'Email Address',
        'phone_placeholder': 'Phone Number',
        'address_placeholder': 'Postcode, City, Street, house number',
        'postcode': 'Postcode',
        'city': 'City',
        'street_address': 'Street, house number',
        'billing_details': 'Billing Details',
        'shipping_details': 'Shipping Details',
        'billing_matches_shipping': 'Billing matches shipping details',
        'company_billing': 'Company invoicing',
        'tax_number': 'Tax number',
        'billing_name': 'Billing name (Name or Company)',
        'products_label': 'Products',
        'back_to_home': 'Back to Home',
        'not_found': 'Not found.',
        'mon_thu': 'Monday - Thursday',
        'friday': 'Friday',
        'tradition_footer': '"Our past lives on in our present. Scythian, Hun, and Conquest-era jewelry from our traditional artisan workshop."',
        'artisan_title': 'The Art of Goldsmithing',
        'artisan_description': 'Every piece of our jewelry is a piece of history. In our workshop, we bring ancient Scythian and Hun motifs to life using the finest metals and generations of expertise.',
        'stone_selection': 'Choose a stone',
        'stone_price_extra': '+3,000 HUF / pc',
        'stone_none': 'No stone',
        'stone_solyomszem': 'Falcon eye',
        'stone_granat': 'Garnet',
        'stone_holdko': 'Moonstone',
        'stone_hegyikristaly': 'Rock crystal',
        'stone_borostyan': 'Amber',
        'stone_olivin': 'Olivine',
        'stone_igazgyongy': 'Pearl',
        'casting_title': 'Precision Casting',
        'page_about_content': 'Our family business started in 2002 with the mission of blending the ancient jewelry culture of the Carpathian Basin with modern goldsmith art.',
        'page_terms_content': 'Terms and conditions for ordering through the webshop...',
        'page_privacy_content': 'Protecting your data is of paramount importance to us...',
        'page_shipping_content': 'Delivery is handled by MPL courier within 2-5 business days.',
        'page_mission_content': 'We believe that our jewelry are not just accessories, but carriers of our identity and past. In our workshop, we blend traditional goldsmithing with modern technology to create lasting pieces.',
        'page_reference_content': 'We are proud of the unique creations that have left our workshop. Every piece tells a special story.',
        'page_contact_content': 'Feel free to contact us at: +36 20 807 4841, magyarekszer@gmail.com',
        'page_open_hours_content': 'Monday - Thursday: 10:00 - 18:00\nFriday: 10:00 - 16:00\nLunch break: 12:00 - 12:30\nSaturday - Sunday: Closed',
        'contact_email_1': 'magyarekszer@gmail.com',
        'contact_email_2': '',
        'contact_phone_1': '+36 20 807 4841',
        'contact_phone_2': '',
        'contact_address': '1056 Budapest, Molnár u. 23.',
        'contact_location_hint': 'Company: MARTIN\'S BT. • 1056 Bp. Molnár u. 23.',
        'bank_name': 'K&H Bank Zrt.',
        'bank_account': '10404089-50526774-52721009',
        'bank_iban': 'HU62 1040 4089 5052 6774 5272 1009',
        'bank_swift': 'OKHBHUHB',
        'custom_size': 'Custom size',
        'custom_size_placeholder': 'Enter size',
        'order_comment': 'Order comment (Engraving, etching)',
        'order_comment_placeholder': 'Write here if you want engraving or etching...',
        'checkout_error_mpl': 'Please select a pickup point!',
        'checkout_error_terms': 'You must accept the Terms and Conditions and Privacy Policy to purchase!',
        'checkout_error_card': 'Please enter your card details correctly!',
        'checkout_processing_card': 'Processing transaction via secure connection...',
        'checkout_processing_mobile': 'Processing payment, please confirm on your phone...',
        'success_vacation_title': 'Attention! We are currently on vacation.',
        'success_vacation_desc': 'Production of ordered jewelry will start on {date} at the earliest.',
        'success_info_title': 'Important Information:',
        'success_info_desc': 'All jewelry is individually handcrafted. Production time is a maximum of 10 business days from order.',
        'success_info_casting': 'Please call us for the exact time of this week\'s casting!',
        'transfer_details_title': 'Bank Transfer Details:',
        'transfer_name': 'Name:',
        'transfer_bank': 'Bank:',
        'transfer_account': 'Account Number:',
        'transfer_email_info': 'You will shortly receive a confirmation email at the provided address.',
        'success_payment_title': 'Successful {method} transaction!',
        'success_payment_desc': 'The payment has been successfully processed through {method}. Thank you!',
        'vacation_banner_text': 'WE ARE ON VACATION. ORDER PROCESSING WILL RESUME ON {date} AT THE EARLIEST.'
    }
};

export const ConfigProvider = ({ children, initialProducts }: { children: ReactNode, initialProducts?: Product[] }) => {
    const [currency, setCurrency] = useState<'HUF'>('HUF');
    const [language, setLanguage] = useState<Language>('HU');
    const [products, setProducts] = useState<Product[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [dynamicTranslations, setDynamicTranslations] = useState<Record<Language, Record<string, string>>>(translations);
    const [vacationMode, setVacationMode] = useState<VacationMode>({ isActive: false, returnDate: '' });
    const [allStonesMaster, setAllStonesMaster] = useState<string[]>(ALL_STONES);
    const [availableStones, setAvailableStones] = useState<string[]>([]);
    const [stonePrices, setStonePrices] = useState<Record<string, number>>({});
    const [notifications, setNotifications] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [ankerPrices, setAnkerPrices] = useState<Record<string, number>>(DEFAULT_ANKER_PRICES);
    const [barbaraPrices, setBarbaraPrices] = useState<Record<string, number>>(DEFAULT_BARBARA_PRICES);
    const [globalEnamelColors, setGlobalEnamelColors] = useState<string[]>(['Piros', 'Kék', 'Fehér', 'Zöld', 'Bordó', 'Fekete', 'Turkiz']);
    const [extraServices, setExtraServices] = useState<ExtraService[]>(DEFAULT_EXTRA_SERVICES);
    const [premiumBoxPrice, setPremiumBoxPrice] = useState<number>(1500);
    const [imageSettings, setImageSettings] = useState<Record<string, string>>({
        anker_chain: '',
        barbara_chain: '',
        standard_box: '',
        premium_box: ''
    });

    const [customJewelry, setCustomJewelry] = useState<CustomJewelryCategory[]>([
        { 
            id: 'crest_rings', 
            title: 'Családi címeres pecsétgyűrű', 
            description: 'Tradicionális kézi véséssel készülő, generációkon átívelő családi ereklyék nemesfémből.',
            images: [],
            isFeatured: true
        },
        { 
            id: 'engagement_rings', 
            title: 'Egyedi eljegyzési gyűrű', 
            description: 'Személyre szabott tervezés naturális és laboratóriumi gyémántokkal, különleges pillanatokhoz.',
            images: [],
            isFeatured: true
        }
    ]);

    const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);

    useEffect(() => {
        const savedProducts = localStorage.getItem('magyarekszer_products');
        const savedTranslations = localStorage.getItem('magyarekszer_translations');
        const savedCollections = localStorage.getItem('magyarekszer_collections');
        const savedVacationMode = localStorage.getItem('magyarekszer_vacationMode');
        const savedStones = localStorage.getItem('magyarekszer_availableStones');
        const savedAllStones = localStorage.getItem('magyarekszer_allStonesMaster');
        const savedStonePrices = localStorage.getItem('magyarekszer_stonePrices');
        const savedNotifications = localStorage.getItem('magyarekszer_notifications');
        const savedCoupons = localStorage.getItem('magyarekszer_coupons');
        const savedShippingSettings = localStorage.getItem('magyarekszer_shippingSettings');
        const savedAnker = localStorage.getItem('magyarekszer_prices_anker');
        const savedBarbara = localStorage.getItem('magyarekszer_prices_barbara');
        const savedEnamel = localStorage.getItem('magyarekszer_global_enamel_colors');
        const savedServices = localStorage.getItem('magyarekszer_extra_services');
        const savedBoxPrice = localStorage.getItem('magyarekszer_premium_box_price');
 
        if (savedAnker) setAnkerPrices(JSON.parse(savedAnker));
        if (savedBarbara) setBarbaraPrices(JSON.parse(savedBarbara));
        if (savedEnamel) setGlobalEnamelColors(JSON.parse(savedEnamel));
        if (savedServices) setExtraServices(JSON.parse(savedServices));
        if (savedBoxPrice) setPremiumBoxPrice(JSON.parse(savedBoxPrice));

        const savedImageSettings = localStorage.getItem('magyarekszer_image_settings');
        if (savedImageSettings) {
            try {
                setImageSettings(JSON.parse(savedImageSettings));
            } catch (e) {}
        }

        const savedCustomJewelry = localStorage.getItem('magyarekszer_custom_jewelry');
        if (savedCustomJewelry) {
            try {
                const parsed = JSON.parse(savedCustomJewelry);
                if (Array.isArray(parsed)) {
                    // Data Migration: Convert string[] to GalleryItem[]
                    const migrated = parsed.map(cat => ({
                        ...cat,
                        images: (cat.images || []).map((img: any) => 
                            typeof img === 'string' ? { url: img, description: '' } : img
                        )
                    }));
                    setCustomJewelry(migrated);
                }
            } catch (e) {
                console.error("Migration error for custom jewelry:", e);
            }
        }

        const initializeProducts = async () => {
            if (initialProducts && initialProducts.length > 0) {
                setProducts(initialProducts);
            } else if (savedProducts) {
                try {
                    setProducts(JSON.parse(savedProducts));
                } catch (e) {
                    setProducts(initialProductsData);
                }
            } else {
                setProducts(initialProductsData);
            }
        };

        initializeProducts();

        if (savedTranslations) {
            try {
                const parsed = JSON.parse(savedTranslations);
                
                // Migration: Force update the gallery key
                if (parsed.HU) {
                    const g = parsed.HU.gallery;
                    if (g === 'egyéb szolgáltatásaink' || g === 'Galéria' || g === 'galéria') {
                        parsed.HU.gallery = 'egyedi ékszerek';
                    }
                }
                if (parsed.EN && (parsed.EN.gallery === 'other services' || parsed.EN.gallery === 'Gallery')) {
                    parsed.EN.gallery = 'custom jewelry';
                }

                // Migration for mission
                if (parsed.HU) {
                    const m = parsed.HU.mission;
                    if (m === 'hitvallás' || m === 'Hitvallás') {
                        parsed.HU.mission = 'egyéb szolgáltatásaink';
                    }

                    // Migration for slogan capitalization
                    if (parsed.HU.slogan && typeof parsed.HU.slogan === 'string') {
                        parsed.HU.slogan = parsed.HU.slogan
                            .replace(/hun/g, 'Hun')
                            .replace(/magyar/g, 'Magyar');
                    }

                    // Migration for privacy policy
                    if (parsed.HU.page_privacy_content && parsed.HU.page_privacy_content.length < 100) {
                        parsed.HU.page_privacy_content = translations.HU.page_privacy_content;
                    }
                }
                if (parsed.EN && (parsed.EN.mission === 'mission' || parsed.EN.mission === 'Mission')) {
                    parsed.EN.mission = 'other services';
                }

                setDynamicTranslations(prev => ({
                    ...prev,
                    ...parsed
                }));
            } catch (e) {}
        }

        if (savedCollections) {
            try {
                const parsed = JSON.parse(savedCollections);
                if (Array.isArray(parsed)) setCollections(parsed);
            } catch (e) {}
        }
        
        if (savedVacationMode) {
            try {
                const parsed = JSON.parse(savedVacationMode);
                if (parsed) setVacationMode(parsed);
            } catch (e) {}
        }
        
        if (savedStones) {
            try {
                const parsed = JSON.parse(savedStones);
                if (Array.isArray(parsed)) setAvailableStones(parsed);
            } catch (e) {}
        }

        if (savedAllStones) {
            try {
                const parsed = JSON.parse(savedAllStones);
                if (Array.isArray(parsed)) setAllStonesMaster(parsed);
            } catch (e) {}
        }

        if (savedStonePrices) {
            try {
                const parsed = JSON.parse(savedStonePrices);
                if (parsed) setStonePrices(parsed);
            } catch (e) {}
        } else {
            const defaults: Record<string, number> = {};
            ALL_STONES.forEach(key => {
                defaults[key] = 3000;
            });
            setStonePrices(defaults);
        }

        if (savedNotifications) {
            try {
                const parsed = JSON.parse(savedNotifications);
                if (Array.isArray(parsed)) setNotifications(parsed);
            } catch (e) {}
        }

        if (savedCoupons) {
            try {
                const parsed = JSON.parse(savedCoupons);
                if (Array.isArray(parsed)) setCoupons(parsed);
            } catch (e) {}
        }
        
        if (savedShippingSettings) {
            try {
                const parsed = JSON.parse(savedShippingSettings);
                setShippingSettings({ ...DEFAULT_SHIPPING_SETTINGS, ...parsed });
            } catch (e) {}
        }

        const handleImageContextMenu = (e: MouseEvent) => {
            if (e.target instanceof HTMLImageElement) {
                e.preventDefault();
            }
        };

        const handleImageDragStart = (e: DragEvent) => {
            if (e.target instanceof HTMLImageElement) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleImageContextMenu as any);
        document.addEventListener('dragstart', handleImageDragStart as any);

        setIsLoaded(true);

        return () => {
            document.removeEventListener('contextmenu', handleImageContextMenu as any);
            document.removeEventListener('dragstart', handleImageDragStart as any);
        };
    }, [initialProducts]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('magyarekszer_products', JSON.stringify(products));
            localStorage.setItem('magyarekszer_translations', JSON.stringify(dynamicTranslations));
            localStorage.setItem('magyarekszer_collections', JSON.stringify(collections));
            localStorage.setItem('magyarekszer_vacationMode', JSON.stringify(vacationMode));
            localStorage.setItem('magyarekszer_availableStones', JSON.stringify(availableStones));
            localStorage.setItem('magyarekszer_available_stones', JSON.stringify(availableStones));
            localStorage.setItem('magyarekszer_stone_prices', JSON.stringify(stonePrices));
            localStorage.setItem('magyarekszer_notifications', JSON.stringify(notifications));
            localStorage.setItem('magyarekszer_coupons', JSON.stringify(coupons));
            localStorage.setItem('magyarekszer_global_enamel_colors', JSON.stringify(globalEnamelColors));
            localStorage.setItem('magyarekszer_extra_services', JSON.stringify(extraServices));
            localStorage.setItem('magyarekszer_premium_box_price', JSON.stringify(premiumBoxPrice));
            localStorage.setItem('magyarekszer_image_settings', JSON.stringify(imageSettings));
            localStorage.setItem('magyarekszer_custom_jewelry', JSON.stringify(customJewelry));
            localStorage.setItem('magyarekszer_shippingSettings', JSON.stringify(shippingSettings));
        }
    }, [products, dynamicTranslations, collections, vacationMode, availableStones, allStonesMaster, stonePrices, notifications, coupons, globalEnamelColors, extraServices, premiumBoxPrice, imageSettings, customJewelry, shippingSettings, isLoaded]);

    const formatPrice = (priceHuf: number | undefined | null) => {
        if (priceHuf === undefined || priceHuf === null || isNaN(priceHuf)) return '';
        return `${priceHuf.toLocaleString('hu-HU')} Ft`;
    };

    const t = (key: string) => {
        try {
            if (!dynamicTranslations || !language) return key;
            return dynamicTranslations[language]?.[key] || translations?.[language]?.[key] || key;
        } catch (e) {
            return key;
        }
    };

    const updateTranslation = (lang: Language, key: string, value: string) => {
        setDynamicTranslations(prev => ({
            ...prev,
            [lang]: {
                ...prev[lang],
                [key]: value
            }
        }));
    };

    const updateImageSetting = (key: string, value: string) => {
        setImageSettings(prev => ({ ...prev, [key]: value }));
    };

    const updateCustomJewelry = (categories: CustomJewelryCategory[]) => {
        setCustomJewelry(categories);
    };

    const updateChainPrice = (type: 'anker' | 'barbara', length: string, price: number) => {
        if (type === 'anker') {
            const newPrices = { ...ankerPrices, [length]: price };
            setAnkerPrices(newPrices);
        } else {
            const newPrices = { ...barbaraPrices, [length]: price };
            setBarbaraPrices(newPrices);
        }
    };
 
    const updateGlobalEnamelColors = (colors: string[]) => {
        setGlobalEnamelColors(colors);
    };

    const saveExtraService = (service: ExtraService) => {
        setExtraServices(prev => {
            const index = prev.findIndex(s => s.id === service.id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = service;
                return updated;
            }
            return [...prev, service];
        });
    };

    const updateExtraServices = (services: ExtraService[]) => {
        setExtraServices(services);
    };

    const deleteExtraService = (id: string) => {
        setExtraServices(prev => prev.filter(s => s.id !== id));
    };

    const updatePremiumBoxPrice = (price: number) => {
        setPremiumBoxPrice(price);
    };

    const saveProduct = (p: Product) => {
        setProducts(prev => {
            const index = prev.findIndex(item => item.id === p.id);
            if (index !== -1) {
                const newProducts = [...prev];
                newProducts[index] = p;
                return newProducts;
            }
            return [...prev, p];
        });
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const saveCollection = (c: Collection) => {
        setCollections(prev => {
            const index = prev.findIndex(item => item.id === c.id);
            if (index !== -1) {
                const newCollections = [...prev];
                newCollections[index] = c;
                return newCollections;
            }
            return [...prev, c];
        });
    };

    const deleteCollection = (id: string) => {
        setCollections(prev => prev.filter(c => c.id !== id));
    };

    const addStone = (huName: string, enName: string, price: number) => {
        const key = `stone_${huName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        
        setDynamicTranslations(prev => ({
            HU: { ...prev.HU, [key]: huName },
            EN: { ...prev.EN, [key]: enName }
        }));
        
        setStonePrices(prev => ({ ...prev, [key]: price }));
        setAllStonesMaster(prev => [...prev, key]);
        setAvailableStones(prev => [...prev, key]);
    };

    const updateStonePrice = (key: string, price: number) => {
        setStonePrices(prev => ({ ...prev, [key]: price }));
    };

    const deleteStone = (key: string) => {
        setAllStonesMaster(prev => prev.filter(k => k !== key));
        setAvailableStones(prev => prev.filter(k => k !== key));
        setStonePrices(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const addNotification = (n: any) => {
        setNotifications(prev => [
            {
                id: `notif_${Date.now()}`,
                date: new Date().toISOString(),
                ...n
            },
            ...prev
        ]);
    };

    const saveCoupon = (c: Coupon) => {
        setCoupons(prev => {
            const index = prev.findIndex(item => item.code === c.code);
            if (index !== -1) {
                const newCoupons = [...prev];
                newCoupons[index] = c;
                return newCoupons;
            }
            return [...prev, c];
        });
    };

    const deleteCoupon = (code: string) => {
        setCoupons(prev => prev.filter(c => c.code !== code));
    };

    const updateShippingSettings = (settings: ShippingSettings) => {
        setShippingSettings(settings);
    };

    return (
        <ConfigContext.Provider value={{
            currency,
            setCurrency,
            language,
            setLanguage,
            formatPrice,
            t,
            products,
            setProducts,
            translations: dynamicTranslations,
            updateTranslation,
            saveProduct,
            deleteProduct,
            collections,
            saveCollection,
            deleteCollection,
            vacationMode,
            setVacationMode,
            availableStones,
            setAvailableStones,
            allStonesMaster,
            stonePrices,
            addStone,
            updateStonePrice,
            deleteStone,
            notifications,
            addNotification,
            coupons,
            saveCoupon,
            deleteCoupon,
            ankerPrices,
            barbaraPrices,
            updateChainPrice,
            globalEnamelColors,
            updateGlobalEnamelColors,
            extraServices,
            saveExtraService,
            updateExtraServices,
            deleteExtraService,
            isLoaded,
            premiumBoxPrice,
            updatePremiumBoxPrice,
            imageSettings,
            updateImageSetting,
            customJewelry,
            updateCustomJewelry,
            shippingSettings,
            updateShippingSettings
        }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
