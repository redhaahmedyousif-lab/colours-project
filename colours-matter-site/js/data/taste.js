/**
 * Project 2 data.
 *
 * `isSampleData: true` shows a notice that the log contains example entries.
 * Replace `entries` with the real reactions you recorded, then set it to false.
 */
export const isSampleData = true;

/** Project 2 statement (final bilingual text). */
export const project = {
  title: "Colour & Taste Experiment",
  en: "We conducted an interactive sensory experiment to investigate if colour changes taste perception. We altered the colours of five foods, such as blue rice and green milk, and recorded people's reactions. The most surprising result was the blue rice; my brother stated it looked like paint and initially hesitated to taste it! Meanwhile, orange-tinted pancakes were perceived as sweeter than normal ones. This proves that the human brain relies heavily on visual colour cues before taste buds even process the chemical reality.",
  ar: "قمنا بتنفيذ تجربة حسية وعلمية تفاعلية دقيقة لاختبار ما إذا كان للبصر سلطان على حاسة التذوق. تمثلت المنهجية في تغيير ألوان خمسة أطعمة ومشروبات مختلفة باستخدام ملونات معتمدة (مثل الأرز الأزرق والحليب الأخضر)، ثم طلبنا من أفراد العائلة والأصدقاء تذوقها وتسجيل ردود أفعالهم الفورية. كانت النتيجة الأكثر إثارة للدهشة هي 'الأرز الأزرق'؛ حيث أكد أخي بتعجب أنه يبدو وكأنه طلاء، وتردد كثيراً قبل أن يقدم على تذوقه رغم تطابق مكوناته! وفي المقابل، وُجِدت الفطائر الملونة بالبرتقال أكثر حلاوة في الإدراك البصري مقارنة بالفطائر العادية. تؤكد هذه التجربة علمياً أن الدماغ البشري يعتمد بشكل رئيسي ومبكر على الإشارات البصرية للألوان قبل أن تبدأ براعم التذوق في معالجة الحقيقة الكيميائية للطعام.",
};

export const foods = [
  {
    id: 'rice',
    short: 'Rice',
    name: 'Blue machboos rice',
    emoji: '🍚',
    natural: '#e8b04a',
    naturalName: 'golden',
    changed: '#2563eb',
    changedName: 'blue',
    note: 'Bahrain’s national dish, cooked with the usual spices — but dyed bright blue.',
  },
  {
    id: 'milk',
    short: 'Milk',
    name: 'Green milk',
    emoji: '🥛',
    natural: '#f8f6f0',
    naturalName: 'white',
    changed: '#22c55e',
    changedName: 'green',
    note: 'Ordinary cold milk with a few drops of green food colouring.',
  },
  {
    id: 'eggs',
    short: 'Eggs',
    name: 'Purple scrambled eggs',
    emoji: '🍳',
    natural: '#f5c842',
    naturalName: 'yellow',
    changed: '#7c3aed',
    changedName: 'purple',
    note: 'Eggs whisked with purple colouring before cooking.',
  },
  {
    id: 'hummus',
    short: 'Hummus',
    name: 'Pink hummus',
    emoji: '🫘',
    natural: '#d9c29a',
    naturalName: 'beige',
    changed: '#ec4899',
    changedName: 'pink',
    note: 'Classic chickpea hummus with no change to the recipe, only the colour.',
  },
  {
    id: 'pancakes',
    short: 'Pancakes',
    name: 'Orange pancakes',
    emoji: '🥞',
    natural: '#e2b36b',
    naturalName: 'golden',
    changed: '#f97316',
    changedName: 'orange',
    note: 'The usual pancake batter, tinted bright orange before cooking.',
  },
];

export const method = [
  'Prepare each food using its normal recipe, so the taste stays exactly the same.',
  'Add a few drops of flavourless food colouring to change only its colour.',
  'Show the food to each tester and ask them to rate how appetising it looks (1–5).',
  'Let them taste it and rate how good it tastes (1–5).',
  'Ask: “Did it taste different from normal?” and record their reaction and words.',
];

export const variables = {
  independent: 'The colour of the food',
  dependent: 'Testers’ ratings and reactions',
  controlled: 'Recipe, portion size, temperature, flavourless colouring',
};

// Example entries — replace with your own observations.
const raw = [
  ['rice', 'Ahmed', 2, 3, 'yes', '😬', 'It looked like paint. I hesitated before tasting it.'],
  ['rice', 'Fatima', 1, 4, 'unsure', '😮', 'Once I closed my eyes it was just normal machboos!'],
  ['rice', 'Yousif', 2, 2, 'yes', '🤢', 'My brain kept telling me it was wrong. Felt less spicy.'],
  ['rice', 'Noor', 3, 4, 'no', '😄', 'Fun colour. Tastes the same as my mum’s.'],
  ['milk', 'Ali', 1, 2, 'yes', '🤢', 'Green milk looks like it has gone off. Tasted sour to me.'],
  ['milk', 'Maryam', 2, 3, 'unsure', '😬', 'I expected mint or pistachio flavour, so it tasted bland.'],
  ['milk', 'Hassan', 2, 4, 'no', '😐', 'Just milk. A bit weird to look at.'],
  ['milk', 'Zainab', 1, 3, 'yes', '😬', 'Hard to drink. It reminded me of pond water.'],
  ['eggs', 'Sara', 1, 2, 'yes', '🤢', 'Purple eggs look rotten. I could only take one bite.'],
  ['eggs', 'Omar', 2, 3, 'unsure', '😮', 'They tasted fine, but I did not want to keep eating.'],
  ['eggs', 'Layla', 1, 2, 'yes', '😬', 'They tasted rubbery even though they were cooked normally.'],
  ['eggs', 'Khalid', 3, 4, 'no', '😄', 'Like something from a cartoon. Same taste.'],
  ['hummus', 'Reem', 4, 4, 'no', '😄', 'Pink is pretty! I thought it had beetroot in it.'],
  ['hummus', 'Abdulla', 3, 4, 'unsure', '😐', 'Maybe a little sweeter? Hard to say.'],
  ['hummus', 'Huda', 4, 5, 'no', '😄', 'Delicious. The colour made it feel special.'],
  ['hummus', 'Jassim', 2, 3, 'yes', '😬', 'Expected a sweet taste, so the garlic surprised me.'],
  ['pancakes', 'Mohammed', 4, 5, 'yes', '😄', 'These taste sweeter than normal pancakes!'],
  ['pancakes', 'Aisha', 4, 4, 'yes', '😄', 'Like orange flavour was added, even though it wasn’t.'],
  ['pancakes', 'Salman', 3, 4, 'unsure', '😐', 'Maybe a little sweeter? The colour looks fun.'],
  ['pancakes', 'Dana', 4, 5, 'yes', '😮', 'Sweeter and fruitier. I would eat these again.'],
];

const start = Date.UTC(2026, 8, 14, 10);
export const entries = raw.map(([food, tester, look, taste, different, reaction, comment], i) => ({
  id: `sample-${i + 1}`,
  food,
  tester,
  look,
  taste,
  different,
  reaction,
  comment,
  createdAt: start + i * 7 * 60 * 1000,
  sample: true,
}));

export const reactions = ['😄', '😐', '😮', '😬', '🤢'];
