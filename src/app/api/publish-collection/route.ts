import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_ADMIN_API_URL = process.env.SHOPIFY_ADMIN_API_URL ;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ;

export async function POST(request: NextRequest) {
  try {
    const { collectionId, publicationId } = await request.json();

    if (!collectionId || !publicationId) {
      return NextResponse.json(
        { error: 'Missing required parameters: collectionId or publicationId' },
        { status: 400 }
      );
    }

    // GraphQL mutation to publish a collection
    const mutation = `
      mutation PublishCollection($id: ID!, $publicationId: ID!) {
        publishablePublish(
          id: $id,
          input: { publicationId: $publicationId }
        ) {
          publishable {
            publishedOnPublication(publicationId: $publicationId)
          }
          userErrors {
            field
            message
          } 
        }
      }
    `;

    // Make the request to Shopify's GraphQL API
    const response = await fetch(SHOPIFY_ADMIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          id: collectionId,
          publicationId: publicationId // Used for both the input and publishedOnPublication parameter
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish collection: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for user errors in the GraphQL response
    if (data.data?.publishablePublish?.userErrors?.length > 0) {
      const errors = data.data.publishablePublish.userErrors;
      return NextResponse.json(
        { error: 'Shopify API Error', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error publishing collection:', error);
    return NextResponse.json(
      { error: 'Failed to publish collection', message: (error as Error).message },
      { status: 500 }
    );
  }
}
