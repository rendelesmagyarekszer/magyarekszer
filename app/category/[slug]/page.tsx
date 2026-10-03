import React from 'react';
import CategoryClient from './CategoryClient';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

const categoryNames: Record<string, string> = {
    'medalok-es-talizmanok': 'Medálok és Talizmánok',
    'noi-lancok': 'Női Láncok',
    'fulbevalok': 'Fülbevalók',
    'karkotok': 'Karkötők',
    'karperecek': 'Karperecek',
    'gyuruk': 'Gyűrűk',
    'eljegyzesi-es-karikagyuruk': 'Karikagyűrűk',
    'eljegyzesi-gyuruk': 'Eljegyzési gyűrűk',
    'szobrok-es-disztargyak': 'Szobrok és dísztárgyak',
    'modern-ekszerek': 'Modern Ékszerek',
    'zomanc': 'Zománcozott Ékszerek'
};

export async function generateStaticParams() {
  return Object.keys(categoryNames).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let name = categoryNames[slug] || 'Ékszerek';
  let description = `Fedezze fel a(z) ${name} kollekciónkat. Kézzel készült, egyedi ezüst ékszerek tradicionális motívumokkal a MagyarÉkszer műhelyéből.`;

  if (slug === 'gyuruk') {
    name = "Gyűrűk, Pecsétgyűrűk és Eljegyzési Gyűrűk";
    description = "Egyedi, kézzel készült pecsétgyűrűk, eljegyzési gyűrűk és tradicionális magyar motívumokkal díszített ezüst gyűrűk széles választéka.";
  }

  return {
    title: `${name} | MagyarÉkszer - Szkíta-Hun-Magyar Tradíció`,
    description: description,
    alternates: {
        canonical: `https://magyarekszer.hu/category/${slug}`,
    },
    openGraph: {
      title: `${name} | MagyarÉkszer`,
      description: `Egyedi, kézzel készült ${name} tradicionális magyar motívumokkal.`,
      url: `https://magyarekszer.hu/category/${slug}`,
      siteName: 'MagyarÉkszer',
      locale: 'hu_HU',
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return <CategoryClient slug={slug} />;
}
