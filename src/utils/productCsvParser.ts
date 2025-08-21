export interface ParsedProduct {
  title: string;
  description?: string;
  price?: string;
  compareAtPrice?: string;
  sku?: string;
  barcode?: string;
  weight?: string;
  weightUnit?: string;
  vendor?: string;
  productType?: string;
  tags?: string;
  status?: string;
  images?: string;
  variants?: string;
  collections?: string;
}

export interface ParsedCollection {
  title: string;
  description?: string;
  handle?: string;
  products?: string;
}

export interface ParsedData {
  products: ParsedProduct[];
  collections: ParsedCollection[];
}

export function parseProductCsv(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const lines = csvText.split('\n');
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header row and one data row'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const products: ParsedProduct[] = [];
        const collections: ParsedCollection[] = [];

        // Check if this is a product CSV or collection CSV
        const isProductCsv = headers.includes('title') && (headers.includes('price') || headers.includes('sku'));
        const isCollectionCsv = headers.includes('title') && headers.includes('description');

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(v => v.trim());
          const row: Record<string, string> = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          if (isProductCsv) {
            const product: ParsedProduct = {
              title: row.title || '',
              description: row.description || '',
              price: row.price || '',
              compareAtPrice: row['compare at price'] || row.compareatprice || '',
              sku: row.sku || '',
              barcode: row.barcode || '',
              weight: row.weight || '',
              weightUnit: row['weight unit'] || row.weightunit || '',
              vendor: row.vendor || '',
              productType: row['product type'] || row.producttype || '',
              tags: row.tags || '',
              status: row.status || 'active',
              images: row.images || '',
              variants: row.variants || '',
              collections: row.collections || ''
            };
            products.push(product);
          } else if (isCollectionCsv) {
            const collection: ParsedCollection = {
              title: row.title || '',
              description: row.description || '',
              handle: row.handle || '',
              products: row.products || ''
            };
            collections.push(collection);
          }
        }

        resolve({ products, collections });
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

export function generateProductCsvTemplate(): string {
  const headers = [
    'Title',
    'Description',
    'Price',
    'Compare at Price',
    'SKU',
    'Barcode',
    'Weight',
    'Weight Unit',
    'Vendor',
    'Product Type',
    'Tags',
    'Status',
    'Images',
    'Variants',
    'Collections'
  ];

  const sampleData = [
    'Sample Product',
    'This is a sample product description',
    '29.99',
    '39.99',
    'SAMPLE-SKU-001',
    '1234567890123',
    '0.5',
    'kg',
    'Sample Vendor',
    'Sample Type',
    'sample, test, product',
    'active',
    'https://example.com/image1.jpg,https://example.com/image2.jpg',
    'Small,Medium,Large',
    'Sample Collection'
  ];

  return [headers.join(','), sampleData.join(',')].join('\n');
}

export function generateCollectionCsvTemplate(): string {
  const headers = [
    'Title',
    'Description',
    'Handle',
    'Products'
  ];

  const sampleData = [
    'Sample Collection',
    'This is a sample collection description',
    'sample-collection',
    'product1,product2,product3'
  ];

  return [headers.join(','), sampleData.join(',')].join('\n');
}
