#!/usr/bin/env node
const fs = require('fs');
function read(file){ return fs.existsSync(file) ? fs.readFileSync(file,'utf8') : ''; }
function exists(file){ return fs.existsSync(file); }
function pass(msg){ console.log(`✅ ${msg}`); }
function fail(msg){ console.log(`❌ ${msg}`); process.exitCode = 1; }
const siteLogo = read('src/components/SiteLogo.jsx');
const brand = read('src/lib/munsaqahBrand.js');
const manifest = read('public/site.webmanifest');
if (siteLogo.includes('munsaqah-logo__mark') && siteLogo.includes('munsaqah-logo__wordmarks')) pass('SiteLogo يبني الشعار من الأيقونة يمينًا والكلمة يسارًا'); else fail('SiteLogo لا يبني ترتيب الشعار الصحيح');
if (!siteLogo.includes('filter: brightness') && !siteLogo.includes('font-family')) pass('SiteLogo لا يغير ألوان الشعار ولا خطوط الموقع'); else fail('SiteLogo يحتوي filter أو font-family غير مطلوب');
if (brand.includes('munsaqah-horizontal-official.png') && brand.includes('wordmarkAr')) pass('الأصول الرسمية الملونة مستخدمة بدل SVG الغامق'); else fail('الأصول الرسمية الملونة غير مربوطة');
['public/brand/munsaqah-horizontal-official.png','public/brand/munsaqah-icon-official.png','public/brand/munsaqah-wordmark-ar-official.png','public/brand/munsaqah-wordmark-en-official.png','public/favicon.ico','public/site.webmanifest'].forEach(f => exists(f) ? pass(`${f} موجود`) : fail(`${f} غير موجود`));
if (!manifest.includes('"short_name": "Munsaqah"')) pass('manifest لا يغير اسم التطبيق إلى Munsaqah'); else fail('manifest ما زال يغير short_name إلى Munsaqah');
if (process.exitCode === 1) console.log('\nراجع الأخطاء قبل النشر.'); else console.log('\nتصحيح الشعار جاهز.');
