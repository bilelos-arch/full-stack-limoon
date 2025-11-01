'use client';

export default function Footer() {
  return (
    <footer className="w-full py-6 bg-[#0F0F0F] text-gray-400 text-sm text-center border-t border-gray-800">
      <p>
        © {new Date().getFullYear()} <span className="text-[#FFD93D] font-semibold">Limoon</span> —  
        Histoires personnalisées pour enfants 🌙  
      </p>
      <p className="mt-2">
        Fait avec ❤️ et créativité — <a href="#" className="text-[#FFD93D] hover:underline">Découvrir nos histoires</a>
      </p>
    </footer>
  );
}