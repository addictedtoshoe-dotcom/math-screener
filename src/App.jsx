import { useState, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// MATH PROFICIENCY BRIDGE & TAPESTRY SCREENER — K-2
// Teacher-administered diagnostic assessment tool
// ═══════════════════════════════════════════════════════════════

// ── DATA: Pillars, Domains, Assessment Items ─────────────────

const PILLARS = [
  { id: "number-sense", name: "Number Sense", short: "NumSense", color: "#C0392B", category: "conceptual" },
  { id: "spatial-reasoning", name: "Spatial Reasoning", short: "Spatial", color: "#E74C3C", category: "conceptual" },
  { id: "pattern-algebraic", name: "Pattern & Algebraic Thinking", short: "Patterns", color: "#D35400", category: "conceptual" },
  { id: "math-reasoning", name: "Mathematical Reasoning", short: "Reasoning", color: "#E67E22", category: "conceptual" },
  { id: "math-language", name: "Mathematical Language", short: "Language", color: "#F39C12", category: "conceptual" },
  { id: "counting-cardinality", name: "Counting & Cardinality", short: "Counting", color: "#2980B9", category: "procedural" },
  { id: "fact-fluency", name: "Fact Fluency", short: "Facts", color: "#3498DB", category: "procedural" },
  { id: "algorithmic", name: "Algorithmic Proficiency", short: "Algorithm", color: "#1ABC9C", category: "procedural" },
  { id: "measurement-data", name: "Measurement & Data", short: "Meas/Data", color: "#16A085", category: "procedural" },
  { id: "fraction-proportional", name: "Fraction & Proportional Fluency", short: "Fractions", color: "#2C3E50", category: "procedural" },
];

const DOMAINS = [
  { id: "numbers", name: "Numbers & Operations", short: "Num&Ops" },
  { id: "algebra", name: "Algebraic Thinking", short: "Algebra" },
  { id: "geometry", name: "Geometry & Spatial", short: "Geometry" },
  { id: "measurement", name: "Measurement & Data", short: "Measure" },
  { id: "ratios", name: "Ratios & Proportions", short: "Ratios" },
  { id: "statistics", name: "Statistics & Probability", short: "Stats" },
];

const GRADE_LEVELS = ["K", "1", "2"];

// Assessment items: each pillar has items tagged by domain and grade
// Score: 3 = proficient, 2 = developing, 1 = emerging, 0 = not yet
const ASSESSMENT_ITEMS = {
  "number-sense": [
    { id: "ns1", grade: "K", domain: "numbers", prompt: "Show the student 5 red counters and 3 blue counters. Ask: 'Which group has more? How do you know?'", look_for: "Student identifies 5 as more; may count or subitize. Look for understanding of 'more than' concept.", proficient: "Immediately identifies more and explains (e.g., '5 is more because it's 2 more than 3')", developing: "Correctly identifies more but cannot explain reasoning", emerging: "Needs to count both groups; may give incorrect answer initially" },
    { id: "ns2", grade: "K", domain: "geometry", prompt: "Place 4 blocks in a row. Ask: 'If I add one more block, will the row be longer or shorter?'", look_for: "Understanding that adding increases quantity/length.", proficient: "Says 'longer' immediately with confidence and can explain why", developing: "Says 'longer' but hesitates or cannot explain", emerging: "Unsure or needs to physically add the block to answer" },
    { id: "ns3", grade: "1", domain: "numbers", prompt: "Show number cards 28, 52, 37. Ask: 'Put these in order from smallest to biggest. How did you decide?'", look_for: "Understands magnitude and place value for ordering two-digit numbers.", proficient: "Orders correctly and references tens place: '28 has 2 tens, 37 has 3 tens...'", developing: "Orders correctly but explains by counting or without place value language", emerging: "Makes errors in ordering; may compare only ones digits" },
    { id: "ns4", grade: "1", domain: "measurement", prompt: "Show a jar with about 20 cubes. Ask: 'About how many cubes are in the jar? Don't count — just estimate.'", look_for: "Reasonable estimation strategy; number sense for quantity without counting.", proficient: "Gives estimate within 5 of actual; describes strategy (e.g., 'I see about 4 groups of 5')", developing: "Gives reasonable estimate but no clear strategy", emerging: "Estimate is far off (e.g., says 100) or insists on counting" },
    { id: "ns5", grade: "2", domain: "numbers", prompt: "Ask: 'I'm thinking of a number between 1 and 100. It's closer to 70 than to 30. Is it bigger or smaller than 50?'", look_for: "Mental number line; relative magnitude understanding.", proficient: "Says 'bigger than 50' quickly and can explain using number line thinking", developing: "Gets correct answer but slowly or with uncertainty", emerging: "Cannot determine; needs physical number line" },
    { id: "ns6", grade: "2", domain: "algebra", prompt: "Show: 45 + __ = 52. Ask: 'What number goes in the blank? How did you figure it out?'", look_for: "Understanding of number relationships; part-whole thinking.", proficient: "Says 7; explains strategy (counted up, or 52-45)", developing: "Gets correct answer but uses slow counting strategy", emerging: "Cannot solve without manipulatives; or gives wrong answer" },
  ],
  "spatial-reasoning": [
    { id: "sr1", grade: "K", domain: "geometry", prompt: "Show 4 shapes: circle, triangle, square, rectangle. Mix orientations. Ask: 'Point to all the triangles.' (Include a rotated triangle.)", look_for: "Can identify shapes regardless of orientation/size.", proficient: "Identifies all triangles including rotated ones; names other shapes correctly", developing: "Identifies standard triangle but misses rotated one", emerging: "Cannot reliably identify triangles; confuses with other shapes" },
    { id: "sr2", grade: "K", domain: "measurement", prompt: "Place a toy behind a box, next to a cup, and under a book. Ask: 'Where is the toy that is BEHIND the box?'", look_for: "Understanding of positional/spatial vocabulary.", proficient: "Correctly identifies all three positions without hesitation", developing: "Gets 2 of 3 positions correct", emerging: "Confused by positional words; points randomly" },
    { id: "sr3", grade: "1", domain: "geometry", prompt: "Show a simple pattern block design (3-4 blocks). Cover it. Ask student to recreate it from memory.", look_for: "Spatial memory and visualization ability.", proficient: "Recreates design accurately from memory on first try", developing: "Gets overall shape right but 1-2 pieces misplaced", emerging: "Cannot recreate; needs to see original again" },
    { id: "sr4", grade: "2", domain: "geometry", prompt: "Show a shape cut in half. Ask: 'If I fold this piece, what shape will it make? Draw what you think.'", look_for: "Mental folding/transformation ability.", proficient: "Correctly predicts and draws the folded shape", developing: "Partially correct prediction; drawing is approximate", emerging: "Cannot predict; needs to physically fold to see" },
    { id: "sr5", grade: "2", domain: "numbers", prompt: "Show a hundred chart with some numbers covered. Ask: 'What number is hidden here? (point to covered square) How do you know?'", look_for: "Spatial understanding of number grid; using patterns to determine position.", proficient: "Identifies number using row/column reasoning", developing: "Counts from nearest visible number to find answer", emerging: "Cannot determine hidden number" },
  ],
  "pattern-algebraic": [
    { id: "pa1", grade: "K", domain: "algebra", prompt: "Create an AB pattern with colored bears: red, blue, red, blue, red, ___. Ask: 'What comes next? How do you know?'", look_for: "Recognizes and extends simple repeating patterns.", proficient: "Extends correctly and articulates the rule: 'It goes red, blue, red, blue'", developing: "Extends correctly but cannot articulate the pattern rule", emerging: "Cannot determine what comes next" },
    { id: "pa2", grade: "K", domain: "numbers", prompt: "Count: 2, 4, 6, 8, ___. Ask: 'What number comes next?'", look_for: "Skip counting pattern recognition.", proficient: "Says 10 and can continue the pattern; recognizes 'counting by 2s'", developing: "Gets 10 but cannot continue or explain pattern", emerging: "Cannot determine next number" },
    { id: "pa3", grade: "1", domain: "algebra", prompt: "Show: 3 + 2 = 5, then 2 + 3 = ___. Ask: 'Can you solve this without counting? What do you notice?'", look_for: "Commutative property recognition.", proficient: "Says 5 immediately; notices 'it's the same numbers just switched'", developing: "Solves correctly but doesn't notice the relationship", emerging: "Recounts from scratch; doesn't see connection" },
    { id: "pa4", grade: "2", domain: "algebra", prompt: "Show: 12 + 5 = 17, 22 + 5 = 27, 32 + 5 = ___. Ask: 'What's the answer? What pattern do you see?'", look_for: "Generalizing addition patterns across place values.", proficient: "Says 37; articulates that 'only the tens change, ones stay the same'", developing: "Gets correct answer but describes pattern vaguely", emerging: "Solves each individually without seeing the pattern" },
    { id: "pa5", grade: "2", domain: "geometry", prompt: "Show a growing pattern with squares: 1 square, then L-shape (3 squares), then plus-shape (5 squares). Ask: 'How many squares in the next shape?'", look_for: "Recognizing growth patterns; adding 2 each time.", proficient: "Predicts 7 and explains the +2 growth rule", developing: "Predicts correctly but by drawing, not recognizing rule", emerging: "Cannot predict next in sequence" },
  ],
  "math-reasoning": [
    { id: "mr1", grade: "K", domain: "numbers", prompt: "Show 3 crackers on a plate. Say: 'I'm going to hide some.' Hide 1 behind your hand. Ask: 'How many am I hiding?'", look_for: "Part-whole reasoning; early deductive thinking.", proficient: "Says 1 immediately; can do this with larger numbers (4-5 total)", developing: "Gets it right for 3 total but struggles with larger sets", emerging: "Guesses; cannot reason about the hidden amount" },
    { id: "mr2", grade: "1", domain: "numbers", prompt: "Say: 'Sam says 5 + 3 = 7. Is Sam right or wrong? How do you know?'", look_for: "Ability to evaluate others' mathematical claims.", proficient: "Says wrong, explains that 5+3=8 and shows why (counting, fingers, etc.)", developing: "Says wrong but explanation is unclear", emerging: "Unsure or agrees with Sam" },
    { id: "mr3", grade: "1", domain: "geometry", prompt: "Show a rectangle. Ask: 'Is this a square? Why or why not?'", look_for: "Reasoning about shape properties, not just visual appearance.", proficient: "Says no and explains: 'A square has all equal sides; this one has long sides and short sides'", developing: "Says no but explanation is vague ('it looks different')", emerging: "Says yes or cannot explain difference" },
    { id: "mr4", grade: "2", domain: "numbers", prompt: "Ask: 'Is 48 + 25 more than 70 or less than 70? How can you tell WITHOUT solving the whole problem?'", look_for: "Estimation and reasoning to evaluate without computing.", proficient: "Reasons: '48 is almost 50, plus 25 is 75, so more than 70'", developing: "Gets right answer but computes the full problem to check", emerging: "Cannot estimate; must solve completely or gets wrong answer" },
    { id: "mr5", grade: "2", domain: "measurement", prompt: "Show two different rulers — one starting at 0, one starting at 1. Ask: 'Both show a pencil is at the 6 mark. Are the pencils the same length?'", look_for: "Reasoning about measurement starting points.", proficient: "Recognizes they're different lengths and explains why (one starts at 0, other at 1)", developing: "Suspects they're different but can't fully explain", emerging: "Says they're the same length" },
  ],
  "math-language": [
    { id: "ml1", grade: "K", domain: "numbers", prompt: "Show 3 groups of objects (2, 5, 4). Ask: 'Which group has the FEWEST? Which has the MOST?'", look_for: "Understanding comparative vocabulary: more, fewer, most, fewest.", proficient: "Correctly identifies most and fewest; uses comparison vocabulary naturally", developing: "Identifies correctly but confuses 'fewer/fewest' with 'less'", emerging: "Does not understand 'fewest'; points randomly" },
    { id: "ml2", grade: "K", domain: "geometry", prompt: "Show a cube and a sphere. Ask: 'Tell me about how these are different.'", look_for: "Use of descriptive geometric language (round, flat, corners, edges).", proficient: "Uses words like 'flat sides,' 'corners,' 'round,' 'roll'", developing: "Describes differences but uses everyday language ('this is like a ball')", emerging: "Cannot describe differences; says 'I don't know'" },
    { id: "ml3", grade: "1", domain: "numbers", prompt: "Ask: 'What does the word SUM mean? Can you use it in a sentence about math?'", look_for: "Knowledge of precise mathematical vocabulary.", proficient: "Defines sum as 'the answer when you add' and uses it in a sentence", developing: "Vaguely knows it relates to addition but imprecise", emerging: "Does not know the word" },
    { id: "ml4", grade: "2", domain: "numbers", prompt: "Write 34 > 28. Ask: 'Read this math sentence to me. What does this symbol mean?'", look_for: "Reading mathematical notation and symbols.", proficient: "Reads '34 is greater than 28'; explains the symbol correctly", developing: "Knows it means 'more' but doesn't use 'greater than'", emerging: "Cannot read the symbol or reads it backward" },
    { id: "ml5", grade: "2", domain: "algebra", prompt: "Ask: 'Explain to me how you would solve 47 + 35 — talk me through your thinking.'", look_for: "Ability to verbalize mathematical thinking coherently.", proficient: "Explains strategy step by step using math vocabulary (tens, ones, regroup)", developing: "Explains but jumps steps or uses imprecise language", emerging: "Cannot articulate thinking; solves silently or says 'I just know'" },
  ],
  "counting-cardinality": [
    { id: "cc1", grade: "K", domain: "numbers", prompt: "Place 7 objects in a scattered arrangement. Ask: 'How many are there? Count them for me.'", look_for: "1:1 correspondence, stable order, cardinality (says total at end).", proficient: "Counts accurately with 1:1 pointing; states 'there are 7' (cardinality)", developing: "Counts correctly but doesn't state final amount as the total", emerging: "Skips objects, double counts, or loses track" },
    { id: "cc2", grade: "K", domain: "numbers", prompt: "Show a dot card with 4 dots briefly (2 seconds). Ask: 'How many dots did you see?'", look_for: "Subitizing — instantly recognizing small quantities.", proficient: "Says 4 without counting (perceptual subitizing)", developing: "Needs a second look but then recognizes without counting", emerging: "Must count each dot one by one" },
    { id: "cc3", grade: "K", domain: "numbers", prompt: "Ask: 'Count as high as you can, starting from 1.'", look_for: "Rote counting sequence; note where errors begin.", proficient: "Counts to 30+ without errors", developing: "Counts to 20 with minor errors (e.g., skips a teen number)", emerging: "Counts to 10 or less; significant sequence errors" },
    { id: "cc4", grade: "1", domain: "numbers", prompt: "Ask: 'Start at 43 and count forward for me.' Then: 'Now start at 82 and count backward.'", look_for: "Counting across decade boundaries.", proficient: "Counts forward across 50 and backward from 82 smoothly", developing: "Hesitates at decade boundaries but self-corrects", emerging: "Gets stuck at decade boundary (e.g., ...49, 40?)" },
    { id: "cc5", grade: "1", domain: "measurement", prompt: "Give student a pile of ~25 small objects. Ask: 'Count these by putting them in groups of 10. How many altogether?'", look_for: "Skip counting by 10s; organizing to count efficiently.", proficient: "Groups by 10, skip counts '10, 20...' and adds remaining ones", developing: "Groups but recounts all from 1 instead of skip counting", emerging: "Cannot organize into groups; counts all one by one" },
    { id: "cc6", grade: "2", domain: "numbers", prompt: "Ask: 'Count by 5s starting from 5 to 100.' Then: 'Count by 2s starting from 2 to 30.'", look_for: "Skip counting fluency.", proficient: "Both sequences completed quickly with no errors", developing: "Completes both but with hesitations or 1-2 self-corrections", emerging: "Multiple errors or cannot complete sequences" },
  ],
  "fact-fluency": [
    { id: "ff1", grade: "K", domain: "numbers", prompt: "Show flash cards: 1+1, 2+1, 1+2, 2+2. Time responses. Ask each one.", look_for: "Automaticity with +1 and doubles within 5. Note: fluent = within 3 seconds.", proficient: "Answers all within 3 seconds each", developing: "Answers within 5 seconds; may count on for some", emerging: "Needs fingers or manipulatives; more than 5 seconds each" },
    { id: "ff2", grade: "1", domain: "numbers", prompt: "Flash cards: 3+4, 6+2, 5+5, 8+1, 7+3, 9+1. Note speed and strategy.", look_for: "Addition facts within 10. Fluent = within 3 seconds per fact.", proficient: "5+ correct within 3 seconds each; uses known facts", developing: "Mostly correct but some counting on (4-6 seconds)", emerging: "Relies on counting all; many over 6 seconds" },
    { id: "ff3", grade: "1", domain: "numbers", prompt: "Flash cards: 8-3, 10-4, 7-2, 9-5. Note speed and strategy.", look_for: "Subtraction facts within 10.", proficient: "Answers within 3 seconds; may use related addition facts", developing: "Correct but counts back (4-6 seconds)", emerging: "Counts back with errors or cannot solve" },
    { id: "ff4", grade: "2", domain: "numbers", prompt: "Flash cards for sums to 20: 8+7, 9+6, 7+5, 8+4, 6+9, 9+8. Time each.", look_for: "Addition facts to 20. Fluent = within 3 seconds.", proficient: "5+ correct within 3 seconds; uses strategies (doubles+1, make 10)", developing: "Correct but uses counting on (4-8 seconds)", emerging: "Many errors or very slow (10+ seconds)" },
    { id: "ff5", grade: "2", domain: "algebra", prompt: "Show: 7 + ___ = 13. Then: ___ + 5 = 11. Ask: 'What goes in the blank?'", look_for: "Using fact fluency to solve missing addend (algebraic thinking connection).", proficient: "Solves both within 5 seconds using known facts", developing: "Solves by counting up but gets correct answers", emerging: "Cannot determine missing number" },
  ],
  "algorithmic": [
    { id: "al1", grade: "K", domain: "numbers", prompt: "Say: 'I have 3 apples and I get 2 more. How many do I have now? Show me how you figured it out.'", look_for: "Strategy use for joining problems: direct modeling, counting on, or known fact.", proficient: "Uses counting on or known fact ('3 and 2 is 5') without objects", developing: "Uses manipulatives or fingers accurately", emerging: "Cannot model the problem" },
    { id: "al2", grade: "1", domain: "numbers", prompt: "Ask: 'What is 24 + 13? Show me or tell me how you solve it.'", look_for: "Strategy for 2-digit addition without regrouping. Look for place value understanding.", proficient: "Uses place value: '20+10 is 30, 4+3 is 7, so 37'", developing: "Counts on from 24 by ones (accurate but slow)", emerging: "Cannot solve or makes significant errors" },
    { id: "al3", grade: "2", domain: "numbers", prompt: "Write: 36 + 47. Ask: 'Solve this and show your work. Explain what you did.'", look_for: "Addition with regrouping; understanding of process.", proficient: "Correct answer (83) with clear regrouping and can explain why we regroup", developing: "Gets correct answer but explanation is mechanical, not conceptual", emerging: "Makes regrouping error or cannot solve" },
    { id: "al4", grade: "2", domain: "numbers", prompt: "Write: 73 - 28. Ask: 'Solve this and explain your thinking.'", look_for: "Subtraction with regrouping.", proficient: "Correct answer (45) with clear explanation of regrouping/decomposing", developing: "Correct but uses only one rigid strategy with no explanation", emerging: "Makes errors with regrouping" },
    { id: "al5", grade: "2", domain: "measurement", prompt: "Say: 'A ribbon is 45 inches long. You cut off 18 inches. How long is the ribbon now? Show your work.'", look_for: "Applying subtraction algorithm in context.", proficient: "Sets up and solves correctly; connects to the context", developing: "Solves the computation but needs help setting it up", emerging: "Cannot connect the story to an operation" },
  ],
  "measurement-data": [
    { id: "md1", grade: "K", domain: "measurement", prompt: "Show two sticks of different lengths. Ask: 'Which is longer? How could we check?'", look_for: "Direct comparison; understanding of measurable attributes.", proficient: "Identifies longer correctly; suggests lining up ends to compare", developing: "Identifies correctly but comparison strategy is vague", emerging: "Cannot determine or does not align endpoints" },
    { id: "md2", grade: "K", domain: "statistics", prompt: "Show a simple picture graph (favorite fruits: 3 apples, 5 bananas, 2 oranges). Ask: 'Which fruit is most popular? How many kids chose bananas?'", look_for: "Reading simple data displays.", proficient: "Reads graph correctly; answers both questions; can compare categories", developing: "Answers one question correctly", emerging: "Cannot interpret the graph" },
    { id: "md3", grade: "1", domain: "measurement", prompt: "Give student paper clips and a pencil. Ask: 'How long is this pencil? Measure with the paper clips.'", look_for: "Non-standard measurement: no gaps, no overlaps, endpoint alignment.", proficient: "Measures accurately with no gaps/overlaps; reports measurement with unit", developing: "Measures but leaves gaps or overlaps; forgets to state units", emerging: "Does not understand the measurement process" },
    { id: "md4", grade: "2", domain: "measurement", prompt: "Give student a ruler. Ask: 'Measure this crayon to the nearest inch.'", look_for: "Standard measurement tool use; reading a ruler.", proficient: "Aligns zero correctly; reads measurement accurately", developing: "Minor alignment error (starts at 1 instead of 0) but reads scale correctly", emerging: "Cannot use ruler; holds incorrectly or reads wrong number" },
    { id: "md5", grade: "2", domain: "statistics", prompt: "Show a bar graph with 4 categories. Ask: 'How many more people chose cats than fish? How do you know?'", look_for: "Comparing data and computing differences from a graph.", proficient: "Reads values correctly and computes difference", developing: "Reads graph but makes computation error", emerging: "Cannot extract data from the graph" },
  ],
  "fraction-proportional": [
    { id: "fp1", grade: "K", domain: "numbers", prompt: "Give the student a cookie (or circle cutout). Ask: 'Can you share this equally with a friend? Show me how.'", look_for: "Concept of equal sharing/partitioning.", proficient: "Divides into 2 equal parts; uses word 'half' or 'equal'", developing: "Attempts to divide but pieces are noticeably unequal", emerging: "Breaks off a small piece; no concept of equal sharing" },
    { id: "fp2", grade: "1", domain: "geometry", prompt: "Show a circle, square, and rectangle. Ask: 'Draw a line to cut each shape into two EQUAL parts.'", look_for: "Partitioning shapes into halves.", proficient: "Correctly halves all three shapes", developing: "Halves circle and square but struggles with rectangle", emerging: "Lines do not create equal parts" },
    { id: "fp3", grade: "1", domain: "numbers", prompt: "Say: '4 children want to share 8 crackers equally. How many does each child get?'", look_for: "Fair sharing / early division concept.", proficient: "Says 2 quickly; can explain ('8 split 4 ways is 2 each')", developing: "Distributes one by one and arrives at 2", emerging: "Cannot solve; distributes unequally" },
    { id: "fp4", grade: "2", domain: "geometry", prompt: "Show a rectangle divided into 4 equal parts with 1 shaded. Ask: 'What fraction is shaded? What if I shade one more part?'", look_for: "Naming fractions; understanding part-whole.", proficient: "Says '1/4' and '2/4 or one half'; understands equivalence", developing: "Says '1 out of 4' but doesn't know fraction notation; gets 2/4 for second part", emerging: "Cannot name the fraction; says '1' or 'a little bit'" },
    { id: "fp5", grade: "2", domain: "numbers", prompt: "Show a number line from 0 to 1 marked in halves. Ask: 'Where does 1/2 go? Now show me where 1/4 would go.'", look_for: "Fraction placement on number line.", proficient: "Places 1/2 correctly; places 1/4 at midpoint of 0 to 1/2", developing: "Places 1/2 correctly but 1/4 is inaccurate", emerging: "Cannot place either fraction" },
  ],
};

// Intervention recommendations mapped to pillar + level
const INTERVENTIONS = {
  "number-sense": {
    title: "Number Sense",
    emerging: { goal: "Build foundational understanding of quantity and magnitude", strategies: ["Daily subitizing activities with dot cards (start with 1-5)", "Magnitude comparison games: 'Which is more?' with concrete objects", "Number talks focusing on 'how many' with rekenrek or ten-frames", "Estimation jars — guess and check daily"], resources: ["Number Sense Routines by Jessica Shumway", "Building Number Sense (K-2) — NCTM resource"] },
    developing: { goal: "Strengthen number relationships and reasonableness checking", strategies: ["Mental number line activities — 'closer to ___ or ___?'", "Part-whole mat activities with varied representations", "Daily estimation practice with increasing range", "Number of the Day routine exploring relationships"], resources: ["Developing Number Concepts by Kathy Richardson", "Math Running Records"] },
  },
  "spatial-reasoning": {
    title: "Spatial Reasoning",
    emerging: { goal: "Build basic shape recognition and positional vocabulary", strategies: ["Shape hunts around classroom and school", "Position word games (Simon Says with spatial language)", "Pattern block free play and guided copying", "Body movement activities: 'Stand BEHIND the chair'"], resources: ["Taking Shape (K-2) by Moss et al.", "DREME spatial reasoning resources"] },
    developing: { goal: "Develop mental visualization and transformation skills", strategies: ["Pattern block puzzles with increasing complexity", "Memory games with spatial arrangements", "Draw-from-memory tasks with shapes", "Tangram challenges with scaffolded outlines"], resources: ["Spatial Reasoning in the Early Years — Erikson Institute", "NRICH spatial reasoning tasks"] },
  },
  "pattern-algebraic": {
    title: "Pattern & Algebraic Thinking",
    emerging: { goal: "Recognize and copy simple repeating patterns", strategies: ["Body patterns first (clap-stomp, clap-stomp)", "Copy-extend-create pattern sequence with manipulatives", "Pattern trains with Unifix cubes (AB, then ABB, then ABC)", "Same/different sorting activities"], resources: ["Thinking Mathematically — Carpenter et al.", "Algebra in the Early Grades — Kaput et al."] },
    developing: { goal: "Extend, describe, and generalize patterns", strategies: ["Growing pattern investigations", "'What's my rule?' games with function machines", "Number pattern hunts on the hundred chart", "Ask 'What stays the same? What changes?' regularly"], resources: ["Patterns, Functions, and Change — TERC", "Developing Essential Understanding of Algebraic Thinking (K-2)"] },
  },
  "math-reasoning": {
    title: "Mathematical Reasoning",
    emerging: { goal: "Begin justifying answers with simple explanations", strategies: ["Always ask 'How do you know?' (even for correct answers)", "True/false number sentence routines", "Would You Rather? math prompts", "Provide sentence frames: 'I know because ___'"], resources: ["Intentional Talk — Kazemi & Hintz", "But Why Does It Work? — Russell et al."] },
    developing: { goal: "Construct and evaluate mathematical arguments", strategies: ["Convince Me challenges (prove your answer is right)", "Error analysis: 'What went wrong here?'", "Turn and talk with structured sharing", "Gallery walks to compare strategies"], resources: ["Connecting Arithmetic to Algebra — Russell et al.", "Mathematical Argumentation in Middle School — Knudsen et al."] },
  },
  "math-language": {
    title: "Mathematical Language",
    emerging: { goal: "Build basic mathematical vocabulary", strategies: ["Math word wall with student-friendly definitions + pictures", "Vocabulary sort cards (match word to picture/symbol)", "Sentence frames for math talk", "Math journal with drawings and labels"], resources: ["Math Word Wall templates — NCTM", "Mathematic Vocabulary Cards — Granite School District"] },
    developing: { goal: "Use mathematical language precisely in explanations", strategies: ["Think-alouds modeling precise math language", "Vocabulary journal with definitions, examples, and non-examples", "Partner explanations using vocabulary checklist", "Math read-alouds focusing on academic language"], resources: ["Mathematical Discourse — Smith & Stein", "Principles to Actions — NCTM (ch. 4)"] },
  },
  "counting-cardinality": {
    title: "Counting & Cardinality",
    emerging: { goal: "Establish stable counting sequence and 1:1 correspondence", strategies: ["Daily counting circles (choral counting)", "Touch-and-count with organized objects (lines first, then scattered)", "Counting jar routine — count and check daily", "Songs and chants for number sequence"], resources: ["Young Mathematicians at Work — Fosnot & Dolk", "Learning and Teaching Early Math — Clements & Sarama"] },
    developing: { goal: "Develop counting fluency across decades and by groups", strategies: ["Count around the circle by 2s, 5s, 10s", "Decade transition practice: 'What comes after 29? 39? 49?'", "Grouping and counting collections", "Counting backward activities"], resources: ["Developing Number Concepts — Kathy Richardson", "Number Talks — Sherry Parrish"] },
  },
  "fact-fluency": {
    title: "Fact Fluency",
    emerging: { goal: "Build foundational addition/subtraction strategies", strategies: ["Doubles facts with visual supports", "+1 and +2 fact practice with number line", "Ten-frame flash for making 10", "Daily fact practice (5 minutes) with concrete supports"], resources: ["Mastering the Basic Math Facts — O'Connell & SanGiovanni", "Math Fact Fluency — Bay-Williams & Kling"] },
    developing: { goal: "Increase automaticity and develop derived fact strategies", strategies: ["Strategy-based practice: make 10, doubles +/- 1, near doubles", "Math fact games (competitive and cooperative)", "Timed practice with self-monitoring (beat your own time)", "Related fact practice (fact families)"], resources: ["Math Fact Fluency — Bay-Williams & Kling", "Number Talks — Sherry Parrish"] },
  },
  "algorithmic": {
    title: "Algorithmic Proficiency",
    emerging: { goal: "Develop concrete strategies for solving addition/subtraction", strategies: ["Direct modeling with manipulatives (cubes, counters)", "Drawing pictures to represent word problems", "Number line jumps for addition/subtraction", "Part-part-whole mats with concrete materials"], resources: ["Children's Mathematics — Carpenter et al.", "Young Mathematicians at Work — Fosnot & Dolk"] },
    developing: { goal: "Bridge from concrete strategies to efficient procedures", strategies: ["Base-ten blocks for place value operations", "Expanded notation: 36 + 47 = 30+40 + 6+7", "Number line strategies (jump by 10s, then ones)", "Open number line for subtraction"], resources: ["Teaching Student-Centered Mathematics — Van de Walle et al.", "Developing Essential Understanding of Addition and Subtraction"] },
  },
  "measurement-data": {
    title: "Measurement & Data",
    emerging: { goal: "Understand measurable attributes and direct comparison", strategies: ["Daily comparison activities: longer/shorter, heavier/lighter", "Sorting by measurable attributes", "Non-standard measurement with large units (shoes, hands)", "Simple surveys and concrete graphs (real objects)"], resources: ["Teaching Student-Centered Mathematics (measurement chapters)", "Measure Up! — NCTM"] },
    developing: { goal: "Develop accuracy with measurement tools and data interpretation", strategies: ["Measurement stations with varied tools and units", "Predict-measure-compare cycle", "Data collection projects (class surveys, science observations)", "Graphing activities with questions at each level (read, compare, extend)"], resources: ["Putting Essential Understanding into Practice: Data — NCTM", "Teaching Measurement — Lehrer"] },
  },
  "fraction-proportional": {
    title: "Fraction & Proportional Fluency",
    emerging: { goal: "Build understanding of equal parts and fair sharing", strategies: ["Daily sharing activities with real objects", "Partitioning play-dough, paper, sandwiches", "Equal/not equal sorting with visual examples", "'Fair share' story problems"], resources: ["Extending Children's Mathematics: Fractions & Decimals — Empson & Levi", "Beyond Pizzas and Pies — McNamara & Shaughnessy"] },
    developing: { goal: "Connect equal parts to fraction names and notation", strategies: ["Fraction naming with area models and set models", "Fraction strips and number line placement", "Compare unit fractions: which is bigger, 1/2 or 1/4?", "Fraction of a set problems"], resources: ["Teaching Student-Centered Mathematics (fractions chapters)", "Developing Essential Understanding of Fractions — NCTM"] },
  },
};

// ═══════════════════════════════════════════════════════════════
// APP COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [screen, setScreen] = useState("home");
  const [studentInfo, setStudentInfo] = useState({ name: "", grade: "K", teacher: "", date: new Date().toISOString().split("T")[0] });
  const [currentPillarIdx, setCurrentPillarIdx] = useState(0);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [students, setStudents] = useState([]);
  const [viewingStudent, setViewingStudent] = useState(null);

  const currentPillar = PILLARS[currentPillarIdx];
  const pillarItems = useMemo(() => {
    if (!currentPillar) return [];
    const items = ASSESSMENT_ITEMS[currentPillar.id] || [];
    return items.filter(item => {
      const g = studentInfo.grade;
      if (g === "K") return item.grade === "K";
      if (g === "1") return item.grade === "K" || item.grade === "1";
      return true;
    });
  }, [currentPillar, studentInfo.grade]);

  const currentItem = pillarItems[currentItemIdx];

  const handleScore = useCallback((itemId, score) => {
    setScores(prev => ({ ...prev, [itemId]: score }));
  }, []);

  const handleNote = useCallback((itemId, note) => {
    setNotes(prev => ({ ...prev, [itemId]: note }));
  }, []);

  const nextItem = useCallback(() => {
    if (currentItemIdx < pillarItems.length - 1) {
      setCurrentItemIdx(prev => prev + 1);
    } else if (currentPillarIdx < PILLARS.length - 1) {
      setCurrentPillarIdx(prev => prev + 1);
      setCurrentItemIdx(0);
    } else {
      const studentRecord = { info: { ...studentInfo }, scores: { ...scores }, notes: { ...notes }, timestamp: new Date().toISOString() };
      setStudents(prev => [...prev, studentRecord]);
      setViewingStudent(studentRecord);
      setScreen("results");
    }
  }, [currentItemIdx, currentPillarIdx, pillarItems.length, studentInfo, scores, notes]);

  const prevItem = useCallback(() => {
    if (currentItemIdx > 0) {
      setCurrentItemIdx(prev => prev - 1);
    } else if (currentPillarIdx > 0) {
      setCurrentPillarIdx(prev => prev - 1);
      const prevPillarItems = (ASSESSMENT_ITEMS[PILLARS[currentPillarIdx - 1].id] || []).filter(item => {
        const g = studentInfo.grade;
        if (g === "K") return item.grade === "K";
        if (g === "1") return item.grade === "K" || item.grade === "1";
        return true;
      });
      setCurrentItemIdx(prevPillarItems.length - 1);
    }
  }, [currentItemIdx, currentPillarIdx, studentInfo.grade]);

  const startAssessment = useCallback(() => {
    setCurrentPillarIdx(0);
    setCurrentItemIdx(0);
    setScores({});
    setNotes({});
    setScreen("assess");
  }, []);

  const getPillarScore = useCallback((pillarId, scoreData) => {
    const items = ASSESSMENT_ITEMS[pillarId] || [];
    const scored = items.filter(i => scoreData[i.id] !== undefined);
    if (scored.length === 0) return null;
    const total = scored.reduce((sum, i) => sum + (scoreData[i.id] || 0), 0);
    return { avg: total / scored.length, count: scored.length, total: items.length };
  }, []);

  const getLevel = (avg) => {
    if (avg >= 2.5) return { level: "proficient", label: "Proficient", color: "#27AE60", bg: "#EAFAF1" };
    if (avg >= 1.5) return { level: "developing", label: "Developing", color: "#F39C12", bg: "#FEF9E7" };
    return { level: "emerging", label: "Emerging", color: "#E74C3C", bg: "#FDEDEC" };
  };

  const totalItems = useMemo(() => {
    return PILLARS.reduce((sum, p) => {
      const items = ASSESSMENT_ITEMS[p.id] || [];
      return sum + items.filter(item => {
        const g = studentInfo.grade;
        if (g === "K") return item.grade === "K";
        if (g === "1") return item.grade === "K" || item.grade === "1";
        return true;
      }).length;
    }, 0);
  }, [studentInfo.grade]);

  const completedItems = Object.keys(scores).length;

  // ── HOME SCREEN ───────────────────────────────────────────
  if (screen === "home") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 24 }}>
            <h1 style={{ fontSize: 28, color: "#fff", margin: 0, fontFamily: "Georgia, serif" }}>The Mathematical Proficiency Bridge</h1>
            <p style={{ fontSize: 18, color: "#F1C40F", margin: "8px 0 4px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>Assessment Tapestry Screener</p>
            <p style={{ fontSize: 13, color: "#aab" }}>K-2 Teacher-Administered Diagnostic Tool</p>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, color: "#1a1a2e", margin: "0 0 20px", borderBottom: "2px solid #F1C40F", paddingBottom: 8 }}>New Assessment</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Student Name *</label>
                <input type="text" value={studentInfo.name} onChange={e => setStudentInfo(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter student name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Grade Level *</label>
                <select value={studentInfo.grade} onChange={e => setStudentInfo(prev => ({ ...prev, grade: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}>
                  {GRADE_LEVELS.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Teacher Name</label>
                <input type="text" value={studentInfo.teacher} onChange={e => setStudentInfo(prev => ({ ...prev, teacher: e.target.value }))} placeholder="Your name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Date</label>
                <input type="date" value={studentInfo.date} onChange={e => setStudentInfo(prev => ({ ...prev, date: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
            <button onClick={startAssessment} disabled={!studentInfo.name} style={{ width: "100%", padding: "14px 24px", borderRadius: 8, border: "none", background: studentInfo.name ? "linear-gradient(135deg, #2980B9, #1a1a2e)" : "#ccc", color: "#fff", fontSize: 16, fontWeight: 600, cursor: studentInfo.name ? "pointer" : "default", marginTop: 8 }}>
              Begin Screener ({totalItems} items across 10 pillars)
            </button>
          </div>

          {students.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
              <h2 style={{ fontSize: 18, color: "#1a1a2e", margin: "0 0 16px", borderBottom: "2px solid #2980B9", paddingBottom: 8 }}>Completed Assessments</h2>
              {students.map((s, i) => (
                <div key={i} onClick={() => { setViewingStudent(s); setScreen("results"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 8, background: "#f8f9fa", marginBottom: 8, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#e8f4fd"} onMouseLeave={e => e.currentTarget.style.background = "#f8f9fa"}>
                  <div>
                    <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{s.info.name}</span>
                    <span style={{ color: "#888", marginLeft: 12, fontSize: 13 }}>Grade {s.info.grade}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#888" }}>{new Date(s.timestamp).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 24, padding: 20, background: "rgba(255,255,255,0.08)", borderRadius: 10, border: "1px solid rgba(241,196,15,0.3)" }}>
            <h3 style={{ color: "#F1C40F", fontSize: 14, margin: "0 0 8px" }}>How This Works</h3>
            <p style={{ color: "#ccd", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              This screener assesses 10 foundational math skill pillars across 6 mathematical domains. Administer items 1:1 or in a small group. Score each item (Proficient / Developing / Emerging / Not Yet). The app generates a Pillar Strength Report with targeted intervention recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── ASSESSMENT SCREEN ──────────────────────────────────────
  if (screen === "assess") {
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {/* Header */}
        <div style={{ background: "#1a1a2e", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Exit</button>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{studentInfo.name} — Grade {studentInfo.grade}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#aab", fontSize: 12 }}>{completedItems}/{totalItems} items</span>
            <div style={{ width: 120, height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 3 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#F1C40F", borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          </div>
        </div>

        {/* Pillar navigation */}
        <div style={{ background: "#fff", padding: "10px 24px", borderBottom: "1px solid #e0e0e0", overflowX: "auto", display: "flex", gap: 4 }}>
          {PILLARS.map((p, i) => {
            const pillarScore = getPillarScore(p.id, scores);
            const isActive = i === currentPillarIdx;
            const hasScores = pillarScore && pillarScore.count > 0;
            return (
              <button key={p.id} onClick={() => { setCurrentPillarIdx(i); setCurrentItemIdx(0); }} style={{ padding: "6px 10px", borderRadius: 6, border: isActive ? `2px solid ${p.color}` : "1px solid #e0e0e0", background: isActive ? `${p.color}15` : hasScores ? "#f0fff0" : "#fafafa", color: isActive ? p.color : "#666", fontSize: 10, fontWeight: isActive ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", minWidth: 60, position: "relative" }}>
                {p.short}
                {hasScores && <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: "#27AE60" }} />}
              </button>
            );
          })}
        </div>

        {/* Current pillar header */}
        <div style={{ padding: "16px 24px", background: currentPillar.color + "12", borderBottom: `3px solid ${currentPillar.color}` }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: currentPillar.category === "conceptual" ? "#C0392B" : "#2980B9", textTransform: "uppercase", letterSpacing: 1 }}>
                {currentPillar.category === "conceptual" ? "Conceptual Understanding" : "Procedural Fluency"} — Pillar {currentPillarIdx + 1}/10
              </div>
              <h2 style={{ margin: "4px 0 0", fontSize: 20, color: currentPillar.color }}>{currentPillar.name}</h2>
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>Item {currentItemIdx + 1} of {pillarItems.length}</div>
          </div>
        </div>

        {/* Item card */}
        {currentItem && (
          <div style={{ maxWidth: 800, margin: "20px auto", padding: "0 24px" }}>
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {/* Item info */}
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <span style={{ background: "#e8f4fd", color: "#2980B9", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Grade {currentItem.grade}</span>
                  <span style={{ background: "#fef9e7", color: "#B8860B", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{DOMAINS.find(d => d.id === currentItem.domain)?.name}</span>
                </div>

                <div style={{ background: "#f8f9fa", borderRadius: 10, padding: 20, marginBottom: 16, borderLeft: `4px solid ${currentPillar.color}` }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Teacher Prompt</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#1a1a2e" }}>{currentItem.prompt}</p>
                </div>

                <div style={{ background: "#fffbeb", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 12, color: "#B8860B", textTransform: "uppercase", letterSpacing: 0.5 }}>What to Look For</h3>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#555" }}>{currentItem.look_for}</p>
                </div>

                {/* Scoring rubric */}
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Score This Item</h3>
                  {[
                    { score: 3, label: "Proficient", desc: currentItem.proficient, color: "#27AE60", bg: "#EAFAF1" },
                    { score: 2, label: "Developing", desc: currentItem.developing, color: "#F39C12", bg: "#FEF9E7" },
                    { score: 1, label: "Emerging", desc: currentItem.emerging, color: "#E74C3C", bg: "#FDEDEC" },
                    { score: 0, label: "Not Yet", desc: "Student cannot engage with the task at this level", color: "#95A5A6", bg: "#F5F5F5" },
                  ].map(opt => {
                    const isSelected = scores[currentItem.id] === opt.score;
                    return (
                      <button key={opt.score} onClick={() => handleScore(currentItem.id, opt.score)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", marginBottom: 6, borderRadius: 8, border: isSelected ? `2px solid ${opt.color}` : "1px solid #e8e8e8", background: isSelected ? opt.bg : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${opt.color}`, background: isSelected ? opt.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {isSelected && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: opt.color }}>{opt.label} ({opt.score})</span>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666", lineHeight: 1.4 }}>{opt.desc}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Notes */}
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 4 }}>Observation Notes (optional)</label>
                  <textarea value={notes[currentItem.id] || ""} onChange={e => handleNote(currentItem.id, e.target.value)} placeholder="What strategies did the student use? What did you observe?" rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", background: "#f8f9fa", borderTop: "1px solid #eee" }}>
                <button onClick={prevItem} disabled={currentPillarIdx === 0 && currentItemIdx === 0} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#555", cursor: "pointer", fontSize: 13 }}>Previous</button>
                <button onClick={nextItem} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: currentPillar.color, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  {currentPillarIdx === PILLARS.length - 1 && currentItemIdx === pillarItems.length - 1 ? "Finish & View Results" : "Next Item →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RESULTS SCREEN ─────────────────────────────────────────
  if (screen === "results" && viewingStudent) {
    const sData = viewingStudent;
    const pillarResults = PILLARS.map(p => {
      const score = getPillarScore(p.id, sData.scores);
      return { ...p, score, level: score ? getLevel(score.avg) : null };
    });

    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {/* Header */}
        <div style={{ background: "#1a1a2e", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, color: "#fff", fontFamily: "Georgia, serif" }}>Pillar Strength Report</h1>
            <p style={{ margin: "4px 0 0", color: "#F1C40F", fontSize: 13 }}>{sData.info.name} — Grade {sData.info.grade} — {new Date(sData.timestamp).toLocaleDateString()}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setScreen("interventions")} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#E74C3C", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>View Goals & Interventions</button>
            <button onClick={() => setScreen("home")} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 12 }}>New Assessment</button>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 24px" }}>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Proficient Pillars", count: pillarResults.filter(p => p.level?.level === "proficient").length, color: "#27AE60", bg: "#EAFAF1" },
              { label: "Developing Pillars", count: pillarResults.filter(p => p.level?.level === "developing").length, color: "#F39C12", bg: "#FEF9E7" },
              { label: "Emerging / Not Assessed", count: pillarResults.filter(p => p.level?.level === "emerging" || !p.level).length, color: "#E74C3C", bg: "#FDEDEC" },
            ].map((card, i) => (
              <div key={i} style={{ background: card.bg, borderRadius: 10, padding: 20, textAlign: "center", border: `1px solid ${card.color}20` }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: card.color }}>{card.count}</div>
                <div style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Pillar strength bars */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 16, color: "#1a1a2e" }}>Pillar Strength Overview</h2>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: "#888" }}>Each bar shows average performance across assessed items (0 = Not Yet, 3 = Proficient)</p>
            {pillarResults.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 12 }}>
                <div style={{ width: 140, fontSize: 12, fontWeight: 600, color: p.color, textAlign: "right" }}>{p.short}</div>
                <div style={{ flex: 1, height: 24, background: "#f0f0f0", borderRadius: 12, overflow: "hidden", position: "relative" }}>
                  {p.score && (
                    <div style={{ width: `${(p.score.avg / 3) * 100}%`, height: "100%", background: p.level.color, borderRadius: 12, transition: "width 0.5s", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, minWidth: 40 }}>
                      <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{p.score.avg.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div style={{ width: 80, textAlign: "center" }}>
                  {p.level && (
                    <span style={{ background: p.level.bg, color: p.level.color, padding: "3px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{p.level.label}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tapestry Grid — Skill x Domain */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24, overflowX: "auto" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 16, color: "#1a1a2e" }}>Assessment Tapestry — Skill x Domain Detail</h2>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#888" }}>Each cell shows how the student performed on that skill within that domain</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 6px", textAlign: "left", borderBottom: "2px solid #1a1a2e", fontSize: 10, color: "#555" }}>Pillar</th>
                  {DOMAINS.map(d => (
                    <th key={d.id} style={{ padding: "8px 4px", textAlign: "center", borderBottom: "2px solid #1a1a2e", fontSize: 9, color: "#555" }}>{d.short}</th>
                  ))}
                  <th style={{ padding: "8px 6px", textAlign: "center", borderBottom: "2px solid #1a1a2e", fontSize: 10, color: "#555" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {PILLARS.map(p => {
                  const items = ASSESSMENT_ITEMS[p.id] || [];
                  const pillarScore = getPillarScore(p.id, sData.scores);
                  const level = pillarScore ? getLevel(pillarScore.avg) : null;
                  return (
                    <tr key={p.id}>
                      <td style={{ padding: "6px", fontWeight: 600, color: p.color, fontSize: 10, borderBottom: "1px solid #f0f0f0" }}>{p.short}</td>
                      {DOMAINS.map(d => {
                        const domainItems = items.filter(i => i.domain === d.id);
                        const scoredItems = domainItems.filter(i => sData.scores[i.id] !== undefined);
                        if (scoredItems.length === 0) {
                          return <td key={d.id} style={{ padding: "6px 4px", textAlign: "center", borderBottom: "1px solid #f0f0f0", color: "#ddd" }}>—</td>;
                        }
                        const avg = scoredItems.reduce((s, i) => s + sData.scores[i.id], 0) / scoredItems.length;
                        const cellLevel = getLevel(avg);
                        return (
                          <td key={d.id} style={{ padding: "4px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                            <div style={{ background: cellLevel.bg, color: cellLevel.color, borderRadius: 4, padding: "4px 2px", fontSize: 10, fontWeight: 600 }}>{avg.toFixed(1)}</div>
                          </td>
                        );
                      })}
                      <td style={{ padding: "6px 4px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                        {level && <span style={{ background: level.bg, color: level.color, padding: "2px 8px", borderRadius: 8, fontSize: 9, fontWeight: 600 }}>{level.label}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick recommendations */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, color: "#1a1a2e" }}>Priority Action Areas</h2>
            {pillarResults.filter(p => p.level && p.level.level !== "proficient").sort((a, b) => (a.score?.avg || 0) - (b.score?.avg || 0)).map(p => (
              <div key={p.id} style={{ padding: "12px 16px", marginBottom: 8, borderRadius: 8, background: p.level.bg, borderLeft: `4px solid ${p.level.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: p.color, fontSize: 13 }}>{p.name}</span>
                  <span style={{ background: p.level.color, color: "#fff", padding: "2px 10px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{p.level.label} ({p.score?.avg.toFixed(1)})</span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#555" }}>
                  {INTERVENTIONS[p.id]?.[p.level.level]?.goal || "See detailed recommendations"}
                </p>
              </div>
            ))}
            {pillarResults.filter(p => p.level && p.level.level !== "proficient").length === 0 && (
              <p style={{ color: "#27AE60", fontSize: 14, fontWeight: 600, textAlign: "center", padding: 20 }}>All pillars are at proficient level! Continue Tier 1 instruction.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── INTERVENTIONS SCREEN ───────────────────────────────────
  if (screen === "interventions" && viewingStudent) {
    const sData = viewingStudent;
    const weakPillars = PILLARS.map(p => {
      const score = getPillarScore(p.id, sData.scores);
      const level = score ? getLevel(score.avg) : null;
      return { ...p, score, level };
    }).filter(p => p.level && p.level.level !== "proficient");

    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ background: "#1a1a2e", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, color: "#fff", fontFamily: "Georgia, serif" }}>Goals & Intervention Plan</h1>
            <p style={{ margin: "4px 0 0", color: "#F1C40F", fontSize: 13 }}>{sData.info.name} — Grade {sData.info.grade}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setScreen("results")} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 12 }}>Back to Report</button>
            <button onClick={() => setScreen("home")} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 12 }}>Home</button>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 24px" }}>
          {weakPillars.length === 0 ? (
            <div style={{ background: "#EAFAF1", borderRadius: 12, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>&#127881;</div>
              <h2 style={{ color: "#27AE60", margin: "0 0 8px" }}>All Pillars Proficient!</h2>
              <p style={{ color: "#555", fontSize: 14 }}>Continue enriching Tier 1 instruction. Re-screen in 6-8 weeks to monitor growth.</p>
            </div>
          ) : (
            weakPillars.sort((a, b) => (a.score?.avg || 0) - (b.score?.avg || 0)).map(p => {
              const intervention = INTERVENTIONS[p.id]?.[p.level.level];
              if (!intervention) return null;
              return (
                <div key={p.id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20, overflow: "hidden" }}>
                  <div style={{ background: p.color, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, color: "#fff", fontSize: 16 }}>{p.name}</h2>
                    <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "3px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                      {p.level.label} — Avg: {p.score.avg.toFixed(1)}/3.0
                    </span>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 16, marginBottom: 16, borderLeft: "4px solid #F1C40F" }}>
                      <h3 style={{ margin: "0 0 4px", fontSize: 12, color: "#B8860B", textTransform: "uppercase", letterSpacing: 0.5 }}>Recommended Goal</h3>
                      <p style={{ margin: 0, fontSize: 14, color: "#1a1a2e", fontWeight: 500 }}>{intervention.goal}</p>
                    </div>

                    <h3 style={{ margin: "0 0 10px", fontSize: 13, color: "#555" }}>Intervention Strategies:</h3>
                    {intervention.strategies.map((strategy, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: p.color + "15", color: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#333" }}>{strategy}</p>
                      </div>
                    ))}

                    <div style={{ marginTop: 16, padding: "12px 16px", background: "#e8f4fd", borderRadius: 8 }}>
                      <h4 style={{ margin: "0 0 6px", fontSize: 11, color: "#2980B9", textTransform: "uppercase" }}>Recommended Resources</h4>
                      {intervention.resources.map((resource, i) => (
                        <p key={i} style={{ margin: "0 0 2px", fontSize: 12, color: "#333" }}>• {resource}</p>
                      ))}
                    </div>

                    {/* Item-level notes */}
                    {(() => {
                      const pillarNotes = (ASSESSMENT_ITEMS[p.id] || []).filter(item => sData.notes[item.id]);
                      if (pillarNotes.length === 0) return null;
                      return (
                        <div style={{ marginTop: 16, padding: "12px 16px", background: "#fff9e6", borderRadius: 8, border: "1px solid #f0e0a0" }}>
                          <h4 style={{ margin: "0 0 8px", fontSize: 11, color: "#B8860B", textTransform: "uppercase" }}>Teacher Observations</h4>
                          {pillarNotes.map(item => (
                            <p key={item.id} style={{ margin: "0 0 6px", fontSize: 12, color: "#555" }}>
                              <span style={{ fontWeight: 600 }}>{item.prompt.substring(0, 40)}...</span>: {sData.notes[item.id]}
                            </p>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}

          {weakPillars.length > 0 && (
            <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24, marginTop: 8 }}>
              <h3 style={{ color: "#F1C40F", fontSize: 14, margin: "0 0 10px" }}>Next Steps</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { step: "1", text: "Share this report with the intervention team and parent/guardian" },
                  { step: "2", text: "Begin targeted interventions on the lowest-scoring pillar first" },
                  { step: "3", text: "Progress monitor bi-weekly on targeted pillars" },
                  { step: "4", text: "Re-administer full screener in 6-8 weeks to assess growth" },
                ].map(s => (
                  <div key={s.step} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#F1C40F", color: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                    <p style={{ margin: 0, fontSize: 12, color: "#ccd", lineHeight: 1.5 }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
