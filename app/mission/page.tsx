import React from 'react';
import MissionClient from './MissionClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ékszer Öntés, 3D Tervezés és Egyedi Készítés | MagyarÉkszer',
  description: 'Profi ékszer szolgáltatások: Precíziós öntés, 3D tervezés (CAD/CAM), egyedi eljegyzési gyűrűk és pecsétgyűrűk készítése, ötvösmunkák és ékszerjavítás.',
  keywords: [
    "ékszer öntés", "3D ékszertervezés", "CAD ékszertervezés", "precíziós öntés", 
    "egyedi ékszer készítés", "pecsétgyűrű készítés", "eljegyzési gyűrű tervezés",
    "ékszer javítás", "arany öntés", "ezüst öntés", "ékszer mintázás"
  ],
  alternates: {
    canonical: 'https://magyarekszer.hu/mission',
  },
  openGraph: {
    title: 'Ékszer Szolgáltatások: Öntés, 3D Tervezés és Egyedi Munkák',
    description: 'Precíziós öntési technológia, digitális tervezés és hagyományos ötvösmunkák a MagyarÉkszer műhelyében.',
    url: 'https://magyarekszer.hu/mission',
    siteName: 'MagyarÉkszer',
    locale: 'hu_HU',
    type: 'website',
  },
};

export default function MissionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Ékszerészeti szolgáltatások",
    "provider": {
      "@type": "JewelryStore",
      "name": "MagyarÉkszer",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Molnár u. 23.",
        "addressLocality": "Budapest",
        "postalCode": "1056",
        "addressCountry": "HU"
      }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Ékszerészeti szolgáltatások",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Precíziós Öntés"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "3D Digitális Ékszertervezés"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Egyedi Ékszer Készítés (Pecsétgyűrűk, Eljegyzési gyűrűk)"
          }
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MissionClient />
    </>
  );
}
