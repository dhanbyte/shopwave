import AllProductsDisplay from '@/components/AllProductsDisplay';

export default function TestProducts() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Products Data (JSON + API)</h1>
      <AllProductsDisplay />
    </div>
  );
}