import { UseFormReturn } from 'react-hook-form';
import { StoreEditorFormData } from '../StoreEditForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type LegalInformationProps = {
  form: UseFormReturn<StoreEditorFormData>;
  nextStep: () => void;
  prevStep: () => void;
};

export default function LegalInformation({ form, nextStep, prevStep }: LegalInformationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Legal Information</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Provide your company's legal information for compliance and customer trust.
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="VITE_COMPANY_NAME"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Company Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Your Company LLC"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_COMPANY_ADDRESS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Company Address <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Business Street\nCity, State 12345\nCountry"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button type="button" variant="outline" onClick={prevStep} className='text-black w-full sm:w-auto'>
            Previous
          </Button>
          <Button type="button" onClick={nextStep} className='bg-black w-full sm:w-auto'>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}