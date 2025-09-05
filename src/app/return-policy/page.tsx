
export default function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto prose">
      <h1 className="text-3xl font-bold mb-4">Return & Refund Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p>
        Thank you for shopping at ShopWave. If you are not entirely satisfied with your purchase, we're here to help.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Returns</h2>
      <p>
        You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging. Your item needs to have the receipt or proof of purchase.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Non-Returnable Items</h2>
      <p>
        Certain items cannot be returned. These include:
      </p>
      <ul className="list-disc pl-5">
        <li>Perishable goods such as food, flowers, newspapers or magazines.</li>
        <li>Products that are intimate or sanitary goods.</li>
        <li>Hazardous materials, or flammable liquids or gases.</li>
        <li>Gift cards.</li>
        <li>Downloadable software products.</li>
        <li>Some health and personal care items.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Refunds</h2>
      <p>
        Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
      </p>
      <p>
        If your return is approved, we will initiate a refund to your original method of payment. You will receive the credit within a certain amount of days, depending on your card issuer's policies.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Shipping</h2>
      <p>
        You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
      </p>
        
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>
            If you have any questions on how to return your item to us, contact us at <a href="mailto:support@shopwave.com" className="text-brand hover:underline">support@shopwave.com</a>.
        </p>
    </div>
  );
}
