'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, Clock, ArrowRight, MessageCircle } from 'lucide-react';

const supportTopics = ['Bridal styling', 'Custom orders', 'Shipping and returns', 'Product care', 'Press and partnerships'];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
  });

  return (
    <div className="bg-[#fcfbf8]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-start">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Get In Touch</p>
            <h1 className="font-serif text-4xl md:text-6xl leading-tight mb-5">Talk to the Gijayi concierge</h1>
            <p className="max-w-xl text-sm text-gray-600 leading-relaxed mb-10">
              Reach us for styling help, gifting assistance, custom bridal curation, or support with an existing order. We respond within one business day.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-[#efe6d7] bg-white p-5">
                <Mail size={18} className="text-[#b8963e] mb-3" />
                <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-2">Email</p>
                <a href="mailto:gijaayi@gmail.com" className="font-medium hover:text-[#b8963e]">gijaayi@gmail.com</a>
              </div>
              <div className="border border-[#efe6d7] bg-white p-5">
                <Phone size={18} className="text-[#b8963e] mb-3" />
                <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-2">Phone</p>
                <a href="tel:+917310580050" className="font-medium hover:text-[#b8963e]">+91 731 058 0050</a>
              </div>
              <div className="border border-[#efe6d7] bg-white p-5">
                <MapPin size={18} className="text-[#b8963e] mb-3" />
                <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-2">Studio</p>
                <p className="font-medium">123 Jewellery Lane, Mumbai 400001</p>
              </div>
              <div className="border border-[#efe6d7] bg-white p-5">
                <Clock size={18} className="text-[#b8963e] mb-3" />
                <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-2">Hours</p>
                <p className="font-medium">Mon to Sat, 10 AM to 7 PM IST</p>
              </div>
            </div>

            <div className="mt-10 border border-[#efe6d7] bg-white p-6">
              <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-4">Fastest Response</p>
              <a 
                href="https://wa.me/917310580050?text=Hi%20Gijayi%2C%20I%20need%20help%20with%20styling%2C%20orders%2C%20or%20shipping."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-[#25D366] rounded-lg hover:bg-[#25D366]/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} className="text-[#25D366]" />
                  <div>
                    <p className="font-medium text-[#25D366]">Chat on WhatsApp</p>
                    <p className="text-xs text-gray-500">Instant message for quick help</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#25D366]" />
              </a>
            </div>

            <div className="mt-10 border border-[#efe6d7] bg-white p-6">
              <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">Most Requested</p>
              <div className="flex flex-wrap gap-3">
                {supportTopics.map((topic) => (
                  <span key={topic} className="border border-[#efe6d7] px-4 py-2 text-xs tracking-widest uppercase text-gray-600">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-[#efe6d7] bg-white p-6 md:p-8 shadow-sm">
            {submitted ? (
              <div className="py-10 text-center">
                <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Message Received</p>
                <h2 className="font-serif text-3xl mb-4">We’ll get back to you shortly</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  A stylist or concierge specialist will respond within one business day.
                </p>
                <Link href="/faq" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#b8963e] hover:text-[#1a1a1a]">
                  Browse FAQs <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={async (event) => {
                  event.preventDefault();

                  setLoading(true);
                  setError('');

                  const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                  });

                  const data = (await response.json()) as { error?: string };

                  if (!response.ok) {
                    setError(data.error || 'Unable to submit form. Please try again.');
                    setLoading(false);
                    return;
                  }

                  setSubmitted(true);
                  setLoading(false);
                }}
              >
                <div>
                  <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Send a Message</p>
                  <h2 className="font-serif text-3xl mb-2">How can we help?</h2>
                  <p className="text-sm text-gray-500">Tell us a bit about what you need and we’ll route it to the right person.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required type="text" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} placeholder="First name" className="border border-[#e5ddcf] px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
                  <input required type="text" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} placeholder="Last name" className="border border-[#e5ddcf] px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" className="border border-[#e5ddcf] px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
                  <input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone number" className="border border-[#e5ddcf] px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
                </div>
                <select className="w-full border border-[#e5ddcf] px-4 py-3 text-sm outline-none focus:border-[#b8963e] bg-white" value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })}>
                  <option value="" disabled>Select a topic</option>
                  {supportTopics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
                <textarea required rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Your message" className="w-full border border-[#e5ddcf] px-4 py-3 text-sm outline-none focus:border-[#b8963e] resize-none" />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-[#1a1a1a] text-white py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}