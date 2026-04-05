import { logger } from 'server-utils';

// ─── Intent Types ────────────────────────────────────────────────────
export type SearchIntent =
  | 'genre_search'
  | 'similar_to_movie'
  | 'actor_search'
  | 'director_search'
  | 'mood_search'
  | 'theme_search'
  | 'era_search'
  | 'general_search';

export interface ParsedQuery {
  intents: SearchIntent[];
  genres: number[];
  language: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  moods: string[];
  themes: string[];
  actorNames: string[];
  directorNames: string[];
  similarToMovies: string[];
  keywords: string[];
  searchText: string;
  responseHint: string;
}

// ─── Genre Map ──────────────────────────────────────────────────────
const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'science fiction': 878,
  'sci-fi': 878,
  'tv movie': 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

// ─── Synonym → Genre Expansion ─────────────────────────────────────
// Maps colloquial/mood words to their corresponding TMDB genre IDs
const SYNONYM_TO_GENRES: Record<string, number[]> = {
  // Horror synonyms
  scary: [27],
  terrifying: [27],
  creepy: [27],
  spooky: [27],
  frightening: [27],
  haunted: [27],
  supernatural: [27, 14],
  paranormal: [27],
  gore: [27],
  slasher: [27],
  zombie: [27],

  // Comedy synonyms
  funny: [35],
  hilarious: [35],
  humorous: [35],
  comedic: [35],
  witty: [35],
  slapstick: [35],
  satire: [35],
  satirical: [35],
  parody: [35],
  laugh: [35],

  // Romance synonyms
  romantic: [10749],
  'love story': [10749],
  lovey: [10749],
  heartwarming: [10749, 18],

  // Thriller synonyms
  suspense: [53],
  suspenseful: [53],
  tense: [53],
  gripping: [53],
  'edge of your seat': [53],
  'nail biting': [53],
  'nail-biting': [53],
  intense: [53, 28],
  'mind-bending': [53, 878],
  mindbending: [53, 878],
  twisty: [53, 9648],
  'plot twist': [53, 9648],

  // Action synonyms
  explosive: [28],
  'action-packed': [28],
  adrenaline: [28],
  fighting: [28],
  'martial arts': [28],
  shootout: [28],

  // Sci-fi synonyms
  futuristic: [878],
  dystopian: [878],
  dystopia: [878],
  utopian: [878],
  cyberpunk: [878],
  'time travel': [878],
  alien: [878],
  aliens: [878],
  space: [878],
  spaceship: [878],
  robot: [878],
  robots: [878],
  'artificial intelligence': [878],

  // Drama synonyms
  emotional: [18],
  'tear-jerker': [18],
  tearjerker: [18],
  moving: [18],
  touching: [18],
  powerful: [18],
  'thought-provoking': [18],
  profound: [18],

  // Fantasy synonyms
  magical: [14],
  magic: [14],
  mythical: [14],
  fairytale: [14],
  'fairy tale': [14],
  enchanted: [14],
  dragon: [14],
  dragons: [14],
  wizard: [14],
  wizards: [14],

  // Documentary synonyms
  'true story': [99],
  'real life': [99],
  'based on true events': [99, 18],
  informative: [99],
  educational: [99],

  // Mystery synonyms
  'whodunit': [9648],
  'who done it': [9648],
  detective: [9648, 80],
  investigation: [9648, 80],
  clue: [9648],
  enigmatic: [9648],
  puzzle: [9648],

  // Crime synonyms
  heist: [80],
  gangster: [80],
  mafia: [80],
  mob: [80],
  underworld: [80],
  'true crime': [80, 99],
  prison: [80, 18],
  corruption: [80, 18],

  // War synonyms
  military: [10752],
  battlefield: [10752],
  soldier: [10752],
  soldiers: [10752],
  'world war': [10752],
  wwii: [10752],
  'ww2': [10752],
  'ww1': [10752],
  wwi: [10752],
  vietnam: [10752],
  combat: [10752],

  // Family / kids
  kids: [10751, 16],
  children: [10751, 16],
  'family friendly': [10751],
  animated: [16],
  cartoon: [16],
  pixar: [16],
  disney: [10751, 16],

  // Western
  cowboy: [37],
  cowboys: [37],
  'wild west': [37],

  // Adventure
  'treasure hunt': [12],
  expedition: [12],
  quest: [12],
  journey: [12, 18],
  epic: [12, 14],
  survival: [12, 53],
};

