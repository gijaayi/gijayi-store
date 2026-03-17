export const metadata = {
  title: 'Terms of Service – Gijayi',
  description: 'Review the Gijayi website terms covering orders, payments, custom products, and website usage.',
};

const terms = [
  'By using this website, you agree to the policies, notices, and terms outlined here.',
  'Product imagery and handcrafted finishes may vary slightly from piece to piece due to artisanal techniques.',
  'Orders are confirmed only after successful payment and acceptance by Gijayi.',
  'Custom, altered, and personalised pieces cannot be cancelled or returned once production begins.',
  'Estimated dispatch dates are indicative and may shift during high-volume festive or wedding periods.',
  'All website content, imagery, branding, and copy are the property of Gijayi and may not be reproduced without permission.',
];

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Legal</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Terms of Service</h1>
      <div className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8">
        <ol className="space-y-4 text-sm text-gray-600 leading-relaxed list-decimal list-inside">
          {terms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}