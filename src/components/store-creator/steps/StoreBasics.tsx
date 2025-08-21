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
          name="VITE_STORE_TITLE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Title *</FormLabel>
              <FormControl>
                <Input placeholder="Awesome Home Decor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="VITE_SHOPIFY_URL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shopify Store URL *</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="store-name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-500 mt-1">
                Enter only the store name from your Shopify admin URL. For example, if your URL is <code>https://admin.shopify.com/store/hxzfsw-2e/products</code>, enter <strong>hxzfsw-2e</strong> in the input box.
              </p>

            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_SHOPIFY_ADMIN_ACCESS_TOKEN"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shopify Admin Access Token *</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-500 mt-1">
                Generate this token in your Shopify admin under Settings &gt; Apps and sales channels&gt; Develop Apps &gt; Create an app
              </p>
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
        
        <FormField
          control={form.control}
          name="VITE_DISCOVER_OUR_COLLECTIONS"
          render={() => (
            <FormItem className="col-span-1 md:col-span-2">
              <FormLabel>Discover Our Collections</FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0, 1, 2].map((index) => (
                    <Input
                      key={index}
                      placeholder={index === 0 ? 'Meuble TV' : index === 1 ? 'Miroirs' : 'Chaises & Tabourets'}
                      value={(form.getValues('VITE_DISCOVER_OUR_COLLECTIONS')?.[index] ?? '') as string}
                      onChange={(e) => {
                        const current = form.getValues('VITE_DISCOVER_OUR_COLLECTIONS') || ['','',''];
                        const next = [...current];
                        next[index] = e.target.value;
                        form.setValue('VITE_DISCOVER_OUR_COLLECTIONS', next as unknown as StoreFormData['VITE_DISCOVER_OUR_COLLECTIONS'], { shouldDirty: true, shouldTouch: true, shouldValidate: false });
                      }}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={nextStep} className="px-8 bg-black">
          Next
        </Button>
      </div>
    </div>
  );
}