// ─── Mood → Genre Mapping ──────────────────────────────────────────
// Maps emotional states to best-matching genre combinations
const MOOD_TO_GENRES: Record<string, number[]> = {
  happy: [35, 10749, 10751],
  sad: [18, 10749],
  dark: [27, 53, 80],
  light: [35, 10751, 10749],
  relaxing: [35, 10749, 10751],
  exciting: [28, 12, 878],
  uplifting: [35, 18, 10751],
  inspirational: [18, 36],
  inspiring: [18, 36],
  nostalgic: [18, 10751, 10749],
  melancholic: [18, 10749],
  cheerful: [35, 16, 10751],
  gloomy: [27, 18, 53],
  anxious: [53, 27],
  calm: [18, 10749],
  adventurous: [12, 28, 14],
  curious: [99, 878, 9648],
  bored: [28, 35, 12],
  cozy: [10749, 35, 10751],
  thrilled: [28, 53, 878],
  philosophical: [18, 878],
  lonely: [18, 10749],
  angry: [28, 80, 53],
  rebellious: [28, 80],
  romantic: [10749, 18],
  festive: [35, 10751],
};

// ─── Theme/Topic → TMDB Keywords ──────────────────────────────────
// Maps thematic descriptions to TMDB keyword search terms
const THEME_TO_KEYWORDS: Record<string, string[]> = {
  medicine: ['doctor', 'hospital', 'medical', 'disease', 'surgery', 'nurse', 'pandemic'],
  hospital: ['hospital', 'medical', 'doctor', 'emergency room'],
  lawyer: ['lawyer', 'courtroom', 'legal', 'trial', 'justice'],
  court: ['courtroom', 'trial', 'judge', 'justice', 'legal'],
  school: ['school', 'teacher', 'student', 'education', 'high school', 'college'],
  college: ['college', 'university', 'campus', 'student'],
  sports: ['sports', 'athlete', 'competition', 'championship'],
  football: ['football', 'soccer', 'sports'],
  basketball: ['basketball', 'nba', 'sports'],
  baseball: ['baseball', 'sports'],
  boxing: ['boxing', 'fighter', 'ring'],
  cooking: ['cooking', 'chef', 'restaurant', 'food', 'cuisine'],
  food: ['food', 'cooking', 'chef', 'restaurant', 'culinary'],
  travel: ['travel', 'journey', 'road trip', 'adventure'],
  'road trip': ['road trip', 'journey', 'travel', 'cross country'],
  music: ['music', 'musician', 'band', 'concert', 'rock', 'jazz'],
  art: ['art', 'artist', 'painter', 'painting', 'gallery'],
  politics: ['politics', 'political', 'president', 'election', 'government'],
  religion: ['religion', 'faith', 'church', 'god', 'spiritual'],
  technology: ['technology', 'computer', 'hacker', 'artificial intelligence', 'cyber'],
  hacker: ['hacker', 'computer', 'cyber', 'technology'],
  nature: ['nature', 'wildlife', 'animal', 'environment', 'forest'],
  ocean: ['ocean', 'sea', 'underwater', 'marine', 'submarine'],
  mountain: ['mountain', 'climbing', 'expedition', 'everest'],
  desert: ['desert', 'sahara', 'survival', 'sand'],
  jungle: ['jungle', 'rainforest', 'amazon', 'expedition'],
  vampire: ['vampire', 'blood', 'undead', 'dracula'],
  werewolf: ['werewolf', 'wolf', 'transformation', 'lycanthropy'],
  superhero: ['superhero', 'superpower', 'comic book', 'marvel', 'dc'],
  spy: ['spy', 'espionage', 'secret agent', 'intelligence', 'cia'],
  espionage: ['espionage', 'spy', 'secret agent', 'intelligence'],
  pirate: ['pirate', 'ship', 'treasure', 'sea', 'ocean'],
  dinosaur: ['dinosaur', 'prehistoric', 'jurassic'],
  'serial killer': ['serial killer', 'murder', 'psychopath', 'killer'],
  murder: ['murder', 'detective', 'investigation', 'killer'],
  revenge: ['revenge', 'vengeance', 'retribution'],
  'coming of age': ['coming of age', 'growing up', 'teenager', 'adolescence'],
  'high school': ['high school', 'teenager', 'prom', 'coming of age'],
  friendship: ['friendship', 'best friend', 'bonds'],
  family: ['family', 'parent', 'siblings', 'domestic'],
  wedding: ['wedding', 'marriage', 'bride', 'ceremony'],
  divorce: ['divorce', 'separation', 'custody', 'breakup'],
  addiction: ['addiction', 'drugs', 'alcohol', 'recovery', 'rehab'],
  drugs: ['drugs', 'narcotics', 'trafficking', 'cartel'],
  poverty: ['poverty', 'homeless', 'struggle', 'hardship'],
  racism: ['racism', 'discrimination', 'prejudice', 'civil rights'],
  'mental health': ['mental health', 'depression', 'therapy', 'psychiatry', 'anxiety'],
  depression: ['depression', 'mental health', 'therapy', 'sad'],
  dream: ['dream', 'subconscious', 'surreal', 'imagination'],
  dreams: ['dream', 'subconscious', 'surreal', 'imagination'],
  apocalypse: ['apocalypse', 'end of the world', 'post-apocalyptic', 'extinction'],
  'post-apocalyptic': ['post-apocalyptic', 'apocalypse', 'survival', 'wasteland'],
  virus: ['virus', 'pandemic', 'outbreak', 'contagion', 'epidemic'],
  pandemic: ['pandemic', 'virus', 'outbreak', 'quarantine', 'epidemic'],
  island: ['island', 'stranded', 'tropical', 'survival'],
  bank: ['bank robbery', 'heist', 'robbery', 'vault'],
  robbery: ['robbery', 'heist', 'bank', 'theft', 'stealing'],
  casino: ['casino', 'gambling', 'poker', 'las vegas'],
  space: ['space', 'astronaut', 'nasa', 'cosmos', 'galaxy', 'planet'],
  mars: ['mars', 'space', 'planet', 'colonization'],
  moon: ['moon', 'lunar', 'space', 'astronaut'],
  'time travel': ['time travel', 'time machine', 'future', 'past', 'paradox'],
  parallel: ['parallel universe', 'multiverse', 'alternate reality'],
  simulation: ['simulation', 'virtual reality', 'matrix', 'computer'],
  'artificial intelligence': ['artificial intelligence', 'robot', 'ai', 'machine'],
  samurai: ['samurai', 'sword', 'japan', 'bushido', 'martial arts'],
  ninja: ['ninja', 'martial arts', 'japan', 'stealth'],
  racing: ['racing', 'car', 'speed', 'formula 1', 'nascar'],
};

