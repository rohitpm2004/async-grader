const { chromium } = require("playwright");

async function runPlaywrightTests(appUrl) {
  const browser = await chromium.launch({ headless: true });

  const results = {
    components: false,
    props: false,
    state: false,
    routing: false,
    api: false,
    logs: [],
  };

  try {
    const page = await browser.newPage();
    
    // We will assume routing is true if they have multiple components, we can refine this later
    // In this basic version we will check for standard React app indicators

    results.logs.push("Navigating to app...");
    await page.goto(appUrl, { waitUntil: "domcontentloaded", timeout: 8000 });
    await page.waitForTimeout(1000); 

    // Test 1: Component Rendering
    try {
      const rootHasContent = await page.evaluate(() => {
        const root = document.getElementById("root") || document.getElementById("app");
        return root ? root.children.length > 0 : document.body.children.length > 0;
      });
      results.components = rootHasContent;
    } catch (e) { }

    // Test 2: Props Handling (List items usually mean props are being mapped)
    try {
      const lists = await page.$$("ul li, ol li, [class*='card'], [class*='item']");
      results.props = lists.length > 0;
    } catch (e) {}

    // Test 3: State Updates (Click a button, check if DOM changes)
    try {
      const interactiveEls = await page.$$("button, input[type='checkbox'], input[type='radio']");
      for (const el of interactiveEls.slice(0, 3)) {
        const domBefore = await page.evaluate(() => document.body.innerHTML);
        await el.click({ force: true }).catch(() => {});
        await page.waitForTimeout(300);
        const domAfter = await page.evaluate(() => document.body.innerHTML);
        if (domBefore !== domAfter) {
          results.state = true;
          break;
        }
      }
    } catch (e) {}
    
  } catch (error) {
    results.logs.push(`Test suite error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Print results as JSON so the bash script can capture it
  console.log(JSON.stringify(results));
}

runPlaywrightTests("http://localhost:3000").catch(err => {
  console.log(JSON.stringify({ error: err.message }));
  process.exit(1);
});
