"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
// import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import SuccessMessage from "@/components/ui/SuccessMessage";
import { exportToCSV } from "@/utils/exportToCSV";

interface PublishSuccessPayload {
  handle?: string;
  title?: string;
  count?: number;
  [key: string]: unknown;
}

interface PublishErrorPayload {
  message?: string;
  handle?: string;
  [key: string]: unknown;
}

export default function ProductPublishSocketPage() {
  const socketRef = useRef<Socket | null>(null);

  const [generalError, setGeneralError] = useState<string>("");
  const [generalSuccess, setGeneralSuccess] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  const [successfulRecords, setSuccessfulRecords] = useState<PublishSuccessPayload[]>([]);
  const [failedRecords, setFailedRecords] = useState<PublishErrorPayload[]>([]);

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
      setIsConnected(true);
      setGeneralError("");
      try {
        const raw = sessionStorage.getItem("publishProductsPayload");
        if (raw) {
          const payload = JSON.parse(raw);
          if (!payload || !Array.isArray(payload.publications) || payload.publications.length === 0) {
            setGeneralError("No publications provided. Please select channels and try again.");
            return;
          }
          console.log("Emitting publish:products with payload:", payload);
          socket.emit("publish:products", payload);
        } else {
          setGeneralError("Missing payload. Please start from the uploader page.");
        }
      } catch {
        setGeneralError("Invalid payload. Please retry from the uploader page.");
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Listen for required events
    socket.on("publish:error", (payload: PublishErrorPayload) => {
      setGeneralError(payload?.message || "An error occurred");
      setFailedRecords((prev) => [
        ...prev,
        { message: payload?.message, handle: payload?.handle },
      ]);
    });

    socket.on("publish:success", (payload: PublishSuccessPayload) => {
      setGeneralSuccess("Products publishing in progress...");
      setSuccessfulRecords((prev) => {
        // de-dup by handle + title if present
        const exists = prev.some(
          (r) => r.handle === payload.handle && r.title === payload.title
        );
        return exists ? prev : [...prev, payload];
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("publish:error");
      socket.off("publish:success");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Publish Products Progress</h1>

      {generalError && <ErrorMessage message={generalError} className="mb-4" />}
      {generalSuccess && <SuccessMessage message={generalSuccess} className="mb-4" />}

      <Card className="p-4 mb-6 bg-blue-50 border-blue-300">
        <div className="flex items-center justify-between">
          <span className="text-blue-800 font-semibold">Socket Status</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </Card>

      {successfulRecords.length > 0 && (
        <Card className="p-6 mb-6 border-green-200 bg-green-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-green-800">
              Successful Products ({successfulRecords.length})
            </h3>
            <Button
              onClick={() => exportToCSV(successfulRecords, "successful-products")}
              variant="outline"
              className="text-green-600 border-green-300 hover:bg-green-100"
            >
              Download Successful (CSV)
            </Button>
          </div>
          <div className="overflow-x-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-green-700">Title</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-green-700">Handle</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-green-700">Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {successfulRecords.slice(0, 5).map((record, idx) => (
                  <tr key={`${record.handle}-${idx}`} className="hover:bg-green-50">
                    <td className="px-3 py-2 text-sm text-gray-600">{record.title || "-"}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{record.handle || "-"}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{record.count ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {successfulRecords.length > 5 && (
              <p className="mt-2 text-xs text-gray-500 italic">
                Showing {successfulRecords.length} successful records. Download the CSV for complete details.
              </p>
            )}
          </div>
        </Card>
      )}

      {failedRecords.length > 0 && (
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-red-800">
              Failed Products ({failedRecords.length})
            </h3>
            <Button
              onClick={() => exportToCSV(failedRecords, "failed-products")}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Download Failed (CSV)
            </Button>
          </div>
          <div className="overflow-x-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Handle</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Error</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {failedRecords.slice(0, 5).map((record, idx) => (
                  <tr key={`${record.handle}-${idx}`} className="hover:bg-red-50">
                    <td className="px-3 py-2 text-sm text-gray-600">{record.handle || "-"}</td>
                    <td className="px-3 py-2 text-sm text-red-600 max-w-md">
                      {record.message && record.message.length > 100
                        ? `${record.message.substring(0, 100)}...`
                        : record.message || "Unknown error"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {failedRecords.length > 5 && (
              <p className="mt-2 text-xs text-gray-500 italic">
                Showing first 5 of {failedRecords.length} failed records. Download the CSV for complete details.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

