import fs from 'fs';
import { translate } from '@vitalets/google-translate-api';

const FILE_PATH = './master_products.json';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log("Loading products...");
    const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    let count = 0;

    for (let i = 0; i < data.length; i++) {
        const p = data[i];
        
        // Skip if already translated
        if (p.nameEn) {
            continue;
        }

        const name = p.name || '';
        const desc = p.description || '';
        const hist = p.history || '';

        const delimiter = " ||| ";
        const textToTranslate = [name, desc, hist].join(delimiter);

        try {
            console.log(`Translating [${i+1}/${data.length}]: ${name}`);
            const res = await translate(textToTranslate, { to: 'en' });
            
            // Re-split using the delimiter (sometimes Google Translate adds spaces around it)
            // We use regex to split robustly
            const parts = res.text.split(/\s*\|\|\|\s*/);
            
            p.nameEn = parts[0] ? parts[0].trim() : '';
            p.descriptionEn = parts[1] ? parts[1].trim() : '';
            p.historyEn = parts[2] ? parts[2].trim() : '';

            count++;
            
            // Save every 10 products
            if (count % 10 === 0) {
                fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
                console.log(`Saved ${count} translations so far...`);
            }

            // Small delay to avoid rate limiting
            await sleep(200);

        } catch (e) {
            console.error(`Error translating product ID ${p.id}:`, e.message);
            // Wait longer on error and continue
            await sleep(2000);
        }
    }

    // Final save
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log("Translation complete! Total translated this run:", count);
}

run().catch(console.error);
