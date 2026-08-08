const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Expose a function to change characters instantly
  await page.goto('http://localhost:8765/index.html');
  
  // Wait for game to load
  await page.waitForTimeout(2000);

  const rosterIds = ['broner', 'deen', 'ryan', 'n3on', 'rayj', 'blueface', 'chrisean', 'rampage', 'adin', 'charleston', 'walid', 'abrown', 'tank', 'floyd'];
  
  if (!fs.existsSync('test_screenshots')) {
    fs.mkdirSync('test_screenshots');
  }

  // Define an expose function we can call in the page to trigger battles
  for (let i = 0; i < rosterIds.length; i++) {
    const id = rosterIds[i];
    
    await page.evaluate((charId) => {
      // Force the game into battle mode with P1 = charId, P2 = charId
      window.appState = 'PLAYING';
      const idx = ROSTER.findIndex(r => r.id === charId);
      window.p1SelectIdx = idx;
      window.p2SelectIdx = idx;
      window.p1Locked = true;
      window.p2Locked = true;
      window.startMatch();
      
      // Force them to be throwing a punch so we can verify the punch frames too
      window.p1.anim = 'JAB';
      window.p1.animTimer = 36; // Mid-punch
      window.p2.anim = 'HOOK';
      window.p2.animTimer = 36;
    }, id);
    
    // Wait a frame for it to render
    await page.waitForTimeout(100);
    
    await page.screenshot({ path: `test_screenshots/${id}_vs_${id}.png` });
    console.log(`Saved screenshot for ${id}`);
  }
  
  await browser.close();
})();
