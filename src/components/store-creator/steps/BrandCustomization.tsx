import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { StoreFormData } from '../StoreCreatorForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { fileToBase64 } from '@/utils/fileToBase64';

type BrandCustomizationProps = {
  form: UseFormReturn<StoreFormData>;
  nextStep: () => void;
  prevStep: () => void;
};

export default function BrandCustomization({ form, nextStep, prevStep }: BrandCustomizationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Brand Customization</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your store's visual identity with colors and branding assets.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="VITE_COLOR1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Primary Color <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      {...field}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      {...field}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="VITE_COLOR2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Secondary Color <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      {...field}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      {...field}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
                    {/* Footer Color */}
          <FormField
            control={form.control}
            name="VITE_FOOTER_COLOR"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Footer ( Phone Number / Email )Color *</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      {...field}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      {...field}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
 
        </div>


        <FormField
          control={form.control}
          name="VITE_LOGO"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Logo <span className="text-red-500">*</span>
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
                        const logoData = {
                          base64: base64String,
                          fileName: file.name
                        };
                        field.onChange(logoData);
                        console.log('Logo converted to base64:', base64String.substring(0, 50) + '...', 'Logo:', file.name);
                      } catch (error) {
                        console.error('Error converting logo to base64:', error);
                        field.onChange('');
                      }
                    } else {
                      field.onChange('');
                    }
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_BANNER"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Banner Image <span className="text-red-500">*</span>
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
                        const bannerData = {
                          base64: base64String,
                          fileName: file.name
                        };
                        field.onChange(bannerData);
                        console.log('Banner converted to base64:', base64String.substring(0, 50) + '...', 'Banner:', file.name);
                      } catch (error) {
                        console.error('Error converting banner to base64:', error);
                        field.onChange('');
                      }
                    } else {
                      field.onChange('');
                    }
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_MOBILE_BANNER"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mobile Banner <span className="text-red-500">*</span>
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
                        const bannerData = {
                          base64: base64String,
                          fileName: file.name
                        };
                        field.onChange(bannerData);
                        console.log('Mobile banner converted to base64:', base64String.substring(0, 50) + '...', 'Banner:', file.name);
                      } catch (error) {
                        console.error('Error converting mobile banner to base64:', error);
                        field.onChange('');
                      }
                    } else {
                      field.onChange('');
                    }
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_TYPOGRAPHY"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typography *</FormLabel>
              <FormControl>
              <div className="flex items-center space-x-2">
                     <Input
                      type="text"
                      placeholder='Enter Custom Font Family'
                      {...field}
                      className="w-42 h-10 p-1 border rounded"
                    />
                  </div>
          
                
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep} className='text-black'>
            Previous
          </Button>
          <Button type="button" onClick={nextStep} className='bg-black'>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
