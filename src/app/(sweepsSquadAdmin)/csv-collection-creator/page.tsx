"use client";

import React, { useState, useEffect } from "react";
import FileUpload from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SuccessMessage from "@/components/ui/SuccessMessage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { parseCsvToJson } from "@/utils/parseCSV";
import { exportToCSV } from "@/utils/exportToCSV";
import { CloudCog } from "lucide-react";
import { StoreSelect } from "@/components/common/storefront";

interface Store {
  store_id: string;
  storeName: string;
  storeUrl: string;
  status: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: {
    code?: string;
    problems?: Array<{
      path: string[];
      explanation: string;
    }>;
  };
}

interface Publication {
  id: string;
  name: string;
}

interface CollectionRules {
  column: string;
  relation: string;
  condition: string;
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
  const [file, setFile] = useState<File | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [selectedPublications, setSelectedPublications] = useState<string[]>(
    []
  );
  const [selectedPublicationName, setSelectedPublicationName] = useState<
    string[]
  >([]);

  const [apiErrors, setApiErrors] = useState<{ [key: string]: string }>({});
  const [csvData, setCsvData] = useState<CSVRowData[]>([]);
  const [failedRecords, setFailedRecords] = useState<FailedCollectionRecord[]>(
    []
  );
  const [publicationId, setPublicationId] = useState<string>("");
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
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Fetch publications on component mount
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/get-publications");

        if (!response.ok) {
          const errorData = await response.json();
          if (
            typeof errorData === "object" &&
            errorData !== null &&
            "message" in errorData
          ) {
            throw new Error(
              (errorData as { message?: string }).message ||
                "Failed to fetch publications"
            );
          } else {
            throw new Error("Failed to fetch publications");
          }
        }

