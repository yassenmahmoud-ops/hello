export type Product = {
  id: string;
  title: string;
  price: number;
  vendor: string;
  image?: string;
  description?: string;
};

const productCatalog = [
  {
    title: 'سماعات لاسلكية فاخرة',
    vendor: 'متجر1',
    description: 'صوت واضح وبطارية طويلة وراحة ممتازة للاستخدام اليومي والسفر.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'ساعة ذكية رياضية',
    vendor: 'متجر2',
    description: 'تتبع للنشاط البدني، إشعارات سريعة، وتصميم عملي يناسب كل يوم.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'كوتش رياضي خفيف',
    vendor: 'متجر3',
    description: 'مريح وخفيف مناسب للمشي اليومي والتمارين والخروج الطويل بدون تعب.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'تيشيرت رياضي',
    vendor: 'متجر1',
    description: 'تيشيرت رياضي خفيف ومريح مناسب للتمرين والحركة اليومية.',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'مجموعة عناية بالبشرة',
    vendor: 'متجر2',
    description: 'خيار لطيف للروتين اليومي يمنح البشرة انتعاشًا ومظهرًا صحيًا.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'قارورة ماء حرارية',
    vendor: 'متجر3',
    description: 'تحافظ على حرارة المشروبات لفترة أطول مع تصميم عملي وسهل الحمل.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
  },
];

// Simulate fetching products from an API (mock data)
export async function fetchProducts(count = 12): Promise<Product[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const data: Product[] = Array.from({ length: count }).map((_, i) => {
        const template = productCatalog[i % productCatalog.length];
        return {
          id: String(i + 1),
          title: template.title,
          price: Math.round(10 + Math.random() * 200),
          vendor: template.vendor,
          description: template.description,
          image: `${template.image}&sig=${i + 1}`,
        };
      });
      resolve(data);
    }, 160);
  });
}

export default fetchProducts;