// ─── Language Map ──────────────────────────────────────────────────
const LANGUAGE_MAP: Record<string, string> = {
  italian: 'it',
  french: 'fr',
  spanish: 'es',
  german: 'de',
  japanese: 'ja',
  korean: 'ko',
  chinese: 'zh',
  portuguese: 'pt',
  russian: 'ru',
  hindi: 'hi',
  swedish: 'sv',
  norwegian: 'no',
  danish: 'da',
  finnish: 'fi',
  dutch: 'nl',
  turkish: 'tr',
  arabic: 'ar',
  thai: 'th',
  polish: 'pl',
  greek: 'el',
  english: 'en',
  american: 'en',
  british: 'en',
  bollywood: 'hi',
  hebrew: 'he',
  czech: 'cs',
  hungarian: 'hu',
  romanian: 'ro',
  indonesian: 'id',
  malay: 'ms',
  filipino: 'tl',
  persian: 'fa',
  iranian: 'fa',
  vietnamese: 'vi',
};

// ─── Decade Patterns ───────────────────────────────────────────────
const DECADE_MAP: Record<string, { from: number; to: number }> = {
  '50s': { from: 1950, to: 1959 },
  '1950s': { from: 1950, to: 1959 },
  fifties: { from: 1950, to: 1959 },
  '60s': { from: 1960, to: 1969 },
  '1960s': { from: 1960, to: 1969 },
  sixties: { from: 1960, to: 1969 },
  '70s': { from: 1970, to: 1979 },
  '1970s': { from: 1970, to: 1979 },
  seventies: { from: 1970, to: 1979 },
  '80s': { from: 1980, to: 1989 },
  '1980s': { from: 1980, to: 1989 },
  eighties: { from: 1980, to: 1989 },
  '90s': { from: 1990, to: 1999 },
  '1990s': { from: 1990, to: 1999 },
  nineties: { from: 1990, to: 1999 },
  '2000s': { from: 2000, to: 2009 },
  '2010s': { from: 2010, to: 2019 },
  '2020s': { from: 2020, to: 2029 },
  classic: { from: 1920, to: 1975 },
  classics: { from: 1920, to: 1975 },
  old: { from: 1920, to: 1990 },
  modern: { from: 2010, to: 2029 },
  recent: { from: 2020, to: 2029 },
  new: { from: 2022, to: 2029 },
  latest: { from: 2024, to: 2029 },
  vintage: { from: 1920, to: 1969 },
  retro: { from: 1970, to: 1999 },
};

