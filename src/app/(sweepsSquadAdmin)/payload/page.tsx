'use client';
import { useEffect, useRef, useState } from 'react';
import { useStoreContext, createEmptyPayload, StorePayload } from '@/utils/storeContext';
import { Button } from '@/components/ui/button';
import { Socket ,io } from 'socket.io-client';
import { buildStorePayload, DEFAULT_IMAGE_DATA } from '@/components/common/storefront';
// Type for message data that's safely serializable
type MessageData = {
  [key: string]: string | number | boolean | null | undefined | MessageData | Array<string | number | boolean | null | undefined | MessageData>;
};

export default function PayloadPage() {
  const { payload } = useStoreContext();
  

  // Initialize local payload from localStorage first
  const [localPayload, setLocalPayload] = useState<StorePayload>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('store-payload');
      if (stored) {
        try {
          return JSON.parse(stored) as StorePayload;
        } catch (err) {
          console.error('Invalid payload in localStorage:', err);
          return createEmptyPayload();
        }
      }
    }
    return createEmptyPayload();
  });

  
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    data?: MessageData;
  }>>([]);
  const [shopifyStatus, setShopifyStatus] = useState<{
    authCode?: string;
    authUrl?: string;
    status?: string;
    storeUrl?: string;
    isProcessing: boolean;
  }>({ isProcessing: false });


  const socketRef = useRef<Socket | null>(null);

  // Add message to the list with unique ID generator
  const messageIdRef = useRef(0);
  const addMessage = (type: string, message: string, data?: MessageData) => {
    messageIdRef.current += 1;
    const newMessage = {
      id: `${Date.now()}-${messageIdRef.current}`,
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
      data
    };
    setMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
        // const serverUrl = "${process.env.NEXT_PUBLIC_BACKEND_URL}";
    const serverUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });

    const socket = socketRef.current;
    console.log('Connecting to Socket.IO server at:', serverUrl);
    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket.IO connected ✅');
      setIsConnected(true);
      addMessage('system', 'Socket.IO connected successfully');
      addMessage('info', 'Ready to create Shopify store. Click "Create Shopify Store" to begin.');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected ❌', reason);
      setIsConnected(false);
      addMessage('system', `Socket.IO disconnected: ${reason}`);
    });


    // Server event handlers - These are events sent FROM server TO client
    socket.on('shopify:authcode', (data) => {
      console.log('Received shopify:authcode:', data);
      addMessage('shopify:authcode', `🔑 Auth Code Received: ${data.authCode || 'N/A'}`, data);
      setShopifyStatus(prev => ({ ...prev, authCode: data.authCode, isProcessing: true }));
    });

    socket.on('shopify:authurl', (data) => {
      console.log('Received shopify:authurl:', data);

      addMessage('shopify:authurl', `🔗 Auth URL Generated: ${data || 'N/A'}`, data);
      setShopifyStatus(prev => ({ ...prev, authUrl: data }));

     // ✅ Open auth URL in a new tab
      if (typeof data === 'string' && data.startsWith('http')) {
        window.open(data, '_blank');
      }
    });


    socket.on('shopify:status', (data) => {
      console.log('Received shopify:status:', data);
      addMessage('shopify:status', `📊 Status Update: ${data.status || 'Processing...'}`, data);
      setShopifyStatus(prev => ({ ...prev, status: data.status }));
    });

    socket.on('shopify:failure', (data) => {
      console.log('Received shopify:failure:', data);
      addMessage('shopify:failure', `❌ Process Failed: ${data.message || data.error || 'Unknown error'}`, data);
      setShopifyStatus(prev => ({ ...prev, isProcessing: false }));
    });

    socket.on('shopify:success', (data) => {
      console.log('Received shopify:success:', data);
      addMessage('shopify:success', `✅ Process Completed Successfully!`, data);
      setShopifyStatus(prev => ({ ...prev, isProcessing: false }));
    localStorage.removeItem('store-payload');
    setLocalPayload(createEmptyPayload());
  });

    socket.on('shopify:storeurl', (data) => {
      console.log('Received shopify:storeurl:', data);
      addMessage('shopify:storeurl', `🏪 Store URL Ready: ${data.storeUrl || 'N/A'}`, data);
      setShopifyStatus(prev => ({ ...prev, storeUrl: data.storeUrl, isProcessing: false }));
    });



    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

// useEffect(() => {
//   // Function to create Shopify store - This sends the main event to server
  
//   };
  
