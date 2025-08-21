import { useEffect, useState } from "react";

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

interface StoreSelectProps {
  onSelect: (store: Store | null) => void;
  value?: string; // store_id
}

type StoresResponse = { stores: Store[] };

function isStoresResponse(value: unknown): value is StoresResponse {
  if (!value || typeof value !== "object") return false;
  if (!("stores" in value)) return false;
  const obj = value as { stores: unknown };
  return Array.isArray(obj.stores);
}

export function StoreSelect({ onSelect, value }: StoreSelectProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(value || "");

  useEffect(() => {
    fetch("http://51.112.151.1/store/all")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch store data");
        }
        return response.json();
      })
      .then((data: unknown) => {
        if (isStoresResponse(data)) {
          setStores(data.stores);
        } else {
          setStores([]);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedId) {
      const store = stores.find((s) => s.store_id === selectedId) || null;
      onSelect(store);
    } else {
      onSelect(null);
    }
  }, [selectedId, stores, onSelect]);

  return (
    <div className="mb-6 w-full">
      <label
        htmlFor="store-select"
        className="block mb-2 text-sm sm:text-base font-semibold text-gray-800"
      >
        Select Store
      </label>
      {loading ? (
        <div className="text-gray-500 py-2 text-sm">Loading stores...</div>
      ) : error ? (
        <div className="text-red-500 py-2 text-sm">{error}</div>
      ) : (
        <select
          id="store-select"
          className="border rounded-lg px-3 py-2 w-full text-sm sm:text-base shadow-sm bg-white cursor-pointer hover:border-blue-400"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Select a store --</option>
          {stores.map((store) => (
            <option key={store.store_id} value={store.store_id}>
              {store.storeName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
