import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

console.log('📍 Navigating to http://localhost:3000...');
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

console.log('📸 Taking screenshot...');
await page.screenshot({ path: '/tmp/geoscope-homepage.png' });

console.log('🔍 Analyzing page...');
const title = await page.title();
const headings = await page.locator('h1, h2, h3').count();
const buttons = await page.locator('button').count();
const links = await page.locator('a').count();

console.log(`\n✅ Page Analysis:`);
console.log(`   Title: ${title}`);
console.log(`   Headings: ${headings}`);
console.log(`   Buttons: ${buttons}`);
console.log(`   Links: ${links}`);

await browser.close();
console.log('\n✅ Test complete!');
