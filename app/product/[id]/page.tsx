import React from 'react';
import ProductClient from './ProductClient';
import fs from 'fs';
import path from 'path';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Helper to get products on server
function getProducts() {
  const filePath = path.join(process.cwd(), 'master_products.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

export async function generateStaticParams() {
  const products = getProducts();
  return products.map((product: any) => ({
    id: product.id,
  }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const products = getProducts();
  const product = products.find((p: any) => p.id === id);

  if (!product) {
    return {
      title: 'Termék nem található | MagyarÉkszer',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${product.name} | Szkíta-Hun-Magyar Tradicionális Ékszer`,
    description: product.description || `Kiváló minőségű, kézzel készült ${product.name} ezüst ékszer a MagyarÉkszer kínálatából. Tradicionális Szkíta, Hun és Magyar motívumok.`,
    alternates: {
        canonical: `https://magyarekszer.hu/product/${id}`,
    },
    openGraph: {
      title: `${product.name} | MagyarÉkszer`,
      description: product.description?.substring(0, 160),
      url: `https://magyarekszer.hu/product/${id}`,
      siteName: 'MagyarÉkszer',
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
        ...previousImages,
      ],
      locale: 'hu_HU',
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const products = getProducts();
  const product = products.find((p: any) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-20 bg-deep-brown">
        <h1 className="text-xl font-serif mb-4 uppercase tracking-widest text-[#fdfdf3]">Termék nem található.</h1>
      </div>
    );
  }

  const collectionProducts = product.collectionId 
    ? products.filter((p: any) => p.collectionId === product.collectionId && p.id !== product.id)
    : [];

  return <ProductClient product={product} initialCollectionProducts={collectionProducts} />;
}
