import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://magyarekszer.hu';

  // Read products from master_products.json
  let products = [];
  try {
    const filePath = path.join(process.cwd(), 'master_products.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    products = JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading products for sitemap:', error);
  }

  // Predefined static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/gallery',
    '/mission',
    '/shipping',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic category routes
  const categories = [
    'medalok-es-talizmanok',
    'noi-lancok',
    'fulbevalok',
    'karkotok',
    'karperecek',
    'gyuruk',
    'eljegyzesi-es-karikagyuruk',
    'eljegyzesi-gyuruk',
    'szobrok-es-disztargyak',
    'modern-ekszerek',
    'zomanc'
  ];

  const categoryRoutes = categories.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic product routes
  const productRoutes = products.map((product: any) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
