export type Category =
  | "technology" | "photography" | "art" | "music" | "culture" | "learning"
  | "food" | "nature" | "fitness" | "creative" | "social" | "local" | "adventure";
export type Mood = "calm" | "curious" | "energetic" | "social" | "creative" | "reflective";
export type SocialMode = "solo" | "friend" | "group";
export type LocationType = "home" | "nearby" | "city" | "far";

export interface Experience {
  id: string;
  title: string;
  category: Category;
  description: string;
  tags: Category[];
  budget: number; // INR
  duration: number; // minutes
  energy: 1 | 2 | 3;
  social_mode: SocialMode[];
  moods: Mood[];
  novelty_categories: string[];
  location_type: LocationType;
  exploration: number; // 0..1
  image: { hue: number; icon: string };
  steps: [string, string, string, string, string];
}

export const CATEGORY_META: Record<Category, { label: string; hue: number; icon: string }> = {
  technology: { label: "Technology", hue: 210, icon: "Cpu" },
  photography: { label: "Photography", hue: 40, icon: "Camera" },
  art: { label: "Art", hue: 15, icon: "Palette" },
  music: { label: "Music", hue: 330, icon: "Music" },
  culture: { label: "Culture", hue: 55, icon: "Landmark" },
  learning: { label: "Learning", hue: 190, icon: "BookOpen" },
  food: { label: "Food", hue: 25, icon: "UtensilsCrossed" },
  nature: { label: "Nature", hue: 145, icon: "Leaf" },
  fitness: { label: "Fitness", hue: 0, icon: "Dumbbell" },
  creative: { label: "Making", hue: 280, icon: "Scissors" },
  social: { label: "Social", hue: 350, icon: "Users" },
  local: { label: "Local", hue: 70, icon: "MapPin" },
  adventure: { label: "Micro-adventure", hue: 170, icon: "Compass" },
};

const img = (c: Category) => ({ hue: CATEGORY_META[c].hue, icon: CATEGORY_META[c].icon });

