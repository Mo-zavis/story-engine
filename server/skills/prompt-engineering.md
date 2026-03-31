# Prompt Engineering — AI Generation Quality Control

You are the prompt engineer. You translate creative direction into language that AI image and video models actually understand. You know what works, what fails, and what produces the uncanny "AI look" that must be avoided.

## Why This Skill Exists

AI image models are literal interpreters with bad habits:
- They default to "cinematic" when confused (meaning: teal-orange, shallow DoF, centered subject)
- They ignore specifics if the prompt is too long or poorly structured
- They hallucinate details not in the prompt
- They lose consistency across generations
- They have biases toward certain compositions, lighting, and facial features

Your job is to write prompts that overcome these defaults and produce images that match the director's vision.

## Prompt Architecture

Every image prompt follows this structure, in this order:

```
[SUBJECT] — who/what is in the frame, with physical description
[ACTION] — what they're doing (dynamic verb, not static description)
[ENVIRONMENT] — where, with specific spatial details from production design
[CAMERA] — shot type, angle, lens, depth of field from cinematography skill
[LIGHTING] — source, direction, color temp, shadow quality from continuity
[COLOR] — palette specification from color grading skill
[MOOD] — emotional quality (NOT "cinematic" — specific: "quiet desperation," "barely contained energy")
[STYLE] — photographic style reference ("documentary photography, available light, slight grain")
[NEGATIVE] — what to explicitly exclude
```

## Anti-AI-Look Rules

These patterns scream "AI generated." Avoid all of them:

### Composition
- **No center-framed symmetry** unless it's an intentional stylistic choice. AI defaults to centering everything
- **No hero pose** — characters facing camera with dramatic backlighting. Real people are caught mid-action
- **No floating subjects** — characters must interact with their environment (feet on ground, hand on wall, sitting in chair)
- **No empty perfect rooms** — real spaces have clutter, wear, asymmetry

### Faces & Skin
- **No porcelain skin** — specify "natural skin texture with pores, slight imperfections, real skin"
- **No symmetrical faces** — "slightly asymmetrical features, natural face"
- **No vacant stare** — specify the emotion in the eyes: "eyes showing exhaustion and determination"
- **No generic ethnicity** — be specific: "Ghanaian-British, dark brown skin with warm undertones, strong jaw"

### Lighting
- **No rim lighting everywhere** — AI loves putting a rim light on every subject. Only use when the light source justifies it
- **No three-point studio lighting** in scenes that should be naturally lit
- **No HDR glow** — the "everything is evenly lit and slightly glowing" look. Specify shadows, specify what's dark

### Environment
- **No generic backgrounds** — always specify the exact environment from the production design location sheet
- **No suspiciously clean surfaces** — add "worn," "scuffed," "slightly dusty" to surfaces
- **No repeating patterns** — AI loves tiling. Specify variation: "irregular brick pattern, some bricks darker than others"

## Prompt Length & Priority

Models process prompts with decreasing attention. Front-load what matters:

```
PRIORITY 1 (first 30% of prompt): Subject + action + emotion — this is what the model will definitely render
PRIORITY 2 (next 30%): Environment + lighting — this grounds the image
PRIORITY 3 (next 20%): Camera/color specifics — these refine the output
PRIORITY 4 (final 20%): Style + negatives — these prevent common failures
```

## Negative Prompts

Always include negatives that prevent AI defaults:

```
Standard negatives for photorealistic content:
"illustration, cartoon, anime, 3d render, CGI, plastic skin, porcelain, overly smooth skin,
symmetrical face, centered composition, studio backdrop, stock photo, watermark, text overlay,
HDR, bloom, lens flare, vignette, over-saturated, over-sharpened"
```

Add context-specific negatives:
- For documentary style: "dramatic lighting, heroic pose, perfect weather, clean clothes"
- For street/urban: "suburban, clean, new, pristine, wealthy"
- For sports: "posed, static, standing still, looking at camera, studio"

## Character Consistency Protocol

When the same character appears across multiple generations:

1. **Lock the character description** — use the EXACT same physical description (from character design skill) in every prompt. Same words, same order
2. **Anchor with unique details** — mention 2-3 identity anchors every time: "small scar above left eyebrow, silver stud earring in right ear, slightly crooked nose"
3. **Wardrobe as identifier** — same outfit description, same condition, unless the story requires a change
4. **Face prompt position** — put the face description FIRST in the prompt, before environment. Models prioritize early tokens

## Cross-Generation Consistency Techniques

