import * as fs from 'fs/promises';
import fetch from 'node-fetch';
import colors from 'colors';

const decimals = 1000000000;
const rarityLocation = './soul_full.json';

/* Only display souls with a rarity higher than this */
const RARITY_MIN = 0;

/* Only display souls below this ranking. https://solsoulsnft.com/rankings */
const RANK_MIN = 10000;

/* Only display souls costing less than this. */
const PRICE_MAX = 10 * decimals;

/* Field to sort the result data on. */
/* Valid fields: 'rank', 'rarity', 'price', 'name', 'url' */
const SORT_BY = 'price';

/* This setting toggles whether attribute filters are combinational or additional.
 * For example, consider you have all fields enabled. Then, you disable all 
 * bodies except for rainbow, and all glasses but synth glasses.
* If TRAIT_FILTERS_COMBINE is set to false, the results would contain any
* results, where the soul either has a rainbow body, or synth glasses.
* However, if TRAIT_FILTERS_COMBINE is set to true, the results would contain
* any souls where the body is rainbow, and the glasses are synth. In other words,
* the filters have been combined.
* A true value requires every attribute the soul has to be set to enabled in the filter,
* whereas a false value requires at least one attribute the soul has to be
* enabled in the filter.
*
* To make the filters work best, you probably want to set everything to false
* when TRAIT_FILTERS_COMBINE is set to false, then enable just the traits you
* are interested in. E.g., set anything rainbow to true, to find only souls
* with rainbow items.
*
* When TRAIT_FILTERS_COMBINE is set to true, you probably want everything enabled,
* except the attributes you are not interested in. E.g. leave everything enabled,
* then disable all bodies but rainbow to find only rainbow bodied souls. */
const TRAIT_FILTERS_COMBINE = false;

/* Quickly disable attribute filtering without having to wipe your custom filters.
 * Setting to true will disable any effects of the ATTRIBUTE_FILTER item,
 * all attributes will be included in the results. */
const DISABLE_ATTRIBUTE_FILTER = true;

/* Print debug info */
const DEBUG = false;

/* Filter out any attributes. Just set enabled to false to exclude them from
 * results. */
