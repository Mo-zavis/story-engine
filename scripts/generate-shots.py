#!/usr/bin/env python3
"""
Generate all 16 scene shots for Episode 1 using Gemini multimodal API.
Sends the character reference image + scene imagePrompt + color grading
for each scene to maintain character consistency and lighting continuity.
"""

import json, os, base64, time, ssl, urllib.request

# ── Config ──────────────────────────────────────────────────────────────────

API_KEY = 'AIzaSyCLOgjZh3J2ydaavTlW6J5ocdYnRrBh-wY'
SCENES_FILE = '/tmp/ep1_scenes.json'
CHAR_REF = os.path.join(os.path.dirname(__file__),
    '../assets/outputs/characters/characters_fc5a8aa1.png')
FRAMES_DIR = os.path.join(os.path.dirname(__file__), '../assets/outputs/frames')

# Nano Banana Pro — supports character reference input + outputs 9:16 natively
MODEL = 'nano-banana-pro-preview'
ENDPOINT = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}'

# SSL context (macOS Python SSL issue)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

os.makedirs(FRAMES_DIR, exist_ok=True)

# ── Load character reference as base64 ──────────────────────────────────────

with open(CHAR_REF, 'rb') as f:
    char_b64 = base64.b64encode(f.read()).decode('utf-8')
print(f"✓ Character reference loaded ({len(char_b64) // 1024}KB base64)")

# ── Load scenes ─────────────────────────────────────────────────────────────

scenes = json.load(open(SCENES_FILE))
print(f"✓ {len(scenes)} scenes loaded\n")

# ── Generate each scene ─────────────────────────────────────────────────────

for scene in scenes:
    num = scene['sceneNumber']
    image_prompt = scene.get('imagePrompt', '')
    color_palette = scene.get('colorPalette', {})
    mood = scene.get('mood', '')
    camera_angle = scene.get('cameraAngle', '')

    if not image_prompt:
        print(f"  Scene {num}: No imagePrompt, skipping")
        continue

    # Build the color grading instructions from storyboard
    color_instructions = ""
    if color_palette:
        # colorPalette can be a string or object
        if isinstance(color_palette, str):
            color_instructions = f"\n\nCOLOR GRADING (match exactly):\n{color_palette}\nMood: {mood}"
        elif isinstance(color_palette, dict):
            color_instructions = f"\n\nCOLOR GRADING: {json.dumps(color_palette)}\nMood: {mood}"

    # Build the full prompt with character reference context
    full_prompt = f"""Generate a cinematic 9:16 vertical photograph for a sports documentary short film.

The attached image is the CHARACTER REFERENCE for Kofi Mensah. This is the SAME person in every scene — maintain his exact facial features, skin tone, face shape, and build across all generations. He must look identical to the reference.

SCENE {num} IMAGE PROMPT:
{image_prompt}
{color_instructions}

CRITICAL RULES:
- The person in this image MUST look like the attached character reference — same face, same skin tone, same build
- 9:16 vertical composition (portrait mode for mobile)
- Photorealistic cinematic quality — looks like a frame from a Netflix documentary
- No text, watermarks, or logos in the image
- No extra people unless specifically mentioned in the prompt"""

    print(f"  Scene {num}...", end=' ', flush=True)

    # Build multimodal request with image reference
    body = json.dumps({
        "contents": [{
            "parts": [
                {"text": full_prompt},
                {
                    "inline_data": {
                        "mime_type": "image/png",
                        "data": char_b64
                    }
                }
            ]
        }],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "temperature": 0.4  # Lower for more consistency
        }
    }).encode('utf-8')

    req = urllib.request.Request(
        ENDPOINT,
        data=body,
        headers={'Content-Type': 'application/json'}
    )

    try:
        resp = urllib.request.urlopen(req, timeout=120, context=ctx)
        data = json.loads(resp.read())

        candidates = data.get('candidates', [])
        if not candidates:
            print(f"✗ No candidates in response")
            continue

        parts = candidates[0].get('content', {}).get('parts', [])
        image_found = False
        for part in parts:
            if 'inlineData' in part:
                img_b64 = part['inlineData']['data']
                mime = part['inlineData'].get('mimeType', 'image/jpeg')
                ext = 'jpg' if 'jpeg' in mime or 'jpg' in mime else 'png'

                img_bytes = base64.b64decode(img_b64)
                # Save as scene_XX.jpg (Nano Banana Pro outputs JPEG at 9:16)
                out_path = os.path.join(FRAMES_DIR, f'scene_{str(num).zfill(2)}.jpg')
                with open(out_path, 'wb') as f:
                    f.write(img_bytes)
                print(f"✓ ({len(img_bytes)//1024}KB)")
                image_found = True
                break

        if not image_found:
            for part in parts:
                if 'text' in part:
                    print(f"✗ Text response: {part['text'][:100]}")
                    break
            else:
                print(f"✗ No image in response parts")

    except urllib.error.HTTPError as e:
        err_body = e.read().decode()[:300]
        print(f"✗ HTTP {e.code}: {err_body}")
        if e.code == 429:
            print("    Rate limited — waiting 60s...")
            time.sleep(60)
            # Retry once
            try:
                resp = urllib.request.urlopen(req, timeout=120, context=ctx)
                data = json.loads(resp.read())
                parts = data.get('candidates', [{}])[0].get('content', {}).get('parts', [])
                for part in parts:
                    if 'inlineData' in part:
                        img_bytes = base64.b64decode(part['inlineData']['data'])
                        out_path = os.path.join(FRAMES_DIR, f'scene_{str(num).zfill(2)}.jpg')
                        with open(out_path, 'wb') as f:
                            f.write(img_bytes)
                        print(f"    Retry ✓ ({len(img_bytes)//1024}KB)")
                        break
            except Exception as e2:
                print(f"    Retry failed: {e2}")
    except Exception as e:
        print(f"✗ {e}")

    time.sleep(4)  # Rate limit: ~15 requests/min for flash-image

print("\n✅ All scenes generated!")
print(f"   Frames at: {os.path.abspath(FRAMES_DIR)}")
