import fs from 'fs';
import path from 'path';
import { Product } from './data';

const mockProducts: Product[] = [
    {
        id: "1",
        sku: "ME-2024-001",
        name: "Szkíta Aranyszarvas Medál",
        description: "Hagyományos szkíta motívumokkal díszített, kézzel készült ezüst medál aranyozással.",
        price: 24900,
        category: "medalok-es-talizmanok",
        image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop",
        weight: "12.5g",
        history: "A szkíta aranyszarvas a magyar mitológia egyik legfontosabb jelképe."
    }
];

let cachedProducts: Product[] | null = null;

export function getProducts(): Product[] {
    if (cachedProducts) return cachedProducts;

    try {
        const filePath = path.join(process.cwd(), 'master_products.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const products = JSON.parse(data);
            if (products.length > 0) {
                cachedProducts = products;
                return products;
            }
        }
    } catch (e) {
        console.error("Error reading master_products.json", e);
    }
    return mockProducts;
}
