import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase } from '@/lib/server/database';
import { getMongoDb } from '@/lib/server/mongodb';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface ExtendedProductDoc extends Partial<Product> {
  _id?: unknown;
  sku?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  status?: string;
  care?: string;
}

export async function GET(request: NextRequest) {
  // 1. Authorize: Admin only
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.error === 'Forbidden' ? 403 : 401 }
    );
  }

  try {
    // 2. Fetch full product dataset securely from MongoDB
    let rawDocs: ExtendedProductDoc[] = [];

    try {
      const mongo = await getMongoDb();
      rawDocs = (await mongo.collection('products').find({}).toArray()) as ExtendedProductDoc[];
    } catch (mongoErr) {
      console.warn('Direct mongo connection query fallback:', mongoErr);
    }

    // Fallback to readDatabase state if direct collection query was empty/failed
    if (!rawDocs || rawDocs.length === 0) {
      const dbSnapshot = await readDatabase();
      rawDocs = (dbSnapshot.products || []) as ExtendedProductDoc[];
    }

    // 3. Build Excel Workbook with ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Gijayi Admin';
    workbook.lastModifiedBy = 'Gijayi Admin';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet('Products Catalog', {
      views: [{ state: 'frozen', ySplit: 1 }],
      properties: { defaultRowHeight: 24 },
    });

    // Define Columns
    worksheet.columns = [
      { header: 'Product ID', key: 'id', width: 38 },
      { header: 'SKU', key: 'sku', width: 16 },
      { header: 'Product Name', key: 'name', width: 34 },
      { header: 'Slug / URL', key: 'slug', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Subcategory / Collection', key: 'collection', width: 26 },
      { header: 'Price (₹)', key: 'price', width: 15, style: { numFmt: '₹#,##0.00' } },
      { header: 'Compare At Price (₹)', key: 'compareAtPrice', width: 20, style: { numFmt: '₹#,##0.00' } },
      { header: 'Stock Qty', key: 'stock', width: 14, style: { numFmt: '#,##0' } },
      { header: 'Inventory Status', key: 'inventoryStatus', width: 18 },
      { header: 'Fresh Arrival', key: 'isNew', width: 15 },
      { header: 'Bestseller', key: 'isBestseller', width: 14 },
      { header: 'Most Wanted', key: 'mostWanted', width: 14 },
      { header: 'Bridal Luxe', key: 'bridalLuxe', width: 14 },
      { header: 'Heritage', key: 'heritage', width: 12 },
      { header: 'Everyday Minimal', key: 'everydayMinimal', width: 18 },
      { header: 'Average Rating', key: 'ratingAverage', width: 15, style: { numFmt: '0.0' } },
      { header: 'Review Count', key: 'ratingCount', width: 14, style: { numFmt: '#,##0' } },
      { header: 'Primary Image URL', key: 'primaryImage', width: 48 },
      { header: 'All Image URLs', key: 'allImages', width: 55 },
      { header: 'Image Count', key: 'imageCount', width: 13, style: { numFmt: '#,##0' } },
      { header: 'Product Description', key: 'description', width: 45 },
      { header: 'Details / Specifications', key: 'details', width: 40 },
      { header: 'Available Sizes', key: 'sizes', width: 20 },
      { header: 'Name Font', key: 'nameFont', width: 14 },
      { header: 'Description Font', key: 'descriptionFont', width: 18 },
      { header: 'Details Font', key: 'detailsFont', width: 16 },
      { header: 'SEO Title', key: 'seoTitle', width: 32 },
      { header: 'Meta Description', key: 'metaDescription', width: 45 },
      { header: 'Meta Keywords', key: 'metaKeywords', width: 32 },
      { header: 'Created At', key: 'createdAt', width: 24 },
      { header: 'Updated At', key: 'updatedAt', width: 24 },
    ];

    // Style the Header Row (Row 1)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 32;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }, // Dark slate
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: false,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });

    // Populate Product Rows
    rawDocs.forEach((doc, idx) => {
      const stockVal = Number(doc.stock ?? 0);
      let invStatus = 'In Stock';
      if (stockVal <= 0) {
        invStatus = 'Out of Stock';
      } else if (stockVal <= 5) {
        invStatus = 'Low Stock';
      }

      const images = Array.isArray(doc.images) ? doc.images.map(String).filter(Boolean) : [];
      const primaryImage = images[0] || '';
      const allImagesStr = images.join('\n');

      let detailsStr = '';
      if (Array.isArray(doc.details)) {
        detailsStr = doc.details.map((d) => `• ${d}`).join('\n');
      } else if (doc.details) {
        detailsStr = String(doc.details);
      }

      let sizesStr = '';
      if (Array.isArray(doc.sizes)) {
        sizesStr = doc.sizes.join(', ');
      } else if (doc.sizes) {
        sizesStr = String(doc.sizes);
      }

      // Handle MongoDB ObjectID timestamps or explicit date strings
      let createdDate = '';
      if (doc.createdAt) {
        try {
          createdDate = new Date(doc.createdAt).toISOString();
        } catch {
          createdDate = String(doc.createdAt);
        }
      } else if (doc._id && typeof doc._id === 'object' && 'getTimestamp' in (doc._id as Record<string, unknown>)) {
        try {
          const ts = (doc._id as { getTimestamp: () => Date }).getTimestamp();
          createdDate = ts.toISOString();
        } catch {
          // ignore
        }
      }

      let updatedDate = '';
      if (doc.updatedAt) {
        try {
          updatedDate = new Date(doc.updatedAt).toISOString();
        } catch {
          updatedDate = String(doc.updatedAt);
        }
      }

      const row = worksheet.addRow({
        id: String(doc.id || doc._id || ''),
        sku: doc.sku || '',
        name: doc.name || 'Unnamed Product',
        slug: doc.slug || '',
        category: doc.category || '',
        collection: doc.collection || '',
        price: doc.price !== undefined ? Number(doc.price) : 0,
        compareAtPrice: doc.compareAtPrice ? Number(doc.compareAtPrice) : null,
        stock: stockVal,
        inventoryStatus: invStatus,
        isNew: doc.isNew ? 'Yes' : 'No',
        isBestseller: doc.isBestseller ? 'Yes' : 'No',
        mostWanted: doc.mostWanted ? 'Yes' : 'No',
        bridalLuxe: doc.bridalLuxe ? 'Yes' : 'No',
        heritage: doc.heritage ? 'Yes' : 'No',
        everydayMinimal: doc.everydayMinimal ? 'Yes' : 'No',
        ratingAverage: doc.ratingAverage !== undefined && doc.ratingAverage !== null ? Number(doc.ratingAverage) : null,
        ratingCount: doc.ratingCount !== undefined && doc.ratingCount !== null ? Number(doc.ratingCount) : null,
        primaryImage,
        allImages: allImagesStr,
        imageCount: images.length,
        description: doc.description || '',
        details: detailsStr,
        sizes: sizesStr,
        nameFont: doc.nameFont || 'serif',
        descriptionFont: doc.descriptionFont || 'sans-serif',
        detailsFont: doc.detailsFont || 'sans-serif',
        seoTitle: doc.seoTitle || '',
        metaDescription: doc.metaDescription || '',
        metaKeywords: doc.metaKeywords || '',
        createdAt: createdDate,
        updatedAt: updatedDate,
      });

      // Zebra striping for enhanced readability
      const isEven = idx % 2 === 1;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = {
          vertical: 'middle',
          horizontal: [7, 8, 9, 17, 18, 21].includes(colNumber)
            ? 'right'
            : [11, 12, 13, 14, 15, 16, 25, 26, 27].includes(colNumber)
            ? 'center'
            : 'left',
          wrapText: [20, 22, 23].includes(colNumber), // Wrap text for images, descriptions, details
        };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }, // Light slate tint
          };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });

    // Auto-filter covering all columns
    const totalCols = worksheet.columns.length;
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: totalCols },
    };

    // 4. Generate binary buffer and send download response
    const buffer = await workbook.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `gijayi-products-export-${dateStr}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to export products to Excel:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while exporting products. Please try again.' },
      { status: 500 }
    );
  }
}
