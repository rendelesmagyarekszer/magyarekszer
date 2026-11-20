import React from 'react';
import * as Icons from "lucide-react";

interface CategoryHeaderProps {
  cat: {
    id: string;
    icon: string;
    name: string;
  };
}

export default function CategoryHeader({ cat }: CategoryHeaderProps) {
  const Icon = (Icons as any)[cat.icon];
  return (
    <div className="flex items-center gap-4">
      {Icon ? <Icon className="h-5 w-5 text-gold/60" /> : null}
      <h3 className="text-base font-black uppercase tracking-widest text-gold">
        {cat.name}
      </h3>
    </div>
  );
}
