# CricGuess — Mode Plugin Interface Specification

Every game mode in CricGuess is an isolated, self-contained ES module located in `/js/modes/`. This architecture allows new game modes (e.g., Time Attack, IPL Special, Legend Quiz, World Cup Edition) to be added without modifying core game logic or breaking existing modes.

---

## 1. The `GameMode` Interface

A mode module must `export default` an object conforming to the following shape:

```typescript
interface GameMode {
  // Metadata
  id: string;               // Unique slug, e.g. 'daily' or 'unlimited'
  name: string;             // Display name, e.g. 'Daily Challenge'
  description: string;      // One-line summary of rules
  icon: string;             // Emoji icon, e.g. '📅' or '♾️'
  route: string;            // Route slug, e.g. 'daily' or 'unlimited'

  // Lifecycle Methods
  init(context: ModeContext): Promise<void>;
  start(): void;
  getPuzzle(): PuzzleData | null;
  handleGuess(player: Cricketer): GuessResult;
  render(container: HTMLElement): void;
  onEnd(result: GuessResult): void;
  destroy(): void;
  getShareText(result: GuessResult): string;

  // SEO & Schema
  seo: {
    title: string;
    description: string;
    jsonLd?: object;
  };

  // Advertising configuration
  ads?: {
    slots: string[];
  };
}
```

---

## 2. Mode Context

When `init(context)` is called, the mode receives an object providing all necessary shared services:

```typescript
interface ModeContext {
  data: typeof import('../core/data-service.js');
  storage: {
    save(key: string, value: any): void;
    load(key: string, defaultValue?: any): any;
    remove(key: string): void;
    clear(): void;
  };
  stats: ReturnType<typeof import('../services/stats-service.js').createStatsService>;
  events: ReturnType<typeof import('../core/event-bus.js').createEventBus>;
  ui: {
    showToast: (message: string, type?: 'success'|'error'|'info') => void;
    openModal: (backdrop: HTMLElement) => void;
    closeModal: (backdrop?: HTMLElement) => void;
    fireConfetti: () => void;
  };
  config: typeof import('../config.js');
}
```

---

## 3. Guess Result

Returned by `handleGuess(player)`:

```typescript
interface GuessResult {
  correct: boolean;
  attemptNumber: number;        // 1-based (1..6)
  gameOver: boolean;
  won: boolean;
  revealedClue: string | null;  // Next clue if incorrect and game continues
  answer: Cricketer | null;     // Revealed on game over
  funFact: string | null;       // Trivia revealed on game over
}
```

---

## 4. How to Add a New Mode (5 Steps)

1. Create `/js/modes/my-mode.js` implementing this interface.
2. Register it in `/js/modes/registry.js`.
3. Add custom styles in `/css/modes/my-mode.css` scoped under `.mode-my-mode`.
4. (Optional) Create `my-mode.html` page shell or let `index.html` link to it.
5. That's it! Navigation, stats, and SEO reflect the new mode automatically.
