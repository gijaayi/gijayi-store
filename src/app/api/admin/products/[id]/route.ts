import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import { withImageVersionList } from '@/lib/imageVersion';
import { parseProductSeoFields } from '@/lib/productSeo';

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    if (body.category !== undefined) {
      const category = String(body.category || '').trim();
      if (!category) {
        return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
      }

      const dbSnapshot = await readDatabase();
      const categoryExists = dbSnapshot.categories.some((item) => item.name === category);
      if (!categoryExists) {
        return NextResponse.json({ error: 'Please select a valid category from admin categories.' }, { status: 400 });
      }
    }

    if (body.collection !== undefined) {
      const collection = String(body.collection || '').trim();
      // Collection is now optional - only validate if provided
      if (collection) {
        const dbSnapshot = await readDatabase();
        const collectionExists = dbSnapshot.storefront.navigation.gijayiEdit.subcategories.some(
          (item) => item.toLowerCase() === collection.toLowerCase()
        );
        if (!collectionExists) {
          return NextResponse.json(
            { error: 'Please select a valid Gijayi Edit subcategory for collection.' },
            { status: 400 }
          );
        }
      }
    }

    const versionToken = Date.now();
    const seoFields = parseProductSeoFields(body as Record<string, unknown>);
    const hasSeoUpdate =
      body.seoTitle !== undefined ||
      body.metaDescription !== undefined ||
      body.metaKeywords !== undefined;

    const db = await updateDatabase((state) => {
      const index = state.products.findIndex((product) => product.id === id);
      if (index === -1) {
        throw new Error('NOT_FOUND');
      }

      const current = state.products[index];
      const updated = {
        ...current,
        name: body.name ?? current.name,
        price: body.price !== undefined ? Number(body.price) : current.price,
        compareAtPrice: body.compareAtPrice !== undefined
          ? (body.compareAtPrice === null || body.compareAtPrice === '' || Number(body.compareAtPrice) === 0 ? undefined : Number(body.compareAtPrice))
          : current.compareAtPrice,
        ratingAverage:
          body.ratingAverage !== undefined && body.ratingAverage !== '' ? Number(body.ratingAverage) : current.ratingAverage,
        ratingCount:
          body.ratingCount !== undefined && body.ratingCount !== '' ? Number(body.ratingCount) : current.ratingCount,
        images: Array.isArray(body.images)
          ? withImageVersionList(body.images.map((item: unknown) => String(item).trim()).filter(Boolean), versionToken)
          : current.images,
        category: body.category ?? current.category,
        collection: body.collection ?? current.collection,
        description: body.description ?? current.description,
        details: Array.isArray(body.details) ? body.details : current.details,
        sizes: Array.isArray(body.sizes) ? body.sizes : current.sizes,
        isNew: body.isNew !== undefined ? Boolean(body.isNew) : current.isNew,
        isBestseller: body.isBestseller !== undefined ? Boolean(body.isBestseller) : current.isBestseller,
        stock: body.stock !== undefined ? Number(body.stock) : current.stock,
        mostWanted: body.mostWanted !== undefined ? Boolean(body.mostWanted) : current.mostWanted,
        bridalLuxe: body.bridalLuxe !== undefined ? Boolean(body.bridalLuxe) : current.bridalLuxe,
        heritage: body.heritage !== undefined ? Boolean(body.heritage) : current.heritage,
        everydayMinimal: body.everydayMinimal !== undefined ? Boolean(body.everydayMinimal) : current.everydayMinimal,
        nameFont: body.nameFont ?? current.nameFont ?? 'serif',
        descriptionFont: body.descriptionFont ?? current.descriptionFont ?? 'sans-serif',
        detailsFont: body.detailsFont ?? current.detailsFont ?? 'sans-serif',
      };

      if (hasSeoUpdate) {
        if (seoFields.seoTitle) updated.seoTitle = seoFields.seoTitle;
        else delete updated.seoTitle;

        if (seoFields.metaDescription) updated.metaDescription = seoFields.metaDescription;
        else delete updated.metaDescription;

        if (seoFields.metaKeywords) updated.metaKeywords = seoFields.metaKeywords;
        else delete updated.metaKeywords;
      }

      state.products[index] = updated;
    });

    return NextResponse.json({ products: db.products });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Unable to update product.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { id } = await context.params;

    const db = await updateDatabase((state) => {
      const index = state.products.findIndex((product) => product.id === id);
      if (index === -1) {
        throw new Error('NOT_FOUND');
      }
      state.products.splice(index, 1);
    });

    return NextResponse.json({ products: db.products, message: 'Product deleted successfully.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 });
  }
}
