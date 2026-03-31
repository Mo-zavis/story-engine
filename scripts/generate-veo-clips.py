#!/usr/bin/env python3
"""
Generate all 16 Veo 3 video clips for Episode 1.
- Face scenes: text-to-video (Veo blocks face images as 'celebrity')
- Non-face scenes: image-to-video with our Nano Banana Pro frames
- Duration: 5s each
"""

import json, ssl, urllib.request, base64, time, os, subprocess

API_KEY = 'AIzaSyCLOgjZh3J2ydaavTlW6J5ocdYnRrBh-wY'
MODEL = 'veo-3.0-generate-001'
BASE = 'https://generativelanguage.googleapis.com/v1beta'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

FRAMES_DIR = '/Users/sayanmukherjee/Desktop/FSP:LSC Master/FSP CMO/story-engine/assets/outputs/frames'
CLIPS_DIR = '/Users/sayanmukherjee/Desktop/FSP:LSC Master/FSP CMO/story-engine/assets/outputs/animations/veo3'
os.makedirs(CLIPS_DIR, exist_ok=True)

scenes = json.load(open('/tmp/ep1_scenes.json'))

# Classify scenes: face-prominent vs non-face (objects, hands, wide shots)
# Non-face scenes can use image-to-video for better consistency
IMAGE_SCENES = {2, 7, 8, 9, 12, 14}  # hand/phone CU, ball on wall, feet, phone propped, thumb on button

# Scenes that should use FSP app screenshots as image reference instead of generated frames
APP_SCREENSHOT_DIR = '/Users/sayanmukherjee/Desktop/FSP:LSC Master/FSP App Screenshots'
APP_SCREEN_SCENES = {
    11: '05-HomeScreen.png',     # Kofi discovers FSP app — home screen with challenges
    14: '07-PostSessionScreen.png',  # Upload/post-session screen
}

# Rich motion prompts per scene — derived from storyboard actionPrompt + cameraPreset + mood
MOTION_PROMPTS = {
    1: "Cinematic 9:16 vertical. Slow push-in. Young Black British man, 19, lean, tight coil fade, lying in dark bedroom at 2:14 AM. Face lit only by cold blue phone screen glow. Washed-out navy hoodie. Eyes wide, tracking the screen. Mouth slightly parted. Teal-black shadows. Moonlight-style cinematography. Intimate documentary.",

    2: "Cinematic 9:16 vertical. Static extreme close-up. Dark-skinned left hand holding cracked iPhone, crack bottom-right corner. Phone screen shows squash match — player darting across white court. Left thumb motionless on glass. Warm amber reflection on navy hoodie sleeve. Subtle breathing shift. Shallow depth of field.",

    3: "Cinematic 9:16 vertical. Slow push-in on young Black man's face. Expression transforms from curiosity to obsession. Eyes narrowing, jaw hardening. Phone held closer — blue-white screen light flooding features. Dark room, teal shadows. The moment someone discovers their calling.",

    4: "Cinematic 9:16 vertical. Young Black man, 19, navy hoodie, grey joggers, scuffed white AF1s, black Nike drawstring bag over left shoulder. Pushing through glass door of a leisure centre at 6 AM. Breath visible in cold dawn air. Wet pavement, sodium street lights behind. Determined but nervous.",

    5: "Cinematic 9:16 vertical. Young Black man, 19, grey t-shirt, black shorts. Standing on squash court under fluorescent lights. Examining a borrowed squash racket held awkwardly in LEFT hand — turning it over like a foreign object. White walls, wooden floor, red service line. First time holding a racket.",

    6: "Cinematic 9:16 vertical. Handheld camera feel. Young Black man mid-swing on squash court — LEFT arm fully extended, racket whiffing through empty air. Off-balance, weight on wrong foot. Grey t-shirt, black shorts. Fluorescent overhead light. The comedy of a first attempt. Raw, amateur movement.",

    7: "Cinematic 9:16 vertical. Tight close-up of black rubber squash ball hitting white front wall — slight dust puff on impact. Shadow of a player's moving figure cast sharply on the wall by overhead fluorescent. The grind beginning. White squash court wall, harsh top light.",

    8: "Cinematic 9:16 vertical. Extreme macro close-up of a dark-skinned LEFT hand gripping a squash racket handle. Knuckles prominent, tendons visible, grip pressure whitening the skin. Small scar on left knuckle catches fluorescent light. Forearm muscles tensed. Grey t-shirt sleeve edge visible. The body adapting.",

    9: "Cinematic 9:16 vertical. Handheld camera. Close-up of feet in new white court shoes on wooden squash court floor. Lateral footwork drill — quick side-to-side movement. Black shorts above. Fluorescent overhead light. The feet telling a story of progress the body hasn't caught up to yet.",

    10: "Cinematic 9:16 vertical. Handheld camera. Young Black man, 19, mid-rally at the T position on squash court. LEFT-HANDED, racket raised, athletic stance. Grey t-shirt sweat-darkened, black shorts, white court shoes. Sweat on forehead catching fluorescent light. Dynamic athletic movement. The ball is listening now.",

    11: "Cinematic 9:16 vertical. Young Black man, 19, sitting on squash court floor against white wall. Grey t-shirt sweat-darkened, black shorts. Holding cracked iPhone in left hand, scrolling with thumb. Phone screen shows a dark sports app UI with bright blue accents, challenge cards, pool entries, and a 'PROVE IT' button — exactly like the attached reference screenshot. Blue #0000FF glow from the app on his face. Nike drawstring bag beside him. Post-workout discovery moment.",

    12: "Cinematic 9:16 vertical. Cracked iPhone propped against a black Nike drawstring bag on wooden squash court floor. Phone angled up, recording interface visible with red record dot. In the background, slightly out of focus, a young man stands at the T position with racket ready. Frame-within-a-frame composition. Fluorescent overhead.",

    13: "Cinematic 9:16 vertical. Phone-propped POV feel — slightly wide-angle, micro-shake. Young Black man in sweat-soaked grey t-shirt playing solo squash. Rapid action: serving, retrieving, volleying. Full commitment, everything he has. Fluorescent light, white walls, wooden floor. Twenty minutes of truth.",

    14: "Cinematic 9:16 vertical. Extreme close-up of a dark-skinned left thumb hovering above a phone screen. The phone screen shows a post-session results interface — a dark app UI with 'YOUR SCORE' displayed, Nike sponsored banner, 'CHALLENGE FRIEND' and 'NEXT CHALLENGE' blue buttons, exactly like the attached reference screenshot. Cracked phone, crack bottom-right corner. Thumb descends toward an Upload button. Point of no return. Dark background, blue glow from screen.",

    15: "Cinematic 9:16 vertical. Slow drift upward. Young Black man lying flat on his back on wooden squash court floor. Grey t-shirt sweat-soaked, court shoes splayed. One arm behind head. Phone face-down on chest. Staring up at fluorescent tubes. Waiting. The longest pause in the episode.",

    16: "Cinematic 9:16 vertical. Close-up of phone on a young man's chest suddenly erupting with #0000FF electric blue glow. The blue light floods across grey sweat-soaked t-shirt fabric and up to jaw and face. Eyes snap downward — wide, locked on screen. Maximum blue intensity. Then — hard cut to pure black.",
}