//   // Only create store if we have payload data and socket is connected
//   if (Object.keys(localPayload || {}).length > 0 && isConnected) {
//     createShopifyStore();
//   }
// },[localPayload, payload, isConnected]);

  // Save to localStorage when payload is updated (only if it has meaningful data)
 
 const createShopifyStore = () => {
    if (socketRef.current && socketRef.current.connected) {
      const storeData = buildStorePayload(localPayload);
      socketRef.current.emit('shopify:create', JSON.stringify(storeData?.storeData), storeData.imageData ??  DEFAULT_IMAGE_DATA);
      console.log('🚀 Sent shopify:create event to server with payload:', storeData);
      addMessage('client:sent', '🚀 Shopify store creation request sent to server', storeData as unknown as MessageData);
      addMessage('info', '⏳ Waiting for server response...');
      setShopifyStatus((prev) => ({ ...prev, isProcessing: true }));
    } else {
      console.error('Socket.IO is not connected');
      addMessage('error', 'Cannot create store - Socket.IO not connected');
    }
  }
 
  useEffect(() => {
    // Check if payload has any non-empty values
    const hasData = payload && Object.values(payload).some(value => 
      value !== undefined && value !== null && value !== ''
    );
    
    if (hasData) {
      localStorage.setItem('store-payload', JSON.stringify(payload));
      setLocalPayload(payload);
      console.log('Payload updated and saved to localStorage:', payload);
    }
  }, [payload]);



  return (
    <div className="p-3">
      {/* <h1 className="text-xl font-semibold mb-4">Payload Preview</h1>
      {Object.keys(localPayload).length > 0 ? (
        <>
          <pre className="bg-gray-100 p-4 rounded text-sm">{JSON.stringify(localPayload, null, 2)}</pre>
        </>
      ) : (
        <p className="text-gray-500">No payload available.</p>
      )} */}
       {/* Socket.IO Status */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between">
          <span>Socket.IO Status:</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            onClick={createShopifyStore}
            disabled={!isConnected || shopifyStatus.isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {shopifyStatus.isProcessing ? 'Creating Store...' : '🏪 Create Shopify Store'}
          </Button>

        </div>
      </div>

      {/* Shopify Process Status */}
      {(shopifyStatus.authCode || shopifyStatus.authUrl || shopifyStatus.status || shopifyStatus.storeUrl || shopifyStatus.isProcessing) && (
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
                <span className="text-gray-700 font-mono text-xs">{shopifyStatus.authCode}</span>
              </div>
            )}
            {shopifyStatus.authUrl && (
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-blue-700">🔗 Auth URL:</span>
                <br />
                <a href={shopifyStatus.authUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs break-all">
                  {shopifyStatus.authUrl}
                </a>
              </div>
            )}
            {shopifyStatus.status && (
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-blue-700">📊 Current Status:</span>
                <br />
                <span className="text-gray-700">{shopifyStatus.status}</span>
              </div>
            )}
            {shopifyStatus.storeUrl && (
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-green-700">🎉 Store URL:</span>
                <br />
                <a href={shopifyStatus.storeUrl} target="_blank" rel="noopener noreferrer"
                  className="text-green-600 hover:underline font-medium">
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
          <h3 className="font-semibold text-gray-800 mb-2">Socket.IO Messages</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm border-l-4 pl-3 py-2 rounded-r"
                style={{
                  borderLeftColor:
                    msg.type.includes('success') ? '#10b981' :
                      msg.type.includes('failure') || msg.type.includes('error') ? '#ef4444' :
                        msg.type.includes('shopify') ? '#3b82f6' :
                          msg.type.includes('client') ? '#8b5cf6' :
                            msg.type.includes('server') ? '#f59e0b' :
                              msg.type === 'system' ? '#6b7280' :
                                msg.type === 'info' ? '#06b6d4' :
                                  '#8b5cf6',
                  backgroundColor:
                    msg.type.includes('success') ? '#f0fdf4' :
                      msg.type.includes('failure') || msg.type.includes('error') ? '#fef2f2' :
                        msg.type.includes('shopify') ? '#eff6ff' :
                          msg.type.includes('client') ? '#faf5ff' :
                            msg.type.includes('server') ? '#fffbeb' :
                              msg.type === 'system' ? '#f9fafb' :
                                msg.type === 'info' ? '#f0f9ff' :
                                  '#f8fafc'
                }}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-700 text-xs">[{msg.timestamp}]</span>
                  <span className="text-xs font-medium px-2 py-1 rounded"
                    style={{
                      color:
                        msg.type.includes('success') ? '#065f46' :
                          msg.type.includes('failure') || msg.type.includes('error') ? '#991b1b' :
                            msg.type.includes('shopify') ? '#1e40af' :
                              msg.type.includes('client') ? '#6b21a8' :
                                msg.type.includes('server') ? '#92400e' :
                                  msg.type === 'system' ? '#374151' :
                                    msg.type === 'info' ? '#0c4a6e' :
                                      '#4c1d95',
                      backgroundColor:
                        msg.type.includes('success') ? '#d1fae5' :
                          msg.type.includes('failure') || msg.type.includes('error') ? '#fee2e2' :
                            msg.type.includes('shopify') ? '#dbeafe' :
                              msg.type.includes('client') ? '#ede9fe' :
                                msg.type.includes('server') ? '#fef3c7' :
                                  msg.type === 'system' ? '#f3f4f6' :
                                    msg.type === 'info' ? '#e0f2fe' :
                                      '#e7e5e4'
                    }}>
                    {msg.type.toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-800 font-medium">{msg.message}</div>
                {msg.data && typeof msg.data === 'object' && (
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
          <p><strong>Client Event:</strong> <code className="bg-indigo-100 px-1 rounded">shopify:create</code> - Sends store creation request to server</p>
          <p><strong>Server Events:</strong> Server responds with multiple events during the process:</p>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• <code className="bg-indigo-100 px-1 rounded">shopify:authcode</code> - Authentication code received</li>
            <li>• <code className="bg-indigo-100 px-1 rounded">shopify:authurl</code> - Authorization URL generated</li>
            <li>• <code className="bg-indigo-100 px-1 rounded">shopify:status</code> - Status updates during process</li>
            <li>• <code className="bg-indigo-100 px-1 rounded">shopify:success</code> - Process completed successfully</li>
            <li>• <code className="bg-indigo-100 px-1 rounded">shopify:failure</code> - Process failed</li>
            <li>• <code className="bg-indigo-100 px-1 rounded">shopify:storeurl</code> - Final store URL</li>
          </ul>
        </div>
      </div>

    </div>

  );
}
