import { NextRequest, NextResponse } from 'next/server';


export async function GET(body: NextRequest) {
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
console.log("body",body);
    // Make the request to Shopify's GraphQL API
    if (!body.nextUrl.searchParams.get('shopifyUrl') || !body.nextUrl.searchParams.get('shopifyAdminToken')) {
      // throw new Error('SHOPIFY_ADMIN_API_URL is not defined');
      return NextResponse.json({ error: 'SHOPIFY_ADMIN_API_URL is not defined' }, { status: 400 });
    }
    const response = await fetch(`${body.nextUrl.searchParams.get('shopifyUrl')}/admin/api/2025-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': body.nextUrl.searchParams.get('shopifyAdminToken'),
      },
      body: JSON.stringify({ query: query }),
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

