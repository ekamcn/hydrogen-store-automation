import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_ADMIN_API_URL = process.env.SHOPIFY_ADMIN_API_URL || '';
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const { collectionInput } = await request.json();

    if (!collectionInput || !collectionInput.title) {
      console.warn('⚠️ [Step 1.1] Missing required collection input data');
      return NextResponse.json({ error: 'Missing required collection input data' }, { status: 400 });
    }
    // Replace spaces with hyphens in metafield values
    if (collectionInput?.metafields && collectionInput.metafields.length > 0) {
      collectionInput.metafields.forEach(metafield => {
        if (metafield.value && typeof metafield.value === 'string') {
          metafield.value = metafield.value.replace(/\s+/g, '-');
        }
      });
      console.log('📋 [Step 1.2] Updated metafields with hyphens:', collectionInput.metafields);
    }
    let imageSrc = collectionInput.image_src;

    if (imageSrc) {
      console.log('🖼️ [Step 2] Image source found:', imageSrc);

      // Step 2.1: Get staged upload URL
      console.log('📡 [Step 2.1] Requesting staged upload URL from Shopify');
      const stagedUploadResponse = await fetch(SHOPIFY_ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: `
            mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
              stagedUploadsCreate(input: $input) {
                stagedTargets {
                  url
                  resourceUrl
                  parameters {
                    name
                    value
                  }
                }
              }
            }
          `,
          variables: {
            input: [
              {
                resource: "IMAGE",
                filename: "collection-image.jpg",
                mimeType: "image/jpeg",
                httpMethod: "POST"
              }
            ]
          }
        })
      });

      const stagedData = await stagedUploadResponse.json();
      console.log('✅ [Step 2.1] Received staged upload response:', stagedData);

      const stagedTarget = stagedData.data.stagedUploadsCreate.stagedTargets[0];
      const { url, resourceUrl, parameters } = stagedTarget;
      console.log('🧭 [Step 2.2] Extracted upload URL and parameters:', { url, resourceUrl });

      // Step 2.2: Prepare form data
      const formData = new FormData();
      parameters.forEach((param: any) => {
        formData.append(param.name, param.value);
      });

      console.log('🌐 [Step 2.3] Fetching image blob from:', imageSrc);
      const imageBlobResponse = await fetch(imageSrc);
      const imageBlob = await imageBlobResponse.blob();
      formData.append('file', imageBlob, 'collection-image.jpg');
      console.log('📦 [Step 2.3] Image blob appended to formData');

      // Step 2.4: Upload to Shopify staged upload URL
      console.log('🚀 [Step 2.4] Uploading image to staged URL');
      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        console.error('❌ [Step 2.4] Failed to upload image to Shopify');
        throw new Error('Failed to upload image to staged upload URL');
      }

      console.log('✅ [Step 2.4] Image uploaded successfully to staged upload URL');

      // Step 2.5: Set image data in collectionInput
      collectionInput.image = {
        src: resourceUrl,
        altText: collectionInput.title
      };
      delete collectionInput.image_src;

      console.log('📝 [Step 2.5] Updated collectionInput with image:', collectionInput.image);
    }

    // Step 3: Create collection
    console.log('🛠️ [Step 3] Sending collection creation mutation to Shopify');
    const mutation = `
      mutation CollectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
            id
            title
            handle
            descriptionHtml
            sortOrder
            image {
              id
              src
              altText
            }
            ruleSet {
              appliedDisjunctively
              rules {
                column
                relation
                condition
              }
            }
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
          input: collectionInput
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create collection: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📬 [Step 3] Received response from Shopify:', JSON.stringify(data));

    if (data.data?.collectionCreate?.userErrors?.length > 0) {
      console.warn('⚠️ [Step 3] Shopify userErrors:', data.data.collectionCreate.userErrors);
      return NextResponse.json({ error: 'Shopify API Error', details: data.data.collectionCreate.userErrors }, { status: 400 });
    }

    if (data.errors && data.errors.length > 0) {
      console.error('❌ [Step 3] GraphQL errors:', data.errors);
      return NextResponse.json({ error: 'GraphQL API Error', details: data.errors }, { status: 400 });
    }

    console.log('✅ [Step 4] Collection created successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('🔥 [ERROR] Failed to create collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection', message: (error as Error).message },
      { status: 500 }
    );
  }
}