        const data = await response.json();
        if (
          typeof data === "object" &&
          data !== null &&
          "data" in data &&
          (data as any).data.publications
        ) {
          const publicationsData = (data as any).data.publications.edges.map(
            (edge: { node: { id: string; name: string } }) => ({
              id: edge.node.id,
              name: edge.node.name,
            })
          );
          setPublications(publicationsData);

          // Select all publications by default
          const allPublicationIds = publicationsData.map(
            (pub: Publication) => pub.id
          );

          const allPublicationsName = publicationsData.map(
            (pub: Publication) => pub.name
          );
          console.log(allPublicationsName, "all");
          console.log("Selecting all publications:", allPublicationIds);
          setSelectedPublications(allPublicationIds);
          setSelectedPublicationName(allPublicationsName);
        } else {
          setPublications([]);
        }
      } catch (error) {
        console.error("Error fetching publications:", error);
        setError("Failed to load publications. Please try again later.");
        setApiErrors((prev) => ({
          ...prev,
          publications:
            (error as Error).message || "Failed to load publications",
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError("");
    setApiErrors({});
  };

  const handlePublicationToggle = (
    publicationId: string,
    publicationName: string
  ) => {
    setSelectedPublications((prev) => {
      if (prev.includes(publicationId)) {
        return prev.filter((id) => id !== publicationId);
      } else {
        return [...prev, publicationId];
      }
    });

    setSelectedPublicationName((prev) => {
      if (prev.includes(publicationName)) {
        return prev.filter((name) => name !== publicationName);
      } else {
        return [...prev, publicationName];
      }
    });
  };

  // Helper functions for selecting/deselecting all publications
  const selectAllPublications = () => {
    const allPublicationIds = publications.map((pub: Publication) => pub.id);
    const allPublicationNames = publications.map(
      (pub: Publication) => pub.name
    );
    setSelectedPublications(allPublicationIds);
    setSelectedPublicationName(allPublicationNames);
  };

  const deselectAllPublications = () => {
    setSelectedPublications([]);
    setSelectedPublicationName([]);
  };

  const processCSV = async () => {
    // Validate input
    if (!selectedStore) {
      setError("Please select a store (theme) before proceeding.");
      return;
    }
    if (!file) {
      setError("Please upload a CSV file");
      return;
    }
    if (selectedPublications.length === 0) {
      setError("Please select at least one publication channel");
      return;
    }

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
      // Parse CSV file using the utility function
      const parsedCsvData = await parseCsvToJson(file);

      if (!parsedCsvData || parsedCsvData.length < 1) {
        throw new Error("CSV file must contain at least one row of data");
      }

      setCsvData(parsedCsvData);

      // Get selected publication names
      const selectedPublicationNames = selectedPublications
        .map((pubId) => {
          const pub = publications.find((p) => p.id === pubId);
          return pub ? pub.name : null;
        })
        .filter((name): name is string => name !== null);

      console.log("Selected Publication IDs:", selectedPublications);
      console.log("Selected Publication Names:", selectedPublicationNames);

      // Create collections and rules using the data from CSV
      const collectionsData = parsedCsvData.map((row: CSVRowData) => {
        const formatRelation = (relation: string): string => {
          const operatorMap: { [key: string]: string } = {
            equals: "EQUALS",
            equal: "EQUALS",
            eq: "EQUALS",
            contains: "CONTAINS",
            include: "CONTAINS",
            includes: "CONTAINS",
            "greater than": "GREATER_THAN",
            "less than": "LESS_THAN",
            greater_than: "GREATER_THAN",
            less_than: "LESS_THAN",
            gt: "GREATER_THAN",
            lt: "LESS_THAN",
            "starts with": "STARTS_WITH",
            "ends with": "ENDS_WITH",
            "begins with": "STARTS_WITH",
            "start with": "STARTS_WITH",
            "end with": "ENDS_WITH",
            "not equals": "NOT_EQUALS",
            "not equal": "NOT_EQUALS",
            "not contain": "NOT_CONTAINS",
            "not contains": "NOT_CONTAINS",
            "is set": "IS_SET",
            "is not set": "IS_NOT_SET",
            isset: "IS_SET",
            isnotset: "IS_NOT_SET",
          };

          if (/^[A-Z_]+$/.test(relation)) {
            return relation;
          }

          return (
            operatorMap[relation.toLowerCase()] ||
            relation.toUpperCase().replace(/\s+/g, "_")
          );
        };

        const rules: CollectionRules[] = [
          {
            column: row.type?.toUpperCase() || "TITLE",
            relation: formatRelation(row.operator || "CONTAINS"),
            condition: String(row.value || "PRODUCT"),
          },
        ];
        console.log(selectedPublicationName, "publicatonName");

        const collectionInput = {
          title: row.title,
          handle: row.handle,
          descriptionHtml:
            row.description || "Collection created from CSV import",
          sortOrder: "BEST_SELLING",
          ruleSet: {
            appliedDisjunctively: row.match_any === true,
            rules: rules,
          },
          image_src: row.image_src,
          metafields: [
            {
              namespace: "custom",
              key: "theme_types",
              value: selectedPublicationName.join("-"), // Use selectedPublicationName array
              type: "single_line_text_field",
            },
          ],
        };

        console.log(`Collection Input for row ${row.title}:`, collectionInput);

        return collectionInput;
      });

      console.log("Collections Data to Process:", collectionsData);

      // Set initial processing status with total count
      setProcessingStatus((prev) => ({
        ...prev,
        total: collectionsData.length,
        processed: 0,
        successful: 0,
        failed: 0,
      }));

      // Process each collection creation in sequence
      for (const [index, collectionInput] of collectionsData.entries()) {
        try {
          console.log(
            `Processing collection ${index + 1}:`,
            collectionInput.title
          );

          // Create collection
          const createResponse = await fetch("/api/create-collection", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              collectionInput,
              publicationName: selectedPublicationName,
            }),
          });

          if (!createResponse.ok) {
            const errorData: any = await createResponse.json();
            let errorMessage =
              errorData?.error || "Failed to create collection";

            if (errorData?.details && Array.isArray(errorData.details)) {
              const formattedErrors = errorData.details
                .map((err: { message?: string; field?: string }) => {
                  if (typeof err.message === "string") {
                    if (typeof err.field === "string") {
                      return `${err.field}: ${err.message}`;
                    }
                    return err.message;
                  }
                  return JSON.stringify(err);
                })
                .join("\n");

              errorMessage = `${errorMessage}\n${formattedErrors}`;

              if (errorData?.details[0]?.extensions?.problems) {
                const problems = errorData.details[0].extensions.problems;
                const problemPaths = problems
                  .map(
                    (p: { path: string[]; explanation: string }) =>
                      `${p.path.join(".")}: ${p.explanation}`
                  )
                  .join("\n");
                errorMessage += `\n${problemPaths}`;
              }
            }

            console.error(
              `Error creating collection ${index + 1}:`,
              errorMessage
            );

            if (errorData?.processedInput) {
              console.log(
                `Retrying with processed input for collection ${index + 1}:`,
                errorData.processedInput
              );

              const retryResponse = await fetch("/api/create-collection", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  collectionInput: errorData.processedInput,
                }),
              });

              if (retryResponse.ok) {
                const retryData: any = await retryResponse.json();
                if (
                  !retryData?.errors &&
                  !retryData?.data?.collectionCreate?.userErrors?.length
                ) {
                  console.log(`Retry succeeded for collection ${index + 1}`);
                  return retryData;
                }
              }
            }

            setApiErrors((prev) => ({
              ...prev,
              createCollection: errorMessage,
            }));

            setProcessingStatus((prev) => ({
              ...prev,
              processed: index + 1,
              failed: prev.failed + 1,
            }));

            setFailedRecords((prev) => [
              ...prev,
              {
                ...parsedCsvData[index],
                error: errorMessage,
              },
            ]);

            throw new Error(errorMessage);
          }
  
          const createData: any = await createResponse.json();
  
          if (createData?.data?.collectionCreate?.userErrors?.length > 0) {
            const errors = createData.data.collectionCreate.userErrors;
            const errorMsg = errors
              .map(
                (err: { field?: string; message: string }) =>
                  `${err.field || "unknown"}: ${err.message}`
              )
              .join(", ");
            console.error(
              `Shopify API Error for collection ${index + 1}:`,
              errorMsg
            );

            setApiErrors((prev) => ({
              ...prev,
              shopifyErrors: errorMsg,
            }));

            setProcessingStatus((prev) => ({
              ...prev,
              processed: index + 1,
              failed: prev.failed + 1,
            }));

            setFailedRecords((prev) => [
              ...prev,
              {
                ...parsedCsvData[index],
                error: `Shopify API Error: ${errorMsg}`,
              },
            ]);

            throw new Error(`Shopify API Error: ${errorMsg}`);
          }

          if (createData?.errors?.length > 0) {
            const errorMsg = createData.errors
              .map((err: GraphQLError) => err.message)
              .join(", ");
            console.error(
              `GraphQL Error for collection ${index + 1}:`,
              errorMsg
            );

            setApiErrors((prev) => ({
              ...prev,
              graphqlErrors: errorMsg,
            }));

            setProcessingStatus((prev) => ({
              ...prev,
              processed: index + 1,
              failed: prev.failed + 1,
            }));

            setFailedRecords((prev) => [
              ...prev,
              {
                ...parsedCsvData[index],
                error: `GraphQL Error: ${errorMsg}`,
              },
            ]);

            throw new Error(`GraphQL Error: ${errorMsg}`);
          }

          const collectionId = createData.data.collectionCreate.collection.id;
          console.log(`Created collection ${index + 1} with ID:`, collectionId);

          // Publish collection to selected channels
          const failedPublications: Array<{ id: string; error: string }> = [];
          const publishPromises = selectedPublications.map(async (publicationId) => {
            try {
              console.log(
                `Publishing collection ${collectionId} to publication ${publicationId}`
              );
              const response = await fetch("/api/publish-collection", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  collectionId,
                  publicationId,
                }),
              });
  
              if (!response.ok) {
                const errorData: any = await response.json();
                const errorMessage = errorData?.error || "Unknown error";
                console.error(
                  `Error publishing to publication ${publicationId}:`,
                  errorMessage
                );
                failedPublications.push({
                  id: publicationId,
                  error: errorMessage,
                });
                return false;
              }
  
              const publishData: any = await response.json();
              if (publishData?.data?.publishablePublish?.userErrors?.length > 0) {
                const errors = publishData.data.publishablePublish.userErrors;
                const errorMsg = errors
                  .map(
                    (err: { field?: string; message: string }) =>
                      `${err.field || "unknown"}: ${err.message}`
                  )
                  .join(", ");
                console.error(
                  `Publish API Error for publication ${publicationId}:`,
                  errorMsg
                );
                failedPublications.push({
                  id: publicationId,
                  error: errorMsg,
                });
                return false;
              }
  
              console.log(
                `Successfully published collection ${collectionId} to publication ${publicationId}`
              );
              return true;
            } catch (error) {
              const errorMessage = (error as Error).message || "Unknown error";
              console.error(
                `Error publishing to publication ${publicationId}:`,
                errorMessage
              );
              failedPublications.push({
                id: publicationId,
                error: errorMessage,
              });
              return false;
            }
          );

          const publishResults = await Promise.all(publishPromises);
          const successfulPublications = publishResults.filter(Boolean).length;

          setProcessingStatus((prev) => ({
            ...prev,
            total: collectionsData.length,
            processed: index + 1,
            successful:
              successfulPublications > 0
                ? prev.successful + 1
                : prev.successful,
            failed:
              successfulPublications === 0 ? prev.failed + 1 : prev.failed,
          }));

          if (failedPublications.length > 0) {
            const failedPublicationNames = failedPublications.map((fp) => {
              const pub = publications.find((p) => p.id === fp.id);
              return pub ? pub.name : fp.id;
            });
            console.warn(
              `Failed to publish collection ${index + 1} to:`,
              failedPublicationNames
            );

            setApiErrors((prev) => ({
              ...prev,
              publishCollection: `Failed to publish to: ${failedPublicationNames.join(
                ", "
              )}`,
            }));

            if (successfulPublications > 0) {
              setSuccess(
                `Processed ${index + 1} of ${
                  collectionsData.length
                } collections. Collection created with ${successfulPublications} of ${
                  selectedPublications.length
                } publications successful.`
              );
            } else {
              setError(
                `Processed ${index + 1} of ${
                  collectionsData.length
                } collections. Collection created but failed to publish to any channel.`
              );
            }
          } else {
            setSuccess(
              `Processed ${index + 1} of ${
                collectionsData.length
              } collections. ${
                processingStatus.successful + 1
              } created and published successfully!`
            );
          }
        } catch (error) {
          console.error(`Error processing collection ${index + 1}:`, error);
          setError((error as Error).message || "Failed to process collection");

          setProcessingStatus((prev) => ({
            ...prev,
            processed: index + 1,
            failed: prev.failed,
          }));
        }
      }
    } catch (error) {
      console.error("Error processing CSV:", error);
      setError((error as Error).message || "Failed to process collection");
    } finally {
      setProcessingStatus((prevStatus) => {
        if (prevStatus.failed === 0 && prevStatus.successful > 0) {
          setSuccess(
            `Processed all ${prevStatus.total} collections successfully!`
          );
        } else {
          setSuccess(
            `Processed ${prevStatus.total} collections: ${prevStatus.successful} successful, ${prevStatus.failed} failed.`
          );
        }
        return prevStatus;
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 ">
      <h1 className="text-3xl font-bold mb-6">Create Collection from CSV</h1>
      {/* Store Select Box */}
      <StoreSelect onSelect={setSelectedStore} />

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
        <FileUpload
          id="csv-upload"
          label="Upload CSV File"
          accept=".csv"
          onFileSelect={handleFileSelect}
          required
          helpText="Upload a CSV file containing product rules for the collection."
          className="mb-6"
        />
      </Card>

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Publication Channels</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {selectedPublications.length} of {publications.length} selected
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Select the channels where you want to publish this collection:
        </p>

        {publications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {publications.map((pub) => (
              // console.log("Rendering publication:", pub),
              <div
                key={pub.id}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => handlePublicationToggle(pub.id, pub.name)}
              >
                <input
                  type="checkbox"
                  id={pub.id}
                  checked={selectedPublications.includes(pub.id)}
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
          disabled={loading || !file || selectedPublications.length === 0}
          className="flex items-center bg-[#ababab]"
        >
          {loading ? <LoadingSpinner className="mr-2" /> : null}
          {loading ? "Processing..." : "Create & Publish Collections"}
        </Button>
      </div>
    </div>
  );
}
