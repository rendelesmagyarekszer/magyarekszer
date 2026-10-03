"use client";

import React, { useState, useEffect } from 'react';
import { useConfig } from '@/components/ConfigProvider';
import { useAuth, User, Order } from '@/components/AuthProvider';
import { 
    User as UserIcon, 
    Mail, 
    MapPin, 
    Phone, 
    Save, 
    CheckCircle, 
    LogOut, 
    Package, 
    Calendar, 
    CreditCard,
    ArrowRight,
    ShoppingBag,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AccountPage() {
    const { t, language, formatPrice } = useConfig();
    const { user, login, register, logout, updateUser, orders } = useAuth();
    
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [isSaved, setIsSaved] = useState(false);
    
    // Auth Form State
    const [authData, setAuthData] = useState({
        email: '',
        password: '',
        fullName: ''
    });
    const [authError, setAuthError] = useState('');

    // Profile Form State
    const [profileData, setProfileData] = useState<User>({
        fullName: '',
        email: '',
        address: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                email: user.email || '',
                address: user.address || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleAuthSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');

        if (mode === 'login') {
            const success = login(authData.email, authData.password);
            if (!success) {
                setAuthError(language === 'HU' ? 'Érvénytelen e-mail vagy jelszó.' : 'Invalid email or password.');
            }
        } else {
            const success = register({
                fullName: authData.fullName,
                email: authData.email,
                password: authData.password,
                address: '',
                phone: ''
            });
            if (!success) {
                setAuthError(language === 'HU' ? 'Ez az e-mail cím már foglalt.' : 'This email is already registered.');
            }
        }
    };

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(profileData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    if (!user) {
        return (
            <main className="min-h-screen bg-[#150e03] text-[#fdfdf3] py-24 px-4 flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-[450px] w-full"
                >
                    <div className="text-center mb-12">
                        <div className="inline-block p-5 border border-[#c9a56a]/20 rounded-full mb-8">
                            <Lock className="h-10 w-10 text-[#c9a56a]" />
                        </div>
                        <h1 className="text-3xl font-serif uppercase tracking-[0.4em] mb-4">
                            {mode === 'login' ? (language === 'HU' ? 'Belépés' : 'Login') : (language === 'HU' ? 'Regisztráció' : 'Register')}
                        </h1>
                        <div className="h-[1px] w-12 bg-[#c9a56a]/30 mx-auto"></div>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="bg-[#2D3419]/20 border border-[#c9a56a]/10 p-10 backdrop-blur-md space-y-6">
                        {mode === 'register' && (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-[#c9a56a] font-black italic">{language === 'HU' ? 'Teljes név' : 'Full Name'}</label>
                                <input 
                                    type="text" 
                                    required
                                    value={authData.fullName}
                                    onChange={(e) => setAuthData({...authData, fullName: e.target.value})}
                                    className="w-full bg-[#150e03]/50 border border-[#c9a56a]/10 p-4 text-xs text-[#fdfdf3] outline-none focus:border-[#c9a56a]/40"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-[#c9a56a] font-black italic">{language === 'HU' ? 'E-mail' : 'Email'}</label>
                            <input 
                                type="email" 
                                required
                                value={authData.email}
                                onChange={(e) => setAuthData({...authData, email: e.target.value})}
                                className="w-full bg-[#150e03]/50 border border-[#c9a56a]/10 p-4 text-xs text-[#fdfdf3] outline-none focus:border-[#c9a56a]/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-[#c9a56a] font-black italic">{language === 'HU' ? 'Jelszó' : 'Password'}</label>
                            <input 
                                type="password" 
                                required
                                value={authData.password}
                                onChange={(e) => setAuthData({...authData, password: e.target.value})}
                                className="w-full bg-[#150e03]/50 border border-[#c9a56a]/10 p-4 text-xs text-[#fdfdf3] outline-none focus:border-[#c9a56a]/40"
                            />
                        </div>

                        {authError && (
                            <p className="text-red-500/80 text-[10px] uppercase tracking-widest font-black italic text-center py-2">{authError}</p>
                        )}

                        <button 
                            type="submit"
                            className="w-full bg-[#c9a56a] text-[#150e03] py-5 font-black uppercase tracking-[0.4em] text-[10px] hover:bg-[#b08d55] transition-all"
                        >
                            {mode === 'login' ? (language === 'HU' ? 'Bejelentkezés' : 'Sign In') : (language === 'HU' ? 'Fiók Létrehozása' : 'Create Account')}
                        </button>

                        <div className="text-center pt-6">
                            <button 
                                type="button"
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-[10px] uppercase tracking-widest text-[#666666] hover:text-[#c9a56a] transition-colors font-bold"
                            >
                                {mode === 'login' 
                                    ? (language === 'HU' ? 'Még nincs fiókod? Regisztrálj' : "Don't have an account? Register") 
                                    : (language === 'HU' ? 'Már van fiókod? Lépj be' : "Already have an account? Login")}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#150e03] text-[#fdfdf3] py-24 px-4 overflow-hidden">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-20">
                
                {/* Profile Sidebar */}
                <div className="lg:col-span-1 space-y-12">
                    <div className="text-center lg:text-left">
                        <div className="inline-block p-5 border border-[#c9a56a]/20 rounded-full mb-8">
                            <UserIcon className="h-10 w-10 text-[#c9a56a]" />
                        </div>
                        <h1 className="text-3xl font-serif uppercase tracking-[0.3em] mb-2">{user.fullName}</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#666666] font-black italic">{user.email}</p>
                        <button 
                            onClick={logout}
                            className="mt-8 flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] text-[#666666] hover:text-red-500 transition-colors font-black"
                        >
                            <LogOut className="h-3 w-3" /> {language === 'HU' ? 'Kijelentkezés' : 'Log Out'}
                        </button>
                    </div>

                    <form onSubmit={handleProfileSave} className="bg-[#2D3419]/20 border border-[#c9a56a]/10 p-8 space-y-6">
                        <h3 className="text-[10px] uppercase tracking-[0.4em] text-[#c9a56a] font-black border-b border-[#c9a56a]/10 pb-4 mb-6 italic">
                            {language === 'HU' ? 'Profil Adatok' : 'Profile Details'}
                        </h3>
                        
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-[#555555] font-black">{language === 'HU' ? 'Teljes név' : 'Full Name'}</label>
                            <input 
                                type="text"
                                value={profileData.fullName}
                                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                className="w-full bg-black/30 border border-[#c9a56a]/10 p-4 text-xs text-[#fdfdf3] outline-none focus:border-[#c9a56a]/40 font-serif"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-[#555555] font-black">{language === 'HU' ? 'Telefonszám' : 'Phone'}</label>
                            <input 
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                className="w-full bg-black/30 border border-[#c9a56a]/10 p-4 text-xs text-[#fdfdf3] outline-none focus:border-[#c9a56a]/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-[#555555] font-black">{language === 'HU' ? 'Szállítási cím' : 'Shipping Address'}</label>
                            <textarea 
                                value={profileData.address}
                                rows={3}
                                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                className="w-full bg-black/30 border border-[#c9a56a]/10 p-4 text-xs text-[#fdfdf3] outline-none focus:border-[#c9a56a]/40 font-serif italic"
                            />
                        </div>

                        <button 
                            type="submit"
                            className="w-full border border-[#c9a56a]/40 text-[#c9a56a] py-4 font-black uppercase tracking-[0.4em] text-[9px] hover:bg-[#c9a56a] hover:text-[#150e03] transition-all flex items-center justify-center gap-3"
                        >
                            {isSaved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            {isSaved ? (language === 'HU' ? 'Mentve' : 'Saved') : (language === 'HU' ? 'Mentés' : 'Save')}
                        </button>
                    </form>
                </div>

                {/* Main Content: Orders History */}
                <div className="lg:col-span-2 space-y-12">
                    <div>
                        <h2 className="text-2xl font-serif uppercase tracking-[0.4em] mb-4 border-b border-[#c9a56a]/10 pb-8 italic">
                            {language === 'HU' ? 'Rendeléstörténet' : 'Order History'}
                        </h2>
                    </div>

                    {orders.length > 0 ? (
                        <div className="space-y-8">
                            {orders.map((order) => (
                                <motion.div 
                                    key={order.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-[#2D3419]/10 border border-[#c9a56a]/5 hover:border-[#c9a56a]/20 transition-all p-8 group"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-[#150e03] border border-[#c9a56a]/10">
                                                <Package className="h-6 w-6 text-[#c9a56a]/60" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-[#555555] font-black mb-1">#{order.id}</p>
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-3 w-3 text-[#3d2b1f]" />
                                                    <p className="text-xs italic text-[#999999] font-serif">{new Date(order.date).toLocaleDateString(language === 'HU' ? 'hu-HU' : 'en-US')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-[10px] uppercase tracking-widest text-[#555555] font-black mb-1">{language === 'HU' ? 'Állapot' : 'Status'}</p>
                                            <p className="text-xs uppercase tracking-widest text-[#c9a56a] font-bold italic">{order.status === 'pending' ? (language === 'HU' ? 'Feldolgozás alatt' : 'Processing') : order.status}</p>
                                        </div>
                                        <div className="text-left md:text-right px-8 md:border-l border-[#c9a56a]/10">
                                            <p className="text-[10px] uppercase tracking-widest text-[#555555] font-black mb-1">{language === 'HU' ? 'Összesen' : 'Total'}</p>
                                            <p className="text-xl font-black text-[#fdfdf3] tracking-widest">{formatPrice(order.total)}</p>
                                        </div>
                                    </div>

                                    {/* Order Items Mini List */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#c9a56a]/5 pt-8">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 items-center">
                                                <div className="h-12 w-12 border border-[#c9a56a]/10 overflow-hidden shrink-0">
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] uppercase tracking-widest text-[#fdfdf3] font-bold truncate">{item.name}</p>
                                                    <p className="text-[9px] text-[#666666] font-serif italic">{item.quantity} x {formatPrice(item.price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 border border-[#c9a56a]/10 bg-[#2D3419]/5">
                            <ShoppingBag className="h-12 w-12 text-[#c9a56a]/20 mx-auto mb-6" />
                            <p className="text-[#666666] font-serif italic text-lg uppercase tracking-[0.2em]">{language === 'HU' ? 'Még nincs leadott rendelése.' : "You haven't placed any orders yet."}</p>
                            <Link href="/" className="inline-block mt-8 text-[9px] uppercase tracking-[0.4em] text-[#c9a56a] border-b border-[#c9a56a]/40 pb-1 hover:text-[#fdfdf3] transition-colors font-black">
                                {language === 'HU' ? 'Fedezze fel ékszereinket' : 'Explore our collection'}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
