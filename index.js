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

/* Filter out any attributes. Just set enabled to false to exclude them from
 * results. */
const ATTRIBUTE_FILTER = {
    bodies: [
        {
            name: 'Base White', /* 54.93% */
            enabled: true,
        },
        {
            name: 'Base Green', /* 25.48% */
            enabled: true,
        },
        {
            name: 'Base Blue', /* 9.78% */
            enabled: true,
        },
        {
            name: 'Base Purple', /* 6.03% */
            enabled: true,
        },
        {
            name: 'Base Orange', /* 2.96% */
            enabled: true,
        },
        {
            name: 'Base Rainbow', /* 0.82% */
            enabled: true,
        },
    ],
    backgrounds: [
        {
            name: 'Cauldron',
            enabled: true,
        },
        {
            name: 'Fence',
            enabled: true,
        },
        {
            name: 'Lantern',
            enabled: true,
        },
        {
            name: 'Tombstone Bat',
            enabled: true,
        },
        {
            name: 'Cross',
            enabled: true,
        },
        {
            name: 'Full Moon',
            enabled: true,
        },
        {
            name: 'Half Moon',
            enabled: true,
        },
        {
            name: 'Sun Sky',
            enabled: true,
        },
        {
            name: 'Underworld',
            enabled: true,
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
            enabled: true,
        },
        {
            name: 'Flat',
            enabled: true,
        },
        {
            name: 'Frown',
            enabled: true,
        },
        {
            name: 'Circle',
            enabled: true,
        },
        {
            name: 'Lipstick',
            enabled: true,
        },
        {
            name: 'Kissing',
            enabled: true,
        },
        {
            name: 'Stache',
            enabled: true,
        },
        {
            name: 'Pucker',
            enabled: true,
        },
        {
            name: 'Shy Guy',
            enabled: true,
        },
        {
            name: 'Tongue',
            enabled: true,
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
            enabled: true,
        },
        {
            name: 'Straw Hat',
            enabled: true,
        },
        {
            name: 'Ninja Black',
            enabled: true,
        },
        {
            name: 'Heart Band',
            enabled: true,
        },
        {
            name: 'Pomp',
            enabled: true,
        },
        {
            name: 'Clown',
            enabled: true,
        },
        {
            name: 'Cat Ears Brown',
            enabled: true,
        },
        {
            name: 'Baseball Hat Red',
            enabled: true,
        },
        {
            name: 'Baseball Hat Sol',
            enabled: true,
        },
        {
            name: 'Black Beanie',
            enabled: true,
        },
        {
            name: 'Wizard',
            enabled: true,
        },
        {
            name: 'Ninja Red',
            enabled: true,
        },
        {
            name: 'Emo',
            enabled: true,
        },
        {
            name: 'Baseball Hat Blue',
            enabled: true,
        },
        {
            name: 'Pol',
            enabled: true,
        },
        {
            name: 'Baseball Hat Green',
            enabled: true,
        },
        {
            name: 'Cowboy',
            enabled: true,
        },
        {
            name: 'Baseball Hat Heart',
            enabled: true,
        },
        {
            name: 'Bit Phones',
            enabled: true,
        },
        {
            name: 'Cat Ears Synth',
            enabled: true,
        },
        {
            name: 'Queen',
            enabled: true,
        },
        {
            name: 'Frog',
            enabled: true,
        },
        {
            name: 'Santa Beanie',
            enabled: true,
        },
        {
            name: 'Synth Horn',
            enabled: true,
        },
        {
            name: 'Crown',
            enabled: true,
        },
        {
            name: 'Chef Hat',
            enabled: true,
        },
        {
            name: 'Blue Arrow',
            enabled: true,
        },
        {
            name: 'Miner',
            enabled: true,
        },
        {
            name: 'Ora',
            enabled: true,
        },
        {
            name: 'Pirate',
            enabled: true,
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
            enabled: true,
        },
        {
            name: 'Ice Cream Cone Strawberry',
            enabled: true,
        },
        {
            name: 'Broom',
            enabled: true,
        },
        {
            name: 'Spatula',
            enabled: true,
        },
        {
            name: 'Wand',
            enabled: true,
        },
        {
            name: 'Knife',
            enabled: true,
        },
        {
            name: 'Pickaxe Gold',
            enabled: true,
        },
        {
            name: 'Ice Cream Cone Mint',
            enabled: true,
        },
        {
            name: 'Pirate Hook',
            enabled: true,
        },
        {
            name: 'Green Saber',
            enabled: true,
        },
        {
            name: 'Blue Saber',
            enabled: true,
        },
        {
            name: 'Pickaxe Diamond',
            enabled: true,
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
            enabled: true,
        },
        {
            name: 'Red Saber',
            enabled: true,
        },
        {
            name: 'Boxing Gloves',
            enabled: true,
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
            enabled: true,
        },
        {
            name: 'Hipster Blue',
            enabled: true,
        },
        {
            name: 'Hipster Red',
            enabled: true,
        },
        {
            name: 'Deal With It',
            enabled: true,
        },
        {
            name: 'Round Glasses',
            enabled: true,
        },
        {
            name: 'Shades',
            enabled: true,
        },
        {
            name: 'Eye Patch',
            enabled: true,
        },
        {
            name: 'Sans',
            enabled: true,
        },
        {
            name: 'Monacle',
            enabled: true,
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
            enabled: true,
        },
        {
            name: 'Black',
            enabled: true,
        },
        {
            name: 'Black Left Wink',
            enabled: true,
        },
        {
            name: 'Happy',
            enabled: true,
        },
        {
            name: 'Black Wide',
            enabled: true,
        },
        {
            name: 'Blue Eyeshadow',
            enabled: true,
        },
        {
            name: 'Red',
            enabled: true,
        },
        {
            name: 'Purple Eyeshadow',
            enabled: true,
        },
        {
            name: 'Sleep',
            enabled: true,
        },
        {
            name: 'Red Dot',
            enabled: true,
        },
    ],
    cheeks: [
        {
            name: 'Pink',
            enabled: true,
        },
        {
            name: 'Red',
            enabled: true,
        },
        {
            name: 'Crying',
            enabled: true,
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

                    if (removed.length > 0) {
                        console.log(colors.red(`${removed.length} listings sold/delisted`));
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