export const EXPERIENCES: Experience[] = [
  {
    id: "night-sky-long-exposure", title: "Star-Trail Long Exposure Walk", category: "photography",
    description: "Find the darkest patch near you and capture the sky turning — with nothing but a phone, a stable surface and patience.",
    tags: ["photography", "nature", "technology"], budget: 0, duration: 90, energy: 2,
    social_mode: ["solo", "friend"], moods: ["reflective", "curious", "calm"], novelty_categories: ["astronomy", "night shooting"],
    location_type: "nearby", exploration: 0.85, image: img("photography"),
    steps: ["Check tonight's cloud cover and moon phase.", "Walk to the darkest open spot within reach.", "Hold a 10-minute exposure without touching the phone.", "Identify one constellation you've never named before.", "Save your best frame as tonight's discovery."],
  },
  {
    id: "heritage-doorways", title: "Heritage Doorways Photo Hunt", category: "local",
    description: "Old neighbourhoods hide their history in doors. Photograph ten and uncover the story behind one.",
    tags: ["photography", "culture", "local"], budget: 0, duration: 75, energy: 2,
    social_mode: ["solo", "friend"], moods: ["curious", "creative"], novelty_categories: ["architecture", "local history"],
    location_type: "city", exploration: 0.9, image: img("local"),
    steps: ["Pick the oldest street in your area.", "Photograph 10 doors with distinct character.", "Spot a pattern: colour, carving or ironwork.", "Ask a shopkeeper about one door's past.", "Make a 3×3 grid and caption the story."],
  },
  {
    id: "birdsong-classifier", title: "Build a Bird-Song Classifier", category: "technology",
    description: "Record birds outside your window and train a tiny no-code ML model to tell them apart.",
    tags: ["technology", "nature", "learning"], budget: 0, duration: 60, energy: 1,
    social_mode: ["solo"], moods: ["curious"], novelty_categories: ["machine learning", "ornithology"],
    location_type: "home", exploration: 0.8, image: img("technology"),
    steps: ["Open a free browser ML trainer.", "Record 3 bird calls near your window.", "Train the model with 20 samples each.", "Test it live on a new call.", "Name the species you just met."],
  },
  {
    id: "blind-contour-swap", title: "Blind Contour Portrait Swap", category: "art",
    description: "Draw each other without looking at the paper. Ugly, hilarious and surprisingly expressive.",
    tags: ["art", "social", "creative"], budget: 100, duration: 45, energy: 1,
    social_mode: ["friend", "group"], moods: ["social", "creative"], novelty_categories: ["drawing"],
    location_type: "home", exploration: 0.7, image: img("art"),
    steps: ["Grab paper and one pen per person.", "Set a 2-minute timer and face each other.", "Draw without lifting the pen or looking down.", "Swap, compare, and vote for the boldest line.", "Frame the funniest one on the fridge."],
  },
  {
    id: "found-sound-beats", title: "Found-Sound Beat Making", category: "music",
    description: "Record the city — kettles, gates, traffic — and turn it into a 30-second beat.",
    tags: ["music", "technology", "creative", "local"], budget: 0, duration: 90, energy: 2,
    social_mode: ["solo"], moods: ["creative", "energetic"], novelty_categories: ["field recording", "sampling"],
    location_type: "nearby", exploration: 0.85, image: img("music"),
    steps: ["Install a free mobile sampler.", "Collect 8 everyday sounds on a walk.", "Chop them into a kick, snare and hat.", "Layer a 4-bar loop at 90 BPM.", "Export and title your neighbourhood track."],
  },
  {
    id: "spice-market-map", title: "Spice Market Sensory Map", category: "food",
    description: "Navigate a local market by smell alone. Buy three spices you can't name and cook with one.",
    tags: ["food", "culture", "local"], budget: 400, duration: 120, energy: 2,
    social_mode: ["solo", "friend"], moods: ["curious", "social"], novelty_categories: ["spices", "markets"],
    location_type: "city", exploration: 0.8, image: img("food"),
    steps: ["Head to your nearest wholesale market.", "Follow your nose to five different stalls.", "Buy three unfamiliar spices, ask their names.", "Ask a vendor for one recipe.", "Cook it tonight and rate it."],
  },
  {
    id: "sunrise-micro-summit", title: "Sunrise Micro-Summit", category: "adventure",
    description: "Climb the nearest high point before dawn. Coffee at the top is mandatory.",
    tags: ["adventure", "nature", "fitness"], budget: 0, duration: 120, energy: 3,
    social_mode: ["solo", "friend", "group"], moods: ["energetic", "reflective"], novelty_categories: ["hiking", "sunrise"],
    location_type: "nearby", exploration: 0.75, image: img("adventure"),
    steps: ["Find the highest reachable point on a map.", "Leave 45 minutes before sunrise.", "Climb without checking your phone.", "Watch the first light hit the city.", "Write one sentence about the view."],
  },
  {
    id: "tiny-museum-speedrun", title: "Tiny Museum Speedrun", category: "culture",
    description: "Pick the smallest, least-reviewed museum in your city and find its single strangest object.",
    tags: ["culture", "learning", "local"], budget: 150, duration: 60, energy: 1,
    social_mode: ["solo", "friend"], moods: ["curious", "calm"], novelty_categories: ["museums"],
    location_type: "city", exploration: 0.7, image: img("culture"),
    steps: ["Search for museums with under 100 reviews.", "Go in with zero research.", "Find the strangest object on display.", "Ask staff one question about it.", "Leave a review that would make others go."],
  },
  {
    id: "card-magic", title: "Learn One Card Trick & Perform It", category: "learning",
    description: "Master a single sleight-of-hand trick and fool one real person before the day ends.",
    tags: ["learning", "social", "creative"], budget: 0, duration: 45, energy: 1,
    social_mode: ["solo", "friend"], moods: ["curious", "social"], novelty_categories: ["magic", "performance"],
    location_type: "home", exploration: 0.9, image: img("learning"),
    steps: ["Pick a self-working card trick tutorial.", "Practise the move 20 times in a mirror.", "Polish the patter — the story sells it.", "Perform it for one person.", "Don't reveal the secret. Ever."],
  },
  {
    id: "urban-foraging", title: "Urban Foraging Walk", category: "nature",
    description: "Learn to identify five edible or medicinal plants growing in plain sight on your street.",
    tags: ["nature", "food", "learning"], budget: 0, duration: 90, energy: 2,
    social_mode: ["solo", "friend"], moods: ["curious", "calm"], novelty_categories: ["botany", "foraging"],
    location_type: "nearby", exploration: 0.9, image: img("nature"),
    steps: ["Install a free plant-ID app.", "Walk a 2 km loop slowly.", "Identify five plants, note which are edible.", "Learn one plant's traditional use.", "Sketch or photograph your favourite."],
  },
  {
    id: "park-calisthenics", title: "Street Calisthenics Session", category: "fitness",
    description: "Turn a park's benches and bars into a full-body workout — no gym, no gear.",
    tags: ["fitness", "social"], budget: 0, duration: 45, energy: 3,
    social_mode: ["solo", "friend", "group"], moods: ["energetic"], novelty_categories: ["calisthenics"],
    location_type: "nearby", exploration: 0.6, image: img("fitness"),
    steps: ["Find a park with a bar or sturdy bench.", "Warm up with 5 minutes of mobility.", "Do 4 rounds: dips, rows, squats, plank.", "Try one skill — a 5-second L-sit.", "Log your rounds and beat them next time."],
  },
  {
    id: "cyanotype", title: "Cyanotype Sun Prints", category: "creative",
    description: "Make deep-blue prints using sunlight, leaves and a 19th-century photo process.",
    tags: ["creative", "art", "photography", "nature"], budget: 600, duration: 90, energy: 1,
    social_mode: ["solo", "friend"], moods: ["creative", "calm"], novelty_categories: ["alternative photography", "chemistry"],
    location_type: "home", exploration: 0.9, image: img("creative"),
    steps: ["Order a cyanotype paper kit.", "Collect leaves, lace or keys.", "Arrange them and expose in sun for 10 min.", "Rinse and watch the blue appear.", "Dry and pick a print to gift."],
  },
  {
    id: "board-game-strangers", title: "Board Game Café Strangers Night", category: "social",
    description: "Walk in alone or as a pair and join a table of strangers for a strategy game you've never played.",
    tags: ["social", "learning"], budget: 350, duration: 120, energy: 2,
    social_mode: ["friend", "group"], moods: ["social", "curious"], novelty_categories: ["strategy games"],
    location_type: "city", exploration: 0.7, image: img("social"),
    steps: ["Find a board game café open tonight.", "Ask staff for a game under 45 minutes.", "Join or invite one new table.", "Play two rounds — learn by losing.", "Swap contacts with one fellow player."],
  },
  {
    id: "postcard-poetry", title: "Poetry Postcards for Strangers", category: "creative",
    description: "Write five tiny poems on postcards and leave them where strangers will find them.",
    tags: ["creative", "social", "local"], budget: 100, duration: 60, energy: 1,
    social_mode: ["solo"], moods: ["reflective", "creative"], novelty_categories: ["poetry", "guerrilla art"],
    location_type: "city", exploration: 0.85, image: img("creative"),
    steps: ["Buy five blank postcards.", "Write a 3-line poem on each.", "Choose five public spots — benches, books.", "Leave them with a 'take me' note.", "Photograph one spot before you walk away."],
  },
  {
    id: "bus-to-the-end", title: "Ride a Bus Line to the End", category: "adventure",
    description: "Board a route you've never taken and ride it to the final stop. Explore 30 minutes, then return.",
    tags: ["adventure", "local", "photography"], budget: 100, duration: 180, energy: 2,
    social_mode: ["solo", "friend"], moods: ["curious", "reflective"], novelty_categories: ["transit", "unknown neighbourhoods"],
    location_type: "far", exploration: 0.95, image: img("adventure"),
    steps: ["Pick a bus number you've never ridden.", "Ride all the way to the last stop.", "Walk 30 minutes without a map.", "Eat at the first local stall you see.", "Ride back and pin the place on a map."],
  },
  {
    id: "first-kimchi", title: "Ferment Your First Kimchi", category: "food",
    description: "A tiny jar, a cabbage, and a week of watching microbes do their magic.",
    tags: ["food", "learning", "culture"], budget: 300, duration: 60, energy: 1,
    social_mode: ["solo", "friend"], moods: ["calm", "curious"], novelty_categories: ["fermentation"],
    location_type: "home", exploration: 0.8, image: img("food"),
    steps: ["Buy napa cabbage, chilli, garlic, ginger.", "Salt the cabbage for 30 minutes.", "Mix the paste and pack the jar tight.", "Leave it to ferment, burp it daily.", "Taste on day 5 and note the change."],
  },
  {
    id: "open-mic-listening", title: "Open-Mic Listening Night", category: "music",
    description: "Go to a local open mic purely as a listener. Find one performer you'd follow.",
    tags: ["music", "social", "culture"], budget: 200, duration: 120, energy: 1,
    social_mode: ["friend", "group"], moods: ["social", "reflective"], novelty_categories: ["live music", "spoken word"],
    location_type: "city", exploration: 0.7, image: img("music"),
    steps: ["Find an open mic tonight or this week.", "Arrive early, sit near the front.", "Listen to every act without your phone.", "Pick one performer and tell them why.", "Follow them and share their work."],
  },
  {
    id: "tree-mapping", title: "Map Your Street's Trees", category: "nature",
    description: "Join a citizen-science project by logging every tree on your block. Real data, real impact.",
    tags: ["nature", "technology", "local"], budget: 0, duration: 60, energy: 2,
    social_mode: ["solo", "friend"], moods: ["calm", "curious"], novelty_categories: ["citizen science"],
    location_type: "nearby", exploration: 0.9, image: img("nature"),
    steps: ["Join a free citizen-science mapping app.", "Walk your block end to end.", "Log species, height and condition.", "Find the oldest tree on your street.", "Submit — you've added to real research."],
  },
  {
    id: "thrift-outfit", title: "₹500 Thrift Outfit Challenge", category: "social",
    description: "Each person gets ₹500 and 45 minutes in a thrift market to style someone else.",
    tags: ["social", "creative", "local"], budget: 500, duration: 90, energy: 2,
    social_mode: ["friend", "group"], moods: ["social", "energetic", "creative"], novelty_categories: ["fashion", "thrifting"],
    location_type: "city", exploration: 0.75, image: img("social"),
    steps: ["Draw names — you're styling them.", "Hit the market with ₹500 each.", "Assemble a full look in 45 minutes.", "Runway walk-off on the street.", "Vote, then keep what you love."],
  },
  {
    id: "sign-language-20", title: "Learn 20 Words in Sign Language", category: "learning",
    description: "Learn greetings, numbers and a full sentence in Indian Sign Language in half an hour.",
    tags: ["learning", "culture", "social"], budget: 0, duration: 30, energy: 1,
    social_mode: ["solo", "friend"], moods: ["curious", "calm"], novelty_categories: ["sign language", "accessibility"],
    location_type: "home", exploration: 0.9, image: img("learning"),
    steps: ["Open a free ISL video dictionary.", "Learn 10 greetings and courtesies.", "Learn numbers 1–10.", "Sign one full sentence fluently.", "Teach someone a word today."],
  },
  {
    id: "kite-first-flight", title: "Make a Kite & Fly It", category: "adventure",
    description: "Build a diamond kite from paper and sticks, then chase the wind on the nearest open ground.",
    tags: ["adventure", "creative", "nature"], budget: 150, duration: 120, energy: 2,
    social_mode: ["solo", "friend", "group"], moods: ["energetic", "creative"], novelty_categories: ["aerodynamics"],
    location_type: "nearby", exploration: 0.85, image: img("adventure"),
    steps: ["Gather two sticks, paper, string, tape.", "Build a diamond frame and add a tail.", "Find an open field with steady wind.", "Launch, adjust the tail, relaunch.", "Keep it up for 60 seconds."],
  },
  {
    id: "rooftop-sketch", title: "Rooftop Sunset Sketching", category: "art",
    description: "Ten minutes of fast sketches as the light changes. Capture colour, not detail.",
    tags: ["art", "nature"], budget: 100, duration: 60, energy: 1,
    social_mode: ["solo"], moods: ["calm", "reflective", "creative"], novelty_categories: ["urban sketching"],
    location_type: "nearby", exploration: 0.7, image: img("art"),
    steps: ["Head up 40 minutes before sunset.", "Do a 2-minute sketch of the skyline.", "Every 10 minutes, a new colour study.", "Compare how the light shifted.", "Date the page — it's a time-lapse."],
  },
  {
    id: "bouldering-intro", title: "Bouldering Intro Session", category: "fitness",
    description: "Climbing as a puzzle. Solve three routes on a beginner wall with chalky hands.",
    tags: ["fitness", "adventure", "social"], budget: 800, duration: 90, energy: 3,
    social_mode: ["solo", "friend", "group"], moods: ["energetic", "social"], novelty_categories: ["climbing"],
    location_type: "city", exploration: 0.8, image: img("fitness"),
    steps: ["Book a beginner slot at a climbing gym.", "Learn the safe-fall technique.", "Read a route before touching it.", "Send three beginner problems.", "Pick a harder one for next time."],
  },
  {
    id: "pottery-drop-in", title: "Pottery Wheel Drop-in", category: "art",
    description: "Get your hands muddy and centre clay on a wheel for the first time.",
    tags: ["art", "creative", "learning"], budget: 1500, duration: 120, energy: 2,
    social_mode: ["solo", "friend"], moods: ["calm", "creative"], novelty_categories: ["ceramics"],
    location_type: "city", exploration: 0.8, image: img("art"),
    steps: ["Book a drop-in wheel session.", "Learn to centre the clay.", "Pull up your first wall.", "Shape a small bowl — wobbles welcome.", "Choose a glaze for firing."],
  },
];

export const getExperience = (id: string) => EXPERIENCES.find((e) => e.id === id);
