"use client";

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';

function ImgWithFallback({ srcLocal, alt }: { srcLocal: string; alt?: string }) {
  const [src, setSrc] = useState(srcLocal);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ''}
      className="w-full h-full object-cover"
      onError={() => setSrc('https://images.unsplash.com/photo-1520975911993-5c1d9f9b3e6b?auto=format&fit=crop&w=1200&q=60')}
    />
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const subtle = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

const founderStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const founderItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function AboutClient() {
  return (
    <main className="text-slate-900 antialiased">
      {/* HERO */}
      <motion.header initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
        <motion.div variants={subtle} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.30), rgba(0,0,0,0.10))' }} />
         <div className="relative bg-white">
           {/* Use Our Story.png as a full-width image without cropping */}
           <img src="/Our%20Story.png" alt="Our Story Hero" className="w-full h-auto md:object-contain object-cover" />

           {/* Overlay + content centered over the image */}
           <motion.div variants={subtle} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.16), rgba(0,0,0,0.04))' }} />
          {/* removed content card overlay to show full hero image */}
         </div>
      </motion.header>

      {/* BRAND STORY */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl font-serif font-semibold mb-4">Est. 2025 Rampur, UP – The Story of Gijayi</h2>

            {/* Collapsible story: show 7 lines then expand */}
            <StoryText />
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="rounded-lg overflow-hidden shadow-lg relative">
            <div className="relative h-52 md:h-80 w-full">
              {/* Use the user-provided Our Story image from public/ */}
              <ImgWithFallback srcLocal="/About%20banner.png" alt="About Banner" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* MISSION / PHILOSOPHY */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12 grid md:grid-cols-3 gap-6">
          {[
            { title: 'Craftsmanship', text: 'Hand-checked pieces made by skilled artisans.' },
            { title: 'Ethical Sourcing', text: 'Materials curated with transparency and care.' },
            { title: 'Timeless Design', text: 'Pieces designed to be cherished across generations.' },
          ].map((card) => (
            <motion.div key={card.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-amber-600 font-semibold mb-2">{card.title}</div>
              <p className="text-gray-700">{card.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CRAFTSMANSHIP / PROCESS */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16 space-y-12">
        {[
          { img: '/Design%20&%20Sketch.png', title: 'Design & Sketch', text: 'Every collection starts with careful sketching and material selection.' },
          { img: '/Handcrafting.png', title: 'Handcrafting', text: 'Artisans shape and finish each component with meticulous attention.' },
          { img: '/Polish%20%26%20Inspect.png', title: 'Polish & Inspect', text: 'Final pieces are polished and inspected by hand before packaging.' },
        ].map((block, idx) => (
          <div key={block.title} className={`grid md:grid-cols-2 gap-8 items-center ${idx % 2 === 1 ? 'md:grid-flow-dense md:grid-cols-2' : ''}`}>
            <motion.div initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="rounded-lg overflow-hidden shadow-lg">
              <img src={block.img} alt={block.title} className="w-full h-72 object-cover" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h3 className="text-2xl font-serif font-semibold mb-3">{block.title}</h3>
              <p className="text-gray-700">{block.text}</p>
            </motion.div>
          </div>
        ))}
      </section>

      {/* PHILOSOPHY / PROMISE / VALUES — cards */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16 bg-white">
        <div className="grid gap-6 md:grid-cols-3">
          <motion.article variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ translateY: -6, scale: 1.01 }} whileTap={{ scale: 0.995 }} tabIndex={0} className="bg-white border border-amber-50 rounded-xl shadow-md p-6 md:p-8 transition-shadow focus:outline-none focus:ring-4 focus:ring-amber-100">
            <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-4">Our Philosophy</h3>
            <div className="text-gray-700 text-base md:text-lg leading-relaxed text-justify space-y-4">
              <p>At Gijayi, we believe jewellery should carry feeling. It should reflect individuality, elegance, and the quiet joy of wearing something made with intention.</p>
              <p>Our creations are inspired by crystals, colour, craft, and the timeless beauty of handmade art. Each design is meant to feel personal, graceful, and full of positive energy.</p>
            </div>
          </motion.article>

          <motion.article variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ translateY: -6, scale: 1.01 }} whileTap={{ scale: 0.995 }} tabIndex={0} className="bg-white border border-amber-50 rounded-xl shadow-md p-6 md:p-8 transition-shadow focus:outline-none focus:ring-4 focus:ring-amber-100">
            <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-4">Our Promise</h3>
            <div className="text-gray-700 text-base md:text-lg leading-relaxed text-justify space-y-4">
              <p>Gijayi exists to bring a little more beauty into the world — one handcrafted piece at a time.</p>
              <p>We hope every design you choose from us feels special, soulful, and made to stay with you as more than just an accessory.</p>
            </div>
          </motion.article>

          <motion.article variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ translateY: -6, scale: 1.01 }} whileTap={{ scale: 0.995 }} tabIndex={0} className="bg-white border border-amber-50 rounded-xl shadow-md p-6 md:p-8 transition-shadow focus:outline-none focus:ring-4 focus:ring-amber-100">
            <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-4">What We Stand For</h3>
            <ul className="text-gray-700 text-base md:text-lg leading-relaxed space-y-3 list-none pl-0">
              <li className="flex items-start gap-3"><span className="text-amber-600 mt-1">•</span><span>Handmade creations inspired by lifelong creativity.</span></li>
              <li className="flex items-start gap-3"><span className="text-amber-600 mt-1">•</span><span>Designs shaped with love, detail, and intention.</span></li>
              <li className="flex items-start gap-3"><span className="text-amber-600 mt-1">•</span><span>Jewellery that feels personal, expressive, and elegant.</span></li>
              <li className="flex items-start gap-3"><span className="text-amber-600 mt-1">•</span><span>A brand built with family support, passion, and belief in art.</span></li>
            </ul>
          </motion.article>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-serif font-semibold mb-6">Why Choose Gijayi</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Heirloom Quality', sub: 'Built to last' },
              { title: 'Ethical Materials', sub: 'Transparency & care' },
              { title: 'Artisanal Skills', sub: 'Generational craft' },
              { title: 'Thoughtful Packaging', sub: 'Minimal & premium' },
            ].map((f) => (
              <motion.div whileHover={{ y: -6 }} key={f.title} className="p-6 bg-neutral-50 rounded-xl border border-transparent hover:border-amber-100 transition-all">
                <h4 className="font-medium text-lg mb-1">{f.title}</h4>
                <p className="text-gray-600 text-sm">{f.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER / TEAM */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.img initial={{ scale: 0.98 }} whileInView={{ scale: 1 }} viewport={{ once: true }} src="/founder.png" alt="Founder" className="w-full h-96 object-cover rounded-xl shadow-lg" />
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={founderStagger} className="">
            <motion.div variants={fadeUp} className="bg-white p-8 md:p-10 rounded-xl shadow-xl border border-amber-50">
              <div className="flex items-start gap-4">
                <div className="h-12 w-1 bg-amber-500 rounded" />
                <motion.h4 variants={founderItem} className="text-2xl md:text-3xl font-serif font-semibold text-slate-900">A word about the Founder - Urooj Khan</motion.h4>
              </div>

              <div className="mt-6 space-y-4 text-gray-700 text-lg leading-relaxed">
                <motion.p variants={founderItem}><strong className="font-semibold">Gijayi</strong> happened from a thought of bridging age old heritage with classical elegance.</motion.p>

                <motion.p variants={founderItem}>​At the heart of <strong className="font-semibold">Gijayi</strong> is <strong className="font-semibold">Urooj Khan</strong>, a resonating woman in her vibrant thirties, a devoted wife, and a proud mother.</motion.p>

                <motion.p variants={founderItem}> Urooj’s journey to founding Gijayi extracted from the deep rooted artistry prevalent in the historic city of Rampur, UP, her birth place.</motion.p>

                <motion.p variants={founderItem}>​Her love for travel across the breathtaking landscapes of Northern India tickled her creative mind to cross the boundries of imaginations</motion.p>

                <motion.div variants={founderItem} className="mt-4">
                  <a href="/about" className="inline-block text-amber-600 font-semibold hover:underline">Learn more about Gijayi</a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h3 className="text-2xl font-serif font-semibold mb-6">Customer Love</h3>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[
              { name: 'Emily Carter', text: '“Absolutely delighted — the piece arrived like a small treasure. Quality and finish were superb.”' },
              { name: 'Priya Sharma', text: '“Absolutely delighted — the piece arrived like a small treasure. Quality and finish were superb.”' },
              { name: 'Rohit Verma', text: '“Absolutely delighted — the piece arrived like a small treasure. Quality and finish were superb.”' },
            ].map((t, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm w-full md:w-72">
                <p className="text-gray-700">{t.text}</p>
                <div className="mt-4 font-medium">— {t.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16 text-center">
        <motion.h4 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-3xl font-serif font-semibold mb-4">Discover the Collection</motion.h4>
        <p className="text-gray-700 mb-6">Find pieces made to become part of your story.</p>
        <motion.a whileHover={{ scale: 1.03 }} href="/shop" className="inline-block bg-amber-600 text-white px-8 py-3 rounded-full shadow">Shop the Collection</motion.a>
      </section>
    </main>
  );
}

function StoryText() {
  const [expanded, setExpanded] = React.useState(false);

  const content = `Born in 2025 in the historic city of Rampur, Uttar Pradesh, Gijayi is a tribute to a legacy written in gold and time. Once known as "Katehr," this land evolved into a celebrated princely state in 1774, forged by the Rohilla dynasty. As the first princely state to accede to independent India in 1949, Rampur holds a unique place in history—a storied seat of Nawabs whose patronage of art, literature, and architecture defined the cultural soul of the Ganga-Yamuna belt.

Our jewelry draws from this royal grandeur, channeling the refinement of the Rampur court. Just as the Nawabs—great scholars and patrons—cultivated the famed Rampur Raza Library, we curate our collections with the same meticulous attention to detail. We blend the intricate techniques of traditional Indian craftsmanship with the timeless elegance of the Nawabi era, creating heirlooms that carry the weight and grace of history.

Beyond the palaces, Rampur’s spirit lives in its people—the humble, warm-hearted artisans whose hands breathe life into our designs. They speak the language of art and poetic grace, where every motif is a whisper of Urdu’s melodic cadence. It is a city of lovely weather, where the changing seasons mirror the enduring beauty of our handcrafted pieces, from vibrant, intricate Zardozi to delicate, modern Aari work.

At Gijayi, art is not merely an object; it is a legacy. We honor the heritage of our ancestors—from the Rohilla warriors who laid these foundations to the visionary rulers who built a kingdom of culture—by bridging the past and the present. Est. 2025, we invite you to wear a piece of this royal story, crafted with the soul of Rampur`;

  const clampStyle: React.CSSProperties = !expanded ? {
    display: '-webkit-box',
    WebkitLineClamp: 7 as unknown as number,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  } : {};

  return (
    <div className="text-lg text-gray-700 leading-relaxed">
      <p style={clampStyle} className="text-justify whitespace-pre-line">{content}</p>
      <button onClick={() => setExpanded(!expanded)} className="mt-4 text-amber-600 font-semibold hover:underline">
        {expanded ? 'View less' : 'View more'}
      </button>
    </div>
  );
}
