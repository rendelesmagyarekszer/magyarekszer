export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    sku?: string;
    weight?: string;
    history?: string;
    isKolie?: boolean;
    allowsStone?: boolean;
    isEnamel?: boolean;
    enamelColors?: string[];
    enamelRequiredCount?: 1 | 2;
    collectionId?: string;
    additionalImages?: string[];
    isGoldOnly?: boolean;
    isGoldEngagementRing?: boolean;
    nameEn?: string;
    descriptionEn?: string;
    historyEn?: string;
}

export interface VacationMode {
    isActive: boolean;
    returnDate: string;
}

export interface Collection {
    id: string;
    name: string;
}

export interface Coupon {
    code: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    expiryDate: string;
    isActive: boolean;
}

export const ALL_STONES = [
    'stone_solyomszem', 'stone_granat', 'stone_holdko', 'stone_hegyikristaly', 
    'stone_borostyan', 'stone_olivin', 'stone_igazgyongy'
];

export interface Category {
    name: string;
    image: string;
    slug: string;
}

export const categories: Category[] = [
    {
        name: "Medálok és talizmánok",
        slug: "medalok-es-talizmanok",
        image: "/categories/medalok_talizmanok.jpg"
    },
    {
        name: "Női láncok és bőrök",
        slug: "noi-lancok",
        image: "/categories/noi_lancok.jpg"
    },
    {
        name: "Fülbevalók",
        slug: "fulbevalok",
        image: "/categories/fulbevalok.jpg"
    },
    {
        name: "Karkötők",
        slug: "karkotok",
        image: "/categories/karkotok.jpg"
    },
    {
        name: "Karperecek",
        slug: "karperecek",
        image: "/categories/karperecek.jpg"
    },
    {
        name: "Gyűrűk",
        slug: "gyuruk",
        image: "/categories/gyuruk.jpg"
    },
    {
        name: "Karikagyűrűk",
        slug: "eljegyzesi-es-karikagyuruk",
        image: "/categories/eljegyzesi_gyuruk.jpg"
    },
    {
        name: "Eljegyzési gyűrűk",
        slug: "eljegyzesi-gyuruk",
        image: "/categories/eljegyzesi_gyuruk.jpg"
    },
    {
        name: "Szobrok és dísztárgyak",
        slug: "szobrok-es-disztargyak",
        image: "/categories/szobrok.jpg"
    },
    {
        name: "Modern ékszerek",
        slug: "modern-ekszerek",
        image: "/categories/modern_ekszerek.jpg"
    }
];

export const products: Product[] = []; // Will be populated from server
