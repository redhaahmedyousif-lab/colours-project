export const glazes = [
  {
    id: 'heritage',
    name: 'Heritage',
    body: '#9a5b34',
    band: '#0f766e',
    shade: '#5c3317',
    mood: 'Warm earth meets living green — grounded, proud and hopeful.',
  },
  {
    id: 'natural',
    name: 'Natural clay',
    body: '#b9764a',
    band: '#8a4b26',
    shade: '#6b3b1f',
    mood: 'Unglazed and honest. The raw colour of the land feels calm, humble and timeless.',
  },
  {
    id: 'emerald',
    name: 'Emerald glaze',
    body: '#0f766e',
    band: '#c98b5e',
    shade: '#064e3b',
    mood: 'A rich green glaze feels precious and refreshing, like shade under palm trees.',
  },
  {
    id: 'sea',
    name: 'Gulf blue',
    body: '#0e7490',
    band: '#f4efe6',
    shade: '#164e63',
    mood: 'Cool and calm — a nod to the sea that surrounds our island.',
  },
  {
    id: 'sand',
    name: 'Desert sand',
    body: '#d9b98a',
    band: '#9a5b34',
    shade: '#8a6a3f',
    mood: 'Soft and light. Sandy tones feel peaceful, open and gentle.',
  },
];

export const palette = [
  {
    name: 'Emerald Green',
    hex: '#0f766e',
    role: 'Glaze & decoration',
    mood: ['Calm', 'Hopeful', 'Refreshing'],
    meaning:
      'In a dry climate, green signals water, palm groves and life. It is also strongly associated with Islam, so it carries a feeling of faith, peace and renewal.',
    profile: { Calm: 85, Warmth: 35, Energy: 45 },
  },
  {
    name: 'Warm Brown',
    hex: '#9a5b34',
    role: 'The clay body',
    mood: ['Grounded', 'Safe', 'Honest'],
    meaning:
      'Brown is the clay itself, dug from the earth of Bahrain. It reminds us of home, of hard-working hands and of a tradition passed from parent to child.',
    profile: { Calm: 65, Warmth: 85, Energy: 30 },
  },
  {
    name: 'Terracotta',
    hex: '#c2693e',
    role: 'Fired clay',
    mood: ['Welcoming', 'Lively', 'Rustic'],
    meaning:
      'When clay is fired in the kiln it glows a deeper orange-red. Terracotta feels warm and sociable, like a family gathering.',
    profile: { Calm: 45, Warmth: 90, Energy: 60 },
  },
  {
    name: 'Sand Beige',
    hex: '#e9d8b8',
    role: 'Background & light',
    mood: ['Peaceful', 'Open', 'Soft'],
    meaning:
      'Sandy beige is the colour of the desert and of sun-dried clay before firing. It is gentle and calm, giving the stronger colours room to stand out.',
    profile: { Calm: 80, Warmth: 60, Energy: 20 },
  },
];

export const process = [
  { step: 'Gather', text: 'Potters collect local clay and mix it with water until it is smooth and workable.' },
  { step: 'Shape', text: 'The clay is thrown on a potter’s wheel and shaped by hand into jars, bowls and pots.' },
  { step: 'Dry', text: 'Pieces are left to dry slowly in the sun, turning from dark brown to a pale sandy colour.' },
  { step: 'Fire', text: 'The dried pottery is fired in a hot kiln, which hardens it and deepens its warm colour.' },
  { step: 'Decorate', text: 'Some pieces are painted or glazed — green and blue glazes add shine and colour.' },
];

/** Slides for the presentation viewer. Edit freely to match your talk. */
export const slides = [
  {
    kicker: 'Project 1 · Art Presentation',
    title: "Colours of A'ali",
    body: 'How the colours of a simple clay jar carry the culture, memory and mood of Bahrain.',
    theme: 'linear-gradient(135deg,#064e3b,#0f766e 55%,#c98b5e)',
    visual: 'jar',
  },
  {
    kicker: 'The artwork',
    title: "The A'ali jar",
    body: "A'ali is a village in central Bahrain famous for its pottery workshops. Its clay jars were made to store water and food, and are still crafted by hand today.",
    theme: 'linear-gradient(135deg,#5c3317,#9a5b34)',
    visual: 'jar',
  },
  {
    kicker: 'Colour 1',
    title: 'Warm brown: the earth',
    body: 'The brown of the clay feels grounded, safe and honest. It connects the jar to the land it came from and the hands that made it.',
    theme: 'linear-gradient(135deg,#6b3b1f,#c2693e)',
    visual: 'swatch:#9a5b34',
  },
  {
    kicker: 'Colour 2',
    title: 'Emerald green: life',
    body: 'Green brings to mind palm groves and fresh water in a desert land. It feels calm and hopeful, and is closely linked with faith and renewal.',
    theme: 'linear-gradient(135deg,#064e3b,#0f766e)',
    visual: 'swatch:#0f766e',
  },
  {
    kicker: 'Together',
    title: 'Earth + life = balance',
    body: 'Brown and green appear side by side in nature: soil and leaves, trunk and palm. Together they create harmony and a peaceful, natural mood.',
    theme: 'linear-gradient(90deg,#9a5b34 0 50%,#0f766e 50% 100%)',
    visual: 'pair',
  },
  {
    kicker: 'Impact',
    title: 'Why it matters',
    body: 'When we choose traditional colours, we keep our heritage alive. A colour can remind a whole community of who they are and where they come from.',
    theme: 'linear-gradient(135deg,#1c1917,#44403c)',
    visual: 'jar',
  },
];
