import * as fs from 'fs/promises';
import fetch from 'node-fetch';
import colors from 'colors';
import AbortController from 'abort-controller';

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

let cursors = [
    '',
    "CmQKDwoFcHJpY2USBgiAqNa5BxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixBczcxTFhOVGdNRktGcnNSYm5lcXBHRFZORjdmUURDaXpYZ0pCZlFuM1VEcgwYACAA",
    "CmQKDwoFcHJpY2USBgiArIWZCBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIUFhnS0xkYzM4VW5tTmJxVXhOanJWNnFiaTh3cTEzSGdkUEtraTFEdlpUawwYACAA",
    "CmQKDwoFcHJpY2USBgiAxamjCRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwzZ0JvU0NHVFlZQUVDTnQyUlFiajd5aEt4SDJvdkFzdmlacFNBOXVFNTV1YgwYACAA",
    "CmQKDwoFcHJpY2USBgiA8ouoCRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5d2h3a25GZ0JMVGtVc0wxVnBkc244VG51S0I2cVRHd1NQTUhIYndoNFFZZwwYACAA",
    "CmQKDwoFcHJpY2USBgiA0_e_CRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFNlB2Ym94QzY3WDFYeGluVVdON0dlWnA5cVA5NmNITENUeXpja0tWZnJBQgwYACAA",
    "CmQKDwoFcHJpY2USBgiA16afChJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixDazhteEpxRWVkblg5eGdIWWdGZG53Z1JGYnF3TlhnZFpHUTRjZG1lQzRKdgwYACAA",
    "CmQKDwoFcHJpY2USBgjA9azmChJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixHb2pLS2tTZUpteGlrTkJucThWN1dOR1dwc21hODVNYURxUzFmdUpLdFNWawwYACAA",
    "CmQKDwoFcHJpY2USBgiA29X-ChJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFanRkOEJhbldMdnVCUDNINUpFTFhObzZpWHFaM1k5ckRZRXlKNnpZZTk1bQwYACAA",
    "CmQKDwoFcHJpY2USBgiAvMGWCxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwyODJDYlduYnVpNmYxdUZtN1J5MnFTRDNlRWpzTVVSZ2lpUGh3RW0yTHNiUwwYACAA",
    "CmQKDwoFcHJpY2USBgiAvMGWCxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw2RGo2ajhOTUJieVdVeHJYUWNwSGJFYWpETG1SRXVOc3ZMVHpDcTJhYkY5NgwYACAA",
    "CmQKDwoFcHJpY2USBgiAvMGWCxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw4aHZUc1NTTW9kenpqMlFMaFNoMWplaHVSazVrYXpONDdTZ25KZHg5RDRxZQwYACAA",
    "CmQKDwoFcHJpY2USBgiAvMGWCxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixCTk5VNHQxcE10b1pTdEhwUlBKVzducmtCV1dCa0JWM3RuNTFENTdBdEZ6dAwYACAA",
    "CmQKDwoFcHJpY2USBgiAvMGWCxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixGREhkRlJTSG9MRXZFYmZydVU0blBnOFNVM1ZFcWNzU3h5QUY1UUpKQWhodAwYACAA",
    "CmQKDwoFcHJpY2USBgjA-dvFCxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwzRnJQMm13emp4dGVuVW9rWVZEd3RTWFZkcUhTV2gxbjhhckdmNjRHeXluWgwYACAA",
    "CmQKDwoFcHJpY2USBgiAwPD1CxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixERnFyNVF6V1pjamdkVU4ydDlpejJUWmU1SGRON2ExSnJwaVRpRW5hZUxKUAwYACAA",
    "CmQKDwoFcHJpY2USBgiAodyNDBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw0ZlNFVzhySnhRSlN5UWNhdUdLWFQ4dTNKcHdvaVJ0cENIQkpaOVBEU2llUgwYACAA",
    "CmQKDwoFcHJpY2USBgiAodyNDBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIZGt2RlIzU3g4QUhBOWdYUEV5c3F3MXd4YXhuRzJ4aUxnVXAzWHlBTDZYNgwYACAA",
    "CmQKDwoFcHJpY2USBgiAgsilDBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw0NDkzdDl2QUJTQVRxR2VzeUZzM01aQjVOVFVKc2ZEZW1VZ2NhTlc0NUphUQwYACAA",
    "CmQKDwoFcHJpY2USBgiAgsilDBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixDUkFMemJTYUdqRFZZRUx1dkJwYmliaVNOSDE5WEZHbWVMbVNwOVp4Z1lHZAwYACAA",
    "CmQKDwoFcHJpY2USBgigvri1DBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixCZTVpdDJuUXVjNHh1M2c2NXluUHB3bUpBUUdNZkdCWG02aTQ4SDV5cFBLQQwYACAA",
    "CmQKDwoFcHJpY2USBgiAxJ_VDBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFWTJ6UXhaZVJmTUdhY3haWFJRREpLY0MyU2lwQTFKRzVLcVppQ2hpZTlZawwYACAA",
    "CmMKDwoFcHJpY2USBgiA2ZSADRJMahJzfmRpZ2l0YWxleWVzLXByb2RyNgsSBU9mZmVyIitmTmRYWllmZkRtemdGdkVpd2s1dW5YRjVwc0RZdTVBTk1QTnQ0TVNweEpUDBgAIAA=",
    "CmQKDwoFcHJpY2USBgiAhveEDRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw1eDI2UVkzUFRxVnFGWDF4VlVoSE5wVkhTUkJtUWJmVEJqenFkVXJYZmpETgwYACAA",
    "CmQKDwoFcHJpY2USBgiAhveEDRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5akRZaFpwQnNNUDJtbjNwTEhwRFdZZ283OHVxTHRlZHJzaTUyR05yc210agwYACAA",
    "CmQKDwoFcHJpY2USBgiAhveEDRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixDcEQ4d3dYNWRGcTJ5RGhMWnpnbTlkZXJQM3JZdVpZODFRNHI1eHM1V1VFQgwYACAA",
    "CmQKDwoFcHJpY2USBgiAhveEDRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixGN0FncTFEemc2TUdBV1ZWRG9hUWR5TktQTDJDdkQ1VGhINmh6MUdWU25YcgwYACAA",
    "CmQKDwoFcHJpY2USBgiAhveEDRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIazc1NFpYdHVFeUFTSDhCVUY3a1hVUndqa0pZTDFNTlJGUkNTTFY1Z3lZSgwYACAA",
    "CmQKDwoFcHJpY2USBgiA3cPfDRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIdmt0NDk5OHFYVkExcWtpOE45bjNvYXBEeE1wZ1ZueUJVZXNVUDJkNVNCUwwYACAA",
    "CmQKDwoFcHJpY2USBgiAzP2TDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw0ZHlpWXgxbXNtOG5TejF2UEMxa3N3UG1hbUs1aW9BMnhWeXJ0TnlVWTV5bgwYACAA",
    "CmQKDwoFcHJpY2USBgiAtJC6DhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw4azcxS1JSM1Q5YThkR2hWZWl4dzNNVVQ0TGFBdjczNlRub2dUenN0RGs1RwwYACAA",
    "CmQKDwoFcHJpY2USBgiA78DbDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixGbXRGYUxveVV0RGZaNGc5d1VlbzhzYmdwUFNuYnZNWnRnYlhGWEh0RThUNQwYACAA",
    "CmQKDwoFcHJpY2USBgiA0KzzDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwyOUtLWnZFVE00VFRYaUNBbWV5TnZQNlN4UW5BQmE5cVY5dUpETDlHMmNEbwwYACAA",
    "CmQKDwoFcHJpY2USBgiA0KzzDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw0Z0hXNTFleldwZFk0UlJBSjk0UG43Z1BlY2NDMVV1NGZnejJjZEU3V2tFVgwYACAA",
    "CmQKDwoFcHJpY2USBgiA0KzzDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw2WENEQ0dCMkNrYm9YWlBVVGU3bWtjWjdWR2UxM0dRNDhIaktGWHhzdWdNeQwYACAA",
    "CmQKDwoFcHJpY2USBgiA0KzzDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw3c3lyaG81Z0xzUlROSzViRHB2WHRjbWRxd3c2M0FCWm1CeTNnTGR3YWY2dAwYACAA",
    "CmQKDwoFcHJpY2USBgiA0KzzDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixBZDhiMUt3TWlkUDVzSnZSeEdIaDlTS3dkYzRqYTZjcGI5WnE5VUd4clZ3SAwYACAA",
    "CmQKDwoFcHJpY2USBgiA0KzzDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixDanY1eHd1VFRNQ0xOem1wdHdTZ1NBNERKazNEaTd6WlN5RzJuaXNqM1lmZwwYACAA",
    "CmQKDwoFcHJpY2USBgiA0KzzDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFdVU2U2pEUmNlQm1XazFpTmF6SzRQVkJjamhUZ3hmNmZFUVBxRjRwVW1wcwwYACAA",
    "CmQKDwoFcHJpY2USBgiA0KzzDhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIOUMyRGl0TDY0ZXJiaUdkM1FWTTFheEJlVm53VlFVQ0FjblNUcXc2Z1RXSwwYACAA",
    "CmQKDwoFcHJpY2USBgiA1NvSDxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwzY05ZM0V0SDFZU2lXYVZxaVBCMld1MlhZRlJVTGNQY29Ya2RXTHVaenh1agwYACAA",
    "CmQKDwoFcHJpY2USBgiA8PeLEBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5Q0ZkUU1BTDNGbWs4blZLMVZyOWpuWkVUM2l2MnFDdnl2Y2NQejZKb2hlQwwYACAA",
    "CmQKDwoFcHJpY2USBgiA2IqyEBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5bkhmQ25palljWWZSbkxOdzdDb3BvZ2Q2bUE2OTNWdWpFdVg2bVpxZVJ4ZwwYACAA",
    "CmQKDwoFcHJpY2USBgiAmuLhEBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwzaHp1a2tnYUZQOXp0UVZhQnpRMTV6NTZFWEdxVjZyc2JQMlljZU41Y2oyOAwYACAA",
    "CmQKDwoFcHJpY2USBgiAmuLhEBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixCdnZTeXdFNm5RR0ZERk02QXlIdWZyYUdZbWdmY0Q0R2RIcGN0NHg5WVdzSgwYACAA",
    "CmMKDwoFcHJpY2USBgiAmuLhEBJMahJzfmRpZ2l0YWxleWVzLXByb2RyNgsSBU9mZmVyIitlN2h5UVdkZUtRaUE0cFByNFMzcFh6WENYZ0t3NDdLR2EzSnF0R1MyTGtyDBgAIAA=",
    "CmQKDwoFcHJpY2USBgiAyPuWEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixHQjkxaFBGb2dSQ1c1bWg2bXRpYktGWnhHWmNjb0J0NEViZ29nQ3hDSktnbgwYACAA",
    "CmQKDwoFcHJpY2USBgiAitPGEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw3OTdjdUJuOU1ZNlp2NUdWQUg5c0xVekRaNTRyQ2hZc290VzVKa0hNZGRncAwYACAA",
    "CmQKDwoFcHJpY2USBgiA5JfQEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwya3RMV2RoaEs5eFFaRnptVUh4RWZMSkVWdjZKc1hRVFRIMWJ5UG5nS2VaeAwYACAA",
    "CmQKDwoFcHJpY2USBgiA5JfQEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw0UEhGd0NuSjRIOGk1VFBqc1ZYZFJxNnE0Y2VMQnBoVFloVTNVazhxb2t5eQwYACAA",
    "CmMKDwoFcHJpY2USBgiA5JfQEhJMahJzfmRpZ2l0YWxleWVzLXByb2RyNgsSBU9mZmVyIis1dGZ5alFXNTVEUm1FRDhNZ3htYmZ4dGFWWVNxRHJ3MXhRa1pIRmpoZkpuDBgAIAA=",
    "CmQKDwoFcHJpY2USBgiA5JfQEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw3RzJKaFFlREV5cXBxVU1lUWdoM1ZVeENiTFJzbVdFTVZyZ0NRZHlFWlBkRQwYACAA",
    "CmQKDwoFcHJpY2USBgiA5JfQEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5SHIxNGdVbmlpOU1xY0VwQjJWSEpkM1N4UE1NVGUzeEY5V2RQRDY5RFU4VAwYACAA",
    "CmQKDwoFcHJpY2USBgiA5JfQEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixCQUVLdGpHWkg2RXplNkJmY2RLSGFpeFNKcXZvcEprUHhkRGphVUt2Wkc2VgwYACAA",
    "CmQKDwoFcHJpY2USBgiA5JfQEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixDcW9lRjZ6YUtkTHliWFVFWnZmY0Y3UmN2YVQ1em1BZnpIOVpGakdlMUN2eQwYACAA",
    "CmQKDwoFcHJpY2USBgiA5JfQEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFWEZqS2NVRHNEdlVRM3BiaUV2WmdyTHRMZlFVZ3dxZWQ2aTJDb0ZjRWt4MQwYACAA",
    "CmQKDwoFcHJpY2USBgiA5JfQEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixHS0hWeWZGcXFpaHpKdlV3aFludzY1cTZ0RkRnNlVUclRDZnRMdzR3ZkdRUgwYACAA",
    "CmQKDwoFcHJpY2USBgiA5JfQEhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixKNFF6Z1FGWnk0WlpydEQxcFpiZDUzUHZoYnJFamUzUHBWOWY0NWloYlhyQwwYACAA",
    "CmQKDwoFcHJpY2USBgiAqp7fExJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixHelNMYUVuUWg2cUdtNHhqbkh4MlVmMTFTd0FMemtGNk1iaHg1S3o0cDlzTQwYACAA",
    "CmQKDwoFcHJpY2USBgiAzeGmFBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIS05xY05UejFTTWhiYnlRd1RYOWNOdnc3WmZXM0dHb3ZKVTRCMmtOTEU2cQwYACAA",
    "CmQKDwoFcHJpY2USBgiArs2-FBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5aFRra0pNSm13VEN3YWNvcENyQm1ZUUNRVUg3eGRFakJncGtSaTRVM2tHYwwYACAA",
    "CmQKDwoFcHJpY2USBgiAhZqZFRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw2UDFRc29HcVFHNlU1RWNnR2hWNEVDUzlTVkdkdXJxNXBKaDRIYzhvNkg2ZQwYACAA",
    "CmQKDwoFcHJpY2USBgiAtqv9FRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFMWZMYVRnc1RoQnJYYUszS1BUNFR5N1NnQ1BWUUZKZG9DRTFZOFpWc0paeAwYACAA",
    "CmQKDwoFcHJpY2USBgiA-IKtFhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwzTGZTNmVVZWo3QUpKSlNQR1JVTHRNODlySzNXaER3OUdjNzduRDlSRVI2aAwYACAA",
    "CmQKDwoFcHJpY2USBgiA-IKtFhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw1YzhnM3VWNHRSYVQ5TjIzRzlBNVFienlOV2czc29WemtrbWs2Tk5IYkw1WQwYACAA",
    "CmQKDwoFcHJpY2USBgiA-IKtFhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw3Z3hqZFhGYlJhODI5dERHTXQ5RDluZDVwblNoellLOEZxQWNYR3FxYjFCYQwYACAA",
    "CmQKDwoFcHJpY2USBgiA-IKtFhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5TUZHUkFEWUNVTXVTS1BXblhyUjlMSE5QVmJoTm1WNzNiZmZqS0YzY1JtZgwYACAA",
    "CmQKDwoFcHJpY2USBgiA-IKtFhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixBdTZhNmdpdUtReEthbm9wdmdhSHhrWkZFMVdWN0NpM3hlZ2pnNG1NcVAyMQwYACAA",
    "CmQKDwoFcHJpY2USBgiA-IKtFhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixEZzlKZ2pxYWR0bmRUNzNaczdNZXJKSkxEVFZWQXhMNVNlTGlMZzFDUVBFYwwYACAA",
    "CmQKDwoFcHJpY2USBgiA-IKtFhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixGYXJjYWFSb1A1Wjd6dGtpdDZlZWtlc0c0MUxDRDJNbUtiWEg1UThTeG94VQwYACAA",
    "CmQKDwoFcHJpY2USBgiA-IKtFhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIY2RzVEM2N0xuNVFRTHBiQVNuRks2c0RxbXV2d2N5cXFRb25ZNGR5RHdmdAwYACAA",
    "CmQKDwoFcHJpY2USBgiAutrcFhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIaEVvcDRtaG9Ydkh1Snc4Wmh1b2N0Y3dEM3hlazd3NURIa1RoNVlFcUxtbwwYACAA",
    "CmQKDwoFcHJpY2USBgiAwribGBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw3VnpqTGNpWmp0d3ZSYzRYd0g4RExwU0VrY2c1WWhhVzhrVDNMQ0ZuQkwydAwYACAA",
    "CmQKDwoFcHJpY2USBgiAwribGBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIS1M2OXBOZ2VXakM3Vjc3aHRXSG9QdFJDUTl4WXhmeWZqczFBN2NUUHA1TAwYACAA",
    "CmQKDwoFcHJpY2USBgiAypbaGRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw2TTFDZmROb1lIU25Wb2h6UHRWMXY3QnhhTWlGOEJqUWtrMUVBdU5zeEFvdwwYACAA",
    "CmQKDwoFcHJpY2USBgiAjO6JGhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwzZmNwZ3RzaUN4bVZpQW9BNlhZTXNaeVA4WFZzalMxQmNMc1FDU3pIamZXUQwYACAA",
    "CmQKDwoFcHJpY2USBgiAjO6JGhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw4OVlMdXc3RzEzTnBmTGFtUUFoTFFaUDVYUEVFV21FZThuZkd6NmpHZGFuWgwYACAA",
    "CmQKDwoFcHJpY2USBgiAjO6JGhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixEWVFqdGs2cjhKa294S1kydDl5a3BRNDVQZGZ5cmI3WHdYVFRDTVZxZEx3SAwYACAA",
    "CmQKDwoFcHJpY2USBgiAkJ3pGhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixEOWV4Y2lvWU5MQTJ1M2R5RFc0cDIyY1cxb21GRHlOVHRQa2VCdUhocjZBOAwYACAA",
    "CmQKDwoFcHJpY2USBgiA1qP4GxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIUTZIMWFmNTZRWGJNbnlxYjRZRlk0bkZ1OFRndDZEdlNSU0ZYNVNnalFHZQwYACAA",
    "CmQKDwoFcHJpY2USBgiAoNnmHRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwzc3VZYzRHVzcyNUxWcWp2WE1nNWQ4NlRDcmllMWlFNGk2OG9UTXN3alFYYgwYACAA",
    "CmQKDwoFcHJpY2USBgiAoNnmHRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw3ZExzQW9UTEJ5V3pjbXpQU3d2RkdKVUg2ZzFaS0o4Q1pGdDloQ0FIcnBmVAwYACAA",
    "CmQKDwoFcHJpY2USBgiAoNnmHRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixDWHJUVHoyZW5vWG5QbzF6eVRWSlE0ZXZNWkhFdkphb29mVjNBcm1pOFdiRwwYACAA",
    "CmQKDwoFcHJpY2USBgiAoNnmHRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIaG04UEY5YUJ6akRtQXViWUJUU0dqeVVFWmlrcWY3dW5rcnFHMU1EaVdBUQwYACAA",
    "CmQKDwoFcHJpY2USBgiA7r20IBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIOVFrNXVhaDMyb01yeXRkbnU4akFXUHRUaFVzUWlYRXI4OUNiUjRtOTV6dQwYACAA",
    "CmQKDwoFcHJpY2USBgiAtMTDIRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwzNG1ma2dBb0V1dTRwRlI5UTE4RXVvM0JKcGNpU3NCbldaVExCaDJtc1lXeAwYACAA",
    "CmQKDwoFcHJpY2USBgiAtMTDIRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5RFl1OXZNeUw3c1pHNWt4TUtqVmN3YnpzTVByM1hTdkRtUnBUcDFCRTlBOAwYACAA",
    "CmQKDwoFcHJpY2USBgiAtMTDIRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixGbmZBRHN1RGpUeFJKcmR1UW9LYVZKOVR6RTZ3b1FGTDVSbnNRNTVMN3IzdAwYACAA",
    "CmQKDwoFcHJpY2USBgiA_vmxIxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFTlVCVnNFcjVXM1VZd3hqMURxNmZScWMxRldmUWhIRTJrcjVueXdEcWRRZQwYACAA",
    "CmQKDwoFcHJpY2USBgiAhtjwJBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5ZHhjd3NyUjd0QUpVOFZ5NzZLZ1dmckNMd2RRRzhxVHBOVVlrUzFSMWd3MgwYACAA",
    "CmQKDwoFcHJpY2USBgiAyK-gJRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwyd21TeTY5cTNNSmtkUmhqb2t3cnVuYXFWWUo0NGVBZXZ6WXRqNkUxZ05GUAwYACAA",
    "CmQKDwoFcHJpY2USBgiAyK-gJRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw1bjJYSHdwYjRyZ1ptblFia1lLTUJ4RUprY1pRcXVxRTl2VlRtTmF4cVZtegwYACAA",
    "CmQKDwoFcHJpY2USBgiAyK-gJRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw3Uml6YTlmaDcxQXhobUZuRnhCanlEZFhBc0VWUkpMbVFzRnRXSjRnZ2JkMgwYACAA",
    "CmQKDwoFcHJpY2USBgiAyK-gJRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw5Q3F2S3pINXV2Z0VGeGFWOXdHU1c2ZjhkYzhacDlKS1c3bkFkVkFZbW16ZgwYACAA",
    "CmQKDwoFcHJpY2USBgiAyK-gJRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixBZFplbWJ0ck5QYlBNVHJ5RFBla3JnNmFFaVc4a0p5Q2VXWjFVV2Q4U2VMegwYACAA",
    "CmQKDwoFcHJpY2USBgiAyK-gJRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixEYzgxRjNCZFJqVnd6UENXczlHVnJ4R29MYkw1UTdNMlZvWVFoVEtWbkpBQQwYACAA",
    "CmQKDwoFcHJpY2USBgiAyK-gJRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixGYjNBTGN4bnBwdXlpM3E4dGNCZ3BmY1ZvMWhNQ243a2lEOGtQSmphOXlhMwwYACAA",
    "CmQKDwoFcHJpY2USBgiAyK-gJRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIbmZ0RUdmcmVldkZ6WUxIanFNTE03aUhUNm5BZGtkNVNDUXViQjNuUDc0QQwYACAA",
    "CmQKDwoFcHJpY2USBgiA3Jr9KBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwyWG1rVXU3RUNnbTNXVDcxcVhFU3lobXFSYlpLRXNyZ2c2ZzdUV3BlUGlpeAwYACAA",
    "CmQKDwoFcHJpY2USBgiA3Jr9KBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixGQVBSRDU4dmd4OHZ0Unl1V3drS2lDZzRDejg0amE5MmFpQ3dFM0Fva0N4UAwYACAA",
    "CmQKDwoFcHJpY2USBgiA8IXaLBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw2bVprVWI4RVVwQVRVNTFTZVNjZGExWmMxYWJ0TktXRThNa0NUVjl6S3ZrMQwYACAA",
    "CmQKDwoFcHJpY2USBgiA8IXaLBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixDVjVmWThLVGplS0Q5UEJZenlOOEtzVnUyNWZUWmtFMmh0ZFUySGR2MmZlYwwYACAA",
    "CmMKDwoFcHJpY2USBgiAgMLXLxJMahJzfmRpZ2l0YWxleWVzLXByb2RyNgsSBU9mZmVyIitpSmZEU0RXajdwN3htV1FQaFVZTmFUTEdKWUxKckxQZkhDd0V0QnlvSkh3DBgAIAA=",
    "CmQKDwoFcHJpY2USBgiAmNyTNBJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixCSjhOS3JlNzV1OWlBR1dYQzhXMVdabk14R05TVmVVRVJZU0xRUGNWMWFRQwwYACAA",
    "CmMKDwoFcHJpY2USBgiA_-TrNxJMahJzfmRpZ2l0YWxleWVzLXByb2RyNgsSBU9mZmVyIitIc2lFNDhrM3hqUkZZTDR1WU5jQjllNmFYWW53Q0g2TGN4R3VqOVJkTmZnDBgAIAA=",
    "CmQKDwoFcHJpY2USBgiArMfwNxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw3dkY5QlF6Rm53eEwzVDVHSEtzamRraGhpNWR6Y3ozZFUybjRlNFlzNENmdwwYACAA",
    "CmQKDwoFcHJpY2USBgiArMfwNxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixEZXJ2QVdjdUVITDRKaVhBa2kxNTNLbmlZN05KeVJOb1V4OXBVdjdQemlkYwwYACAA",
    "CmMKDwoFcHJpY2USBgiArMfwNxJMahJzfmRpZ2l0YWxleWVzLXByb2RyNgsSBU9mZmVyIitkQ0FkWW9HZnlQZXB4UmdGZzRrTEZwc1NXSFBIZWpZRm9iUW8yZHQxZ29hDBgAIAA=",
    "CmQKDwoFcHJpY2USBgiAwLLNOxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixHdlJGZmJlQVE0Y3U3UG52NkdUMlQzelZZNGN0WGNwZzh1cWVZbXdjVVFjWAwYACAA",
    "CmQKDwoFcHJpY2USBgiA1J2qPxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw4VVF4UVd6MWJ0SHJaaFIxWUhEeEFTS3NTeERMdFYxU2FMQXkxcUpKWjNiYQwYACAA",
    "CmQKDwoFcHJpY2USBgiA_PPjRhJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwyUjhKRnZhZzFFRGFaZDk3ZmVVeHlQdWJZakJ3YTFUTm55Q21DWmpuSnlZbgwYACAA",
    "CmQKDwoFcHJpY2USBgiAjLDhSRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFSE01WXgxZEZMb1lFZEt1bkc0Z3JWdjNCQWJubUgyeEVTNXV1a0VzUnl4ZgwYACAA",
    "CmMKDwoFcHJpY2USBgiAkN_AShJMahJzfmRpZ2l0YWxleWVzLXByb2RyNgsSBU9mZmVyIis1VkNBcEJTTVRVS0Z0ZmVVMW40ZjZlSFBVQnNibWE3c0dTbjdweXUzNTFIDBgAIAA=",
    "CmQKDwoFcHJpY2USBgiAkN_AShJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw4ZDN0aEtYem85bXJIelVMZkMyb0dLN1B3ZkY1QmZpR1NBMmRmUXZRY2FkRQwYACAA",
    "CmQKDwoFcHJpY2USBgiAkN_AShJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFZkpyODVaSlFiN3M4c3ZaR251Y0FocFdnenRYMTRWakIza3dIYnhlR2JkYQwYACAA",
    "CmQKDwoFcHJpY2USBgiAkN_AShJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixKM0RIZ2JvVU15Tk54QjNiUTdGWDh3ajlNNjNzZWI0UEpTcmZWY203U0poNQwYACAA",
    "CmQKDwoFcHJpY2USBgiAuLX6URJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixGMzhDZVo1U1BIbnNVWjdRVjFyc05oaVdpYjZ5eFJWVGVBR2ExU1hlelh5VgwYACAA",
    "CmQKDwoFcHJpY2USBgiA9PaQXRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiwyS1g2dFB6bXhUMmRrNXNKa3pucW1tOTRhRUE3b21LVEZydDM1Q25rcWFibgwYACAA",
    "CmQKDwoFcHJpY2USBgiA9PaQXRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixBVk1IRUZXSDdrRld3OGd5aWlMWFFSbWM2R1N4YkhTb3YxZUFRdWtuV29ZVgwYACAA",
    "CmQKDwoFcHJpY2USBgiA9PaQXRJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixIdFhhNHhNMnNMajNlejR0SjVSbTFBVW8yMlJhN2c1a1pVd2JRYmNWM2ZDNwwYACAA",
    "CmMKDwoFcHJpY2USBgiAsLinaBJMahJzfmRpZ2l0YWxleWVzLXByb2RyNgsSBU9mZmVyIithYno3TWVvZTVpYThUdERFYXpRTnE5ekVUOUo0YkgzVUxTZDNWNndpNGk4DBgAIAA=",
    "CmQKDwoFcHJpY2USBgiA2I7hbxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIiw2bkdrTnpnMmNCOU1CeE1zaTJ5REFIWmsxcHFVZTNGWGc2Nkt2R3NvMlV4ZQwYACAA",
    "CmQKDwoFcHJpY2USBgiA2I7hbxJNahJzfmRpZ2l0YWxleWVzLXByb2RyNwsSBU9mZmVyIixFYnJTamoxWkNVSmFTekU2cUh3a1ZFVmNVR1lHa3A5UGZKS2NaQThNUzgzTQwYACAA",
    "CmUKEAoFcHJpY2USBwiAvKaxggESTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsMnB3c0c0OGpmZHpWeDE5MndKOTlkWU4yN29zdG9kTkpGYUhQdlROMXJvUkIMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiAoL6BlQESTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsN3lrVHl4dFlHUnpZaGJyc0Y4d3N3b3NCdXdTbkd1aDVTb1lmb1BtVVB4WWEMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiA1ILFtgESTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsMlFxUjZ4VmhRUHFkc3lmVVF4TUpNY0I3QlJ2WFRVczNNTkR0MUo3VXlxVTMMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiA6O2hugESTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsNmlFTW5IU2VxaTdDekUxM2lFZU56QTl1WmVLajNSeEY5OERaTWc0UWlQNjYMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiA6O2hugESTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsRjdVS3I0Q0RHY3NlcVFMV1lic3VrWkVITmlDS0phc3FTYVJrcExqaHdkRnoMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiAsJ3C3wESTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsQUh1aEViaGM4WTlRZlZTcVlMTEtaREZnY2I1MkxjWFZydzNRRjlOSm9SQXgMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiA-MzihAISTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsN1RZM2FLZWQ4amhmbW9GOGIyZnR3bk1iNWhnU3BjbnFzaEFxQnVabkRpTmoMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiA6NK8sQISTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsQWZFdG5ySzhLYTNmTWJOblNYYUR1REE2N1FSVGVXbUI4Ykw2UFVLWlhadDQMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiAo_m-9AISTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsQm01RnR0RDNxR1lYRmZwRkRwWndKclpuc0JMVnB3U3llRzNaQWphNGdhRDMMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiA0NvD9AISTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsQ0o5VGRRelNqWWtMOG80N1ozdFJOQ21mQ0d5UUw4OFdBYVpTNWpQdkNLdXIMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiA4LqEvwMSTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsR3dhQlVrcXNmWEU1b2oxcFFjZWNXNTRaSkRETTl0Q2hHNFJuR2ZxOHptZDgMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiAuMnlrgQSTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsSFVSM3F3TWcyeUt1b1I5SExqYWc5UFZaU3VWMmg0RXdqVGFhUjVqTWh4bWoMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiAlK6YxgYSTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsOTJvdkNRUkJEMUpFVlF3MlZRaDhraUdtRVNVaWR1OXM1c055MXU1NjgxV0UMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiAhOPC2AkSTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsNEs2NnRkRGEyMmNYRTh0aXR4eHRtSjFLdG1vVHFyQTZwd1BTY2dtV0xoZFUMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiAkMrSxg4STWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsNjJVYzI4UVpXYjlGUGZzVnQ3V3BqUFdOWDRxQ3VBWm9RQlBEclFSZ0ZOZXkMGAAgAA==",
    "CmUKEAoFcHJpY2USBwiA0LjhmBoSTWoSc35kaWdpdGFsZXllcy1wcm9kcjcLEgVPZmZlciIsRnNHS1JHdm1TV3FwQjN6Y29uSnF3TXBKTVlWNURVUUd5dk0ybUJ1aUdOdkgMGAAgAA=="
]