// ─── Similar-to patterns ───────────────────────────────────────────
const SIMILAR_TO_PATTERNS = [
  /(?:similar to|like|movies? like|films? like|something like|anything like|reminds? me of|in the style of|vibe of|same vibe as)\s+["""]?(.+?)["""]?\s*$/i,
  /^(?:something|anything|movies?|films?)\s+(?:similar to|like)\s+["""]?(.+?)["""]?\s*$/i,
  /["""](.+?)["""].*(?:vibes?|type|kind|style)/i,
];

// ─── Actor/Director patterns ───────────────────────────────────────
const PERSON_PATTERNS = {
  actor: [
    /(?:with|starring|acted by|featuring|has|stars?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
    /(?:movies?|films?)\s+(?:with|of|by|from|starring)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:movies?|films?)/gi,
  ],
  director: [
    /(?:directed by|director|by director|from director)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:directed|direction)/gi,
  ],
};

// ─── Filler words to strip ─────────────────────────────────────────
const FILLER_WORDS = new Set([
  'a', 'an', 'the', 'about', 'movie', 'movies', 'film', 'films',
  'show', 'me', 'find', 'recommend', 'recommendation', 'recommendations',
  'suggest', 'suggestion', 'suggestions', 'good', 'best', 'great',
  'and', 'or', 'with', 'from', 'in', 'of', 'on', 'up', 'want',
  'looking', 'for', 'something', 'give', 'get', 'can', 'you',
  'please', 'i', 'to', 'watch', 'see', 'that', 'is', 'are', 'was',
  'were', 'year', 'after', 'before', 'since', 'between', 'any',
  'some', 'really', 'very', 'quite', 'pretty', 'kind', 'type',
  'sort', 'bit', 'would', 'could', 'should', 'do', 'does', 'did',
  'have', 'has', 'had', "i'm", "i'd", "i've", "don't", "doesn't",
  'not', 'no', 'but', 'also', 'too', 'like', 'just', 'think',
  'know', 'need', 'what', 'which', 'where', 'when', 'how', 'who',
  'more', 'most', 'much', 'many', 'well', 'thing', 'things', 'love',
  'enjoy', 'loved', 'enjoyed', 'into', 'maybe', 'tonight', 'today',
  'now', 'right', 'been', 'it', 'its', "it's", 'my', 'your', 'our',
  'am', 'be', 'being', 'so', 'if', 'then', 'than', 'as', 'at',
]);

// ═══════════════════════════════════════════════════════════════════
// NLU Engine
// ═══════════════════════════════════════════════════════════════════
class NluEngine {
  /**
   * Analyzes a natural language movie search query and extracts structured
   * intents and entities for multi-strategy TMDB searching.
   */
  parse(query: string): ParsedQuery {
    const result: ParsedQuery = {
      intents: [],
      genres: [],
      language: null,
      yearFrom: null,
      yearTo: null,
      moods: [],
      themes: [],
      actorNames: [],
      directorNames: [],
      similarToMovies: [],
      keywords: [],
      searchText: '',
      responseHint: '',
    };

    const original = query.trim();
    let working = original.toLowerCase();

    // 1. Detect "similar to" intent first (highest priority — uses a different TMDB strategy)
    this.extractSimilarTo(original, result);
    if (result.similarToMovies.length > 0) {
      result.intents.push('similar_to_movie');
      result.responseHint = `movies similar to "${result.similarToMovies[0]}"`;
      logger.info('NLU parsed query', { query: original, parsed: result });
      return result;
    }

    // 2. Extract actor/director names (before lowercasing destroys casing)
    this.extractPersonNames(original, result);

    // 3. Extract decade/era references
    this.extractDecadeAndEra(working, result);

    // 4. Extract explicit year patterns
    working = this.extractYears(working, result);

    // 5. Extract language
    working = this.extractLanguage(working, result);

    // 6. Extract explicit genre names
    working = this.extractExplicitGenres(working, result);

    // 7. Expand synonyms to genres
    working = this.expandSynonyms(working, result);

    // 8. Detect moods and map to genres
    working = this.extractMoods(working, result);

    // 9. Extract themes and map to TMDB keywords
    working = this.extractThemes(working, result);

    // 10. Classify intents based on what we found
    this.classifyIntents(result);

    // 11. Build remaining search text / keywords
    this.extractRemainingKeywords(working, result);

    // 12. Generate response hint
    this.buildResponseHint(result, original);

    logger.info('NLU parsed query', { query: original, parsed: result });
    return result;
  }

