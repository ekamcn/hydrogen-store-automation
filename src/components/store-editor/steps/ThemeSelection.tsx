import { UseFormReturn } from 'react-hook-form';
import { StoreFormData } from '../StoreCreatorForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ThemeSelectionProps = {
  form: UseFormReturn<StoreFormData>;
  nextStep: () => void;
  prevStep: () => void;
};

export default function ThemeSelection({ form, nextStep, prevStep }: ThemeSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Theme Selection</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose the category and language for your store theme.
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="VITE_CATEGORY"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                Store Category <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DIY" id="DIY" />
                    <Label htmlFor="DIY">DIY</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pets" id="pets" />
                    <Label htmlFor="pets">Pets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deco" id="deco" />
                    <Label htmlFor="deco">Decoration</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="baby" id="baby" />
                    <Label htmlFor="baby">Baby</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="automoto" id="automoto" />
                    <Label htmlFor="automoto">Auto/Moto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general">General</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="VITE_LANGUAGE"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                Store Language <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en">English</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fr" id="fr" />
                    <Label htmlFor="fr">French</Label>
                  </div>
                </RadioGroup>
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