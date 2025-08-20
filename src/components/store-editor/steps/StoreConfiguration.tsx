'use client';

import { UseFormReturn } from 'react-hook-form';
import { StoreFormData } from '../StoreCreatorForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

type StoreConfigurationProps = {
  form: UseFormReturn<StoreFormData>;
  nextStep: () => void;
  prevStep: () => void;
};

export default function StoreConfiguration({ form, nextStep, prevStep }: StoreConfigurationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Store Configuration</h2>
        <p className="text-gray-600">Configure your Shopify store settings and access</p>
      </div>

      {/* <div className="space-y-6">
        <FormField
          control={form.control}
          name="storeAccessToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Access Token *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter your Shopify store access token"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hydrogenTemplateStatus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Hydrogen Template Status
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable Hydrogen template for your store
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="templateCustomizer"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Template Customizer
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable template customization features
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div> */}

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={nextStep}
        >
          Next
        </Button>
      </div>
    </div>
  );
}