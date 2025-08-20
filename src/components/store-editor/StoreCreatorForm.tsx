'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import StoreBasics from './steps/StoreBasics';
import LegalInformation from './steps/LegalInformation';
import StepIndicator from './StepIndicator';
import { useSearchParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';

// Define the Zod schema for form validation (only relevant fields)
const storeEditorFormSchema = z.object({
  VITE_STORE_TITLE: z.string().min(1, 'Store title is required'),
  VITE_STORE_NAME: z.string().min(1, 'Store name is required'),
  VITE_CUSTOMER_SUPPORT_EMAIL: z.string().email('Please enter a valid customer support email address'),
  VITE_CUSTOMER_SERVICE_PHONE: z.string().min(1, 'Please enter a valid customer service phone number'),
  VITE_DOMAIN_NAME: z.string().min(1, 'Domain name is required'),
  VITE_SHOPIFY_EMAIL: z.string().email('Please enter a valid Shopify email address').optional(),
  VITE_SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().min(1, 'Shopify Admin Access Token is required'),
  VITE_SHOPIFY_URL: z.string().min(1, 'Shopify Store URL is required'),
  VITE_COMPANY_NAME: z.string().min(1, 'Company name is required'),
  VITE_COMPANY_ADDRESS: z.string().min(1, 'Company address is required'),
});

export type StoreEditorFormData = z.infer<typeof storeEditorFormSchema>;

const initialFormData: Partial<StoreEditorFormData> = {
  VITE_STORE_TITLE: '',
  VITE_STORE_NAME: '',
  VITE_CUSTOMER_SUPPORT_EMAIL: '',
  VITE_CUSTOMER_SERVICE_PHONE: '',
  VITE_DOMAIN_NAME: '',
  VITE_SHOPIFY_EMAIL: '',
  VITE_SHOPIFY_ADMIN_ACCESS_TOKEN: '',
  VITE_SHOPIFY_URL: '',
  VITE_COMPANY_NAME: '',
  VITE_COMPANY_ADDRESS: '',
};

const steps = [
  { id: 'basics', name: 'Store Basics' },
  { id: 'legal', name: 'Legal Information' },
];

// API response type
type EnvResponse = {
  success: boolean;
  data?: {
    name?: string;
    email?: string;
    phone?: string;
    domainName?: string;
    shopifyUrl?: string;
    shopifyEmail?: string;
    shopifyAdminToken?: string;
    companyName?: string;
    companyAddress?: string;
  };
};

// Build payload to send with the event
function buildUpdatePayload(values: StoreEditorFormData) {
  return {
    name: values.VITE_STORE_NAME,
    email: values.VITE_CUSTOMER_SUPPORT_EMAIL,
    phone: values.VITE_CUSTOMER_SERVICE_PHONE,
    domainName: values.VITE_DOMAIN_NAME,
    shopifyUrl: values.VITE_SHOPIFY_URL,
    shopifyEmail: values.VITE_SHOPIFY_EMAIL,
    shopifyAdminToken: values.VITE_SHOPIFY_ADMIN_ACCESS_TOKEN,
    companyName: values.VITE_COMPANY_NAME,
    companyAddress: values.VITE_COMPANY_ADDRESS,
  };
}

// Persist the latest form values to the server
async function saveStoreEnv(values: StoreEditorFormData, storeNameFallback?: string) {
  const candidateName = (values.VITE_STORE_NAME || '').trim();
  const storeName = candidateName || (storeNameFallback || '').trim();
  if (!storeName) return;

}

export default function StoreEditorForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepCompletionStatus, setStepCompletionStatus] = useState<boolean[]>([false, false]);
  const [stepValidationStatus, setStepValidationStatus] = useState<boolean[]>([false, false]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const searchParams = useSearchParams();
  const storeNameFromQuery = searchParams.get('storeName') || '';
  const router = useRouter();

  const form = useForm<StoreEditorFormData>({
    resolver: zodResolver(storeEditorFormSchema),
    defaultValues: initialFormData,
    mode: 'onChange',
  });

  const { trigger, getValues, formState, watch } = form;

  // Socket.IO setup (mirror socket page approach)
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    const serverUrl = 'http://51.112.151.1';
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });
    const socket = socketRef.current;

    socket.on('connect', () => {
      // connected
    });

    socket.on('disconnect', () => {
      // disconnected
    });

    // Shopify auth flow handlers
    socket.on('shopify:authurl', (data: unknown) => {
      if (typeof data === 'string' && data.startsWith('http')) {
        window.alert('Please login to Shopify to continue updating. A login window will open.');
        window.open(data, '_blank');
      }
    });

    socket.on('shopify:authcode', (data: { authCode?: string } | unknown) => {
      // Optional: indicate auth started
      // console.log('Auth code received:', (data as { authCode?: string })?.authCode);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Prefill form when storeName is present
  useEffect(() => {
    const controller = new AbortController();
    const fetchAndPopulate = async () => {
      if (!storeNameFromQuery) return;
      try {
        const res = await fetch(`http://51.112.151.1/store/env?storeName=${encodeURIComponent(storeNameFromQuery)}`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = (await res.json()) as EnvResponse;
        const d = json?.data || {};
        form.reset({
          VITE_STORE_TITLE: d.name || '',
          VITE_STORE_NAME: storeNameFromQuery,
          VITE_CUSTOMER_SUPPORT_EMAIL: d.email || '',
          VITE_CUSTOMER_SERVICE_PHONE: d.phone || '',
          VITE_DOMAIN_NAME: d.domainName || '',
          VITE_SHOPIFY_EMAIL: d.shopifyEmail || '',
          VITE_SHOPIFY_ADMIN_ACCESS_TOKEN: d.shopifyAdminToken || '',
          VITE_SHOPIFY_URL: d.shopifyUrl || '',
          VITE_COMPANY_NAME: d.companyName || '',
          VITE_COMPANY_ADDRESS: d.companyAddress || '',
        });
      } catch {
        // ignore fetch errors for prefill
      }
    };
    fetchAndPopulate();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeNameFromQuery]);

  useEffect(() => {
    const subscription = watch(() => {
      updateValidationStatus();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  useEffect(() => {
    updateValidationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitShopifyUpdate = (values: StoreEditorFormData) => {
    const payload = buildUpdatePayload(values);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('shopify:update', JSON.stringify(payload));
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);

    const newCompletionStatus = [...stepCompletionStatus];
    newCompletionStatus[currentStep] = true;
    setStepCompletionStatus(newCompletionStatus);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
    setTimeout(() => updateValidationStatus(), 100);
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const checkStepValidation = async (stepIndex: number): Promise<boolean> => {
    const fieldsToValidate = getFieldsForStep(stepIndex);
    if (fieldsToValidate.length === 0) return true;
    const values = getValues();
    const errors = formState.errors as Record<string, unknown>;
    for (const field of fieldsToValidate) {
      const value = (values as Record<string, unknown>)[field];
      const hasError = Boolean(errors[field as unknown as string]);
      if (!value || hasError) {
        return false;
      }
    }
    return true;
  };

  const updateValidationStatus = async () => {
    const newValidationStatus = await Promise.all(
      steps.map((_, index) => checkStepValidation(index))
    );
    setStepValidationStatus(newValidationStatus);
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      if (currentStep !== stepIndex) {
        const newCompletionStatus = [...stepCompletionStatus];
        newCompletionStatus[currentStep] = true;
        setStepCompletionStatus(newCompletionStatus);
      }
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);
      setTimeout(() => updateValidationStatus(), 100);
    }
  };

  const getFieldsForStep = (step: number): (keyof StoreEditorFormData)[] => {
    switch (step) {
      case 0:
        return [
          'VITE_STORE_TITLE',
          'VITE_STORE_NAME',
          'VITE_CUSTOMER_SUPPORT_EMAIL',
          'VITE_CUSTOMER_SERVICE_PHONE',
          'VITE_DOMAIN_NAME',
          'VITE_SHOPIFY_ADMIN_ACCESS_TOKEN',
          'VITE_SHOPIFY_URL',
        ];
      case 1:
        return ['VITE_COMPANY_NAME', 'VITE_COMPANY_ADDRESS'];
      default:
        return [];
    }
  };

  const handleSubmit = async (data: StoreEditorFormData) => {
    try {
      // Emit final update before submit
      emitShopifyUpdate(data);
      // Call the API to update the store
      await saveStoreEnv(data, storeNameFromQuery);
      // Clear inputs and show success popup
      form.reset(initialFormData);
      setCurrentStep(0);
      setStepCompletionStatus([false, false]);
      setStepValidationStatus([false, false]);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const submitFinalStep = async () => {
    const isValid = await trigger(getFieldsForStep(1));
    if (!isValid) return;
    await handleSubmit(form.getValues());
  };

  return (
    <Form {...form}>
      <div className="max-w-4xl mx-auto bg-white dark:bg-background rounded-lg shadow-md p-4 sm:p-6">
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-background rounded-lg shadow-lg w-full max-w-md p-6">
              <p className="text-sm text-muted-foreground mb-4">Submitted successfully.</p>
              <div className="flex justify-end gap-2">
                <Button onClick={() => router.push('/allCustomers')}>Go to Customers</Button>
              </div>
            </div>
          </div>
        )}
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          goToStep={goToStep}
          stepValidationStatus={stepValidationStatus}
          stepCompletionStatus={stepCompletionStatus}
        />
        <div className="mt-8">
          {currentStep === 0 && (
            <StoreBasics form={form} nextStep={nextStep} />
          )}
          {currentStep === 1 && (
            <LegalInformation form={form} nextStep={submitFinalStep} prevStep={prevStep} />
          )}
        </div>
      </div>
    </Form>
  );
}