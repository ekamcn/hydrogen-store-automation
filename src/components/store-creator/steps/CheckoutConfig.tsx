'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { StoreFormData } from '../StoreCreatorForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { fileToBase64 } from '@/utils/fileToBase64';

type CheckoutConfigProps = {
  form: UseFormReturn<StoreFormData>;
  nextStep: () => void;
  prevStep: () => void;
};

export default function CheckoutConfig({ form, nextStep, prevStep }: CheckoutConfigProps) {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout Configuration</h2>
        <p className="text-gray-600">Configure your store&apos;s checkout settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="VITE_CHECKOUT_DOMAIN"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checkout Domain *</FormLabel>
              <FormControl>
                <Input
                  placeholder="checkout.yourstore.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_CHECKOUT_ID"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checkout ID *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your checkout ID"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_SQUARE_LOGO"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Square Logo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const base64String = await fileToBase64(file);
                        field.onChange(base64String);
                        console.log('Square logo converted to base64:', base64String.substring(0, 50) + '...');
                      } catch (error) {
                        console.error('Error converting square logo to base64:', error);
                        field.onChange('');
                      }
                    } else {
                      field.onChange('');
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_OFFER_ID_TYPE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer ID Type *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="default" />
                    <Label htmlFor="default">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {form.watch('VITE_OFFER_ID_TYPE') === 'custom' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Custom Offer IDs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(form.getValues('customOfferIds') || {}).map((pricePoint) => (
              <FormField
                key={pricePoint}
                control={form.control}
                name={`customOfferIds.${pricePoint}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>${pricePoint}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter offer ID"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep}>
            Previous
          </Button>
          <Button type="button" onClick={nextStep}>
            Next
          </Button>
        </div>
     
    </div>
  );
}