const ATTRIBUTE_FILTER = {
    bodies: [
        {
            name: 'Base White', /* 54.93% */
            enabled: false,
        },
        {
            name: 'Base Green', /* 25.48% */
            enabled: false,
        },
        {
            name: 'Base Blue', /* 9.78% */
            enabled: false,
        },
        {
            name: 'Base Purple', /* 6.03% */
            enabled: false,
        },
        {
            name: 'Base Orange', /* 2.96% */
            enabled: false,
        },
        {
            name: 'Base Rainbow', /* 0.82% */
            enabled: true,
        },
    ],
    backgrounds: [
        {
            name: 'Cauldron',
            enabled: false,
        },
        {
            name: 'Fence',
            enabled: false,
        },
        {
            name: 'Lantern',
            enabled: false,
        },
        {
            name: 'Tombstone Bat',
            enabled: false,
        },
        {
            name: 'Cross',
            enabled: false,
        },
        {
            name: 'Full Moon',
            enabled: false,
        },
        {
            name: 'Half Moon',
            enabled: false,
        },
        {
            name: 'Sun Sky',
            enabled: false,
        },
        {
            name: 'Underworld',
            enabled: false,
        },
        {
            name: 'Synth Sun',
            enabled: true,
        },
        {
            name: 'Rainbow',
            enabled: true,
        },
    ],
    mouths: [
        {
            name: 'Smile',
            enabled: false,
        },
        {
            name: 'Flat',
            enabled: false,
        },
        {
            name: 'Frown',
            enabled: false,
        },
        {
            name: 'Circle',
            enabled: false,
        },
        {
            name: 'Lipstick',
            enabled: false,
        },
        {
            name: 'Kissing',
            enabled: false,
        },
        {
            name: 'Stache',
            enabled: false,
        },
        {
            name: 'Pucker',
            enabled: false,
        },
        {
            name: 'Shy Guy',
            enabled: false,
        },
        {
            name: 'Tongue',
            enabled: false,
        },
        {
            name: 'Booo',
            enabled: true,
        },
        {
            name: 'Rainbow Vom',
            enabled: true,
        },
        {
            name: 'Vamp Fangs',
            enabled: true,
        },
    ],
    hairs: [
        {
            name: 'None',
            enabled: false,
        },
        {
            name: 'Straw Hat',
            enabled: false,
        },
        {
            name: 'Ninja Black',
            enabled: false,
        },
        {
            name: 'Heart Band',
            enabled: false,
        },
        {
            name: 'Pomp',
            enabled: false,
        },
        {
            name: 'Clown',
            enabled: false,
        },
        {
            name: 'Cat Ears Brown',
            enabled: false,
        },
        {
            name: 'Baseball Hat Red',
            enabled: false,
        },
        {
            name: 'Baseball Hat Sol',
            enabled: false,
        },
        {
            name: 'Black Beanie',
            enabled: false,
        },
        {
            name: 'Wizard',
            enabled: false,
        },
        {
            name: 'Ninja Red',
            enabled: false,
        },
        {
            name: 'Emo',
            enabled: false,
        },
        {
            name: 'Baseball Hat Blue',
            enabled: false,
        },
        {
            name: 'Pol',
            enabled: false,
        },
        {
            name: 'Baseball Hat Green',
            enabled: false,
        },
        {
            name: 'Cowboy',
            enabled: false,
        },
        {
            name: 'Baseball Hat Heart',
            enabled: false,
        },
        {
            name: 'Bit Phones',
            enabled: false,
        },
        {
            name: 'Cat Ears Synth',
            enabled: false,
        },
        {
            name: 'Queen',
            enabled: false,
        },
        {
            name: 'Frog',
            enabled: false,
        },
        {
            name: 'Santa Beanie',
            enabled: false,
        },
        {
            name: 'Synth Horn',
            enabled: false,
        },
        {
            name: 'Crown',
            enabled: false,
        },
        {
            name: 'Chef Hat',
            enabled: false,
        },
        {
            name: 'Blue Arrow',
            enabled: false,
        },
        {
            name: 'Miner',
            enabled: false,
        },
        {
            name: 'Ora',
            enabled: false,
        },
        {
            name: 'Pirate',
            enabled: false,
        },
        {
            name: 'Rain-Bow',
            enabled: true,
        },
        {
            name: 'Halo',
            enabled: true,
        },
        {
            name: 'Horns',
            enabled: true,
        },
        {
            name: 'Ghost King',
            enabled: true,
        },
        {
            name: 'Rainbow Hawk',
            enabled: true,
        },
    ],
    hands: [
        {
            name: 'None',
            enabled: false,
        },
        {
            name: 'Ice Cream Cone Strawberry',
            enabled: false,
        },
        {
            name: 'Broom',
            enabled: false,
        },
        {
            name: 'Spatula',
            enabled: false,
        },
        {
            name: 'Wand',
            enabled: false,
        },
        {
            name: 'Knife',
            enabled: false,
        },
        {
            name: 'Pickaxe Gold',
            enabled: false,
        },
        {
            name: 'Ice Cream Cone Mint',
            enabled: false,
        },
        {
            name: 'Pirate Hook',
            enabled: false,
        },
        {
            name: 'Green Saber',
            enabled: false,
        },
        {
            name: 'Blue Saber',
            enabled: false,
        },
        {
            name: 'Pickaxe Diamond',
            enabled: false,
        },
        {
            name: 'Staff',
            enabled: true,
        },
        {
            name: 'Sword Gold',
            enabled: true,
        },
        {
            name: 'Diamond Hands',
            enabled: false,
        },
        {
            name: 'Red Saber',
            enabled: false,
        },
        {
            name: 'Boxing Gloves',
            enabled: false,
        },
        {
            name: 'Sword Diamond',
            enabled: true,
        },
        {
            name: 'Pitch Fork',
            enabled: true,
        },
        {
            name: 'Harp',
            enabled: true,
        },
        {
            name: 'Royal Scepter',
            enabled: true,
        },
    ],
    glasses: [
        {
            name: 'None',
            enabled: false,
        },
        {
            name: 'Hipster Blue',
            enabled: false,
        },
        {
            name: 'Hipster Red',
            enabled: false,
        },
        {
            name: 'Deal With It',
            enabled: false,
        },
        {
            name: 'Round Glasses',
            enabled: false,
        },
        {
            name: 'Shades',
            enabled: false,
        },
        {
            name: 'Eye Patch',
            enabled: false,
        },
        {
            name: 'Sans',
            enabled: false,
        },
        {
            name: 'Monacle',
            enabled: false,
        },
        {
            name: 'Star Glasses',
            enabled: true,
        },
        {
            name: 'Synth Glasses',
            enabled: true,
        },
    ],
    eyes: [
        {
            name: 'Black Right Wink',
            enabled: false,
        },
        {
            name: 'Black',
            enabled: false,
        },
        {
            name: 'Black Left Wink',
            enabled: false,
        },
        {
            name: 'Happy',
            enabled: false,
        },
        {
            name: 'Black Wide',
            enabled: false,
        },
        {
            name: 'Blue Eyeshadow',
            enabled: false,
        },
        {
            name: 'Red',
            enabled: false,
        },
        {
            name: 'Purple Eyeshadow',
            enabled: false,
        },
        {
            name: 'Sleep',
            enabled: false,
        },
        {
            name: 'Red Dot',
            enabled: false,
        },
    ],
    cheeks: [
        {
            name: 'Pink',
            enabled: false,
        },
        {
            name: 'Red',
            enabled: false,
        },
        {
            name: 'Crying',
            enabled: false,
        },
    ],
};

