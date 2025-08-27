"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import StoreBasics from "./steps/StoreBasics";
import ThemeSelection from "./steps/ThemeSelection";
import BrandCustomization from "./steps/BrandCustomization";
import LegalInformation from "./steps/LegalInformation";
import CheckoutConfig from "./steps/CheckoutConfig";
import ReviewSubmit from "./steps/ReviewSubmit";
import StepIndicator from "./StepIndicator";

// Define the Zod schema for form validation
const storeFormSchema = z.object({
  // Store Basics helper
  VITE_STORE_TITLE: z.string().min(1, "Store title is required"),
  VITE_STORE_NAME: z.string().min(1, "Store name is required"),
  VITE_CUSTOMER_SUPPORT_EMAIL: z
    .string()
    .email("Please enter a valid customer support email address"),
  VITE_CUSTOMER_SERVICE_PHONE: z
    .string()
    .min(1, "Please enter a valid customer service phone number"),
  VITE_DOMAIN_NAME: z.string().min(1, "Domain name is required"),
  VITE_SHOPIFY_EMAIL: z
    .string()
    .email("Please enter a valid Shopify email address")
    .optional(),
  VITE_SHOPIFY_ADMIN_ACCESS_TOKEN: z
    .string()
    .min(1, "Shopify Admin Access Token is required"),
  VITE_SHOPIFY_URL: z.string().min(1, "Shopify Store URL is required"),
  VITE_DISCOVER_OUR_COLLECTIONS: z.array(z.string().min(1)).optional(),

  // Theme Selection
  VITE_CATEGORY: z.enum(["diy", "pets", "deco", "baby", "automoto", "general"]),
  VITE_LANGUAGE: z.enum(["en", "fr"]),

  // Brand Customization
  VITE_COLOR1: z.string().min(1, "Primary color is required"),
  VITE_FOOTER_COLOR: z.string().min(1, "Email color is required"),
  VITE_COLOR2: z.string().min(1, "Secondary color is required"),
  VITE_LOGO: z
    .object({
      base64: z.string(),
      fileName: z.string(),
    })
    .optional(),
  VITE_BANNER: z
    .object({
      base64: z.string(),
      fileName: z.string(),
    })
    .optional(),
  VITE_MOBILE_BANNER: z
    .object({
      base64: z.string(),
      fileName: z.string(),
    })
    .optional(),
  VITE_TYPOGRAPHY: z.enum(["sans-serif", "serif", "monospace"]),

  // Legal Information
  VITE_COMPANY_NAME: z.string().min(1, "Company name is required"),
  VITE_COMPANY_ADDRESS: z.string().min(1, "Company address is required"),
  VITE_COMPANY_BUSINESS_NUMBER: z
    .string()
    .min(1, "Company business registration number / SIREN is required"),
  // Policy Information
  VITE_POLICY_UPDATED_AT: z.string().min(1, "Policy updated at is required"),
  VITE_TERMS_OF_SERVICE_UPDATE_AT: z.string().min(1, "Terms of service update date is required"),
  // Privacy Policy
  VITE_BUSINESS_HOURS: z.string().min(1, "Business hours are required"),
  VITE_REFUND_PERIOD: z.string().min(1, "Refund period is required"),
  VITE_REFUND_PROCESSING_TIME: z
    .string()
    .min(1, "Refund processing time is required"),
  // Shipping Policy
  VITE_DELIVERY_PROVIDER: z.string().min(1, "Delivery provider is required"),
  VITE_ORDER_PROCESSING_TIME: z
    .string()
    .min(1, "Order processing time is required"),
  VITE_STANDARD_DELIVERY_TIME: z
    .string()
    .min(1, "Standard delivery time is required"),
  VITE_RETURN_PERIOD: z.string().min(1, "Return period is required"),
  VITE_DELIVERY_AREAS: z.string().min(1, "Delivery areas are required"),
  VITE_SUPPORT_HOURS: z.string().min(1, "Support hours are required"),
  // Return Policy
  VITE_WITHDRAWAL_PERIOD: z.string().optional(),
  VITE_RETURN_SHIPPING_POLICY: z
    .string()
    .min(1, "Return shipping policy is required"),
  VITE_SALE_ITEMS_POLICY: z.string().min(1, "Sale items policy is required"),

  // Checkout Configuration
  VITE_CHECKOUT_DOMAIN: z.string().min(1, "Checkout domain is required"),
  VITE_CHECKOUT_ID: z.string().min(1, "Checkout ID is required"),
  VITE_SQUARE_LOGO: z
    .object({
      base64: z.string(),
      fileName: z.string(),
    })
    .optional(),
  VITE_OFFER_ID_TYPE: z.enum(["default", "custom"]),
  customOfferIds: z.record(z.string(), z.string().optional()).optional(),
});

// Define the form data type
export type StoreFormData = z.infer<typeof storeFormSchema>;

