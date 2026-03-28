export default function Terms() {
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#FFF5F5' }}>
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3" style={{ color: '#2C4C64' }}>Terms of Service</h1>
          <p className="text-sm text-gray-400">Last updated: March 7, 2026</p>
        </div>

        <div className="space-y-5 text-gray-700">

          {/* 1. Acceptance of Terms */}
          <section className="rounded-2xl overflow-hidden border border-indigo-100">
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-4 border-b border-indigo-100">
              <h2 className="text-xl font-semibold text-indigo-800">1. Acceptance of Terms</h2>
            </div>
            <div className="px-6 py-5 bg-white text-gray-600 leading-relaxed">
              By accessing and using Storee, you accept and agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </div>
          </section>

          {/* 2. Use of Service */}
          <section className="rounded-2xl overflow-hidden border border-sky-100">
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-sky-100">
              <h2 className="text-xl font-semibold text-sky-800">2. Use of Service</h2>
            </div>
            <div className="px-6 py-5 bg-white text-gray-600 leading-relaxed">
              Storee provides an e-commerce platform for purchasing products. You agree to use the service
              only for lawful purposes and in accordance with these terms.
            </div>
          </section>

          {/* 3. Account Registration */}
          <section className="rounded-2xl overflow-hidden border border-purple-100">
            <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 px-6 py-4 border-b border-purple-100">
              <h2 className="text-xl font-semibold text-purple-800">3. Account Registration</h2>
            </div>
            <div className="px-6 py-5 bg-white text-gray-600 leading-relaxed">
              To place orders, you must sign in using Google OAuth. You are responsible for maintaining
              the security of your account and for all activities that occur under your account.
            </div>
          </section>

          {/* 4. Orders and Payments */}
          <section className="rounded-2xl overflow-hidden border border-amber-100">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-amber-100">
              <h2 className="text-xl font-semibold text-amber-800">4. Orders and Payments</h2>
            </div>
            <div className="px-6 py-5 bg-white text-gray-600 leading-relaxed">
              All orders are subject to acceptance and availability. Prices are displayed in Indian Rupees (INR)
              and include applicable taxes. Payment is processed securely through{' '}
              <strong className="text-amber-700">Razorpay</strong>.
            </div>
          </section>

          {/* 5. Shipping */}
          <section className="rounded-2xl overflow-hidden border border-emerald-100">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
              <h2 className="text-xl font-semibold text-emerald-800">5. Shipping Information ✨</h2>
              <p className="text-sm text-emerald-600 mt-1">We aim to deliver your orders smoothly and on time.</p>
            </div>
            <div className="px-6 py-5 space-y-4 bg-white">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                  <span>Free shipping on all orders above <strong>₹1,000</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                  <span>Orders are typically delivered within <strong>5–7 business days</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                  <span>Once your order is shipped, you will receive tracking details to stay updated</span>
                </li>
              </ul>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700">
                <strong>Please note:</strong> Delivery timelines may vary slightly depending on your location.
              </div>
            </div>
          </section>

          {/* 6. Returns & Refunds */}
          <section className="rounded-2xl overflow-hidden border border-rose-100">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 border-b border-rose-100">
              <h2 className="text-xl font-semibold text-rose-800">6. Returns &amp; Refunds</h2>
              <p className="text-sm text-rose-400 mt-1">Every product is carefully checked before dispatch.</p>
            </div>
            <div className="px-6 py-5 space-y-6 bg-white">
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3">Returns</h3>
                <div className="flex items-start gap-3 text-gray-600">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
                  <span>We do not accept returns on any orders, especially in the case of customised products.</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  Replacements <span className="text-sm font-normal text-gray-400">(if applicable)</span>
                </h3>
                <p className="text-sm text-gray-500 mb-3">We only offer replacements under the following conditions:</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
                    <span>An <strong>unboxing video</strong> must be recorded at the time of opening the parcel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
                    <span>The video should clearly show the package being opened <strong>for the first time</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
                    <span>The issue or defect must be <strong>visible and genuine</strong> in the video</span>
                  </li>
                </ul>
                <div className="mt-4 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm text-rose-700">
                  Without a proper unboxing video, we will not be able to process any replacement requests.
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-3">Important Note</h3>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    <span>All replacement requests are subject to review and approval by our team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    <span>The final decision regarding replacements will be taken by Storee</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-400 pt-1">
                For any concerns, feel free to reach out to us — we're always happy to help 🤍
              </p>
            </div>
          </section>

          {/* 7. Limitation of Liability */}
          <section className="rounded-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-700">7. Limitation of Liability</h2>
            </div>
            <div className="px-6 py-5 bg-white text-gray-600 leading-relaxed">
              Storee shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of or inability to use the service.
            </div>
          </section>

          {/* 8. Changes to Terms */}
          <section className="rounded-2xl overflow-hidden border border-orange-100">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100">
              <h2 className="text-xl font-semibold text-orange-800">8. Changes to Terms</h2>
            </div>
            <div className="px-6 py-5 bg-white text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after
              changes constitutes acceptance of the modified terms.
            </div>
          </section>

          {/* 9. Contact Us */}
          <section className="rounded-2xl overflow-hidden border border-teal-100">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-teal-100">
              <h2 className="text-xl font-semibold text-teal-800">9. Contact Us</h2>
            </div>
            <div className="px-6 py-5 bg-white text-gray-600 leading-relaxed">
              If you have any questions about these Terms of Service, please reach out to us at{' '}
              <a href="mailto:support@thestoree.in" className="text-teal-600 font-medium hover:underline">
                support@thestoree.in
              </a>
              {' '}— we'd love to hear from you 🤍
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
