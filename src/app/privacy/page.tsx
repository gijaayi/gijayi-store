import { Lock, Eye, Shield, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy – Gijayi',
  description: 'Read how Gijayi collects, uses, and protects customer information across orders, support, and marketing.',
};

const sections = [
  {
    title: 'Information We Collect',
    icon: Eye,
    content: 'We collect the details you provide when you place an order, contact support, subscribe to updates, or request styling assistance. This may include your name, phone number, email address, shipping details, and order history.',
  },
  {
    title: 'How We Use It',
    icon: UserCheck,
    content: 'We use your information to process orders, coordinate deliveries, provide customer support, send service notifications, and improve your experience on the Gijayi website. If you opt in, we may send product launches and campaign updates.',
  },
  {
    title: 'Data Protection',
    icon: Shield,
    content: 'We restrict access to customer information, use secure service providers for payment and infrastructure, and retain data only as long as required for legitimate business, regulatory, or support purposes.',
  },
  {
    title: 'Your Choices',
    icon: Lock,
    content: 'You can unsubscribe from marketing emails at any time and may contact us to update, correct, or request deletion of the personal information we store, subject to legal or transactional retention requirements.',
  },
];

const trustPoints = [
  { label: 'SSL Encrypted', desc: 'Secure connections' },
  { label: 'GDPR Compliant', desc: 'Data protection' },
  { label: 'No Sharing', desc: 'Your data stays private' },
  { label: 'Transparent', desc: 'Clear policies' },
];

export default function PrivacyPage() {
  return (
    <div className="bg-linear-to-b from-[#fcfbf8] to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3 font-semibold">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-4">Privacy Policy</h1>
          <p className="max-w-2xl mx-auto text-sm text-gray-600">Your privacy and security are our top priorities</p>
        </div>

        {/* Trust Points */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {trustPoints.map(({ label, desc }) => (
            <div key={label} className="border border-[#efe6d7] bg-white p-4 text-center rounded">
              <p className="text-xs uppercase tracking-widest text-[#b8963e] font-semibold mb-1">{label}</p>
              <p className="text-xs text-gray-600">{desc}</p>
            </div>
          ))}
        </div>

        {/* Policy Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title} className="border border-[#efe6d7] bg-white p-6 md:p-8 rounded-lg hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-[#b8963e] shrink-0" />
                  <h2 className="font-serif text-xl text-[#1a1a1a]">{section.title}</h2>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
              </section>
            );
          })}
        </div>

        {/* Security Banner */}
        <div className="border-l-4 border-[#b8963e] bg-[#fcfbf8] p-8 rounded-lg mb-12">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-[#b8963e] shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-[#1a1a1a] mb-2">🔒 Your Data is Secure</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                We use industry-standard encryption (SSL/TLS) for all data transmission. Your payment information is processed securely through Razorpay. We never store full credit card details on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Section */}
        <div className="border border-[#efe6d7] bg-white p-8 rounded-lg text-center">
          <p className="text-xs uppercase tracking-widest text-[#b8963e] font-semibold mb-3">✓ Compliance & Standards</p>
          <p className="text-sm text-gray-700 mb-4">
            Gijayi complies with Indian Privacy Law and maintains the highest standards of data protection. For any privacy concerns, contact us at gijaayi@gmail.com.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600">
            <span className="border border-gray-300 px-3 py-1 rounded">GDPR Aware</span>
            <span className="border border-gray-300 px-3 py-1 rounded">Data Protection</span>
            <span className="border border-gray-300 px-3 py-1 rounded">Transparent</span>
            <span className="border border-gray-300 px-3 py-1 rounded">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}