
export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto prose">
      <h1 className="text-3xl font-bold mb-4">Shipping Policy</h1>
      
      <h2 className="text-xl font-semibold mt-6 mb-2">Order Processing</h2>
      <p>
        All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Shipping Rates & Delivery Estimates</h2>
      <p>
        Shipping charges for your order will be calculated and displayed at checkout. Our shipping rates are based on the weight of the products and your delivery location.
      </p>
      <ul className="list-disc pl-5">
        <li>Standard Shipping (3-7 business days): Charges are calculated at checkout.</li>
        <li>Express Shipping (1-3 business days): Available for select locations at an additional cost.</li>
      </ul>
      <p>Delivery delays can occasionally occur.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Shipment Confirmation & Order Tracking</h2>
      <p>
        You will receive a Shipment Confirmation email once your order has shipped, containing your tracking number(s). The tracking number will be active within 24 hours.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Damages</h2>
      <p>
        ShopWave is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
      </p>

       <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>
            If you have any questions about our Shipping Policy, please contact us at <a href="mailto:support@shopwave.com" className="text-brand hover:underline">support@shopwave.com</a>.
        </p>
    </div>
  );
}