# ── Submit all 16 ────────────────────────────────────────────────────────────

def submit(scene_num):
    n_str = str(scene_num).zfill(2)
    prompt = MOTION_PROMPTS[scene_num]

    instance = {"prompt": prompt}

    # Use image-to-video for non-face scenes (generated frames)
    if scene_num in IMAGE_SCENES:
        frame_path = os.path.join(FRAMES_DIR, f'scene_{n_str}.jpg')
        if os.path.exists(frame_path):
            with open(frame_path, 'rb') as f:
                img_b64 = base64.b64encode(f.read()).decode()
            instance["image"] = {"bytesBase64Encoded": img_b64, "mimeType": "image/jpeg"}

    # Use app screenshots as image reference for app-discovery scenes
    if scene_num in APP_SCREEN_SCENES:
        app_img_path = os.path.join(APP_SCREENSHOT_DIR, APP_SCREEN_SCENES[scene_num])
        if os.path.exists(app_img_path):
            with open(app_img_path, 'rb') as f:
                img_b64 = base64.b64encode(f.read()).decode()
            instance["image"] = {"bytesBase64Encoded": img_b64, "mimeType": "image/png"}

    body = json.dumps({
        "instances": [instance],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "9:16",
        }
    }).encode()

    req = urllib.request.Request(
        f'{BASE}/models/{MODEL}:predictLongRunning?key={API_KEY}',
        data=body, headers={'Content-Type': 'application/json'}
    )
    resp = urllib.request.urlopen(req, timeout=60, context=ctx)
    return json.loads(resp.read()).get('name', '')


def poll_and_download(op_name, scene_num, max_wait=600):
    n_str = str(scene_num).zfill(2)
    start = time.time()

    while time.time() - start < max_wait:
        time.sleep(15)
        try:
            req = urllib.request.Request(f'{BASE}/{op_name}?key={API_KEY}')
            data = json.loads(urllib.request.urlopen(req, timeout=30, context=ctx).read())

            if data.get('done'):
                gr = data.get('response', {}).get('generateVideoResponse', {})

                if gr.get('raiMediaFilteredCount', 0) > 0:
                    reasons = gr.get('raiMediaFilteredReasons', ['unknown'])
                    return False, f"RAI: {reasons[0][:60]}"

                vids = gr.get('generatedSamples', [])
                if vids:
                    uri = vids[0].get('video', {}).get('uri', '')
                    if uri:
                        if 'key=' not in uri:
                            sep = '&' if '?' in uri else '?'
                            uri = f'{uri}{sep}key={API_KEY}'
                        out = os.path.join(CLIPS_DIR, f'clip_{n_str}.mp4')
                        subprocess.run(['curl', '-sL', '-o', out, '-k', uri], timeout=120)
                        sz = os.path.getsize(out) if os.path.exists(out) else 0
                        if sz > 10000:
                            return True, f"{sz//1024}KB"
                        return False, f"Download too small ({sz}B)"
                return False, "No video URI"
        except:
            pass

    return False, "Timeout"


