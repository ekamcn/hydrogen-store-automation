"use client";

import { useState, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { StoreFormData } from "../StoreCreatorForm";
import { Button } from "@/components/ui/button";
import { useStoreContext } from "@/utils/storeContext";
import Link from "next/link";
type ReviewSubmitProps = {
  form: UseFormReturn<StoreFormData>;
  prevStep: () => void;
  handleSubmit: (data: StoreFormData) => void;
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  storeUrl: string | null;
  resetForm: () => void;
  nextStep: () => void;
};

export default function ReviewSubmit({
  form,
  prevStep,
  handleSubmit,
  isSubmitting,
  submitError,
  submitSuccess,
  storeUrl,
  resetForm,
}: // nextStep,
ReviewSubmitProps) {
  const { setPayload } = useStoreContext();

  // State to track streaming updates
  const [streamingUpdates] = useState<{
    message: string;
    step: number;
    progress: number;
    storeUrl?: string;
    error?: string;
  } | null>(null);

  // Get form data - this creates a stable reference
  const formData = form.watch();

  // Create memoized payload to prevent unnecessary updatesss
  const payload = useMemo(
    () => ({
      VITE_STORE_TITLE: formData.VITE_STORE_TITLE,
      VITE_STORE_NAME: formData.VITE_STORE_NAME,
      VITE_CUSTOMER_SUPPORT_EMAIL: formData.VITE_CUSTOMER_SUPPORT_EMAIL,
      VITE_CUSTOMER_SERVICE_PHONE: formData.VITE_CUSTOMER_SERVICE_PHONE,
      VITE_DOMAIN_NAME: formData.VITE_DOMAIN_NAME,
      VITE_SHOPIFY_EMAIL: formData.VITE_SHOPIFY_EMAIL,
      VITE_SHOPIFY_ADMIN_ACCESS_TOKEN: formData.VITE_SHOPIFY_ADMIN_ACCESS_TOKEN,
      VITE_SHOPIFY_URL: formData.VITE_SHOPIFY_URL,
      VITE_CATEGORY: formData.VITE_CATEGORY,
      VITE_LANGUAGE: formData.VITE_LANGUAGE,
      VITE_COLOR1: formData.VITE_COLOR1,
      VITE_COLOR2: formData.VITE_COLOR2,
      VITE_LOGO: formData.VITE_LOGO,
      VITE_BANNER: formData.VITE_BANNER,
      VITE_MOBILE_BANNER: formData.VITE_MOBILE_BANNER,
      VITE_TYPOGRAPHY: formData.VITE_TYPOGRAPHY,
      VITE_COMPANY_NAME: formData.VITE_COMPANY_NAME,
      VITE_COMPANY_ADDRESS: formData.VITE_COMPANY_ADDRESS,
      VITE_COMPANY_CITY: formData.VITE_COMPANY_CITY,
      VITE_COMPANY_BUSINESS_NUMBER: formData.VITE_COMPANY_BUSINESS_NUMBER,
      VITE_POLICY_UPDATED_AT: formData.VITE_POLICY_UPDATED_AT,
      VITE_BUSINESS_HOURS: formData.VITE_BUSINESS_HOURS,
      VITE_REFUND_PERIOD: formData.VITE_REFUND_PERIOD,
      VITE_REFUND_PROCESSING_TIME: formData.VITE_REFUND_PROCESSING_TIME,
      VITE_DELIVERY_PROVIDER: formData.VITE_DELIVERY_PROVIDER,
      VITE_ORDER_PROCESSING_TIME: formData.VITE_ORDER_PROCESSING_TIME,
      VITE_STANDARD_DELIVERY_TIME: formData.VITE_STANDARD_DELIVERY_TIME,
      VITE_RETURN_PERIOD: formData.VITE_RETURN_PERIOD,
      VITE_DELIVERY_AREAS: formData.VITE_DELIVERY_AREAS,
      VITE_TERMS_OF_SERVICE_UPDATE_AT: formData.VITE_TERMS_OF_SERVICE_UPDATE_AT,
      VITE_SUPPORT_HOURS: formData.VITE_SUPPORT_HOURS,
      VITE_WITHDRAWAL_PERIOD: formData.VITE_WITHDRAWAL_PERIOD,
      VITE_RETURN_SHIPPING_POLICY: formData.VITE_RETURN_SHIPPING_POLICY,
      VITE_SALE_ITEMS_POLICY: formData.VITE_SALE_ITEMS_POLICY,
      VITE_CHECKOUT_DOMAIN: formData.VITE_CHECKOUT_DOMAIN,
      VITE_CHECKOUT_ID: formData.VITE_CHECKOUT_ID,
      VITE_SQUARE_LOGO: formData.VITE_SQUARE_LOGO,
      VITE_FOOTER_COLOR: formData.VITE_FOOTER_COLOR,
      VITE_OFFER_ID_TYPE: formData.VITE_OFFER_ID_TYPE,
      customOffers: formData.customOffers || {},
      VITE_DISCOVER_OUR_COLLECTIONS:
        formData.VITE_DISCOVER_OUR_COLLECTIONS || [],
    }),
    [
      formData.VITE_STORE_TITLE,
      formData.VITE_STORE_NAME,
      formData.VITE_CUSTOMER_SUPPORT_EMAIL,
      formData.VITE_CUSTOMER_SERVICE_PHONE,
      formData.VITE_DOMAIN_NAME,
      formData.VITE_SHOPIFY_EMAIL,
      formData.VITE_SHOPIFY_ADMIN_ACCESS_TOKEN,
      formData.VITE_SHOPIFY_URL,
      formData.VITE_CATEGORY,
      formData.VITE_LANGUAGE,
      formData.VITE_COLOR1,
      formData.VITE_COLOR2,
      formData.VITE_LOGO,
      formData.VITE_BANNER,
      formData.VITE_MOBILE_BANNER,
      formData.VITE_TYPOGRAPHY,
      formData.VITE_COMPANY_NAME,
      formData.VITE_COMPANY_ADDRESS,
      formData.VITE_COMPANY_CITY,
      formData.VITE_COMPANY_BUSINESS_NUMBER,
      formData.VITE_POLICY_UPDATED_AT,
      formData.VITE_TERMS_OF_SERVICE_UPDATE_AT,
      formData.VITE_BUSINESS_HOURS,
      formData.VITE_REFUND_PERIOD,
      formData.VITE_REFUND_PROCESSING_TIME,
      formData.VITE_DELIVERY_PROVIDER,
      formData.VITE_ORDER_PROCESSING_TIME,
      formData.VITE_STANDARD_DELIVERY_TIME,
      formData.VITE_RETURN_PERIOD,
      formData.VITE_DELIVERY_AREAS,
      formData.VITE_SUPPORT_HOURS,
      formData.VITE_WITHDRAWAL_PERIOD,
      formData.VITE_RETURN_SHIPPING_POLICY,
      formData.VITE_SALE_ITEMS_POLICY,
      formData.VITE_CHECKOUT_DOMAIN,
      formData.VITE_CHECKOUT_ID,
      formData.VITE_SQUARE_LOGO,
      formData.VITE_FOOTER_COLOR,
      formData.VITE_OFFER_ID_TYPE,
      formData.customOffers,
      formData.VITE_DISCOVER_OUR_COLLECTIONS,
    ]
  );

  // Use useEffect to set payload when it changes
  useEffect(() => {
    setPayload(payload);
    console.log("ReviewSubmit payload updated:", payload);
  }, [payload, setPayload]);

  if (submitSuccess) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Store Creation Successful!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your Shopify Hydrogen store has been created successfully.
        </p>
        {storeUrl && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-background rounded-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Store URL
            </h3>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {storeUrl}
            </a>
          </div>
        )}
        <div className="flex justify-center">
          <Button onClick={resetForm}>Create Another Store</Button>
        </div>
      </div>
    );
  }

  // Function to handle streaming updates from the server
  // const handleStreamingUpdates = async () => {
  //   // Set initial state
  //   setStreamingUpdates({
  //     message: "Preparing to create store...",
  //     step: 0,
  //     progress: 0
  //   });

  //   try {
  //     // Simulate streaming updates for demo purposes
  //     const steps = [
  //       { message: "Validating store configuration...", progress: 20 },
  //       { message: "Creating Shopify store...", progress: 40 },
  //       { message: "Setting up Hydrogen template...", progress: 60 },
  //       { message: "Configuring checkout...", progress: 80 },
  //       { message: "Finalizing setup...", progress: 100 }
  //     ];

  //     for (let i = 0; i < steps.length; i++) {
  //       await new Promise(resolve => setTimeout(resolve, 1000));
  //       setStreamingUpdates({
  //         message: steps[i].message,
  //         step: i + 1,
  //         progress: steps[i].progress
  //       });
  //     }

  //     // Submit the form after streaming is complete
  //     form.handleSubmit(handleSubmit)();
  //   } catch (error) {
  //     console.error('Error during store creation:', error);
  //     setStreamingUpdates(prev => prev ? {
  //       ...prev,
  //       error: 'Failed to create store. Please try again.'
  //     } : null);
  //   }
  // };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please review your store configuration before submitting.
        </p>
      </div>
      {/*       
      {streamingUpdates && (
        <div className="border dark:border-gray-700 rounded-md overflow-hidden p-4">
          <h3 className="text-lg font-medium mb-2">{streamingUpdates.message}</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${streamingUpdates.progress}%` }}
            ></div>
          </div>
          {streamingUpdates.error && (
            <p className="text-red-500 mt-2">{streamingUpdates.error}</p>
          )}
        </div>
      )} */}

      <div className="space-y-6">
        {/* Store Basics */}
        <div className="border dark:border-gray-700 rounded-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-background px-4 py-3 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium">Store Basics</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Store Title
                </h4>
                <p className="mt-1">
                  {formData.VITE_STORE_TITLE || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Store Name
                </h4>
                <p className="mt-1">
                  {formData.VITE_STORE_NAME || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Domain Name
                </h4>
                <p className="mt-1">
                  {formData.VITE_DOMAIN_NAME || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Customer Support Email
                </h4>
                <p className="mt-1">
                  {formData.VITE_CUSTOMER_SUPPORT_EMAIL || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Customer Service Phone
                </h4>
                <p className="mt-1">
                  {formData.VITE_CUSTOMER_SERVICE_PHONE || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Shopify Email
                </h4>
                <p className="mt-1">
                  {formData.VITE_SHOPIFY_EMAIL || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Shopify Store URL
                </h4>
                <p className="mt-1">
                  {formData.VITE_SHOPIFY_URL || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Shopify Admin Access Token
                </h4>
                <p className="mt-1">
                  {formData.VITE_SHOPIFY_ADMIN_ACCESS_TOKEN}
                </p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Discover Our Collections
                </h4>
                {Array.isArray(formData.VITE_DISCOVER_OUR_COLLECTIONS) &&
                formData.VITE_DISCOVER_OUR_COLLECTIONS.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {formData.VITE_DISCOVER_OUR_COLLECTIONS.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1">Not specified</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="border dark:border-gray-700 rounded-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-background px-4 py-3 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium">Theme Selection</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category
                </h4>
                <p className="mt-1 capitalize">
                  {formData.VITE_CATEGORY || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Language
                </h4>
                <p className="mt-1">
                  {formData.VITE_LANGUAGE === "en"
                    ? "English"
                    : formData.VITE_LANGUAGE === "fr"
                    ? "French"
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Customization */}
        <div className="border dark:border-gray-700 rounded-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-background px-4 py-3 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium">Brand Customization</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Primary Color
                </h4>
                <div className="mt-1 flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{
                      backgroundColor: formData.VITE_COLOR1 || "#000000",
                    }}
                  ></div>
                  <span>{formData.VITE_COLOR1 || "Not specified"}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Secondary Color
                </h4>
                <div className="mt-1 flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{
                      backgroundColor: formData.VITE_COLOR2 || "#ffffff",
                    }}
                  ></div>
                  <span>{formData.VITE_COLOR2 || "Not specified"}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Typography
                </h4>
                <p className="mt-1 capitalize">
                  {formData.VITE_TYPOGRAPHY || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Logo
                </h4>
                {formData.VITE_LOGO ? (
                  <div className="mt-1 flex items-center space-x-2">
                    <img
                      src={
                        typeof formData.VITE_LOGO === "string"
                          ? formData.VITE_LOGO
                          : formData.VITE_LOGO?.base64
                      }
                      alt="Logo preview"
                      className="w-8 h-8 object-cover rounded border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling!.textContent =
                          "Uploaded ✓";
                      }}
                    />
                    <span className="text-sm text-green-600">Uploaded ✓</span>
                  </div>
                ) : (
                  <p className="mt-1">Not uploaded</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Banner
                </h4>
                {formData.VITE_BANNER ? (
                  <div className="mt-1 flex items-center space-x-2">
                    <img
                      src={
                        typeof formData.VITE_BANNER === "string"
                          ? formData.VITE_BANNER
                          : formData.VITE_BANNER?.base64
                      }
                      alt="Banner preview"
                      className="w-12 h-6 object-cover rounded border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling!.textContent =
                          "Uploaded ✓";
                      }}
                    />
                    <span className="text-sm text-green-600">Uploaded ✓</span>
                  </div>
                ) : (
                  <p className="mt-1">Not uploaded</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mobile Banner
                </h4>
                {formData.VITE_MOBILE_BANNER ? (
                  <div className="mt-1 flex items-center space-x-2">
                    <img
                      src={
                        typeof formData.VITE_MOBILE_BANNER === "string"
                          ? formData.VITE_MOBILE_BANNER
                          : formData.VITE_MOBILE_BANNER?.base64
                      }
                      alt="Mobile banner preview"
                      className="w-10 h-10 object-cover rounded border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling!.textContent =
                          "Uploaded ✓";
                      }}
                    />
                    <span className="text-sm text-green-600">Uploaded ✓</span>
                  </div>
                ) : (
                  <p className="mt-1">Not uploaded</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Footer ( Phone Number / Email )Color
                </h4>
                <div className="mt-1 flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{
                      backgroundColor: formData.VITE_FOOTER_COLOR || "#ffffff",
                    }}
                  ></div>
                  <span>{formData.VITE_FOOTER_COLOR || "Not specified"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="border dark:border-gray-700 rounded-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-background px-4 py-3 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium">Legal Information</h3>
          </div>
          <div className="p-4 space-y-3">
            {/* Company Information */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Company Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Company Name
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_COMPANY_NAME || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Company Address
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_COMPANY_ADDRESS || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Business Registration Number
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_COMPANY_BUSINESS_NUMBER || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Company City
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_COMPANY_CITY || "Not specified"}
                  </p>
                </div>
                {/* <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Business Hours
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_BUSINESS_HOURS || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Support Hours
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_SUPPORT_HOURS || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Policy Updated At
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_POLICY_UPDATED_AT || "Not specified"}
                  </p>
                </div> */}
              </div>
            </div>

            {/* Refund Policy */}
            {/* <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Refund Policy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Refund Period
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_REFUND_PERIOD || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Refund Processing Time
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_REFUND_PROCESSING_TIME || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Withdrawal Period
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_WITHDRAWAL_PERIOD || "Not specified"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Sale Items Policy
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_SALE_ITEMS_POLICY || "Not specified"}
                  </p>
                </div>
              </div>
            </div> */}

            {/* Shipping & Delivery */}
            {/* <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Shipping & Delivery
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Delivery Provider
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_DELIVERY_PROVIDER || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Order Processing Time
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_ORDER_PROCESSING_TIME || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Standard Delivery Time
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_STANDARD_DELIVERY_TIME || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Return Period
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_RETURN_PERIOD || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Delivery Areas
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_DELIVERY_AREAS || "Not specified"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Return Shipping Policy
                  </h5>
                  <p className="mt-1">
                    {formData.VITE_RETURN_SHIPPING_POLICY || "Not specified"}
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Checkout Configuration */}
        <div className="border dark:border-gray-700 rounded-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-background px-4 py-3 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium">Checkout Configuration</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Checkout Domain
                </h4>
                <p className="mt-1">
                  {formData.VITE_CHECKOUT_DOMAIN || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Checkout ID
                </h4>
                <p className="mt-1">
                  {formData.VITE_CHECKOUT_ID || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Square Logo
                </h4>
                {formData.VITE_SQUARE_LOGO ? (
                  <div className="mt-1 flex items-center space-x-2">
                    <img
                      src={
                        typeof formData.VITE_SQUARE_LOGO === "string"
                          ? formData.VITE_SQUARE_LOGO
                          : formData.VITE_SQUARE_LOGO?.base64
                      }
                      alt="Square logo preview"
                      className="w-8 h-8 object-cover rounded border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling!.textContent =
                          "Uploaded ✓";
                      }}
                    />
                    <span className="text-sm text-green-600">Uploaded ✓</span>
                  </div>
                ) : (
                  <p className="mt-1">Not uploaded</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Offer ID Type
                </h4>
                <p className="mt-1 capitalize">
                  {formData.VITE_OFFER_ID_TYPE || "Not specified"}
                </p>
              </div>
            </div>

            {formData.VITE_OFFER_ID_TYPE === "custom" &&
              formData.customOffers?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Custom Offer IDs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {formData.customOffers.map((offer, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <span className="text-sm font-medium">
                          ${offer.price}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {offer.offerId || "Not set"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-300">
          <p>{submitError}</p>
        </div>
      )}

      <div className="pt-6 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="text-black"
          disabled={isSubmitting || streamingUpdates !== null}
        >
          Previous
        </Button>
        <Link href="/socket">
          <Button
            type="button"
            className="bg-black"
            onClick={() => handleSubmit(formData)}
            //  onClick={() => {console.log("formData", formData);}}
            disabled={isSubmitting || streamingUpdates !== null}
          >
            {isSubmitting || streamingUpdates ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {streamingUpdates ? "Processing..." : "Creating Store..."}
              </>
            ) : (
              "Create Store"
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}
