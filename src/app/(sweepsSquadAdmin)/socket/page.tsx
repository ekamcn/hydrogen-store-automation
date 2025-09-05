"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { io, Socket } from "socket.io-client";
import { useStoreContext } from "@/utils/storeContext";
import { buildStorePayload } from "@/components/common/storefront";

// Define the type for the context payload
interface StorePayload {
  VITE_STORE_TITLE?: string;
  VITE_STORE_NAME?: string;
  VITE_CUSTOMER_SUPPORT_EMAIL?: string;
  VITE_CUSTOMER_SERVICE_PHONE?: string;
  VITE_DOMAIN_NAME?: string;
  VITE_SHOPIFY_EMAIL?: string;
  VITE_SHOPIFY_ADMIN_ACCESS_TOKEN?: string;
  VITE_SHOPIFY_URL?: string;
  VITE_CATEGORY?: string;
  VITE_LANGUAGE?: string;
  VITE_COLOR1?: string;
  VITE_COLOR2?: string;
  VITE_LOGO?: { base64: string; fileName: string };
  VITE_BANNER?: { base64: string; fileName: string };
  VITE_MOBILE_BANNER?: { base64: string; fileName: string };
  VITE_TYPOGRAPHY?: string;
  VITE_COMPANY_NAME?: string;
  VITE_COMPANY_ADDRESS?: string;
  VITE_CHECKOUT_DOMAIN?: string;
  VITE_CHECKOUT_ID?: string;
  VITE_SQUARE_LOGO?: { base64: string; fileName: string };
  VITE_OFFER_ID_TYPE?: string;
  customOfferIds?: Record<string, string | undefined>;
  VITE_DISCOVER_OUR_COLLECTIONS?: string[];
}

// Define the type for storeData
interface StoreData {
  name: string;
  email: string;
  phone: string;
  logoName: string;
  logoType: string;
  logoData?: string;
  // Additional fields from context payload
  storeTitle?: string;
  domainName?: string;
  shopifyEmail?: string;
  shopifyAdminToken?: string;
  shopifyUrl?: string;
  category?: string;
  language?: string;
  primaryColor?: string;
  secondaryColor?: string;
  banner?: string | { base64: string; fileName: string };
  mobileBanner?: string | { base64: string; fileName: string };
  typography?: string;
  companyName?: string;
  companyAddress?: string;
  checkoutDomain?: string;
  checkoutId?: string;
  squareLogo?: string | { base64: string; fileName: string };
  offerIdType?: string;
  customOfferIds?: Record<string, string | undefined>;
  discoverOurCollections?: string[];
}

// Define the type for the socket payload

// Type for message data that's safely serializable
type MessageData = {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | MessageData
    | Array<string | number | boolean | null | undefined | MessageData>;
};

// Default base64 image string (use a real base64 string in production)