# ── Main: batch submit then poll ─────────────────────────────────────────────

print(f"🎬 Submitting 16 scenes to Veo 3...\n")

# Already have scenes 1-3 from earlier run
existing_ops = {
    1: "models/veo-3.0-generate-001/operations/hnptoxt2fyqa",
    2: "models/veo-3.0-generate-001/operations/704opp3zbw3n",
    3: "models/veo-3.0-generate-001/operations/j5vlxb99rgg1",
}

# Check if clips 1-3 already exist
for n in [1, 2, 3]:
    clip = os.path.join(CLIPS_DIR, f'clip_{str(n).zfill(2)}.mp4')
    if os.path.exists(clip) and os.path.getsize(clip) > 10000:
        print(f"  Scene {n}: Already downloaded ✓")
        if n in existing_ops:
            del existing_ops[n]

operations = {}

# Submit scenes 4-16 in batches of 4 (rate limit friendly)
BATCH_SIZE = 4
remaining = list(range(4, 17))

for batch_start in range(0, len(remaining), BATCH_SIZE):
    batch = remaining[batch_start:batch_start + BATCH_SIZE]
    print(f"\n  Batch: scenes {batch}")

    for scene_num in batch:
        mode = "img2vid" if scene_num in IMAGE_SCENES else "txt2vid"
        try:
            op = submit(scene_num)
            operations[scene_num] = op
            print(f"    Scene {scene_num} ({mode}): submitted → {op.split('/')[-1]}")
        except Exception as e:
            err_msg = str(e)
            if hasattr(e, 'read'):
                err_msg = e.read().decode()[:200]
            print(f"    Scene {scene_num} ({mode}): ✗ {err_msg}")

    # Small delay between batches
    if batch_start + BATCH_SIZE < len(remaining):
        time.sleep(3)

# Now poll all operations
print(f"\n⏳ Polling {len(operations)} operations...\n")

results = {}
pending = dict(operations)
start = time.time()

while pending and (time.time() - start) < 600:
    time.sleep(15)
    elapsed = int(time.time() - start)

    for num in list(pending.keys()):
        op = pending[num]
        n_str = str(num).zfill(2)
        try:
            req = urllib.request.Request(f'{BASE}/{op}?key={API_KEY}')
            data = json.loads(urllib.request.urlopen(req, timeout=30, context=ctx).read())

            if data.get('done'):
                gr = data.get('response', {}).get('generateVideoResponse', {})

                if gr.get('raiMediaFilteredCount', 0) > 0:
                    reasons = gr.get('raiMediaFilteredReasons', ['unknown'])
                    print(f"  Scene {num}: ✗ RAI filtered [{elapsed}s]")
                    results[num] = ('fail', reasons[0][:60])
                    del pending[num]
                    continue

                vids = gr.get('generatedSamples', [])
                if vids:
                    uri = vids[0].get('video', {}).get('uri', '')
                    if uri:
                        if 'key=' not in uri:
                            sep = '&' if '?' in uri else '?'
                            uri = f'{uri}{sep}key={API_KEY}'
                        out = os.path.join(CLIPS_DIR, f'clip_{n_str}.mp4')
                        subprocess.run(['curl', '-sL', '-o', out, '-k', uri], timeout=120, capture_output=True)
                        sz = os.path.getsize(out) if os.path.exists(out) else 0
                        if sz > 10000:
                            print(f"  Scene {num}: ✓ {sz//1024}KB [{elapsed}s]")
                            results[num] = ('ok', sz)
                        else:
                            print(f"  Scene {num}: ✗ download {sz}B [{elapsed}s]")
                            results[num] = ('fail', 'small download')
                    else:
                        print(f"  Scene {num}: ✗ no URI [{elapsed}s]")
                        results[num] = ('fail', 'no uri')
                else:
                    print(f"  Scene {num}: ✗ no samples [{elapsed}s]")
                    results[num] = ('fail', 'no samples')
                del pending[num]
        except:
            pass

    if pending and elapsed % 45 < 20:
        print(f"  ... {elapsed}s — {len(pending)} pending", flush=True)

# Summary
print(f"\n{'='*50}")
print(f"RESULTS — {len([r for r in results.values() if r[0]=='ok'])+sum(1 for n in range(1,4) if os.path.exists(os.path.join(CLIPS_DIR, f'clip_{str(n).zfill(2)}.mp4')))}/16 clips ready\n")

for n in range(1, 17):
    clip = os.path.join(CLIPS_DIR, f'clip_{str(n).zfill(2)}.mp4')
    if os.path.exists(clip) and os.path.getsize(clip) > 10000:
        print(f"  Scene {n:2d}: ✓ {os.path.getsize(clip)//1024}KB")
    elif n in results:
        print(f"  Scene {n:2d}: ✗ {results[n][1]}")
    else:
        print(f"  Scene {n:2d}: ✗ missing")
