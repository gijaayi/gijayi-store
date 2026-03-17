export const metadata = {
  title: 'Jewellery Care – Gijayi',
  description: 'Learn how to store, clean, and preserve your Gijayi jewellery so each piece remains beautiful for years.',
};

const careTips = [
  'Store each piece individually in a soft pouch or lined box to avoid scratches and tangling.',
  'Avoid direct contact with perfume, makeup, hair spray, lotion, sanitiser, or water.',
  'Wipe gently with a dry microfiber cloth after wear to remove oils and residue.',
  'Remove jewellery before sleeping, exercising, bathing, or swimming.',
  'Keep kundan, polki, meenakari, and pearl styles away from moisture and harsh cleaners.',
  'Schedule periodic professional cleaning or polishing for heirloom and bridal sets.',
];

export default function CarePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Preserve the Craft</p>
        <h1 className="font-serif text-4xl md:text-5xl">Jewellery Care</h1>
      </div>

      <div className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8 space-y-4">
        {careTips.map((tip, index) => (
          <div key={tip} className="flex items-start gap-4 border-b border-[#ebe3d7] pb-4 last:border-b-0 last:pb-0">
            <span className="font-serif text-3xl text-[#b8963e]">0{index + 1}</span>
            <p className="text-sm text-gray-600 leading-relaxed pt-1">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}