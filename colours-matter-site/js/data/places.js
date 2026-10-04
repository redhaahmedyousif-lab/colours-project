/**
 * Landmarks on the Bahrain Colour Map. `x`/`y` are positions on the
 * simplified map (viewBox 0 0 320 440). `post` links to a blog post.
 */
export const landmarks = [
  {
    id: 'bab-al-bahrain',
    name: 'Bab Al Bahrain',
    area: 'Manama',
    x: 214,
    y: 60,
    palette: ['#0b1026', '#f8fafc', '#fde68a', '#ce1126', '#f59e0b'],
    mood: 'Proud and tranquil',
    story:
      'At night the historic gateway glows white against a black sky, with the red and white flag above it. Bright light on dark makes the old stone feel grand and calm at the same time.',
    post: 'bab-al-bahrain-night',
  },
  {
    id: 'manama-souq',
    name: 'Manama Souq',
    area: 'Manama',
    x: 194,
    y: 76,
    palette: ['#ea580c', '#facc15', '#b91c1c', '#7c2d12', '#0f766e'],
    mood: 'Energetic and nostalgic',
    story:
      'Turmeric, saffron, chilli and bright fabrics fill the lanes behind the gate. Warm, saturated colours raise energy, which is why the market feels busy, friendly and alive.',
    post: 'manama-souq',
  },
  {
    id: 'al-fateh',
    name: 'Al Fateh Grand Mosque',
    area: 'Juffair',
    x: 230,
    y: 88,
    palette: ['#f5f5f4', '#d6c7a1', '#0369a1', '#ca8a04', '#e7e5e4'],
    mood: 'Peaceful and respectful',
    story:
      'White marble, soft sand and gold under a blue sky. Light, low-contrast colours give the eye space to rest, so the building feels calm and open.',
    post: 'al-fateh',
  },
  {
    id: 'bahrain-fort',
    name: "Qal'at al-Bahrain",
    area: 'Northern coast',
    x: 156,
    y: 52,
    palette: ['#4c1d95', '#db2777', '#f97316', '#fbbf24', '#3b1d2e'],
    mood: 'Awe and calm',
    story:
      'At sunset the sky moves from purple to pink to orange behind the dark walls. Strong contrast between warm light and deep shadow makes visitors feel small and amazed.',
    post: 'bahrain-fort',
  },
  {
    id: 'pearling-path',
    name: 'The Pearling Path',
    area: 'Muharraq',
    x: 258,
    y: 40,
    palette: ['#e8d5b0', '#f1e4c8', '#0f766e', '#1d4ed8', '#b45309'],
    mood: 'Peaceful and curious',
    story:
      'Sandy coral-stone walls are interrupted by bright teal and blue doors. Calm neutrals with small sharp accents make you slow down and look around every corner.',
    post: 'pearling-path',
  },
  {
    id: 'jarada',
    name: 'Jarada Island',
    area: 'Off Muharraq',
    x: 294,
    y: 22,
    palette: ['#06b6d4', '#22d3ee', '#fef3c7', '#0891b2', '#ffffff'],
    mood: 'Free and joyful',
    story:
      'White sand surrounded by every shade of turquoise. Cool, bright colours suggest space and openness, which is why the sandbar feels like freedom.',
    post: 'jarada',
  },
  {
    id: 'aali',
    name: "A'ali pottery",
    area: "A'ali village",
    x: 168,
    y: 150,
    palette: ['#9a5b34', '#c2693e', '#e9d8b8', '#5c3317', '#0f766e'],
    mood: 'Grounded and calm',
    story:
      'Brown clay, kiln-fired orange and sandy beige, with the occasional green glaze. Earth tones feel stable and safe; they connect each jar to the land it came from.',
    route: '#/art',
  },
  {
    id: 'tree-of-life',
    name: 'Tree of Life',
    area: 'Southern desert',
    x: 152,
    y: 330,
    palette: ['#15803d', '#22c55e', '#e7b46a', '#d4973f', '#57381f'],
    mood: 'Hopeful and amazed',
    story:
      'A single green crown above endless golden sand. Green beside warm desert tones looks even more alive, a natural picture of hope and survival.',
    post: 'tree-of-life',
  },
];
