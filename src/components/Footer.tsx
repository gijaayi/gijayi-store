import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="border border-white/15 p-3 sm:p-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#b8963e] mb-2 font-medium">Shipping Time</p>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">Dispatch in 2–3 business days for ready pieces; bridal made-to-order takes 10–21 days.</p>
          </div>
          <div className="border border-white/15 p-3 sm:p-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#b8963e] mb-2 font-medium">Return / Exchange</p>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">Eligible products can be returned or exchanged within 15 days in original condition.</p>
          </div>
          <div className="border border-white/15 p-3 sm:p-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#b8963e] mb-2 font-medium">Payment Methods</p>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">UPI, Visa, Mastercard, Net Banking, and secure prepaid checkout.</p>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-14 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-2 sm:mb-3 font-medium">Join Our World</p>
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4 leading-tight">
            Subscribe to our newsletter
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-2">
            Be the first to know about new collections, exclusive offers, and the stories behind our jewellery.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto px-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/10 border border-white/20 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-[#b8963e] placeholder:text-gray-500 transition-colors rounded-sm"
            />
            <button
              type="submit"
              className="bg-[#b8963e] text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs tracking-widest uppercase hover:bg-[#d4af64] transition-colors rounded-sm font-medium"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand */}
          <div>
            <h4 className="font-serif text-xl sm:text-2xl tracking-widest uppercase mb-4 sm:mb-5">Gijayi</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4 sm:mb-6">
              Curating India&apos;s finest handcrafted jewellery since 2010. Each piece is a celebration of artistry, tradition, and timeless beauty.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-[#b8963e] transition-colors">
                <Instagram size={16} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-[#b8963e] transition-colors">
                <Facebook size={16} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-[#b8963e] transition-colors">
                <Youtube size={16} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h5 className="text-xs tracking-[0.3em] uppercase font-medium mb-3 sm:mb-5 text-white">Shop</h5>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: 'Necklaces', href: '/shop?category=Necklaces' },
                { label: 'Earrings', href: '/shop?category=Earrings' },
                { label: 'Bangles', href: '/shop?category=Bangles' },
                { label: 'Maang Tikka', href: '/shop?category=Maang+Tikka' },
                { label: 'Anklets', href: '/shop?category=Anklets' },
                { label: 'New Arrivals', href: '/shop?filter=new' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm text-gray-400 hover:text-[#b8963e] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h5 className="text-xs tracking-[0.3em] uppercase font-medium mb-3 sm:mb-5 text-white">Help</h5>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: 'FAQ', href: '/faq' },
                { label: 'Shipping, Returns & Payments', href: '/shipping' },
                { label: 'Track Your Order', href: '/track-order' },
                { label: 'Size Guide', href: '/size-guide' },
                { label: 'Care Instructions', href: '/care' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-xs sm:text-sm text-gray-400 hover:text-[#b8963e] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-xs tracking-[0.3em] uppercase font-medium mb-3 sm:mb-5 text-white">Contact</h5>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin size={14} className="text-[#b8963e] mt-0.5 shrink-0 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-gray-400 leading-relaxed">Gijayi, 10A, Old Gunj, Rampur, UP 244901</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Phone size={14} className="text-[#b8963e] shrink-0 sm:w-4 sm:h-4" />
                <a href="tel:+917310580050" className="text-xs sm:text-sm text-gray-400 hover:text-[#b8963e] transition-colors">
                  +91 731 058 0050
                </a>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Mail size={14} className="text-[#b8963e] shrink-0 sm:w-4 sm:h-4" />
                <a href="mailto:gijaayi@gmail.com" className="text-xs sm:text-sm text-gray-400 hover:text-[#b8963e] transition-colors break-all">
                  gijaayi@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3 flex-wrap">
              <Link href="/contact" className="border border-white/15 px-3 sm:px-4 py-2 sm:py-3 text-xs tracking-widest uppercase text-gray-300 hover:border-[#b8963e] hover:text-[#b8963e] transition-colors rounded-sm">
                Contact Us
              </Link>
              <Link href="/wishlist" className="border border-white/15 px-3 sm:px-4 py-2 sm:py-3 text-xs tracking-widest uppercase text-gray-300 hover:border-[#b8963e] hover:text-[#b8963e] transition-colors rounded-sm">
                Wishlist
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <p className="text-xs text-gray-500 order-2 sm:order-1">
            © {new Date().getFullYear()} Gijayi. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center order-1 sm:order-2 w-full sm:w-auto">
            <Image
              src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/0169695890db3db16bfe.svg"
              alt="Visa"
              width={36}
              height={20}
              className="h-4 sm:h-5 w-auto opacity-60"
            />
            <span className="text-xs text-gray-500">Visa · Mastercard · UPI · Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
