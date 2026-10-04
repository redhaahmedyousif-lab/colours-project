import { jarSvg } from '../components/jar.js?v=muu366i1';
import { sceneSvg } from '../components/scenes.js?v=muu366i1';
import { project as artProject } from './art.js?v=muu366i1';
import { project as tasteProject } from './taste.js?v=muu366i1';
import { project as blogProject } from './blog.js?v=muu366i1';

export const pillars = [
  {
    emoji: '🏺',
    title: 'Culture & identity',
    tint: 'color-mix(in oklab, #9a5b34 18%, transparent)',
    accent: '#9a5b34',
    text: 'Colours hold memories. They connect us to the land, our crafts and our celebrations, and pass our heritage from one generation to the next.',
    points: [
      'The red and white of the Bahraini flag',
      "Earthy clay of A'ali pottery",
      'Gold and bright fabrics during Eid',
    ],
  },
  {
    emoji: '🧠',
    title: 'Mood & mind',
    tint: 'color-mix(in oklab, #0f766e 18%, transparent)',
    accent: '#0f766e',
    text: 'Colour psychology suggests that colours can calm, energise or comfort us. Warm tones feel cosy and lively; cool tones feel peaceful and fresh.',
    points: ['Blue and green tend to feel calm', 'Red raises energy and urgency', 'Brown feels grounded and safe'],
  },
  {
    emoji: '🍽️',
    title: 'Daily life',
    tint: 'color-mix(in oklab, #2563eb 16%, transparent)',
    accent: '#2563eb',
    text: 'From food packaging to traffic lights, colour guides our choices every day — often before we have even noticed it.',
    points: ['We “taste” with our eyes first', 'Signs use colour to keep us safe', 'Brands choose colours to make us feel something'],
  },
];

export const colourMeanings = [
  {
    id: 'red',
    name: 'Red',
    hex: '#ce1126',
    mood: 'bold & energetic',
    culture:
      'Red fills most of the flag of Bahrain, separated from the white by a serrated band. It is a colour of pride, national celebration and courage.',
    psychology: 'Red grabs attention and raises energy. It can feel exciting and passionate, but also urgent — which is why it is used for warnings.',
    spot: ['National Day flags', 'Stop signs', 'Pomegranates in the souq', 'Henna patterns'],
  },
  {
    id: 'white',
    name: 'Pearl White',
    hex: '#f4efe6',
    mood: 'pure & peaceful',
    culture:
      "White on the flag stands for peace. It echoes Bahrain's pearling history and the crisp white thobes worn to stay cool in the summer heat.",
    psychology: 'White feels clean, open and calm. It gives the eye space to rest and makes other colours look brighter.',
    spot: ['Thobes', 'Pearls', 'Mosque domes', 'Old coral-stone houses'],
  },
  {
    id: 'emerald',
    name: 'Emerald',
    hex: '#0f766e',
    mood: 'fresh & hopeful',
    culture:
      'Green is linked to life in a desert land: palm groves, springs and oases. It is also widely associated with Islam and with renewal.',
    psychology: 'Green is the colour of balance and growth. People often find it restful, refreshing and reassuring.',
    spot: ['Palm groves', 'Glazed pottery', 'Mosque details', 'Fresh herbs at the market'],
  },
  {
    id: 'brown',
    name: 'Warm Brown',
    hex: '#9a5b34',
    mood: 'warm & grounded',
    culture:
      "Brown is the colour of the earth itself — the clay shaped by the potters of A'ali, dates from our palm trees and the traditional dhow boats.",
    psychology: 'Brown feels stable, natural and dependable. It creates a sense of comfort, honesty and belonging.',
    spot: ["A'ali pottery", 'Dates', 'Wooden dhows', 'Fort walls'],
  },
  {
    id: 'sea',
    name: 'Gulf Turquoise',
    hex: '#0e9fb3',
    mood: 'calm & free',
    culture:
      'As an island nation, Bahrain has always been shaped by the sea. The turquoise shallows tell the story of fishing, trade and pearl diving.',
    psychology: 'Turquoise mixes the calm of blue with the freshness of green. It suggests clarity, openness and escape.',
    spot: ['The Gulf coast', 'Sandbars at low tide', 'Tile work', 'Fishing boats'],
  },
  {
    id: 'gold',
    name: 'Desert Gold',
    hex: '#d4a017',
    mood: 'joyful & generous',
    culture:
      'Gold glows in the jewellery shops of the souq and in the colours of the desert at sunset. It is a colour of celebration, weddings and hospitality.',
    psychology: 'Golden yellow feels optimistic, warm and welcoming. It is linked with success and special occasions.',
    spot: ['Gold Souq', 'Sunset over the desert', 'Saffron and spices', 'Eid decorations'],
  },
];

const tasteArt = `
  <svg viewBox="0 0 400 210" class="h-full w-full" aria-hidden="true">
    <ellipse cx="160" cy="130" rx="105" ry="45" fill="#fff" opacity=".95"/>
    <ellipse cx="160" cy="126" rx="80" ry="32" fill="#e7e5e4"/>
    <g fill="#2563eb">
      ${Array.from({ length: 46 }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const r = 6 + (i % 9) * 6.5;
        return `<ellipse cx="${(160 + Math.cos(a) * r).toFixed(1)}" cy="${(120 + Math.sin(a) * r * 0.38).toFixed(1)}" rx="5" ry="2.4" transform="rotate(${(i * 23) % 180} ${(160 + Math.cos(a) * r).toFixed(1)} ${(120 + Math.sin(a) * r * 0.38).toFixed(1)})" opacity="${0.75 + (i % 3) * 0.1}"/>`;
      }).join('')}
    </g>
    <path d="M285 50 h50 l-6 120 h-38 z" fill="#fff" opacity=".35"/>
    <path d="M289 85 h42 l-4 85 h-34 z" fill="#22c55e"/>
    <ellipse cx="310" cy="85" rx="21" ry="4" fill="#4ade80"/>
  </svg>`;

export const projects = [
  {
    path: '/art',
    kicker: 'Art presentation',
    title: artProject.title,
    text: 'A traditional A’ali pottery jar drawn as a symbol of Bahraini heritage: its deep browns and warm oranges, and the calm, rooted feelings they bring.',
    tags: ['Heritage', 'Colour psychology', 'Presentation'],
    gradient: 'linear-gradient(135deg,#064e3b,#0f766e 45%,#c98b5e)',
    art: `<div class="flex h-full items-end justify-center pt-6">${jarSvg({ className: 'h-[92%] drop-shadow-2xl' })}</div>`,
  },
  {
    path: '/taste',
    kicker: 'Experiment & results',
    title: tasteProject.title,
    text: 'Blue rice? Green milk? Orange pancakes? Five foods changed colour to test whether what we see changes what we taste. See the reactions and results.',
    tags: ['Experiment', 'Data', 'Senses'],
    gradient: 'linear-gradient(135deg,#1e3a8a,#2563eb 50%,#22c55e)',
    art: tasteArt,
  },
  {
    path: '/blog',
    kicker: 'Community blog',
    title: blogProject.title,
    text: 'Bab Al Bahrain glowing under the night sky, plus more colourful places across Bahrain and how they make us feel. Leave your own comments.',
    tags: ['Photography', 'Places', 'Comments'],
    gradient: 'linear-gradient(135deg,#020617,#1e1b4b)',
    art: sceneSvg('gateNight'),
  },
];
