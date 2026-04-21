import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

const tests = {
  passed: [],
  failed: []
};

async function test(name, fn) {
  try {
    await fn();
    tests.passed.push(name);
    console.log(`✅ ${name}`);
  } catch (e) {
    tests.failed.push(`${name}: ${e.message}`);
    console.log(`❌ ${name}: ${e.message}`);
  }
}

try {
  // Test 1: Login Page
  await test('Login Page Loads', async () => {
    await page.goto('http://172.20.0.2:3000', { waitUntil: 'networkidle', timeout: 10000 });
    const title = await page.title();
    if (!title.includes('GEO')) throw new Error('Title mismatch');
  });

  // Test 2: Sign-up Flow
  await test('Sign-up Page Accessible', async () => {
    await page.goto('http://172.20.0.2:3000/auth/sign-up', { waitUntil: 'networkidle' });
    const email = page.locator('input[type="email"]');
    if (await email.count() === 0) throw new Error('Email input not found');
  });

  // Test 3: Dashboard (Protected, should redirect)
  await test('Dashboard Protected (Redirects)', async () => {
    await page.goto('http://172.20.0.2:3000/dashboard', { waitUntil: 'networkidle' });
    const url = page.url();
    if (!url.includes('login') && !url.includes('auth')) throw new Error('Should redirect to auth');
  });

  // Test 4: Settings Page (Protected)
  await test('Settings Page Protected', async () => {
    await page.goto('http://172.20.0.2:3000/settings', { waitUntil: 'networkidle' });
    const url = page.url();
    if (!url.includes('login') && !url.includes('auth')) throw new Error('Should redirect to auth');
  });

  // Test 5: Account Page (Protected)
  await test('Account Page Protected', async () => {
    await page.goto('http://172.20.0.2:3000/account', { waitUntil: 'networkidle' });
    const url = page.url();
    if (!url.includes('login') && !url.includes('auth')) throw new Error('Should redirect to auth');
  });

} catch (e) {
  console.error('Test suite error:', e);
}

await browser.close();

console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${tests.passed.length}`);
console.log(`❌ Failed: ${tests.failed.length}`);
if (tests.failed.length > 0) {
  console.log('\nFailures:');
  tests.failed.forEach(f => console.log(`  - ${f}`));
}
