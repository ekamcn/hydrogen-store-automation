"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  parseProductCsv,
  generateProductCsvTemplate,
  ParsedProduct,
  ParsedCollection,
} from "@/utils/productCsvParser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Progress } from './ui/progress';
import { Badge } from "./ui/badge";
import { io, Socket } from "socket.io-client";

import { Separator } from "@/components/ui/separator";
import {
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface ShopifyConfig {
  storeName: string;
  storeUrl: string;
  adminAccessToken: string;
}

interface UploadResult {
  success: boolean;
  results?: {
    products: { title?: string; handle?: string; id?: string }[];
    collections: { title?: string; handle?: string; id?: string }[];
    errors: { type: string; error?: string; handle?: string }[];
  };
  summary?: {
    productsCreated: number;
    collectionsCreated: number;
    errors: number;
  };
  error?: string;
}

export default function ProductUploader() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{
    products: ParsedProduct[];
    collections: ParsedCollection[];
  } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [stores, setStores] = useState<
    Array<{ store_id: string; storeName: string }>
  >([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [publications, setPublications] = useState<
    Array<{ publicationId: string; publicationName: string }>
  >([]);
  const [shopifyConfig, setShopifyConfig] = useState<ShopifyConfig>({
    storeName: "",
    storeUrl: "",
    adminAccessToken: "",
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const serverUrl = `http://51.112.151.1`;
    socketRef.current = io(serverUrl, {
      transports: ["websocket", "polling"],
      path: "/backend/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      forceNew: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      // connected
    });

    socket.on(
      "publish:success",
      (payload: {
        handle?: string;
        id?: string;
        count?: number;
        title?: string;
      }) => {
        setUploadResult((prev) => {
          const prevSummary = prev?.summary || {
            productsCreated: 0,
            collectionsCreated: 0,
            errors: 0,
          };
          const newProductsCreated = (prevSummary.productsCreated || 0) + 1;
          return {
            success: true,
            results: {
              products: [
                ...(prev?.results?.products || []),
                {
                  title: payload.title,
                  handle: payload.handle,
                  id: payload.id,
                },
              ],
              collections: prev?.results?.collections || [],
              errors: prev?.results?.errors || [],
            },
            summary: {
              productsCreated: newProductsCreated,
              collectionsCreated: prevSummary.collectionsCreated || 0,
              errors: prevSummary.errors || 0,
            },
          };
        });
      }
    );

    socket.on(
      "publish:error",
      (payload: { handle?: string; message?: string }) => {
        setUploadResult((prev) => {
          const prevSummary = prev?.summary || {
            productsCreated: 0,
            collectionsCreated: 0,
            errors: 0,
          };
          const newErrors = (prevSummary.errors || 0) + 1;
          return {
            success: false,
            results: {
              products: prev?.results?.products || [],
              collections: prev?.results?.collections || [],
              errors: [
                ...(prev?.results?.errors || []),
                {
                  type: "product",
                  error: payload.message,
                  handle: payload.handle,
                },
              ],
            },
            summary: {
              productsCreated: prevSummary.productsCreated || 0,
              collectionsCreated: prevSummary.collectionsCreated || 0,
              errors: newErrors,
            },
            error: prev?.error,
          };
        });
      }
    );

    return () => {
      socket.off("connect");
      socket.off("publish:success");
      socket.off("publish:error");
      socket.disconnect();
    };
  }, []);

  // Load stores for dropdown
  useEffect(() => {
    const loadStores = async () => {
      try {
        setIsLoadingStores(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/store/all`
        );
        if (!res.ok) throw new Error("Failed to fetch stores");
        const data = await res.json();
        const list: Array<{ store_id: string; storeName: string }> =
          Array.isArray(data?.stores) ? data.stores : [];
        setStores(
          list.map((s: { store_id: string; storeName: string }) => ({
            store_id: s.store_id,
            storeName: s.storeName,
          }))
        );
      } catch {
        // fail silently in UI
        setStores([]);
      } finally {
        setIsLoadingStores(false);
      }
    };
    loadStores();
  }, []);

  // When a store is selected, resolve env and fetch publications
  const handleSelectStore = async (storeName: string) => {
    setShopifyConfig((prev) => ({ ...prev, storeName }));
    setPublications([]);
    if (!storeName) return;
    try {
      // hit backend to load env for this store
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/store/env?storeName=${encodeURIComponent(storeName)}`
      );
    } catch {
      // ignore
    }
    try {
      const res = await fetch(
        `/api/get-publications`
      );
      if (!res.ok) throw new Error("Failed to fetch publications");
      const data = await res.json();
      const edges: Array<{ node?: { id?: string; name?: string } }> =
        data?.data?.publications?.edges || [];
      const pubs = edges
        .map((edge) => ({
          publicationId: edge?.node?.id as string,
          publicationName: edge?.node?.name as string,
        }))
        .filter((p) => Boolean(p.publicationId) && Boolean(p.publicationName));
      setPublications(pubs);
    } catch {
      setPublications([]);
    }
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setCsvFile(file);
      setIsParsing(true);
      setParsedData(null);
      setUploadResult(null);

      try {
        const data = await parseProductCsv(file);
        setParsedData(data);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        setUploadResult({
          success: false,
          error: "Failed to parse CSV file. Please check the format.",
        });
      } finally {
        setIsParsing(false);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!parsedData || !shopifyConfig.storeName) {
      setUploadResult({
        success: false,
        error: "Please provide Store Name and upload a CSV file.",
      });
      return;
    }

    setIsUploading(true);
    // reset progress UI (not currently shown)
    setUploadResult(null);

    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("publish:products", {
          storeName: shopifyConfig.storeName,
          products: parsedData.products,
          collections: parsedData.collections,
          publications,
        });
      } else {
        setUploadResult({
          success: false,
          error: "Socket not connected. Please try again.",
        });
        return;
      }
    } catch {
      setUploadResult({
        success: false,
        error: "Network error occurred during upload",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = generateProductCsvTemplate();
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Product Upload to Shopify
          </CardTitle>
          <CardDescription>
            Upload products to your Shopify store using CSV data. First,
            configure your Shopify store details, then upload a CSV file with
            your product data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shopify Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Shopify Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeName">Store</Label>
                <select
                  id="storeName"
                  className="w-full border rounded-md h-10 px-3 text-sm"
                  value={shopifyConfig.storeName}
                  onChange={(e) => handleSelectStore(e.target.value)}
                  disabled={isLoadingStores}
                >
                  <option value="">
                    {isLoadingStores ? "Loading stores..." : "Select a store"}
                  </option>
                  {stores.map((s) => (
                    <option key={s.store_id} value={s.storeName}>
                      {s.storeName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="storeUrl">Store URL</Label>
                <Input
                  id="storeUrl"
                  placeholder="your-store.myshopify.com"
                  value={shopifyConfig.storeUrl}
                  onChange={(e) =>
                    setShopifyConfig((prev) => ({
                      ...prev,
                      storeUrl: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="adminToken">Admin Access Token</Label>
                <Input
                  id="adminToken"
                  type="password"
                  placeholder="shpat_..."
                  value={shopifyConfig.adminAccessToken}
                  onChange={(e) =>
                    setShopifyConfig((prev) => ({
                      ...prev,
                      adminAccessToken: e.target.value,
                    }))
                  }
                />
              </div>
              {publications.length > 0 && (
                <div className="md:col-span-2 text-sm text-gray-700">
                  <div className="font-medium mb-1">
                    Publications to publish on:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {publications.map((p) => (
                      <span
                        key={p.publicationId}
                        className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs"
                      >
                        {p.publicationName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* CSV Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">CSV File Upload</h3>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {csvFile ? csvFile.name : "Click to upload CSV file"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports .csv files with product data
                </p>
              </label>
            </div>

            {isParsing && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                Parsing CSV file...
              </div>
            )}
          </div>

          {/* Parsed Data Preview */}
          {parsedData && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Data Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Total Products:
                          </span>
                          <Badge variant="secondary">
                            {parsedData.products.length}
                          </Badge>
                        </div>
                        {parsedData.products
                          .slice(0, 3)
                          .map((product, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-600 truncate"
                            >
                              {product.title}
                            </div>
                          ))}
                        {parsedData.products.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{parsedData.products.length - 3} more...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Collections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Total Collections:
                          </span>
                          <Badge variant="secondary">
                            {parsedData.collections.length}
                          </Badge>
                        </div>
                        {parsedData.collections
                          .slice(0, 3)
                          .map((collection, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-600 truncate"
                            >
                              {collection.title}
                            </div>
                          ))}
                        {parsedData.collections.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{parsedData.collections.length - 3} more...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* Upload Button */}
          {parsedData && (
            <>
              <Separator />
              <div className="flex justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !shopifyConfig.storeName}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload to Shopify
                    </>
                  )}
                </Button>
              </div>
              {/* {isUploading && (
 <div className="space-y-2">
 <Progress value={uploadProgress} className="w-full" />
 <p className="text-sm text-gray-600 text-center">
 Uploading products and collections to Shopify...
 </p>
 </div>
 )} */}
            </>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Upload {uploadResult.success ? "Successful" : "Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadResult.success ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully uploaded{" "}
                    {uploadResult.summary?.productsCreated} products and{" "}
                    {uploadResult.summary?.collectionsCreated} collections to
                    Shopify.
                  </AlertDescription>
                </Alert>

                {uploadResult.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {uploadResult.summary.productsCreated}
                      </div>
                      <div className="text-sm text-gray-600">
                        Products Created
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {uploadResult.summary.collectionsCreated}
                      </div>
                      <div className="text-sm text-gray-600">
                        Collections Created
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {uploadResult.summary.errors}
                      </div>
                      <div className="text-sm text-gray-600">Errors</div>
                    </div>
                  </div>
                )}

                {uploadResult.results?.errors &&
                  uploadResult.results.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-600">Errors:</h4>
                      <div className="space-y-1">
                        {uploadResult.results.errors.slice(0, 5).map(
                          (
                            error: {
                              type: string;
                              error?: string;
                              handle?: string;
                            },
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="text-sm text-red-600 bg-red-50 p-2 rounded"
                            >
                              {error.type}: {error.error}
                            </div>
                          )
                        )}
                        {uploadResult.results.errors.length > 5 && (
                          <div className="text-sm text-gray-500">
                            +{uploadResult.results.errors.length - 5} more
                            errors...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadResult.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
