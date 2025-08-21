import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_ADMIN_API_URL = process.env.SHOPIFY_ADMIN_API_URL || '';
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const { parsedCsvData, publications } = await request.json()

    async function uploadProducts(parsedCsvData: any[], publications: {
      publicationId: any; publicationName: string; 
}[]) {
      let groupedMedia: { handle: any; media: any[]; }[] = [];
      let currentHandle: string | null = null;
      let currentMediaGroup: { originalSource: any; alt: any; contentType: string; }[] = [];

      // 🧩 Group media by Handle
      parsedCsvData.forEach((row: { [x: string]: string; }, index: number) => {
        const handle = row["Handle"];
        const url = row["Image Src"];
        const altText = row["Image Alt Text"] || "Media for " + handle;

        if (!url) return;

        if (currentHandle !== handle) {
          if (currentMediaGroup.length) {
            groupedMedia.push({
              handle: currentHandle,
              media: currentMediaGroup,
            });
          }
          currentHandle = handle;
          currentMediaGroup = [];
        }

        currentMediaGroup.push({
          originalSource: url,
          alt: altText,
          contentType: "IMAGE",
        });

        if (index === parsedCsvData.length - 1 && currentMediaGroup.length) {
          groupedMedia.push({
            handle: currentHandle,
            media: currentMediaGroup,
          });
        }
      });

      // ✅ Set to track handles already processed
      const processedHandles = new Set();

      for (const product of parsedCsvData) {
        try {
          const handle = product.Handle;

          // ⚠️ If already processed, skip
          if (processedHandles.has(handle)) {
            console.log(
              `🔁 Skipping product creation for duplicate handle: ${handle}`
            );
            continue;
          }

          // ✅ Mark as processed
          processedHandles.add(handle);

          const matchedMediaGroup = groupedMedia.find(
            (group) => group.handle === handle
          );
          const location = await fetch(SHOPIFY_ADMIN_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
            },
            body: JSON.stringify({
              query: `
                query {
    locations(first: 5) {
      edges {
        node {
          id
          name
          address {
            formatted
          }
        }
      }
    }
  }
              `,
            }),
          });

          const locationResponse = await location.json();
          const locationId =
            locationResponse?.data?.locations?.edges?.[0]?.node?.id;

          const inputPayload = {
            synchronous: true,
            productSet: {
              title: product?.Title,
              descriptionHtml: product["Body (HTML)"] || "",
              vendor: product.Vendor || "Default Vendor",
              productType: product["Type"] || "General",
              status: product["Status"]?.toUpperCase() || "ACTIVE", // fallback
              seo: {
                title: product["SEO Title"] || "",
                description: product["SEO Description"] || "",
              },
              tags: product["Tags"] || "",
              productOptions: [
                {
                  name: product['Option1 Name'],
                  values: [{
                    name: product['Option1 Value']
                  }],
                },
              ],
              metafields: [{
                namespace: 'custom',
                key: 'theme_types',
                value: publications[0]?.publicationName.split(' ').join('-'),
                type: 'single_line_text_field'
              }],
              variants: [
                {
                  price: product["Variant Price"]?.toString() || "10.00",
                  inventoryPolicy: product["Variant Inventory Policy"]?.toUpperCase() || "CONTINUE",
                  taxable: product["Variant Taxable"] ?? true,
                  optionValues: [{
                    optionName: product['Option1 Name'],
                    name: product['Option1 Value'],
                  }],
                  inventoryQuantities: [{
                    locationId: locationId,
                    quantity: 100,
                    name: 'available'
                  }],
                  sku: product['Variant SKU']?.toString()
                },
              ],
              // Add media property, will be set below if matchedMediaGroup exists
              media: [] as { originalSource: string; alt: string; contentType: string }[],
            },
          };

          if (matchedMediaGroup) {
            inputPayload.productSet.media = matchedMediaGroup.media;
          }

          // 🛠️ Create product
          const createProductResponse = await fetch(SHOPIFY_ADMIN_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
            },
            body: JSON.stringify({
              query: `
                mutation createProductAsynchronous($productSet: ProductSetInput!, $synchronous: Boolean!) {
        productSet(synchronous: $synchronous, input: $productSet) {
        product {
            id
            title
             media(first: 5) {
            nodes {
              id
              alt
              mediaContentType
              status
            }
          }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  inventoryItem {
                    id  # 👈 This is needed to adjust inventory later
                  }
                }
              }
            }
          }
          productSetOperation {
            id
            status
            userErrors {
              code
              field
              message
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }`,
              variables: inputPayload,
            }),
          });

          const productData = await createProductResponse.json();
          const createdProduct = productData?.data?.productSet?.product;
          const inventoryItemId = productData.data.productSet.product.variants.edges[0].node.inventoryItem.id;

          if (!createdProduct?.id) {
            console.error(
              "Product creation failed:",
              productData.data.productCreate.userErrors
            );
            continue;
          }

          const productId = createdProduct.id;

          const updateItemMutation = `mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem {
          id
          unitCost {
            amount
          }
          tracked
          countryCodeOfOrigin
          provinceCodeOfOrigin
          harmonizedSystemCode
          countryHarmonizedSystemCodes(first: 1) {
            edges {
              node {
                harmonizedSystemCode
                countryCode
              }
            }
          }
        }
        userErrors {
          message
        }
      }
    }`

          const inventoryUpdateResponse = await fetch(SHOPIFY_ADMIN_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
            },
            body: JSON.stringify({
              query: updateItemMutation,
              variables: {
                id: inventoryItemId,
                input: {
                  tracked: true
                }
              },
            }),
          });

          const inventoryUpdated = await inventoryUpdateResponse.json()

          // 🌐 Publish the product
          for (const publication of publications) {
            try {
              const publishResponse = await fetch(SHOPIFY_ADMIN_API_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
                },
                body: JSON.stringify({
                  query: `
                    mutation PublishablePublish($productId: ID!, $publicationId: ID!) {
                      publishablePublish(id: $productId, input: {publicationId: $publicationId}) {
                        publishable {
                          publishedOnPublication(publicationId: $publicationId)
                        }
                        userErrors {
                          field
                          message
                        }
                      }
                    }`,
                  variables: {
                    productId: productId,
                    publicationId: publication.publicationId,
                  },
                }),
              });

              const publishData = await publishResponse.json();

              if (publishData.data.publishablePublish.userErrors.length > 0) {
                console.error(
                  "Publishing failed for",
                  product['Title'],
                  "on publication",
                  publication.publicationName,
                  ":",
                  publishData.data.publishablePublish.userErrors
                );
              } else {
                console.log(
                  "✅ Successfully created and published:",
                  product['Title'],
                  "on publication:",
                  publication.publicationName
                );
              }
            } catch (error) {
              console.error("Error publishing product:", product['title'], "on publication:", publication.publicationName, error);
            }
          }
        } catch (error) {
          console.error("Product creation error:", error);
        }
      }
    }

    await uploadProducts(parsedCsvData, publications);

    return NextResponse.json({
      success: true,
      message: "Products uploaded successfully"
    });

  } catch (error) {
    console.error("🔥 [ERROR] Failed to upload products:", error);
    return NextResponse.json(
      {
        error: "Failed to upload products",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
} 