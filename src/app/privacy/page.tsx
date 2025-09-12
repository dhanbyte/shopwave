export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="card p-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
          <p className="text-gray-600 mb-3">We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Name, email address, and phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely)</li>
            <li>Order history and preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and updates</li>
            <li>Provide customer support</li>
            <li>Improve our products and services</li>
            <li>Send promotional offers (with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Information Sharing</h2>
          <p className="text-gray-600">We do not sell, trade, or rent your personal information to third parties. We may share information only in these cases:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>With service providers who help us operate our business</li>
            <li>When required by law or to protect our rights</li>
            <li>With your explicit consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data Security</h2>
          <p className="text-gray-600">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
          <p className="text-gray-600">If you have questions about this Privacy Policy, contact us at:</p>
          <p className="text-gray-600">Email: privacy@shopwave.social</p>
          <p className="text-gray-600">Phone: +91 91574 99884</p>
        </section>
      </div>
    </div>
  )
}