// Initial form data
const initialFormData: Partial<StoreFormData> = {
  // Store Basics
  VITE_STORE_TITLE: "",
  VITE_STORE_NAME: "",
  VITE_CUSTOMER_SUPPORT_EMAIL: "",
  VITE_CUSTOMER_SERVICE_PHONE: "",
  VITE_DOMAIN_NAME: "",
  VITE_SHOPIFY_EMAIL: "",
  VITE_SHOPIFY_ADMIN_ACCESS_TOKEN: "",
  VITE_SHOPIFY_URL: "",
  VITE_DISCOVER_OUR_COLLECTIONS: [],

  // Theme Selection
  VITE_CATEGORY: "general" as const,
  VITE_LANGUAGE: "en" as const,

  // Brand Customization
  VITE_COLOR1: "#000000",
  VITE_COLOR2: "#ffffff",
  VITE_FOOTER_COLOR: "#ffffff",
  VITE_LOGO: undefined,
  VITE_BANNER: undefined,
  VITE_MOBILE_BANNER: undefined,
  VITE_TYPOGRAPHY: "sans-serif" as const,

  // Legal Information
  VITE_COMPANY_NAME: "",
  VITE_COMPANY_ADDRESS: "",
  VITE_COMPANY_BUSINESS_NUMBER: "",
  VITE_POLICY_UPDATED_AT: "",
  VITE_TERMS_OF_SERVICE_UPDATE_AT: "",
  VITE_BUSINESS_HOURS: "",
  VITE_REFUND_PERIOD: "",
  VITE_REFUND_PROCESSING_TIME: "",
  VITE_DELIVERY_PROVIDER: "",
  VITE_ORDER_PROCESSING_TIME: "",
  VITE_STANDARD_DELIVERY_TIME: "",
  VITE_RETURN_PERIOD: "",
  VITE_DELIVERY_AREAS: "",
  VITE_SUPPORT_HOURS: "",
  VITE_WITHDRAWAL_PERIOD: "",
  VITE_RETURN_SHIPPING_POLICY: "",
  VITE_SALE_ITEMS_POLICY: "",

  // Checkout Configuration
  VITE_CHECKOUT_DOMAIN: "",
  VITE_CHECKOUT_ID: "",
  VITE_SQUARE_LOGO: undefined,
  VITE_OFFER_ID_TYPE: "default" as const,
  customOfferIds: {
    "9_99": "",
    "19_5": "",
    "29_9": "",
    "39_99": "",
    "49_9": "",
    "59_5": "",
    "69_99": "",
    "79_9": "",
    "89_5": "",
    "99_99": "",
    "109_9": "",
    "119_5": "",
  },
};

// Define the steps
const steps = [
  { id: "basics", name: "Store Basics" },
  { id: "theme", name: "Theme Selection" },
  { id: "brand", name: "Brand Customization" },
  { id: "legal", name: "Legal Information" },
  { id: "checkout", name: "Checkout Configuration" },
  { id: "review", name: "Review & Submit" },
];

