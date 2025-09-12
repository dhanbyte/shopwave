
export default function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto prose">
      <h1 className="text-3xl font-bold mb-4">Return & Refund Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p>
        Thank you for shopping at ShopWave. If you are not entirely satisfied with your purchase, we're here to help.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">No Returns or Exchanges</h2>
      <p>
        <strong>All sales are final.</strong> We do not accept returns or exchanges for any products once they have been delivered successfully. Please review your order carefully before placing it.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Refunds - Limited Cases Only</h2>
      <p>
        Refunds are only available in the following situations:
      </p>
      <ul className="list-disc pl-5">
        <li><strong>Product not delivered:</strong> If your product is not delivered to you within the expected timeframe</li>
        <li><strong>Damaged product:</strong> If the product arrives damaged or broken during shipping</li>
        <li><strong>Wrong product:</strong> If you receive a completely different product than what you ordered</li>
      </ul>
      
      <p className="mt-4">
        <strong>Important:</strong> Products that break due to normal use, mishandling, or after delivery are not eligible for refund. We only cover manufacturing defects and shipping damage.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Refund Process</h2>
      <p>
        If you qualify for a refund under our limited policy:
      </p>
      <ul className="list-disc pl-5">
        <li>Contact us within 48 hours of delivery with photos/proof</li>
        <li>We will review your case within 2-3 business days</li>
        <li>If approved, refund will be processed to your original payment method</li>
        <li>Refund processing time: 5-7 business days</li>
      </ul>
        
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>
            If you have any questions on how to return your item to us, contact us at <a href="mailto:support@shopwave.com" className="text-brand hover:underline">support@shopwave.com</a>.
        </p>
    </div>
  );
}