async function fetchCursors() {
    let cursor = '';

    let json;

    const results = [];

    while (true) {
        const data = await fetch(url + `&cursor=${cursor}`);
        json = await data.json();

        if (!json.offers) {
            break;
        }

        if (json.next_cursor) {
            cursor = json.next_cursor;
            results.push(cursor);
        } else {
            break;
        }

        if (DEBUG) {
            console.log((json.offers[0].price / decimals).toFixed(2) + ' SOL');
        }
    }

    if (DEBUG) {
        console.log(JSON.stringify(results, null, 4));
    }

    return results;
}

async function fetchCatalogue() {
    if (DEBUG) {
        console.log('Fetching catalogue');
    }

    const promises = [];

    for (const cursor of cursors) {
        let timeout;

        try {
            const controller = new AbortController();

            timeout = setTimeout(() => {
                controller.abort();
            }, 10 * 10000);

            promises.push(fetch(url + `&cursor=${cursor}`, { signal: controller.signal }).then((x) => x.json()));
        } catch (err) {
            console.log('Error downloading catalogue: ' + err.toString());
        } finally {
            clearTimeout(timeout);
        }
    }

    let results = [];

    let floor = 10000 * decimals;

    for (const result of promises) {
        const data = await result;

        
        if (!data || !data.offers) {
            break;
        }

        if (floor > data.price_floor) {
            floor = data.price_floor;
        }

        if (DEBUG) {
            console.log((data.offers[0].price / decimals).toFixed(2) + ' SOL');
        }

        results = results.concat(data.offers);
    }

    if (DEBUG) {
        console.log(`Finished fetching catalogue, collected ${results.length} offers`);
    }

    return {
        offers: results,
        price_floor: floor,
    };
}

async function cursorRefresh() {
    if (DEBUG) {
        console.log('Fetching cursors');
    }

    const tmpCursors = await fetchCursors();

    if (DEBUG) {
        console.log(`Got ${tmpCursors.length} new cursors`);
    }

    if (tmpCursors.length > 0) {
        cursors = tmpCursors;
    }

    await cursorRefresh();
}

async function main() {
    const rarity = await createRarityMap();

    let previousResults = [];

    cursorRefresh();

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
