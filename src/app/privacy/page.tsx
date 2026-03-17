export const metadata = {
  title: 'Privacy Policy – Gijayi',
  description: 'Read how Gijayi collects, uses, and protects customer information across orders, support, and marketing.',
};

const sections = [
  {
    title: 'Information We Collect',
    content: 'We collect the details you provide when you place an order, contact support, subscribe to updates, or request styling assistance. This may include your name, phone number, email address, shipping details, and order history.',
  },
  {
    title: 'How We Use It',
    content: 'We use your information to process orders, coordinate deliveries, provide customer support, send service notifications, and improve your experience on the Gijayi website. If you opt in, we may send product launches and campaign updates.',
  },
  {
    title: 'Data Protection',
    content: 'We restrict access to customer information, use secure service providers for payment and infrastructure, and retain data only as long as required for legitimate business, regulatory, or support purposes.',
  },
  {
    title: 'Your Choices',
    content: 'You can unsubscribe from marketing emails at any time and may contact us to update, correct, or request deletion of the personal information we store, subject to legal or transactional retention requirements.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Legal</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Privacy Policy</h1>
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8">
            <h2 className="font-serif text-2xl mb-3">{section.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}