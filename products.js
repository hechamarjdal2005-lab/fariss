/* ============================================================================
   FARISS MODE — PRODUCT DATA
   ----------------------------------------------------------------------------
   Single source of truth for the whole catalogue. Every page (home, shop,
   quick view, cart) reads from FM.PRODUCTS, so adding a new drop = adding one
   object here. No build step, no CMS.

   TO ADD A PRODUCT: copy a block, keep every key.
   Images: Unsplash CDN URLs with on-the-fly sizing (`?w=600&h=750&...`).
   Portrait crops, they sit cleanly in the white-and-green system. To swap in a
   real product photo, just replace `img` — the layout does not care about the
   source, only that it loads.
   ========================================================================= */

var FM = window.FM || {};

/* shop settings — edit here, everything else follows */
FM.config = {
  storeName: 'FARISS MODE',
  phone: '06 27 00 18 98',
  phoneIntl: '212627001898',
  whatsappBase: 'https://wa.me/212627001898',
  instagram: 'fariss_mode',
  address: 'Nassim A, Sidi Moumen, Casablanca 20400',
  currency: 'DH',
  shippingFlat: 30,      // DH
  freeShippingOver: 1000 // DH — order total above this ships free
};

/* categories drive the homepage cards + shop filters */
FM.categories = [
  { id: 'tees',      name: 'T-Shirts & Hoodies',        short: 'T-Shirts',  img: 'https://images.unsplash.com/photo-1773525912457-6a7278efb9e4?w=700&h=900&q=80&fm=jpg&fit=crop' },
  { id: 'pants',     name: 'Pantalons & Cargos',        short: 'Cargos',    img: 'https://images.unsplash.com/photo-1715758889706-08aef3e1df84?w=700&h=900&q=80&fm=jpg&fit=crop' },
  { id: 'sneakers',  name: 'Sneakers',                  short: 'Sneakers',  img: 'https://images.unsplash.com/photo-1678266622946-668ede09af9a?w=700&h=900&q=80&fm=jpg&fit=crop' },
  { id: 'caps',      name: 'Casquettes & Accessoires',  short: 'Caps',      img: 'https://images.unsplash.com/photo-1778161050906-032dff978452?w=700&h=900&q=80&fm=jpg&fit=crop' }
];

/* featured ids for the homepage "Dernier Drop" block (order matters) */
FM.featuredIds = ['p1', 'p2', 'p5', 'p3', 'p4', 'p6'];

/* next drop countdown — rolls forward by 7 days if the date has passed */
FM.dropDate = '2026-10-02T23:00:00+01:00';

