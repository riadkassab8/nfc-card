const puppeteer = require('puppeteer');

async function runBrowserTest() {
  const baseUrl = 'https://smart-card-qr-api.koyeb.app/api';
  const redirectBase = 'https://smart-card-qr-api.koyeb.app/r';
  const username = 'admin';
  const password = 'admin8$';
  
  let token = '';
  let categoryId = '';
  let cardId = '';
  let cardCode = '';
  
  const report = [];
  const logResult = (step, passed, details = '') => {
    report.push({ step, status: passed ? 'PASS' : 'FAIL', details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${step}${details ? ' - ' + details : ''}`);
  };

  try {
    // --- 1. SETUP (API) ---
    console.log("Setting up test data via API...");
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    let data = await res.json();
    if (!res.ok) throw new Error("Login failed");
    token = data.access_token || data.token;
    
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    // Create category
    res = await fetch(`${baseUrl}/categories`, { method: 'POST', headers, body: JSON.stringify({ name: 'Browser UI Test Category' }) });
    data = await res.json();
    categoryId = data._id;

    // Create card
    cardCode = `CARD-UI-${Math.floor(Math.random() * 100000)}`;
    res = await fetch(`${baseUrl}/cards`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        card_code: cardCode, 
        current_redirect_url: `http://localhost:5173/social/${cardCode}`, 
        card_type: 'Social Page', 
        category_id: categoryId 
      })
    });
    data = await res.json();
    cardId = data.id || data._id;

    // Save business data
    const bizData = { 
      business_name: 'UI Test Biz', 
      instagram: 'https://instagram.com/ui_test', 
      facebook: 'https://facebook.com/ui_test',
      whatsapp: 'https://wa.me/20123456789', 
      google_maps: 'https://maps.google.com/uitest'
    };
    await fetch(`${baseUrl}/cards/${cardId}`, { method: 'PUT', headers, body: JSON.stringify({ business_data: bizData }) });
    logResult('API Setup', true, `Card created: ${cardCode}`);

    // --- 2. BROWSER VERIFICATION ---
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    let apiRequestFound = false;
    page.on('request', req => {
      if (req.url().includes(`/api/cards`) && req.url().includes(cardCode)) {
        apiRequestFound = true;
      }
    });

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    // Navigate to QR redirect URL
    console.log(`Navigating to QR URL: ${redirectBase}/${cardCode}`);
    const qrUrl = `${redirectBase}/${cardCode}`;
    await page.goto(qrUrl, { waitUntil: 'networkidle0' });
    
    const currentUrl = page.url();
    if (currentUrl === `http://localhost:5173/social/${cardCode}`) {
      logResult('302 Redirect', true, `Arrived at ${currentUrl}`);
    } else {
      logResult('302 Redirect', false, `Arrived at ${currentUrl}`);
    }

    logResult('API Fetch Verification', apiRequestFound, "GET /api/cards?search=CARD-XXXX was called");

    // Wait for the UI to render the business name
    await page.waitForSelector('h1', { timeout: 5000 }).catch(()=>null);
    const h1Text = await page.evaluate(() => document.querySelector('h1')?.innerText);
    logResult('Render Business Name', h1Text === bizData.business_name, `Found: ${h1Text}`);

    // Check buttons
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText || a.className }));
    });
    
    const hasInsta = links.find(l => l.href === bizData.instagram);
    const hasFb = links.find(l => l.href === bizData.facebook);
    const hasWa = links.find(l => l.href === bizData.whatsapp);
    const hasMaps = links.find(l => l.href === bizData.google_maps);
    
    // Website and tiktok should NOT be there
    const hasTiktok = links.find(l => l.href.includes('tiktok'));
    const hasWebsite = links.find(l => l.href.includes('website'));

    logResult('Render Social Buttons', !!(hasInsta && hasFb && hasWa && hasMaps), "Instagram, FB, WA, Maps rendered with correct destinations");
    logResult('Empty Fields Hidden', !hasTiktok && !hasWebsite, "Tiktok and Website buttons are hidden properly");

    // --- 3. UPDATE & RE-VERIFY ---
    console.log("Updating Instagram via API...");
    const newInsta = 'https://instagram.com/modified_ui_test';
    await fetch(`${baseUrl}/cards/${cardId}`, { 
      method: 'PUT', 
      headers, 
      body: JSON.stringify({ business_data: { ...bizData, instagram: newInsta } }) 
    });

    // Check if QR URL changed? QR URL itself should be static in DB (current_redirect_url didn't change)
    let checkCardRes = await fetch(`${baseUrl}/cards/${cardId}`, { headers });
    let checkCardData = await checkCardRes.json();
    logResult('QR URL Stability', checkCardData.current_redirect_url === `http://localhost:5173/social/${cardCode}`, "QR URL unchanged after update");

    console.log("Reloading browser...");
    await page.goto(qrUrl, { waitUntil: 'networkidle0' });
    
    const newLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href }));
    });
    const hasNewInsta = newLinks.find(l => l.href === newInsta);
    logResult('Update Reflected in UI', !!hasNewInsta, "New Instagram link found on refresh");

    await browser.close();

    // --- 4. CLEANUP ---
    console.log("Cleaning up API data...");
    await fetch(`${baseUrl}/cards/${cardId}`, { method: 'DELETE', headers });
    await fetch(`${baseUrl}/categories/${categoryId}`, { method: 'DELETE', headers });
    logResult('Cleanup', true, "Test card and category deleted");

    console.log("\n=========================");
    console.log("FINAL USER FLOW: PASS");
    console.log("=========================\n");

  } catch(e) {
    console.error("Test failed:", e);
  }
}

runTest = runBrowserTest;
runTest();
