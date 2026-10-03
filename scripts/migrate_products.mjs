import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const BASE_URL = 'http://www.magyarekszer.hu';
const OUTPUT_FILE = './master_products.json';

const categories = [
    { id: 1, name: "Medálok és talizmánok", slug: "medalok-es-talizmanok" },
    { id: 2, name: "Női láncok", slug: "noi-lancok" },
    { id: 3, name: "Fülbevalók", slug: "fulbevalok" },
    { id: 4, name: "Karkötők", slug: "karkotok" },
    { id: 5, name: "Karperecek", slug: "karperecek" },
    { id: 6, name: "Gyűrűk", slug: "gyuruk" },
    { id: 7, name: "Eljegyzési és karikagyűrűk", slug: "eljegyzesi-es-karikagyuruk" },
    { id: 8, name: "Szobrok és dísztárgyak", slug: "szobrok-es-disztargyak" },
    { id: 9, name: "Modern ékszerek", slug: "modern-ekszerek" }
];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url) {
    try {
        console.log(`Fetching: ${url}`);
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            responseType: 'arraybuffer'
        });
        // The browser subagent confirmed the site uses UTF-8
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(data);
    } catch (error) {
        console.error(`Error fetching ${url}: ${error.message}`);
        return null;
    }
}

async function scrapeProductDetail(url, categorySlug) {
    const html = await fetchPage(url);
    if (!html) return null;

    const $ = cheerio.load(html);
    
    // Name extraction
    const name = $('div[style*="text-transform: uppercase"]').first().text().trim();
    if (!name) return null;

    // Extract price
    let priceText = '';
    $('strong').each((i, el) => {
        if ($(el).text().includes('Ár:')) {
            priceText = $(el).parent().next().text().trim();
        }
    });
    const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

    // Extract weight
    let weight = '';
    $('strong').each((i, el) => {
        if ($(el).text().includes('Súlya:')) {
            weight = $(el).parent().next().text().trim();
        }
    });

    // Extract SKU (Cikkszám)
    let sku = '';
    $('strong').each((i, el) => {
        if ($(el).text().includes('Cikkszám:')) {
            sku = $(el).parent().next().text().trim();
        }
    });

    // Updated image extraction
    // Use og:image meta tag for the most reliable image URL
    let image = $('meta[property="og:image"]').attr('content') || '';
    if (image && !image.startsWith('http')) {
        image = BASE_URL + (image.startsWith('/') ? '' : '/') + image;
    }
    
    // Fallback if og:image is missing
    if (!image) {
        const imgEl = $('img[src*="_kicsi.jpg"]').first();
        if (imgEl.length) {
            let src = imgEl.attr('src');
            const parentLink = imgEl.closest('a').attr('href');
            if (parentLink && parentLink.includes('media/')) {
                image = parentLink.startsWith('http') ? parentLink : BASE_URL + (parentLink.startsWith('/') ? '' : '/') + parentLink;
            } else {
                image = src.startsWith('http') ? src : BASE_URL + (src.startsWith('/') ? '' : '/') + src;
            }
        }
    }

    // Extract and clean long description / history
    let history = '';
    const contentTd = $('td[style*="padding-left: 20px"]');
    if (contentTd.length) {
        const rawText = contentTd.text().trim();
        // Split by labels and take the first part as history
        const labels = ["Cikkszám:", "Mérete:", "Súlya:", "Választható fém:", "Ár:"];
        const parts = rawText.split(new RegExp(labels.join('|'), 'i'));
        history = parts[0]?.replace(name, '').trim() || '';
    }

    return {
        id: url.split('t_id=')[1] || Math.random().toString(36).substr(2, 9),
        name,
        description: '', // description is now merged into history in our model
        price,
        category: categorySlug,
        image,
        sku,
        weight,
        history
    };
}

async function scrapeCategory(category) {
    const products = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const url = `${BASE_URL}/tartalom/termekek/x/?id=${category.id}&page=${page}`;
        const html = await fetchPage(url);
        if (!html) break;

        const $ = cheerio.load(html);
        const detailLinks = [];
        
        $('a[href*="t_id="]').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
                const fullUrl = href.startsWith('http') ? href : BASE_URL + (href.startsWith('/') ? '' : '/') + href;
                if (!detailLinks.includes(fullUrl)) {
                    detailLinks.push(fullUrl);
                }
            }
        });

        if (detailLinks.length === 0) {
            hasMore = false;
            break;
        }

        console.log(`Found ${detailLinks.length} products on page ${page} of ${category.name}`);

        for (const link of detailLinks) {
            const product = await scrapeProductDetail(link, category.slug);
            if (product) {
                products.push(product);
                console.log(`Scraped: ${product.name}`);
            }
            await sleep(200); // Polite delay
        }

        page++;
        if (page > 20) break; // Safety limit
    }

    return products;
}

async function main() {
    let allProducts = [];

    for (const category of categories) {
        console.log(`Starting category: ${category.name}`);
        const categoryProducts = await scrapeCategory(category);
        allProducts = [...allProducts, ...categoryProducts];
        console.log(`Finished category: ${category.name}. Total products: ${allProducts.length}`);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`Successfully scraped ${allProducts.length} products to ${OUTPUT_FILE}`);
}

main().catch(console.error);
