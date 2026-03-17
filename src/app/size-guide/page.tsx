export const metadata = {
  title: 'Size Guide – Gijayi',
  description: 'Use the Gijayi size guide for bangles, necklaces, anklets, and adjustable bridal pieces.',
};

const bangles = [
  ['2.2', '5.7 cm', 'Extra small fit'],
  ['2.4', '6.0 cm', 'Small fit'],
  ['2.6', '6.35 cm', 'Medium fit'],
  ['2.8', '6.67 cm', 'Large fit'],
  ['2.10', '7.0 cm', 'Extra large fit'],
];

export default function SizeGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Find Your Fit</p>
        <h1 className="font-serif text-4xl md:text-5xl">Size Guide</h1>
        <p className="max-w-2xl mx-auto mt-5 text-sm text-gray-600 leading-relaxed">
          Use the measurements below as a guide. If you are ordering bridal jewellery or need a custom fit, our concierge can help.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_0.85fr] gap-8">
        <section className="border border-[#efe6d7] bg-white p-6 md:p-8">
          <h2 className="font-serif text-3xl mb-6">Bangles</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#efe6d7] text-gray-500 uppercase tracking-widest text-[11px]">
                  <th className="py-3 pr-4">Size</th>
                  <th className="py-3 pr-4">Diameter</th>
                  <th className="py-3">Fit</th>
                </tr>
              </thead>
              <tbody>
                {bangles.map(([size, diameter, fit]) => (
                  <tr key={size} className="border-b border-[#f1ece2] last:border-b-0">
                    <td className="py-4 pr-4 font-medium">{size}</td>
                    <td className="py-4 pr-4">{diameter}</td>
                    <td className="py-4 text-gray-600">{fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8">
          <h2 className="font-serif text-3xl mb-6">Measurement Tips</h2>
          <ul className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <li>Measure your hand when relaxed, not after exercise or in high heat.</li>
            <li>For bangles, tuck your thumb inward and measure around the widest part of your hand.</li>
            <li>For chokers and necklaces, use a soft tape to note your preferred wearing length.</li>
            <li>Anklet styles in our catalogue are usually adjustable between 9 and 11 inches.</li>
            <li>If you are between sizes, choose the larger size for rigid styles.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}