// Function to convert a file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64String = reader.result?.toString().split(",")[1];
      resolve(base64String || "");
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function StoreCreator() {
  const { payload: contextPayload } = useStoreContext();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      type: string;
      message: string;
      timestamp: string;
      data?: MessageData;
    }>
  >([]);
  const [shopifyStatus, setShopifyStatus] = useState<{
    authCode?: string;
    authUrl?: string;
    status?: string;
    storeUrl?: string;
    isProcessing: boolean;
  }>({ isProcessing: false });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>("");

  const socketRef = useRef<Socket | null>(null);

  // Handle file input change
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLogoFile(file);
        const base64 = await fileToBase64(file);
        setLogoBase64(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        addMessage("error", "Failed to process logo file");
      }
    }
  };

  // Add message to the list with unique ID generator
  const messageIdRef = useRef(0);
  const addMessage = (type: string, message: string, data?: MessageData) => {
    messageIdRef.current += 1;
    const newMessage = {
      id: `${Date.now()}-${messageIdRef.current}`,
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
      data,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  useEffect(() => {
    const serverUrl = `http://51.112.151.1`;
    socketRef.current = io(serverUrl, {
      transports: ["websocket", "polling"],
      path: "/backend/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      forceNew:true
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Socket.IO connected ✅");
      setIsConnected(true);
      addMessage("system", "Socket.IO connected successfully");
      addMessage(
        "info",
        'Ready to create Shopify store. Click "Create Shopify Store" to begin.'
      );
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected ❌", reason);
      setIsConnected(false);
      addMessage("system", `Socket.IO disconnected: ${reason}`);
    });

    // Server event handlers
    socket.on("shopify:authcode", (data) => {
      console.log("Received shopify:authcode:", data);
      addMessage(
        "shopify:authcode",
        `🔑 Auth Code Received: ${data.authCode || "N/A"}`,
        data
      );
      setShopifyStatus((prev) => ({
        ...prev,
        authCode: data.authCode,
        isProcessing: true,
      }));
    });

    socket.on("shopify:authurl", (data) => {
      console.log("Received shopify:authurl:", data);
      addMessage(
        "shopify:authurl",
        `🔗 Auth URL Generated: ${data.authUrl || "N/A"}`,
        data
      );
      setShopifyStatus((prev) => ({ ...prev, authUrl: data.authUrl }));
      if (typeof data === "string" && data.startsWith("http")) {
        window.open(data, "_blank");
      }
    });

    socket.on("shopify:status", (data) => {
      console.log("Received shopify:status:", data);
      addMessage(
        "shopify:status",
        `📊 Status Update: ${data.status || "Processing..."}`,
        data
      );
      setShopifyStatus((prev) => ({ ...prev, status: data.status }));
    });

    socket.on("shopify:failure", (data) => {
      console.log("Received shopify:failure:", data);
      addMessage(
        "shopify:failure",
        `❌ Process Failed: ${data.message || data.error || "Unknown error"}`,
        data
      );
      setShopifyStatus((prev) => ({ ...prev, isProcessing: false }));
    });

    socket.on("shopify:success", (data) => {
      console.log("Received shopify:success:", data);
      addMessage(
        "shopify:success",
        "✅ Hydrogen theme has been created successfully!",
        data
      );
      setShopifyStatus((prev) => ({ ...prev, isProcessing: false }));
    });

    socket.on("shopify:storeurl", (data) => {
      console.log("Received shopify:storeurl:", data);
      addMessage(
        "shopify:storeurl",
        `🏪 Store URL Ready: ${data.storeUrl || "N/A"}`,
        data
      );
      setShopifyStatus((prev) => ({
        ...prev,
        storeUrl: data.storeUrl,
        isProcessing: false,
      }));
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const createShopifyStore = () => {
    if (socketRef.current && socketRef.current.connected) {
      const storeData = buildStorePayload(contextPayload);
      socketRef.current.emit('shopify:create', JSON.stringify(storeData?.storeData), storeData.imageData);
      console.log('✅ Server response payload:', storeData);
      addMessage('client:sent', '🚀 Shopify store creation request sent to server', storeData as unknown as MessageData);
      addMessage('info', '⏳ Waiting for server response...');
      setShopifyStatus((prev) => ({ ...prev, isProcessing: true }));
    } else {
      console.error("Socket.IO is not connected");
      addMessage("error", "Cannot create store - Socket.IO not connected");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Form Data Display */}
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3">
          📋 Store Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="font-medium text-green-700">Store Name:</span>
            <span className="ml-2 text-gray-700">
              {contextPayload.VITE_STORE_NAME || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">Domain:</span>
            <span className="ml-2 text-gray-700">
              {contextPayload.VITE_DOMAIN_NAME || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">Email:</span>
            <span className="ml-2 text-gray-700">
              {contextPayload.VITE_CUSTOMER_SUPPORT_EMAIL || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">Phone:</span>
            <span className="ml-2 text-gray-700">
              {contextPayload.VITE_CUSTOMER_SERVICE_PHONE || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">Shopify URL:</span>
            <span className="ml-2 text-gray-700">
              {contextPayload.VITE_SHOPIFY_URL || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">Category:</span>
            <span className="ml-2 text-gray-700">
              {contextPayload.VITE_CATEGORY || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">Company:</span>
            <span className="ml-2 text-gray-700">
              {contextPayload.VITE_COMPANY_NAME || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">Checkout Domain:</span>
            <span className="ml-2 text-gray-700">
              {contextPayload.VITE_CHECKOUT_DOMAIN || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700">Logo:</span>
            <span className="ml-2 text-gray-700">
              {contextPayload.VITE_LOGO ? "Uploaded" : "Not uploaded"}
            </span>
          </div>
        </div>
      </div>

      {/* Socket.IO Status */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between">
          <span>Socket.IO Status:</span>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            onClick={createShopifyStore}
            disabled={!isConnected || shopifyStatus.isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {shopifyStatus.isProcessing
              ? "Creating Store..."
              : "🏪 Create Hydrogen Store"}
          </Button>
        </div>
      </div>

      {/* Shopify Process Status */}
      {(shopifyStatus.authCode ||
        shopifyStatus.authUrl ||
        shopifyStatus.status ||
        shopifyStatus.storeUrl ||
        shopifyStatus.isProcessing) && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            🏪 Shopify Process Status
            {shopifyStatus.isProcessing && (
              <div className="ml-2 flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-600 text-sm">Processing...</span>
              </div>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {shopifyStatus.authCode && (
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-blue-700">🔑 Auth Code:</span>
                <br />
                <span className="text-gray-700 font-mono text-xs">
                  {shopifyStatus.authCode}
                </span>
              </div>
            )}
            {shopifyStatus.authUrl && (
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-blue-700">🔗 Auth URL:</span>
                <br />
                <a
                  href={shopifyStatus.authUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs break-all"
                >
                  {shopifyStatus.authUrl}
                </a>
              </div>
            )}
            {shopifyStatus.status && (
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-blue-700">
                  📊 Current Status:
                </span>
                <br />
                <span className="text-gray-700">{shopifyStatus.status}</span>
              </div>
            )}
            {shopifyStatus.storeUrl && (
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-green-700">
                  🎉 Store URL:
                </span>
                <br />
                <a
                  href={shopifyStatus.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline font-medium"
                >
                  {shopifyStatus.storeUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Log */}
      {messages.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">
            Socket.IO Messages
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="text-sm border-l-4 pl-3 py-2 rounded-r"
                style={{
                  borderLeftColor: msg.type.includes("success")
                    ? "#10b981"
                    : msg.type.includes("failure") || msg.type.includes("error")
                    ? "#ef4444"
                    : msg.type.includes("shopify")
                    ? "#3b82f6"
                    : msg.type.includes("client")
                    ? "#8b5cf6"
                    : msg.type.includes("server")
                    ? "#f59e0b"
                    : msg.type === "system"
                    ? "#6b7280"
                    : msg.type === "info"
                    ? "#06b6d4"
                    : "#8b5cf6",
                  backgroundColor: msg.type.includes("success")
                    ? "#f0fdf4"
                    : msg.type.includes("failure") || msg.type.includes("error")
                    ? "#fef2f2"
                    : msg.type.includes("shopify")
                    ? "#eff6ff"
                    : msg.type.includes("client")
                    ? "#faf5ff"
                    : msg.type.includes("server")
                    ? "#fffbeb"
                    : msg.type === "system"
                    ? "#f9fafb"
                    : msg.type === "info"
                    ? "#f0f9ff"
                    : "#f8fafc",
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-700 text-xs">
                    [{msg.timestamp}]
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{
                      color: msg.type.includes("success")
                        ? "#065f46"
                        : msg.type.includes("failure") ||
                          msg.type.includes("error")
                        ? "#991b1b"
                        : msg.type.includes("shopify")
                        ? "#1e40af"
                        : msg.type.includes("client")
                        ? "#6b21a8"
                        : msg.type.includes("server")
                        ? "#92400e"
                        : msg.type === "system"
                        ? "#374151"
                        : msg.type === "info"
                        ? "#0c4a6e"
                        : "#4c1d95",
                      backgroundColor: msg.type.includes("success")
                        ? "#d1fae5"
                        : msg.type.includes("failure") ||
                          msg.type.includes("error")
                        ? "#fee2e2"
                        : msg.type.includes("shopify")
                        ? "#dbeafe"
                        : msg.type.includes("client")
                        ? "#ede9fe"
                        : msg.type.includes("server")
                        ? "#fef3c7"
                        : msg.type === "system"
                        ? "#f3f4f6"
                        : msg.type === "info"
                        ? "#e0f2fe"
                        : "#e7e5e4",
                    }}
                  >
                    {msg.type.toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-800 font-medium">{msg.message}</div>
                {msg.data && typeof msg.data === "object" && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800 font-medium">
                      📋 Show detailed data
                    </summary>
                    <pre className="text-xs bg-gray-50 p-3 rounded mt-1 overflow-x-auto border border-gray-200">
                      {JSON.stringify(msg.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center border-t pt-3">
            <div className="text-xs text-gray-500">
              Total messages: {messages.length}
            </div>
            <Button
              onClick={() => setMessages([])}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🗑️ Clear Messages
            </Button>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <h3 className="font-semibold text-indigo-800 mb-2 flex items-center">
          ℹ️ How it works
        </h3>
        <div className="text-sm text-indigo-700 space-y-1">
          <p>
            <strong>Client Event:</strong>{" "}
            <code className="bg-indigo-100 px-1 rounded">shopify:create</code> -
            Sends store creation request to server
          </p>
          <p>
            <strong>Server Events:</strong> Server responds with multiple events
            during the process:
          </p>
          <ul className="ml-4 space-y-1 text-xs">
            <li>
              •{" "}
              <code className="bg-indigo-100 px-1 rounded">
                shopify:authcode
              </code>{" "}
              - Authentication code received
            </li>
            <li>
              •{" "}
              <code className="bg-indigo-100 px-1 rounded">
                shopify:authurl
              </code>{" "}
              - Authorization URL generated
            </li>
            <li>
              •{" "}
              <code className="bg-indigo-100 px-1 rounded">shopify:status</code>{" "}
              - Status updates during process
            </li>
            <li>
              •{" "}
              <code className="bg-indigo-100 px-1 rounded">
                shopify:success
              </code>{" "}
              - Process completed successfully
            </li>
            <li>
              •{" "}
              <code className="bg-indigo-100 px-1 rounded">
                shopify:failure
              </code>{" "}
              - Process failed
            </li>
            <li>
              •{" "}
              <code className="bg-indigo-100 px-1 rounded">
                shopify:storeurl
              </code>{" "}
              - Final store URL
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
