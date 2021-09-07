import * as fs from 'fs/promises';
import fetch from 'node-fetch';

const RARITY_MIN = 100;
const RANK_MIN = 1000;
const decimals = 1000000000;
const PRICE_MAX = 10 * decimals;
const rarityLocation = './soul_top2500.json';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createRarityMap() {
    const rarityData = JSON.parse(await fs.readFile(rarityLocation));

    const rarity = new Map();

    for (const sol of rarityData) {
        rarity.set(sol['Soul Name'], {
            rarity: sol['Rarity Score'],
            rank: Number(sol.Rank.substr(1))
        });
    }

    return rarity;
}

async function main() {
    const url = `https://us-central1-digitaleyes-prod.cloudfunctions.net/offers-retriever-datastore?collection=Solana%20Souls`;
    const rarity = await createRarityMap();

    while (true) {
        try {
            console.log('Fetching price data...');

            const data = await fetch(url);
            const json = await data.json();
            
            const results = [];

            for (const offer of json.offers) {
                const r = rarity.get(offer.metadata.name);

                if (!r) {
                    continue;
                }

                if (offer.price < PRICE_MAX && r.rarity > RARITY_MIN && r.rank < RANK_MIN) {
                    results.push({
                        name: offer.metadata.name,
                        url: `https://digitaleyes.market/item/${offer.mint}`,
                        rank: r.rank,
                        rarity: r.rarity,
                        price: offer.price,
                    });
                }
            }

            if (results.length > 0) {
                const sorted = results.sort((a, b) => b.rank - a.rank);

                for (const sol of sorted) {
                    console.log(`RANK: ${String(sol.rank).padStart(4, '0')}  PRICE: ${(sol.price / decimals).toFixed(2)} SOL     NAME: ${sol.name}    URL: ${sol.url}`);
                }
            }
        } catch (err) {
            console.log(err.toString());
        }

        await sleep(5000);
    }
}

(() => {
    main();
})();
