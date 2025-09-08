"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SuccessMessage from "@/components/ui/SuccessMessage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { exportToCSV } from "@/utils/exportToCSV";
import { useSearchParams } from "next/navigation";

interface FailedCollectionRecord {
  title?: string;
  handle?: string;
  error: string;
  [key: string]: unknown;
}

interface FailedProductRecord {
  title?: string;
  handle?: string;
  error: string;
  [key: string]: unknown;
}

interface SuccessfulCollectionRecord {
  title?: string;
  handle?: string;
  [key: string]: unknown;
}

interface SuccessfulProductRecord {
  title?: string;
  handle?: string;
  [key: string]: unknown;
}

interface ProcessingStatus {
  total: number;
  processed: number;
  successful: number;
  failed: number;
}

export default function CsvPublishPage() {
  const [generalError, setGeneralError] = useState<string>("");
  const [generalSuccess, setGeneralSuccess] = useState<string>("");
  const [collectionStatus, setCollectionStatus] = useState<string>("");
  const [productStatus, setProductStatus] = useState<string>("");
  const [collectionProcessingStatus, setCollectionProcessingStatus] = useState<ProcessingStatus>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
  });
  const [productProcessingStatus, setProductProcessingStatus] = useState<ProcessingStatus>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
  });
  const [collectionError, setCollectionError] = useState<string>("");
  const [collectionSuccess, setCollectionSuccess] = useState<string>("");
  const [productError, setProductError] = useState<string>("");
  const [productSuccess, setProductSuccess] = useState<string>("");
  const [failedCollectionRecords, setFailedCollectionRecords] = useState<FailedCollectionRecord[]>([]);
  const [failedProductRecords, setFailedProductRecords] = useState<FailedProductRecord[]>([]);
  const [successfulCollectionRecords, setSuccessfulCollectionRecords] = useState<SuccessfulCollectionRecord[]>([]);
  const [successfulProductRecords, setSuccessfulProductRecords] = useState<SuccessfulProductRecord[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const searchParams = useSearchParams();
  const [hasEmittedCollections, setHasEmittedCollections] = useState(false);
  const [hasEmittedProducts, setHasEmittedProducts] = useState(false);

  // Socket initialization
  useEffect(() => {
    const serverUrl = "http://51.112.151.1";
    socketRef.current = io(serverUrl, {
      transports: ["websocket", "polling"],
      forceNew: true,
      path: "/backend/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });

    return () => {
      socketRef.current?.disconnect();
      console.log("Socket cleanup: disconnected");
    };
  }, []);

  // Debug successfulProductRecords updates
  useEffect(() => {
    console.log("successfulProductRecords updated:", successfulProductRecords);
  }, [successfulProductRecords]);

  // Socket event handlers and publish logic
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Log socket connection status
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // Emit collections if not yet emitted
      const storeName = searchParams.get("storeName");
      const storeId = searchParams.get("storeId");
      if (storeName && storeId && !hasEmittedCollections) {
        console.log("Emitting publish:collections", { storeName, storeId });
        socket.emit("publish:collections", { storeName, storeId });
        setHasEmittedCollections(true);
        setCollectionStatus("Starting collections publish process...");
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setGeneralError("Failed to connect to server. Please try again.");
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setGeneralError("Disconnected from server. Attempting to reconnect...");
    });

    // High-level status
    socket.on("publish:status", (msg: unknown) => {
      console.log("Received publish:status", msg);
      console.log("DEBUG: publish:status payload:", JSON.stringify(msg));
      setGeneralError("");
      setGeneralSuccess("");
    });

    // Unified progress
    socket.on(
      "publish:progress",
      (
        progress: Partial<{
          total: number;
          processed: number;
          successful: number;
          failed: number;
          scope?: string;
          error?: string;
          success?: string;
        }>
      ) => {
        console.log("Received publish:progress", progress);
        console.log("DEBUG: publish:progress payload:", JSON.stringify(progress));
        if (progress.scope === "collections") {
          setCollectionProcessingStatus((prev) => ({ ...prev, ...progress }));
        } else if (progress.scope === "products") {
          setProductProcessingStatus((prev) => ({ ...prev, ...progress }));
        }
        if (progress.processed === 0) {
          if (progress.scope === "collections") {
            setFailedCollectionRecords([]);
            setSuccessfulCollectionRecords([]);
          } else if (progress.scope === "products") {
            setFailedProductRecords([]);
            setSuccessfulProductRecords([]);
          }
        }
        if (progress.error) setGeneralError(progress.error);
        if (progress.success) setGeneralSuccess(progress.success);
      }
    );

    // Unified error
    socket.on("publish:error", (payload: { message?: string; scope?: string; [key: string]: unknown }) => {
      console.log("Received publish:error", payload);
      console.log("DEBUG: publish:error payload:", JSON.stringify(payload));
      if (payload.scope === "collections") {
        setCollectionError(payload?.message || "Collection error");
      } else if (payload.scope === "products") {
        setProductError(payload?.message || "Product error");
      } else {
        setGeneralError(payload?.message || "An error occurred");
      }
    });

    // Unified completed
    socket.on(
      "publish:completed",
      (payload: { scope: string; successCount?: number }) => {
        console.log("Received publish:completed", payload);
        console.log("DEBUG: publish:completed payload:", JSON.stringify(payload));
        setGeneralSuccess(`Completed: ${payload.scope} (${payload.successCount || 0} successful)`);
      }
    );

    // Collections progress
    socket.on(
      "publish:collections:progress",
      (
        progress: Partial<{
          total: number;
          processed: number;
          successful: number;
          failed: number;
          stage?: string;
          message?: string;
          title?: string;
          handle?: string;
        }>
      ) => {
        console.log("Received publish:collections:progress", progress);
        console.log("DEBUG: publish:collections:progress payload:", JSON.stringify(progress));
        setCollectionProcessingStatus((prev) => ({ ...prev, ...progress }));
        const statusMessage =
          progress.message ||
          progress.stage ||
          (typeof progress === "object" ? JSON.stringify(progress) : String(progress));
        setCollectionStatus(
          `Collections: ${statusMessage}${
            progress.title ? ` (Title: ${progress.title})` : ""
          }${progress.handle ? ` (Handle: ${progress.handle})` : ""}`
        );
        if (progress.processed === 0) {
          setFailedCollectionRecords([]);
          setSuccessfulCollectionRecords([]);
        }
      }
    );

    // Collections error
    socket.on("publish:collections:error", (payload: { message?: string; title?: string; handle?: string; [key: string]: unknown }) => {
      console.log("Received publish:collections:error", payload);
      console.log("DEBUG: publish:collections:error payload:", JSON.stringify(payload));
      setCollectionError(payload?.message || "Collection error");
      setFailedCollectionRecords((prev) => {
        if (
          prev.some(
            (rec) =>
              rec.title === payload?.title &&
              rec.handle === payload?.handle &&
              rec.error === payload?.message
          )
        ) {
          return prev;
        }
        return [
          ...prev,
          { title: payload?.title, handle: payload?.handle, error: payload?.message || "Unknown error" },
        ];
      });
    });

    // Collections done
    socket.on(
      "publish:collections:done",
      (payload: { created: number; total: number }) => {
        console.log("Received publish:collections:done", payload);
        console.log("DEBUG: publish:collections:done payload:", JSON.stringify(payload));
        setCollectionSuccess(`Collections done: ${payload.created}/${payload.total}`);
      }
    );

    // Collections failed records
    socket.on("publish:failedRecords", (failed: FailedCollectionRecord[]) => {
      console.log("Received publish:failedRecords", failed);
      console.log("DEBUG: publish:failedRecords payload:", JSON.stringify(failed));
      setFailedCollectionRecords(failed);
    });

    // Collections published
    socket.on("publish:collections:published", (payload: { title?: string; handle?: string; [key: string]: unknown }) => {
      console.log("Received publish:collections:published", payload);
      console.log("DEBUG: publish:collections:published payload:", JSON.stringify(payload));
      setSuccessfulCollectionRecords((prev) => {
        if (prev.some((rec) => rec.title === payload.title && rec.handle === payload.handle)) {
          console.log("Duplicate collection record, skipping:", payload);
          return prev;
        }
        console.log("Adding collection record:", payload, "New length:", prev.length + 1);
        return [...prev, { title: payload.title, handle: payload.handle, ...payload }];
      });
    });

    // Collections publish error
    socket.on("publish:collections:publish_error", (payload: { message?: string; title?: string; handle?: string; [key: string]: unknown }) => {
      console.log("Received publish:collections:publish_error", payload);
      console.log("DEBUG: publish:collections:publish_error payload:", JSON.stringify(payload));
      setCollectionError(payload?.message || "Collection publish error");
      setFailedCollectionRecords((prev) => {
        if (
          prev.some(
            (rec) =>
              rec.title === payload?.title &&
              rec.handle === payload?.handle &&
              rec.error === payload?.message
          )
        ) {
          return prev;
        }
        return [
          ...prev,
          { title: payload?.title, handle: payload?.handle, error: payload?.message || "Unknown error" },
        ];
      });
    });

    // Collections publish summary
    socket.on("publish:collections:publish_summary", (payload: unknown) => {
      console.log("Received publish:collections:publish_summary", payload);
      console.log("DEBUG: publish:collections:publish_summary payload:", JSON.stringify(payload));
    });

    // Collections success
    socket.on("publish:collections:success", (payload: { title?: string; handle?: string; [key: string]: unknown }) => {
      console.log("Received publish:collections:success", payload);
      console.log("DEBUG: publish:collections:success payload:", JSON.stringify(payload));
    });

    // Collections completed
    socket.on(
      "publish:collections:completed",
      (payload: { storeName: string; success: boolean }) => {
        console.log("Received publish:collections:completed", payload);
        console.log("DEBUG: publish:collections:completed payload:", JSON.stringify(payload));
        setCollectionSuccess(`Collections completed for ${payload.storeName}: ${payload.success ? 'Success' : 'Failed'}`);
        // Trigger products publish if not already emitted
        if (payload.success && !hasEmittedProducts) {
          const storeId = searchParams.get("storeId");
          if (storeId) {
            console.log("Emitting publish:products", { storeName: payload.storeName, storeId });
            socket.emit("publish:products", {
              storeName: payload.storeName,
              storeId,
            });
            setHasEmittedProducts(true);
            setProductStatus("Starting products publish process...");
          }
        }
      }
    );

    // Products progress
    socket.on(
      "publish:products:progress",
      (
        progress: Partial<{
          total: number;
          processed: number;
          successful: number;
          failed: number;
          stage?: string;
          message?: string;
        }>
      ) => {
        console.log("Received publish:products:progress", progress);
        console.log("DEBUG: publish:products:progress payload:", JSON.stringify(progress));
        setProductProcessingStatus((prev) => ({ ...prev, ...progress }));
        const statusMessage =
          progress.message ||
          progress.stage ||
          (typeof progress === "object" ? JSON.stringify(progress) : String(progress));
        setProductStatus(`Products: ${statusMessage}`);
        if (progress.processed === 0) {
          setFailedProductRecords([]);
          setSuccessfulProductRecords([]);
        }
      }
    );

    // Products warn
    socket.on("publish:products:warn", (payload: { message?: string; [key: string]: unknown }) => {
      console.log("Received publish:products:warn", payload);
      console.log("DEBUG: publish:products:warn payload:", JSON.stringify(payload));
      setProductError(`Warning: ${payload?.message || "Non-fatal product issue"}`);
    });

    // Products error
    socket.on("publish:products:error", (payload: { message?: string; title?: string; handle?: string; [key: string]: unknown }) => {
      console.log("Received publish:products:error", payload);
      console.log("DEBUG: publish:products:error payload:", JSON.stringify(payload));
      setProductError(payload?.message || "Product error");
      setFailedProductRecords((prev) => {
        if (
          prev.some(
            (rec) =>
              rec.title === payload?.title &&
              rec.handle === payload?.handle &&
              rec.error === payload?.message
          )
        ) {
          return prev;
        }
        return [
          ...prev,
          { title: payload?.title, handle: payload?.handle, error: payload?.message || "Unknown error" },
        ];
      });
    });

    // Products failed records
    socket.on("publish:products:failedRecords", (failed: FailedProductRecord[]) => {
      console.log("Received publish:products:failedRecords", failed);
      console.log("DEBUG: publish:products:failedRecords payload:", JSON.stringify(failed));
      setFailedProductRecords(failed);
    });

    // Products done
    socket.on(
      "publish:products:done",
      (payload: { created: number; total: number }) => {
        console.log("Received publish:products:done", payload);
        console.log("DEBUG: publish:products:done payload:", JSON.stringify(payload));
        // setProductSuccess(`Products done: ${payload.created}/${payload.total}`);
        setProductSuccess(`Products done: ${payload.created}`);
      }
    );

    // Products published
    socket.on("publish:products:published", (payload: { title?: string; handle?: string; [key: string]: unknown }) => {
      console.log("Received publish:products:published", payload);
      console.log("DEBUG: publish:products:published payload:", JSON.stringify(payload));
      setSuccessfulProductRecords((prev) => {
        if (prev.some((rec) => rec.title === payload.title && rec.handle === payload.handle)) {
          console.log("Duplicate product record, skipping:", payload);
          return prev;
        }
        console.log("Adding product record:", payload, "New length:", prev.length + 1);
        return [...prev, { title: payload.title, handle: payload.handle, ...payload }];
      });
    });

    // Products success
    socket.on("publish:products:success", (payload: { title?: string; handle?: string; [key: string]: unknown }) => {
      console.log("Received publish:products:success", payload);
      console.log("DEBUG: publish:products:success payload:", JSON.stringify(payload));
      setSuccessfulProductRecords((prev) => {
        if (prev.some((rec) => rec.title === payload.title && rec.handle === payload.handle)) {
          console.log("Duplicate product record, skipping:", payload);
          return prev;
        }
        console.log("Adding product record:", payload, "New length:", prev.length + 1);
        return [...prev, { title: payload.title, handle: payload.handle, ...payload }];
      });
    });

    // Products publish error
    socket.on("publish:products:publish_error", (payload: { message?: string; title?: string; handle?: string; [key: string]: unknown }) => {
      console.log("Received publish:products:publish_error", payload);
      console.log("DEBUG: publish:products:publish_error payload:", JSON.stringify(payload));
      setProductError(payload?.message || "Product publish error");
      setFailedProductRecords((prev) => {
        if (
          prev.some(
            (rec) =>
              rec.title === payload?.title &&
              rec.handle === payload?.handle &&
              rec.error === payload?.message
          )
        ) {
          return prev;
        }
        return [
          ...prev,
          { title: payload?.title, handle: payload?.handle, error: payload?.message || "Unknown error" },
        ];
      });
    });

    // Products publish summary
    socket.on("publish:products:publish_summary", (payload: unknown) => {
      console.log("Received publish:products:publish_summary", payload);
      console.log("DEBUG: publish:products:publish_summary payload:", JSON.stringify(payload));
    });

    // Not found
    socket.on("publish:not_found", (payload: unknown) => {
      console.log("Received publish:not_found", payload);
      console.log("DEBUG: publish:not_found payload:", JSON.stringify(payload));
      setGeneralError("Required file/folder/env not found");
    });

    // Category language
    socket.on("publish:category_language", (payload: unknown) => {
      console.log("Received publish:category_language", payload);
      console.log("DEBUG: publish:category_language payload:", JSON.stringify(payload));
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("publish:status");
      socket.off("publish:progress");
      socket.off("publish:error");
      socket.off("publish:completed");
      socket.off("publish:collections:progress");
      socket.off("publish:collections:error");
      socket.off("publish:collections:done");
      socket.off("publish:failedRecords");
      socket.off("publish:collections:published");
      socket.off("publish:collections:publish_error");
      socket.off("publish:collections:publish_summary");
      socket.off("publish:collections:success");
      socket.off("publish:collections:completed");
      socket.off("publish:products:progress");
      socket.off("publish:products:warn");
      socket.off("publish:products:error");
      socket.off("publish:products:failedRecords");
      socket.off("publish:products:published");
      socket.off("publish:products:success");
      socket.off("publish:products:publish_error");
      socket.off("publish:products:publish_summary");
      socket.off("publish:products:done");
      socket.off("publish:not_found");
      socket.off("publish:category_language");
    };
  }, [searchParams, hasEmittedCollections, hasEmittedProducts]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Publish Progress</h1>
      {generalError && <ErrorMessage message={generalError} className="mb-4" />}
      {generalSuccess && <SuccessMessage message={generalSuccess} className="mb-4" />}

      {/* Collections Section */}
      <h2 className="text-2xl font-semibold mb-4">Collections</h2>
      {collectionStatus && <div className="mb-4 text-blue-700">{collectionStatus}</div>}
      {collectionError && <ErrorMessage message={collectionError} className="mb-4" />}
      {collectionSuccess && <SuccessMessage message={collectionSuccess} className="mb-4" />}
      {collectionProcessingStatus.total > 0 && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-300">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Collections Processing Status:</h3>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-medium">{collectionProcessingStatus.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-xl font-medium">{collectionProcessingStatus.successful}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-xl font-medium">{collectionProcessingStatus.failed}</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${
                  collectionProcessingStatus.total > 0
                    ? (collectionProcessingStatus.processed / collectionProcessingStatus.total) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          {(failedCollectionRecords.length > 0 || successfulCollectionRecords.length > 0) && (
            <div className="mt-4">
              {failedCollectionRecords.length > 0 && (
                <Button
                  onClick={() => exportToCSV(failedCollectionRecords, "failed-collections")}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 mr-2"
                >
                  Download Failed Collections (CSV)
                </Button>
              )}
              {successfulCollectionRecords.length > 0 && (
                <Button
                  onClick={() => exportToCSV(successfulCollectionRecords, "successful-collections")}
                  variant="outline"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  Download Successful Collections (CSV)
                </Button>
              )}
              <p className="mt-2 text-sm text-blue-700">
                Download records to review.
              </p>
            </div>
          )}
        </Card>
      )}
      {successfulCollectionRecords.length > 0 && (
        <Card className="p-6 mb-6 border-green-200 bg-green-50">
          <div className="flex !justify-between !items-center mb-4">
            <h3 className="text-xl font-semibold text-green-800">
              Successful Collections ({successfulCollectionRecords.length})
            </h3>
            <Button
              onClick={() => exportToCSV(successfulCollectionRecords, "successful-collections")}
              variant="outline"
              className="text-green-600 border-green-300 hover:bg-green-100"
            >
              Download Successful Collections (CSV)
            </Button>
          </div>
          <div className="overflow-x-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-green-700">Title</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-green-700">Handle</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {successfulCollectionRecords.slice(0, 5).map((record, idx) => (
                  <tr key={idx} className="hover:bg-green-50">
                    <td className="px-3 py-2 text-sm text-gray-600">{record.title || "-"}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{record.handle || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {successfulCollectionRecords.length > 5 && (
              <p className="mt-2 text-xs text-gray-500 italic">
                Showing {successfulCollectionRecords.length} successful records.
                Download the CSV for complete details.
              </p>
            )}
          </div>
        </Card>
      )}
      {failedCollectionRecords.length > 0 && (
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-red-800">
              Failed Collections ({failedCollectionRecords.length})
            </h3>
            <Button
              onClick={() => exportToCSV(failedCollectionRecords, "failed-collections")}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Download Failed Collections (CSV)
            </Button>
          </div>
          <div className="overflow-x-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Title</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Handle</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Error</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {failedCollectionRecords.slice(0, 5).map((record, idx) => (
                  <tr key={idx} className="hover:bg-red-50">
                    <td className="px-3 py-2 text-sm text-gray-600">{record.title || "-"}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{record.handle || "-"}</td>
                    <td className="px-3 py-2 text-sm text-red-600 max-w-md">
                      {record.error && record.error.length > 100
                        ? `${record.error.substring(0, 100)}...`
                        : record.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {failedCollectionRecords.length > 5 && (
              <p className="mt-2 text-xs text-gray-500 italic">
                Showing first 5 of {failedCollectionRecords.length} failed records.
                Download the CSV for complete details.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Products Section */}
      <h2 className="text-2xl font-semibold mb-4">Products</h2>
      {productStatus && <div className="mb-4 text-blue-700">{productStatus}</div>}
      {productError && <ErrorMessage message={productError} className="mb-4" />}
      {productSuccess && <SuccessMessage message={productSuccess} className="mb-4" />}
      {productProcessingStatus.total > 0 && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-300">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Products Processing Status:</h3>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-medium">{productProcessingStatus.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-xl font-medium">{productProcessingStatus.successful}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-xl font-medium">{productProcessingStatus.failed}</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${
                  productProcessingStatus.total > 0
                    ? (productProcessingStatus.processed / productProcessingStatus.total) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          {(failedProductRecords.length > 0 || successfulProductRecords.length > 0) && (
            <div className="mt-4">
              {failedProductRecords.length > 0 && (
                <Button
                  onClick={() => exportToCSV(failedProductRecords, "failed-products")}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 mr-2"
                >
                  Download Failed Products (CSV)
                </Button>
              )}
              {successfulProductRecords.length > 0 && (
                <Button
                  onClick={() => exportToCSV(successfulProductRecords, "successful-products")}
                  variant="outline"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  Download Successful Products (CSV)
                </Button>
              )}
              <p className="mt-2 text-sm text-blue-700">
                Download records to review.
              </p>
            </div>
          )}
        </Card>
      )}
      {successfulProductRecords.length > 0 && (
        <Card className="p-6 mb-6 border-green-200 bg-green-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-green-800">
              Successful Products ({successfulProductRecords.length})
            </h3>
            <Button
              onClick={() => exportToCSV(successfulProductRecords, "successful-products")}
              variant="outline"
              className="text-green-600 border-green-300 hover:bg-green-100"
            >
              Download Successful Products (CSV)
            </Button>
          </div>
          <div className="overflow-x-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-green-700">Title</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-green-700">Handle</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {successfulProductRecords.slice(0, 5).map((record, idx) => (
                  <tr key={idx} className="hover:bg-green-50">
                    <td className="px-3 py-2 text-sm text-gray-600">{record.title || "-"}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{record.handle || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {successfulProductRecords.length > 5 && (
              <p className="mt-2 text-xs text-gray-500 italic">
                Showing of {successfulProductRecords.length} successful records.
                Download the CSV for complete details.
              </p>
            )}
          </div>
        </Card>
      )}
      {failedProductRecords.length > 0 && (
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-red-800">
              Failed Products ({failedProductRecords.length})
            </h3>
            <Button
              onClick={() => exportToCSV(failedProductRecords, "failed-products")}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Download Failed Products (CSV)
            </Button>
          </div>
          <div className="overflow-x-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Title</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Handle</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Error</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {failedProductRecords.slice(0, 5).map((record, idx) => (
                  <tr key={idx} className="hover:bg-red-50">
                    <td className="px-3 py-2 text-sm text-gray-600">{record.title || "-"}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{record.handle || "-"}</td>
                    <td className="px-3 py-2 text-sm text-red-600 max-w-md">
                      {record.error && record.error.length > 100
                        ? `${record.error.substring(0, 100)}...`
                        : record.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {failedProductRecords.length > 5 && (
              <p className="mt-2 text-xs text-gray-500 italic">
                Showing first 5 of {failedProductRecords.length} failed records.
                Download the CSV for complete details.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}