FM.products = [
  {
    id: 'p1',
    name: 'Oversized Tee — Night Shift',
    cat: 'tees',
    price: 249,
    oldPrice: null,
    tag: 'new',
    img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    desc: 'Tee coupe large, coton lourd 240g, drop lavé surecuted. Le logo FM au pochoir dans le dos.',
    specs: { Weight: '240 GSM', Cut: 'Oversized', Made: 'Maroc' }
  },
  {
    id: 'p2',
    name: 'Boxy Hoodie — Sidi Moumen',
    cat: 'hoodies',
    price: 549,
    oldPrice: null,
    tag: 'new',
    img: 'https://images.unsplash.com/photo-1499972777470-6a932ea55420?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    desc: 'Hoodie boxy molleton gratté, capuche doublée, impression FM sérigraphiée devant.',
    specs: { Weight: '420 GSM', Cut: 'Boxy', Made: 'Maroc' }
  },
  {
    id: 'p3',
    name: 'Cargo Pant — Concrete',
    cat: 'pants',
    price: 599,
    oldPrice: null,
    tag: null,
    img: 'https://images.unsplash.com/photo-1628847115161-d6793dc59c7f?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['M', 'L', 'XL'],
    desc: 'Cargo 6 poches, tissu resist, cordelette fournie. Le pantalon le plus vendu de la maison.',
    specs: { Weight: '320 GSM', Cut: 'Wide', Made: 'Maroc' }
  },
  {
    id: 'p4',
    name: 'Sneaker — Block 01',
    cat: 'sneakers',
    price: 899,
    oldPrice: null,
    tag: 'limited',
    img: 'https://images.unsplash.com/photo-1567069026129-817983650d0c?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['40', '41', '42', '43', '44', '45'],
    desc: 'Silhouette chunky, semelle gum,/details volt. Pièce en série limitée — 50 paires.',
    specs: { Upper: 'Cuir + mesh', Sole: 'Gum', Run: 'True to size' }
  },
  {
    id: 'p5',
    name: 'Wide Sweat — Bone',
    cat: 'pants',
    price: 349,
    oldPrice: 399,
    tag: 'promo',
    img: 'https://images.unsplash.com/photo-1773747310674-b42a55d72003?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    desc: 'Sweat large taille haute, molleton doux, bord-côtelé. Coloris bone — passe avec tout.',
    specs: { Weight: '380 GSM', Cut: 'Wide', Made: 'Maroc' }
  },
  {
    id: 'p6',
    name: 'Cap — Logo 5 Panel',
    cat: 'caps',
    price: 199,
    oldPrice: null,
    tag: 'new',
    img: 'https://images.unsplash.com/photo-1678721938524-1a3ee398de2a?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['TU'],
    desc: 'Casquette 5 panneaux, logo FM brodé ton sur ton, fermeture arrière réglable.',
    specs: { Material: 'Coton sergé', Closure: 'Réglable', Made: 'Maroc' }
  },
  {
    id: 'p7',
    name: 'Tee — Rift',
    cat: 'tees',
    price: 229,
    oldPrice: null,
    tag: null,
    img: 'https://images.unsplash.com/photo-1716541425103-fcfd4bf88c27?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    desc: 'Tee boxy col rond, sérigraphie FM recto, liseré volt au poignet court.',
    specs: { Weight: '220 GSM', Cut: 'Boxy', Made: 'Maroc' }
  },
  {
    id: 'p8',
    name: 'Zip Hoodie — Alleys',
    cat: 'hoodies',
    price: 649,
    oldPrice: null,
    tag: 'limited',
    img: 'https://images.unsplash.com/photo-1552321649-f66d87409da2?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    desc: 'Hoodie zippé, poches latérales zippées, dos imprimé grand format.',
    specs: { Weight: '400 GSM', Cut: 'Regular', Made: 'Maroc' }
  },
  {
    id: 'p9',
    name: 'Cargo Short — Palmier',
    cat: 'pants',
    price: 449,
    oldPrice: null,
    tag: 'new',
    img: 'https://images.unsplash.com/photo-1568579761197-06154cfaa57c?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['M', 'L', 'XL'],
    desc: 'Cargo court 5 poches, tissu léger pour l été, taille élastiquée arrière.',
    specs: { Weight: '280 GSM', Cut: 'Short', Made: 'Maroc' }
  },
  {
    id: 'p10',
    name: 'Sneaker — Runner Bone',
    cat: 'sneakers',
    price: 1099,
    oldPrice: null,
    tag: 'limited',
    img: 'https://images.unsplash.com/photo-1680204101400-aeac783c9d87?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['40', '41', '42', '43', '44'],
    desc: 'Runner épuré tout bone, lacets volt, semelle translucide. Pièce premium du drop.',
    specs: { Upper: 'Mesh technique', Sole: 'Translucide', Run: 'True to size' }
  },
  {
    id: 'p11',
    name: 'Snapback — Acid',
    cat: 'caps',
    price: 149,
    oldPrice: 199,
    tag: 'promo',
    img: 'https://images.unsplash.com/photo-1768489039458-b499a027fbf3?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['TU'],
    desc: 'Snapback noire avec visière verte acid et logo FM embossé.',
    specs: { Material: 'Coton sergé', Closure: 'Snap', Made: 'Maroc' }
  },
  {
    id: 'p12',
    name: 'Tee — Arabic Grid',
    cat: 'tees',
    price: 259,
    oldPrice: null,
    tag: 'new',
    img: 'https://images.unsplash.com/photo-1775817104298-522393e1d72b?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    desc: 'Grille arabe revisitée en sérigraphie ton sur ton. Pièce la plus demandée du dernier drop.',
    specs: { Weight: '240 GSM', Cut: 'Oversized', Made: 'Maroc' }
  },
  {
    id: 'p13',
    name: 'Crew Fleece — Volt',
    cat: 'hoodies',
    price: 499,
    oldPrice: null,
    tag: null,
    img: 'https://images.unsplash.com/photo-1499971856191-1a420a42b498?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    desc: 'Sweat crew col rond, fleece intérieur, bandes côtelées ton sur ton.',
    specs: { Weight: '340 GSM', Cut: 'Regular', Made: 'Maroc' }
  },
  {
    id: 'p14',
    name: 'Beanie — FM Knit',
    cat: 'caps',
    price: 149,
    oldPrice: null,
    tag: null,
    img: 'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['TU'],
    desc: ' Bonnet mailles serrées, étiquette FM tissée. Chaud et discret.',
    specs: { Material: 'Acrylique', Style: 'Cuffed', Made: 'Maroc' }
  },
  {
    id: 'p15',
    name: 'Low Court — Bone/Volt',
    cat: 'sneakers',
    price: 799,
    oldPrice: null,
    tag: null,
    img: 'https://images.unsplash.com/photo-1718220095476-7916e897fc55?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['40', '41', '42', '43', '44'],
    desc: 'Baskets basse court, cuir blanc cassé, liseré volt sur la latérale.',
    specs: { Upper: 'Cuir', Sole: 'Caoutchouc', Run: 'True to size' }
  },
  {
    id: 'p16',
    name: 'Tee — FM Core',
    cat: 'tees',
    price: 199,
    oldPrice: null,
    tag: null,
    img: 'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&h=750&q=80&fm=jpg&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    desc: 'Le tee essentiel de la maison. Logo FM centré, coupe droite, coton épais.',
    specs: { Weight: '220 GSM', Cut: 'Regular', Made: 'Maroc' }
  }
];

/* --- helpers (also used by cart.js) --------------------------------------- */
FM.byId = function (id) {
  for (var i = 0; i < FM.products.length; i++) {
    if (FM.products[i].id === id) return FM.products[i];
  }
  return null;
};
FM.inCategory = function (cat) {
  return FM.products.filter(function (p) { return p.cat === cat; });
};
/* hoodies belong to the "tees" homepage/shop filter bucket */
FM.catMatches = function (productCat, filterId) {
  if (filterId === 'all') return true;
  if (filterId === 'tees') return productCat === 'tees' || productCat === 'hoodies';
  return productCat === filterId;
};
FM.tagLabel = function (tag) {
  if (tag === 'new') return 'New';
  if (tag === 'limited') return 'Limited';
  if (tag === 'promo') return 'Promo';
  return '';
};
FM.money = function (n) {
  return Number(n).toLocaleString('fr-FR') + ' ' + FM.config.currency;
};
