/**
 * Project 3: colourful places in Bahrain.
 *
 * Each post uses an illustrated `scene`. To use your own photograph instead,
 * put the file in /public/photos and add e.g. `image: './photos/souq.jpg'`.
 */
/** Project 3 feature post. */
export const project = {
  title: "Colour Blog: Bab Al Bahrain at Night",
  postId: 'bab-al-bahrain-night',
};

export const posts = [
  {
    id: 'bab-al-bahrain-night',
    title: "The Grandeur of Bab Al Bahrain at Night",
    location: 'Bab Al Bahrain, Manama',
    scene: 'gateNight',
    image: './photos/bab-al-bahrain-night.jpg',
    width: 1600,
    height: 1059,
    alt: 'Bab Al Bahrain lit with bright white lights at night, with the national flag flying above the gateway',
    // Shown under the photo. The image carries a "Manama Story" watermark, so credit the source.
    credit: 'Photo: Manama Story',
    colours: ['#0b1026', '#f8fafc', '#ce1126', '#fbbf24'],
    mood: ['Proud', 'Tranquil'],
    feeling: "I captured this exceptional photograph of the historical Bab Al Bahrain glowing with bright white lights under the night sky, topped by our majestic national flag. The visual contrast between the dark night and the brilliant illumination over traditional architecture evokes deep feelings of pride and tranquility. These warm lights remind us of the enduring spirit of our capital, reflecting the rich visual identity of our Bahraini community. What do you think of our city's heritage illumination at night? Leave a comment below!",
    description:
      'Bab Al Bahrain is the historic gateway at the entrance to Manama Souq. At night, bright white lights wash over its traditional architecture beneath the national flag.',
    author: 'Class blog',
    date: '2026-10-03',
    likes: 34,
  },
  {
    id: 'manama-souq',
    title: 'Manama Souq',
    location: 'Manama, Capital Governorate',
    scene: 'souq',
    colours: ['#ea580c', '#facc15', '#b91c1c', '#0f766e'],
    mood: ['Energetic', 'Nostalgic'],
    feeling:
      'Walking into the souq feels like stepping inside a painting. Mountains of orange turmeric, red chilli and golden saffron fill the air with colour and scent, and I feel awake and excited.',
    description:
      'The narrow lanes behind Bab Al Bahrain are full of spice stalls, fabric shops, perfumes and sweets. Bright fabrics hang above the shops, and the warm colours make the busy market feel friendly and full of life. It reminds me of visiting with my grandparents.',
    author: 'Class blog',
    date: '2026-09-02',
    likes: 24,
  },
  {
    id: 'pearling-path',
    title: 'The Pearling Path',
    location: 'Muharraq',
    scene: 'houses',
    colours: ['#e8d5b0', '#0f766e', '#1d4ed8', '#b45309'],
    mood: ['Peaceful', 'Curious'],
    feeling:
      'The soft sandy walls are calm and quiet, but then a bright teal or blue wooden door surprises you around every corner. I feel peaceful and curious at the same time.',
    description:
      'A UNESCO World Heritage Site that tells the story of Bahrain’s pearl-diving past. Old coral-stone houses, merchants’ homes and narrow alleys show the natural colours of the island.',
    author: 'Class blog',
    date: '2026-09-09',
    likes: 21,
  },
  {
    id: 'bahrain-fort',
    title: "Qal'at al-Bahrain at sunset",
    location: 'Karbabad, Northern Governorate',
    scene: 'fort',
    colours: ['#4c1d95', '#db2777', '#f97316', '#fbbf24'],
    mood: ['Awe', 'Calm'],
    feeling:
      'As the sun sets, the sky turns purple, pink and orange behind the dark walls. It makes me feel tiny and amazed, thinking about how many sunsets this fort has seen.',
    description:
      'Bahrain Fort sits on an ancient tell that people lived on for thousands of years. It is a UNESCO World Heritage Site and one of the best places to watch the sky change colour over the sea.',
    author: 'Class blog',
    date: '2026-09-13',
    likes: 31,
  },
  {
    id: 'tree-of-life',
    title: 'The Tree of Life',
    location: 'Southern Governorate',
    scene: 'tree',
    colours: ['#15803d', '#e7b46a', '#fb923c', '#57381f'],
    mood: ['Hopeful', 'Amazed'],
    feeling:
      'One green tree in the middle of golden desert feels like a symbol of hope. The contrast between the green and the sand makes the tree look even more alive.',
    description:
      'This lone mesquite tree has survived for hundreds of years in the desert with no obvious water source. Its leafy green crown stands out against the endless sandy browns.',
    author: 'Class blog',
    date: '2026-09-18',
    likes: 27,
  },
  {
    id: 'al-fateh',
    title: 'Al Fateh Grand Mosque',
    location: 'Juffair, Manama',
    scene: 'mosque',
    colours: ['#f5f5f4', '#d6c7a1', '#0369a1', '#ca8a04'],
    mood: ['Peaceful', 'Respectful'],
    feeling:
      'The white marble and soft gold make me feel calm and respectful. Everything is clean and bright, and the space feels peaceful.',
    description:
      'One of the largest mosques in the region, with a huge dome and elegant white walls. The pale colours reflect the sunlight, and visitors are welcomed to learn about Islamic culture.',
    author: 'Class blog',
    date: '2026-09-22',
    likes: 22,
  },
  {
    id: 'jarada',
    title: 'Jarada Island',
    location: 'Off the coast of Muharraq',
    scene: 'sea',
    colours: ['#06b6d4', '#22d3ee', '#fef3c7', '#0891b2'],
    mood: ['Free', 'Joyful'],
    feeling:
      'The turquoise water is so clear and bright that it feels like a holiday. Blue and white together make me feel free, light and happy.',
    description:
      'A small sandbar island that appears at low tide. Its white sand is surrounded by every shade of blue and turquoise, a perfect example of how colour can lift our mood.',
    author: 'Class blog',
    date: '2026-09-27',
    likes: 29,
  },
];

/** Starter comments shown under posts. Visitors' own comments are added on top. */
export const seedComments = {
  'bab-al-bahrain-night': [],
  'manama-souq': [
    { name: 'Maryam', text: 'The spice colours are my favourite part too! It smells amazing.', createdAt: Date.UTC(2026, 8, 3, 15) },
    { name: 'Hamad', text: 'Beautiful description — I can almost smell the saffron. Great use of sensory language.', createdAt: Date.UTC(2026, 8, 4, 9) },
  ],
  'bahrain-fort': [{ name: 'Yousif', text: 'Sunset there is unreal. The purple sky is the best.', createdAt: Date.UTC(2026, 8, 14, 18) }],
  'tree-of-life': [{ name: 'Noor', text: 'I never noticed how the green makes the sand look even more golden.', createdAt: Date.UTC(2026, 8, 19, 12) }],
};
