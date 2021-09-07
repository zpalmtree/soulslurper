import * as fs from 'fs/promises';
import fetch from 'node-fetch';
import colors from 'colors';

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

function formatSol(sol) {
    return `RANK: ${colors.green(String(sol.rank).padStart(4, ' '))} PRICE: ${colors.green((sol.price / decimals).toFixed(2) + ' SOL')} URL: ${colors.green(sol.url)}`;
}

async function main() {
    const url = `https://us-central1-digitaleyes-prod.cloudfunctions.net/offers-retriever-datastore?collection=Solana%20Souls`;
    const rarity = await createRarityMap();

    let previousResults = [];

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

                const added = [];
                const removed = [];
                const existing = [];

                if (JSON.stringify(sorted) != JSON.stringify(previousResults)) {
                    for (const sol of sorted) {
                        if (previousResults.find((x) => x.name === sol.name) === undefined) {
                            added.push(sol);
                        } else {
                            existing.push(sol);
                        }
                    }

                    for (const sol of previousResults) {
                        if (sorted.find((x) => x.name === sol.name) === undefined) {
                            removed.push(sol);
                        }
                    }

                    previousResults = sorted;

                    if (removed.length > 0) {
                        console.log(colors.red(`${revmoed.length} listings removed`));
                    }

                    for (const sol of existing) {
                        console.log(formatSol(sol));
                    }

                    if (added.length > 0) {
                        console.log(colors.green(`${added.length} listings added`));
                    }

                    for (const sol of added) {
                        console.log(formatSol(sol));
                    }
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
