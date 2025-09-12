export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="card p-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
          <p className="text-gray-600">By accessing and using ShopWave.social, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Use License</h2>
          <p className="text-gray-600 mb-3">Permission is granted to temporarily use ShopWave.social for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Modify or copy the materials</li>
            <li>Use the materials for commercial purposes</li>
            <li>Attempt to reverse engineer any software</li>
            <li>Remove any copyright or proprietary notations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Product Information</h2>
          <p className="text-gray-600">We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Orders and Payment</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>All orders are subject to acceptance and availability</li>
            <li>Prices are subject to change without notice</li>
            <li>Payment must be received before order processing</li>
            <li>We reserve the right to refuse or cancel orders</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Referral Program</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Referral codes are for personal use only</li>
            <li>Abuse of referral system may result in account suspension</li>
            <li>Referral rewards are subject to terms and conditions</li>
            <li>We reserve the right to modify the referral program</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Returns and Refunds</h2>
          <p className="text-gray-600">We offer a 7-day return policy for most products. Items must be in original condition. Contact customer support to initiate returns.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
          <p className="text-gray-600">For questions about these Terms of Service, contact us at:</p>
          <p className="text-gray-600">Email: legal@shopwave.social</p>
          <p className="text-gray-600">Phone: +91 91574 99884</p>
        </section>
      </div>
    </div>
  )
}