import { Link, useLocation } from 'react-router-dom';
import { Package, BarChart3 } from 'lucide-react';

const tabs = [
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminTabs() {
  const location = useLocation();

  return (
    <div className="mb-6 flex gap-2">
      {tabs.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className="inline-flex items-center gap-1.5 transition-all duration-200"
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              background: isActive ? '#3d2b2b' : 'transparent',
              color: isActive ? '#FDF6EC' : '#6b635b',
              border: isActive ? '1.5px solid #3d2b2b' : '1.5px solid #F0E0C6',
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
