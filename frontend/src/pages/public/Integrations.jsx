import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCube, HiOutlineCheckCircle } from 'react-icons/hi2';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

const INTEGRATIONS = [
  { name: 'WhatsApp Business', desc: 'Send invoices and payment reminders directly to customers via WhatsApp.', status: 'available' },
  { name: 'Tally', desc: 'Sync your financial data with Tally for seamless accounting.', status: 'available' },
  { name: 'Google Sheets', desc: 'Export reports and data to Google Sheets for custom analysis.', status: 'available' },
  { name: 'Razorpay', desc: 'Accept online payments directly through Razorpay payment gateway.', status: 'coming_soon' },
  { name: 'PhonePe', desc: 'Enable UPI payments through PhonePe for instant settlements.', status: 'coming_soon' },
  { name: 'Zoho Books', desc: 'Sync invoices and accounting data with Zoho Books.', status: 'coming_soon' },
];

function Integrations() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 bg-white ${scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><HiOutlineCube className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-bold text-blue-600">BizFlow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} to={l.href} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">{l.label}</Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Login</Link>
              <Link to="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Start Free</Link>
            </div>
            <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer" aria-label="Toggle menu">
              {mobileOpen ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-2">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">{l.label}</Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Start Free</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Integrations</h1>
            <p className="mt-4 text-lg text-gray-500">Connect BizFlow with the tools you already use to run your business.</p>
          </div>

          <div className="mt-16 space-y-4">
            {INTEGRATIONS.map((item) => (
              <div key={item.name} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                </div>
                {item.status === 'available' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 shrink-0">
                    <HiOutlineCheckCircle className="w-4 h-4" /> Available
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 shrink-0">Coming Soon</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">Need a specific integration? <a href="mailto:support@bizflow.in" className="font-medium text-blue-600 hover:text-blue-700">Contact us</a>.</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><HiOutlineCube className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-bold text-white">BizFlow</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="mailto:support@bizflow.in" className="hover:text-white transition-colors">support@bizflow.in</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center"><p className="text-sm">&copy; 2026 BizFlow. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}

export default Integrations;