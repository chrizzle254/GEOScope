const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const screenshotsDir = './test-screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testApp() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.createContext();
  const page = await context.newPage();

  console.log('🎬 Starting GEOScope App Journey...\n');

  try {
    // 1. Homepage
    console.log('1️⃣  Visiting homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${screenshotsDir}/01-homepage.png` });
    console.log('   ✅ Screenshot: 01-homepage.png\n');

    // 2. Check if login button exists
    console.log('2️⃣  Checking for auth buttons...');
    const loginBtn = page.locator('text=Log in');
    const signupBtn = page.locator('text=Sign up');
    if ((await loginBtn.count()) > 0) {
      console.log('   ✅ Login button found');
    }
    if ((await signupBtn.count()) > 0) {
      console.log('   ✅ Sign up button found\n');
    }

    // 3. Navigate to signup
    console.log('3️⃣  Navigating to sign up...');
    await page.goto('http://localhost:3000/auth/sign-up', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${screenshotsDir}/02-signup-page.png` });
    console.log('   ✅ Screenshot: 02-signup-page.png\n');

    // 4. Check form fields
    console.log('4️⃣  Checking form elements...');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    console.log(`   Email field: ${(await emailInput.count()) > 0 ? '✅' : '❌'}`);
    console.log(`   Password field: ${(await passwordInput.count()) > 0 ? '✅' : '❌'}\n`);

    // 5. Check dashboard page (if accessible)
    console.log('5️⃣  Checking dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    const dashboardTitle = page.locator('text=Dashboard');
    if ((await dashboardTitle.count()) > 0) {
      await page.screenshot({ path: `${screenshotsDir}/03-dashboard.png` });
      console.log('   ✅ Dashboard loaded. Screenshot: 03-dashboard.png\n');
    } else {
      console.log('   ℹ️  Dashboard redirected (probably auth required)\n');
    }

    // 6. Check settings page
    console.log('6️⃣  Checking settings page...');
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
    const settingsTitle = page.locator('text=Settings');
    if ((await settingsTitle.count()) > 0) {
      await page.screenshot({ path: `${screenshotsDir}/04-settings.png` });
      console.log('   ✅ Settings page loaded. Screenshot: 04-settings.png\n');
    } else {
      console.log('   ℹ️  Settings redirected (probably auth required)\n');
    }

    // 7. Page structure check
    console.log('7️⃣  Analyzing page structure...');
    const navBar = page.locator('nav');
    const buttons = page.locator('button');
    const headings = page.locator('h1, h2, h3');
    console.log(`   Navigation elements: ${await navBar.count()}`);
    console.log(`   Buttons: ${await buttons.count()}`);
    console.log(`   Headings: ${await headings.count()}\n`);

    console.log('✅ App journey complete!\n');
    console.log(`📸 Screenshots saved to: ${path.resolve(screenshotsDir)}`);
    console.log('\nFinding issues:');
    console.log('- Check if all pages load without errors');
    console.log('- Verify forms are functional');
    console.log('- Check auth flows');
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
}

testApp();
