'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { StoreFormData } from '../StoreCreatorForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { fileToBase64 } from '@/utils/fileToBase64';
import { Plus, Trash } from 'lucide-react'; // for icons

type CheckoutConfigProps = {
  form: UseFormReturn<StoreFormData>;
  nextStep: () => void;
  prevStep: () => void;
};

export default function CheckoutConfig({ form, nextStep, prevStep }: CheckoutConfigProps) {
  // For dynamic custom offers
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customOffers" as never, 
  });

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout Configuration</h2>
        <p className="text-gray-600">Configure your store&apos;s checkout settings</p>
      </div>

      {/* Other existing form fields (Domain, Checkout ID, Logo, etc.) */}
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
              <FormLabel>
                Square Logo <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const base64String = await fileToBase64(file);
                        const squareLogoData = {
                          base64: base64String,
                          fileName: file.name
                        };
                        field.onChange(squareLogoData);
                        console.log('Square logo converted to base64:', base64String.substring(0, 50) + '...', 'Square Logo:', file.name);
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
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
              >
                {/* Price Input */}
                <FormField
                  control={form.control}
                  name={`customOffers.${index}.price` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price $</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter price"
                          type="number"
                          step="0.01"
                          value={typeof field.value === 'string' || typeof field.value === 'number' ? field.value : ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Offer ID Input */}
                <FormField
                  control={form.control}
                  name={`customOffers.${index}.offerId` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter offer ID"
                          type="text"
                          value={typeof field.value === 'string' ? field.value : ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Add new row button */}
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 text-black"
              onClick={() => append({ price: '', offerId: '' })}
            >
              <Plus className="w-4 h-4" /> Add Offer
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep} className='text-black'>
          Previous
        </Button>
        <Button type="button" onClick={nextStep} className='bg-black'>
          Next
        </Button>
      </div>
    </div>
  );
}

