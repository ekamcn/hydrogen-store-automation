'use client';
 
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Code, CheckCircle } from 'lucide-react';
import { StorePayload } from '@/utils/storeContext';
import { StoreSelect } from '@/components/common/storefront';
 
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
 
// Define the Zod schema for form validation
const scriptFormSchema = z.object({
  headScript: z.string().min(1, 'Head script is required'),
  bodyScript: z.string().min(1, 'Body script is required'),
});
 
// Define the form data type
export type ScriptFormData = z.infer<typeof scriptFormSchema>;
 
// Initial form data
const initialFormData: ScriptFormData = {
  headScript: '',
  bodyScript: '',
};
 
export default function GoogleScriptForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
 
  // Utility to map Store to StorePayload (add more fields as needed)
  function storeToStorePayload(store: Store): StorePayload {
    return {
      VITE_STORE_TITLE: store.storeName,
      VITE_STORE_NAME: store.storeName,
      VITE_CUSTOMER_SUPPORT_EMAIL: store.email,
      VITE_CUSTOMER_SERVICE_PHONE: store.phone,
      VITE_DOMAIN_NAME: '',
      VITE_CATEGORY: '',
      VITE_LANGUAGE: '',
      VITE_COLOR1: '',
      VITE_COLOR2: '',
      VITE_TYPOGRAPHY: '',
      VITE_COMPANY_NAME: '',
      VITE_COMPANY_ADDRESS: '',
      VITE_CHECKOUT_DOMAIN: '',
      VITE_CHECKOUT_ID: '',
      VITE_OFFER_ID_TYPE: '',
      // Add more fields as needed, or map from store if available
    };
  }
 
  // Initialize React Hook Form
  const form = useForm<ScriptFormData>({
    resolver: zodResolver(scriptFormSchema),
    defaultValues: initialFormData,
    mode: 'onChange',
  });
 
  // Handle form submission
  const handleSubmit = async (data: ScriptFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    if (!selectedStore) {
      setSubmitError("Please select a store (theme) before submitting.");
      setIsSubmitting(false);
      return;
    }
    try {
      // Send API request to /store/google-scripts
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/store/google-scripts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: selectedStore.store_id,
          googleAdsId: data.headScript,
          synchronisId: data.bodyScript,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          throw new Error((errorData as { message?: string }).message || "Failed to save scripts");
        } else {
          throw new Error("Failed to save scripts");
        }
      }
      // Set success state
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting scripts:', error);
      setSubmitError((error as Error).message || 'There was an error saving your scripts. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
 
  // Reset the form
  const resetForm = () => {
    form.reset(initialFormData);
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  };
 
  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-background rounded-lg shadow-md p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              IDs Saved Successfully!
            </CardTitle>
            <CardDescription>
              Your Google Ads ID and Synchronis ID have been saved and are ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={resetForm} className="mt-4">
              Add New IDs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
 
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-background rounded-lg shadow-md p-6">
      {/* Store Select Box */}
      <StoreSelect onSelect={setSelectedStore} />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                          <CardTitle className="text-2xl font-bold">Google Ads & Synchronis ID Form</CardTitle>
            <CardDescription>
              Add your Google Ads ID and Synchronis ID for your store
            </CardDescription>
            </div>
          </div>
        </CardHeader>
 
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Google Ads ID Field */}
              <FormField
                control={form.control}
                name="headScript"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Google Ads ID
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your Google Ads ID here..."
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      This will be used as the Google Ads ID for your store.
                    </p>
                  </FormItem>
                )}
              />
 
              {/* Synchronis ID Field */}
              <FormField
                control={form.control}
                name="bodyScript"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Synchronis ID
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your Synchronis ID here..."
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      This will be used as the Synchronis ID for your store.
                    </p>
                  </FormItem>
                )}
              />
 
              {/* Error Alert */}
              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
 
              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className='text-black'
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px] bg-black text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save IDs'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
 