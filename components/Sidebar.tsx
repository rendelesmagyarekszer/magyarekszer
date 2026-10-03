"use client";

import React from 'react';
import Link from 'next/link';
import { categories } from '@/lib/data';
import { useConfig } from '@/components/ConfigProvider';

const Sidebar = () => {
    const { t } = useConfig();

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-[#2D3419] p-8 border border-[#c9a56a]/10 backdrop-blur-sm shadow-2xl">
                <h3 className="text-[12px] font-serif uppercase tracking-[0.3em] text-[#c9a56a] mb-10 border-b border-[#c9a56a]/10 pb-6 italic">
                    {t('categories')}
                </h3>
                <nav>
                    <ul className="flex flex-col items-center space-y-5">
                        <li className="text-[#5c4033] text-xs">|</li>
                        {categories.map((category) => (
                            <React.Fragment key={category.slug}>
                                <li>
                                    <Link 
                                        href={`/category/${category.slug}`}
                                        className="text-[14px] text-[#fdfdf3]/80 hover:text-[#c9a56a] hover:italic hover:translate-x-1 transition-all font-serif tracking-wide block"
                                    >
                                        {t(`cat_${category.slug}`)}
                                    </Link>
                                </li>
                                <li className="text-[#5c4033] text-xs">|</li>
                            </React.Fragment>
                        ))}
                    </ul>
                </nav>
                
                <div className="mt-16 text-[11px] text-[#5c4033] leading-relaxed italic border-t border-[#c9a56a]/10 pt-10 uppercase tracking-[0.4em] font-bold">
                    {t('tradition')}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
