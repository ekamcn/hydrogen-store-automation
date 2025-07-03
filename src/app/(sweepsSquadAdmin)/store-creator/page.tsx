import StoreCreatorForm from "@/components/store-creator/StoreCreatorForm";



export default function StoreCreator() {


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Shopify Store Creator</h1>
      <p className="text-lg mb-6 text-center max-w-3xl mx-auto">
        Create customized Shopify Hydrogen storefronts in minutes through this intuitive form interface.
      </p>


      <StoreCreatorForm />

    </div>
  );
}
