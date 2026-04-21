import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

try {
  console.log('📍 Navigating to http://172.20.0.2:3000 (external IP)...');
  await page.goto('http://172.20.0.2:3000', { waitUntil: 'networkidle', timeout: 10000 });
  
  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: '/tmp/geoscope-1-login.png' });
  console.log('   ✅ Screenshot: /tmp/geoscope-1-login.png');
  
  const title = await page.title();
  console.log(`\n📋 Page Title: ${title}`);
  
  // Check for login form
  const emailInput = await page.locator('input[type="email"]').count();
  const passwordInput = await page.locator('input[type="password"]').count();
  const submitBtn = await page.locator('button[type="submit"]').count();
  
  console.log(`\n🔐 Login Form Elements:`);
  console.log(`   Email fields: ${emailInput}`);
  console.log(`   Password fields: ${passwordInput}`);
  console.log(`   Submit buttons: ${submitBtn}`);
  
  // Check links
  const signupLink = await page.locator('text=/sign.?up|register/i').count();
  const forgotLink = await page.locator('text=/forgot|reset/i').count();
  
  console.log(`\n🔗 Additional Links:`);
  console.log(`   Sign up links: ${signupLink}`);
  console.log(`   Forgot password links: ${forgotLink}`);
  
  console.log('\n✅ Playwright test successful!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await browser.close();
}