export default function StoreCreatorForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [stepCompletionStatus, setStepCompletionStatus] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [stepValidationStatus, setStepValidationStatus] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  // Initialize React Hook Form
  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: initialFormData,
    mode: "onChange",
  });

  const { trigger, getValues, formState, watch } = form;

  // Watch form changes to update validation status
  useEffect(() => {
    const subscription = watch(() => {
      updateValidationStatus();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  // Initial validation check
  useEffect(() => {
    updateValidationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate to next step with validation
  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);

    // Mark current step as completed
    const newCompletionStatus = [...stepCompletionStatus];
    newCompletionStatus[currentStep] = true;
    setStepCompletionStatus(newCompletionStatus);

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }

    // Update validation status
    setTimeout(() => updateValidationStatus(), 100);
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Check if a step is valid
  const checkStepValidation = async (stepIndex: number): Promise<boolean> => {
    const fieldsToValidate = getFieldsForStep(stepIndex);
    if (fieldsToValidate.length === 0) return true;

    const values = getValues();
    const errors = formState.errors;

    // Check if all required fields for this step have values and no errors
    for (const field of fieldsToValidate) {
      const value = values[field];
      const hasError = errors[field];
      const requiredFields = [
        "VITE_STORE_NAME",
        "VITE_CUSTOMER_SUPPORT_EMAIL",
        "VITE_CUSTOMER_SERVICE_PHONE",
        "VITE_DOMAIN_NAME",
        "VITE_SHOPIFY_ADMIN_ACCESS_TOKEN",
        "VITE_COMPANY_BUSINESS_NUMBER",
        "VITE_SHOPIFY_URL",
        "VITE_CATEGORY",
        "VITE_LANGUAGE",
        "VITE_COLOR1",
        "VITE_COLOR2",
        "VITE_TYPOGRAPHY",
        "VITE_COMPANY_NAME",
        "VITE_COMPANY_ADDRESS",
        "VITE_POLICY_UPDATED_AT",
        "VITE_TERMS_OF_SERVICE_UPDATE_AT",
        "VITE_BUSINESS_HOURS",
        "VITE_REFUND_PERIOD",
        "VITE_REFUND_PROCESSING_TIME",
        "VITE_DELIVERY_PROVIDER",
        "VITE_ORDER_PROCESSING_TIME",
        "VITE_STANDARD_DELIVERY_TIME",
        "VITE_RETURN_PERIOD",
        "VITE_DELIVERY_AREAS",
        "VITE_SUPPORT_HOURS",
        "VITE_WITHDRAWAL_PERIOD",
        "VITE_RETURN_SHIPPING_POLICY",
        "VITE_SALE_ITEMS_POLICY",
        "VITE_CHECKOUT_DOMAIN",
        "VITE_CHECKOUT_ID",
        "VITE_OFFER_ID_TYPE",
      ];
      const optionalFields = [
        "VITE_SHOPIFY_EMAIL",
        "VITE_LOGO",
        "VITE_BANNER",
        "VITE_SQUARE_LOGO",
        "customOfferIds",
      ];

      // For required fields, check if they have values
      if (requiredFields.includes(field)) {
        if (!value || hasError) {
          return false;
        }
      }

      // For optional fields, they are always valid
      if (optionalFields.includes(field)) {
        continue;
      }
    }

    return true;
  };

  // Update validation status for all steps
  const updateValidationStatus = async () => {
    const newValidationStatus = await Promise.all(
      steps.map((_, index) => checkStepValidation(index))
    );
    setStepValidationStatus(newValidationStatus);
  };

  // Jump to a specific step
  const goToStep = (stepIndex: number) => {
    console.log("goToStep :", currentStep, stepIndex);
    if (stepIndex >= 0 && stepIndex < steps.length) {
      // Mark current step as completed when leaving it
      if (currentStep !== stepIndex) {
        const newCompletionStatus = [...stepCompletionStatus];
        newCompletionStatus[currentStep] = true;
        setStepCompletionStatus(newCompletionStatus);
      }

      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);

      // Update validation status
      setTimeout(() => updateValidationStatus(), 100);
    }
  };

  // Get fields to validate for each step
  const getFieldsForStep = (step: number): (keyof StoreFormData)[] => {
    switch (step) {
      case 0:
        return [
          "VITE_STORE_NAME",
          "VITE_CUSTOMER_SUPPORT_EMAIL",
          "VITE_CUSTOMER_SERVICE_PHONE",
          "VITE_DOMAIN_NAME",
          "VITE_SHOPIFY_ADMIN_ACCESS_TOKEN",
          "VITE_SHOPIFY_URL",
        ];
      case 1:
        return ["VITE_CATEGORY", "VITE_LANGUAGE"];
      case 2:
        return [
          "VITE_COLOR1",
          "VITE_COLOR2",
          "VITE_FOOTER_COLOR",
          "VITE_LOGO",
          "VITE_BANNER",
          "VITE_TYPOGRAPHY",
        ];
      case 3:
        return [
          "VITE_COMPANY_NAME",
          "VITE_COMPANY_ADDRESS",
          "VITE_COMPANY_BUSINESS_NUMBER",
          "VITE_POLICY_UPDATED_AT",
          "VITE_TERMS_OF_SERVICE_UPDATE_AT",
          "VITE_BUSINESS_HOURS",
          "VITE_REFUND_PERIOD",
          "VITE_REFUND_PROCESSING_TIME",
          "VITE_DELIVERY_PROVIDER",
          "VITE_ORDER_PROCESSING_TIME",
          "VITE_STANDARD_DELIVERY_TIME",
          "VITE_RETURN_PERIOD",
          "VITE_DELIVERY_AREAS",
          "VITE_SUPPORT_HOURS",
          "VITE_WITHDRAWAL_PERIOD",
          "VITE_RETURN_SHIPPING_POLICY",
          "VITE_SALE_ITEMS_POLICY",
        ];
      case 4:
        return [
          "VITE_CHECKOUT_DOMAIN",
          "VITE_CHECKOUT_ID",
          "VITE_SQUARE_LOGO",
          "VITE_OFFER_ID_TYPE",
          "customOfferIds",
        ];
      default:
        return [];
    }
  };

  // Handle form submission
  const handleSubmit = async (data: StoreFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Call the API to create the store
      console.log("responseData :", data);

      // Set success state
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        (error as Error).message ||
          "There was an error creating your store. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    form.reset(initialFormData);
    setCurrentStep(0);
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
    setStoreUrl(null);
    setStepCompletionStatus([false, false, false, false, false, false]);
    setStepValidationStatus([false, false, false, false, false, false]);
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StoreBasics form={form} nextStep={nextStep} />;
      case 1:
        return (
          <ThemeSelection form={form} nextStep={nextStep} prevStep={prevStep} />
        );
      case 2:
        return (
          <BrandCustomization
            form={form}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <LegalInformation
            form={form}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <CheckoutConfig form={form} nextStep={nextStep} prevStep={prevStep} />
        );
      case 5:
        return (
          <ReviewSubmit
            form={form}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
            submitSuccess={submitSuccess}
            storeUrl={storeUrl}
            resetForm={resetForm}
            nextStep={nextStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <div className="max-w-7xl mx-auto bg-white dark:bg-background rounded-lg shadow-md p-6">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          goToStep={goToStep}
          stepValidationStatus={stepValidationStatus}
          stepCompletionStatus={stepCompletionStatus}
        />
        <div className="mt-8">{renderStep()}</div>
      </div>
    </Form>
  );
}
