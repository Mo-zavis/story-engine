import type { Node, Edge } from '@xyflow/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WFNode = Node<Record<string, any>>;

export const FSP_UNDERDOG_TEMPLATE: { name: string; nodes: WFNode[]; edges: Edge[] } = {
  name: 'FSP — The Underdog (5 Episodes)',
  nodes: [
    // ── SHARED: Series concept + Character ───────────────────────────────────
    {
      id: 'n_concept',
      type: 'storyConcept',
      position: { x: 50, y: 500 },
      data: {
        type: 'storyConcept',
        label: 'The Underdog — Series Bible',
        status: 'idle',
        outputs: {},
        concept: `FSP Content Series "The Underdog" — Kofi Mensah, 19, from Brixton South London. Works part-time at Tesco Express. Posts gym clips and gaming content to 2,300 TikTok followers. Has zero squash experience. One night at 2am the algorithm serves him a Ramy Ashour highlights reel from the 2014 World Championship final — Ashour limping but still winning ElShorbagy in five games. Kofi is transfixed. He starts a 100-day squash challenge the next morning. He films every session. He discovers the FSP app and realises he can submit challenge videos, climb leaderboards, and potentially qualify for the WPS World Premier Squash Finals. Five episodes. Five cliffhangers. One question: how far can 100 days take an absolute beginner from a Brixton leisure centre with 2,300 followers and a borrowed racket? The series runs across the FSP qualification timeline — Discovery, Grind, Rise, Fall, and Arrival. Every episode ends with a cliffhanger: the last 5 seconds reframe everything the viewer just watched. Something shifts. The screen cuts to black one beat before the answer. They have to come back.`,
        genre: 'Sports Documentary',
        tone: 'Cinematic',
        targetDuration: 60,
      },
    },
    {
      id: 'n_kofi',
      type: 'character',
      position: { x: 50, y: 900 },
      data: {
        type: 'character',
        label: 'Kofi Mensah',
        status: 'done',
        outputs: { character: { id: 'char_kofi', name: 'Kofi Mensah', imageUrl: '/assets/outputs/characters/kofi_mensah_ref.png' }, image: '/assets/outputs/characters/kofi_mensah_ref.png' },
        imageUrl: '/assets/outputs/characters/kofi_mensah_ref.png',
        characterName: 'Kofi Mensah',
        description: `PHYSICAL: Ghanaian-British, 19 years old, 5'10", lean athletic build (gym-trained, not bulky — think sprinter physique). Dark brown skin, deep warm undertones. Sharp prominent jawline, slightly broad nose, full lips. Dark brown expressive eyes — the kind that communicate before he speaks. Short natural hair: tight fade on sides (grade 1), about 1 inch of loose texture on top, no product. Clean-shaven — his youth is critical to the story. He looks exactly 19.

COSTUME BIBLE (maintain strict continuity):
• Episodes 1–2 (early days): Faded dark charcoal Adidas hoodie (small white trefoil logo, slightly bobbled from washing), black Nike Dri-FIT shorts, well-worn white Nike Air Force 1 (right toe box slightly scuffed yellow). This is his daily uniform.
• Episode 3 (bracket): Same hoodie + a blue FSP wristband he's started wearing. Shoes slightly cleaner — he's started caring.
• Episode 4 (loss / return): Plain white oversized t-shirt, black Adidas tracksuit bottoms. New Dunlop Precision Pro racket — gift from the Arena Owner.
• Episode 5 (WPS): White Under Armour compression top, navy Adidas track jacket (zipped to mid-chest), proper white Wilson squash shoes. Same beaten-up black Nike drawstring bag from Day 1 — the one constant.

IDENTITY MARKERS (use in every frame): LEFT-HANDED. Cracked phone screen (hairline crack bottom-right corner). Always self-filming — phone propped on a water bottle or tucked into bag strap.

CINEMATOGRAPHY: Available light only — never ring lights or artificial fill. Barry Jenkins (Moonlight) meets Steve McQueen's documentary realism. Court scenes: overhead institutional fluorescent (green-tinged 4000K), let it be ugly and real. Bedroom/night scenes: phone screen is the SOLE light source. WPS venue: allow hard professional overhead shadows. Never correct the colour temperature mix — the collision of light sources IS the aesthetic.`,
        style: 'cinematic photorealistic, Barry Jenkins / Steve McQueen visual language, available light only, no artificial staging, authentic South London documentary aesthetic',
      },
    },

    // ── EPISODE 1: The Spark ──────────────────────────────────────────────────
    {
      id: 'n_sb1',
      type: 'storyboard',
      position: { x: 500, y: 300 },
      data: { type: 'storyboard', label: 'Ep 1: The Spark', status: 'idle', outputs: {} },
    },
    {
      id: 'n_f1a',
      type: 'frameGenerator',
      position: { x: 900, y: 50 },
      data: {
        type: 'frameGenerator',
        label: 'Ep1 — 2am Algorithm Moment',
        status: 'done',
        imageUrl: '/assets/outputs/frames/scene1_2am_frame.png',
        outputs: { image: '/assets/outputs/frames/scene1_2am_frame.png' },
        imagePrompt: `SHOT: Extreme Close-Up (ECU). Frame from below the nose to just above the hairline — only the face, filling the frame vertically.

SUBJECT: Kofi Mensah — Ghanaian-British male, 19 years old. Dark brown skin with warm undertones. Sharp prominent jawline. Short natural hair, tight fade on sides. Dark brown eyes, wide open, pupils slightly dilated. Clean-shaven. No performance — pure involuntary fascination on his face.

ACTION: He is lying in bed at 2am, phone held below frame, watching a Ramy Ashour squash highlight. His face is the story. Eyes locked on the screen, still as a statue, mouth slightly open. This is the moment before his life changes — he doesn't know it yet but we can see it happening.

LIGHTING: SINGLE SOURCE ONLY — phone screen (6500K cool blue-white) illuminating from below-right, creating dramatic upward shadows. Cheekbones catch the light as sharp highlights. Under-eye hollows fall into shadow. Forehead and top of head fade into darkness. This is pure chiaroscuro — like Caravaggio shot on a film set. Zero fill, zero ambient.

COLOR PALETTE: Deep teal in the shadows, saturated electric blue from the phone screen, warm amber fighting through in his skin tones. Reference: the pool scene color palette from Barry Jenkins' Moonlight (2016).

DEPTH OF FIELD: Razor-thin. f/1.4 equivalent. Only his eyes are sharp — everything else (tip of nose, ears, background) falls into soft bokeh.

BACKGROUND: Complete darkness. Faint silhouette of trainers and a chair — barely discernible. This is a room at 2am with all lights off.

COMPOSITION: 9:16 vertical frame for Instagram Reel. Face fills 65-70% of frame. Phone screen glow just visible at bottom edge as a light source artifact. Leave headroom at top.

REFERENCE: Barry Jenkins (Moonlight), Euphoria (HBO) cinematography by Marcell Rév. NOT a lifestyle photo — a character study.`,
        style: 'cinematic photorealistic, Moonlight/Euphoria visual language, extreme chiaroscuro, phone screen as sole light (6500K from below-right), teal-blue shadows with warm skin tone contrast, razor shallow depth of field f/1.4, 85mm portrait lens equivalent',
        aspectRatio: '9:16' as const,
        sceneId: 'scene_1',
      },
    },
    {
      id: 'n_f1b',
      type: 'frameGenerator',
      position: { x: 900, y: 380 },
      data: {
        type: 'frameGenerator',
        label: 'Ep1 — Day 1 Brixton Court',
        status: 'done',
        imageUrl: '/assets/outputs/frames/scene2_day1_frame.png',
        outputs: { image: '/assets/outputs/frames/scene2_day1_frame.png' },
        imagePrompt: `SHOT: Medium Wide Shot (MWS) with a slight 4-degree dutch angle — the camera is tilted just enough to feel unstable, reflecting his disorientation as a complete beginner.

SUBJECT: Kofi Mensah — 19, Ghanaian-British male. Dark brown skin, athletic build, 5'10". Wearing: faded dark charcoal Adidas hoodie (slightly bobbled), black Nike Dri-FIT shorts, white Air Force 1s (right toe box slightly scuffed). He is LEFT-HANDED, holding a borrowed wooden squash racket (not modern graphite — an old club loaner, scratched and worn). He stands mid-court, slightly off-centre, looking around the space trying to figure out where to stand.

SETTING: Interior squash court at a Brixton community leisure centre — NOT a private club. This is municipal sport. Overhead institutional fluorescent strip lights (4000K with a slight green cast — do NOT correct this, it is part of the aesthetic). Scuffed hardwood floor with faded painted court markings in red and white — years of play visible in every scrape. White walls covered in ball marks and long-dried sweat trails. The TIN at the bottom of the front wall must be clearly visible (a red strip approximately 48cm high). The OUT LINE painted on the side walls must be visible. This establishes squash's visual language for the viewer.

ACTION: Mid-first-swing — the ball has just hit the floor rather than the front wall. It's rolling away uselessly. His mouth is open in a laugh. He's terrible and he knows it and he doesn't care. Energy is loose and open. This is Day 1 of something.

LIGHTING: Overhead fluorescent only. Hard downward shadows under his chin, nose, brows. No window light — this court is likely underground/basement level. Let the green cast live in the shadows. Slightly underexposed overall.

DEPTH OF FIELD: f/2.8 — he's sharp, court walls behind him are soft but readable.

COLOR GRADE: Desaturated 20%. Slightly crushed blacks. Green push in shadow tones. Authentic council-facility colour — not cleaned up, not corrected. His skin tones and the red tin are the only warm elements.

COMPOSITION: 9:16 vertical. He is centre-frame but small relative to the court — walls tower around him on both sides. The tin runs across the bottom third. Leave space above his head to show the height of the court.

REFERENCE: Ken Loach social realism. Steve McQueen's 12 Years a Slave location work. Authentic British sport documentary photography.`,
        style: 'cinematic photorealistic documentary, institutional fluorescent 4000K with green cast, 24mm wide-angle lens, slight dutch angle 4 degrees, desaturated grade, authentic municipal squash court, social realism aesthetic',
        aspectRatio: '9:16' as const,
        sceneId: 'scene_2',
      },
    },
    {
      id: 'n_f1c',
      type: 'frameGenerator',
      position: { x: 900, y: 710 },
      data: {
        type: 'frameGenerator',
        label: 'Ep1 — The App Discovery',
        status: 'done',
        imageUrl: '/assets/outputs/frames/scene3_app_frame.png',
        outputs: { image: '/assets/outputs/frames/scene3_app_frame.png' },
        imagePrompt: `SHOT: Medium Close-Up (MCU). Camera at chest height, pointing slightly upward — a low angle that gives him just a hint of agency and significance in the frame. Subject fills upper 55% of the vertical frame.

SUBJECT: Kofi Mensah — 19, Ghanaian-British male. Still in his training kit: faded charcoal Adidas hoodie, black shorts. Visibly post-session: small sweat patch on hoodie collar, slightly damp at temples. He is holding his phone with BOTH HANDS — elbows resting on knees, leaning forward. The phone screen is partially visible to the viewer (tilted 30 degrees toward camera) showing an app interface with leaderboard rankings and the text "WPS World Premier Squash Finals" in white type.

ACTION: THE EXACT MOMENT his face changes. He has just read those five words — WPS World Premier Squash Finals — and something is shifting in real time. Eyes slightly wider. He's leaning forward 5 degrees more than a second ago. His jaw is set differently. This is not a dramatic performance — it's a private, involuntary micro-expression of recalibration. The challenge just got a destination.

SETTING: Changing area bench at Brixton leisure centre. Wooden slatted bench with dark lacquer worn off at the centre from years of use. Metal locker doors slightly out of focus in the background (olive green, dented). His black drawstring gym bag open on the floor. Yellow squash ball visible next to his bag. Borrowed racket leaning against locker to his right.

LIGHTING: DUAL SOURCE — warm tungsten overhead practical (3200K amber ceiling light, the practicals of the changing room) hitting right side of face and background. Cool phone screen (6500K blue-white) hitting left cheekbone and left eye from below. The two colour temperatures collide on his face — warm right half, cool left half. Do NOT correct this split. It is cinematic and deliberate.

DEPTH OF FIELD: f/2.0, 50mm equivalent. He is sharp. Background lockers are soft but readable.

COLOR GRADE: Warm amber dominates the frame with cool accent on his left from the phone. Rich saturated skin tones. The phone screen is the brightest point in the frame.

COMPOSITION: 9:16 vertical. His face and phone screen dominate the upper two-thirds. Gym bag and ball visible in the lower third for context. Leave no dead space.

REFERENCE: The intimacy of Moonlight's dialogue scenes. The turning-point composition language of Bicycle Thieves.`,
        style: 'cinematic photorealistic, 50mm lens f/2, dual colour temperature: tungsten 3200K right side / phone screen 6500K left side — collision deliberate, warm amber ambient with cool phone accent, authentic sports locker room, intimate turning-point framing',
        aspectRatio: '9:16' as const,
        sceneId: 'scene_3',
      },
    },
    {
      id: 'n_a1a',
      type: 'animation',
      position: { x: 1280, y: 50 },
      data: { type: 'animation', label: 'Animate: S1 2am', status: 'done', sceneIndex: 0, sceneType: 'still_moment', videoUrl: '/assets/outputs/videos/scene1_2am_clip.mp4', outputs: { video: '/assets/outputs/videos/scene1_2am_clip.mp4' }, motionPreset: 'drift_up', durationSeconds: 5 },
    },
    {
      id: 'n_a1b',
      type: 'animation',
      position: { x: 1280, y: 350 },
      data: { type: 'animation', label: 'Animate: S2 Day 1', status: 'done', sceneIndex: 1, sceneType: 'action', videoUrl: '/assets/outputs/videos/scene2_day1_clip.mp4', outputs: { video: '/assets/outputs/videos/scene2_day1_clip.mp4' }, motionPreset: 'handheld', durationSeconds: 6 },
    },
    {
      id: 'n_a1c',
      type: 'animation',
      position: { x: 1280, y: 650 },
      data: { type: 'animation', label: 'Animate: S3 App', status: 'done', sceneIndex: 2, sceneType: 'still_moment', videoUrl: '/assets/outputs/videos/scene3_app_clip.mp4', outputs: { video: '/assets/outputs/videos/scene3_app_clip.mp4' }, motionPreset: 'push_in', durationSeconds: 5 },
    },
    // ── Per-scene SFX nodes ──
    {
      id: 'n_sfx1a',
      type: 'sfx',
      position: { x: 1650, y: -120 },
      data: { type: 'sfx', label: 'SFX: S1', status: 'idle', outputs: {}, sceneIndex: 0, sceneLabel: 'S1 The Glow', ambientPrompt: 'quiet dark bedroom at 2am, distant Brixton night traffic through walls, faint electronic hum, occasional car passing outside', foleyPrompt: 'tinny phone speaker audio bleed of a squash rally, rubber on tin barely audible', transitionSound: 'squash match audio swelling from phone speaker, crowd gasping', prelapMs: 400 },
    },
    {
      id: 'n_sfx1b',
      type: 'sfx',
      position: { x: 1650, y: 130 },
      data: { type: 'sfx', label: 'SFX: S2', status: 'idle', outputs: {}, sceneIndex: 1, sceneLabel: 'S2 Day 1', ambientPrompt: 'indoor squash court, fluorescent light buzz, enclosed reverberant space, ventilation hum', foleyPrompt: 'racket whoosh through air, ball hitting floor with dead thud, ball bouncing twice, rubber sole squeaks on hardwood, laughing breath', transitionSound: 'morning traffic hum, bus airbrake hiss, birds', prelapMs: 350 },
    },
    {
      id: 'n_sfx1c',
      type: 'sfx',
      position: { x: 1650, y: 380 },
      data: { type: 'sfx', label: 'SFX: S3', status: 'idle', outputs: {}, sceneIndex: 2, sceneLabel: 'S3 The App', ambientPrompt: 'locker room ambient, tiled reverberant space, distant shower, muffled voices', foleyPrompt: 'finger taps on glass phone screen, subtle haptic clicks, app loading chime', transitionSound: 'score loading ticking sound, heartbeat pulse fading in', prelapMs: 300 },
    },
    // ── Per-scene voiceovers (audio drives video duration) ──
    {
      id: 'n_vo1a',
      type: 'voiceover',
      position: { x: 1500, y: -50 },
      data: {
        type: 'voiceover',
        label: 'VO: S1 The Glow',
        status: 'idle',
        outputs: {},
        sceneIndex: 0,
        script: `Two AM. Everyone in the house is asleep.`,
        narratorProfile: 'storyteller',
      },
    },
    {
      id: 'n_vo1b',
      type: 'voiceover',
      position: { x: 1500, y: 200 },
      data: {
        type: 'voiceover',
        label: 'VO: S2 The Impossible',
        status: 'idle',
        outputs: {},
        sceneIndex: 1,
        script: `The algorithm gave me Ramy Ashour. A man playing on ONE leg — winning on one leg — against the best player on EARTH.`,
        narratorProfile: 'storyteller',
      },
    },
    {
      id: 'n_vo1c',
      type: 'voiceover',
      position: { x: 1500, y: 450 },
      data: {
        type: 'voiceover',
        label: 'VO: S3–4 The Lie + The Wall',
        status: 'idle',
        outputs: {},
        sceneIndex: 2,
        script: `Day one. I told the front desk I'd played before. I hit the tin nine times out of ten. The ball didn't go where I LOOKED. Nothing worked the way my body expected.`,
        narratorProfile: 'storyteller',
      },
    },
    {
      id: 'n_mu1',
      type: 'music',
      position: { x: 1620, y: 580 },
      data: { type: 'music', label: 'Ep 1 Music', status: 'done', audioUrl: '/assets/outputs/music/ep1_music.wav', outputs: { audio: '/assets/outputs/music/ep1_music.wav' }, mood: 'emotional', genre: 'cinematic' },
    },
    {
      id: 'n_co1',
      type: 'compile',
      position: { x: 1960, y: 330 },
      data: { type: 'compile', label: 'Compile Ep 1', status: 'done', videoUrl: '/assets/outputs/videos/THE_UNDERDOG_EP1_THE_SPARK.mp4', outputs: { video: '/assets/outputs/videos/THE_UNDERDOG_EP1_THE_SPARK.mp4' }, title: 'The Underdog — Episode 1: The Spark', scenes: [] },
    },
    {
      id: 'n_ex1',
      type: 'export',
      position: { x: 2280, y: 330 },
      data: {
        type: 'export',
        label: 'Export Ep 1',
        status: 'done',
        exportedUrl: '/assets/outputs/videos/THE_UNDERDOG_EP1_THE_SPARK.mp4',
        outputs: { exported: '/assets/outputs/videos/THE_UNDERDOG_EP1_THE_SPARK.mp4' },
        platform: 'instagram_reel',
        caption: `I just found the most underrated sport on the planet. And I think I just found the app that's going to change my life. Episode 2 drops next week. #FSP #100DaySquashChallenge #TheUnderdog #Squash #Brixton`,
        hashtags: ['FSP', '100DaySquashChallenge', 'TheUnderdog', 'Squash', 'Brixton', 'WPS', 'SportsTok'],
      },
    },

    // ── EPISODE 2: The Climb ──────────────────────────────────────────────────
    {
      id: 'n_sb2',
      type: 'storyboard',
      position: { x: 500, y: 1100 },
      data: { type: 'storyboard', label: 'Ep 2: The Climb', status: 'idle', outputs: {} },
    },
    {
      id: 'n_f2a',
      type: 'frameGenerator',
      position: { x: 900, y: 950 },
      data: {
        type: 'frameGenerator',
        label: 'Score Reveal — Bottom 40%',
        status: 'idle',
        outputs: {},
        imagePrompt: `Close-up portrait: young Black British man (19) in gym clothes reacting to a score on his phone screen. The phone shows an FSP app leaderboard: "Regional Rank: Bottom 40%". His expression is not crushed — it's determined. Jaw set. He screenshots it. The phone screen illuminates his face in a dim environment. This is "that's the baseline, now we move." He'll turn to camera in the next beat. Cinematic close-up portrait with phone screen as light source. Vertical 9:16.`,
        style: 'cinematic photorealistic, close-up portrait, phone screen illuminating face from below, determined expression, documentary grade',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_f2b',
      type: 'frameGenerator',
      position: { x: 900, y: 1250 },
      data: {
        type: 'frameGenerator',
        label: 'Leaderboard Climbing',
        status: 'idle',
        outputs: {},
        imagePrompt: `Dynamic composition showing a leaderboard ranking sequence. A phone screen with the FSP app showing numbers ticking upward: 847th → 312th → 94th → 47th — large bold white typography overlaid on a dark background. Underneath, glimpses of a squash court: shots getting crisper, movement getting more intentional across the days. Timestamps appear: Day 40, Day 48, Day 55, Day 61. The visual rhythm accelerates. Colors shift from desaturated early sessions to warmer more saturated as the rank climbs. Documentary motion graphics aesthetic layered on authentic footage. 9:16 vertical.`,
        style: 'cinematic documentary with motion graphic overlays, bold typography, progression color grade from desaturated to warm',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_f2c',
      type: 'frameGenerator',
      position: { x: 900, y: 1550 },
      data: {
        type: 'frameGenerator',
        label: 'The DM from Arena Owner',
        status: 'idle',
        outputs: {},
        imagePrompt: `Young Black British man (19) sitting in a leisure centre corridor after a session, reading a DM on his phone with a barely-contained emotional reaction. The DM text on screen reads: "Been watching your run. Your movement is raw but your read of the ball is sharp. Keep posting." — from a verified PSA professional squash player account. His face: 19-year-old kid who just got acknowledged by someone he studies at 1am. He's visibly shaken. He doesn't play it cool. Phone tilted so both his face and the DM screen are visible. Evening fluorescent corridor light. He's sweaty from training. 9:16 vertical.`,
        style: 'cinematic photorealistic documentary, emotional portrait, authentic stunned reaction, fluorescent corridor light, phone screen glow',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_a2a',
      type: 'animation',
      position: { x: 1280, y: 950 },
      data: { type: 'animation', label: 'Animate: Score', status: 'idle', outputs: {}, motionPreset: 'zoom_in', durationSeconds: 4 },
    },
    {
      id: 'n_a2b',
      type: 'animation',
      position: { x: 1280, y: 1250 },
      data: { type: 'animation', label: 'Animate: Climb', status: 'idle', outputs: {}, motionPreset: 'pan_right', durationSeconds: 8 },
    },
    {
      id: 'n_a2c',
      type: 'animation',
      position: { x: 1280, y: 1550 },
      data: { type: 'animation', label: 'Animate: DM', status: 'idle', outputs: {}, motionPreset: 'drift', durationSeconds: 5 },
    },
    {
      id: 'n_vo2',
      type: 'voiceover',
      position: { x: 1620, y: 1050 },
      data: {
        type: 'voiceover',
        label: 'Episode 2 Narration',
        status: 'idle',
        outputs: {},
        script: `That's the baseline. Now we move. Day 40. Day 48. Day 55. Day 61. The leaderboard number keeps climbing. Still at the Brixton leisure centre. Still in gym shorts. Still self-taught. But something changed. My shots have intent. I'm reading the angles before the ball arrives. The coaching videos, the Ashour breakdowns, the solo drills at 7am before my Tesco shift — it's all compounding. I'm in the knockout bracket. 32 people. I've been playing for 68 days. Everyone else in here has years on me. Arena affiliations. Coaches. Proper kit. I've got a borrowed racket and a leisure centre in Brixton. They gave me the number 1 seed in round 1. Day 68.`,
        narratorProfile: 'storyteller',
      },
    },
    {
      id: 'n_mu2',
      type: 'music',
      position: { x: 1620, y: 1480 },
      data: { type: 'music', label: 'Ep 2 Music', status: 'idle', outputs: {}, mood: 'uplifting', genre: 'cinematic' },
    },
    {
      id: 'n_co2',
      type: 'compile',
      position: { x: 1960, y: 1230 },
      data: { type: 'compile', label: 'Compile Ep 2', status: 'idle', outputs: {}, title: 'The Underdog — Episode 2: The Climb', scenes: [] },
    },
    {
      id: 'n_ex2',
      type: 'export',
      position: { x: 2280, y: 1230 },
      data: {
        type: 'export',
        label: 'Export Ep 2',
        status: 'idle',
        outputs: {},
        platform: 'instagram_reel',
        caption: `I'm in the knockout bracket. My first opponent is the #1 seed in the entire region. I've been playing squash for 68 days. Episode 3 drops next week. #FSP #100DaySquashChallenge #TheUnderdog`,
        hashtags: ['FSP', '100DaySquashChallenge', 'TheUnderdog', 'Squash', 'Bracket', 'WPS'],
      },
    },

    // ── EPISODE 3: The Bracket ────────────────────────────────────────────────
    {
      id: 'n_sb3',
      type: 'storyboard',
      position: { x: 500, y: 1900 },
      data: { type: 'storyboard', label: 'Ep 3: The Bracket', status: 'idle', outputs: {} },
    },
    {
      id: 'n_f3a',
      type: 'frameGenerator',
      position: { x: 900, y: 1760 },
      data: {
        type: 'frameGenerator',
        label: 'Round 1 Win — Voice Cracking',
        status: 'idle',
        outputs: {},
        imagePrompt: `Young Black British man (19) in a squash court, holding his racket, voice cracking with disbelief and emotion, talking directly to a camera on a tripod. Phone propped beside him showing bracket update — his name advancing, opponent's dropping. Expression: pure disbelief mixed with joy. "I just beat the number 1 seed in my region. I've been playing squash for 69 days. I don't understand what's happening." Post-match: sweating, out of breath, gym shorts. Fluorescent leisure centre lighting. Raw, unpolished, real. This is a genuine reaction, not a performance. 9:16 vertical.`,
        style: 'cinematic documentary, raw emotional portrait, post-match sweat and realness, authentic reaction shot, fluorescent overhead light',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_f3b',
      type: 'frameGenerator',
      position: { x: 900, y: 2060 },
      data: {
        type: 'frameGenerator',
        label: 'The Semifinal — Outmatched',
        status: 'idle',
        outputs: {},
        imagePrompt: `A squash court showing the semifinal moment of truth. Young Black British man (19, self-taught, gym kit, community leisure centre) facing an opponent who is visibly different — private club kit, structured technique, every movement economical and precise where Kofi's is fast but loose. Score overlay visible: Kofi is behind. His self-taught unpredictability — the same thing that confused earlier opponents — is being read and anticipated. The gap is visible. Close-up on Kofi between attempts, sweat on his face, phone showing live score in background: significantly behind. The fight is real but the math is hard. 9:16 vertical. Tense desaturated color grade.`,
        style: 'cinematic documentary, tension desaturated grade, score overlay graphics, mid-match intensity, authentic squash court atmosphere',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_f3c',
      type: 'frameGenerator',
      position: { x: 900, y: 2360 },
      data: {
        type: 'frameGenerator',
        label: 'Cliffhanger — Score Loading',
        status: 'idle',
        outputs: {},
        imagePrompt: `Extreme close-up macro shot of a phone screen showing a score loading animation — circular progress spinner, partial number just beginning to resolve. The reflection of anxious eyes visible in the phone screen glass. The progress bar is 95% complete. One frame before the number appears — hard stop. This is maximum uncertainty. The phone is the only light source in a dark space. The number starts to form: then nothing. Just the loading state frozen. The composition is entirely about the tension of not-yet-knowing. 9:16 vertical.`,
        style: 'cinematic macro photography, extreme tension, phone screen glow as sole light, dark atmospheric background, score loading UI visible',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_a3a',
      type: 'animation',
      position: { x: 1280, y: 1760 },
      data: { type: 'animation', label: 'Animate: Win Reaction', status: 'idle', outputs: {}, motionPreset: 'pulse', durationSeconds: 5 },
    },
    {
      id: 'n_a3b',
      type: 'animation',
      position: { x: 1280, y: 2060 },
      data: { type: 'animation', label: 'Animate: Semifinal', status: 'idle', outputs: {}, motionPreset: 'pan_right', durationSeconds: 7 },
    },
    {
      id: 'n_a3c',
      type: 'animation',
      position: { x: 1280, y: 2360 },
      data: { type: 'animation', label: 'Animate: Cliffhanger', status: 'idle', outputs: {}, motionPreset: 'zoom_in', durationSeconds: 5 },
    },
    {
      id: 'n_vo3',
      type: 'voiceover',
      position: { x: 1620, y: 1860 },
      data: {
        type: 'voiceover',
        label: 'Episode 3 Narration',
        status: 'idle',
        outputs: {},
        script: `I just beat the number 1 seed in my region. I've been playing squash for 69 days. I don't understand what's happening. Four matches. Four wins. I'm in the regional semifinal. Day 88 of the 100-day challenge. 12 days left. One match from the regional final. Two matches from a WPS qualifier spot. He's better than me. He's just... he's better. I don't know if I can close this.`,
        narratorProfile: 'dramatic',
      },
    },
    {
      id: 'n_mu3',
      type: 'music',
      position: { x: 1620, y: 2280 },
      data: { type: 'music', label: 'Ep 3 Music', status: 'idle', outputs: {}, mood: 'tense', genre: 'cinematic' },
    },
    {
      id: 'n_co3',
      type: 'compile',
      position: { x: 1960, y: 2060 },
      data: { type: 'compile', label: 'Compile Ep 3', status: 'idle', outputs: {}, title: 'The Underdog — Episode 3: The Bracket', scenes: [] },
    },
    {
      id: 'n_ex3',
      type: 'export',
      position: { x: 2280, y: 2060 },
      data: {
        type: 'export',
        label: 'Export Ep 3',
        status: 'idle',
        outputs: {},
        platform: 'instagram_reel',
        caption: `...`,
        hashtags: ['FSP', '100DaySquashChallenge', 'TheUnderdog', 'Squash', 'Semifinals'],
      },
    },

    // ── EPISODE 4: The Fall ───────────────────────────────────────────────────
    {
      id: 'n_sb4',
      type: 'storyboard',
      position: { x: 500, y: 2750 },
      data: { type: 'storyboard', label: 'Ep 4: The Fall', status: 'idle', outputs: {} },
    },
    {
      id: 'n_f4a',
      type: 'frameGenerator',
      position: { x: 900, y: 2620 },
      data: {
        type: 'frameGenerator',
        label: 'The Loss — One Word',
        status: 'idle',
        outputs: {},
        imagePrompt: `Young Black British man (19) sitting on the floor of a squash court, back against the white wall. Racket lying on the floor beside him. Still in session clothes — sweaty, drained, the court lights flat and unforgiving. He looks directly into camera. His face is composed, not crying — processing. This is the moment before he says the single word "Lost." He doesn't make excuses. He sits with it. The empty court stretches behind him. The space where the match happened. Minimal. Powerful. The floor is scuffed from decades of play. He belongs here even in defeat. 9:16 vertical.`,
        style: 'cinematic documentary, flat institutional lighting, emotional minimalism, character study portrait, post-loss atmosphere',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_f4b',
      type: 'frameGenerator',
      position: { x: 900, y: 2920 },
      data: {
        type: 'frameGenerator',
        label: 'Day 100 — Dark Room Callback',
        status: 'idle',
        outputs: {},
        imagePrompt: `Exact visual callback to Episode 1's opening: young Black British man (19-20) in a dark bedroom at night, lit only by phone screen glow. But this time he's watching the Ramy Ashour 2014 World Championship clip — the same clip that started everything 100 days ago. His face has changed. There's depth now — 100 days of experience, failure, growth visible in his eyes. The phone shows Ashour limping but still winning ElShorbagy. Same dark room. Same phone glow. Different person watching. The callback is complete and deliberate. 9:16 vertical.`,
        style: 'cinematic, exact callback composition to Episode 1 opening but emotionally transformed, phone screen as sole light, character transformation visible in face',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_f4c',
      type: 'frameGenerator',
      position: { x: 900, y: 3220 },
      data: {
        type: 'frameGenerator',
        label: 'Wildcard — Back on Court',
        status: 'idle',
        outputs: {},
        imagePrompt: `Young Black British man (19) back on the exact same Brixton leisure centre court as Day 1 — same fluorescent lights, same scuffed wooden floor, same white walls. But completely transformed. New premium racket (gifted by the Arena Owner). Same court angle as Day 1 — the symmetry is intentional. His stance is different now: grip correct, eyes reading the court, movement economical and purposeful. He taps Upload on his phone — wildcard submission sent. The bracket graphic on the phone screen redraws: his name slots back in. Same court, different player. The transformation is physical and visible. 9:16 vertical.`,
        style: 'cinematic documentary, symmetrical callback composition to Day 1, transformation visible in body language and posture, warm progression color grade',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_a4a',
      type: 'animation',
      position: { x: 1280, y: 2620 },
      data: { type: 'animation', label: 'Animate: The Loss', status: 'idle', outputs: {}, motionPreset: 'ken_burns', durationSeconds: 5 },
    },
    {
      id: 'n_a4b',
      type: 'animation',
      position: { x: 1280, y: 2920 },
      data: { type: 'animation', label: 'Animate: Day 100', status: 'idle', outputs: {}, motionPreset: 'drift', durationSeconds: 6 },
    },
    {
      id: 'n_a4c',
      type: 'animation',
      position: { x: 1280, y: 3220 },
      data: { type: 'animation', label: 'Animate: Wildcard', status: 'idle', outputs: {}, motionPreset: 'zoom_in', durationSeconds: 5 },
    },
    {
      id: 'n_vo4',
      type: 'voiceover',
      position: { x: 1620, y: 2720 },
      data: {
        type: 'voiceover',
        label: 'Episode 4 Narration',
        status: 'idle',
        outputs: {},
        script: `Lost. He was better. That's it. He's been training since he was 12. I've been training for 88 days. I ran out of days. A hundred days ago I watched a video of Ramy Ashour at 2am. I'd never touched a squash racket. Today I've played in a national knockout bracket, beaten people who've been playing for years, and lost in a regional semifinal. This video changed my life. I know that sounds like something people say on the internet. I mean it literally. I have a thing I care about now. I didn't have that 100 days ago. The challenge is over. I don't know what happens next. I'm back. The wildcard bracket put me on a path straight through the guy who knocked me out. You can't write this.`,
        narratorProfile: 'storyteller',
      },
    },
    {
      id: 'n_mu4',
      type: 'music',
      position: { x: 1620, y: 3150 },
      data: { type: 'music', label: 'Ep 4 Music', status: 'idle', outputs: {}, mood: 'emotional', genre: 'cinematic' },
    },
    {
      id: 'n_co4',
      type: 'compile',
      position: { x: 1960, y: 2900 },
      data: { type: 'compile', label: 'Compile Ep 4', status: 'idle', outputs: {}, title: 'The Underdog — Episode 4: The Fall', scenes: [] },
    },
    {
      id: 'n_ex4',
      type: 'export',
      position: { x: 2280, y: 2900 },
      data: {
        type: 'export',
        label: 'Export Ep 4',
        status: 'idle',
        outputs: {},
        platform: 'instagram_reel',
        caption: `I'm back. The wildcard bracket put me on a path straight through the guy who knocked me out. You can't write this. Episode 5 drops next week. #FSP #100DaySquashChallenge #TheUnderdog #Wildcard`,
        hashtags: ['FSP', '100DaySquashChallenge', 'TheUnderdog', 'Squash', 'Wildcard', 'Comeback'],
      },
    },

    // ── EPISODE 5: The Stage ──────────────────────────────────────────────────
    {
      id: 'n_sb5',
      type: 'storyboard',
      position: { x: 500, y: 3580 },
      data: { type: 'storyboard', label: 'Ep 5: The Stage', status: 'idle', outputs: {} },
    },
    {
      id: 'n_f5a',
      type: 'frameGenerator',
      position: { x: 900, y: 3440 },
      data: {
        type: 'frameGenerator',
        label: 'The Rematch — Ashour Drop Shot',
        status: 'idle',
        outputs: {},
        imagePrompt: `Glass squash court at a professional WPS venue. Regional final. Broadcast production quality for the first time — overhead professional lighting, score overlay graphics on the glass walls, real audience visible behind transparent court walls. Young Black British man (19, proper squash kit now, premium racket) mid-execution of a perfect backhand drop shot — the ball dying on the front wall tin. The exact same shot from the Ramy Ashour clip that started everything 100 days ago. He didn't plan it. It just came out. His movement is controlled and precise — the self-taught unpredictability now layered on top of real structure. Broadcast quality. This is a completely different world from the Brixton leisure centre. 9:16 vertical.`,
        style: 'cinematic broadcast quality, professional squash venue, glass court and real audience, clean score graphics, dramatic professional lighting',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_f5b',
      type: 'frameGenerator',
      position: { x: 900, y: 3740 },
      data: {
        type: 'frameGenerator',
        label: 'The Arrival — WPS Venue',
        status: 'idle',
        outputs: {},
        imagePrompt: `Wide establishing shot: young Black British man (19) walking alone into a vast WPS squash venue for the first time. Glass courts, broadcast cameras, tiered seating for thousands. He carries the same worn gym bag from Day 1 — the only constant across 100 days. He stops and looks up at the scale of the space. The contrast with the Brixton leisure centre is total and deliberate. The camera holds on his face: whatever he's feeling, the audience reads it without words. He went from a 2am phone screen to this. The architecture dwarfs him — he belongs here. 9:16 vertical.`,
        style: 'cinematic wide angle, architectural grandeur, small figure in massive space, emotional arrival, premium sports venue lighting',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_f5c',
      type: 'frameGenerator',
      position: { x: 900, y: 4040 },
      data: {
        type: 'frameGenerator',
        label: 'New Day 1 — Passing It On',
        status: 'idle',
        outputs: {},
        imagePrompt: `Back at the Brixton leisure centre. Same fluorescent lights. Same scuffed wooden floors. Same white walls. Young man (19-20) hitting solo drills on court. A teenage kid (14-15) watches from the doorway — exactly the way Kofi once consumed squash videos at 2am. Kofi notices. Walks over. Hands the kid a spare racket. They step onto the court together. The kid swings and completely whiffs — ball rolls to the back wall. Kofi laughs warmly. He was this kid not long ago. The cycle restarts. The camera begins to pull back slowly, revealing the full court, the full space, both of them small against it. Same court. New Day 1. 9:16 vertical.`,
        style: 'cinematic documentary, full circle composition, warm fluorescent institutional light, hopeful and cyclical, pull-back camera movement implied',
        aspectRatio: '9:16' as const,
        sceneId: "",
      },
    },
    {
      id: 'n_a5a',
      type: 'animation',
      position: { x: 1280, y: 3440 },
      data: { type: 'animation', label: 'Animate: Rematch', status: 'idle', outputs: {}, motionPreset: 'pulse', durationSeconds: 6 },
    },
    {
      id: 'n_a5b',
      type: 'animation',
      position: { x: 1280, y: 3740 },
      data: { type: 'animation', label: 'Animate: Arrival', status: 'idle', outputs: {}, motionPreset: 'ken_burns', durationSeconds: 7 },
    },
    {
      id: 'n_a5c',
      type: 'animation',
      position: { x: 1280, y: 4040 },
      data: { type: 'animation', label: 'Animate: New Day 1', status: 'idle', outputs: {}, motionPreset: 'drift', durationSeconds: 5 },
    },
    {
      id: 'n_vo5',
      type: 'voiceover',
      position: { x: 1620, y: 3540 },
      data: {
        type: 'voiceover',
        label: 'Episode 5 Narration',
        status: 'idle',
        outputs: {},
        script: `This man is broken and he's still cooking. What is this sport. He went from a 2am Ashour clip to the same stage Ashour played on. The journey was the story. The result is a bonus. Post-WPS. Back to Brixton. Same fluorescent lights. Same scuffed floors. Same court. But everything is different and everything is the same. Every underdog was unknown on Day 1. The next one hasn't entered yet. Whose Day 1 is today?`,
        narratorProfile: 'documentary',
      },
    },
    {
      id: 'n_mu5',
      type: 'music',
      position: { x: 1620, y: 3960 },
      data: { type: 'music', label: 'Ep 5 Music', status: 'idle', outputs: {}, mood: 'epic', genre: 'cinematic' },
    },
    {
      id: 'n_co5',
      type: 'compile',
      position: { x: 1960, y: 3730 },
      data: { type: 'compile', label: 'Compile Ep 5', status: 'idle', outputs: {}, title: 'The Underdog — Episode 5: The Stage', scenes: [] },
    },
    {
      id: 'n_ex5',
      type: 'export',
      position: { x: 2280, y: 3730 },
      data: {
        type: 'export',
        label: 'Export Ep 5',
        status: 'idle',
        outputs: {},
        platform: 'instagram_reel',
        caption: `Every underdog was unknown on Day 1. The next one hasn't entered yet. FSP qualifiers open soon. Whose Day 1 is today? #FSP #WhoseDay1 #TheUnderdog #100DaySquashChallenge #WPS`,
        hashtags: ['FSP', 'WhoseDay1', 'TheUnderdog', '100DaySquashChallenge', 'WPS', 'Squash', 'SportsTok'],
      },
    },
  ],

  edges: [
    // Story Concept → Storyboards (all 5)
    { id: 'e_c_sb1', source: 'n_concept', sourceHandle: 'story', target: 'n_sb1', targetHandle: 'story', animated: true },
    { id: 'e_c_sb2', source: 'n_concept', sourceHandle: 'story', target: 'n_sb2', targetHandle: 'story', animated: true },
    { id: 'e_c_sb3', source: 'n_concept', sourceHandle: 'story', target: 'n_sb3', targetHandle: 'story', animated: true },
    { id: 'e_c_sb4', source: 'n_concept', sourceHandle: 'story', target: 'n_sb4', targetHandle: 'story', animated: true },
    { id: 'e_c_sb5', source: 'n_concept', sourceHandle: 'story', target: 'n_sb5', targetHandle: 'story', animated: true },

    // Character → Storyboards (all 5)
    { id: 'e_k_sb1', source: 'n_kofi', sourceHandle: 'character', target: 'n_sb1', targetHandle: 'character', animated: true },
    { id: 'e_k_sb2', source: 'n_kofi', sourceHandle: 'character', target: 'n_sb2', targetHandle: 'character', animated: true },
    { id: 'e_k_sb3', source: 'n_kofi', sourceHandle: 'character', target: 'n_sb3', targetHandle: 'character', animated: true },
    { id: 'e_k_sb4', source: 'n_kofi', sourceHandle: 'character', target: 'n_sb4', targetHandle: 'character', animated: true },
    { id: 'e_k_sb5', source: 'n_kofi', sourceHandle: 'character', target: 'n_sb5', targetHandle: 'character', animated: true },

    // Character → Frame Generators (visual consistency across episodes)
    { id: 'e_k_f1a', source: 'n_kofi', sourceHandle: 'character', target: 'n_f1a', targetHandle: 'character', animated: true },
    { id: 'e_k_f1b', source: 'n_kofi', sourceHandle: 'character', target: 'n_f1b', targetHandle: 'character', animated: true },
    { id: 'e_k_f1c', source: 'n_kofi', sourceHandle: 'character', target: 'n_f1c', targetHandle: 'character', animated: true },
    { id: 'e_k_f2a', source: 'n_kofi', sourceHandle: 'character', target: 'n_f2a', targetHandle: 'character', animated: true },
    { id: 'e_k_f2b', source: 'n_kofi', sourceHandle: 'character', target: 'n_f2b', targetHandle: 'character', animated: true },
    { id: 'e_k_f2c', source: 'n_kofi', sourceHandle: 'character', target: 'n_f2c', targetHandle: 'character', animated: true },
    { id: 'e_k_f3a', source: 'n_kofi', sourceHandle: 'character', target: 'n_f3a', targetHandle: 'character', animated: true },
    { id: 'e_k_f3b', source: 'n_kofi', sourceHandle: 'character', target: 'n_f3b', targetHandle: 'character', animated: true },
    { id: 'e_k_f3c', source: 'n_kofi', sourceHandle: 'character', target: 'n_f3c', targetHandle: 'character', animated: true },
    { id: 'e_k_f4a', source: 'n_kofi', sourceHandle: 'character', target: 'n_f4a', targetHandle: 'character', animated: true },
    { id: 'e_k_f4b', source: 'n_kofi', sourceHandle: 'character', target: 'n_f4b', targetHandle: 'character', animated: true },
    { id: 'e_k_f4c', source: 'n_kofi', sourceHandle: 'character', target: 'n_f4c', targetHandle: 'character', animated: true },
    { id: 'e_k_f5a', source: 'n_kofi', sourceHandle: 'character', target: 'n_f5a', targetHandle: 'character', animated: true },
    { id: 'e_k_f5b', source: 'n_kofi', sourceHandle: 'character', target: 'n_f5b', targetHandle: 'character', animated: true },
    { id: 'e_k_f5c', source: 'n_kofi', sourceHandle: 'character', target: 'n_f5c', targetHandle: 'character', animated: true },

    // Storyboards → Frame Generators
    { id: 'e_sb1_f1a', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_f1a', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb1_f1b', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_f1b', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb1_f1c', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_f1c', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb2_f2a', source: 'n_sb2', sourceHandle: 'storyboard', target: 'n_f2a', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb2_f2b', source: 'n_sb2', sourceHandle: 'storyboard', target: 'n_f2b', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb2_f2c', source: 'n_sb2', sourceHandle: 'storyboard', target: 'n_f2c', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb3_f3a', source: 'n_sb3', sourceHandle: 'storyboard', target: 'n_f3a', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb3_f3b', source: 'n_sb3', sourceHandle: 'storyboard', target: 'n_f3b', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb3_f3c', source: 'n_sb3', sourceHandle: 'storyboard', target: 'n_f3c', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb4_f4a', source: 'n_sb4', sourceHandle: 'storyboard', target: 'n_f4a', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb4_f4b', source: 'n_sb4', sourceHandle: 'storyboard', target: 'n_f4b', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb4_f4c', source: 'n_sb4', sourceHandle: 'storyboard', target: 'n_f4c', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb5_f5a', source: 'n_sb5', sourceHandle: 'storyboard', target: 'n_f5a', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb5_f5b', source: 'n_sb5', sourceHandle: 'storyboard', target: 'n_f5b', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb5_f5c', source: 'n_sb5', sourceHandle: 'storyboard', target: 'n_f5c', targetHandle: 'storyboard', animated: true },

    // Frame Generators → Animations
    { id: 'e_f1a_a1a', source: 'n_f1a', sourceHandle: 'image', target: 'n_a1a', targetHandle: 'image', animated: true },
    { id: 'e_f1b_a1b', source: 'n_f1b', sourceHandle: 'image', target: 'n_a1b', targetHandle: 'image', animated: true },
    { id: 'e_f1c_a1c', source: 'n_f1c', sourceHandle: 'image', target: 'n_a1c', targetHandle: 'image', animated: true },
    { id: 'e_f2a_a2a', source: 'n_f2a', sourceHandle: 'image', target: 'n_a2a', targetHandle: 'image', animated: true },
    { id: 'e_f2b_a2b', source: 'n_f2b', sourceHandle: 'image', target: 'n_a2b', targetHandle: 'image', animated: true },
    { id: 'e_f2c_a2c', source: 'n_f2c', sourceHandle: 'image', target: 'n_a2c', targetHandle: 'image', animated: true },
    { id: 'e_f3a_a3a', source: 'n_f3a', sourceHandle: 'image', target: 'n_a3a', targetHandle: 'image', animated: true },
    { id: 'e_f3b_a3b', source: 'n_f3b', sourceHandle: 'image', target: 'n_a3b', targetHandle: 'image', animated: true },
    { id: 'e_f3c_a3c', source: 'n_f3c', sourceHandle: 'image', target: 'n_a3c', targetHandle: 'image', animated: true },
    { id: 'e_f4a_a4a', source: 'n_f4a', sourceHandle: 'image', target: 'n_a4a', targetHandle: 'image', animated: true },
    { id: 'e_f4b_a4b', source: 'n_f4b', sourceHandle: 'image', target: 'n_a4b', targetHandle: 'image', animated: true },
    { id: 'e_f4c_a4c', source: 'n_f4c', sourceHandle: 'image', target: 'n_a4c', targetHandle: 'image', animated: true },
    { id: 'e_f5a_a5a', source: 'n_f5a', sourceHandle: 'image', target: 'n_a5a', targetHandle: 'image', animated: true },
    { id: 'e_f5b_a5b', source: 'n_f5b', sourceHandle: 'image', target: 'n_a5b', targetHandle: 'image', animated: true },
    { id: 'e_f5c_a5c', source: 'n_f5c', sourceHandle: 'image', target: 'n_a5c', targetHandle: 'image', animated: true },

    // Storyboard → Animation (scene type, action prompt, camera preset, clip duration)
    { id: 'e_sb1_a1a', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_a1a', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb1_a1b', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_a1b', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb1_a1c', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_a1c', targetHandle: 'storyboard', animated: true },

    // Storyboard → Voiceover (per-scene narration text, tone)
    { id: 'e_sb1_vo1a', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_vo1a', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb1_vo1b', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_vo1b', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb1_vo1c', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_vo1c', targetHandle: 'storyboard', animated: true },

    // Storyboard → SFX (ambient, foley, transition sounds)
    { id: 'e_sb1_sfx1a', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_sfx1a', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb1_sfx1b', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_sfx1b', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb1_sfx1c', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_sfx1c', targetHandle: 'storyboard', animated: true },

    // SFX → Compile (scene audio feeds into final mix)
    { id: 'e_sfx1a_co1', source: 'n_sfx1a', sourceHandle: 'sceneAudio', target: 'n_co1', targetHandle: 'sceneAudio', animated: true },
    { id: 'e_sfx1b_co1', source: 'n_sfx1b', sourceHandle: 'sceneAudio', target: 'n_co1', targetHandle: 'sceneAudio', animated: true },
    { id: 'e_sfx1c_co1', source: 'n_sfx1c', sourceHandle: 'sceneAudio', target: 'n_co1', targetHandle: 'sceneAudio', animated: true },

    // Animations → Compile (video clips)
    { id: 'e_a1a_co1', source: 'n_a1a', sourceHandle: 'video', target: 'n_co1', targetHandle: 'videos', animated: true },
    { id: 'e_a1b_co1', source: 'n_a1b', sourceHandle: 'video', target: 'n_co1', targetHandle: 'videos', animated: true },
    { id: 'e_a1c_co1', source: 'n_a1c', sourceHandle: 'video', target: 'n_co1', targetHandle: 'videos', animated: true },
    { id: 'e_a2a_co2', source: 'n_a2a', sourceHandle: 'video', target: 'n_co2', targetHandle: 'videos', animated: true },
    { id: 'e_a2b_co2', source: 'n_a2b', sourceHandle: 'video', target: 'n_co2', targetHandle: 'videos', animated: true },
    { id: 'e_a2c_co2', source: 'n_a2c', sourceHandle: 'video', target: 'n_co2', targetHandle: 'videos', animated: true },
    { id: 'e_a3a_co3', source: 'n_a3a', sourceHandle: 'video', target: 'n_co3', targetHandle: 'videos', animated: true },
    { id: 'e_a3b_co3', source: 'n_a3b', sourceHandle: 'video', target: 'n_co3', targetHandle: 'videos', animated: true },
    { id: 'e_a3c_co3', source: 'n_a3c', sourceHandle: 'video', target: 'n_co3', targetHandle: 'videos', animated: true },
    { id: 'e_a4a_co4', source: 'n_a4a', sourceHandle: 'video', target: 'n_co4', targetHandle: 'videos', animated: true },
    { id: 'e_a4b_co4', source: 'n_a4b', sourceHandle: 'video', target: 'n_co4', targetHandle: 'videos', animated: true },
    { id: 'e_a4c_co4', source: 'n_a4c', sourceHandle: 'video', target: 'n_co4', targetHandle: 'videos', animated: true },
    { id: 'e_a5a_co5', source: 'n_a5a', sourceHandle: 'video', target: 'n_co5', targetHandle: 'videos', animated: true },
    { id: 'e_a5b_co5', source: 'n_a5b', sourceHandle: 'video', target: 'n_co5', targetHandle: 'videos', animated: true },
    { id: 'e_a5c_co5', source: 'n_a5c', sourceHandle: 'video', target: 'n_co5', targetHandle: 'videos', animated: true },

    // Voiceovers → Compile
    { id: 'e_vo1a_co1', source: 'n_vo1a', sourceHandle: 'audio', target: 'n_co1', targetHandle: 'voiceover', animated: true },
    { id: 'e_vo1b_co1', source: 'n_vo1b', sourceHandle: 'audio', target: 'n_co1', targetHandle: 'voiceover', animated: true },
    { id: 'e_vo1c_co1', source: 'n_vo1c', sourceHandle: 'audio', target: 'n_co1', targetHandle: 'voiceover', animated: true },
    { id: 'e_vo2_co2', source: 'n_vo2', sourceHandle: 'audio', target: 'n_co2', targetHandle: 'voiceover', animated: true },
    { id: 'e_vo3_co3', source: 'n_vo3', sourceHandle: 'audio', target: 'n_co3', targetHandle: 'voiceover', animated: true },
    { id: 'e_vo4_co4', source: 'n_vo4', sourceHandle: 'audio', target: 'n_co4', targetHandle: 'voiceover', animated: true },
    { id: 'e_vo5_co5', source: 'n_vo5', sourceHandle: 'audio', target: 'n_co5', targetHandle: 'voiceover', animated: true },

    // Per-scene VO duration → Animation (audio drives video length)
    { id: 'e_vo1a_a1a', source: 'n_vo1a', sourceHandle: 'duration', target: 'n_a1a', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo1b_a1b', source: 'n_vo1b', sourceHandle: 'duration', target: 'n_a1b', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo1c_a1c', source: 'n_vo1c', sourceHandle: 'duration', target: 'n_a1c', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo2_a2a', source: 'n_vo2', sourceHandle: 'duration', target: 'n_a2a', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo2_a2b', source: 'n_vo2', sourceHandle: 'duration', target: 'n_a2b', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo2_a2c', source: 'n_vo2', sourceHandle: 'duration', target: 'n_a2c', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo3_a3a', source: 'n_vo3', sourceHandle: 'duration', target: 'n_a3a', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo3_a3b', source: 'n_vo3', sourceHandle: 'duration', target: 'n_a3b', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo3_a3c', source: 'n_vo3', sourceHandle: 'duration', target: 'n_a3c', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo4_a4a', source: 'n_vo4', sourceHandle: 'duration', target: 'n_a4a', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo4_a4b', source: 'n_vo4', sourceHandle: 'duration', target: 'n_a4b', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo4_a4c', source: 'n_vo4', sourceHandle: 'duration', target: 'n_a4c', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo5_a5a', source: 'n_vo5', sourceHandle: 'duration', target: 'n_a5a', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo5_a5b', source: 'n_vo5', sourceHandle: 'duration', target: 'n_a5b', targetHandle: 'audioDuration', animated: true },
    { id: 'e_vo5_a5c', source: 'n_vo5', sourceHandle: 'duration', target: 'n_a5c', targetHandle: 'audioDuration', animated: true },

    // Music → Compile
    { id: 'e_mu1_co1', source: 'n_mu1', sourceHandle: 'audio', target: 'n_co1', targetHandle: 'music', animated: true },
    { id: 'e_mu2_co2', source: 'n_mu2', sourceHandle: 'audio', target: 'n_co2', targetHandle: 'music', animated: true },
    { id: 'e_mu3_co3', source: 'n_mu3', sourceHandle: 'audio', target: 'n_co3', targetHandle: 'music', animated: true },
    { id: 'e_mu4_co4', source: 'n_mu4', sourceHandle: 'audio', target: 'n_co4', targetHandle: 'music', animated: true },
    { id: 'e_mu5_co5', source: 'n_mu5', sourceHandle: 'audio', target: 'n_co5', targetHandle: 'music', animated: true },

    // Storyboard → Compile (storyboard data needed for audio timing)
    { id: 'e_sb1_co1', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_co1', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb2_co2', source: 'n_sb2', sourceHandle: 'storyboard', target: 'n_co2', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb3_co3', source: 'n_sb3', sourceHandle: 'storyboard', target: 'n_co3', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb4_co4', source: 'n_sb4', sourceHandle: 'storyboard', target: 'n_co4', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb5_co5', source: 'n_sb5', sourceHandle: 'storyboard', target: 'n_co5', targetHandle: 'storyboard', animated: true },

    // Compile → Export
    { id: 'e_co1_ex1', source: 'n_co1', sourceHandle: 'video', target: 'n_ex1', targetHandle: 'video', animated: true },
    { id: 'e_co2_ex2', source: 'n_co2', sourceHandle: 'video', target: 'n_ex2', targetHandle: 'video', animated: true },
    { id: 'e_co3_ex3', source: 'n_co3', sourceHandle: 'video', target: 'n_ex3', targetHandle: 'video', animated: true },
    { id: 'e_co4_ex4', source: 'n_co4', sourceHandle: 'video', target: 'n_ex4', targetHandle: 'video', animated: true },
    { id: 'e_co5_ex5', source: 'n_co5', sourceHandle: 'video', target: 'n_ex5', targetHandle: 'video', animated: true },

    // Storyboard → Export (caption text per scene for caption burning)
    { id: 'e_sb1_ex1', source: 'n_sb1', sourceHandle: 'storyboard', target: 'n_ex1', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb2_ex2', source: 'n_sb2', sourceHandle: 'storyboard', target: 'n_ex2', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb3_ex3', source: 'n_sb3', sourceHandle: 'storyboard', target: 'n_ex3', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb4_ex4', source: 'n_sb4', sourceHandle: 'storyboard', target: 'n_ex4', targetHandle: 'storyboard', animated: true },
    { id: 'e_sb5_ex5', source: 'n_sb5', sourceHandle: 'storyboard', target: 'n_ex5', targetHandle: 'storyboard', animated: true },
  ],
};
