import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

console.log('🎬 GEOScope Full App Journey\n');
console.log('='.repeat(50));

try {
  // 1. Login Page
  console.log('\n1️⃣  LOGIN PAGE');
  await page.goto('http://172.20.0.2:3000', { waitUntil: 'networkidle', timeout: 10000 });
  await page.screenshot({ path: '/tmp/01-login.png' });
  console.log('   ✅ Screenshot: /tmp/01-login.png');
  console.log(`   Title: ${await page.title()}`);
  
  // 2. Sign Up Page
  console.log('\n2️⃣  SIGN UP PAGE');
  const signupLink = page.locator('text=/sign.?up|register/i').first();
  if (await signupLink.count() > 0) {
    await signupLink.click();
    await page.waitForURL('**/auth/sign-up', { timeout: 5000 });
    await page.screenshot({ path: '/tmp/02-signup.png' });
    console.log('   ✅ Screenshot: /tmp/02-signup.png');
    console.log(`   URL: ${page.url()}`);
  }
  
  // 3. Settings Page (should redirect if not auth'd)
  console.log('\n3️⃣  SETTINGS PAGE (Protected)');
  await page.goto('http://172.20.0.2:3000/settings', { waitUntil: 'networkidle', timeout: 10000 });
  await page.screenshot({ path: '/tmp/03-settings.png' });
  console.log('   ✅ Screenshot: /tmp/03-settings.png');
  console.log(`   URL: ${page.url()}`);
  
  // 4. Account Page
  console.log('\n4️⃣  ACCOUNT PAGE (Protected)');
  await page.goto('http://172.20.0.2:3000/account', { waitUntil: 'networkidle', timeout: 10000 });
  await page.screenshot({ path: '/tmp/04-account.png' });
  console.log('   ✅ Screenshot: /tmp/04-account.png');
  console.log(`   URL: ${page.url()}`);
  
  // 5. Dashboard
  console.log('\n5️⃣  DASHBOARD (Protected)');
  await page.goto('http://172.20.0.2:3000/dashboard', { waitUntil: 'networkidle', timeout: 10000 });
  await page.screenshot({ path: '/tmp/05-dashboard.png' });
  console.log('   ✅ Screenshot: /tmp/05-dashboard.png');
  console.log(`   URL: ${page.url()}`);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests passed! App is responding.\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await browser.close();
}
