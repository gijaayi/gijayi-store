import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20 bg-[#fcfbf8]">
      <div className="max-w-xl text-center">
        <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-4">404</p>
        <h1 className="font-serif text-5xl md:text-6xl mb-5">This piece is no longer here</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          The page you’re looking for may have moved, sold out, or never existed. Start again from our curated collections.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop" className="bg-[#1a1a1a] text-white px-8 py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors">
            Shop All
          </Link>
          <Link href="/collections" className="border border-[#1a1a1a] px-8 py-4 text-xs tracking-widest uppercase hover:border-[#b8963e] hover:text-[#b8963e] transition-colors">
            View Collections
          </Link>
        </div>
      </div>
    </div>
  );
}