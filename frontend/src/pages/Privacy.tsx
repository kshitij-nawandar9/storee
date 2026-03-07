export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: March 7, 2026</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
              <p>
                When you sign in to Storee using Google OAuth, we collect your email address, name, and profile picture
                from your Google account. This information is used solely to create and manage your account on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Create and manage your account</li>
                <li>Process your orders</li>
                <li>Communicate with you about your orders</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. Your data is stored securely
                and we do not share it with third parties except as necessary to process your orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any time.
                You can also request that we stop processing your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Google OAuth</h2>
              <p>
                When you sign in with Google, you're allowing Storee to access your basic profile information (name, email, picture).
                This is handled through Google's secure OAuth 2.0 protocol. We do not have access to your Google password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:{' '}
                <a href="mailto:privacy@thestoree.in" className="text-primary-600 hover:underline">
                  privacy@thestoree.in
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
