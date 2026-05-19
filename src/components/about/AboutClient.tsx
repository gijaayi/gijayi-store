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
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const subtle = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

export default function AboutClient() {
  return (
    <main className="text-slate-900 antialiased">
      {/* HERO */}
      <motion.header initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
        <motion.div variants={subtle} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.30), rgba(0,0,0,0.10))' }} />
        <div className="relative h-[70vh] md:h-[80vh] lg:h-[88vh] bg-cover bg-center" style={{ backgroundImage: "url('/images/about-hero.jpg')" }}>
          <div className="max-w-6xl mx-auto px-6 md:px-12 h-full flex items-center">
            <motion.div variants={fadeUp} className="bg-white/70 backdrop-blur-sm rounded-xl p-8 md:p-12 max-w-2xl">
              <p className="text-sm tracking-widest text-amber-600 font-medium">Est. 2010 — Handcrafted</p>
              <h1 className="mt-4 text-3xl md:text-5xl font-serif font-semibold leading-tight">
                Heirloom Jewellery, Made With Care
              </h1>
              <p className="mt-4 text-gray-700">We craft pieces that carry stories — made by artisans, designed to last generations.</p>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* BRAND STORY */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl font-serif font-semibold mb-4">Our Story</h2>
            <p className="text-lg text-gray-700 leading-relaxed">Born from a reverence for craft, Gijayi partners with artisan families to revive traditional techniques. Each collection is a bridge between heritage and contemporary design — quietly luxurious and thoughtfully made.</p>
            <p className="mt-4 text-gray-700">We balance purity of materials with restrained forms, creating jewellery that becomes part of life’s milestones.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="rounded-lg overflow-hidden shadow-lg relative">
            <div className="relative h-80 w-full">
              {/* Use the user-provided Our Story image from public/ */}
              <ImgWithFallback srcLocal="/Our%20Story.png" alt="Our Story" />
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
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <h3 className="text-3xl font-serif font-semibold mb-4">Founder — Aisha</h3>
            <blockquote className="text-gray-700 italic">“We make jewellery that holds memory and meaning — small acts of craft that feel like home.”</blockquote>
            <p className="mt-4 text-gray-700">Aisha founded Gijayi to celebrate craft and support artisan communities. Her vision blends subtle luxury with meaningful design.</p>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h3 className="text-2xl font-serif font-semibold mb-6">Customer Love</h3>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm" style={{ minWidth: 280 }}>
                <p className="text-gray-700">“Absolutely delighted — the piece arrived like a small treasure. Quality and finish were superb.”</p>
                <div className="mt-4 font-medium">— Customer</div>
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