  // ─── Private Extraction Methods ────────────────────────────────

  private extractSimilarTo(original: string, result: ParsedQuery): void {
    for (const pattern of SIMILAR_TO_PATTERNS) {
      const match = original.match(pattern);
      if (match?.[1]) {
        const movieTitle = match[1].replace(/["""]/g, '').trim();
        if (movieTitle.length > 1) {
          result.similarToMovies.push(movieTitle);
          return;
        }
      }
    }
  }

  private extractPersonNames(original: string, result: ParsedQuery): void {
    // Director patterns
    for (const pattern of PERSON_PATTERNS.director) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(original)) !== null) {
        const name = match[1].trim();
        if (name.split(' ').length >= 2 && !this.isCommonPhrase(name)) {
          result.directorNames.push(name);
        }
      }
    }

    // Actor patterns
    for (const pattern of PERSON_PATTERNS.actor) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(original)) !== null) {
        const name = match[1].trim();
        if (
          name.split(' ').length >= 2 &&
          !this.isCommonPhrase(name) &&
          !result.directorNames.includes(name)
        ) {
          result.actorNames.push(name);
        }
      }
    }
  }

  private extractDecadeAndEra(working: string, result: ParsedQuery): void {
    for (const [term, range] of Object.entries(DECADE_MAP)) {
      // Use word boundary matching for decade terms
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (regex.test(working)) {
        if (!result.yearFrom || range.from < result.yearFrom) {
          result.yearFrom = range.from;
        }
        if (!result.yearTo || range.to > result.yearTo) {
          result.yearTo = range.to;
        }
        result.intents.push('era_search');
        break;
      }
    }
  }

  private extractYears(working: string, result: ParsedQuery): string {
    // "between 2000 and 2010"
    const betweenMatch = working.match(/between\s*(\d{4})\s*(?:and|-)\s*(\d{4})/);
    if (betweenMatch) {
      result.yearFrom = parseInt(betweenMatch[1], 10);
      result.yearTo = parseInt(betweenMatch[2], 10);
      working = working.replace(betweenMatch[0], ' ');
    }

    // "from year 2000" / "after 2000" / "since 2000"
    if (!result.yearFrom) {
      const fromMatch = working.match(/(?:from|after|since|from year|after year)\s*(\d{4})/);
      if (fromMatch) {
        result.yearFrom = parseInt(fromMatch[1], 10);
        working = working.replace(fromMatch[0], ' ');
      }
    }

    // "before 2020" / "until 2020"
    if (!result.yearTo) {
      const toMatch = working.match(/(?:before|until|up to|to year)\s*(\d{4})/);
      if (toMatch) {
        result.yearTo = parseInt(toMatch[1], 10);
        working = working.replace(toMatch[0], ' ');
      }
    }

    // Standalone year "2023"
    if (!result.yearFrom && !result.yearTo) {
      const standaloneYear = working.match(/\b(19\d{2}|20\d{2})\b/);
      if (standaloneYear) {
        result.yearFrom = parseInt(standaloneYear[1], 10);
        result.yearTo = parseInt(standaloneYear[1], 10);
        working = working.replace(standaloneYear[0], ' ');
      }
    }

    return working;
  }

  private extractLanguage(working: string, result: ParsedQuery): string {
    for (const [lang, code] of Object.entries(LANGUAGE_MAP)) {
      const regex = new RegExp(`\\b${lang}\\b`);
      if (regex.test(working)) {
        result.language = code;
        working = working.replace(regex, ' ');
        break;
      }
    }
    return working;
  }

  private extractExplicitGenres(working: string, result: ParsedQuery): string {
    // Sort by length descending so "science fiction" matches before "fiction"
    const sortedGenres = Object.entries(GENRE_MAP).sort((a, b) => b[0].length - a[0].length);
    for (const [genreName, genreId] of sortedGenres) {
      const regex = new RegExp(`\\b${genreName}\\b`, 'g');
      if (regex.test(working)) {
        if (!result.genres.includes(genreId)) {
          result.genres.push(genreId);
        }
        working = working.replace(new RegExp(`\\b${genreName}\\b`, 'g'), ' ');
      }
    }
    return working;
  }

  private expandSynonyms(working: string, result: ParsedQuery): string {
    // Sort by length descending for multi-word synonyms
    const sortedSynonyms = Object.entries(SYNONYM_TO_GENRES).sort((a, b) => b[0].length - a[0].length);
    for (const [synonym, genreIds] of sortedSynonyms) {
      const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      if (regex.test(working)) {
        for (const gid of genreIds) {
          if (!result.genres.includes(gid)) {
            result.genres.push(gid);
          }
        }
        working = working.replace(regex, ' ');
      }
    }
    return working;
  }

  private extractMoods(working: string, result: ParsedQuery): string {
    for (const [mood, genreIds] of Object.entries(MOOD_TO_GENRES)) {
      const regex = new RegExp(`\\b${mood}\\b`);
      if (regex.test(working)) {
        result.moods.push(mood);
        // Add genre suggestions from mood (only if we don't already have enough genres)
        if (result.genres.length < 3) {
          for (const gid of genreIds) {
            if (!result.genres.includes(gid)) {
              result.genres.push(gid);
            }
          }
        }
        working = working.replace(regex, ' ');
      }
    }
    return working;
  }

  private extractThemes(working: string, result: ParsedQuery): string {
    // Sort by length descending for multi-word themes
    const sortedThemes = Object.entries(THEME_TO_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
    for (const [theme, themeKeywords] of sortedThemes) {
      const regex = new RegExp(`\\b${theme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (regex.test(working)) {
        result.themes.push(theme);
        result.keywords.push(...themeKeywords.slice(0, 3)); // Take top 3 keyword terms
        working = working.replace(regex, ' ');
      }
    }
    return working;
  }

  private classifyIntents(result: ParsedQuery): void {
    if (result.actorNames.length > 0) result.intents.push('actor_search');
    if (result.directorNames.length > 0) result.intents.push('director_search');
    if (result.moods.length > 0) result.intents.push('mood_search');
    if (result.themes.length > 0) result.intents.push('theme_search');
    if (result.genres.length > 0 && result.intents.length === 0) result.intents.push('genre_search');
    if (result.yearFrom && !result.intents.includes('era_search')) result.intents.push('era_search');
    if (result.intents.length === 0) result.intents.push('general_search');
  }

  private extractRemainingKeywords(working: string, result: ParsedQuery): string {
    const meaningful = working
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9'-]/g, ''))
      .filter((w) => w.length > 2 && !FILLER_WORDS.has(w));

    // Add non-duplicate keywords
    for (const word of meaningful) {
      if (!result.keywords.includes(word)) {
        result.keywords.push(word);
      }
    }

    result.searchText = meaningful.join(' ').trim();
    return working;
  }

  private buildResponseHint(result: ParsedQuery, original: string): void {
    const parts: string[] = [];

    if (result.moods.length > 0) {
      parts.push(`${result.moods.join(' and ')} movies`);
    }

    if (result.themes.length > 0) {
      parts.push(`movies about ${result.themes.join(' and ')}`);
    }

    if (result.actorNames.length > 0) {
      parts.push(`movies with ${result.actorNames.join(' and ')}`);
    }

    if (result.directorNames.length > 0) {
      parts.push(`movies directed by ${result.directorNames.join(' and ')}`);
    }

    if (result.language) {
      const langName = Object.entries(LANGUAGE_MAP).find(([, code]) => code === result.language)?.[0];
      if (langName) parts.push(`${langName} films`);
    }

    if (result.yearFrom && result.yearTo && result.yearFrom !== result.yearTo) {
      parts.push(`from ${result.yearFrom}–${result.yearTo}`);
    } else if (result.yearFrom) {
      parts.push(`from ${result.yearFrom}`);
    }

    result.responseHint = parts.length > 0 ? parts.join(', ') : `"${original}"`;
  }

  private isCommonPhrase(name: string): boolean {
    const common = new Set([
      'Science Fiction', 'Star Wars', 'New York', 'Los Angeles',
      'San Francisco', 'World War', 'United States', 'True Story',
      'Real Life', 'Based On', 'High School', 'Wild West',
    ]);
    return common.has(name);
  }
}

export const nluEngine = new NluEngine();
