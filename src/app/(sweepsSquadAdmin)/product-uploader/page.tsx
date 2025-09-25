"use client";

import React, { useState, useEffect, useRef } from "react";
// import FileUpload from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SuccessMessage from "@/components/ui/SuccessMessage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { exportToCSV } from "@/utils/exportToCSV";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface Publication {
  id: string;
  name: string;
}
interface CSVRowData {
  title: string;
  description: string;
  handle: string;
  match_any: boolean;
  type: string;
  operator: string;
  value: string | number | boolean;
  image_src: string;
}

interface FailedCollectionRecord extends CSVRowData, Record<string, unknown> {
  error: string;
}

export default function CsvCollectionPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [selectedPublications, setSelectedPublications] = useState<
    Array<{ publicationId: string; publicationName: string }>
  >([]);
  const [apiErrors, setApiErrors] = useState<{ [key: string]: string }>({});
  const [csvData] = useState<CSVRowData[]>([]);
  const [failedRecords, setFailedRecords] = useState<FailedCollectionRecord[]>(
    []
  );
  const [processingStatus, setProcessingStatus] = useState<{
    total: number;
    processed: number;
    successful: number;
    failed: number;
  }>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
  });
  const [stores, setStores] = useState<
    Array<{ store_id: string; storeName: string }>
  >([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [selectedStoreName, setSelectedStoreName] = useState<string>("");
  // const [shopifyAdminToken, setShopifyAdminToken] = useState<string>("");
  // const [shopifyUrl, setShopifyUrl] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

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
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Load stores list
  useEffect(() => {
    const loadStores = async () => {
      try {
        setIsLoadingStores(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/store/all`
        );
        if (!res.ok) throw new Error("Failed to fetch store data");
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
        setStores([]);
      } finally {
        setIsLoadingStores(false);
      }
    };
    loadStores();
  }, []);

  useEffect(() => {
    const run = async () => {
      let shopifyAdminToken = "";
      let shopifyUrl = "";
      let shopifyLink = "";

      if (!selectedStoreName) return;

      try {
        const envResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL
          }/store/env?storeName=${encodeURIComponent(selectedStoreName)}`
        );
        const envData = await envResponse.json();
        console.log("envData", envData);

        shopifyAdminToken = envData?.data?.shopifyAdminToken || "";
        shopifyUrl = envData?.data?.shopifyUrl || "";

        shopifyLink = shopifyUrl.startsWith("https://")
          ? shopifyUrl
          : "https://" + shopifyUrl;
      } catch {
        // ignore
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/get-publications?shopifyUrl=${shopifyLink}&shopifyAdminToken=${shopifyAdminToken}`
        );
        if (!response.ok) throw new Error("Failed to fetch publications");

        const data = await response.json();
        const pubs: Publication[] = (data?.data?.publications?.edges || []).map(
          (edge: { node: { id: string; name: string } }) => ({
            id: edge?.node?.id,
            name: edge?.node?.name,
          })
        );

        setPublications(pubs);
        setSelectedPublications(
          pubs.map((p) => ({
            publicationId: p.id,
            publicationName: p.name,
          }))
        );
      } catch (err) {
        setPublications([]);
        setSelectedPublications([]);
        setApiErrors((prev) => ({
          ...prev,
          publications:
            (err as Error)?.message || "Failed to load publications",
        }));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [selectedStoreName]);

  const handlePublicationToggle = (publication: {
    publicationId: string;
    publicationName: string;
  }) => {
    console.log("Toggling publication:", publication);
    setSelectedPublications((prev) => {
      const exists = prev.some(
        (p) => p.publicationId === publication.publicationId
      );
      console.log("Publication exists:", exists, "Current publications:", prev);

      if (exists) {
        const filtered = prev.filter(
          (p) => p.publicationId !== publication.publicationId
        );
        console.log("Removed publication, new list:", filtered);
        return filtered;
      } else {
        const added = [...prev, publication];
        console.log("Added publication, new list:", added);
        return added;
      }
    });
  };

  console.log(selectedPublications, "selectedPublications");

  const selectAllPublications = () => {
    const allPublicationIds = publications.map((pub: Publication) => ({
      publicationId: pub.id,
      publicationName: pub.name,
    }));
    setSelectedPublications(allPublicationIds);
  };

  const deselectAllPublications = () => {
    setSelectedPublications([]);
  };

  const processCSV = async () => {
    if (!selectedStoreName) {
      setError("Please select a store");
      return;
    }
    if (selectedPublications.length === 0) {
      setError("Please select at least one publication channel");
      return;
    }

    console.log("Processing with publications:", selectedPublications);

    // Reset states
    setLoading(true);
    setError("");
    setSuccess("");
    setApiErrors({});
    setFailedRecords([]);
    setProcessingStatus({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
    });

    try {
      // Save minimal payload and navigate to socket page to handle emitting and UI
      const payload = {
        storeName: selectedStoreName,
        publications: selectedPublications,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "publishProductsPayload",
          JSON.stringify(payload)
        );
      }
      router.push("/product-publish");
    } catch (err) {
      setError((err as Error).message || "Failed to start publish process");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 ">
      <h1 className="text-3xl font-bold mb-6">Create Products from CSV</h1>

      {/* Store Select */}
      <Card className="p-6 mb-6">
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium mb-2">
            Select Store
          </label>
          <select
            id="storeName"
            className="w-full border rounded-md h-10 px-3 text-sm"
            value={selectedStoreName}
            onChange={(e) => setSelectedStoreName(e.target.value)}
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
      </Card>

      {error && <ErrorMessage message={error} className="mb-4" />}
      {success && <SuccessMessage message={success} className="mb-4" />}

      {Object.keys(apiErrors).length > 0 && (
        <Card className="p-4 mb-6 bg-yellow-50 border-yellow-300">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            API Errors:
          </h3>
          <div className="space-y-3">
            {Object.entries(apiErrors).map(([key, message]) => (
              <div key={key} className="border-l-4 border-yellow-700 pl-4">
                <h4 className="font-medium text-yellow-900">{key}:</h4>
                <pre className="text-sm whitespace-pre-wrap text-yellow-700 bg-yellow-50 p-2 rounded overflow-auto max-h-40">
                  {message}
                </pre>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-yellow-700">
            <p className="font-medium">Common issues:</p>
            <ul className="list-disc pl-5">
              <li>
                Relation values must be uppercase (e.g., &quot;EQUALS&quot;
                instead of &quot;equals&quot;)
              </li>
              <li>
                Column values must be valid Shopify fields (TITLE, VENDOR, TAG,
                etc.)
              </li>
              <li>Handle must be unique and URL-friendly</li>
            </ul>
          </div>
        </Card>
      )}

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Publication Channels</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {selectedPublications.length} of {publications.length} selected
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Select the channels where you want to publish these products:
        </p>

        {publications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {publications.map((pub) => (
              // console.log("Rendering publication:", pub),
              <div
                key={pub.id}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  handlePublicationToggle({
                    publicationId: pub.id,
                    publicationName: pub.name,
                  })
                }
              >
                <input
                  type="checkbox"
                  id={pub.id}
                  checked={selectedPublications.some(
                    (p) => p.publicationId === pub.id
                  )}
                  onChange={() => {}} // Handled by parent div onClick
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={pub.id}
                  className="text-sm cursor-pointer select-none"
                >
                  {pub.name}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p>
            {loading ? "Loading publications..." : "No publications available"}
          </p>
        )}

        <div className="flex space-x-2 mt-4">
          <Button
            onClick={selectAllPublications}
            disabled={loading}
            className="flex-1 bg-black"
          >
            Select All
          </Button>
          <Button
            onClick={deselectAllPublications}
            disabled={loading}
            variant="outline"
            className="flex-1 text-black"
          >
            Deselect All
          </Button>
        </div>
      </Card>

      {csvData.length > 0 && (
        <Card className="p-6 mb-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">CSV Data Preview</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(csvData[0]).map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {csvData.slice(0, 5).map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map(
                    (
                      value: string | number | boolean | null | undefined,
                      valIdx
                    ) => (
                      <td
                        key={valIdx}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {value?.toString() || "-"}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {csvData.length > 5 && (
            <p className="mt-2 text-sm text-gray-500">
              Showing first 5 of {csvData.length} rows
            </p>
          )}
        </Card>
      )}

      {processingStatus.total > 0 && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-300">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Processing Status:
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-sm text-gray-600">Total Collections</p>
              <p className="text-xl font-medium">{processingStatus.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-xl font-medium">
                {processingStatus.successful}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-xl font-medium">{processingStatus.failed}</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${
                  (processingStatus.processed / processingStatus.total) * 100
                }%`,
              }}
            ></div>
          </div>

          {failedRecords.length > 0 && (
            <div className="mt-4">
              <Button
                onClick={() => exportToCSV(failedRecords, "failed-collections")}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Download Failed Records (CSV)
              </Button>
              <p className="mt-2 text-sm text-blue-700">
                Download failed records to fix errors and re-upload. The CSV
                includes error details for each failed collection.
              </p>
            </div>
          )}
        </Card>
      )}

      {failedRecords.length > 0 && (
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-red-800">
              Failed Collections ({failedRecords.length})
            </h2>
            <Button
              onClick={() => exportToCSV(failedRecords, "failed-collections")}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Download Failed Records (CSV)
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">
              The following collections could not be created. Download the CSV
              file to fix the errors and re-upload.
            </p>
            <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
              <li>Download the CSV file using the button above</li>
              <li>
                Each failed record includes an{" "}
                <code className="bg-red-100 px-1 rounded">error</code> column
                with details about what went wrong
              </li>
              <li>
                Fix the issues in your spreadsheet program (Excel, Google
                Sheets, etc.)
              </li>
              <li>Save as CSV and re-upload to try again</li>
            </ol>
          </div>

          <div className="overflow-x-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">
                    Title
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">
                    Handle
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-red-700">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {failedRecords.slice(0, 5).map((record, idx) => (
                  <tr key={idx} className="hover:bg-red-50">
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {record.title || "-"}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {record.handle || "-"}
                    </td>
                    <td className="px-3 py-2 text-sm text-red-600 max-w-md">
                      {record.error && record.error.length > 100
                        ? `${record.error.substring(0, 100)}...`
                        : record.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {failedRecords.length > 5 && (
              <p className="mt-2 text-xs text-gray-500 italic">
                Showing first 5 of {failedRecords.length} failed records.
                Download the CSV for complete details.
              </p>
            )}
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          onClick={processCSV}
          disabled={
            loading || !selectedStoreName || selectedPublications.length === 0
          }
          className="flex items-center bg-[#ababab]"
        >
          {loading ? <LoadingSpinner className="mr-2" /> : null}
          {loading ? "Processing..." : "Create & Publish Products"}
        </Button>
      </div>
    </div>
  );
}