const attributeFieldMapping = new Map([
    ['Background', 'backgrounds'],
    ['Body', 'bodies'],
    ['Eyes', 'eyes'],
    ['Mouth', 'mouths'],
    ['Glasses', 'glasses'],
    ['Hands', 'hands'],
    ['Hair/Hait', 'hairs']
]);

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
    const rank = `${colors.white('RANK')}: ${String(sol.rank).padStart(4, ' ')[color]}`;
    const price = `${colors.white('PRICE')}: ${((sol.price / decimals).toFixed(2) + ' SOL').padStart(9, ' ')[color]}`;
    const url = `${colors.white('URL')}: ${sol.url[color]}`;

    return `${rank}  ${price}  ${url}`;
}

const url = `https://us-central1-digitaleyes-prod.cloudfunctions.net/offers-retriever?collection=Solana%20Souls&price=asc`;

async function fetchCatalogue() {
    const results = [];

    let cursor = '';

    let json;

    while (true) {
        const data = await fetch(url + `&cursor=${cursor}`);
        json = await data.json();

        if (DEBUG) {
            console.log(json.offers);
        }

        if (!json.offers) {
            break;
        }

        if (json.offers[0].price > PRICE_MAX) {
            break;
        }

        results.concat(json.offers);

        if (json.next_cursor) {
            cursor = json.next_cursor;
        } else {
            break;
        }

        if (DEBUG) {
            console.log(cursor);
        }
    }

    return {
        offers: results,
        price_floor: json.price_floor,
    };
}

async function main() {
    const rarity = await createRarityMap();

    let previousResults = [];

    while (true) {
        try {
            const json = await fetchCatalogue();

            if (DEBUG) {
                console.log('got data: ' + JSON.stringify(json, null, 4));
            }
            
            const results = [];

            for (const offer of json.offers) {
                const r = rarity.get(offer.metadata.name);

                if (!r) {
                    continue;
                }

                if (offer.price < PRICE_MAX && r.rarity > RARITY_MIN && r.rank < RANK_MIN) {
                    if (DISABLE_ATTRIBUTE_FILTER) {
                        results.push({
                            name: offer.metadata.name,
                            url: `https://digitaleyes.market/item/${offer.mint}`,
                            rank: r.rank,
                            rarity: r.rarity,
                            price: offer.price,
                        });

                        continue;
                    }

                    let haveIncludedTrait = false;
                    let haveAllIncludedTraits = true;

                    for (const attribute of offer.metadata.attributes) {
                        const field = attributeFieldMapping.get(attribute.trait_type);

                        if (field) {
                            const filter = ATTRIBUTE_FILTER[field].find((x) => x.name === attribute.value);
                            const traitEnabled = filter?.enabled || false;

                            /* We have one of the traits required, if this trait
                             * is enabled, or we already found a required trait. */
                            haveIncludedTrait = traitEnabled || haveIncludedTrait;

                            /* We have all traits required, if this trait is
                             * enabled, and all other traits are enabled */
                            haveAllIncludedTraits = haveAllIncludedTraits && traitEnabled;
                        }
                    }

                    if ((TRAIT_FILTERS_COMBINE && haveAllIncludedTraits) || (!TRAIT_FILTERS_COMBINE && haveIncludedTrait)) {
                        results.push({
                            name: offer.metadata.name,
                            url: `https://digitaleyes.market/item/${offer.mint}`,
                            rank: r.rank,
                            rarity: r.rarity,
                            price: offer.price,
                        });
                    }
                }
            }

            if (results.length > 0) {
                const sorted = results.sort((a, b) => b[SORT_BY] - a[SORT_BY]);

                const added = [];
                const removed = [];

                if (JSON.stringify(sorted) != JSON.stringify(previousResults)) {
                    for (const sol of sorted) {
                        if (previousResults.find((x) => x.name === sol.name) === undefined) {
                            added.push(sol);
                        }
                    }

                    for (const sol of previousResults) {
                        if (sorted.find((x) => x.name === sol.name) === undefined) {
                            removed.push(sol);
                        }
                    }

                    previousResults = sorted;

                    const time = new Date().toLocaleTimeString();

                    let status = `\n${colors.white('PRICE FLOOR')}: ` + colors.green((json.price_floor / decimals).toFixed(2) + ' SOL, ');

                    status += `${colors.white('TOTAL LISTINGS')}: ${colors.green(json.offers.length)}, ${colors.white('TIME')}: ${colors.green(time)}`;

                    if (removed.length > 0) {
                        status += `\n${colors.white('LISTINGS SOLD/DELISTED')}: ${colors.red(removed.length)}`;
                    }

                    if (added.length > 0) {
                        status += `\n${colors.white('LISTINGS ADDED')}: ${colors.green(added.length)}`;
                    }

                    console.log(status);

                    for (const sol of removed) {
                        console.log(formatSol(sol, 'red'));
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
