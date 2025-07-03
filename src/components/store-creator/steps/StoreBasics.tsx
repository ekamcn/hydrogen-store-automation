import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StoreFormData } from '../StoreCreatorForm';

interface StoreBasicsProps {
  form: UseFormReturn<StoreFormData>;
  nextStep: () => void;
}

export default function StoreBasics({ form, nextStep }: StoreBasicsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Store Basics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let's start with the basic information about your store.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="VITE_STORE_NAME"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your store name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_DOMAIN_NAME"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your domain name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_CUSTOMER_SUPPORT_EMAIL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Support Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="support@yourstore.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_CUSTOMER_SERVICE_PHONE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Service Phone *</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_SHOPIFY_EMAIL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shopify Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@yourstore.myshopify.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={nextStep} className="px-8">
          Next
        </Button>
      </div>
    </div>
  );
}