import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Terms() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        setTimeout(() => {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      content: 'By accessing and using Storee, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.',
    },
    {
      id: 'use-of-service',
      title: 'Use of Service',
      content: 'Storee provides an e-commerce platform for purchasing products. You agree to use the service only for lawful purposes and in accordance with these terms.',
    },
    {
      id: 'account-registration',
      title: 'Account Registration',
      content: 'To place orders, you must sign in using Google OAuth. You are responsible for maintaining the security of your account and for all activities that occur under your account.',
    },
    {
      id: 'orders-payments',
      title: 'Orders & Payments',
      content: 'All orders are subject to acceptance and availability. Prices are displayed in Indian Rupees (INR) and include applicable taxes. Payment is processed securely through Razorpay.',
    },
    {
      id: 'limitation-of-liability',
      title: 'Limitation of Liability',
      content: 'Storee shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.',
    },
    {
      id: 'changes-to-terms',
      title: 'Changes to Terms',
      content: 'We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-20">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label mb-2 block">Legal</span>
          <h1 className="section-title">Terms of Service</h1>
          <p className="text-xs mt-3" style={{ color: '#a09590' }}>Last updated: March 7, 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">

          {sections.map((section, i) => (
            <section
              key={section.title}
              id={section.id}
              className="rounded-2xl px-6 py-5 transition-all duration-200"
              style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.05)' }}
            >
              <h2 className="font-serif text-base font-medium mb-2" style={{ color: '#2a2220' }}>
                <span style={{ color: '#C4756E' }}>{i + 1}.</span> {section.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6b5f58' }}>
                {section.content}
              </p>
            </section>
          ))}

          {/* Shipping — detailed */}
          <section
            id="shipping"
            className="rounded-2xl px-6 py-5"
            style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.05)' }}
          >
            <h2 className="font-serif text-base font-medium mb-3" style={{ color: '#2a2220' }}>
              <span style={{ color: '#C4756E' }}>7.</span> Shipping
            </h2>
            <p className="text-xs font-medium mb-3" style={{ color: '#8BA88A' }}>We aim to deliver your orders smoothly and on time.</p>
            <ul className="space-y-2.5">
              {[
                <>Free shipping on all orders above <strong>₹1,000</strong></>,
                <>Orders are dispatched within <strong>7–9 working days</strong>. Delivery time depends on your location.</>,
                'Once shipped, you will receive tracking details to stay updated',
              ].map((item, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: '#6b5f58' }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#8BA88A' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(139,168,138,0.06)', color: '#6b5f58' }}>
              <strong style={{ color: '#2a2220' }}>Note:</strong> Delivery timelines may vary slightly depending on your location.
            </div>
          </section>

          {/* Returns — detailed */}
          <section
            id="returns"
            className="rounded-2xl px-6 py-5"
            style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.05)' }}
          >
            <h2 className="font-serif text-base font-medium mb-3" style={{ color: '#2a2220' }}>
              <span style={{ color: '#C4756E' }}>8.</span> Returns & Replacements
            </h2>
            <p className="text-xs font-medium mb-4" style={{ color: '#C4756E' }}>Every product is carefully checked before dispatch.</p>

            {/* Returns */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#2a2220' }}>Returns</h3>
              <p className="text-sm" style={{ color: '#6b5f58' }}>
                We do not accept returns on any orders, especially in the case of customised products.
              </p>
            </div>

            {/* Replacements */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#2a2220' }}>
                Replacements <span className="font-normal text-xs" style={{ color: '#a09590' }}>(if applicable)</span>
              </h3>
              <p className="text-xs mb-3" style={{ color: '#8a7e78' }}>We only offer replacements under the following conditions:</p>
              <ul className="space-y-2.5">
                {[
                  <>An <strong>unboxing video</strong> must be recorded at the time of opening the parcel</>,
                  <>The video should clearly show the package being opened <strong>for the first time</strong></>,
                  <>The issue or defect must be <strong>visible and genuine</strong> in the video</>,
                ].map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: '#6b5f58' }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C4756E' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(196,117,110,0.04)', color: '#6b5f58' }}>
                Without a proper unboxing video, we will not be able to process any replacement requests.
              </div>
            </div>

            {/* Important note */}
            <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(201,169,110,0.06)', color: '#6b5f58' }}>
              <strong style={{ color: '#2a2220' }}>Important:</strong> All replacement requests are subject to review and approval. The final decision regarding replacements will be taken by Storee.
            </div>

            <p className="text-xs mt-4" style={{ color: '#a09590' }}>
              For any concerns, feel free to reach out — we're always happy to help 🤍
            </p>
          </section>

          {/* Contact */}
          <section
            id="contact"
            className="rounded-2xl px-6 py-5"
            style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.05)' }}
          >
            <h2 className="font-serif text-base font-medium mb-2" style={{ color: '#2a2220' }}>
              <span style={{ color: '#C4756E' }}>9.</span> Contact Us
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#6b5f58' }}>
              Questions about these terms? Reach out at{' '}
              <a href="mailto:thestoree.in@gmail.com" className="font-medium transition-colors" style={{ color: '#C4756E' }}>
                thestoree.in@gmail.com
              </a>
              {' '}— we'd love to hear from you 🤍
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
