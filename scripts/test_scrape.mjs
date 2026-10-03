import axios from 'axios';
import * as cheerio from 'cheerio';

const testUrl = 'http://www.magyarekszer.hu/tartalom/termekek/x/karosi-turul/?t_id=64';

async function test() {
    const { data } = await axios.get(testUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        responseType: 'arraybuffer'
    });
    const decoder = new TextDecoder('iso-8859-2');
    const html = decoder.decode(data);
    const $ = cheerio.load(html);

    console.log('--- DEBUG ---');
    console.log('Body length:', html.length);
    console.log('H1:', $('h1').text());
    console.log('All fonts style size 14:', $('font[style*="font-size:14px"]').length);
    $('font[style*="font-size:14px"]').each((i, el) => {
        console.log(`Font ${i}:`, $(el).text().trim());
    });
    
    const name = $('font[style*="font-size:14px"] b').first().text().trim();
    console.log('Extracted Name:', name);

    // Let's see all bold tags
    console.log('All b tags:', $('b').length);
    $('b').slice(0, 5).each((i, el) => {
        console.log(`B ${i}:`, $(el).text().trim());
    });
}

test().catch(console.error);
