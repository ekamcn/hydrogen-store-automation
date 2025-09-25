"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface Store {
  store_id: string;
  storeName: string;
  storeUrl: string;
  shopifyUrl: string;
  status: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
  isPublished: boolean;
}
type StoresResponse = { stores: Store[] };
function isStoresResponse(value: unknown): value is StoresResponse {
  if (!value || typeof value !== "object") return false;
  if (!("stores" in value)) return false;
  const obj = value as { stores: unknown };
  return Array.isArray(obj.stores);
}

export default function CustomersTable() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const serverUrl = `http://51.112.151.1`;
    socketRef.current = io(serverUrl, {
      transports: ["websocket", "polling"],
      path: "/backend/socket.io",
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/store/all`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch store data");
        return response.json();
      })
      .then((data: unknown) => {
        if (isStoresResponse(data)) setStores(data.stores);
        else setStores([]);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      });
  }, []);

  const handleDownload = async (storeName: string) => {
    const formattedStoreName = encodeURIComponent(storeName);
    const downloadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/${formattedStoreName}.zip`;

    try {
      // Fetch the file first
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Convert response to blob for download
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${formattedStoreName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // After successful download, call delete API
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/store/delete?storeName=${formattedStoreName}`,
        {
          method: "POST",
        }
      );
      window.location.reload();
    } catch (error) {
      console.error("Error in download/delete process:", error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 mt-8">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-center sm:text-left">
          Onboarded Shopify Stores
        </h2>
        {loading ? (
          <div className="py-12 text-center text-gray-500 text-lg">
            Loading...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 text-lg">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <Table className="min-w-[650px] sm:min-w-[750px] md:min-w-[900px]">
              <TableCaption className="text-gray-500 text-sm sm:text-base">
                List of onboarded Shopify stores.
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm font-semibold">
                    S.No.
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm font-semibold">
                    Store Name
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm font-semibold">
                    Theme Status
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm font-semibold">
                    Admin Store URL
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm font-semibold">
                    Store URL
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-gray-400"
                    >
                      No stores found.
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((customer, idx) => (
                    <TableRow
                      key={customer.store_id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-indigo-50 transition-colors`}
                    >
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 font-medium text-center text-sm">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-gray-800 text-sm">
                        {customer.storeName}
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold inline-block
                            ${
                              customer.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : customer.status === "Inactive"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          `}
                        >
                          {customer.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-sm">
                        <a
                          href={customer.shopifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {customer.shopifyUrl}
                        </a>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-sm">
                        <a
                          href={customer.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {customer.storeUrl}
                        </a>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() =>
                              window.open(customer?.storeUrl, "_blank")
                            }
                            disabled={loading}
                            variant="outline"
                            className="cursor-pointer text-black w-full sm:w-auto"
                          >
                            View
                          </Button>
                          <Button
                            onClick={async () => {
                              try {
                                await fetch(
                                  `${
                                    process.env.NEXT_PUBLIC_BACKEND_URL
                                  }/store/env?storeName=${encodeURIComponent(
                                    customer.storeName
                                  )}`,
                                  {
                                    method: "GET",
                                  }
                                );
                              } catch {
                                // ignore
                              } finally {
                                router.push(
                                  `/storeEditor?storeName=${encodeURIComponent(
                                    customer.storeName
                                  )}`
                                );
                              }
                            }}
                            disabled={loading}
                            variant="default"
                            className="bg-blue-600 cursor-pointer text-white w-full sm:w-auto"
                          >
                            Edit
                          </Button>
                          <Button
                            className="bg-blue-600 cursor-pointer text-white w-full sm:w-auto"
                            onClick={() => handleDownload(customer.storeName)}
                            variant="default"
                          >
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-left text-xs sm:text-sm text-muted-foreground px-3 sm:px-4 py-2 sm:py-3"
                  >
                    Total Customers: {stores.length}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
