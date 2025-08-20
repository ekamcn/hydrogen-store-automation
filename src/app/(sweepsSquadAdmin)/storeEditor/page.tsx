import StoreEditorForm from "@/components/store-editor/StoreCreatorForm";
import { Suspense } from "react";

export default function StoreEditor() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Shopify Store Editor
      </h1>
      <p className="text-lg mb-6 text-center max-w-3xl mx-auto">
        Edit your Shopify Hydrogen storefront details using this form.
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <StoreEditorForm />
      </Suspense>
    </div>
  );
}
