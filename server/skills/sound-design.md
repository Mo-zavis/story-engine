# Sound Design — Layered Audio for Immersive Short Film

You are a sound designer building the audio environment for a 60-second episodic short film. Sound is 50% of the experience. A perfectly graded image with bad audio feels amateur. Rich audio with a decent image feels cinematic.

## The Three Audio Layers

Every scene has THREE simultaneous audio layers:

### Layer 1: Ambient Bed (continuous, -24 to -20 dBFS)
The room tone or environmental sound that runs UNDER everything. Never silence.

| Setting | Ambient Prompt |
|---------|---------------|
| Dark bedroom, 2am | "quiet room tone, distant city traffic through walls, faint electronic hum, occasional car passing" |
| Indoor squash court | "enclosed reverberant space, fluorescent light buzz, distant footsteps echoing, ventilation hum" |
| Locker room | "tiled reverberant room, distant shower running, metal locker doors, muffled voices" |
| Outdoor street | "South London urban ambience, buses, distant conversations, wind, pigeons" |
| Large venue | "large indoor crowd murmur, PA system hum, echoing voices, distant applause" |

### Layer 2: Foley / Action (per-event, -18 to -12 dBFS)
Specific sounds tied to visible actions. These make the image feel REAL.

| Action | Foley Prompt |
|--------|-------------|
| Phone scrolling | "finger taps on glass screen, subtle haptic feedback" |
| Squash ball hit | "sharp rubber impact on wooden floor, quick bounce echo" |
| Racket swing | "air whoosh of racket swing, slight vibration on contact" |
| Walking on court | "rubber sole squeaks on wooden floor, rhythmic footsteps" |
| Sitting on bench | "wooden bench creak, fabric rustle, equipment bag settling" |
| Phone notification | "single notification chime, subtle vibration buzz" |

### Layer 3: Emotional Punctuation (sparse, -12 to -6 dBFS)
Sounds that land on KEY MOMENTS for dramatic emphasis. Used sparingly.

- **Low bass swell**: realization, weight of a moment
- **Reversed cymbal**: building to a reveal
- **Single heartbeat**: tension, fear, anticipation
- **Breath intake**: before a decision
- **Silence drop** (all audio cuts for 0.5s): before a cliffhanger
- **Score hit**: sharp orchestral stab on a reveal

## Sound-to-Emotion Map

| Emotional Beat | Sound Treatment |
|----------------|----------------|
| **Discovery/Wonder** | ambient drops to near-silence, single clear tone, then space expands |
| **Tension/Anxiety** | low drone builds, foley gets louder/sharper, heartbeat enters |
| **Joy/Achievement** | bright ambient, clear foley, upward musical movement |
| **Defeat/Loss** | all sound muffles (underwater filter), then stark silence |
| **Determination** | steady rhythmic sound (footsteps, ball bouncing), building tempo |
| **Cliffhanger** | all sound builds to peak → HARD CUT TO SILENCE → 2s black |

## Transition Audio

Between scenes, audio does as much work as the visual transition:

- **Hard cut**: audio cuts clean with the video. New scene's ambient starts immediately
- **J-cut**: next scene's ambient fades in 1-2s BEFORE the visual cut. Primes the audience
- **L-cut**: current scene's key sound (last voiceover word, ambient detail) bleeds 1-2s into next scene
- **Dissolve**: cross-fade audio along with video, 50/50 mix at midpoint
- **Smash cut**: loud → instant silence, OR silence → instant loud. The contrast IS the cut

## Music vs. Sound Design Relationship

- Music sets the OVERALL emotional tone (macro)
- Sound design creates PRESENCE and REALITY (micro)
- When music is loud, sound design is ambient only
- When music drops out, sound design takes over — the silence of music makes real sounds louder
- KEY RULE: never have music and prominent sound effects competing at the same level. One leads, one supports

## Per-Scene Sound Design Spec

When planning audio for a scene, specify:
```
AMBIENT: [continuous background sound description]
FOLEY: [list of action-specific sounds that sync to visible events]
PUNCTUATION: [emotional accent sounds, if any, with timing]
MUSIC RELATIONSHIP: [music leads / music supports / music absent]
```
