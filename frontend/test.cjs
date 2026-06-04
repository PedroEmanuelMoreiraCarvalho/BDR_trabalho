const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('PAGE ERROR:', msg.text());
      }
    });

    page.on('pageerror', error => {
      console.log('UNHANDLED EXCEPTION:', error.message);
    });

    await page.goto('http://localhost:5173/');
    
    // Wait a bit for React to render
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
    console.log('Done checking port 5173');
    
  } catch (e) {
    console.log('Puppeteer error:', e.message);
  }
})();
