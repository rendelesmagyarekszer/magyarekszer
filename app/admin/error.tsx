"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an external reporting service if needed
    console.error("ADMIN RENDER ERROR:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d0902] text-[#fdfdf3] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-900/20 border border-red-500/30 p-8 max-w-2xl w-full rounded-lg shadow-2xl">
        <h2 className="text-2xl font-serif text-red-500 mb-4 uppercase tracking-[0.2em]">Hiba történt az Admin felületen</h2>
        <p className="text-ivory/80 mb-6 font-bold tracking-widest text-sm uppercase">
          Kérjük küldd el ezt a hibaüzenetet a fejlesztőnek:
        </p>
        <div className="bg-black/50 p-4 text-left text-red-400 font-mono text-xs whitespace-pre-wrap overflow-auto max-h-64 border border-red-500/10 mb-8">
          {error.name}: {error.message}
          <br /><br />
          {error.stack}
        </div>
        <button
          onClick={() => {
            // Attempt to clear potentially corrupt local storage before resetting
            try {
                localStorage.removeItem('magyarekszer_shippingSettings');
                localStorage.removeItem('magyarekszer_orders');
                localStorage.removeItem('magyarekszer_availableStones');
                localStorage.removeItem('magyarekszer_collections');
            } catch(e) {}
            reset();
          }}
          className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] text-xs px-8 py-4 transition-colors"
        >
          Adatok törlése és Újrapróbálkozás
        </button>
      </div>
    </div>
  );
}
