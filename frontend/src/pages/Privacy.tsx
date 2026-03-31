import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Privacy() {
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
      id: 'information-we-collect',
      title: 'Information We Collect',
      content: 'When you sign in to Storee using Google OAuth, we collect your email address, name, and profile picture from your Google account. This information is used solely to create and manage your account on our platform.',
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      content: null,
      list: [
        'Create and manage your account',
        'Process your orders',
        'Communicate with you about your orders',
        'Improve our services',
      ],
    },
    {
      id: 'data-security',
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your personal information. Your data is stored securely and we do not share it with third parties except as necessary to process your orders.',
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      content: 'You have the right to access, update, or delete your personal information at any time. You can also request that we stop processing your data.',
    },
    {
      id: 'google-oauth',
      title: 'Google OAuth',
      content: "When you sign in with Google, you're allowing Storee to access your basic profile information (name, email, picture). This is handled through Google's secure OAuth 2.0 protocol. We do not have access to your Google password.",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-20">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label mb-2 block">Legal</span>
          <h1 className="section-title">Privacy Policy</h1>
          <p className="text-xs mt-3" style={{ color: '#a09590' }}>Last updated: March 7, 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">

          {sections.map((section, i) => (
            <section
              key={section.title}
              id={section.id}
              className="rounded-2xl px-6 py-5"
              style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.05)' }}
            >
              <h2 className="font-serif text-base font-medium mb-2" style={{ color: '#2a2220' }}>
                <span style={{ color: '#C4756E' }}>{i + 1}.</span> {section.title}
              </h2>
              {section.content && (
                <p className="text-sm leading-relaxed" style={{ color: '#6b5f58' }}>
                  {section.content}
                </p>
              )}
              {section.list && (
                <>
                  <p className="text-sm mb-2.5" style={{ color: '#6b5f58' }}>We use your information to:</p>
                  <ul className="space-y-2">
                    {section.list.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: '#6b5f58' }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C4756E' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          ))}

          {/* Contact */}
          <section
            id="contact"
            className="rounded-2xl px-6 py-5"
            style={{ background: '#FFFDF9', boxShadow: '0 2px 12px -3px rgba(59,50,48,0.05)' }}
          >
            <h2 className="font-serif text-base font-medium mb-2" style={{ color: '#2a2220' }}>
              <span style={{ color: '#C4756E' }}>6.</span> Contact Us
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#6b5f58' }}>
              Questions about your privacy? Reach out at{' '}
              <a href="mailto:thestoree.in@gmail.com" className="font-medium transition-colors" style={{ color: '#C4756E' }}>
                thestoree.in@gmail.com
              </a>
              {' '}— we're happy to help 🤍
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
