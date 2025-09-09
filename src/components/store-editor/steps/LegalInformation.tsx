import { UseFormReturn } from "react-hook-form";
import { StoreEditorFormData } from "../StoreEditForm";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type LegalInformationProps = {
  form: UseFormReturn<StoreEditorFormData>;
  nextStep: () => void;
  prevStep: () => void;
};

export default function LegalInformation({
  form,
  nextStep,
  prevStep,
}: LegalInformationProps) {
  return (
    <div className="space-y-6 w-[1100px] max-w-full mx-auto">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Legal Information</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Provide your company&apos;s legal information for compliance and
          customer trust.
        </p>
      </div>

      <section id="company-information" className="space-y-4">
        <div>
          <p className="text-md mb-2 font-semibold">Company Information</p>
          <Separator />
        </div>

        <div className="space-y-6">
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="VITE_COMPANY_NAME"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Company Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your Company LLC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="VITE_SIREN_NUMBER"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Business Registration Number / SIREN{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your business number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
              control={form.control}
              name="VITE_COMPANY_CITY"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Company City <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
        </div>
      </section>
{/* 
      <section id="policy-information" className="space-y-4">
        <div>
          <p className="text-md mb-2 font-semibold">Policy Information</p>
          <Separator />
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="VITE_PP_LAST_UPDATED_DATE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Policy Updated At <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Date of last policy update"
                    {...field}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="VITE_TC_LAST_UPDATED_DATE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Terms Updated At <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Date of last policy update"
                    {...field}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <section id="shipping-policy">
          <div className="mb-4">
            <p className="text-sm mb-2 font-semibold">Shipping Policy</p>
            <Separator />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="VITE_DELIVERY_PROVIDER"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Delivery Provider <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., DHL, UPS, FedEx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="VITE_DELIVERY_AREAS"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Delivery Areas <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Nationwide, Europe, Worldwide"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="VITE_ORDER_PROCESSING_TIME"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Order Processing Time{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1-2 business days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="VITE_STANDARD_DELIVERY_TIME"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Standard Delivery Time{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3-5 business days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="VITE_RETURN_PERIOD"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Return Period <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 30 days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="VITE_SUPPORT_HOURS"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Support Hours <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mon-Fri 9AM-6PM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section id="return-policy">
          <div className="mb-4">
            <p className="text-sm mb-2 font-semibold">Return Policy</p>
            <Separator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="VITE_WITHDRAWAL_PERIOD"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Withdrawal Period (Exclusive only for EU customers)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 14 days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="VITE_RETURN_SHIPPING_POLICY"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Return Shipping Policy{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Customer pays return shipping"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="VITE_SALE_ITEMS_POLICY"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Sale Items Policy <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Final sale - no returns"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        <section id="Payment Policy">
          <p className="text-sm mb-2 font-semibold">Payment Policy</p>
          <Separator />
          <div className="flex gap-2 mt-4">
            <FormField
              control={form.control}
              name="VITE_BUSINESS_HOURS"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Business Hours <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Monday - Friday: 9:00 AM - 5:00 PM"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="VITE_REFUND_PERIOD"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Refund Period <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="30 days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="VITE_REFUND_PROCESSING_TIME"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Refund Processing Time{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="5-10 business days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
      </section> */}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="text-black"
        >
          Previous
        </Button>
        <Button type="button" onClick={nextStep} className="bg-black">
          Submit
        </Button>
      </div>
    </div>
  );
}
