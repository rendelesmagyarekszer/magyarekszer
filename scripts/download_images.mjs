import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_PRODUCTS_PATH = path.join(__dirname, '../master_products.json');
const PUBLIC_PRODUCTS_DIR = path.join(__dirname, '../public/products');

// Create products directory if it doesn't exist
if (!fs.existsSync(PUBLIC_PRODUCTS_DIR)) {
    fs.mkdirSync(PUBLIC_PRODUCTS_DIR, { recursive: true });
}

async function downloadImage(url, filename) {
    const filePath = path.join(PUBLIC_PRODUCTS_DIR, filename);
    
    // Skip if already exists
    if (fs.existsSync(filePath)) {
        return;
    }

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 10000 // 10s timeout
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
        // If it's a 404 or other permanent error, we'll just log it
    }
}

async function main() {
    const products = JSON.parse(fs.readFileSync(MASTER_PRODUCTS_PATH, 'utf8'));
    console.log(`Processing ${products.length} products...`);

    const uniqueImages = new Map(); // url -> filename

    products.forEach(product => {
        if (product.image && product.image.startsWith('http')) {
            const url = product.image;
            const filename = url.split('/').pop().split('?')[0];
            uniqueImages.set(url, filename);
        }
    });

    console.log(`Downloading ${uniqueImages.size} unique images...`);

    let count = 0;
    const entries = Array.from(uniqueImages.entries());
    
    for (const [url, filename] of entries) {
        count++;
        if (count % 20 === 0) {
            console.log(`Progress: ${count}/${uniqueImages.size}...`);
        }
        await downloadImage(url, filename);
    }

    // Update product data
    const updatedProducts = products.map(product => {
        let updatedProduct = { ...product };
        
        // Update image path
        if (product.image && product.image.startsWith('http')) {
            const filename = product.image.split('/').pop().split('?')[0];
            updatedProduct.image = `/products/${filename}`;
        }

        // Always update description from history if history exists
        if (product.history && product.history.trim() !== '') {
            const history = product.history.trim();
            // Find first 200 chars and find the last space to avoid cutting words
            let snippet = history.length > 200 ? history.substring(0, 200).split(' ').slice(0, -1).join(' ') + '...' : history;
            updatedProduct.description = snippet;
        } else if (!product.description || product.description.trim() === '') {
            updatedProduct.description = 'Egyedi kézműves ékszer a MagyarÉkszer műhelyéből.';
        }

        return updatedProduct;
    });

    fs.writeFileSync(MASTER_PRODUCTS_PATH, JSON.stringify(updatedProducts, null, 2));
    console.log(`Successfully updated ${MASTER_PRODUCTS_PATH} and localized images.`);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
