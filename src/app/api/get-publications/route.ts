import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_ADMIN_API_URL = process.env.SHOPIFY_ADMIN_API_URL  ;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ;

export async function GET() {
  try {
    // GraphQL query to fetch publications
    const query = `
      query GetPublications {
        publications(first: 20) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `;

    // Make the request to Shopify's GraphQL API
    if (!SHOPIFY_ADMIN_API_URL) {
      throw new Error('SHOPIFY_ADMIN_API_URL is not defined');
    }
    const response = await fetch(SHOPIFY_ADMIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN ?? '',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch publications: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching publications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publications', details: (error as Error).message },
      { status: 500 }
    );
  }
}