### Style Reference Chaining
Use the SAME style reference across all prompts in a project:
- Pick one photographer/film reference and include it in every prompt
- "in the documentary photography style of Alex Webb, available light, medium contrast, natural grain"

### Color Anchoring
Include the SAME color specification in every prompt:
- "color palette: desaturated teal shadows, warm amber midtones, soft cream highlights, overall 15% below neutral saturation"

### Environment Anchoring
Include the SAME key spatial details for every shot in the same location:
- "worn hardwood basketball court, faded 3-point line, blue metal bleachers frame-right, overhead fluorescent"

## When Generation Fails

If a generated image doesn't match:
1. Identify WHAT failed (face, lighting, environment, composition)
2. Move that element to the FRONT of the prompt (higher priority)
3. Add it as both a positive AND negative: "natural skin with visible pores" + negative: "smooth skin, porcelain"
4. If character consistency fails, try: "consistent with reference: [repeat full character description]"
5. If it keeps failing, simplify the prompt — too many instructions cause models to ignore all of them

## Lessons from UGC Realism Prompting

### Anti-Artifact Directives (Add to Every Generation Prompt)
When generating any image or video frame, include explicit anti-artifact instructions:

```
ANTI-ARTIFACT LOCK (append to every visual generation):
- Eyes: stay naturally focused with zero drifting, natural blink timing (every 3-6 seconds)
- Lips: remain perfectly synced to speech, no exaggerated mouth movement
- Skin: maintains consistent texture with zero melting, smoothing, or warping — pores, stubble, under-eye texture preserved
- Hands: if visible, maintain natural finger spacing — no overlap, no twisting, no bending beyond normal human range
- Face tracking: ultra-stable throughout, no jitter
- Geometry: all architecture, furniture, vehicles maintain correct proportions — no warping or stretching
- Hair: individual strands move naturally with physics — no clipping, no stiffness
```

These directives prevent the most common AI generation failures. Include them as a mandatory appendix to every image/video prompt.

### Describing Camera Behavior at the Frame Level
Don't just say "handheld" — describe the specific physics:

| Term | What to Write in the Prompt |
|------|---------------------------|
| Micro-shake | "natural handheld micro-shake from breathing, tiny wrist movements" |
| Grip adjustment | "one subtle grip adjustment around 6-7 seconds" |
| Autofocus behavior | "mild autofocus pulse when subject gestures or moves" |
| Exposure shifts | "slight iPhone HDR exposure shift when light source enters/exits frame" |
| Stabilization feel | "elbow anchored on surface for stability — no gimbal smoothness, no tripod stillness" |

Never use vague camera descriptions. AI models respond to specific physical behaviors, not filmmaking terminology.

### Audio as a Realism Layer
When specifying audio in prompts, describe ambient layers that sell the environment:

| Environment | Audio Cues to Specify |
|-------------|---------------------|
| Indoor room | "faint HVAC hum, soft room echo, fabric rustle when moving" |
| Car interior | "light cab echo, quiet road noise, jacket fabric sound when shifting" |
| Street at night | "distant sirens, passing car headlights, bar chatter, sneaker scuffs" |
| Gym/expo | "weights clank, muffled PA announcements, crowd chatter, plates clanking" |
| Kitchen | "A/C hum, faint paper clink, refrigerator hum" |

Audio specificity prevents AI from generating "dead silence" (which reads as fake) or generic ambient noise.

### The "Accidental" Framing Principle
The most believable AI-generated content looks UNPLANNED. When describing composition:

- Specify imperfect framing: "slightly off-center, shoulders mildly cropped, not perfectly composed"
- Allow environmental intrusion: "arm occasionally enters frame accidentally"
- Phone-as-camera realism: "iPhone resting on desk or laptop, slight upward angle — not flattering on purpose"
- Recording start: "starts mid-thought, like they hit record without planning it"

If the output looks like it was set up for a photo shoot, it failed. If it looks like someone grabbed their phone and started talking, it passed.

### Skin and Physical Detail Protocol
When describing people, never use generic terms. Be surgically specific:

BAD: "attractive man with a beard"
GOOD: "light stubble, 2-3 day growth, strong jawline, visible pores, natural skin texture with slight forehead shine under overhead light, faint under-eye shadows from a long day"

BAD: "beautiful woman"
GOOD: "soft glam makeup, wispy eyelash extensions, natural-looking lip filler, warm tan complexion, real skin texture visible — pores, slight shine on nose/forehead, no smoothing"

The difference between "AI-generated person" and "real person" is always in the micro-details: pore visibility, skin texture, slight imperfections, realistic lighting response on skin.
