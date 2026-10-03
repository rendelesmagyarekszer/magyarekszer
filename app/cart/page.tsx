import React from 'react';
import CartClient from './CartClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kosár | MagyarÉkszer',
  description: 'Az Ön kosara a MagyarÉkszer weboldalán.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartClient />;
}
