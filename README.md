MarketPro — متجر متعدد البائعين (واجهة أمامية)

مشروع عرضي احترافي لبورتفوليو يقدّم واجهة متجر متعددة البائعين مبسطة باستخدام:
- HTML + Tailwind CSS + JavaScript + Vite

التشغيل محليًا:
```bash
npm install
npm run dev
```

الأوامر المفيدة:
- `npm run build` لبناء `output.css` وبناء Vite production
- `npm run preview` لمعاينة بناء الإنتاج محليًا

الهيكل المبدئي:
- `index.html` — صفحة السوق الرئيسية
- `seller.html` — بوابة بائع محلية (CRUD بسيط في localStorage)
- `checkout.html` — صفحة الدفع (تجريبي)
- `input.css` — مدخل Tailwind
- `src/main.js` — منطق الواجهة (عرض منتجات، بحث، إضافة للسلة تجريبي)
- `src/seller.js` — منطق بوابة البائع
- `src/checkout.js` — منطق صفحة الدفع

CI/CD:
- تم إضافة workflow GitHub Actions في `.github/workflows/ci.yml` لبناء المشروع وإرفاق `dist/` كـartifact على كل push إلى `main`.

Tailwind setup:
```bash
npm install
npm run build   # one-time production build
npm run dev     # development server + tailwind watch
```

Workflow overview:
- عدّل `input.css` ثم شغّل `npm run build` لإنتاج `output.css`.
- قم بالدفع إلى GitHub؛ الـCI سيبني المشروع تلقائيًا (انظر `.github/workflows/ci.yml`).

إذا تريد أضيف صفحة بائع حقيقية مع تسجيل دخول، أو أوصل للباك‌اند الحقيقي، أقدر أبدأ الخطوة التالية.
