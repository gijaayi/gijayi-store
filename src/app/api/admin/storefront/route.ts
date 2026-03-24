import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  const db = await readDatabase();
  return NextResponse.json({ storefront: db.storefront });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const body = (await request.json()) as {
      navigation?: {
        shop?: {
          label?: string;
          subcategories?: string[];
        };
        gijayiEdit?: {
          label?: string;
          subcategories?: string[];
        };
        freshArrival?: {
          label?: string;
        };
      };
      hero?: {
        badge?: string;
        title?: string;
        subtitle?: string;
        primaryCtaLabel?: string;
        primaryCtaHref?: string;
        secondaryCtaLabel?: string;
        secondaryCtaHref?: string;
        heroImage?: string;
        featureLabel?: string;
        featureTitle?: string;
        featureSubtitle?: string;
        secondaryMedia?: {
          enabled?: boolean;
          image?: string;
          label?: string;
          title?: string;
          href?: string;
        };
      };
      luxurySignals?: string[];
      trustSection?: {
        badge?: string;
        title?: string;
        subtitle?: string;
      };
      trustSignals?: Array<{ title?: string; desc?: string }>;
      testimonialsSection?: {
        badge?: string;
        title?: string;
        subtitle?: string;
        testimonials?: Array<{ name?: string; location?: string; text?: string; rating?: number }>;
      };
      productCard?: {
        quickAddLabel?: string;
        quickViewLabel?: string;
        newBadgeLabel?: string;
        bestsellerBadgeLabel?: string;
        saleBadgeSuffix?: string;
        ratingValue?: string;
        ratingCountLabel?: string;
      };
    };

    await updateDatabase((db) => {
      const current = db.storefront;

      db.storefront = {
        ...current,
        navigation: {
          shop: {
            label: String(body.navigation?.shop?.label ?? current.navigation.shop.label).trim() || 'Shop',
            subcategories: (
              Array.isArray(body.navigation?.shop?.subcategories)
                ? body.navigation?.shop?.subcategories
                : current.navigation.shop.subcategories
            )
              .map((item) => String(item || '').trim())
              .filter(Boolean)
              .slice(0, 20),
          },
          gijayiEdit: {
            label: String(body.navigation?.gijayiEdit?.label ?? current.navigation.gijayiEdit.label).trim() || 'Gijayi Edit',
            subcategories: (
              Array.isArray(body.navigation?.gijayiEdit?.subcategories)
                ? body.navigation?.gijayiEdit?.subcategories
                : current.navigation.gijayiEdit.subcategories
            )
              .map((item) => String(item || '').trim())
              .filter(Boolean)
              .slice(0, 20),
          },
          freshArrival: {
            label: String(body.navigation?.freshArrival?.label ?? current.navigation.freshArrival.label).trim() || 'Fresh Arrival',
          },
        },
        hero: {
          badge: String(body.hero?.badge ?? current.hero.badge).trim(),
          title: String(body.hero?.title ?? current.hero.title),
          subtitle: String(body.hero?.subtitle ?? current.hero.subtitle),
          primaryCtaLabel: String(body.hero?.primaryCtaLabel ?? current.hero.primaryCtaLabel).trim(),
          primaryCtaHref: String(body.hero?.primaryCtaHref ?? current.hero.primaryCtaHref).trim() || '/shop',
          secondaryCtaLabel: String(body.hero?.secondaryCtaLabel ?? current.hero.secondaryCtaLabel).trim(),
          secondaryCtaHref: String(body.hero?.secondaryCtaHref ?? current.hero.secondaryCtaHref).trim() || '/collections',
          heroImage: String(body.hero?.heroImage ?? current.hero.heroImage).trim(),
          featureLabel: String(body.hero?.featureLabel ?? current.hero.featureLabel).trim(),
          featureTitle: String(body.hero?.featureTitle ?? current.hero.featureTitle).trim(),
          featureSubtitle: String(body.hero?.featureSubtitle ?? current.hero.featureSubtitle).trim(),
          secondaryMedia: {
            enabled: Boolean(body.hero?.secondaryMedia?.enabled ?? current.hero.secondaryMedia.enabled),
            image: String(body.hero?.secondaryMedia?.image ?? current.hero.secondaryMedia.image).trim(),
            label: String(body.hero?.secondaryMedia?.label ?? current.hero.secondaryMedia.label).trim(),
            title: String(body.hero?.secondaryMedia?.title ?? current.hero.secondaryMedia.title).trim(),
            href: String(body.hero?.secondaryMedia?.href ?? current.hero.secondaryMedia.href).trim() || '/about',
          },
        },
        luxurySignals: (Array.isArray(body.luxurySignals) ? body.luxurySignals : current.luxurySignals)
          .map((item) => String(item || '').trim())
          .filter(Boolean)
          .slice(0, 3),
        trustSection: {
          badge: String(body.trustSection?.badge ?? current.trustSection.badge).trim(),
          title: String(body.trustSection?.title ?? current.trustSection.title).trim(),
          subtitle: String(body.trustSection?.subtitle ?? current.trustSection.subtitle).trim(),
        },
        trustSignals: (Array.isArray(body.trustSignals) ? body.trustSignals : current.trustSignals)
          .map((item) => ({ title: String(item?.title || '').trim(), desc: String(item?.desc || '').trim() }))
          .filter((item) => item.title && item.desc)
          .slice(0, 4),
        testimonialsSection: {
          badge: String(body.testimonialsSection?.badge ?? current.testimonialsSection.badge).trim(),
          title: String(body.testimonialsSection?.title ?? current.testimonialsSection.title).trim(),
          subtitle: String(body.testimonialsSection?.subtitle ?? current.testimonialsSection.subtitle).trim(),
          testimonials: (
            Array.isArray(body.testimonialsSection?.testimonials)
              ? body.testimonialsSection?.testimonials
              : current.testimonialsSection.testimonials
          )
            .map((item) => ({
              name: String(item?.name || '').trim(),
              location: String(item?.location || '').trim(),
              text: String(item?.text || '').trim(),
              rating: Math.min(5, Math.max(1, Number(item?.rating || 5))),
            }))
            .filter((item) => item.name && item.location && item.text)
            .slice(0, 6),
        },
        productCard: {
          quickAddLabel: String(body.productCard?.quickAddLabel ?? current.productCard.quickAddLabel).trim(),
          quickViewLabel: String(body.productCard?.quickViewLabel ?? current.productCard.quickViewLabel).trim(),
          newBadgeLabel: String(body.productCard?.newBadgeLabel ?? current.productCard.newBadgeLabel).trim(),
          bestsellerBadgeLabel: String(body.productCard?.bestsellerBadgeLabel ?? current.productCard.bestsellerBadgeLabel).trim(),
          saleBadgeSuffix: String(body.productCard?.saleBadgeSuffix ?? current.productCard.saleBadgeSuffix).trim() || 'Off',
          ratingValue: String(body.productCard?.ratingValue ?? current.productCard.ratingValue).trim(),
          ratingCountLabel: String(body.productCard?.ratingCountLabel ?? current.productCard.ratingCountLabel).trim(),
        },
        updatedAt: new Date().toISOString(),
      };
    });

    const updated = await readDatabase();
    return NextResponse.json({ storefront: updated.storefront });
  } catch {
    return NextResponse.json({ error: 'Unable to update storefront settings.' }, { status: 500 });
  }
}
