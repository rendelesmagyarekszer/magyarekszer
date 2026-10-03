"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Package, 
    Type, 
    Settings, 
    LogOut, 
    ChevronRight,
    Home,
    ShoppingBag,
    Users,
    Bell,
    Ticket
} from 'lucide-react';
import { useConfig } from '@/components/ConfigProvider';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { t } = useConfig();
    const { allOrders } = useAuth();
    
    const pendingOrdersCount = allOrders.filter(o => o.status === 'pending' && !o.viewed).length;
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [passwordInput, setPasswordInput] = React.useState('');
    const [error, setError] = React.useState(false);
    const [isChecking, setIsChecking] = React.useState(true);

    React.useEffect(() => {
        try {
            const auth = sessionStorage.getItem('magyarekszer_admin_auth');
            if (auth === 'true') {
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error('Session storage error:', e);
        }
        setIsChecking(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === 'admin123') {
            setIsAuthenticated(true);
            sessionStorage.setItem('magyarekszer_admin_auth', 'true');
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    if (isChecking) return <div className="min-h-screen bg-[#0d0902]"></div>;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0d0902] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-[#150e03] border border-[#c9a56a]/20 p-12 shadow-3xl text-center space-y-10"
                >
                    <div className="space-y-4">
                        <h1 className="text-2xl font-serif text-[#fdfdf3] uppercase tracking-[0.4em]">Műhely Belépés</h1>
                        <div className="h-[1px] w-12 bg-[#c9a56a] mx-auto opacity-30"></div>
                        <p className="text-[11px] uppercase tracking-widest text-[#666666] font-bold">Adminisztrációs felület az ötvösmester számára</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="block text-xs uppercase tracking-[0.2em] font-black text-[#c9a56a]">Jelszó</label>
                            <input 
                                type="password" 
                                autoFocus
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className={`w-full bg-[#0d0902] border ${error ? 'border-red-500' : 'border-[#c9a56a]/20'} p-4 text-[13px] outline-none focus:border-[#c9a56a] text-[#fdfdf3] tracking-widest transition-colors`}
                                placeholder="••••••••"
                            />
                            {error && <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Helytelen jelszó!</p>}
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-[#c9a56a] text-[#150e03] py-5 font-black tracking-[0.5em] uppercase text-xs hover:bg-[#b08d55] transition-all shadow-xl active:scale-95"
                        >
                            Belépés
                        </button>
                    </form>

                    <Link href="/" className="inline-block text-xs uppercase tracking-widest text-[#666666] hover:text-[#c9a56a] transition-colors pt-4 font-bold underline decoration-[#c9a56a]/20 underline-offset-8">
                        Vissza a bolthoz
                    </Link>
                </motion.div>
            </div>
        );
    }

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Rendelések', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Vásárlók', href: '/admin/customers', icon: Users },
        { name: 'Kuponok', href: '/admin/coupons', icon: Ticket },
        { name: 'Értesítések', href: '/admin/notifications', icon: Bell },
        { name: 'Termékek', href: '/admin/products', icon: Package },
        { name: 'Szövegek', href: '/admin/texts', icon: Type },
        { name: 'Beállítások', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#0d0902] text-[#fdfdf3] flex">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-[#c9a56a]/10 bg-[#150e03] sticky top-0 h-screen flex flex-col">
                <div className="p-8 border-b border-[#c9a56a]/10">
                    <h2 className="text-base font-serif tracking-[0.3em] uppercase text-[#c9a56a]">Adminisztráció</h2>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group relative ${
                                    isActive 
                                        ? 'bg-[#c9a56a] text-[#150e03]' 
                                        : 'hover:bg-[#c9a56a]/10 text-[#999999] hover:text-[#c9a56a]'
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <div className="flex items-center justify-between flex-1">
                                    <span className="text-sm uppercase tracking-widest font-bold">{item.name}</span>
                                    
                                    {item.href === '/admin/orders' && pendingOrdersCount > 0 && (
                                        <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                                            {pendingOrdersCount}
                                        </span>
                                    )}
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#c9a56a]/10 space-y-2">
                    <Link 
                        href="/" 
                        className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#666666] hover:text-[#c9a56a] transition-all group"
                    >
                        <Home className="h-5 w-5" />
                        <span className="text-sm uppercase tracking-widest font-bold">Vissza a bolthoz</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 border-b border-[#c9a56a]/10 bg-[#150e03]/50 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <span className="text-xs uppercase tracking-[0.4em] text-[#666666] font-black italic">
                            MagyarÉkszer CMS v1.0
                        </span>
                    </div>
                </header>

                <div className="p-10 max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
