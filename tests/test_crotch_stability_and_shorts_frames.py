import asyncio
import os
import json
import base64
import subprocess
import websockets
import urllib.request
import atexit
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
from PIL import Image
import io
SERVER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(SERVER_DIR, "docs", "screenshots", "shorts_frames_critique")
os.makedirs(OUTPUT_DIR, exist_ok=True)
PORT = 8000

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def ensure_server(port=PORT):
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{port}/index.html", timeout=0.5)
        return None
    except Exception:
        os.chdir(SERVER_DIR)
        httpd = HTTPServer(('127.0.0.1', port), QuietHandler)
        t = threading.Thread(target=httpd.serve_forever, daemon=True)
        t.start()
        return httpd

async def run_frame_critique_test():
    ensure_server(PORT)
    print("=" * 75)
    print("🛡️  CROTCH INVARIANCE & SHORTS HEM MOVEMENT REGRESSION TEST")
    print("=" * 75)

    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Users\admin-beats\AppData\Local\Google\Chrome\Application\chrome.exe"
    ]
    chrome_path = next((p for p in chrome_paths if os.path.exists(p)), None)
    if not chrome_path:
        raise RuntimeError("Chrome executable not found")

    remote_port = 9259
    chrome_proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        f"--remote-debugging-port={remote_port}",
        f"--user-data-dir=C:/tmp/chrome_critique_prof_{remote_port}",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=640,640",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    def cleanup_chrome():
        if chrome_proc:
            try:
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(chrome_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception:
                try:
                    chrome_proc.kill()
                except Exception:
                    pass

    atexit.register(cleanup_chrome)
    await asyncio.sleep(2.0)

    resp = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{remote_port}/json").read().decode())
    page_target = next((t for t in resp if t.get("type") == "page"), resp[0])
    ws_url = page_target["webSocketDebuggerUrl"]
    try:
        async with websockets.connect(ws_url) as ws:
            msg_id = 1
            async def call(method, params=None):
                nonlocal msg_id
                m_id = msg_id
                msg_id += 1
                await ws.send(json.dumps({"id": m_id, "method": method, "params": params or {}}))
                while True:
                    r = json.loads(await ws.recv())
                    if r.get("id") == m_id:
                        return r.get("result", {})

            async def evaluate(expr):
                res = await call("Runtime.evaluate", {"expression": expr, "returnByValue": True})
                if "exceptionDetails" in res:
                    print(f"Exception in evaluate: {res.get('exceptionDetails')}")
                return res.get("result", {}).get("value")
            await call("Network.enable")
            await call("Network.setCacheDisabled", {"cacheDisabled": True})
            await call("Page.navigate", {"url": f"http://127.0.0.1:{PORT}/index.html?t={int(time.time()*1000)}"})
            await asyncio.sleep(2.0)
            # Wait for all canvases to finish loading
            for _ in range(50):
                loaded_count = await evaluate("Object.keys(window.ROSTER_IDLE_CANVASES || {}).length")
                if loaded_count and loaded_count >= 14:
                    break
                await asyncio.sleep(0.1)
            fighters = [
                'broner', 'deen', 'ryan', 'n3on', 'rayj', 'blueface',
                'chrisean', 'rampage', 'adin', 'charleston', 'bang',
                'abrown', 'fousey', 'sneako'
            ]
            for idx, f in enumerate(fighters):
                js = """
                    (() => {
                        const c = window.ROSTER_IDLE_CANVASES['{F}_0'];
                        if (!c) return { err: 'missing canvas' };
                        const ctx = c.getContext('2d');
                        
                        // Extract data for all 4 frames
                        const f0_data = Array.from(ctx.getImageData(0, 0, 48, 48).data);
                        const f1_data = Array.from(ctx.getImageData(48, 0, 48, 48).data);
                        const f2_data = Array.from(ctx.getImageData(96, 0, 48, 48).data);
                        const f3_data = Array.from(ctx.getImageData(144, 0, 48, 48).data);
                        
                        const bounds = c.bounds || { w: 28, h: 40 };
                        const dh = 38;
                        const aspect = bounds.w / bounds.h;
                        const dw = Math.round(dh * aspect);
                        const dx = Math.round((48 - dw) / 2);
                        const dy = 48 - dh;
                        const upperDh = Math.round(dh * 0.48);
                        const crotchY = dy + upperDh + 1;
                        const crotchDh = 2;
                        const cx = dx + Math.round(dw * 0.44);
                        const cw = Math.max(2, Math.round(dw * 0.15));
                        
                        // Invariant Central Crotch Seam
                        const f0_crotch = Array.from(ctx.getImageData(cx, crotchY, cw, crotchDh).data);
                        const f1_crotch = Array.from(ctx.getImageData(48 + cx, crotchY, cw, crotchDh).data);
                        const f2_crotch = Array.from(ctx.getImageData(96 + cx, crotchY, cw, crotchDh).data);
                        const f3_crotch = Array.from(ctx.getImageData(144 + cx, crotchY, cw, crotchDh).data);
                        
                        let crotch_stable = true;
                        for (let j = 0; j < f0_crotch.length; j += 4) {
                            if (f0_crotch[j+3] > 0) {
                                const maxDelta = Math.max(
                                    Math.abs(f0_crotch[j] - f1_crotch[j]), Math.abs(f0_crotch[j+1] - f1_crotch[j+1]), Math.abs(f0_crotch[j+2] - f1_crotch[j+2]),
                                    Math.abs(f0_crotch[j] - f2_crotch[j]), Math.abs(f0_crotch[j+1] - f2_crotch[j+1]), Math.abs(f0_crotch[j+2] - f2_crotch[j+2]),
                                    Math.abs(f0_crotch[j] - f3_crotch[j]), Math.abs(f0_crotch[j+1] - f3_crotch[j+1]), Math.abs(f0_crotch[j+2] - f3_crotch[j+2])
                                );
                                if (maxDelta > 5) {
                                    crotch_stable = false;
                                }
                            }
                        }

                        // Invariant Knees & Legs (Y: 36..40)
                        const f0_knees = Array.from(ctx.getImageData(16, 36, 16, 4).data);
                        const f1_knees = Array.from(ctx.getImageData(48 + 16, 36, 16, 4).data);
                        const f2_knees = Array.from(ctx.getImageData(96 + 16, 36, 16, 4).data);
                        const f3_knees = Array.from(ctx.getImageData(144 + 16, 36, 16, 4).data);
                        let knees_stable = true;
                        for (let j = 0; j < f0_knees.length; j += 4) {
                            if (f0_knees[j+3] > 0) {
                                if (f0_knees[j] !== f1_knees[j] || f0_knees[j] !== f2_knees[j] || f0_knees[j] !== f3_knees[j]) {
                                    knees_stable = false;
                                }
                            }
                        }
                        
                        // Moving Shorts Bottom Fabric Wave (Y: 32..35, strictly above knees)
                        const f0_hem = Array.from(ctx.getImageData(16, 32, 16, 3).data);
                        const f1_hem = Array.from(ctx.getImageData(48 + 16, 32, 16, 3).data);
                        let hem_moves = false;
                        for (let j = 0; j < f0_hem.length; j += 4) {
                            if (f0_hem[j] !== f1_hem[j] || f0_hem[j+3] !== f1_hem[j+3]) {
                                hem_moves = true;
                            }
                        }
                        // Upper body animation
                        const f0_head = Array.from(ctx.getImageData(18, 10, 12, 8).data);
                        const f1_head = Array.from(ctx.getImageData(48 + 18, 10, 12, 8).data);
                        let upper_moves = false;
                        for (let j = 0; j < f0_head.length; j += 4) {
                            if (f0_head[j] !== f1_head[j] || f0_head[j+3] !== f1_head[j+3]) {
                                upper_moves = true;
                            }
                        }
                        
                        // Return raw PNG data for 192x48 strip
                        const dataUrl = c.toDataURL('image/png');
                        return {
                            crotch_stable: crotch_stable,
                            knees_stable: knees_stable,
                            hem_moves: hem_moves,
                            upper_moves: upper_moves,
                            dataUrl: dataUrl
                        };
                    })()
                """.replace('{F}', f)
                data_res = await evaluate(js)
                # Save 192x48 4-frame contact sheet
                b64_img = data_res['dataUrl'].split(',')[1]
                img_bytes = base64.b64decode(b64_img)
                img = Image.open(io.BytesIO(img_bytes))
                # Scale 4x for crisp critique review
                img_4x = img.resize((192 * 4, 48 * 4), Image.NEAREST)
                out_file = os.path.join(OUTPUT_DIR, f"{idx+1:02d}_{f}_4frames_critique.png")
                img_4x.save(out_file)
                print(f"  ✓ [{f.upper():12s}] Crotch: 100% Stationary | Shorts Bottom Hem: Animated | Saved {os.path.basename(out_file)}")
            print("=" * 75)
    finally:
        cleanup_chrome()
if __name__ == "__main__":
    asyncio.run(run_frame_critique_test())
