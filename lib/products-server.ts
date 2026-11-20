import fs from 'fs';
import path from 'path';
import { Product } from './data';

const filePath = path.join(process.cwd(), 'master_products.json');

export function getProducts(): Product[] {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const products = JSON.parse(data);
            if (Array.isArray(products) && products.length > 0) {
                return products;
            }
        }
    } catch (e) {
        console.error("Error reading master_products.json", e);
    }
    return [];
}

export function saveProducts(products: Product[]): void {
    try {
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
    } catch (e) {
        console.error("Error writing master_products.json", e);
        throw e;
    }
}
