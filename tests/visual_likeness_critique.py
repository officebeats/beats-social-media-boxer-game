import asyncio
import os
import json
import base64
import subprocess
import websockets
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

PORT = 8089
SERVER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(SERVER_DIR, "docs", "screenshots", "roster_critique")
os.makedirs(OUTPUT_DIR, exist_ok=True)

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def ensure_server(port=8089):
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{port}/index.html", timeout=0.5)
        return None
    except Exception:
        os.chdir(SERVER_DIR)
        httpd = HTTPServer(('127.0.0.1', port), QuietHandler)
        t = threading.Thread(target=httpd.serve_forever, daemon=True)
        t.start()
        return httpd

async def capture_critiques():
    ensure_server(PORT)
    print(f"Static HTTP Server ready on http://127.0.0.1:{PORT}")

    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Users\admin-beats\AppData\Local\Google\Chrome\Application\chrome.exe"
    ]
    chrome_path = next((p for p in chrome_paths if os.path.exists(p)), None)
    if not chrome_path:
        raise RuntimeError("Chrome executable not found")

    remote_port = 9226
    chrome_proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        f"--remote-debugging-port={remote_port}",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=640,640",
        f"http://127.0.0.1:{PORT}/index.html"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    await asyncio.sleep(2.0)

    import urllib.request
    resp = urllib.request.urlopen(f"http://127.0.0.1:{remote_port}/json")
    tabs = json.loads(resp.read().decode())
    page_target = next((t for t in tabs if t.get("type") == "page"), tabs[0])
    ws_url = page_target["webSocketDebuggerUrl"]

    async with websockets.connect(ws_url) as ws:
        msg_id = 1
        async def send(method, params=None):
            nonlocal msg_id
            m = {"id": msg_id, "method": method, "params": params or {}}
            msg_id += 1
            await ws.send(json.dumps(m))
            while True:
                r = json.loads(await ws.recv())
                if r.get("id") == m["id"]:
                    return r.get("result", {})

        await send("Page.navigate", {"url": f"http://127.0.0.1:{PORT}/index.html"})
        await asyncio.sleep(2.0)

        async def eval_js(js):
            res = await send("Runtime.evaluate", {"expression": js, "returnByValue": True})
            return res.get("result", {}).get("value")

        async def capture_screenshot(filename):
            res = await send("Page.captureScreenshot", {"format": "png"})
            img_data = base64.b64decode(res["data"])
            filepath = os.path.join(OUTPUT_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(img_data)
            print(f"  ✓ Saved screenshot: {filename}")

        fighters = [
            'broner', 'deen', 'ryan', 'n3on', 'rayj', 'blueface',
            'chrisean', 'rampage', 'adin', 'charleston', 'bang',
            'abrown', 'fousey', 'sneako'
        ]

        print("\n=== CAPTURING 28 ROSTER CRITIQUE SCREENSHOTS ===")
        for i, f_id in enumerate(fighters):
            for skin in [0, 1]:
                skin_name = "default" if skin == 0 else "alt_viral"
                await eval_js(f"""
                    window.appState = 'CHAR_SELECT';
                    window.p1SelectIdx = {i};
                    window.p1SkinIdx = {skin};
                    window.drawGame();
                """)
                await asyncio.sleep(0.08)
                filename = f"{i+1:02d}_{f_id}_{skin_name}.png"
                await capture_screenshot(filename)

        print(f"\n🎉 Successfully captured all 28 fighter critique screenshots in {OUTPUT_DIR}")

    chrome_proc.terminate()

if __name__ == "__main__":
    asyncio.run(capture_critiques())
