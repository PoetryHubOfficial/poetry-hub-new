POETRY HUB — ویب سائٹ فائلیں

اہم:
یہ ایک نئی، موبائل فرینڈلی Poetry Hub ویب سائٹ کی ZIP ہے۔
اس پیکج میں ڈیزائن، تین کیٹیگریز، Admin Login اور Supabase Storage کے ذریعے
تصاویر دکھانے، Admin کے ذریعے اپلوڈ کرنے اور Admin کے ذریعے ڈیلیٹ کرنے کا نظام شامل ہے۔

آپ کے Supabase پروجیکٹ سے جوڑنے کے لیے:
1) config.js فائل Notepad میں کھولیں۔
2) Supabase Dashboard > Project Settings > API میں جائیں۔
3) Project URL کو SUPABASE_URL میں درج کریں۔
4) anon / public key کو SUPABASE_ANON_KEY میں درج کریں۔
5) Authentication > Users سے ایڈمن کی User ID کاپی کرکے ADMIN_UID میں درج کریں۔
6) Bucket کا نام poetry-images ہی رہنے دیں۔
7) فائل محفوظ کریں۔

اہم سیکیورٹی:
- صرف anon/public key استعمال کریں۔
- service_role key یا Database password کبھی config.js میں نہ ڈالیں۔
- Admin UID وہی ہو جو آپ نے Storage INSERT اور DELETE policies میں استعمال کی ہے۔
- یہ سائٹ صرف اسی UID والے لاگ اِن اکاؤنٹ کو Admin Panel دکھاتی ہے۔
- Supabase Policies اصل سیکیورٹی کنٹرول کرتی ہیں۔

تصاویر:
- زیادہ سے زیادہ 5 MB
- JPG, PNG, WEBP, GIF
- Category کے مطابق sad/, love/, islamic/ فولڈرز میں اپلوڈ ہوں گی۔

GitHub Pages:
1) ZIP کو کمپیوٹر پر Extract کریں۔
2) تمام فائلیں اپنے GitHub repository میں Upload کریں۔
3) Settings > Pages میں Deploy from a branch منتخب کریں۔
4) Branch main اور folder /(root) منتخب کرکے Save کریں۔

لوگو:
assets/logo-placeholder.svg عارضی لوگو ہے، منتخب کردہ اصل نمبر 1 لوگو نہیں۔
اصل لوگو تصویر دستیاب ہونے پر اسے assets/logo-placeholder.svg کی جگہ logo.png کے طور پر رکھ کر
index.html میں لوگو کا راستہ assets/logo.png کریں، یا اصل SVG/PNG کے مطابق راستہ تبدیل کریں۔
