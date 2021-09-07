import * as fs from 'fs/promises';
import fetch from 'node-fetch';
import colors from 'colors';

const decimals = 1000000000;
const rarityLocation = './soul_full.json';

/* Only display souls with a rarity higher than this */
const RARITY_MIN = 0;

/* Only display souls below this ranking. https://solsoulsnft.com/rankings */
const RANK_MIN = 1000;

/* Only display souls costing less than this. */
const PRICE_MAX = 10 * decimals;

/* Field to sort the result data on. */
/* Valid fields: 'rank', 'rarity', 'price', 'name', 'url' */
const SORT_BY = 'price';

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

function formatSol(sol, color) {
    const rank = `RANK: ${String(sol.rank).padStart(4, ' ')[color]}`;
    const price = `PRICE: ${((sol.price / decimals).toFixed(2) + ' SOL').padStart(9, ' ')[color]}`;
    const url = `URL: ${sol.url[color]}`;

    return `${rank}  ${price}  ${url}`;
}

async function main() {
    const url = `https://us-central1-digitaleyes-prod.cloudfunctions.net/offers-retriever-datastore?collection=Solana%20Souls`;
    const rarity = await createRarityMap();

    let previousResults = [];

    while (true) {
        try {
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
                const sorted = results.sort((a, b) => b[SORT_BY] - a[SORT_BY]);

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
                        console.log(colors.red(`${removed.length} listings removed`));
                    }

                    for (const sol of removed) {
                        console.log(formatSol(sol, 'red'));
                    }

                    if (added.length > 0) {
                        console.log(colors.green(`${added.length} listings added`));
                    }

                    for (const sol of added) {
                        console.log(formatSol(sol, 'green'));
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
